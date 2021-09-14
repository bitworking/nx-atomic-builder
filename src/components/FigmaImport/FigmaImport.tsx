import { useState } from 'react';
import { LoadingIndicator } from 'components/LoadingIndicator';
import { resaveDataUrl } from 'libs/utils/image';
import { useProjectContext } from 'components/ProjectProvider';

export const FigmaImport = () => {
  const { dispatch, uid } = useProjectContext();
  const [images, setImages] = useState<{ id: string; name: string }[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileKey, setFileKey] = useState('');
  const [formData, setFormData] = useState<{
    token: string;
    projectId: string;
    page: string;
    fileKey: string;
    fileId: number;
  }>({ token: '', projectId: '', page: '', fileKey: '', fileId: 0 });

  const getImagesFromFileKey = async (fileKey: string) => {
    try {
      const headers = new Headers();
      headers.append('X-FIGMA-TOKEN', formData.token);

      const init = {
        method: 'GET',
        headers: headers,
      };

      // get file
      const request = new Request(`https://api.figma.com/v1/files/${fileKey}`);
      const response = await fetch(request, init);
      const text = await response.text();
      const json = JSON.parse(text);

      if (!formData.page) {
        console.log(
          'Available pages',
          json?.document?.children?.map((child: any) => child.name)
        );
        setLoading(false);
        return [];
      }

      // top level ids: all pages
      // const ids = json?.document?.children?.map((child: any) => child.id);

      const pageData = json?.document?.children?.find((child: any) => child.name === formData.page);

      const images = (pageData?.children ?? []).map((child: any) => ({
        id: child.id,
        name: child.name,
      }));

      return images;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const getImages = async () => {
    if (!formData.token || (!formData.projectId && !formData.fileKey)) {
      return;
    }

    setLoading(true);
    setImages([]);
    setSelectedImages([]);

    // file key available

    if (formData.fileKey) {
      const images = await getImagesFromFileKey(formData.fileKey);
      setImages(images);
      setSelectedImages(images.map((image: any) => image.id));
      setFileKey(formData.fileKey);
      setLoading(false);
      return;
    }

    const headers = new Headers();
    headers.append('X-FIGMA-TOKEN', formData.token);

    const init = {
      method: 'GET',
      headers: headers,
    };

    // get project files
    let request = new Request(`https://api.figma.com/v1/projects/${formData.projectId}/files`);

    try {
      let response = await fetch(request, init);
      let text = await response.text();
      let json = JSON.parse(text);

      console.log('Response files', json?.files);

      const firstFileKey = json?.files?.[formData.fileId ?? 0]?.key;

      if (!firstFileKey) {
        console.error(`File with id ${formData.fileId ?? 0} not found`);
        setLoading(false);
        return;
      }

      setFileKey(firstFileKey);

      const images = await getImagesFromFileKey(firstFileKey);
      setImages(images);
      setSelectedImages(images.map((image: any) => image.id));
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const getImageUrls = async () => {
    if (!formData.token) {
      return;
    }

    setLoading(true);

    const headers = new Headers();
    headers.append('X-FIGMA-TOKEN', formData.token);

    const init = {
      method: 'GET',
      headers: headers,
    };

    let request = new Request(
      `https://api.figma.com/v1/images/${fileKey}?ids=${selectedImages.join(',')}`
    );

    try {
      const response = await fetch(request, init);
      const text = await response.text();
      const json = JSON.parse(text);

      let nextImageId = uid('image');

      for (const image of Object.entries(json?.images)) {
        const [key, url] = image;

        const imageData = await resaveDataUrl(url as string);

        dispatch({
          type: 'addImage',
          data: {
            id: nextImageId,
            name: images?.find((image) => image.id === key)?.name ?? key,
            data: imageData.dataUrl,
            width: imageData.size.width,
            height: imageData.size.height,
          },
        });

        nextImageId++;
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h3>Figma image import</h3>
        <p style={{ fontStyle: 'italic' }}>
          Fill out either &quot;Project ID&quot; or &quot;File Key&quot;
        </p>
        <div className="form__row">
          <label>
            <span>Access token: </span>
            <input
              type="text"
              value={formData.token}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setFormData((prev) => ({ ...prev, token: value }));
              }}
            />
          </label>
        </div>

        <div className="form__row">
          <label>
            <span>Project ID: </span>
            <input
              type="text"
              value={formData.projectId}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setFormData((prev) => ({ ...prev, projectId: value }));
              }}
            />
          </label>
        </div>

        <div className="form__row">
          <label>
            <span>File Key: </span>
            <input
              type="text"
              value={formData.fileKey}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setFormData((prev) => ({ ...prev, fileKey: value }));
              }}
            />
          </label>
        </div>

        <div className="form__row">
          <label>
            <span>File ID: </span>
            <input
              type="text"
              value={formData.fileId.toString()}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setFormData((prev) => ({
                  ...prev,
                  fileId: isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10),
                }));
              }}
            />
          </label>
        </div>

        <div className="form__row">
          <label>
            <span>Page: </span>
            <input
              type="text"
              value={formData.page}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setFormData((prev) => ({ ...prev, page: value }));
              }}
            />
          </label>
        </div>

        <div className="form__row">
          <button type="button" onClick={() => getImages()}>
            Get Images from Figma
          </button>
        </div>
      </div>
      {images.length > 0 && (
        <div className="image-list__container">
          {images.map((image) => (
            <div className="image-list__image" key={image.id}>
              <div>
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image.id)}
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      setSelectedImages((previous) => [...previous, image.id]);
                    } else {
                      setSelectedImages((previous) => [
                        ...previous.filter((id) => id !== image.id),
                      ]);
                    }
                  }}
                />
              </div>
              <div>
                {image.id} : {image.name}
              </div>
            </div>
          ))}
          {selectedImages.length > 0 && (
            <button type="button" onClick={() => getImageUrls()}>
              Import images
            </button>
          )}
        </div>
      )}
      {loading && <LoadingIndicator />}
    </>
  );
};

import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { ImageData, useProjectContext } from 'components/ProjectProvider';
import { FormImageData } from 'components/FormImageData';
import { resaveDataUrl, resizeDataUrl } from 'libs/utils/image';
import { LoadingIndicator } from 'components/LoadingIndicator';
import { ColorPicker } from 'components/ColorPicker';
import { ImageLoaderProps } from './ImageLoader.types';
import styles from './ImageLoader.module.css';

export const ImageLoader = ({
  initialData,
  onData,
  reset,
  children,
  addButton,
  components,
  form,
}: ImageLoaderProps) => {
  const img = useRef<HTMLImageElement | null>(null);
  const dropzone = useRef<HTMLDivElement | null>(null);
  const [dropzoneActive, setDropzoneActive] = useState(false);
  const { uid } = useProjectContext();
  const [data, setData] = useState<string | ArrayBuffer | null>(initialData?.data ?? null);
  const [rawData, setRawData] = useState<string | ArrayBuffer | null>(null);
  const [imgData, setImgData] = useState<ImageData>(
    initialData ?? { id: uid('image'), name: '', data: '', width: 0, height: 0 }
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImgData({ id: uid('image'), name: '', data: '', width: 0, height: 0 });
    setData(null);
  }, [reset]);

  useEffect(() => {
    if (!data) {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (initialData) {
      setImgData(initialData);
      setData(initialData.data);
    }
  }, [initialData]);

  const sendData = (imgData: ImageData) => {
    setImgData(imgData);
    onData && onData(imgData);
  };

  const onLoad = async (event: SyntheticEvent<HTMLImageElement>) => {
    const imageData = {
      ...imgData,
      data: data as string,
      width: img.current?.naturalWidth ?? 0,
      height: img.current?.naturalHeight ?? 0,
    };

    setImgData(imageData);
    setLoading(false);
  };

  useEffect(() => {
    window.addEventListener(
      'dragover',
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false
    );
    window.addEventListener(
      'drop',
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false
    );

    dropzone.current?.addEventListener('dragenter', (event) => {
      event.preventDefault();
      setDropzoneActive(true);
    });

    dropzone.current?.addEventListener('dragleave', (event) => {
      event.preventDefault();
      setDropzoneActive(false);
    });

    dropzone.current?.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    dropzone.current?.addEventListener('drop', (event) => {
      event.preventDefault();
      setDropzoneActive(false);
      setLoading(true);

      const file = event.dataTransfer?.files[0];

      if (!file) {
        setData(null);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.addEventListener('loadend', async () => {
        if (typeof reader.result === 'string') {
          const resavedData = await resaveDataUrl(reader.result);
          setData(resavedData);
        } else {
          setData(null);
        }
      });
    });

    document.addEventListener('paste', async function (e) {
      if (!e.clipboardData) {
        return;
      }
      if (e.clipboardData.types.indexOf('Files') > -1) {
        const file = e.clipboardData.files[0];
        const arrayBuffer = await e.clipboardData.files[0].arrayBuffer();
        const blob = new Blob([arrayBuffer]);

        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result;
          if (typeof base64 === 'string') {
            const resavedData = await resaveDataUrl(base64);
            setData(resavedData);
          } else {
            setData(null);
          }
        };
        reader.readAsDataURL(blob);
      }
    });
  }, []);

  return (
    <>
      {loading && <LoadingIndicator />}
      {children}
      <div className="header__container">
        <div className="header__col">
          <div>
            {imgData && (
              <p>
                {imgData?.width}x{imgData?.height} pixels
              </p>
            )}
          </div>
        </div>
        <div className="header__col">
          <div>
            {imgData && (
              <FormImageData
                imgData={imgData}
                setImgData={setImgData}
                onData={(data) => sendData(imgData)}
              />
            )}
          </div>
        </div>
        <div className="header__col">
          <div>{form}</div>
        </div>
      </div>

      <>
        <p>Drop image file here or paste image from clipboard</p>

        <div>
          <div
            ref={dropzone}
            className={`${styles.imageLoader__dropzone} ${
              dropzoneActive && styles.imageLoader__dropzone__active
            }`}
          ></div>
        </div>

        {data && (
          <>
            {addButton}
            <ColorPicker />
            <div>
              <div className={`${styles.imageLoader__imgContainer} image-container`}>
                <img
                  ref={img}
                  className={styles.imageLoader__imgContainer__img}
                  src={data as string}
                  onLoad={onLoad}
                />
                {components}
              </div>
            </div>
          </>
        )}
      </>
    </>
  );
};

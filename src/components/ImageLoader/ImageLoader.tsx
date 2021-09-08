import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { ImageData, useProjectContext } from 'components/ProjectProvider';
import { FormImageData } from 'components/FormImageData';
import { ImageLoaderProps } from './ImageLoader.types';
import styles from './ImageLoader.module.css';

export const ImageLoader = ({
  initialData,
  onData,
  reset,
  children,
  components,
}: ImageLoaderProps) => {
  const img = useRef<HTMLImageElement | null>(null);
  const dropzone = useRef<HTMLDivElement | null>(null);
  const [dropzoneActive, setDropzoneActive] = useState(false);
  const { uid } = useProjectContext();

  const [data, setData] = useState<string | ArrayBuffer | null>(initialData?.data ?? null);
  const [imgData, setImgData] = useState<ImageData>(
    initialData ?? { id: uid('image'), name: '', data: '', width: 0, height: 0 }
  );

  useEffect(() => {
    setImgData({ id: uid('image'), name: '', data: '', width: 0, height: 0 });
    setData(null);
  }, [reset]);

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

  const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setImgData({
      ...imgData,
      data: data as string,
      width: img.current?.naturalWidth ?? 0,
      height: img.current?.naturalHeight ?? 0,
    });
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

      const file = event.dataTransfer?.files[0];

      if (!file) {
        setData(null);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.addEventListener('loadend', () => {
        setData(reader.result);
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

        const reader = new FileReader();
        reader.onload = function (event) {
          const base64 = event.target?.result;
          setData(base64 ?? null);
        };
        reader.readAsDataURL(blob);
      }
    });
  }, []);

  return (
    <div className={styles.imageLoader}>
      <>
        {children}
        {imgData && (
          <p>
            width: {imgData?.width}px, height: {imgData?.height}px
          </p>
        )}
        {imgData && (
          <FormImageData
            imgData={imgData}
            setImgData={setImgData}
            onData={(data) => sendData(imgData)}
          />
        )}
        <p>&nbsp;</p>

        <>
          <h4>Drop image file here or paste image from clipboard</h4>
          <div
            ref={dropzone}
            className={`${styles.imageLoader__dropzone} ${
              dropzoneActive && styles.imageLoader__dropzone__active
            }`}
          >
            {data && (
              <div className={styles.imageLoader__imgContainer}>
                <img
                  ref={img}
                  className={styles.imageLoader__imgContainer__img}
                  src={data as string}
                  onLoad={onLoad}
                />
                {components}
              </div>
            )}
          </div>
        </>
      </>
    </div>
  );
};

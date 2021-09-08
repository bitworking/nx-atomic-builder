import type { NextPage } from 'next';
import styles from 'styles/Home.module.css';
import { ImageLoader } from 'components/ImageLoader';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ComponentContainer } from 'components/Component';
import { useEffectAsync } from '../../libs/hooks/useEffectAsync';

type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const cropDataUrl = async (dataUrl: string, crop: Crop): Promise<string> => {
  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx?.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return canvas.toDataURL();
  };

  const start = (resolve: any, img: HTMLImageElement) => {
    const cropped = drawCanvas(img);
    return resolve(cropped);
  };

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => start(resolve, img);
    img.src = dataUrl;
  });
};

const Page: NextPage = () => {
  const { dispatch, state } = useProjectContext();
  const [component, setComponent] = useState<ComponentData | null>(null);
  const [imageRef, setImageRef] = useState<ImageRef | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === 'string') {
      const data = state.components.find((component) => component.id === parseInt(id, 10));
      if (data) {
        setComponent(data);
      } else {
        setComponent(null);
      }
    } else {
      setComponent(null);
    }
  }, [id, state]);

  // get first imageRef
  useEffectAsync(async () => {
    if (component) {
      const data = state.imageRefs.find((imageRef) => imageRef.componentId === component.id);
      setImageRef(data ?? null);

      if (data) {
        const imageData = state.images[data.imageId];
        setImageData(imageData);

        const scaleWidth = state.images[data.imageId].width;
        const scaleHeight = state.images[data.imageId].height;

        const cropped = await cropDataUrl(imageData.data, {
          // x: data.x * scaleWidth,
          // y: data.y * scaleHeight,
          // width: data.width * scaleWidth,
          // height: data.height * scaleHeight,
          x: data.x * imageData.width,
          y: data.y * imageData.height,
          width: data.width * imageData.width,
          height: data.height * imageData.height,
        });

        setDataUrl(cropped);
      } else {
        setDataUrl(null);
        setImageData(null);
      }
    }

    return;
  }, [component]);

  if (!component) {
    return <div>No component found</div>;
  }

  return (
    <>
      <h3>{component.name}</h3>
      <div style={{ position: 'relative' }}>
        {dataUrl && (
          <img src={dataUrl} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        )}
        {imageData && (
          <ComponentContainer
            imageData={imageData}
            parentComponentData={component}
            parentImageRef={imageRef}
          />
        )}
      </div>
    </>
  );
};

export default Page;

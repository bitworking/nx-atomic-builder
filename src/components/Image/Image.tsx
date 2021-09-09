import { useState } from 'react';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';
import { useEffectAsync } from 'libs/hooks/useEffectAsync';
import { ImageProps } from './Image.types';

export type Crop = {
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

export const ImageComponent = ({ imageRef }: ImageProps) => {
  const { dispatch, state } = useProjectContext();
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffectAsync(async () => {
    if (imageRef) {
      const imageData = state.images[imageRef.imageId];

      const scaleWidth = imageData.width;
      const scaleHeight = imageData.height;

      const cropped = await cropDataUrl(imageData.data, {
        x: imageRef.x * scaleWidth,
        y: imageRef.y * scaleHeight,
        width: imageRef.width * scaleWidth,
        height: imageRef.height * scaleHeight,
      });

      setDataUrl(cropped);
    } else {
      setDataUrl(null);
    }

    return;
  }, [imageRef]);

  return (
    <>
      {dataUrl && (
        <img src={dataUrl} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
      )}
    </>
  );
};

import { useState } from 'react';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';
import { useEffectAsync } from 'libs/hooks/useEffectAsync';
import { ImageProps } from './Image.types';
import { cropDataUrl } from 'libs/utils/image';

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

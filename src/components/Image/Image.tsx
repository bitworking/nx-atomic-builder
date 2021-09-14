import { useState } from 'react';
import {
  ComponentData,
  ImageData,
  ImageRef,
  ProjectData,
  useProjectContext,
} from 'components/ProjectProvider';
import { useEffectAsync } from 'libs/hooks/useEffectAsync';
import { ImageProps } from './Image.types';
import { cropDataUrl } from 'libs/utils/image';

const getFromCache = (state: ProjectData, imageRef: ImageRef) => {
  const cache = state._imageCache?.find((cache) => cache.imageRefId === imageRef.id);

  if (
    cache &&
    cache.imageId === imageRef.imageId &&
    cache.x === imageRef.x &&
    cache.y === imageRef.y &&
    cache.width === imageRef.width &&
    cache.height === imageRef.height
  ) {
    return cache.data;
  }

  return null;
};

export const ImageComponent = ({ imageRef }: ImageProps) => {
  const { dispatch, state } = useProjectContext();
  const [dataUrl, setDataUrl] = useState<string | null | undefined>(null);

  useEffectAsync(async () => {
    if (imageRef) {
      const fromCache = getFromCache(state, imageRef);

      if (fromCache) {
        setDataUrl(fromCache);
        return;
      }

      const imageData = state.images.find((image) => image.id === imageRef.imageId);

      if (!imageData) {
        setDataUrl(undefined);
        return;
      }

      const scaleWidth = imageData.width;
      const scaleHeight = imageData.height;

      const data = await cropDataUrl(imageData.data, {
        x: imageRef.x * scaleWidth,
        y: imageRef.y * scaleHeight,
        width: imageRef.width * scaleWidth,
        height: imageRef.height * scaleHeight,
      });

      setDataUrl(data.dataUrl);

      dispatch({ type: 'saveToImageCache', imageRef, data: data.dataUrl });
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
      {!dataUrl && (
        <div style={{ minHeight: '20px' }}>{dataUrl === undefined && 'Image data not found'}</div>
      )}
    </>
  );
};

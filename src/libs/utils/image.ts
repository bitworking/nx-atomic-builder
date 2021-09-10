export type Size = {
  width: number;
  height: number;
};

export type Crop = Size & {
  x: number;
  y: number;
};

export const cropDataUrl = async (dataUrl: string, crop: Crop): Promise<string> => {
  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx?.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return canvas.toDataURL('image/webp', 0.8);
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

export const resizeDataUrl = async (dataUrl: string, size: Size): Promise<string> => {
  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size.width;
    canvas.height = size.height;
    ctx?.drawImage(img, 0, 0, size.width, size.height);
    return canvas.toDataURL('image/webp', 0.8);
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

export const resaveDataUrl = async (dataUrl: string): Promise<string> => {
  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx?.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
    return canvas.toDataURL('image/webp', 0.8);
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

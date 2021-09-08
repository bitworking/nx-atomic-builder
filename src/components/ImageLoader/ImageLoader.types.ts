import React from 'react';
import { ImageData } from 'components/ProjectProvider';

export type ImageLoaderProps = {
  initialData?: ImageData;
  onData: (data: ImageData) => void;
  reset?: any;
  children?: React.ReactNode;
  components?: React.ReactNode;
};

import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ImageLoader } from 'components/ImageLoader';
import { ImageData, useProjectContext } from 'components/ProjectProvider';
import styles from 'styles/Home.module.css';

const Page: NextPage = () => {
  const [reset, setReset] = useState({});
  const { dispatch } = useProjectContext();
  const router = useRouter();

  useEffect(() => {
    const handler = () => {
      setReset({});
    };
    router.events.on('routeChangeComplete', handler);
    return () => {
      router.events.off('routeChangeComplete', handler);
    };
  }, []);

  const addImage = (data: ImageData) => {
    dispatch({ type: 'addImage', data });
    setReset({});
  };

  return (
    <ImageLoader reset={reset} onData={addImage}>
      <h1>Add image</h1>
    </ImageLoader>
  );
};

export default Page;

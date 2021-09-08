import type { NextPage } from 'next';
import styles from 'styles/Home.module.css';
import { ImageLoader } from 'components/ImageLoader';
import { useProjectContext } from 'components/ProjectProvider';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Page: NextPage = () => {
  const [reset, setReset] = useState({});
  const { dispatch } = useProjectContext();
  const router = useRouter();

  router.events.on('routeChangeComplete', () => {
    setReset({});
  });

  return (
    <ImageLoader reset={reset} onData={(data) => dispatch({ type: 'addImage', data })}>
      <h3>Add image</h3>
    </ImageLoader>
  );
};

export default Page;

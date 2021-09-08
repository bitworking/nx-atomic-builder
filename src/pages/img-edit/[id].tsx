import type { NextPage } from 'next';
import styles from 'styles/Home.module.css';
import { ImageLoader } from 'components/ImageLoader';
import { ImageData, useProjectContext } from 'components/ProjectProvider';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ComponentContainer } from '../../components/Component';

const Page: NextPage = () => {
  const { dispatch, state } = useProjectContext();
  const [imgData, setImgData] = useState<ImageData | null>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === 'string') {
      const data = state.images.find((img) => img.id === parseInt(id, 10));
      if (data) {
        setImgData(data);
      } else {
        setImgData(null);
      }
    } else {
      setImgData(null);
    }
  }, [id, state]);

  if (!imgData) {
    return <div>No image found</div>;
  }

  return (
    <ImageLoader
      onData={(data) => dispatch({ type: 'addImage', data })}
      initialData={imgData ?? undefined}
      components={<ComponentContainer imageData={imgData} parentImageRef={null} />}
    >
      <h3>Edit image</h3>
    </ImageLoader>
  );
};

export default Page;

import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ImageLoader } from 'components/ImageLoader';
import { ImageData, useProjectContext } from 'components/ProjectProvider';
import styles from 'styles/Home.module.css';

import { ComponentContainer } from 'components/Component';

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
    <ComponentContainer imageData={imgData} parentImageRef={null}>
      {({ addButton, components, form }) => (
        <ImageLoader
          onData={(data) => dispatch({ type: 'addImage', data })}
          initialData={imgData ?? undefined}
          components={components}
          addButton={addButton}
          form={form}
        >
          <h1>Edit image : {imgData.name}</h1>
        </ImageLoader>
      )}
    </ComponentContainer>
  );
};

export default Page;

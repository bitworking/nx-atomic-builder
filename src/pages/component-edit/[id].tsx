import type { NextPage } from 'next';
import Link from 'next/link';
import styles from 'styles/Home.module.css';
import { ImageLoader } from 'components/ImageLoader';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ComponentContainer } from 'components/Component';
import { useEffectAsync } from 'libs/hooks/useEffectAsync';
import { Image } from '../../components/Image';

const Page: NextPage = () => {
  const { dispatch, state } = useProjectContext();
  const [component, setComponent] = useState<ComponentData | null>(null);
  const [imageRef, setImageRef] = useState<ImageRef | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === 'string') {
      const imageRef = state.imageRefs.find((imageRef) => imageRef.id === parseInt(id, 10));
      const component = state.components.find(
        (component) => component.id === imageRef?.componentId
      );

      if (component) {
        setComponent(component);
      } else {
        setComponent(null);
      }

      if (imageRef) {
        setImageRef(imageRef);
        const imageData = state.images[imageRef.imageId];
        setImageData(imageData);
      } else {
        setImageRef(null);
        setImageData(null);
      }
    } else {
      setComponent(null);
      setImageRef(null);
      setImageData(null);
    }
  }, [id, state]);

  if (!component) {
    return <div>No component found</div>;
  }

  return (
    <ComponentContainer
      imageData={imageData}
      parentComponentData={component ?? undefined}
      parentImageRef={imageRef}
    >
      {({ addButton, components, form }) => (
        <>
          <div className="back-link">
            {imageRef && (
              <Link href={`/component/${imageRef.componentId}`}>
                <a>Go to component</a>
              </Link>
            )}
          </div>
          <div className="header__container">
            <div className="header__col">
              <div>
                <h2>
                  {component?.name} : {imageRef?.variant ?? `variant ${imageRef?.id}`}
                </h2>
              </div>
            </div>
            <div className="header__col">
              <div>{form}</div>
            </div>
          </div>
          {addButton}
          <div>
            <div className="image-container">
              <Image imageRef={imageRef} />
              {components}
            </div>
          </div>
        </>
      )}
    </ComponentContainer>
  );
};

export default Page;

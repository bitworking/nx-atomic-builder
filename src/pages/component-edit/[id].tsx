import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ImageLoader } from 'components/ImageLoader';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';
import { ComponentContainer } from 'components/Component';
import { Image } from 'components/Image';
import { useEffectAsync } from 'libs/hooks/useEffectAsync';
import styles from 'styles/Home.module.css';

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
  }, [id]); // TODO: state as dep needed?

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
              <>
                <Link href={`/component/${imageRef.componentId}`}>
                  <a className="link-list">Go to component</a>
                </Link>

                <Link
                  href={
                    imageRef.parentImageRefId !== null
                      ? `/component-edit/${imageRef.parentImageRefId}`
                      : `/img-edit/${imageRef.imageId}`
                  }
                >
                  <a className="link-list">Got to definition</a>
                </Link>
              </>
            )}
          </div>

          <h1>
            Edit component variant : {component?.name} (
            {imageRef?.variant ?? `variant ${imageRef?.id}`})
          </h1>

          <div className="header__container">
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

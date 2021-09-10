import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ImageLoader } from 'components/ImageLoader';
import {
  ComponentData,
  ImageData,
  ImageRef,
  ProjectData,
  useProjectContext,
} from 'components/ProjectProvider';
import { ComponentContainer } from 'components/Component';
import { Image } from 'components/Image';
import { useEffectAsync } from 'libs/hooks/useEffectAsync';
import styles from 'styles/Home.module.css';

const Page: NextPage = () => {
  const { dispatch, state } = useProjectContext();
  const [component, setComponent] = useState<ComponentData | null>(null);
  const [imageRefs, setImageRefs] = useState<ImageRef[]>([]);
  const [components, setComponents] = useState<{
    parents: ComponentData[] | null;
    children: ComponentData[] | null;
  }>({ parents: [], children: [] });
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === 'string') {
      const data = state.components.find((component) => component.id === parseInt(id, 10));
      if (data) {
        setComponent(data);
      } else {
        setComponent(null);
      }
    } else {
      setComponent(null);
    }
  }, [id, state]);

  useEffect(() => {
    if (component) {
      const imageRefs = state.imageRefs.filter((imageRef) => imageRef.componentId === component.id);
      setImageRefs(imageRefs);

      setComponents({
        parents: getParentComponents(state, component),
        children: getChildComponents(state, component),
      });
    } else {
      setComponents({ parents: null, children: null });
      setImageRefs([]);
    }
  }, [state, component]);

  if (!component) {
    return <div>No component found</div>;
  }

  const getParentComponents = (state: ProjectData, component: ComponentData) => {
    const components = state.imageRefs
      .filter((imageRef) => imageRef.componentId === component.id)
      .reduce<ComponentData[]>((acc, imageRef) => {
        const component = state.components.find(
          (component) => component.id === imageRef.parentComponentId
        );
        const exists = (component: ComponentData) => acc.find((c) => c.id === component.id);
        if (component && !exists(component)) {
          return [...acc, component];
        }
        return acc;
      }, []);

    return components.length ? components : null;
  };

  const getChildComponents = (state: ProjectData, component: ComponentData) => {
    const components = state.imageRefs.reduce<ComponentData[]>((acc, imageRef) => {
      const exists = (component: ComponentData) => acc.find((c) => c.id === component.id);
      if (imageRef.parentComponentId === component.id) {
        const component = state.components.find(
          (component) => component.id === imageRef.componentId
        );

        if (component && !exists(component)) {
          return [...acc, component];
        }
      }
      return acc;
    }, []);

    return components.length ? components : null;
  };

  return (
    <>
      <h1>Edit component : {component.name}</h1>
      <div className="header__container">
        <div className="header__col">
          <div>
            <div className="panel">
              <h4>Parents:</h4>
              {components.parents?.map((component) => (
                <Link key={component.id} href={`/component/${component.id}`}>
                  <a className="link-list">
                    <span>{component.name}</span>
                  </a>
                </Link>
              )) ?? <span>Not used by any component</span>}
            </div>

            <div className="panel">
              <h4>Children:</h4>
              {components.children?.map((component) => (
                <Link key={component.id} href={`/component/${component.id}`}>
                  <a className="link-list">
                    <span>{component.name}</span>
                  </a>
                </Link>
              )) ?? <span>Not using any component</span>}
            </div>
          </div>
        </div>
      </div>

      <div>
        {imageRefs.map((imageRef) => (
          <div key={imageRef.id} className="panel">
            <h4>Variant: {imageRef.variant ?? imageRef.id}</h4>
            <p>
              <Link
                href={
                  imageRef.parentImageRefId !== null
                    ? `/component-edit/${imageRef.parentImageRefId}`
                    : `/img-edit/${imageRef.imageId}`
                }
              >
                <a className="link-list">Got to definition</a>
              </Link>

              <a
                className="link-list"
                onClick={() => dispatch({ type: 'removeImageRef', imageRef })}
              >
                Delete
              </a>
            </p>
            <div style={{ padding: 10, border: '1px solid #ccc' }}>
              <Link href={`/component-edit/${imageRef.id}`}>
                <a>
                  <Image imageRef={imageRef} />
                </a>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Page;

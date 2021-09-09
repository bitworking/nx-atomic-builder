import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';
import { FormComponent } from '../FormComponent';

type ComponentContainerProps = {
  imageData: ImageData;
  parentComponentData?: ComponentData;
  parentImageRef?: ImageRef | null;
};

type ComponentProps = {
  imageRef: ImageRef;
  imageData: ImageData;
  selectedId: number;
  setSelectedId: (id: number) => void;
  updateImageRef: (imageRef: ImageRef, buildComponents?: boolean) => void;
  parentScale: { x: number; y: number; width: number; height: number };
};

export const ComponentContainer = ({
  imageData,
  parentComponentData,
  parentImageRef,
}: ComponentContainerProps) => {
  const [imageRefs, setImageRefs] = useState<ImageRef[]>([]);
  const [selectedId, setSelectedId] = useState(-1);
  const { dispatch, state, uid } = useProjectContext();

  useEffect(() => {
    const imageRefs = state.imageRefs.filter((image) =>
      !parentComponentData
        ? image.imageId === imageData.id && image.parentImageRefId === null
        : image.imageId === imageData.id && image.parentImageRefId === parentImageRef?.id
    );
    setImageRefs(imageRefs);
  }, [state, imageData, parentComponentData, parentImageRef]);

  const updateImageRef = (imageRef: ImageRef, buildComponents: boolean = false) => {
    dispatch({ type: 'updateImageRef', imageRef });
    if (buildComponents) {
      dispatch({ type: 'buildComponents' });
    }
  };

  const addImageRef = () => {
    dispatch({
      type: 'createImageRef',
      imageData,
      componentId: null,
      parentComponentId: parentComponentData?.id ?? null,
      parentImageRefId: parentImageRef?.id ?? null,
    });
  };

  // useEffect(() => {
  //   console.log(imageRefs);
  // }, [imageRefs]);

  const parentScale = {
    x: parentImageRef?.x ?? 0,
    y: parentImageRef?.y ?? 0,
    width: parentImageRef?.width ?? 1,
    height: parentImageRef?.height ?? 1,
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 30, right: 30, zIndex: 100 }}>
        <button onClick={() => addImageRef()}>Add component</button>
      </div>
      {imageRefs.map((imageRef) => (
        <Component
          key={imageRef.id}
          imageRef={imageRef}
          imageData={imageData}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          updateImageRef={updateImageRef}
          parentScale={parentScale}
        />
      ))}
    </>
  );
};

export const Component = ({
  imageRef,
  imageData,
  selectedId,
  setSelectedId,
  updateImageRef,
  parentScale,
}: ComponentProps) => {
  const ref = useRef<Rnd | null>(null);
  const isSelected = imageRef.id === selectedId;

  // set initial position/size
  useEffect(() => {
    if (ref) {
      window.setTimeout(() => {
        const width = ref.current?.resizableElement.current?.parentElement?.offsetWidth ?? 800;
        const height = ref.current?.resizableElement.current?.parentElement?.offsetHeight ?? 600;

        // const scalingX = width / (imageData.width * parentScale.width);
        // const scalingY = height / (imageData.height * parentScale.height);

        ref.current?.updatePosition({
          x: Math.max(0, ((imageRef.x - parentScale.x) / parentScale.width) * width),
          y: Math.max(0, ((imageRef.y - parentScale.y) / parentScale.height) * height),
        });
        ref.current?.updateSize({
          width: (imageRef.width * width) / parentScale.width,
          height: (imageRef.height * height) / parentScale.height,
        });
      }, 10);
    }
  }, [imageRef, ref, parentScale]);

  return (
    <>
      {isSelected && (
        <div
          style={{
            position: 'fixed',
            top: 60,
            right: 30,
            background: '#f0f0f0',
            padding: 30,
            zIndex: 100,
          }}
        >
          <FormComponent imageRef={imageRef} onData={(data) => updateImageRef(data, true)} />
        </div>
      )}
      <Rnd
        ref={ref}
        style={{
          background: isSelected ? '#ff0000' : '#999',
          opacity: 0.5,
          border: '1px dashed #333',
        }}
        minWidth={20}
        minHeight={20}
        bounds="parent"
        onDragStart={() => setSelectedId(imageRef.id)}
        onResizeStart={() => setSelectedId(imageRef.id)}
        onResizeStop={(event, dir, ref, delta, position) => {
          updateImageRef({
            ...imageRef,
            x:
              (position.x / (ref.parentElement?.offsetWidth ?? 1)) * parentScale.width +
              parentScale.x,
            y:
              (position.y / (ref.parentElement?.offsetHeight ?? 1)) * parentScale.height +
              parentScale.y,
            width: (ref.offsetWidth / (ref.parentElement?.offsetWidth ?? 1)) * parentScale.width,
            height:
              (ref.offsetHeight / (ref.parentElement?.offsetHeight ?? 1)) * parentScale.height,
          });
        }}
        onDragStop={(event, position) => {
          updateImageRef({
            ...imageRef,
            x:
              (position.x / (position.node.parentElement?.offsetWidth ?? 1)) * parentScale.width +
              parentScale.x,
            y:
              (position.y / (position.node.parentElement?.offsetHeight ?? 1)) * parentScale.height +
              parentScale.y,
          });
        }}
      ></Rnd>
    </>
  );
};

import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';
import { FormComponent } from '../FormComponent';

type ComponentContainerProps = {
  imageData: ImageData;
  parentComponentData?: ComponentData;
};

type ComponentProps = {
  imageRef: ImageRef;
  imageData: ImageData;
  selectedId: number;
  setSelectedId: (id: number) => void;
  updateImageRef: (imageRef: ImageRef) => void;
};

export const ComponentContainer = ({ imageData, parentComponentData }: ComponentContainerProps) => {
  const [imageRefs, setImageRefs] = useState<ImageRef[]>([]);
  const [selectedId, setSelectedId] = useState(-1);
  const { dispatch, state, uid } = useProjectContext();

  useEffect(() => {
    const imageRefs = state.imageRefs.filter((image) =>
      !parentComponentData
        ? image.imageId === imageData.id && image.parentComponentId === null
        : image.imageId === imageData.id && image.parentComponentId === parentComponentData.id
    );

    setImageRefs(imageRefs);
  }, [state, imageData]);

  const updateImageRef = (imageRef: ImageRef) => {
    console.log('updateImageRef component', imageRef);
    dispatch({ type: 'updateImageRef', imageRef });
  };

  const addImageRef = () => {
    dispatch({
      type: 'createImageRef',
      imageData,
      componentId: null,
      parentComponentId: parentComponentData?.id ?? null,
    });
  };

  // useEffect(() => {
  //   console.log(imageRefs);
  // }, [imageRefs]);

  return (
    <>
      <div style={{ position: 'absolute', top: -30, left: 0 }}>
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
}: ComponentProps) => {
  const ref = useRef<Rnd | null>(null);
  const isSelected = imageRef.id === selectedId;

  // set initial position/size
  useEffect(() => {
    const width = ref.current?.resizableElement.current?.parentElement?.offsetWidth ?? 800;
    const height = ref.current?.resizableElement.current?.parentElement?.offsetHeight ?? 600;

    // const scaling = width / imageData.width;

    ref.current?.updatePosition({ x: imageRef.x * width, y: imageRef.y * height });
    ref.current?.updateSize({ width: imageRef.width * width, height: imageRef.height * height });
  }, [imageRef]);

  return (
    <>
      {isSelected && (
        <div style={{ position: 'absolute', right: 0, top: -150 }}>
          <FormComponent imageRef={imageRef} onData={updateImageRef} />
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
        onResizeStop={(event, dir, ref, delta, position) =>
          updateImageRef({
            ...imageRef,
            x: position.x / (ref.parentElement?.offsetWidth ?? 1),
            y: position.y / (ref.parentElement?.offsetHeight ?? 1),
            width: ref.offsetWidth / (ref.parentElement?.offsetWidth ?? 1),
            height: ref.offsetHeight / (ref.parentElement?.offsetHeight ?? 1),
          })
        }
        onDragStop={(event, position) =>
          updateImageRef({
            ...imageRef,
            x: position.x / (position.node.parentElement?.offsetWidth ?? 1),
            y: position.y / (position.node.parentElement?.offsetHeight ?? 1),
          })
        }
      ></Rnd>
    </>
  );
};

import { useEffect, useRef, useState, ReactNode } from 'react';
import { Rnd } from 'react-rnd';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';
import { FormComponentVariant } from 'components/FormComponentVariant';

type ComponentContainerProps = {
  imageData: ImageData | null;
  parentComponentData?: ComponentData;
  parentImageRef?: ImageRef | null;
  children: (components: {
    addButton: ReactNode;
    components: ReactNode;
    form: ReactNode;
  }) => JSX.Element;
};

type ComponentProps = {
  imageRef: ImageRef;
  imageData: ImageData;
  selectedImageRef: ImageRef | null;
  setSelectedImageRef: (imageRef: ImageRef | null) => void;
  updateImageRef: (imageRef: ImageRef, buildComponents?: boolean) => void;
  parentScale: { x: number; y: number; width: number; height: number };
};

export const ComponentContainer = ({
  imageData,
  parentComponentData,
  parentImageRef,
  children,
}: ComponentContainerProps) => {
  const [imageRefs, setImageRefs] = useState<ImageRef[]>([]);
  const [selectedImageRef, setSelectedImageRef] = useState<ImageRef | null>(null);
  const { dispatch, state, uid } = useProjectContext();

  useEffect(() => {
    if (!imageData) {
      return;
    }
    const imageRefs = state.imageRefs.filter((image) =>
      !parentComponentData
        ? image.imageId === imageData.id && image.parentImageRefId === null
        : image.imageId === imageData.id && image.parentImageRefId === parentImageRef?.id
    );
    setImageRefs(imageRefs);

    // replace selectedImageRef (fixes reset of position after form change)
    if (selectedImageRef) {
      const imageRef = state.imageRefs.find((imageRef) => imageRef.id === selectedImageRef.id);
      setSelectedImageRef(imageRef ?? null);
    }
  }, [state, imageData, parentComponentData, parentImageRef]);

  useEffect(() => {
    setSelectedImageRef(null);
  }, [parentComponentData]);

  if (!imageData) {
    return null;
  }

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

  const parentScale = {
    x: parentImageRef?.x ?? 0,
    y: parentImageRef?.y ?? 0,
    width: parentImageRef?.width ?? 1,
    height: parentImageRef?.height ?? 1,
  };

  const addButton = <button onClick={() => addImageRef()}>Add component</button>;

  const components = (
    <>
      {imageRefs.map((imageRef) => (
        <Component
          key={imageRef.id}
          imageRef={imageRef}
          imageData={imageData}
          selectedImageRef={selectedImageRef}
          setSelectedImageRef={setSelectedImageRef}
          updateImageRef={updateImageRef}
          parentScale={parentScale}
        />
      ))}
    </>
  );

  const form = (
    <>
      {selectedImageRef && (
        <FormComponentVariant
          imageRef={selectedImageRef}
          setSelectedImageRef={setSelectedImageRef}
          onData={(data) => updateImageRef(data, true)}
        />
      )}
    </>
  );

  return children({ addButton, components, form });
};

export const Component = ({
  imageRef,
  imageData,
  selectedImageRef,
  setSelectedImageRef,
  updateImageRef,
  parentScale,
}: ComponentProps) => {
  const ref = useRef<Rnd | null>(null);
  const isSelected = imageRef.id === selectedImageRef?.id;

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
        onDragStart={() => setSelectedImageRef(imageRef)}
        onResizeStart={() => setSelectedImageRef(imageRef)}
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

import { SyntheticEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';

type FormComponentVariantProps = {
  imageRef: ImageRef;
  onData: (data: any) => void;
  setSelectedImageRef: (imageRef: ImageRef | null) => void;
};

export const FormComponentVariant = ({
  imageRef: imageRefDefault,
  onData,
  setSelectedImageRef,
}: FormComponentVariantProps) => {
  const [isValid, setIsValid] = useState(false);
  const [imageRef, setImageRef] = useState(imageRefDefault);
  const { dispatch } = useProjectContext();

  useEffect(() => {
    onData && onData(imageRef);
  }, [imageRef]);

  useEffect(() => {
    setImageRef(imageRefDefault);
  }, [imageRefDefault]);

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onData && onData(imageRef);
  };

  return (
    <form onSubmit={onSubmit}>
      {/*<div className="form__row">*/}
      {/*  <label>*/}
      {/*    <span>Id: {imageRef.id}</span>*/}
      {/*  </label>*/}
      {/*</div>*/}
      <div className="form__row">
        <label>
          <span>Name: </span>
          <input
            type="text"
            value={imageRef.componentName ?? ''}
            onChange={(event) =>
              setImageRef({
                ...imageRef,
                componentName: event.currentTarget.value !== '' ? event.currentTarget.value : null,
              })
            }
          />
        </label>
      </div>
      <div className="form__row">
        <label>
          <span>Variant: </span>
          <input
            type="text"
            value={imageRef.variant ?? ''}
            onChange={(event) =>
              setImageRef({
                ...imageRef,
                variant: event.currentTarget.value !== '' ? event.currentTarget.value : undefined,
              })
            }
          />
        </label>
      </div>
      <div className="form__row">
        {imageRef.componentName && (
          <Link href={`/component-edit/${imageRef.id}`}>
            <a className="link-list">Go to component variant</a>
          </Link>
        )}
        <a
          className="link-list"
          onClick={() => {
            dispatch({ type: 'removeImageRef', imageRef });
            setSelectedImageRef(null);
          }}
        >
          Delete
        </a>
      </div>
      {/*<div>{<button type="submit">Save</button>}</div>*/}
    </form>
  );
};

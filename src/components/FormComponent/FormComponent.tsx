import { SyntheticEvent, useEffect, useState } from 'react';
import { ComponentData, ImageData, ImageRef } from 'components/ProjectProvider';

type FormComponentProps = {
  imageRef: ImageRef;
  onData: (data: any) => void;
};

export const FormComponent = ({ imageRef: imageRefDefault, onData }: FormComponentProps) => {
  const [isValid, setIsValid] = useState(false);
  const [imageRef, setImageRef] = useState(imageRefDefault);

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
      <div>
        <label>
          <span>Id: {imageRef.id}</span>
        </label>
      </div>
      <div>
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
      {/*<div>{<button type="submit">Save</button>}</div>*/}
    </form>
  );
};

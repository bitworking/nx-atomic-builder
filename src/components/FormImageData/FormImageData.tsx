import { SyntheticEvent, useEffect, useState } from 'react';
import { ImageData } from 'components/ProjectProvider';

type FormImageDataProps = {
  imgData: ImageData;
  setImgData: (data: ImageData) => void;
  onData: (data: ImageData) => void;
};

export const FormImageData = ({ imgData, setImgData, onData }: FormImageDataProps) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (imgData.id >= 0 && imgData.data && imgData.name && imgData.width && imgData.height) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [imgData]);

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onData && onData(imgData);
  };

  return (
    <form onSubmit={onSubmit}>
      {/*<div className="form__row">*/}
      {/*  <label>*/}
      {/*    <span>Id: {imgData.id}</span>*/}
      {/*  </label>*/}
      {/*</div>*/}
      <div className="form__row">
        <label>
          <span>Name: </span>
          <input
            type="text"
            value={imgData.name}
            onChange={(event) => setImgData({ ...imgData, name: event.currentTarget.value })}
          />
        </label>
      </div>
      <div className="form__row">{isValid && <button type="submit">Save</button>}</div>
    </form>
  );
};

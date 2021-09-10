import { SyntheticEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ComponentData, ImageData, ImageRef, useProjectContext } from 'components/ProjectProvider';

type FormComponentProps = {
  component: ComponentData;
  onData: (data: ComponentData) => void;
};

export const FormComponent = ({ component: componentDefault, onData }: FormComponentProps) => {
  const [isValid, setIsValid] = useState(false);
  const [component, setComponent] = useState(componentDefault);
  const { dispatch } = useProjectContext();

  useEffect(() => {
    onData && onData(component);
  }, [component]);

  useEffect(() => {
    setComponent(componentDefault);
  }, [componentDefault]);

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onData && onData(component);
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form__row">
        <label>
          <span>Id: {component.id}</span>
        </label>
      </div>
      <div className="form__row">
        <label>
          <span>Category: </span>
          <input
            type="text"
            value={component.category ?? ''}
            onChange={(event) =>
              setComponent({
                ...component,
                category: event.currentTarget.value !== '' ? event.currentTarget.value : undefined,
              })
            }
          />
        </label>
      </div>
      {/*<div>{<button type="submit">Save</button>}</div>*/}
    </form>
  );
};

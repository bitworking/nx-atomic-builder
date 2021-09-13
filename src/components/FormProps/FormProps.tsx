import { SyntheticEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ComponentData,
  ImageData,
  ImageRef,
  PropsData,
  useProjectContext,
} from 'components/ProjectProvider';

type FormComponentProps = {
  component: ComponentData;
  onData: (data: ComponentData) => void;
};

const propsToString = (props: PropsData): string => {
  return Object.entries(props).reduce((acc, [key, prop]) => {
    const text = `${key}${prop.isOptional ? '?' : ''}: ${prop.type};\n`;
    return `${acc}${text}`;
  }, '');
};

const stringToProps = (propsString: string): PropsData => {
  return propsString.split('\n').reduce((acc, line) => {
    const match = line.match(/(\w+)(\??): *([\w\[\]<>]+)[; ]*$/);

    if (!match) {
      return acc;
    }

    return {
      ...acc,
      [match[1]]: { type: match[3], isOptional: match[2] === '?' },
    };
  }, {});
};

export const FormProps = ({ component: componentDefault, onData }: FormComponentProps) => {
  const [isValid, setIsValid] = useState(false);
  const [component, setComponent] = useState(componentDefault);
  const [propsString, setPropsString] = useState(propsToString(componentDefault.props));

  useEffect(() => {
    setComponent(componentDefault);
    setPropsString(propsToString(componentDefault.props));
  }, [componentDefault]);

  useEffect(() => {
    onData(component);
  }, [component]);

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setComponent({ ...component, props: stringToProps(propsString) });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form__row">
        <label>
          <span>Props:</span>
          <textarea
            value={propsString}
            onChange={(event) =>
              setPropsString(event.currentTarget.value !== '' ? event.currentTarget.value : '')
            }
          />
        </label>
      </div>
      <div className="form__row">{<button type="submit">Save</button>}</div>
    </form>
  );
};

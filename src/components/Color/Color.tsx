import { Color as ColorType, useProjectContext } from 'components/ProjectProvider';

export type ColorProps = {
  color: ColorType;
};

export const Color = ({ color }: ColorProps) => {
  const { dispatch } = useProjectContext();

  return (
    <div className="color-box">
      <div className="color" style={{ backgroundColor: color.hex }} />
      <div className="color-info">
        <span>{color.hex}</span>
        <a className="link-button" onClick={() => dispatch({ type: 'removeColor', color })}>
          ✖
        </a>
      </div>
    </div>
  );
};

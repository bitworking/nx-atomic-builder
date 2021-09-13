import { useProjectContext } from 'components/ProjectProvider';

export const ColorPicker = () => {
  const { dispatch } = useProjectContext();

  const onClick = async () => {
    try {
      // @ts-ignore
      const color = await new EyeDropper().open();
      dispatch({ type: 'addColor', color: { hex: color.sRGBHex } });
    } catch (e) {
      console.error('EyeDropper not available');
    }
  };

  // @ts-ignore
  if (typeof EyeDropper === 'undefined') {
    return null;
  }

  return <button onClick={onClick}>Pick Color</button>;
};

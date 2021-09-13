export type ColorProps = {
  hex: string;
};

export const Color = ({ hex }: ColorProps) => {
  return (
    <div className="color" style={{ backgroundColor: hex }}>
      {hex}
    </div>
  );
};

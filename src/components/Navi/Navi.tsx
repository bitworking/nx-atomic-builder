import Link from 'next/link';
import { ImageData, useProjectContext } from 'components/ProjectProvider';

export const Navi = () => {
  const { state } = useProjectContext();

  return (
    <>
      <h4>Pages</h4>
      <ul>
        <li>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link href="/img-add">
            <a>Add image</a>
          </Link>
        </li>
      </ul>
      <h4>Images</h4>
      <ul>
        {state.images.map((img) => (
          <li key={img.id}>
            <Link href={`/img-edit/${img.id}`}>
              <a>{img.name}</a>
            </Link>
          </li>
        ))}
      </ul>
      <h4>Components</h4>
      <ul>
        {state.components.map((component) => (
          <li key={component.id}>
            <Link href={`/component-edit/${component.id}`}>
              <a>{component.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

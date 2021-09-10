import type { NextPage } from 'next';
import { useProjectContext } from 'components/ProjectProvider';
import { ProjectLoader } from 'components/ProjectLoader';
import styles from 'styles/Home.module.css';

const download = (filename: string, json: any) => {
  var element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ type: 'atomic-builder', version: '0.1', data: json }))
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

const Page: NextPage = () => {
  const { state, dispatch } = useProjectContext();

  return (
    <>
      <h1>Upload atomic-builder file</h1>

      <ProjectLoader />

      <button onClick={() => download('atomic-builder.json', { ...state, _imageCache: undefined })}>
        Download
      </button>

      <button onClick={() => dispatch({ type: 'reset' })}>Reset Project</button>
    </>
  );
};

export default Page;

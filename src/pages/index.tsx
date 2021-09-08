import type { NextPage } from 'next';
import styles from 'styles/Home.module.css';
import { useProjectContext } from 'components/ProjectProvider';
import { ProjectLoader } from 'components/ProjectLoader';

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
  const { state } = useProjectContext();

  return (
    <>
      <h3>Upload atomic-builder file</h3>

      <ProjectLoader />

      <p>&nbsp;</p>
      <button onClick={() => download('atomic-builder.json', state)}>Download</button>
    </>
  );
};

export default Page;

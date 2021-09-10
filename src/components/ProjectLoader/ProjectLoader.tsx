import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useProjectContext } from 'components/ProjectProvider';
import styles from './ProjectLoader.module.css';

export const ProjectLoader = () => {
  const dropzone = useRef<HTMLDivElement | null>(null);
  const [dropzoneActive, setDropzoneActive] = useState(false);
  const { uid, dispatch } = useProjectContext();
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      try {
        const json = JSON.parse(data);
        if (json.type === 'atomic-builder' && json.data) {
          dispatch({ type: 'importProject', data: json.data });
        }
      } catch (error) {
        // show error
      }
    }
  }, [data]);

  useEffect(() => {
    window.addEventListener(
      'dragover',
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false
    );

    window.addEventListener(
      'drop',
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false
    );

    dropzone.current?.addEventListener('dragenter', (event) => {
      event.preventDefault();
      setDropzoneActive(true);
    });

    dropzone.current?.addEventListener('dragleave', (event) => {
      event.preventDefault();
      setDropzoneActive(false);
    });

    dropzone.current?.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    dropzone.current?.addEventListener('drop', (event) => {
      event.preventDefault();
      setDropzoneActive(false);

      const file = event.dataTransfer?.files[0];

      if (!file) {
        setData(null);
        return;
      }

      const reader = new FileReader();

      reader.readAsText(file);

      reader.addEventListener('loadend', () => {
        setData(typeof reader.result === 'string' ? reader.result : null);
      });
    });

    document.addEventListener('paste', async function (e) {
      if (!e.clipboardData) {
        return;
      }
      if (e.clipboardData.types.indexOf('Files') > -1) {
        const file = e.clipboardData.files[0];

        const json = await e.clipboardData.files[0].text();

        setData(json);
      }
    });

    return () => {
      // clear up events
    };
  }, []);

  return (
    <div>
      <p>Drop project file here or paste it from clipboard</p>
      <div
        ref={dropzone}
        className={`${styles.projectLoader__dropzone} ${
          dropzoneActive && styles.projectLoader__dropzone__active
        }`}
      ></div>
    </div>
  );
};

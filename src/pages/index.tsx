import type { NextPage } from 'next';
import styles from 'styles/Home.module.css';
import { useProjectContext } from 'components/ProjectProvider';

const Page: NextPage = () => {
  const { dispatch } = useProjectContext();

  return <div>Home</div>;
};

export default Page;

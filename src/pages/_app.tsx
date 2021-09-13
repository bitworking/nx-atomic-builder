import type { AppProps } from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import { ProjectProvider } from 'components/ProjectProvider';
import { Navi } from 'components/Navi';
import 'styles/globals.css';
import styles from 'styles/Home.module.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ProjectProvider>
      <Head>
        <title>Atomic Builder</title>
        <meta name="description" content="Atomic Builder" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.navi}>
          <nav>
            <Navi />
          </nav>
        </div>
        <main className={styles.content}>
          <Component {...pageProps} />
        </main>
      </div>
    </ProjectProvider>
  );
}
export default MyApp;

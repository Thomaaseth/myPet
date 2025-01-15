import styles from './page.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Your App</h1>
      <p className={styles.description}>This is the home page of your application.</p>
    </div>
  );
};

export default Home;


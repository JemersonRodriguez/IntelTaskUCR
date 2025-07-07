import styles from './Loader.module.css';

const Loader = () => (
  <div className={styles.loaderContainer}>
    <iframe
      src="https://lottie.host/embed/5c035203-dff6-4d38-825b-a50098495e6e/tXc1ZBDHPx.lottie"
      style={{ border: "none", width: 180, height: 180, background: "transparent" }}
      title="loader"
      allowFullScreen
    />
  </div>
);

export default Loader;
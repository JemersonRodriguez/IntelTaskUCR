import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css'; // Assuming you have some styles for the layout

const AuthLayout = () => (
  <main className={styles.main}>
    <Outlet />
  </main>
);

export default AuthLayout;
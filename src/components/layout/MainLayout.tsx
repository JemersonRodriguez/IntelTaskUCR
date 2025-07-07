import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useIsDesktop from "../../hooks/useIsDesktop";
import styles from "./MainLayout.module.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useNavigate } from "react-router-dom";
import getTokenFromCookie from "../../utils/TokenFromCookie";
import Loader from "../common/Loader";

const MainLayout = () => {
  const { user, login, logout } = useAuth();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const token = getTokenFromCookie();
  if (token && !user) {
    fetch("https://localhost:7293/api/Auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then((data) => {
        login({
          token,
          usuario: {
            id: data.id,
            nombre: data.nombre,
            email: data.correo,
            rol: {
              id: data.rol.cN_Id_rol,
              nombre: data.rol.cT_Nombre_rol,
            },
          },
        });
      })
      .catch(() => {
        logout();
        navigate("/");
      })
      .finally(() => setLoading(false)); // <-- Aquí
  } else if (!token && !user) {
    logout();
    navigate("/");
    setLoading(false); // <-- Aquí
  } else {
    setLoading(false); // <-- Aquí
  }
}, [user, login, logout, navigate]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isDesktop ? (
        <div className={styles.desktopContent}>
          <Sidebar />
          <main className={styles.desktopMain}>
            <Outlet />
          </main>
        </div>
      ) : (
        <>
          <Header />
          <main className={styles.main}>
            <Outlet />
          </main>
        </>
      )}
    </div>
  );
};

export default MainLayout;
import { createContext, useContext, useEffect, useState } from "react";
import styles from "./Notificaciones.module.css";
import historialIcon from "../assets/svg/historial.svg";
import { useSignalR } from "../context/SignalRContext"; // Asegúrate de tener este contexto

interface Notificacion {
  mensaje: string;
  fecha: string;
  leida: boolean;
}

type NotificacionesContextType = {
  nuevas: number;
  setNuevas: (n: number) => void;
};

const NotificacionesContext = createContext<NotificacionesContextType>({
  nuevas: 0,
  setNuevas: () => {},
});

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}

export function NotificacionesProvider({ children }: { children: React.ReactNode }) {
  const [nuevas, setNuevas] = useState(0);
  return (
    <NotificacionesContext.Provider value={{ nuevas, setNuevas }}>
      {children}
    </NotificacionesContext.Provider>
  );
}

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { connection } = useSignalR();

  useEffect(() => {
    setLoading(false); // Ya no hay carga inicial, solo tiempo real

    if (!connection) return;

    const handler = (notificacion: Notificacion) => {
      setNotificaciones((prev) => [notificacion, ...prev]);
    };

    connection.on("NuevaNotificacion", handler);

    return () => {
      connection.off("NuevaNotificacion", handler);
    };
  }, [connection]);

  return (
    <div className={styles.notificacionesWrapper}>
      <section className={styles.notificacionesContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Notificaciones</h2>
          <img src={historialIcon} alt="Notificaciones" className={styles.icon} />
        </div>
        <div className={styles.lista}>
          {loading ? (
            <p className={styles.cargando}>Cargando notificaciones...</p>
          ) : notificaciones.length === 0 ? (
            <div className={styles.vacio}>
              <span className={styles.emoji}>🔔</span>
              No tienes notificaciones nuevas.
            </div>
          ) : (
            <ul className={styles.ul}>
              {notificaciones.map((n, i) => (
                <li
                  key={i}
                  className={`${styles.notificacion} ${n.leida ? styles.leida : styles.nueva}`}
                >
                  {!n.leida && <span className={styles.punto} />}
                  <span className={styles.mensaje}>{n.mensaje}</span>
                  <span className={styles.fecha}>{n.fecha}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
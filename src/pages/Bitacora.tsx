import styles from "./Bitacora.module.css";
import bitacoraIcon from "../assets/svg/bitacora.svg";

export default function Bitacora() {
  return (
    <div className={styles.bitacoraWrapper}>
      <section className={styles.bitacoraContainer}>
        <div className={styles.header}>
          <img src={bitacoraIcon} alt="Bitácora" className={styles.icon} />
          <h2 className={styles.title}>Bitácora de Actividades</h2>
        </div>
        {/* Aquí puedes agregar el contenido de la bitácora */}
        <div className={styles.placeholder}>
          <p>Aquí se mostrarán las actividades registradas en la bitácora.</p>
        </div>
      </section>
    </div>
  );
}
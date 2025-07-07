import { useState } from "react";
import styles from "./Header.module.css";
import DesplegarIcon from "../../assets/svg/desplegar.svg";
import { roleHeaderLinks } from "../roleBased/roleHeaderLinks";
import useAuth from "../../hooks/useAuth";
import useIsDesktop from "../../hooks/useIsDesktop";

const MOBILE_COLLAPSE_BREAKPOINT = 768;

const Header: React.FC = () => {
  const isDesktop = useIsDesktop(1024); // >=1024px: no header
  const isCollapsed = !useIsDesktop(MOBILE_COLLAPSE_BREAKPOINT); // <768px: header colapsado
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // No mostrar header en desktop
  if (isDesktop) return null;

  // Obtener el componente de links según el rol
  const RoleLinksComponent = user?.usuario?.rol?.nombre
    ? roleHeaderLinks[user.usuario.rol.nombre]
    : null;


  // Mostrar header colapsado en mobile (<768px)
  if (isCollapsed) {
    return (
      <header className={styles.header}>
        <div className={styles.logo}>Intel Task PJ</div>
        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Abrir menú"
        >
          <img src={DesplegarIcon} alt="Abrir menú" />
        </button>
        {menuOpen && RoleLinksComponent && (
          <nav className={styles.mobileNav}>
            <RoleLinksComponent />
          </nav>
        )}
      </header>
    );
  }

  // Mostrar header expandido en mobile/tablet (768px <= width < 1024px)
  return (
    <header className={styles.header}>
      <div className={styles.logo}>Intel Task PJ</div>
      <nav className={styles.nav}>
        {RoleLinksComponent && <RoleLinksComponent />}
      </nav>
    </header>
  );
};

export default Header;
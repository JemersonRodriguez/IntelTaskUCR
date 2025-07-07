import { useState, useRef, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import TaskIcon from "../../assets/svg/task_icon.svg";
import SubTaskIcon from "../../assets/svg/sub_task.svg";
import HistorialIcon from "../../assets/svg/historial.svg";
import PerfilIcon from "../../assets/svg/perfil.svg";
import BitacoraIcon from "../../assets/svg/bitacora.svg";
import UsuariosIcon from "../../assets/svg/usuarios.svg";
import NotificacionesIcon from "../../assets/svg/notificaciones.svg";
import AtrasIcon from "../../assets/svg/atras.svg";
import DesplegarIcon from "../../assets/svg/desplegar.svg";
import LogoutIcon from "../../assets/svg/logout.svg";
// NOTA: Se eliminó SignalR y notificaciones

const menuItems = [
  { icon: TaskIcon, label: "Mis Tareas", to: "/task" },
  { icon: SubTaskIcon, label: "Subtareas", to: "/subtask" },
  { icon: HistorialIcon, label: "Historial", to: "/historial" },
  { icon: PerfilIcon, label: "Perfil", to: "/perfil" },
  { icon: BitacoraIcon, label: "Bitacora", to: "/bitacora" },
  { icon: UsuariosIcon, label: "Usuarios", to: "/usuarios" },
  { icon: NotificacionesIcon, label: "Notificaciones", to: "/notificaciones" },
];

export default function Sidebar() {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    logout();
    navigate("/ooo");
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <header className={styles.header}>
        <div>
          {!collapsed && (
            <>
              <h2>Intel Task PJ</h2>
              <img className={styles.icono} src="./icon.png" alt="" />
            </>
          )}
        </div>
        {!collapsed && (
          <div
            className={styles.circleIconWrapper}
            onClick={() => setCollapsed(true)}
            title="Colapsar menú"
          >
            <img
              src={AtrasIcon}
              className={styles.atrasIcon}
              alt="Atrás"
              style={{
                transition: "transform 0.2s",
              }}
            />
          </div>
        )}
      </header>
      <main className={styles.main}>
        <nav>
          <ul className={styles.menu}>
            {collapsed && (
              <li
                className={`${styles.menuItem} ${hovered === -1 ? styles.selected : ""}`}
                onMouseEnter={() => setHovered(-1)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setCollapsed(false)}
                title="Desplegar menú"
              >
                <img
                  src={DesplegarIcon}
                  className={styles.icono}
                  alt="Desplegar"
                  style={{
                    filter:
                      hovered === -1
                        ? "brightness(0) invert(1)"
                        : "brightness(0) invert(0.15)",
                  }}
                />
              </li>
            )}
            {menuItems.map((item, idx) => {
              const isActive =
                hovered === idx || (selected === idx && hovered === null);
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className={`${styles.menuItem} ${isActive ? styles.selected : ""}`}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    setSelected(idx);
                    if (collapsed && item.to) {
                      navigate(item.to);
                    }
                  }}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  {Icon && (
                    <span style={{ position: "relative", display: "inline-block" }}>
                      <img
                        src={Icon}
                        className={styles.icono}
                        style={{
                          filter: isActive ? "brightness(0) invert(1)" : "none",
                          margin: collapsed ? "0 auto" : undefined,
                          display: "block",
                        }}
                        alt={item.label + " icon"}
                      />
                      {/* 🔴 El badge de notificaciones fue eliminado por no usarse */}
                    </span>
                  )}
                  {!collapsed && (
                    <Link className={styles.link} to={item.to}>
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
            {collapsed && (
              <li
                className={`${styles.menuItem} ${
                  hovered === 1000 ? styles.selected : ""
                }`}
                onMouseEnter={() => setHovered(1000)}
                onMouseLeave={() => setHovered(null)}
                onClick={handleLogout}
                title="Cerrar sesión"
                style={{ cursor: "pointer" }}
              >
                <img
                  src={LogoutIcon}
                  className={styles.icono}
                  alt="Cerrar sesión"
                  style={{
                    filter:
                      hovered === 1000
                        ? "brightness(0) invert(1)"
                        : "brightness(0) invert(0.15)",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              </li>
            )}
          </ul>
        </nav>
      </main>
      <footer className={styles.footer}>
        {!collapsed && user ? (
          <div className={styles.userSection} ref={menuRef}>
            <div
              className={styles.userName}
              onClick={() => setUserMenuOpen((open) => !open)}
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              {user.usuario.nombre}
              <span style={{ marginLeft: 8, fontSize: 18 }}>▼</span>
            </div>
            {userMenuOpen && (
              <div className={styles.userMenu}>
                <Link
                  to="/perfil"
                  className={styles.userMenuItem}
                  onClick={() => setUserMenuOpen(false)}
                >
                  Perfil
                </Link>
                <button className={styles.userMenuItem} onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          !collapsed && (
            <>
              <p>© 2025 IntelTaskPJ</p>
              <p>
                Powered by{" "}
                <a href="" target="_blank" rel="noopener noreferrer">
                  IntelTaskPJ
                </a>
              </p>
            </>
          )
        )}
      </footer>
    </aside>
  );
}

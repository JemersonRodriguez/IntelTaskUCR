import { useEffect, useState } from "react";
import styles from "./Perfil.module.css";
import perfilIcon from "../assets/svg/perfil.svg";
import Swal from "sweetalert2";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  fechaNacimiento: string;
  rol?: {
    cN_Id_rol: number;
    cT_Nombre_rol: string;
  };
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    fetch("https://localhost:7293/api/Auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsuario(data))
      .finally(() => setLoading(false));
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    if (!nuevaContrasena.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Debes escribir una nueva contraseña.",
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }
    const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    try {
      const res = await fetch(
        `https://localhost:7293/api/Usuario/${usuario.id}/cambiar-contrasena`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nuevaContrasena }),
        }
      );
      if (!res.ok) throw new Error("No se pudo actualizar la contraseña");
      Swal.fire({
        icon: "success",
        title: "Contraseña actualizada correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
      setNuevaContrasena("");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar la contraseña.",
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.perfilWrapper}>
        <div className={styles.perfilContainer}>
          <div className={styles.header}>
            <img src={perfilIcon} alt="Perfil" className={styles.icon} />
            <h2 className={styles.title}>Perfil</h2>
          </div>
          <p className={styles.loading}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className={styles.perfilWrapper}>
        <div className={styles.perfilContainer}>
          <div className={styles.header}>
            <img src={perfilIcon} alt="Perfil" className={styles.icon} />
            <h2 className={styles.title}>Perfil</h2>
          </div>
          <p className={styles.error}>No se pudo cargar el usuario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.perfilWrapper}>
      <section className={styles.perfilContainer}>
        <div className={styles.header}>
          <img src={perfilIcon} alt="Perfil" className={styles.icon} />
          <h2 className={styles.title}>Perfil de usuario</h2>
        </div>
        <form className={styles.form} onSubmit={handleGuardar}>
          <label className={styles.label}>
            Cédula (ID)
            <input
              className={styles.input}
              value={usuario.id}
              disabled
              readOnly
            />
          </label>
          <label className={styles.label}>
            Nombre
            <input
              className={styles.input}
              value={usuario.nombre}
              disabled
              readOnly
            />
          </label>
          <label className={styles.label}>
            Correo electrónico
            <input
              className={styles.input}
              value={usuario.correo}
              disabled
              readOnly
            />
          </label>
          <label className={styles.label}>
            Fecha de nacimiento
            <input
              className={styles.input}
              value={usuario.fechaNacimiento?.split("T")[0] || ""}
              disabled
              readOnly
            />
          </label>
          <label className={styles.label}>
            Rol
            <input
              className={styles.input}
              value={usuario.rol?.cT_Nombre_rol || "Usuario"}
              disabled
              readOnly
            />
          </label>
          <label className={styles.label}>
            Nueva contraseña
            <input
              className={styles.input}
              type="password"
              placeholder="Escribe una nueva contraseña"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
            />
          </label>
          <button type="submit" className={styles.saveButton}>
            Guardar cambios
          </button>
        </form>
      </section>
    </div>
  );
}
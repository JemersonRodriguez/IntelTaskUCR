import { useState } from "react";
import styles from "./Usuarios.module.css";
import usuariosIcon from "../assets/svg/usuarios.svg";
import Swal from "sweetalert2";

export default function Usuarios() {
  const [form, setForm] = useState({
    CN_Id_Usuario: "",
    CT_Nombre_usuario: "",
    CT_Correo_usuario: "",
    CF_Fecha_nacimiento: "",
    CT_Contrasenna: "",
    CB_Estado_usuario: true,
    CN_Id_rol: "",
  });
  const [loading, setLoading] = useState(false);

  // Solo permite números y máximo 9 caracteres en cédula
  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 9);
    setForm((prev) => ({
      ...prev,
      CN_Id_Usuario: value,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación de cédula
    if (
      !form.CN_Id_Usuario ||
      form.CN_Id_Usuario.length !== 9 ||
      !form.CT_Nombre_usuario ||
      !form.CT_Correo_usuario ||
      !form.CF_Fecha_nacimiento ||
      !form.CT_Contrasenna ||
      !form.CN_Id_rol
    ) {
      Swal.fire({
        icon: "warning",
        title: "La cédula debe tener exactamente 9 dígitos y todos los campos son obligatorios",
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }
    setLoading(true);
    const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    try {
      const res = await fetch("https://localhost:7293/api/Usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          CN_Id_Usuario: Number(form.CN_Id_Usuario),
          CN_Id_rol: Number(form.CN_Id_rol),
        }),
      });
      if (!res.ok) throw new Error("No se pudo crear el usuario");
      Swal.fire({
        icon: "success",
        title: "Usuario creado correctamente",
        timer: 1800,
        showConfirmButton: false,
      });
      setForm({
        CN_Id_Usuario: "",
        CT_Nombre_usuario: "",
        CT_Correo_usuario: "",
        CF_Fecha_nacimiento: "",
        CT_Contrasenna: "",
        CB_Estado_usuario: true,
        CN_Id_rol: "",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al crear el usuario",
        timer: 1800,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.usuariosWrapper}>
      <section className={styles.usuariosContainer}>
        <div className={styles.header}>
          <img src={usuariosIcon} alt="Usuarios" className={styles.icon} />
          <h2 className={styles.title}>Agregar Nuevos Usuarios</h2>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Cédula (ID)
            <input
              className={styles.input}
              name="CN_Id_Usuario"
              type="text"
              inputMode="numeric"
              pattern="\d{9}"
              maxLength={9}
              minLength={9}
              value={form.CN_Id_Usuario}
              onChange={handleCedulaChange}
              required
              autoComplete="off"
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d+$/.test(paste)) e.preventDefault();
              }}
            />
          </label>
          <label className={styles.label}>
            Nombre
            <input
              className={styles.input}
              name="CT_Nombre_usuario"
              value={form.CT_Nombre_usuario}
              onChange={handleChange}
              required
            />
          </label>
          <label className={styles.label}>
            Correo electrónico
            <input
              className={styles.input}
              name="CT_Correo_usuario"
              type="email"
              value={form.CT_Correo_usuario}
              onChange={handleChange}
              required
            />
          </label>
          <label className={styles.label}>
            Fecha de nacimiento
            <input
              className={styles.input}
              name="CF_Fecha_nacimiento"
              type="date"
              value={form.CF_Fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </label>
          <label className={styles.label}>
            Contraseña
            <input
              className={styles.input}
              name="CT_Contrasenna"
              type="password"
              value={form.CT_Contrasenna}
              onChange={handleChange}
              required
            />
          </label>
          <label className={styles.label}>
            Rol (ID)
            <input
              className={styles.input}
              name="CN_Id_rol"
              type="number"
              value={form.CN_Id_rol}
              onChange={handleChange}
              required
            />
          </label>
          <label className={styles.labelCheck}>
            <input
              type="checkbox"
              name="CB_Estado_usuario"
              checked={form.CB_Estado_usuario}
              onChange={handleChange}
            />
            Usuario activo
          </label>
          <button type="submit" className={styles.saveButton} disabled={loading}>
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </form>
      </section>
    </div>
  );
}
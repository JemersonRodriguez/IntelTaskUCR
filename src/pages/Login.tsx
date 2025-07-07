import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useRef } from "react";
import Swal from "sweetalert2";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const correoRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const correo = correoRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    try {
      const response = await fetch("https://localhost:7293/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: correo,
          contrasenna: password,
        }),
      });

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Credenciales incorrectas",
          text: "El correo o la contraseña no son válidos.",
        });
        return;
      }

      const data = await response.json();

      document.cookie = `token=${data.token}; path=/; SameSite=Strict`;

      login({
        token: data.token,
        usuario: {
          id: data.usuario.cN_Id_usuario,
          nombre: data.usuario.cT_Nombre_usuario,
          email: data.usuario.cT_Correo_usuario,
          rol: {
            id: data.usuario.rol.cN_Id_rol,
            nombre: data.usuario.rol.cT_Nombre_rol,
          },
        },
      });

      navigate("/task");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
      });
    }
  };

  return (
    <section className={styles.section_general}>
      <h1>Intel Task Poder Judicial</h1>
      <img src="./icon_white.png" alt="" className={styles.logo} />
      <form className={styles.content} onSubmit={handleLogin}>
        <label htmlFor="correo">Correo</label>
        <input
          className={styles.input}
          id="correo"
          name="correo"
          type="email"
          placeholder="user@example.com"
          required
          ref={correoRef}
        />

        <label htmlFor="password">Contraseña</label>
        <input
          className={styles.input}
          id="password"
          name="password"
          type="password"
          required
          ref={passwordRef}
        />
        <button className={styles.boton} type="submit">
          Ingresar
        </button>
      </form>
    </section>
  );
};

export default LoginPage;
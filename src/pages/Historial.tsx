import { useEffect, useState } from "react";
import Task_Target from "../components/common/Task_Target";
import styles from "./Task.module.css";
import historialIcon from "../assets/svg/historial.svg";

interface Tarea {
  id: number;
  titulo: string;
  estado: string;
  estadoId: number;
  prioridad: string;
  prioridadId: number;
  complejidadId: number;
  fechaLimite: string;
  usuarioAsignado: string;
  usuarioAsignadoId?: number | null;
  usuarioCreadorId?: number | null;
  origen?: number | null;
  adjuntos: number;
  descripcion?: string;
}

export default function Historial() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtro, setFiltro] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    fetch("https://localhost:7293/api/Tareas/finalizadas/usuario", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data: any[]) =>
        setTareas(
          data.map((t) => ({
            id: t.cN_Id_tarea,
            titulo: t.cT_Titulo_tarea,
            estado: t.estado?.cT_Estado || "Sin estado",
            estadoId: t.estado?.cN_Id_estado || 0,
            prioridad: t.prioridad?.cT_Descripcion_prioridad || "Sin prioridad",
            prioridadId: t.prioridad?.cN_Id_prioridad || 0,
            complejidadId: t.complejidad?.cN_Id_complejidad || 0,
            fechaLimite: t.cF_Fecha_limite?.split("T")[0] || "",
            usuarioAsignado: t.usuarioAsignado?.cT_Nombre_usuario || "Sin asignar",
            usuarioAsignadoId: t.usuarioAsignado?.cN_Id_usuario
              ? Number(t.usuarioAsignado.cN_Id_usuario)
              : null,
            usuarioCreadorId: t.usuarioCreador?.cN_Id_usuario
              ? Number(t.usuarioCreador.cN_Id_usuario)
              : null,
            origen: t.cN_Tarea_origen,
            adjuntos: 0,
            descripcion: t.cT_Descripcion_tarea,
          }))
        )
      );
  }, []);

  const tareasFiltradas = tareas.filter((t) => {
    const coincideTexto =
      (t.titulo?.toLowerCase() ?? "").includes(filtro.toLowerCase()) ||
      (t.descripcion?.toLowerCase() ?? "").includes(filtro.toLowerCase());
    const fecha = t.fechaLimite || "";
    const enRango =
      (!fechaInicio || fecha >= fechaInicio) &&
      (!fechaFin || fecha <= fechaFin);
    return coincideTexto && enRango;
  });

  return (
    <section className={styles.taskPage}>
      <header>
        <h1 className={styles.title}>Historial de tareas finalizadas</h1>
        <img
          src={historialIcon}
          alt="Historial"
          className={styles.icon}
          style={{
            width: 42,
            height: 42,
            filter: "brightness(0) invert(1)",
            marginBottom: 2,
          }}
        />
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <input
            className={styles.input}
            type="text"
            placeholder="Buscar por título o descripción..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <input
            className={styles.input}
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            title="Fecha inicio"
          />
          <input
            className={styles.input}
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            title="Fecha fin"
          />
        </div>
      </header>
      <main className={styles.container_cards}>
        {tareasFiltradas.length === 0 ? (
          <span style={{ color: "#fff", fontSize: "1.2rem" }}>
            No hay tareas finalizadas que coincidan.
          </span>
        ) : (
          tareasFiltradas.map((tarea) => (
            <Task_Target
              key={tarea.id}
              tarea={tarea}
              modoHistorial
            />
          ))
        )}
      </main>
    </section>
  );
}
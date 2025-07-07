import { useEffect, useState } from "react";
import Task_Target from "../components/common/Task_Target";
import styles from "./Task.module.css";
import taskIcon from "/task.png";

interface Complejidad {
  cN_Id_complejidad: number;
  cT_Nombre: string;
}
interface Prioridad {
  cN_Id_prioridad: number;
  cT_Descripcion_prioridad: string;
}

interface Tarea {
  id: number;
  titulo: string;
  estado: string;
  estadoId: number;
  prioridad: string;
  prioridadId: number;      // <-- Agrega esto
  complejidadId: number;    // <-- Agrega esto
  fechaLimite: string;
  usuarioAsignado: string;
  usuarioAsignadoId?: number | null;
  usuarioCreadorId?: number | null;
  origen?: number | null;
  adjuntos: number;
  descripcion?: string;
}

export default function Task() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    complejidad: "",
    prioridad: "",
    numeroGIS: "",
    fechaLimite: "",
  });
  const [creating, setCreating] = useState(false);

  const [complejidades, setComplejidades] = useState<Complejidad[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);

  useEffect(() => {
    fetchTareas();
    fetchComplejidades();
    fetchPrioridades();
  }, []);

  function fetchTareas() {
    setLoading(true);
    const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    fetch("https://localhost:7293/api/Tareas/activas/usuario", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then((data) => {
        const tareasAdaptadas: Tarea[] = data.map((t: any) => ({
          id: t.cN_Id_tarea,
          titulo: t.cT_Titulo_tarea,
          estado: t.estado?.cT_Estado || "Sin estado",
          estadoId: t.estado?.cN_Id_estado || 0,
          prioridad: t.prioridad?.cT_Descripcion_prioridad || "Sin prioridad",
          prioridadId: t.prioridad?.cN_Id_prioridad || 0,         // <-- Agrega esto
          complejidadId: t.complejidad?.cN_Id_complejidad || 0,   // <-- Agrega esto
          fechaLimite: t.cF_Fecha_limite?.split("T")[0] || "",
          usuarioAsignado:
            t.usuarioAsignado?.cT_Nombre_usuario || "Sin asignar",
          usuarioAsignadoId: t.usuarioAsignado?.cN_Id_usuario
            ? Number(t.usuarioAsignado.cN_Id_usuario)
            : null,
          usuarioCreadorId: t.usuarioCreador?.cN_Id_usuario
            ? Number(t.usuarioCreador.cN_Id_usuario)
            : null,
          origen: t.cN_Tarea_origen,
          adjuntos: 0,
          descripcion: t.cT_Descripcion_tarea,
        }));
        setTareas(tareasAdaptadas);
      })
      .catch(() => setTareas([]))
      .finally(() => setLoading(false));
  }

  function fetchComplejidades() {
    fetch("https://localhost:7293/api/Complejidades")
      .then((res) => res.json())
      .then((data) => {
        setComplejidades(data);
        console.log(data);
      })
      .catch(() => setComplejidades([]));
  }
  function fetchPrioridades() {
    fetch("https://localhost:7293/api/Prioridades")
      .then((res) => res.json())
      .then((data) => {
        setPrioridades(data);
        console.log(data);
      })
      .catch(() => setPrioridades([]));
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    const body = {
      CT_Titulo_tarea: form.titulo,
      CT_Descripcion_tarea: form.descripcion,
      CN_Id_complejidad: Number(form.complejidad),
      CN_Id_estado: 1, // Estado por defecto (no editable)
      CN_Id_prioridad: Number(form.prioridad),
      CN_Numero_GIS: form.numeroGIS || null,
      CF_Fecha_limite: form.fechaLimite,
    };

    try {
      const res = await fetch("https://localhost:7293/api/Tareas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al crear tarea");
      setShowModal(false);
      setForm({
        titulo: "",
        descripcion: "",
        complejidad: "",
        prioridad: "",
        numeroGIS: "",
        fechaLimite: "",
      });
      fetchTareas();
    } catch {
      alert("Error al crear la tarea");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className={styles.taskPage}>
      <header>
        <h1 className={styles.title}>Mis Tareas</h1>
        <img src={taskIcon} alt="Icono" className={styles.icon} />
        <button className={styles.addButton} onClick={() => setShowModal(true)}>
          + Nueva tarea
        </button>
      </header>

      <main className={styles.container_cards}>
        {loading ? (
          <span style={{ color: "#fff", fontSize: "1.2rem" }}>
            Cargando tareas...
          </span>
        ) : tareas.length === 0 ? (
          <span style={{ color: "#fff", fontSize: "1.2rem" }}>
            No tienes tareas asignadas.
          </span>
        ) : (
          tareas.map((tarea) => (
            <Task_Target
              key={tarea.id}
              tarea={tarea}
              onEstadoCambiado={fetchTareas}
            />
          ))
        )}
      </main>

      {/* Modal para crear tarea */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <form
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
          >
            <h2>Nueva tarea</h2>
            <label>
              Título*
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </label>
            <label>
              Descripción*
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </label>
            <label>
              Complejidad*
              <select
                name="complejidad"
                value={form.complejidad}
                onChange={handleInputChange}
                required
                className={styles.input}
              >
                <option value="">Seleccione</option>
                {complejidades.map((c) => (
                  <option
                    key={c.cN_Id_complejidad}
                    value={String(c.cN_Id_complejidad)}
                  >
                    {c.cT_Nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prioridad*
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleInputChange}
                required
                className={styles.input}
              >
                <option value="">Seleccione</option>
                {prioridades.map((p) => (
                  <option
                    key={p.cN_Id_prioridad}
                    value={String(p.cN_Id_prioridad)}
                  >
                    {p.cT_Descripcion_prioridad}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Número GIS
              <input
                name="numeroGIS"
                value={form.numeroGIS}
                onChange={handleInputChange}
                className={styles.input}
              />
            </label>
            <label>
              Fecha límite*
              <input
                type="date"
                name="fechaLimite"
                value={form.fechaLimite}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </label>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                type="submit"
                className={styles.detailButton}
                disabled={creating}
              >
                {creating ? "Creando..." : "Crear tarea"}
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
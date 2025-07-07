import { useEffect, useState } from "react";
import Task_Target from "../components/common/Task_Target";
import styles from "./SubTask.module.css";
import subTaskIcon from "../assets/svg/sub_task.svg";

interface Complejidad {
  CN_Id_complejidad: number;
  CT_Nombre: string;
}
interface Prioridad {
  CN_Id_prioridad: number;
  CT_Descripcion_prioridad: string;
}

interface Tarea {
  id: number;
  titulo: string;
  estado: string;
  estadoId: number;
  prioridad: string;
  fechaLimite: string;
  usuarioAsignado: string;
  usuarioAsignadoId?: number | null;
  usuarioCreadorId?: number | null;
  origen?: number | null;
  adjuntos: number;
  descripcion?: string;
}

export default function SubTask() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    descripcionEspera: "",
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

    fetch("https://localhost:7293/api/tareas/subtareas/usuario", {
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
      .then((data) => setComplejidades(data))
      .catch(() => setComplejidades([]));
  }
  function fetchPrioridades() {
    fetch("https://localhost:7293/api/Prioridades")
      .then((res) => res.json())
      .then((data) => setPrioridades(data))
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
      CT_Descripcion_espera: form.descripcionEspera || null,
      CN_Id_complejidad: Number(form.complejidad),
      CN_Id_estado: 1,
      CN_Id_prioridad: Number(form.prioridad),
      CN_Numero_GIS: form.numeroGIS || null,
      CF_Fecha_limite: form.fechaLimite,
      CN_Tarea_origen: 1, // Aquí deberías poner el id de la tarea origen si aplica
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
      if (!res.ok) throw new Error("Error al crear subtarea");
      setShowModal(false);
      setForm({
        titulo: "",
        descripcion: "",
        descripcionEspera: "",
        complejidad: "",
        prioridad: "",
        numeroGIS: "",
        fechaLimite: "",
      });
      fetchTareas();
    } catch {
      alert("Error al crear la subtarea");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className={styles.taskPage}>
      <header>
        <h1 className={styles.title}>SubTareas</h1>
        <img
          src={subTaskIcon}
          alt="Icono"
          className={styles.icon}
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </header>

      <main className={styles.container_cards}>
        {loading ? (
          <span style={{ color: "#fff", fontSize: "1.2rem" }}>
            Cargando subtareas...
          </span>
        ) : tareas.length === 0 ? (
          <span style={{ color: "#fff", fontSize: "1.2rem" }}>
            No tienes subtareas asignadas.
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

      {/* Modal para crear subtarea */}
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
            <h2>Nueva subtarea</h2>
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
              Descripción de espera
              <textarea
                name="descripcionEspera"
                value={form.descripcionEspera}
                onChange={handleInputChange}
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
                  <option key={c.CN_Id_complejidad} value={c.CN_Id_complejidad}>
                    {c.CT_Nombre}
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
                  <option key={p.CN_Id_prioridad} value={p.CN_Id_prioridad}>
                    {p.CT_Descripcion_prioridad}
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
                {creating ? "Creando..." : "Crear subtarea"}
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

import { useState, useRef } from "react";
import styles from "./Task_Target.module.css";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
// Asegúrate de que la ruta sea correcta y que TareaSeguimientoDTO esté importada
import { tareasService, type EstadoActualizarDTO, type TareaCrearDTO, type TareaSeguimientoDTO } from "../../services/apiService";

const estadoColors: Record<string, string> = {
  Registrada: "#1976d2",
  "En proceso": "#ffa726",
  Finalizada: "#43a047",
  Asignada: "#8e24aa",
  "En espera": "#fbc02d",
  "En revisión": "#0288d1",
  Rechazada: "#e53935",
  Terminado: "#43a047",
  Incumplimiento: "#b71c1c",
  "Sin estado": "#757575",
};

interface Usuario {
  cN_Id_usuario: number;
  cT_Nombre_usuario: string;
  cT_Correo_usuario?: string;
  rol?: {
    cN_Id_rol: number;
    cT_Nombre_rol: string;
    cN_Jerarquia: number;
  };
}

interface TareaProps {
  tarea: {
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
  };
  onEstadoCambiado?: () => void;
  modoHistorial?: boolean;
}

export default function Task_Target({ tarea, onEstadoCambiado, modoHistorial }: TareaProps) {
  const [showModal, setShowModal] = useState(false);
  const [showAsignar, setShowAsignar] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [asignando, setAsignando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  // Modal para motivo de espera
  const [showMotivoEspera, setShowMotivoEspera] = useState(false);
  const [motivoEspera, setMotivoEspera] = useState("");

  // Modal para justificación de incumplimiento
  const [showJustificacionIncumplimiento, setShowJustificacionIncumplimiento] = useState(false);
  const [justificacionIncumplimiento, setJustificacionIncumplimiento] = useState("");

  // Modal para descripción de rechazo (ESTADO 6)
  const [showDescripcionRechazo, setShowDescripcionRechazo] = useState(false);
  const [descripcionRechazo, setDescripcionRechazo] = useState("");

  // Modal para reasignar tarea desde incumplimiento
  const [showReasignarModal, setShowReasignarModal] = useState(false);
  const [nuevaFechaLimite, setNuevaFechaLimite] = useState("");

  // Subir archivo
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal para dividir en subtareas
  const [showSubModal, setShowSubModal] = useState(false);
  const [numSubtareas, setNumSubtareas] = useState(2);
  const [subtareas, setSubtareas] = useState<{ titulo: string; descripcion: string }[]>(
    [
      { titulo: "", descripcion: "" },
      { titulo: "", descripcion: "" }
    ]
  );
  const [submittingSubs, setSubmittingSubs] = useState(false);

  // Estado para el modal de Seguimiento
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [seguimientoComentario, setSeguimientoComentario] = useState("");
  const [enviandoSeguimiento, setEnviandoSeguimiento] = useState(false);

  // Estado para almacenar los seguimientos de la tarea
  const [seguimientos, setSeguimientos] = useState<TareaSeguimientoDTO[]>([]);
  const [cargandoSeguimientos, setCargandoSeguimientos] = useState(false);


  const { user } = useAuth();

  const {
    id,
    titulo,
    estado,
    estadoId,
    prioridad,
    fechaLimite,
    usuarioAsignado,
    usuarioAsignadoId,
    usuarioCreadorId,
    origen,
    adjuntos,
    descripcion,
  } = tarea;

  const userId = user?.usuario?.id ? Number(user.usuario.id) : null;

  const esCreador = userId !== null && usuarioCreadorId === userId;
  const esAsignado = userId !== null && usuarioAsignadoId === userId;

  const puedeAsignar = usuarioAsignado === "Sin asignar" && estadoId === 1;
  const puedeEditarEliminar = esCreador && estadoId === 1;

  // Permitir subir archivos y dividir solo si está en estado Registrada o Asignada
  const puedeSubirArchivo = estado === "Registrada" || estado === "Asignada";
  // Permitir dividir solo si está en estado Registrada o Asignada Y NO está asignada
  const puedeDividir =
    (estado === "Registrada" || estado === "Asignada") &&
    (!usuarioAsignadoId || usuarioAsignado === "Sin asignar");

  // Lógica para mostrar el botón de Reasignar
  // Se puede reasignar si la tarea está en estado "Incumplimiento" O "Rechazada" y el usuario actual es el creador.
  const puedeReasignar = esCreador && (estado === "Incumplimiento" || estado === "Rechazada");

  // Lógica para mostrar el botón de Seguimiento
  // Solo el creador y si la tarea está en "En proceso" (3) o "En espera" (4)
  const puedeAgregarSeguimiento = esCreador && [3, 4].includes(estadoId);


  // ACCIONES PARA EL USUARIO ASIGNADO
  const accionesAsignado: {
    label: string;
    nextEstado: number;
    requiereMotivo?: boolean;
  }[] = [];
  if (esAsignado) {
    if ([1, 2].includes(estadoId)) {
      accionesAsignado.push({ label: "Marcar como En proceso", nextEstado: 3 });
    }
    if (estadoId === 3) {
      accionesAsignado.push({
        label: "Poner en espera",
        nextEstado: 4,
        requiereMotivo: true,
      });
      accionesAsignado.push({ label: "Enviar a revisión", nextEstado: 5 });
    }
    if (estadoId === 4) {
      accionesAsignado.push({ label: "Reanudar", nextEstado: 3 });
    }
  }

  // ACCIONES PARA EL USUARIO CREADOR/ASIGNADOR EN REVISIÓN
  const accionesCreador: {
    label: string;
    nextEstado: number;
    requiereJustificacion?: boolean;
    requiereRechazoDesc?: boolean; // Nuevo: para la descripción de rechazo
  }[] = [];
  if (esCreador && estadoId === 5) {
    accionesCreador.push({ label: "Rechazar", nextEstado: 6, requiereRechazoDesc: true }); // AHORA PIDE DESCRIPCIÓN
    accionesCreador.push({ label: "Terminar", nextEstado: 7 });
    accionesCreador.push({
      label: "Incumplimiento",
      nextEstado: 9,
      requiereJustificacion: true,
    });
  }

  const fetchSubordinados = async () => {
    try {
      const data = await tareasService.getSubordinados();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar subordinados:", error);
      setUsuarios([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los subordinados. Asegúrate de tener subordinados en tu jerarquía.",
      });
    }
  };

  const abrirModalAsignar = async () => {
    setShowAsignar(true);
    setUsuarioSeleccionado("");
    await fetchSubordinados();
  };

  const abrirModalReasignar = async () => {
    setShowReasignarModal(true);
    setUsuarioSeleccionado("");
    setNuevaFechaLimite("");
    await fetchSubordinados();
  };

  const handleAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;
    setAsignando(true);
    try {
      await tareasService.asignarTarea(id, Number(usuarioSeleccionado));
      setShowAsignar(false);
      if (onEstadoCambiado) onEstadoCambiado();
      Swal.fire({
        icon: "success",
        title: "Tarea asignada",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error al asignar la tarea: ${(error as Error).message || "Desconocido"}`,
      });
    } finally {
      setAsignando(false);
    }
  };

  const handleActualizar = () => {
    Swal.fire("Funcionalidad de actualizar pendiente de implementar.");
  };
  const handleEliminar = () => {
    Swal.fire("Funcionalidad de eliminar pendiente de implementar.");
  };

  const handleCambiarEstado = async (
    nuevoEstado: number,
    motivoAdicional?: string,
    descripcionRechazoParam?: string,
    justificacionIncumplimientoParam?: string
  ) => {
    setCambiandoEstado(true);
    const body: EstadoActualizarDTO = { CN_Id_estado: nuevoEstado };

    if (nuevoEstado === 4 && motivoAdicional) {
      body.MotivoEspera = motivoAdicional;
    } else if (nuevoEstado === 6 && descripcionRechazoParam) {
      body.DescripcionRechazo = descripcionRechazoParam;
    } else if (nuevoEstado === 9 && justificacionIncumplimientoParam) {
      body.JustificacionIncumplimiento = justificacionIncumplimientoParam;
    }

    try {
      await tareasService.cambiarEstadoTarea(id, body);
      setShowMotivoEspera(false);
      setMotivoEspera("");
      setShowJustificacionIncumplimiento(false);
      setJustificacionIncumplimiento("");
      setShowDescripcionRechazo(false);
      setDescripcionRechazo("");
      Swal.fire({
        icon: "success",
        title: "¡Estado actualizado!",
        text: "El estado de la tarea se cambió correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
      if (onEstadoCambiado) onEstadoCambiado();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error al cambiar el estado de la tarea: ${(error as Error).message || "Desconocido"}`,
      });
    } finally {
      setCambiandoEstado(false);
    }
  };

  const abrirModalMotivoEspera = () => {
    setMotivoEspera("");
    setShowMotivoEspera(true);
  };

  const enviarMotivoEspera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoEspera.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Debe indicar una descripción de espera para el estado 'En espera'.",
      });
      return;
    }
    handleCambiarEstado(4, motivoEspera);
  };

  const abrirModalJustificacionIncumplimiento = () => {
    setJustificacionIncumplimiento("");
    setShowJustificacionIncumplimiento(true);
  };

  const enviarJustificacionIncumplimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificacionIncumplimiento.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Debe indicar una justificación para el estado 'Incumplimiento'.",
      });
      return;
    }
    handleCambiarEstado(9, undefined, undefined, justificacionIncumplimiento);
  };

  const abrirModalDescripcionRechazo = () => {
    setDescripcionRechazo("");
    setShowDescripcionRechazo(true);
  };

  const enviarDescripcionRechazo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcionRechazo.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Debe indicar una descripción para el estado 'Rechazada'.",
      });
      return;
    }
    handleCambiarEstado(6, undefined, descripcionRechazo);
  };

  const handleReasignarDesdeIncumplimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado || !nuevaFechaLimite) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Debe seleccionar un usuario y una nueva fecha límite.",
      });
      return;
    }
    setCambiandoEstado(true);
    const formattedDate = new Date(nuevaFechaLimite).toISOString();

    const body: EstadoActualizarDTO = {
      CN_Id_estado: 2,
      CN_Id_usuario_asignado: Number(usuarioSeleccionado),
      CF_Fecha_limite: formattedDate,
    };
    try {
      await tareasService.cambiarEstadoTarea(id, body);
      setShowReasignarModal(false);
      setUsuarioSeleccionado("");
      setNuevaFechaLimite("");
      Swal.fire({
        icon: "success",
        title: "Tarea reasignada",
        timer: 1500,
        showConfirmButton: false,
      });
      if (onEstadoCambiado) onEstadoCambiado();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error al reasignar la tarea: ${error.message || ""}`,
      });
    } finally {
      setCambiandoEstado(false);
    }
  };

  // --- SUBIR ARCHIVO ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tareaId", String(id));
    try {
      const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
      const res = await fetch("https://localhost:7293/api/Tareas/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Error al subir archivo");
      Swal.fire({
        icon: "success",
        title: "Archivo subido",
        timer: 1500,
        showConfirmButton: false,
      });
      if (onEstadoCambiado) onEstadoCambiado();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo subir el archivo: ${(error as Error).message || "Desconocido"}`,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- DIVIDIR EN SUBTAREAS ---
  const handleNumSubtareasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Math.max(2, Math.min(10, Number(e.target.value) || 2));
    setNumSubtareas(n);
    setSubtareas(
      Array.from(
        { length: n },
        (_, i) => subtareas[i] || { titulo: "", descripcion: "" }
      )
    );
  };

  const handleSubtareaChange = (
    idx: number,
    field: "titulo" | "descripcion",
    value: string
  ) => {
    setSubtareas((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const handleCrearSubtareas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSubs(true);
    try {
      await Promise.all(
        subtareas.map(async (s) => {
          const newSubtask: TareaCrearDTO = {
            CT_Titulo_tarea: s.titulo,
            CT_Descripcion_tarea: s.descripcion,
            CN_Tarea_origen: id,
            CN_Id_complejidad: tarea.complejidadId,
            CN_Id_estado: 1, // Estado inicial "Registrada"
            CN_Id_prioridad: tarea.prioridadId,
            CF_Fecha_limite: tarea.fechaLimite,
          };
          await tareasService.createTarea(newSubtask);
        })
      );

      Swal.fire({
        icon: "success",
        title: "Subtareas creadas exitosamente",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowSubModal(false);
      if (onEstadoCambiado) onEstadoCambiado();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudieron crear las subtareas: ${(error as Error).message || "Desconocido"}`,
      });
    } finally {
      setSubmittingSubs(false);
    }
  };

  const abrirModalSeguimiento = () => {
    setSeguimientoComentario("");
    setShowSeguimientoModal(true);
  };

  const enviarSeguimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seguimientoComentario.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Debe ingresar un comentario para el seguimiento.",
      });
      return;
    }
    setEnviandoSeguimiento(true);
    try {
      await tareasService.addSeguimiento(id, seguimientoComentario);
      setShowSeguimientoModal(false);
      setSeguimientoComentario("");
      Swal.fire({
        icon: "success",
        title: "Seguimiento añadido",
        timer: 1500,
        showConfirmButton: false,
      });
      if (onEstadoCambiado) onEstadoCambiado(); // Recargar si es necesario
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error al añadir seguimiento: ${(error as Error).message || "Desconocido"}`,
      });
    } finally {
      setEnviandoSeguimiento(false);
    }
  };

  // NUEVA FUNCIÓN: Cargar seguimientos cuando se abre el modal de detalles
  const handleVerMas = async () => {
    setShowModal(true);
    setCargandoSeguimientos(true);
    try {
      const data = await tareasService.getSeguimientosByTareaId(id);
      setSeguimientos(data);
    } catch (error) {
      console.error("Error al cargar seguimientos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudieron cargar los seguimientos: ${(error as Error).message || "Desconocido"}`,
      });
      setSeguimientos([]); // Limpiar si hay error
    } finally {
      setCargandoSeguimientos(false);
    }
  };


  return (
    <>
      <div className={styles.taskCard}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span
            className={styles.estadoLabel}
            style={{
              background: estadoColors[estado] || "#757575",
              color: "#fff",
              padding: "0.2em 0.8em",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {estado}
          </span>
          <h3 className={styles.taskTitle} style={{ margin: 0 }}>
            {titulo}
          </h3>
        </div>
        <p className={styles.meta}>
          <strong>Prioridad:</strong> {prioridad}
        </p>
        <p>
          <strong>Asignado a:</strong> {usuarioAsignado}
        </p>
        <p>
          <strong>Fecha límite:</strong> {fechaLimite}
        </p>
        {origen && <p className={styles.subtask}>Subtarea de ID: {origen}</p>}
        {adjuntos > 0 && (
          <p className={styles.attachments}>📎 {adjuntos} archivo(s)</p>
        )}

        <button
          className={styles.detailButton}
          onClick={handleVerMas} 
        >
          Ver más
        </button>

        {/* Solo muestra los botones si NO es modo historial */}
        {!modoHistorial && (
          <>
            {puedeAsignar && (
              <button
                className={styles.asignarButton}
                onClick={abrirModalAsignar}
                style={{ marginLeft: 8, marginTop: 8 }}
              >
                Asignar
              </button>
            )}
            {puedeEditarEliminar && (
              <>
                <button
                  className={styles.updateButton}
                  onClick={handleActualizar}
                  style={{ marginLeft: 8, marginTop: 8 }}
                >
                  Actualizar
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={handleEliminar}
                  style={{ marginLeft: 8, marginTop: 8 }}
                >
                  Eliminar
                </button>
              </>
            )}
            {/* Botón de Reasignar para tareas en Incumplimiento o Rechazada */}
            {puedeReasignar && (
              <button
                className={styles.asignarButton}
                onClick={abrirModalReasignar}
                style={{ marginLeft: 8, marginTop: 8 }}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado ? "Cargando..." : "Reasignar"}
              </button>
            )}

            {/* Botones de cambio de estado para el usuario asignado */}
            {accionesAsignado.map((accion) =>
              accion.requiereMotivo ? (
                <button
                  key={accion.label}
                  className={styles.updateButton}
                  onClick={abrirModalMotivoEspera}
                  style={{ marginLeft: 8, marginTop: 8 }}
                  disabled={cambiandoEstado}
                >
                  {cambiandoEstado ? "Cambiando..." : accion.label}
                </button>
              ) : (
                <button
                  key={accion.label}
                  className={styles.updateButton}
                  onClick={() => handleCambiarEstado(accion.nextEstado)}
                  style={{ marginLeft: 8, marginTop: 8 }}
                  disabled={cambiandoEstado}
                >
                  {cambiandoEstado ? "Cambiando..." : accion.label}
                </button>
              )
            )}
            {/* Botones de cambio de estado para el creador/asignador en revisión */}
            {accionesCreador.map((accion) =>
              accion.requiereJustificacion ? (
                <button
                  key={accion.label}
                  className={styles.updateButton}
                  onClick={abrirModalJustificacionIncumplimiento}
                  style={{ marginLeft: 8, marginTop: 8 }}
                  disabled={cambiandoEstado}
                >
                  {cambiandoEstado ? "Cambiando..." : accion.label}
                </button>
              ) : accion.requiereRechazoDesc ? (
                <button
                  key={accion.label}
                  className={styles.updateButton}
                  onClick={abrirModalDescripcionRechazo}
                  style={{ marginLeft: 8, marginTop: 8 }}
                  disabled={cambiandoEstado}
                >
                  {cambiandoEstado ? "Cambiando..." : accion.label}
                </button>
              ) : (
                <button
                  key={accion.label}
                  className={styles.updateButton}
                  onClick={() => handleCambiarEstado(accion.nextEstado)}
                  style={{ marginLeft: 8, marginTop: 8 }}
                  disabled={cambiandoEstado}
                >
                  {cambiandoEstado ? "Cambiando..." : accion.label}
                </button>
              )
            )}
            {/* Botón para subir archivo */}
            {puedeSubirArchivo && (
              <>
                <button
                  className={styles.detailButton}
                  style={{ marginLeft: 8, marginTop: 8 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Subiendo..." : "Subir archivo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </>
            )}
            {/* Botón para dividir en subtareas */}
            {puedeDividir && (
              <button
                className={styles.detailButton}
                style={{ marginLeft: 8, marginTop: 8 }}
                onClick={() => setShowSubModal(true)}
              >
                Dividir en subtareas
              </button>
            )}
            {/* Botón para agregar seguimiento */}
            {puedeAgregarSeguimiento && (
              <button
                className={styles.detailButton}
                style={{ marginLeft: 8, marginTop: 8 }}
                onClick={abrirModalSeguimiento}
                disabled={enviandoSeguimiento}
              >
                {enviandoSeguimiento ? "Cargando..." : "Agregar Seguimiento"}
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{titulo}</h2>
            <p>
              <strong>Descripción:</strong>
            </p>
            <p>{descripcion || "Sin descripción disponible."}</p>
            <p>
              <strong>Estado:</strong> {estado}
            </p>
            <p>
              <strong>Prioridad:</strong> {prioridad}
            </p>
            <p>
              <strong>Fecha límite:</strong> {fechaLimite}
            </p>
            <p>
              <strong>Usuario asignado:</strong> {usuarioAsignado}
            </p>
            <p>
              <strong>Archivos:</strong> {adjuntos}
            </p>

            {/* Sección de Seguimientos */}
            <h3 style={{ marginTop: 20, marginBottom: 10 }}>Seguimientos</h3>
            {cargandoSeguimientos ? (
              <p>Cargando seguimientos...</p>
            ) : seguimientos.length === 0 ? (
              <p>No hay seguimientos registrados para esta tarea.</p>
            ) : (
              <ul className={styles.seguimientosList}>
                {seguimientos.map((s) => (
                  <li key={s.CN_Id_seguimiento} className={styles.seguimientoItem}>
                    <p>
                      <strong>Fecha:</strong>
                      
                      
                      {(() => {
                        const date = new Date(s.CF_Fecha_seguimiento);
                        return isNaN(date.getTime()) ? "Fecha inválida" : date.toLocaleString();
                      })()}
                    </p>
                    <p>{s.CT_Comentario}</p>
                  </li>
                ))}
              </ul>
            )}

            <button
              className={styles.closeButton}
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal para motivo de espera */}
      {showMotivoEspera && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowMotivoEspera(false)}
        >
          <form
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={enviarMotivoEspera}
          >
            <h2>Motivo de espera</h2>
            <textarea
              className={styles.input}
              value={motivoEspera}
              onChange={(e) => setMotivoEspera(e.target.value)}
              placeholder="Describe el motivo de la espera..."
              required
              rows={4}
              style={{ width: "100%", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                className={styles.detailButton}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado ? "Enviando..." : "Enviar"}
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowMotivoEspera(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal para justificación de incumplimiento */}
      {showJustificacionIncumplimiento && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowJustificacionIncumplimiento(false)}
        >
          <form
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={enviarJustificacionIncumplimiento}
          >
            <h2>Justificación de Incumplimiento</h2>
            <textarea
              className={styles.input}
              value={justificacionIncumplimiento}
              onChange={(e) => setJustificacionIncumplimiento(e.target.value)}
              placeholder="Describe la justificación del incumplimiento..."
              required
              rows={4}
              style={{ width: "100%", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                className={styles.detailButton}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado ? "Enviando..." : "Enviar"}
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowJustificacionIncumplimiento(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal para descripción de rechazo */}
      {showDescripcionRechazo && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDescripcionRechazo(false)}
        >
          <form
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={enviarDescripcionRechazo}
          >
            <h2>Descripción de Rechazo</h2>
            <textarea
              className={styles.input}
              value={descripcionRechazo}
              onChange={(e) => setDescripcionRechazo(e.target.value)}
              placeholder="Describe el motivo del rechazo..."
              required
              rows={4}
              style={{ width: "100%", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                className={styles.detailButton}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado ? "Enviando..." : "Enviar"}
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowDescripcionRechazo(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal para reasignar tarea desde incumplimiento */}
      {showReasignarModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowReasignarModal(false)}
        >
          <form
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleReasignarDesdeIncumplimiento}
          >
            <h2>Reasignar Tarea (Incumplimiento/Rechazada)</h2>
            <label>
              Selecciona nuevo usuario:
              <select
                className={styles.input}
                value={usuarioSeleccionado}
                onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                required
              >
                <option value="">Seleccione</option>
                {usuarios.length === 0 ? (
                  <option disabled>Cargando subordinados o no hay subordinados disponibles</option>
                ) : (
                  usuarios.map((u) => (
                    <option key={u.cN_Id_usuario} value={u.cN_Id_usuario}>
                      {u.cT_Nombre_usuario} - {u.rol?.cT_Nombre_rol}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label style={{ marginTop: 16, display: "block" }}>
              Nueva fecha límite:
              <input
                type="datetime-local"
                className={styles.input}
                value={nuevaFechaLimite}
                onChange={(e) => setNuevaFechaLimite(e.target.value)}
                required
              />
            </label>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                type="submit"
                className={styles.detailButton}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado ? "Reasignando..." : "Reasignar"}
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowReasignarModal(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal para asignar tarea */}
      {showAsignar && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAsignar(false)}
        >
          <form
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAsignar}
          >
            <h2>Asignar tarea</h2>
            <label>
              Selecciona un usuario:
              <select
                className={styles.input}
                value={usuarioSeleccionado}
                onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                required
              >
                <option value="">Seleccione</option>
                {usuarios.length === 0 ? (
                  <option disabled>Cargando subordinados o no hay subordinados disponibles</option>
                ) : (
                  usuarios.map((u) => (
                    <option key={u.cN_Id_usuario} value={u.cN_Id_usuario}>
                      {u.cT_Nombre_usuario} - {u.rol?.cT_Nombre_rol}
                    </option>
                  ))
                )}
              </select>
            </label>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                type="submit"
                className={styles.detailButton}
                disabled={asignando}
              >
                {asignando ? "Asignando..." : "Asignar"}
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowAsignar(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal para dividir en subtareas */}
      {showSubModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSubModal(false)}>
          <form
            className={styles.modalContent}
            style={{ maxWidth: 600, width: "95%" }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCrearSubtareas}
          >
            <h2 className={styles.modalTitle}>Dividir tarea en subtareas</h2>
            <label className={styles.modalLabel}>
              <span>¿Cuántas subtareas deseas crear?</span>
              <input
                type="number"
                min={2}
                max={10}
                value={numSubtareas}
                onChange={handleNumSubtareasChange}
                className={styles.input}
                required
              />
            </label>
            <div className={styles.subtasksGrid}>
              {subtareas.map((s, idx) => (
                <div key={idx} className={styles.subtaskBox}>
                  <div className={styles.subtaskHeader}>
                    <span className={styles.subtaskNumber}>Subtarea #{idx + 1}</span>
                  </div>
                  <label className={styles.modalLabel}>
                    <span>Título</span>
                    <input
                      type="text"
                      value={s.titulo}
                      onChange={(e) =>
                        handleSubtareaChange(idx, "titulo", e.target.value)
                      }
                      className={styles.input}
                      required
                      placeholder="Ejemplo: Diseñar interfaz de usuario"
                    />
                  </label>
                  <label className={styles.modalLabel}>
                    <span>Descripción</span>
                    <textarea
                      value={s.descripcion}
                      onChange={(e) =>
                        handleSubtareaChange(idx, "descripcion", e.target.value)
                      }
                      className={styles.input}
                      required
                      placeholder="Describe brevemente la subtarea"
                      rows={2}
                    />
                  </label>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                type="submit"
                className={styles.detailButton}
                disabled={submittingSubs}
              >
                {submittingSubs ? "Creando..." : "Crear subtareas"}
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowSubModal(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {showSeguimientoModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowSeguimientoModal(false)}
        >
          <form
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={enviarSeguimiento}
          >
            <h2>Agregar Seguimiento</h2>
            <textarea
              className={styles.input}
              value={seguimientoComentario}
              onChange={(e) => setSeguimientoComentario(e.target.value)}
              placeholder="Describe el seguimiento de la tarea..."
              required
              rows={4}
              style={{ width: "100%", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                className={styles.detailButton}
                disabled={enviandoSeguimiento}
              >
                {enviandoSeguimiento ? "Enviando..." : "Enviar Seguimiento"}
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowSeguimientoModal(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
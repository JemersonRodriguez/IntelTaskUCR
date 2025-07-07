// apiService.ts (Actualizado con endpoints revisados y nuevas funciones para reasignación y seguimiento)

// ------------------------------------------
// 1. Interfaces de DTOs (Data Transfer Objects)
// ------------------------------------------

export interface EstadoDTO {
  CN_Id_estado: number;
  CT_Estado: string;
  CT_Descripcion: string;
}

export interface ComplejidadDTO {
  CN_Id_complejidad: number;
  CT_Nombre: string;
}

export interface PrioridadDTO {
  CN_Id_prioridad: number;
  CT_Descripcion_prioridad: string;
}

export interface UsuarioDTO {
  cN_Id_usuario: number; // Coincide con la propiedad del backend
  cT_Nombre_usuario: string; // Coincide con la propiedad del backend
  cT_Correo_usuario?: string;
  rol?: {
    // Asumiendo que el rol también viene anidado
    cN_Id_rol: number;
    cT_Nombre_rol: string;
    cN_Jerarquia: number;
  };
}

export interface TareaDTO {
  CN_Id_tarea: number;
  CN_Tarea_origen?: number | null;
  CT_Titulo_tarea: string;
  CT_Descripcion_tarea?: string | null;
  CT_Descripcion_espera?: string | null;
  CN_Numero_GIS?: string | null;
  CF_Fecha_asignacion: string; // ISO 8601 string
  CF_Fecha_limite?: string | null; // ISO 8601 string
  CF_Fecha_finalizacion?: string | null; // ISO 8601 string
  Estado?: EstadoDTO | null;
  Complejidad?: ComplejidadDTO | null;
  Prioridad?: PrioridadDTO | null;
  UsuarioCreador?: UsuarioDTO | null;
  UsuarioAsignado?: UsuarioDTO | null;
}

export interface TareaCrearDTO {
  CN_Tarea_origen?: number | null;
  CT_Titulo_tarea: string;
  CT_Descripcion_tarea?: string | null;
  CN_Numero_GIS?: string | null;
  CF_Fecha_limite?: string | null;
  CN_Id_estado: number;
  CN_Id_complejidad: number;
  CN_Id_prioridad: number;
  CN_Id_usuario_asignado?: number | null;
}

export interface TareaActualizarDTO {
  CN_Tarea_origen?: number | null;
  CT_Titulo_tarea: string;
  CT_Descripcion_tarea?: string | null;
  CT_Descripcion_espera?: string | null;
  CN_Numero_GIS?: string | null;
  CF_Fecha_asignacion: string;
  CF_Fecha_limite?: string | null;
  CF_Fecha_finalizacion?: string | null;
  CN_Id_estado: number;
  CN_Id_complejidad: number;
  CN_Id_prioridad: number;
  CN_Id_usuario_creador: number;
  CN_Id_usuario_asignado?: number | null;
}

export interface EstadoActualizarDTO {
  CN_Id_estado: number;
  MotivoEspera?: string | null; // Para estado 'En espera' (4)
  DescripcionRechazo?: string | null; // Para estado 'Rechazada' (6)
  JustificacionIncumplimiento?: string | null; // Para estado 'Incumplida' (9)
  CN_Id_usuario_asignado?: number | null; // Para reasignar desde incumplimiento
  CF_Fecha_limite?: string | null; // Para reasignar desde incumplimiento
}

export interface SeguimientoCrearDTO {
  CT_Comentario: string;
}

// NUEVA INTERFAZ: DTO para recibir seguimientos
export interface TareaSeguimientoDTO {
  CN_Id_seguimiento: number;
  CN_Id_tarea: number;
  CT_Comentario: string;
  CF_Fecha_seguimiento: string; // ISO 8601 string
}

// ------------------------------------------
// 2. Configuración de la API y Funciones de Utilidad
// ------------------------------------------

const API_BASE_URL = "https://localhost:7293/api/Tareas"; // Base para endpoints de Tareas
const API_BASE_URL_USERS = "https://localhost:7293/api/Usuario"; // Base para endpoints de Usuario (corregido a singular)
const API_BASE_URL_COMPLEJIDADES = "https://localhost:7293/api/Complejidades";
const API_BASE_URL_ESTADOS = "https://localhost:7293/api/Estados";
const API_BASE_URL_PRIORIDADES = "https://localhost:7293/api/Prioridades";

// Función para obtener el token de autorización (ejemplo)
const getAuthToken = (): string | null => {
  const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
};

const requestOptions = (method: string, body?: any) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };
};

// ------------------------------------------
// 3. Funciones de Servicio para Endpoints
// ------------------------------------------

export const tareasService = {
  // GET /api/Tareas
  getAllTareas: async (): Promise<TareaDTO[]> => {
    const response = await fetch(API_BASE_URL, requestOptions("GET"));
    if (!response.ok) {
      throw new Error(
        `Error al obtener todas las tareas: ${response.statusText}`
      );
    }
    return response.json();
  },

  // GET /api/Tareas/{id}
  getTareaById: async (id: number): Promise<TareaDTO> => {
    const response = await fetch(
      `${API_BASE_URL}/${id}`,
      requestOptions("GET")
    );
    if (!response.ok) {
      throw new Error(
        `Error al obtener tarea por ID ${id}: ${response.statusText}`
      );
    }
    return response.json();
  },

  // GET /api/Tareas/activas/usuario
  getTareasActivasDelUsuarioAutenticado: async (): Promise<TareaDTO[]> => {
    const response = await fetch(
      `${API_BASE_URL}/activas/usuario`,
      requestOptions("GET")
    );
    if (!response.ok) {
      throw new Error(
        `Error al obtener tareas activas del usuario: ${response.statusText}`
      );
    }
    return response.json();
  },

  // GET /api/Tareas/finalizadas/usuario
  getTareasFinalizadasDelUsuarioAutenticado: async (): Promise<TareaDTO[]> => {
    const response = await fetch(
      `${API_BASE_URL}/finalizadas/usuario`,
      requestOptions("GET")
    );
    if (!response.ok) {
      throw new Error(
        `Error al obtener tareas finalizadas del usuario: ${response.statusText}`
      );
    }
    return response.json();
  },

  // GET /api/Tareas/usuario
  getTareasDelUsuarioAutenticado: async (): Promise<TareaDTO[]> => {
    const response = await fetch(
      `${API_BASE_URL}/usuario`,
      requestOptions("GET")
    );
    if (!response.ok) {
      throw new Error(
        `Error al obtener todas las tareas del usuario: ${response.statusText}`
      );
    }
    return response.json();
  },

  // GET /api/Tareas/subtareas/usuario
  getSubTareasDelUsuarioAutenticado: async (): Promise<TareaDTO[]> => {
    const response = await fetch(
      `${API_BASE_URL}/subtareas/usuario`,
      requestOptions("GET")
    );
    if (!response.ok) {
      throw new Error(
        `Error al obtener subtareas del usuario: ${response.statusText}`
      );
    }
    return response.json();
  },

  // POST /api/Tareas
  createTarea: async (tarea: TareaCrearDTO): Promise<TareaDTO> => {
    const response = await fetch(API_BASE_URL, requestOptions("POST", tarea));
    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Error al crear tarea: ${errorBody.message || response.statusText}`
      );
    }
    return response.json(); // Retorna la tarea creada con su ID
  },

  // PUT /api/Tareas/{id}
  updateTarea: async (id: number, dto: TareaActualizarDTO): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/${id}`,
      requestOptions("PUT", dto)
    );
    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Error al actualizar tarea ${id}: ${
          errorBody.message || response.statusText
        }`
      );
    }
    // El controlador devuelve NoContent(), por lo que no hay JSON para parsear
  },

  // DELETE /api/Tareas/{id}
  deleteTarea: async (id: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/${id}`,
      requestOptions("DELETE")
    );
    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Error al eliminar tarea ${id}: ${
          errorBody.message || response.statusText
        }`
      );
    }
  },

  // PATCH /api/Tareas/{id}/estado
  cambiarEstadoTarea: async (
    id: number,
    dto: EstadoActualizarDTO
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/${id}/estado`,
      requestOptions("PATCH", dto)
    );
    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Error al cambiar estado de tarea ${id}: ${
          errorBody.message || response.statusText
        }`
      );
    }
  },

  // PUT /api/Tareas/asignar/{idTarea} (Corregido según tus endpoints)
  asignarTarea: async (idTarea: number, idUsuario: number): Promise<void> => {
    // Construye la URL con el idUsuario como parámetro de consulta
    const url = `${API_BASE_URL}/asignar/${idTarea}?idAsignado=${idUsuario}`;

    // No se envía cuerpo de solicitud, ya que el idUsuario va en la URL
    const response = await fetch(url, requestOptions("PUT")); // Solo 'PUT', sin body

    if (!response.ok) {
      const errorText = await response.text(); // Usa text() para obtener el error completo
      throw new Error(
        `Error al asignar tarea ${idTarea} al usuario ${idUsuario}: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
  },

  // ---- NUEVAS FUNCIONES PARA EL PROCESO DE REASIGNACIÓN DE TAREAS RECHAZADAS ----

  /**
   * Reactiva una tarea que estaba en estado 'Rechazada' (6) a 'Asignada' (2).
   * Internamente llama a `cambiarEstadoTarea`.
   * @param idTarea El ID de la tarea a reactivar.
   */
  reactivarTareaRechazada: async (idTarea: number): Promise<void> => {
    const dto: EstadoActualizarDTO = {
      CN_Id_estado: 2, // Estado 'Asignada'
    };
    await tareasService.cambiarEstadoTarea(idTarea, dto);
  },

  /**
   * Realiza el proceso completo de reasignar una tarea rechazada:
   * 1. Cambia su estado de 'Rechazada' (6) a 'Asignada' (2).
   * 2. (Opcional) Asigna la tarea a un nuevo usuario si se proporciona `idNuevoAsignado`.
   * @param idTarea El ID de la tarea a reasignar.
   * @param idNuevoAsignado (Opcional) El ID del usuario al que se reasignará la tarea. Si no se proporciona, la tarea simplemente cambia de estado.
   */
  reasignarTareaRechazadaCompleta: async (
    idTarea: number,
    idNuevoAsignado?: number
  ): Promise<void> => {
    try {
      // Paso 1: Reactivar la tarea (cambiar estado de 6 a 2 y eliminar justificación de rechazo en backend)
      await tareasService.reactivarTareaRechazada(idTarea);
      console.log(`Tarea ${idTarea} reactivada a estado 'Asignada'.`);

      // Paso 2: (Opcional) Asignar a un nuevo usuario
      if (idNuevoAsignado !== undefined) {
        await tareasService.asignarTarea(idTarea, idNuevoAsignado);
        console.log(
          `Tarea ${idTarea} asignada al usuario ${idNuevoAsignado}.`
        );
      }
    } catch (error) {
      console.error("Error en reasignarTareaRechazadaCompleta:", error);
      throw error; // Propagar el error para que el componente lo maneje
    }
  },

  // ---- FIN DE NUEVAS FUNCIONES ----

  // NUEVA FUNCIÓN: Añadir seguimiento a una tarea
  addSeguimiento: async (tareaId: number, comentario: string): Promise<void> => {
    const seguimientoData: SeguimientoCrearDTO = { CT_Comentario: comentario };
    const response = await fetch(
      `${API_BASE_URL}/${tareaId}/seguimiento`,
      requestOptions("POST", seguimientoData)
    );
    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Error al añadir seguimiento a la tarea ${tareaId}: ${
          errorBody.message || response.statusText
        }`
      );
    }
    // No retorna nada si el backend devuelve 201 Created o 204 No Content
  },

  // NUEVA FUNCIÓN: Obtener seguimientos de una tarea
  getSeguimientosByTareaId: async (tareaId: number): Promise<TareaSeguimientoDTO[]> => {
    const response = await fetch(
      `${API_BASE_URL}/${tareaId}/seguimientos`, // Endpoint GET para seguimientos
      requestOptions("GET")
    );
    if (!response.ok) {
      throw new Error(
        `Error al obtener seguimientos para la tarea ${tareaId}: ${response.statusText}`
      );
    }
    return response.json();
  },

  // GET /api/Usuario/subordinados
  getSubordinados: async (): Promise<UsuarioDTO[]> => {
    const response = await fetch(
      `${API_BASE_URL_USERS}/subordinados`,
      requestOptions("GET")
    );
    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Error al obtener subordinados: ${
          errorBody.message || response.statusText
        }`
      );
    }
    return response.json();
  },

  // GET /api/Complejidades
  getComplejidades: async (): Promise<ComplejidadDTO[]> => {
    const response = await fetch(
      API_BASE_URL_COMPLEJIDADES,
      requestOptions("GET")
    );
    if (!response.ok) {
      throw new Error(`Error al obtener complejidades: ${response.statusText}`);
    }
    return response.json();
  },

  // GET /api/Estados
  getEstados: async (): Promise<EstadoDTO[]> => {
    const response = await fetch(API_BASE_URL_ESTADOS, requestOptions("GET"));
    if (!response.ok) {
      throw new Error(`Error al obtener estados: ${response.statusText}`);
    }
    return response.json();
  },

  // GET /api/Prioridades
  getPrioridades: async (): Promise<PrioridadDTO[]> => {
    const response = await fetch(
      API_BASE_URL_PRIORIDADES,
      requestOptions("GET")
    );
    if (!response.ok) {
      throw new Error(`Error al obtener prioridades: ${response.statusText}`);
    }
    return response.json();
  },

  // Otros endpoints de Usuario o Auth si los necesitas en el futuro:
  // getUsuarioById: async (id: number): Promise<UsuarioDTO> => { ... }
  // login: async (credentials: LoginDTO): Promise<AuthTokenDTO> => { ... }
};
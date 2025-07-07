import { Link } from "react-router-dom";

const UserHeaderLink: React.FC = () => (
  <>
    <Link to="/task">Tareas</Link>
    <Link to="/subtask">Subtareas</Link>
    <Link to="/historial">Historial</Link>
    <Link to="/perfil">Perfil</Link>
    <Link to="/bitacora">Bitacora</Link>
    <Link to="/usuarios">Usuarios</Link>
    <Link to="/notificaciones">Notificaciones</Link>
  </>
);

export default UserHeaderLink;

import { Routes, Route } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import LoginPage from "../pages/Login";
import MainLayout from "../components/layout/MainLayout";
import TaskPage from "../pages/Task";
import SubTask from "../pages/SubTask";
import Historial from "../pages/Historial";
import Perfil from "../pages/Perfil";
import Bitacora from "../pages/Bitacora";
import Usuarios from "../pages/Usuarios";
import Notificaciones from "../pages/Notificaciones";

const AppRouter = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route index path="/" element={<LoginPage />} />
      {/* Puedes agregar más rutas aquí */}
    </Route>

    <Route element={<MainLayout />}>
      <Route path="/task" element={<TaskPage />} />
      <Route path="/subtask" element={<SubTask/>}/>
      <Route path="/historial" element={<Historial/>}/>
      <Route path="/perfil" element={<Perfil/>}/>
      <Route path="/bitacora" element={<Bitacora/>}/>
      <Route path="/usuarios" element={<Usuarios/>}/>
      <Route path="/notificaciones" element={<Notificaciones/>}/>
    </Route>
  </Routes>
);

export default AppRouter;

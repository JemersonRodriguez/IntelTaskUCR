import { createContext, useState } from "react";

// type Permiso = {
//   pantalla: string;
//   acciones: string[];
// };

type Rol = {
  id: number;
  nombre: string;
  // permisos?: Permiso[]; // Comentado para futura adaptación
};

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
};

type UserData = {
  token: string;
  usuario: Usuario;
} | null;

type AuthContextType = {
  user: UserData;
  login: (userData: UserData) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData>(null);

  const login = (userData: UserData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
import { createContext, useContext, useState } from "react";

type NotificacionesContextType = {
  nuevas: number;
  setNuevas: React.Dispatch<React.SetStateAction<number>>;
};

const NotificacionesContext = createContext<NotificacionesContextType>({
  nuevas: 0,
  setNuevas: () => {},
});

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}

export function NotificacionesProvider({ children }: { children: React.ReactNode }) {
  const [nuevas, setNuevas] = useState(0);
  return (
    <NotificacionesContext.Provider value={{ nuevas, setNuevas }}>
      {children}
    </NotificacionesContext.Provider>
  );
}
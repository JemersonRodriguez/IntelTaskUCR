import { createContext, useContext, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useNotificaciones } from "./NotificacionesProvider";

type SignalRContextType = {
  connection: signalR.HubConnection | null;
};

const SignalRContext = createContext<SignalRContextType>({ connection: null });

export function useSignalR() {
  return useContext(SignalRContext);
}

export function SignalRProvider({ token, children }: { token: string | null, children: React.ReactNode }) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const { setNuevas } = useNotificaciones();

  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7293/notificacionesHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("NuevaNotificacion", () => {
      setNuevas((prev: number) => prev + 1);

      // SONIDO
      const audio = new Audio("/notificacion.mp3");
      audio.play();
    });

    connection.start().catch(() => {});
    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, [token, setNuevas]);

  return (
    <SignalRContext.Provider value={{ connection: connectionRef.current }}>
      {children}
    </SignalRContext.Provider>
  );
}

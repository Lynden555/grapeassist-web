import { useState, useRef, useCallback } from "react";

const SIGNALING_URL = "wss://grapeassist.org/signal/";

export const useSignaling = () => {
  const [signalingStatus, setSignalingStatus] = useState("disconnected"); // disconnected, connecting, connected, error
  const [lastMessage, setLastMessage] = useState("");

  const wsRef = useRef(null);
  const codeRef = useRef("");

  const log = useCallback((message) => {
    console.log("🔈 Signaling:", message);
    setLastMessage(message);
  }, []);

  // Conectar al servidor de signaling
  const connectToSignaling = useCallback((code, peerConnection, onRemoteOffer, onIceCandidate) => {
    return new Promise((resolve, reject) => {
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }

      codeRef.current = code;
      setSignalingStatus("connecting");
      log("📡 Conectando al servidor de signaling...");

      const ws = new WebSocket(SIGNALING_URL);

      ws.onopen = () => {
        setSignalingStatus("connected");
        log("✅ Conectado al servidor de signaling");
        
        // Unirse a la sesión
        const joinMsg = { 
          type: "join", 
          code: codeRef.current, 
          role: "technician"
        };
        ws.send(JSON.stringify(joinMsg));
        log(`🔗 Uniéndose como técnico: ${codeRef.current}`);
        
        resolve(ws);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Mensaje signaling:", data.type);
          
          await handleSignalingMessage(data, peerConnection, onRemoteOffer, onIceCandidate);
        } catch (error) {
          log(`❌ Error procesando mensaje: ${error.message}`);
        }
      };

      ws.onerror = (error) => {
        setSignalingStatus("error");
        log(`❌ Error WebSocket: ${error}`);
        reject(error);
      };

      ws.onclose = (event) => {
        setSignalingStatus("disconnected");
        log(`🔌 Desconectado del signaling: ${event.code} ${event.reason}`);
      };

      wsRef.current = ws;
    });
  }, [log]);

  // Manejar mensajes del servidor de signaling
  const handleSignalingMessage = useCallback(async (data, peerConnection, onRemoteOffer, onIceCandidate) => {
    switch (data.type) {
      case "joined":
        log("✅ Unido a la sesión - Esperando agente...");
        break;

      case "peer-joined":
        log("👤 Agente conectado - Esperando oferta...");
        break;

      case "offer":
        log("📥 Oferta recibida del agente");
        if (onRemoteOffer) {
          await onRemoteOffer(data.offer, peerConnection);
        }
        break;

      case "ice-candidate":
        if (data.candidate && peerConnection && data.role === "agent") {
          try {
            await peerConnection.addIceCandidate(data.candidate);
            log("🧊 Candidato ICE del agente añadido");
            if (onIceCandidate) {
              onIceCandidate(data.candidate);
            }
          } catch (err) {
            console.warn("Error añadiendo ICE candidate:", err);
          }
        }
        break;

      case "error":
        log(`❌ Error del servidor: ${data.message}`);
        break;

      case "session-closed":
        log("🔒 Sesión cerrada por el agente");
        break;

      default:
        console.log("⚠️ Mensaje signaling no manejado:", data.type);
    }
  }, [log]);

  // Enviar respuesta SDP
  const sendAnswer = useCallback(async (peerConnection, code) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      log("❌ WebSocket no conectado para enviar answer");
      return false;
    }

    try {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      wsRef.current.send(JSON.stringify({
        type: "answer",
        answer: answer,
        code: code || codeRef.current,
        role: "technician"
      }));
      
      log("✅ Respuesta SDP enviada al agente");
      return true;
    } catch (error) {
      log(`❌ Error enviando answer: ${error.message}`);
      return false;
    }
  }, [log]);

  // Enviar candidato ICE
  const sendIceCandidate = useCallback((candidate, code) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: "ice-candidate",
        candidate: candidate,
        code: code || codeRef.current,
        role: "technician"
      }));
      return true;
    } catch (error) {
      console.error("Error enviando ICE candidate:", error);
      return false;
    }
  }, []);

  // Cerrar conexión de signaling
  const disconnectSignaling = useCallback(() => {
    if (wsRef.current) {
      try {
        // Notificar al servidor que nos vamos
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "leave",
            code: codeRef.current,
            role: "technician"
          }));
        }
        wsRef.current.close();
      } catch (error) {
        console.warn("Error cerrando WebSocket:", error);
      }
      wsRef.current = null;
    }
    
    setSignalingStatus("disconnected");
    log("🔌 Signaling desconectado");
  }, [log]);

  // Verificar estado de conexión
  const isConnected = useCallback(() => {
    return wsRef.current && wsRef.current.readyState === WebSocket.OPEN;
  }, []);

  // Enviar mensaje personalizado
  const sendCustomMessage = useCallback((messageType, data = {}) => {
    if (!isConnected()) {
      log("❌ No conectado para enviar mensaje personalizado");
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: messageType,
        ...data,
        code: codeRef.current,
        role: "technician",
        timestamp: Date.now()
      }));
      return true;
    } catch (error) {
      log(`❌ Error enviando mensaje personalizado: ${error.message}`);
      return false;
    }
  }, [isConnected, log]);

  return {
    signalingStatus,
    lastMessage,
    connectToSignaling,
    disconnectSignaling,
    sendAnswer,
    sendIceCandidate,
    sendCustomMessage,
    isConnected,
    currentCode: codeRef.current
  };
};

export default useSignaling;
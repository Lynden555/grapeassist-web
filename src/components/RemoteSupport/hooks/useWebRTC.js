import { useState, useRef, useCallback } from "react";

const API_BASE = "https://grapeassist-backend-production.up.railway.app";
const SIGNALING_URL = "wss://grapeassist.org/signal/";
const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.twilio.com:3478" }
  ],
};

export const useWebRTC = () => {
  const [status, setStatus] = useState("idle");
  const [stream, setStream] = useState(null);
  const [screenResolution, setScreenResolution] = useState({ width: 1920, height: 1080 });
  const [controlEnabled, setControlEnabled] = useState(false);

  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);
  const wsRef = useRef(null);
  const codeRef = useRef("");

  const log = useCallback((txt) => {
    console.log(txt);
  }, []);

  // ---------- WEBRTC (TU FLUJO ORIGINAL) ----------
  const initPeerConnection = useCallback(() => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
    }
    
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.ontrack = (event) => {
      console.log("🎥 Track recibido:", event.track.kind, event.streams);
      if (event.streams && event.streams[0]) {
        log("✅ Stream de pantalla recibido");
        const newStream = event.streams[0];
        setStream(newStream);
        setStatus("connected");
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "ice-candidate",
          candidate: e.candidate,
          code: codeRef.current,
          role: "technician"
        }));
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      if (channel.label === 'remoteControl') {
        dataChannelRef.current = channel;
        
        channel.onopen = () => {
          log('✅ Canal de control remoto listo');
          setControlEnabled(true);
        };

        channel.onclose = () => {
          log('🔌 Canal de control remoto cerrado');
          setControlEnabled(false);
        };

        channel.onerror = (error) => {
          log(`❌ Error en canal de control: ${error}`);
          setControlEnabled(false);
        };

        channel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'resolution') {
              setScreenResolution({
                width: data.width,
                height: data.height
              });
              log(`📏 Resolución detectada: ${data.width}x${data.height}`);
            }
          } catch (error) {
            console.error('Error procesando mensaje:', error);
          }
        };
      }
    };

    pcRef.current = pc;
    return pc;
  }, [log]);

  // ---------- WEBSOCKET (TU FLUJO ORIGINAL) ----------
  const ensureWebSocket = useCallback(() => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
    }

    log("📡 Conectando al servidor...");
    const ws = new WebSocket(SIGNALING_URL);

    // 🆕 MOVIDO DENTRO: handleOffer
    const handleOffer = async (offer) => {
      if (!pcRef.current) {
        log("❌ Conexión WebRTC no inicializada");
        return;
      }

      try {
        log("📥 Estableciendo oferta remota...");
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        log("✅ Oferta establecida - Creando respuesta...");

        const dataChannel = pcRef.current.createDataChannel('remoteControl', {
          ordered: true,
          maxPacketLifeTime: 3000
        });

        dataChannelRef.current = dataChannel;
        
        dataChannel.onopen = () => {
          log('✅ Canal de control remoto (iniciado) listo');
          setControlEnabled(true);
        };

        dataChannel.onclose = () => {
          log('🔌 Canal de control remoto cerrado');
          setControlEnabled(false);
        };

        dataChannel.onerror = (error) => {
          log(`❌ Error en canal de control: ${error}`);
          setControlEnabled(false);
        };

        dataChannel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'resolution') {
              setScreenResolution({
                width: data.width,
                height: data.height
              });
              log(`📏 Resolución detectada: ${data.width}x${data.height}`);
            }
          } catch (error) {
            console.error('Error procesando mensaje:', error);
          }
        };

        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        wsRef.current.send(JSON.stringify({
          type: "answer",
          answer: answer,
          code: codeRef.current,
          role: "technician"
        }));
        
        log("✅ Respuesta enviada al agente");
        setStatus("connected");

      } catch (error) {
        log(`❌ Error procesando oferta: ${error.message}`);
      }
    };

    // 🆕 MOVIDO DENTRO: handleSignalingMessage
    const handleSignalingMessage = async (data) => {
      try {
        switch (data.type) {
          case "joined":
            log("✅ Unido a la sesión - Esperando pantalla del agente...");
            setStatus("pending");
            break;

          case "peer-joined":
            log("👤 Agente conectado - Esperando oferta...");
            break;

          case "offer":
            log("📥 Oferta recibida del agente - Procesando...");
            await handleOffer(data.offer);
            break;

          case "ice-candidate":
            if (data.candidate && pcRef.current && data.role === "agent") {
              try {
                await pcRef.current.addIceCandidate(data.candidate);
                
              } catch (err) {
                console.warn("Error añadiendo ICE candidate:", err);
              }
            }
            break;

          case "error":
            log(`❌ Error: ${data.message}`);
            break;

          default:
            console.log("⚠️ Mensaje no manejado:", data.type);
        }
      } catch (error) {
        log(`❌ Error procesando mensaje: ${error.message}`);
      }
    };

    ws.onopen = () => {
      log("✅ Conectado al servidor");
      
      const joinMsg = { 
        type: "join", 
        code: codeRef.current, 
        role: "technician"
      };
      ws.send(JSON.stringify(joinMsg));
      log(`🔗 Uniéndose como técnico: ${codeRef.current}`);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Mensaje recibido:", data.type, data);
        
        await handleSignalingMessage(data);
      } catch (error) {
        log(`❌ Error procesando mensaje: ${error.message}`);
      }
    };

    ws.onerror = (error) => {
      log(`❌ Error WebSocket: ${error}`);
    };

    ws.onclose = () => {
      log("🔌 Desconectado del servidor");
      setStatus("closed");
      setControlEnabled(false);
      setStream(null);
    };

    wsRef.current = ws;
  }, [log]);

  // ---------- CONEXIÓN CON LICENCIAS ----------
  const connectToSession = useCallback(async (code, userId) => {
    if (!code.trim()) {
      log("❌ Ingresa un código de sesión");
      return false;
    }

    codeRef.current = code;

    try {
      setStatus("pending");
      log("🔗 Validando sesión...");

      // Verificar límites primero
      let userData = null;
      if (userId) {
        const limitsResponse = await fetch(`${API_BASE}/user/limits/${userId}`);
        const limitsData = await limitsResponse.json();
        
        if (limitsData.ok) {
          userData = limitsData.user;
          
          // Verificar si puede crear más conexiones
          const canConnect = (() => {
            switch (userData.planType) {
              case 'demo':
                return userData.trialUsed < 3;
              case 'basic':
                return userData.activeConnections < 3;
              case 'pro':
                return userData.activeConnections < 6;
              case 'enterprise':
                return true;
              default:
                return true;
            }
          })();
          
          if (!canConnect) {
            let errorMsg = "";
            if (userData.planType === 'demo') {
              errorMsg = `🚫 Límite demo alcanzado (${userData.trialUsed}/3 conexiones). Actualiza tu plan.`;
            } else if (userData.planType === 'basic') {
              errorMsg = `🚫 Límite básico alcanzado (${userData.activeConnections}/3 conexiones simultáneas).`;
            } else if (userData.planType === 'pro') {
              errorMsg = `🚫 Límite pro alcanzado (${userData.activeConnections}/6 conexiones simultáneas).`;
            }
            
            log(errorMsg);
            return false;
          }
        }
      }

      const res = await fetch(`${API_BASE}/remote/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, tecnicoId: userId }),
      });
      
      const data = await res.json();
      if (!data.ok) {
        log(`❌ Error del backend: ${data.error}`);
        return false;
      }

      log(`✅ Sesión ${code} validada`);
      
      initPeerConnection();
      ensureWebSocket();
      return true;

    } catch (err) {
      log(`❌ Error de red: ${err.message}`);
      return false;
    }
  }, [initPeerConnection, ensureWebSocket, log]);

  const closeSession = useCallback(async (code, userId) => {
    if (code) {
      try {
        await fetch(`${API_BASE}/remote/close`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
      } catch (err) {
        console.warn("Error cerrando sesión:", err);
      }
    }

    // Decrementar contador
    if (userId) {
      try {
        await fetch(`${API_BASE}/user/decrement-connection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      } catch (error) {
        console.error('Error decrementando contador:', error);
      }
    }

    try { wsRef.current?.close(); } catch {}
    try { pcRef.current?.close(); } catch {}
    try { dataChannelRef.current?.close(); } catch {}
    
    setStatus("idle");
    setControlEnabled(false);
    setStream(null);
    log(`🔌 Sesión cerrada`);
  }, [log]);

  // Enviar comando por Data Channel
  const sendCommand = useCallback((command) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify(command));
        return true;
      } catch (error) {
        console.error('Error enviando comando:', error);
        return false;
      }
    }
    return false;
  }, []);

  return {
    status,
    stream,
    screenResolution,
    controlEnabled,
    connectToSession,
    closeSession,
    sendCommand
  };
};

export default useWebRTC;
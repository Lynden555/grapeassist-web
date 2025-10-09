import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Typography,
  Stack,
  Card,
  CardContent,
  Box,
  Chip,
  Alert,
} from "@mui/material";
import {
  SupportAgent,
  Computer,
  Security,
  Close,
} from "@mui/icons-material";

// Components
import PinCodeInput from './PinCodeInput';
import VideoWithOverlay from './VideoWithOverlay';

// Hooks
import useWebRTC from './hooks/useWebRTC';
import useRemoteControl from './hooks/useRemoteControl';

// Styles
import "./styles/RemoteSupport.css";

const RemoteSupport = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [isFullView, setIsFullView] = useState(false);
  const [userLimits, setUserLimits] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ 
    width: 0, height: 0, offsetX: 0, offsetY: 0, videoWidth: 0, videoHeight: 0 
  });

  const remoteVideoRef = useRef(null);
  const fullViewVideoRef = useRef(null);

  // Custom hooks
  const {
    status,
    stream,
    screenResolution,
    controlEnabled,
    connectToSession,
    closeSession,
    sendCommand,
  } = useWebRTC();

  const {
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleDoubleClick,
    handleWheel,
    handleKeyDown,
    handleKeyUp
  } = useRemoteControl();

  // Cargar límites del usuario
  useEffect(() => {
    const loadUserLimits = async () => {
      const userData = localStorage.getItem('grape_user');
      if (userData) {
        const user = JSON.parse(userData);
        try {
          const response = await fetch(`https://grapeassist-backend-production.up.railway.app/user/limits/${user.id}`);
          const data = await response.json();
          if (data.ok) {
            setUserLimits(data.user);
          }
        } catch (error) {
          console.error('Error cargando límites:', error);
        }
      }
    };
    
    loadUserLimits();
  }, []);

  // Efecto para calcular dimensiones del video
  useEffect(() => {
    const calculateVideoDimensions = (videoElement) => {
      if (!videoElement) return;
      
      const rect = videoElement.getBoundingClientRect();
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      
      if (!videoWidth || !videoHeight) return;
      
      const containerRatio = rect.width / rect.height;
      const videoRatio = videoWidth / videoHeight;
      
      let displayWidth, displayHeight, offsetX, offsetY;
      
      if (videoRatio > containerRatio) {
        displayWidth = rect.width;
        displayHeight = rect.width / videoRatio;
        offsetX = 0;
        offsetY = (rect.height - displayHeight) / 2;
      } else {
        displayHeight = rect.height;
        displayWidth = rect.height * videoRatio;
        offsetX = (rect.width - displayWidth) / 2;
        offsetY = 0;
      }
      
      setVideoDimensions({
        width: displayWidth,
        height: displayHeight,
        offsetX: offsetX,
        offsetY: offsetY,
        videoWidth: videoWidth,
        videoHeight: videoHeight
      });
    };

    const video = isFullView ? fullViewVideoRef.current : remoteVideoRef.current;
    if (!video) return;
    
    const handleResize = () => calculateVideoDimensions(video);
    const handleLoadedMetadata = () => calculateVideoDimensions(video);
    
    window.addEventListener('resize', handleResize);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Calcular inicialmente
    const interval = setInterval(() => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        calculateVideoDimensions(video);
        clearInterval(interval);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      clearInterval(interval);
    };
  }, [isFullView, stream]);

  // EVENT LISTENERS PARA MOUSE Y TECLADO
  useEffect(() => {
    if (!controlEnabled) return;

    const videos = [];
    if (remoteVideoRef.current) videos.push(remoteVideoRef.current);
    if (fullViewVideoRef.current) videos.push(fullViewVideoRef.current);

    const addEventListeners = (video) => {
      if (!video) return;
      
      const events = {
        mousemove: (e) => handleMouseMove(e, video, sendCommand, screenResolution, videoDimensions),
        mousedown: (e) => handleMouseDown(e, video, sendCommand, videoDimensions),
        mouseup: (e) => handleMouseUp(e, sendCommand),
        dblclick: (e) => handleDoubleClick(e, video, sendCommand, videoDimensions),
        wheel: (e) => handleWheel(e, sendCommand),
        contextmenu: (e) => e.preventDefault()
      };

      Object.entries(events).forEach(([event, handler]) => {
        video.addEventListener(event, handler);
      });

      return () => {
        Object.entries(events).forEach(([event, handler]) => {
          video.removeEventListener(event, handler);
        });
      };
    };

    const cleanups = videos.map(video => addEventListeners(video));

    return () => {
      cleanups.forEach(cleanup => cleanup && cleanup());
    };
  }, [controlEnabled, handleMouseMove, handleMouseDown, handleMouseUp, handleDoubleClick, handleWheel, sendCommand, screenResolution, videoDimensions]);

  // EVENT LISTENERS PARA TECLADO
  useEffect(() => {
    if (!controlEnabled) return;

    const handleKeyEvents = (event) => {
      if (event.type === 'keydown') handleKeyDown(event, sendCommand);
      else if (event.type === 'keyup') handleKeyUp(event, sendCommand);
    };

    window.addEventListener('keydown', handleKeyEvents);
    window.addEventListener('keyup', handleKeyEvents);

    return () => {
      window.removeEventListener('keydown', handleKeyEvents);
      window.removeEventListener('keyup', handleKeyEvents);
    };
  }, [controlEnabled, handleKeyDown, handleKeyUp, sendCommand]);

  // Efecto para vista completa automática al conectar
  useEffect(() => {
    if (status === "connected" && !isFullView) {
      const timer = setTimeout(() => {
        setIsFullView(true);
        document.body.style.overflow = 'hidden';
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [status, isFullView]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleConnect = async () => {
    const userData = localStorage.getItem('grape_user');
    const userId = userData ? JSON.parse(userData).id : null;
    
    const success = await connectToSession(sessionCode, userId);
    if (success) {
      // Actualizar límites después de conectar
      if (userId) {
        try {
          const response = await fetch(`https://grapeassist-backend-production.up.railway.app/user/limits/${userId}`);
          const data = await response.json();
          if (data.ok) {
            setUserLimits(data.user);
          }
        } catch (error) {
          console.error('Error actualizando límites:', error);
        }
      }
    }
  };

  const handleClose = async () => {
    const userData = localStorage.getItem('grape_user');
    const userId = userData ? JSON.parse(userData).id : null;
    
    await closeSession(sessionCode, userId);
    setIsFullView(false);
    document.body.style.overflow = 'auto';
    
    // Actualizar límites después de cerrar
    if (userId) {
      try {
        const response = await fetch(`https://grapeassist-backend-production.up.railway.app/user/limits/${userId}`);
        const data = await response.json();
        if (data.ok) {
          setUserLimits(data.user);
        }
      } catch (error) {
        console.error('Error actualizando límites:', error);
      }
    }
  };


  return (
    <div className="remote-support-container">
      {/* Vista Normal */}
      {!isFullView && (
        <Card className="remote-support-card">
          <CardContent className="card-content">
            <Stack spacing={3} alignItems="center">
              {/* Header */}
              <div className="header-section">
                <SupportAgent className="header-icon" />
                <Typography variant="h5" className="header-title">
                  Asistencia Remota Profesional
                </Typography>
                <Chip 
                  icon={<Security />} 
                  label="Conexión Segura" 
                  className="security-chip"
                />
              </div>

              {/* Código de Sesión */}
              <div className="code-section">
                <Typography className="code-instruction">
                  Ingresa el código de 9 dígitos del cliente
                </Typography>
                
                {/* Mostrar información de límites */}
                {userLimits && (
                  <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: userLimits.planType === 'demo' && userLimits.trialUsed >= 3 ? '#f44336' : '#ff9800', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {userLimits.planType === 'demo' && 
                        `Demo: ${userLimits.trialUsed || 0}/3 conexiones totales`}
                      {userLimits.planType === 'basic' && 
                        `Básico: ${userLimits.activeConnections || 0}/3 conexiones simultáneas`}
                      {userLimits.planType === 'pro' && 
                        `Pro: ${userLimits.activeConnections || 0}/6 conexiones simultáneas`}
                      {userLimits.planType === 'enterprise' && 
                        `Enterprise: ${userLimits.activeConnections || 0} conexiones activas`}
                    </Typography>
                  </Box>
                )}
                
                <PinCodeInput
                  value={sessionCode}
                  onChange={setSessionCode}
                  disabled={status === "pending" || status === "connected"}
                />

                {status === "idle" && (
                  <Button 
                    variant="contained" 
                    onClick={handleConnect}
                    disabled={!sessionCode.trim() || sessionCode.replace(/-/g, '').length !== 9}
                    className="connect-button"
                  >
                    <Computer sx={{ mr: 1 }} />
                    Conectar Sesión
                  </Button>
                )}
              </div>

              {/* Estado de Conexión */}
              {(status === "pending" || status === "connected") && (
                <div className="connection-status">
                  <Alert 
                    severity={status === "connected" ? "success" : "info"}
                    className="status-alert"
                  >
                    {status === "pending" 
                      ? "🔄 Conectado - Esperando pantalla del cliente..." 
                      : "✅ Conexión establecida - Vista completa activada"
                    }
                  </Alert>
                  
                  <Typography className="session-code">
                    Sesión: <strong>{sessionCode}</strong>
                  </Typography>
                </div>
              )}

              {/* Video Preview */}
              <div className="video-preview">
                <VideoWithOverlay 
                  videoRef={remoteVideoRef}
                  stream={stream}
                  status={status}
                  controlEnabled={controlEnabled}
                  screenResolution={screenResolution}
                  videoDimensions={videoDimensions}
                  isFullView={false}
                />
              </div>

              {/* Controles */}
              <div className="controls-section">
                {(status === "connected" || status === "pending") && (
                  <Button 
                    variant="outlined" 
                    onClick={handleClose}
                    className="close-button"
                  >
                    Cerrar Sesión
                  </Button>
                )}
              </div>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Vista Completa */}
      {isFullView && (
        <div className="fullscreen-view">
          {/* Barra de Controles Superior - MÁS DELGADA */}
          <div className="fullscreen-controls">
            <div className="controls-left">
              <SupportAgent className="control-icon" />
              <Typography className="session-info">
                Sesión: <strong>{sessionCode}</strong>
              </Typography>
              <Chip 
                label={controlEnabled ? "🟢 CONTROL" : "🔴 SIN CONTROL"}
                className={controlEnabled ? "control-active" : "control-inactive"}
                size="small"
              />
            </div>
            
            <div className="controls-right">
              {/* ❌ ELIMINADO: Botón "Salir de Vista Completa" */}
              <Button
                variant="contained"
                onClick={handleClose}
                color="error"
                className="close-session-button"
                size="small"
              >
                <Close sx={{ mr: 0.5 }} />
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {/* Video en Pantalla Completa - MÁS ÁREA VISUAL */}
          <div className="fullscreen-video">
            <VideoWithOverlay 
              videoRef={fullViewVideoRef}
              stream={stream}
              status={status}
              controlEnabled={controlEnabled}
              screenResolution={screenResolution}
              videoDimensions={videoDimensions}
              isFullView={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteSupport;
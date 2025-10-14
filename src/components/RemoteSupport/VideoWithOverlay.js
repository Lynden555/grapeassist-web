import React, { useRef, useEffect } from "react";
import { Box } from "@mui/material";

const VideoWithOverlay = ({ 
  videoRef, 
  stream,
  isFullView, 
  status, 
  controlEnabled, 
  screenResolution, 
  videoDimensions
  // 🗑️ ELIMINAR: remoteCursor prop
}) => {
  const internalVideoRef = useRef(null);
  const currentVideoRef = videoRef || internalVideoRef;

  // 🎯 CRÍTICO: CURSOR NORMAL CUANDO HAY CONTROL
  useEffect(() => {
    const videoElement = currentVideoRef.current;
    if (!videoElement) return;

    if (controlEnabled) {
      // ✅ CURSOR NORMAL - NO CROSSHAIR, NO OVERLAY
      videoElement.style.cursor = 'default';
    } else {
      videoElement.style.cursor = 'default';
    }

    return () => {
      if (videoElement) {
        videoElement.style.cursor = 'default';
      }
    };
  }, [controlEnabled, currentVideoRef]);

  // SINCRONIZAR STREAM CON EL VIDEO
  useEffect(() => {
    if (currentVideoRef.current && stream) {
      currentVideoRef.current.srcObject = stream;
    }
  }, [stream, currentVideoRef]);
  
  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      cursor: controlEnabled ? 'default' : 'default' // ✅ SIEMPRE CURSOR NORMAL
    }}>
      <video
        ref={currentVideoRef}
        autoPlay
        playsInline
        muted
        style={{ 
          width: '100%',
          height: isFullView ? '99%' : 'auto',
          borderRadius: 8, 
          border: "2px solid #143a66",
          display: status === "connected" ? "block" : "none",
          backgroundColor: "#000",
          cursor: controlEnabled ? 'default' : 'default', // ✅ CRÍTICO: CURSOR NORMAL
          objectFit: 'contain'
        }}
      />
      
      {/* 🗑️ ELIMINAR TODO EL OVERLAY DEL CURSOR */}
      
      {status === "connected" && (
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          bgcolor: 'rgba(0,0,0,0.7)', 
          color: controlEnabled ? '#4caf50' : '#f44336',
          px: 2, 
          py: 1, 
          borderRadius: 2,
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {controlEnabled ? '🟢 CONTROL ACTIVO' : '🔴 CONTROL INACTIVO'}
        </Box>
      )}
    </Box>
  );
};

export default VideoWithOverlay;
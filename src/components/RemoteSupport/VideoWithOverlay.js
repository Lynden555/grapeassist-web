import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const VideoWithOverlay = ({ 
  videoRef, 
  stream, // ← ESTA PROP FALTABA
  isFullView, 
  status, 
  controlEnabled, 
  screenResolution, 
  videoDimensions 
}) => {
  const [showDebug, setShowDebug] = useState(false);
  const internalVideoRef = useRef(null);
  
  // Usar la ref proporcionada o la interna
  const currentVideoRef = videoRef || internalVideoRef;

  // SINCRONIZAR STREAM CON EL VIDEO - ESTO FALTABA
  useEffect(() => {
    if (currentVideoRef.current && stream) {
      currentVideoRef.current.srcObject = stream;
    }
  }, [stream, currentVideoRef]);
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
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
          cursor: controlEnabled ? 'crosshair' : 'default',
          objectFit: 'contain'
        }}
        onDoubleClick={() => setShowDebug(!showDebug)}
      />
      
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
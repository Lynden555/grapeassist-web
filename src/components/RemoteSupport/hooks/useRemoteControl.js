import { useRef, useCallback } from "react";

export const useRemoteControl = () => {
  const modifiersStateRef = useRef({
    control: false,
    alt: false,
    shift: false, 
    meta: false
  });

  // Manejadores de mouse (TUS FUNCIONES ORIGINALES)
  const handleMouseMove = useCallback((event, videoElement, sendCommand, screenResolution, videoDimensions) => {
    if (!sendCommand || !videoElement) return;

    const rect = videoElement.getBoundingClientRect();
    const dimensions = videoDimensions;
    
    if (!dimensions.width || !dimensions.videoWidth) {
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
      
      const normalizedX = x / rect.width;
      const normalizedY = y / rect.height;

      sendCommand({
        type: 'mouseMove',
        x: Math.round(normalizedX * (screenResolution?.width || 1920)),
        y: Math.round(normalizedY * (screenResolution?.height || 1080))
      });
      return;
    }
    
    const relativeX = event.clientX - rect.left - dimensions.offsetX;
    const relativeY = event.clientY - rect.top - dimensions.offsetY;
    
    if (relativeX < 0 || relativeY < 0 || 
        relativeX > dimensions.width || relativeY > dimensions.height) {
      return;
    }
    
    const normalizedX = relativeX / dimensions.width;
    const normalizedY = relativeY / dimensions.height;
    
    const remoteX = Math.round(normalizedX * dimensions.videoWidth);
    const remoteY = Math.round(normalizedY * dimensions.videoHeight);

    sendCommand({
      type: 'mouseMove',
      x: remoteX,
      y: remoteY
    });
  }, []);

  const handleMouseDown = useCallback((event, videoElement, sendCommand, videoDimensions) => {
    if (!sendCommand || !videoElement) return;
    
    const rect = videoElement.getBoundingClientRect();
    const dimensions = videoDimensions;
    
    const relativeX = event.clientX - rect.left - dimensions.offsetX;
    const relativeY = event.clientY - rect.top - dimensions.offsetY;
    
    if (relativeX < 0 || relativeY < 0 || 
        relativeX > dimensions.width || relativeY > dimensions.height) {
      return;
    }
    
    const button = event.button === 2 ? 'right' : 'left';
    
    sendCommand({
      type: 'mouseClick',
      button: button,
      double: false,
      down: true
    });
  }, []);

  const handleMouseUp = useCallback((event, sendCommand) => {
    if (!sendCommand) return;
    
    const button = event.button === 2 ? 'right' : 'left';
    
    sendCommand({
      type: 'mouseClick',
      button: button,
      double: false,
      down: false
    });
  }, []);

  const handleDoubleClick = useCallback((event, videoElement, sendCommand, videoDimensions) => {
    if (!sendCommand || !videoElement) return;
    
    const rect = videoElement.getBoundingClientRect();
    const dimensions = videoDimensions;
    
    const relativeX = event.clientX - rect.left - dimensions.offsetX;
    const relativeY = event.clientY - rect.top - dimensions.offsetY;
    
    if (relativeX < 0 || relativeY < 0 || 
        relativeX > dimensions.width || relativeY > dimensions.height) {
      return;
    }
    
    const button = event.button === 2 ? 'right' : 'left';
    sendCommand({
      type: 'mouseClick',
      button: button,
      double: true
    });
  }, []);

  const handleWheel = useCallback((event, sendCommand) => {
    if (!sendCommand) return;
    
    sendCommand({
      type: 'scroll',
      dx: event.deltaX,
      dy: event.deltaY
    });
  }, []);

  // Manejadores de teclado (TUS FUNCIONES ORIGINALES)
  const handleKeyDown = useCallback((event, sendCommand) => {
    if (!sendCommand) return;
    
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === 'Control') modifiersStateRef.current.control = true;
    if (event.key === 'Alt') modifiersStateRef.current.alt = true;
    if (event.key === 'Shift') modifiersStateRef.current.shift = true;
    if (event.key === 'Meta') modifiersStateRef.current.meta = true;

    const modifiers = [];
    const state = modifiersStateRef.current;
    if (state.control) modifiers.push('control');
    if (state.alt) modifiers.push('alt');
    if (state.shift) modifiers.push('shift');
    if (state.meta) modifiers.push('command');

    sendCommand({
      type: 'keyToggle',
      key: event.key.toLowerCase(),
      down: true,
      modifiers: modifiers
    });
  }, []);

  const handleKeyUp = useCallback((event, sendCommand) => {
    if (!sendCommand) return;
    
    if (event.key === 'Control') modifiersStateRef.current.control = false;
    if (event.key === 'Alt') modifiersStateRef.current.alt = false;
    if (event.key === 'Shift') modifiersStateRef.current.shift = false;
    if (event.key === 'Meta') modifiersStateRef.current.meta = false;
    
    event.preventDefault();
    
    const modifiers = [];
    const state = modifiersStateRef.current;
    if (state.control) modifiers.push('control');
    if (state.alt) modifiers.push('alt');
    if (state.shift) modifiers.push('shift');
    if (state.meta) modifiers.push('command');

    sendCommand({
      type: 'keyToggle',
      key: event.key.toLowerCase(),
      down: false,
      modifiers: modifiers
    });
  }, []);

  return {
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleDoubleClick,
    handleWheel,
    handleKeyDown,
    handleKeyUp
  };
};

export default useRemoteControl;
import React from "react";
import { Typography, Box, TextField } from "@mui/material";
import { VpnKey } from "@mui/icons-material";

const PinCodeInput = ({ value, onChange, disabled, label = "Ingresa el código de 9 dígitos" }) => {
  const formatDisplay = (code) => {
    if (!code) return '';
    const clean = code.replace(/-/g, '');
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 9)}`;
  };

  const handleChange = (e) => {
    let input = e.target.value;
    input = input.replace(/[^a-zA-Z0-9-]/g, '');
    
    if (input.length < value.length) {
      onChange(input);
      return;
    }
    
    const clean = input.replace(/-/g, '');
    if (clean.length > 9) return;
    
    let formatted = clean;
    if (clean.length > 6) {
      formatted = `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 9)}`;
    } else if (clean.length > 3) {
      formatted = `${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
    }
    
    onChange(formatted);
  };

  const cleanValue = value.replace(/-/g, '');
  const digits = cleanValue.split('');
  
  while (digits.length < 9) {
    digits.push('');
  }

  const getDigitColor = (digit, index) => {
    if (!digit) return '#4fc3f7';
    if (index < 3) return '#8a2be2';
    if (index < 6) return '#6a0dad';
    return '#4a148c';
  };

  const getDigitBackground = (digit) => {
    if (!digit) return 'rgba(255, 255, 255, 0.05)';
    return 'linear-gradient(135deg, #8a2be2, #6a0dad)';
  };

  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      {/* Input oculto para capturar teclado */}
      <TextField
        value={formatDisplay(value)}
        onChange={handleChange}
        disabled={disabled}
        inputProps={{
          style: { 
            opacity: 0, 
            position: 'absolute', 
            pointerEvents: 'none' 
          },
          maxLength: 11,
          autoComplete: 'off'
        }}
        sx={{ position: 'absolute' }}
      />
      
      {/* Display visual del código */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 1.5,
        mb: 2,
        position: 'relative'
      }}>
        {/* Grupo 1: Primeros 3 dígitos */}
        {digits.slice(0, 3).map((digit, index) => (
          <Box
            key={index}
            sx={{
              width: 52,
              height: 62,
              border: `3px solid ${getDigitColor(digit, index)}`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: getDigitBackground(digit),
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: digit 
                ? '0 4px 15px rgba(138, 43, 226, 0.4)' 
                : '0 2px 8px rgba(79, 195, 247, 0.3)',
              transform: digit ? 'translateY(-2px)' : 'none',
              '&:hover': disabled ? {} : {
                borderColor: '#ffffff',
                backgroundColor: 'rgba(79, 195, 247, 0.3)',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 6px 20px rgba(79, 195, 247, 0.5)'
              }
            }}
            onClick={() => {
              if (!disabled) {
                const hiddenInput = document.querySelector('input[type="text"]');
                if (hiddenInput) {
                  hiddenInput.focus();
                  hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
                }
              }
            }}
          >
            {digit}
          </Box>
        ))}
        
        {/* Separador 1 */}
        <Typography sx={{ 
          color: '#8a2be2', 
          fontSize: '1.8rem', 
          fontWeight: 'bold', 
          mx: 1,
          opacity: 0.7
        }}>
          -
        </Typography>
        
        {/* Grupo 2: Siguientes 3 dígitos */}
        {digits.slice(3, 6).map((digit, index) => (
          <Box
            key={index + 3}
            sx={{
              width: 52,
              height: 62,
              border: `3px solid ${getDigitColor(digit, index + 3)}`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: getDigitBackground(digit),
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: digit 
                ? '0 4px 15px rgba(138, 43, 226, 0.4)' 
                : '0 2px 8px rgba(79, 195, 247, 0.3)',
              transform: digit ? 'translateY(-2px)' : 'none',
              '&:hover': disabled ? {} : {
                borderColor: '#ffffff',
                backgroundColor: 'rgba(79, 195, 247, 0.3)',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 6px 20px rgba(79, 195, 247, 0.5)'
              }
            }}
            onClick={() => {
              if (!disabled) {
                const hiddenInput = document.querySelector('input[type="text"]');
                if (hiddenInput) {
                  hiddenInput.focus();
                  hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
                }
              }
            }}
          >
            {digit}
          </Box>
        ))}
        
        {/* Separador 2 */}
        <Typography sx={{ 
          color: '#8a2be2', 
          fontSize: '1.8rem', 
          fontWeight: 'bold', 
          mx: 1,
          opacity: 0.7
        }}>
          -
        </Typography>
        
        {/* Grupo 3: Últimos 3 dígitos */}
        {digits.slice(6, 9).map((digit, index) => (
          <Box
            key={index + 6}
            sx={{
              width: 52,
              height: 62,
              border: `3px solid ${getDigitColor(digit, index + 6)}`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: getDigitBackground(digit),
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: digit 
                ? '0 4px 15px rgba(138, 43, 226, 0.4)' 
                : '0 2px 8px rgba(79, 195, 247, 0.3)',
              transform: digit ? 'translateY(-2px)' : 'none',
              '&:hover': disabled ? {} : {
                borderColor: '#ffffff',
                backgroundColor: 'rgba(79, 195, 247, 0.3)',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 6px 20px rgba(79, 195, 247, 0.5)'
              }
            }}
            onClick={() => {
              if (!disabled) {
                const hiddenInput = document.querySelector('input[type="text"]');
                if (hiddenInput) {
                  hiddenInput.focus();
                  hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
                }
              }
            }}
          >
            {digit}
          </Box>
        ))}
      </Box>
      
      {/* Instrucciones */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <VpnKey sx={{ color: '#9fd8ff', fontSize: '1.2rem' }} />
        <Typography variant="body2" sx={{ color: '#9fd8ff', mt: 1, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>

      {/* Indicador de progreso */}
      <Box sx={{ width: '100%', mt: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          px: 1 
        }}>
          {[0, 3, 6, 9].map((position) => (
            <Box
              key={position}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: cleanValue.length >= position ? '#8a2be2' : 'rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                boxShadow: cleanValue.length >= position ? '0 0 10px rgba(138, 43, 226, 0.7)' : 'none'
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PinCodeInput;
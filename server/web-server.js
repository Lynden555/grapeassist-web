const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos de la build de React
app.use(express.static(path.join(__dirname, '../build')));

// Ruta para descargar Windows
app.get('/download/windows', (req, res) => {
    const filePath = path.join(__dirname, '../downloads/GrapeAssist-Windows.exe');
    res.download(filePath, 'GrapeAssist-Windows.exe');
});

// Ruta para descargar macOS
app.get('/download/macos', (req, res) => {
    const filePath = path.join(__dirname, '../downloads/GrapeAssist-Mac.dmg');
    res.download(filePath, 'GrapeAssist-Mac.dmg');
});

// Ruta para descargar Linux
app.get('/download/linux', (req, res) => {
    const filePath = path.join(__dirname, '../downloads/GrapeAssist-Linux.AppImage');
    res.download(filePath, 'GrapeAssist-Linux.AppImage');
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'grapeassist-web' });
});

// Todas las rutas van al index.html de React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🖥️  Servidor web corriendo en puerto ${PORT}`);
});
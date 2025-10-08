import React from 'react';
import { Link } from 'react-scroll';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './App.css';

// Componente de animación personalizado
const AnimatedSection = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  return (
    <div className="App">
      {/* Header con Botón Inicio */}
      <header className="header">
        <nav className="navbar container">
<div className="logo">
  <img src="/uva.png" alt="GrapeAssist Logo" className="logo-icon" />
  GrapeAssist
</div>
          <ul className="nav-links">
            <li><Link to="hero" smooth={true} duration={500}>Inicio</Link></li>
            <li><Link to="solutions" smooth={true} duration={500}>Soluciones</Link></li>
            <li><Link to="pricing" smooth={true} duration={500}>Precios</Link></li>
            <li><Link to="download" smooth={true} duration={500}>Descargar</Link></li>
          </ul>
          <div className="nav-buttons">
            <button className="btn-login">Iniciar Sesión</button>
            <button className="btn-primary" onClick={() => window.open('/download/windows', '_blank')}>
              Descargar
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section con ID para el scroll */}
      <section id="hero" className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Asistencia Remota Segura
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Asistencia Remota Profesional al Instante, solo <span style={{color: '#FF4500'}}>$9.99 USD</span>
              </motion.p>
              <motion.div 
                className="hero-buttons"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <button className="btn-primary" onClick={() => window.open('/download/windows', '_blank')}>
                  Descargar Ahora
                </button>
                <button className="btn-secondary">Comenzar Prueba</button>
              </motion.div>
            </div>
            <motion.div 
              className="hero-image"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <img src="/COMPU.png" alt="GrapeAssist App" className="app-screenshot" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Soluciones - CON IMÁGENES CIRCULARES */}
      <section id="solutions" className="solutions-innovative">
        <div className="container">
          <AnimatedSection>
            <h2>Soluciones para Cada Industria</h2>
            <p className="section-subtitle">Adaptado a las necesidades específicas de tu sector</p>
          </AnimatedSection>

          <div className="solutions-grid">
            <AnimatedSection delay={0.2}>
              <div className="solution-card enterprise">
                <div className="solution-image-circle">
                  <img src="/empresa.jpg" alt="Solución Empresarial" />
                </div>
                <h3>Empresarial</h3>
                <p>Gestión centralizada de TI para empresas con múltiples ubicaciones</p>
                <div className="solution-features">
                  <span>Active Directory</span>
                  <span>MDM Integrado</span>
                  <span>Reporting Avanzado</span>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="solution-card education">
                <div className="solution-image-circle">
                  <img src="/escuela.jpg" alt="Solución Educación" />
                </div>
                <h3>Educación</h3>
                <p>Aulas virtuales, laboratorios remotos y soporte estudiantil 24/7</p>
                <div className="solution-features">
                  <span>LMS Integration</span>
                  <span>Controles Docentes</span>
                  <span>Ambientes Seguros</span>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="solution-card retail">
                <div className="solution-image-circle">
                  <img src="/tienda.jpg" alt="Solución Retail" />
                </div>
                <h3>Retail & POS</h3>
                <p>Soporte para sistemas punto de venta y gestión de inventario</p>
                <div className="solution-features">
                  <span>POS Integration</span>
                  <span>Multi-store</span>
                  <span>Inventory Sync</span>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <div className="solution-card healthcare">
                <div className="solution-image-circle">
                  <img src="/medico.jpg" alt="Solución Salud" />
                </div>
                <h3>Salud</h3>
                <p>Telemedicina HIPAA compliant y soporte para equipos médicos</p>
                <div className="solution-features">
                  <span>HIPAA Compliant</span>
                  <span>HD Video</span>
                  <span>EHR Integration</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="pricing" className="pricing">
        <div className="container">
          <h2>Planes que se Adaptan a Ti</h2>
          <div className="pricing-cards">
            <div className="pricing-card basic">
              <div className="pricing-header">
                <h3>Basic</h3>
                <div className="price">$9.99<span>/mes</span></div>
              </div>
              <ul className="features-list">
                <li>✅ 10 Licencias</li>
                <li>✅ Soporte básico</li>
                <li>✅ Encriptación estándar</li>
                <li>✅ 3 Conexiones Simultaneas</li>
                <li>❌ Soporte prioritario</li>
                <li>❌ Funciones empresariales</li>
              </ul>
              <button className="pricing-btn">Comenzar</button>
            </div>

            <div className="pricing-card pro">
              <div className="pricing-badge">MÁS POPULAR</div>
              <div className="pricing-header">
                <h3>Pro</h3>
                <div className="price">$29.99<span>/mes</span></div>
              </div>
              <ul className="features-list">
                <li>✅ 20 Licencias</li>
                <li>✅ Soporte premium 24/7</li>
                <li>✅ Encriptación avanzada</li>
                <li>✅ 6 Conexiones Simultaneas</li>
                <li>✅ Soporte prioritario</li>
                <li>✅ Todas las funciones</li>
              </ul>
              <button className="pricing-btn primary">Comenzar</button>
            </div>
          </div>
        </div>
      </section>


      {/* Sección Descarga Final MODIFICADA */}
      <section id="download" className="download-cta">
        <div className="container">
          <h2>¿Listo para Comenzar?</h2>
          <p>Descarga GrapeAssist hoy y experimenta la diferencia</p>
          <div className="download-buttons">
          <button className="btn-primary large" onClick={() => window.open('/download/windows', '_blank')}>
            Descargar Ahora
          </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 GrapeAssist. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
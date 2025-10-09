import React, { useState } from 'react';
import './Auth.css';

const Register = ({ onClose, onSwitchToLogin, registerType = 'trial' }) => { // 🆕 Recibir prop
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPlanSelection, setShowPlanSelection] = useState(false); // 🆕
  const [registeredUser, setRegisteredUser] = useState(null); // 🆕

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://grapeassist-backend-production.up.railway.app/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.ok) {
        // Guardar token y usuario
        localStorage.setItem('grape_token', data.token);
        localStorage.setItem('grape_user', JSON.stringify(data.user));
        setRegisteredUser(data.user); // 🆕 Guardar usuario registrado

        // 🆕 FLUJO DIFERENCIADO
        if (registerType === 'plan') {
          setShowPlanSelection(true); // Mostrar selección de planes
        } else {
          // Flujo trial normal - ir al dashboard
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.error || 'Error en el registro');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 FUNCIÓN PARA MANEJAR COMPRA DE PLAN
  const handlePlanPurchase = async (planType) => {
    setLoading(true);
    try {
      const priceIds = {
        basic: 'price_1SGSBtIDytpi2VvnWLca0CdE',
        pro: 'price_1SGSFUIDytpi2VvnRZK6qhen'
      };

      const response = await fetch('https://grapeassist-backend-production.up.railway.app/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIds[planType],
          userId: registeredUser.id,
          customerEmail: registeredUser.email,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=canceled`
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        window.location.href = data.url; // Redirigir a Stripe Checkout
      } else {
        setError('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 COMPONENTE DE SELECCIÓN DE PLANES
  const PlanSelection = () => (
    <div className="plan-selection">
      <div className="plan-selection-header">
        <h3>Elige tu Plan</h3>
        <p>¡Registro exitoso! Ahora elige tu plan para comenzar</p>
      </div>

      <div className="plan-cards">
        <div className="plan-card basic">
          <div className="plan-header">
            <h4>Plan Basic</h4>
            <div className="price">$9.99<span>/mes</span></div>
          </div>
          <ul className="plan-features">
            <li>✅ 3 conexiones simultáneas</li>
            <li>✅ Control remoto completo</li>
            <li>✅ Soporte básico</li>
          </ul>
          <button 
            onClick={() => handlePlanPurchase('basic')}
            disabled={loading}
            className="plan-btn"
          >
            {loading ? 'Procesando...' : 'Elegir Basic'}
          </button>
        </div>

        <div className="plan-card pro">
          <div className="plan-header">
            <h4>Plan Pro</h4>
            <div className="price">$19.99<span>/mes</span></div>
          </div>
          <ul className="plan-features">
            <li>✅ 6 conexiones simultáneas</li>
            <li>✅ Control remoto completo</li>
            <li>✅ Soporte prioritario 24/7</li>
            <li>✅ Transferencia de archivos</li>
          </ul>
          <button 
            onClick={() => handlePlanPurchase('pro')}
            disabled={loading}
            className="plan-btn primary"
          >
            {loading ? 'Procesando...' : 'Elegir Pro'}
          </button>
        </div>
      </div>

      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="skip-btn"
      >
        Usar Demo Gratis Primero
      </button>
    </div>
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🆕 RENDER CONDICIONAL
  if (showPlanSelection) {
    return (
      <div className="auth-modal">
        <div className="auth-content plan-selection-content">
          <PlanSelection />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <button className="auth-close" onClick={onClose}>×</button>
        
        <div className="auth-header">
          <img src="/uva.png" alt="GrapeAssist" className="auth-logo" />
          <h2>Crear Cuenta</h2>
          <p>Comienza con 3 conexiones gratis</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creando Cuenta...' : 'Crear Cuenta Gratis'}
          </button>
        </form>

        <div className="auth-switch">
          ¿Ya tienes cuenta? 
          <button onClick={onSwitchToLogin} className="auth-link">
            Inicia Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
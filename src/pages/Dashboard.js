import React, { useState, useEffect } from 'react';
import RemoteSupport from '../components/RemoteSupport/RemoteSupport';
import './Dashboard.css';

const API_BASE = "https://grapeassist-backend-production.up.railway.app";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userLimits, setUserLimits] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('remote');
  const [showRemoteSupport, setShowRemoteSupport] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('grape_user');
    const token = localStorage.getItem('grape_token');
    
    if (!userData || !token) {
      window.location.href = '/';
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    loadUserData(userObj.id);
  }, []);

  const loadUserData = async (userId) => {
    try {
      setLoading(true);
      
      // Cargar límites del usuario
      const limitsResponse = await fetch(`${API_BASE}/user/limits/${userId}`);
      const limitsData = await limitsResponse.json();
      
      if (limitsData.ok) {
        setUserLimits(limitsData.user);
      }

      // Cargar historial de sesiones
      try {
        const historyResponse = await fetch(`${API_BASE}/user/sessions/${userId}`);
        const historyData = await historyResponse.json();
        
        if (historyData.ok && historyData.sessions) {
          setSessionHistory(historyData.sessions);
        }
      } catch (historyError) {
        console.log('El endpoint de historial no está disponible aún');
        // Usar datos de ejemplo temporalmente
        setSessionHistory([
          {
            id: 1,
            date: '2024-01-15T14:30:00Z',
            duration: '25 min',
            status: 'completed',
            clientCode: 'ABC123'
          },
          {
            id: 2,
            date: '2024-01-14T10:15:00Z',
            duration: '18 min',
            status: 'completed',
            clientCode: 'DEF456'
          }
        ]);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRemoteSession = async () => {
    if (!user || !userLimits) return;

    // Verificar límites basado en el plan
    const canConnect = (() => {
      switch (userLimits.planType) {
        case 'demo':
          return userLimits.trialUsed < 3;
        case 'basic':
          return userLimits.activeConnections < 3;
        case 'pro':
          return userLimits.activeConnections < 6;
        case 'enterprise':
          return true;
        default:
          return true;
      }
    })();

    if (!canConnect) {
      setShowUpgradeModal(true);
      return;
    }

    setShowRemoteSupport(true);
  };

  const stopRemoteSession = () => {
    setShowRemoteSupport(false);
    // Recargar datos cuando se cierra una sesión
    if (user) {
      loadUserData(user.id);
    }
  };

  const logout = () => {
    localStorage.removeItem('grape_token');
    localStorage.removeItem('grape_user');
    window.location.href = '/';
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
  };

  const handleUpgradePlan = (planType) => {
    // Aquí integrarás con Stripe - mismo flujo que tu página principal
    console.log('Mejorar a plan:', planType);
    // window.location.href = `/pricing?plan=${planType}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { text: 'Completada', class: 'status-completed' },
      active: { text: 'Activa', class: 'status-active' },
      failed: { text: 'Fallida', class: 'status-failed' },
      cancelled: { text: 'Cancelada', class: 'status-cancelled' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (!user) {
    return <div className="dashboard-loading">Cargando...</div>;
  }

  // Si estamos en una sesión remota, mostrar solo el componente RemoteSupport
  if (showRemoteSupport) {
    return (
      <div className="remote-session-container">
        <div className="remote-session-header">
          <button onClick={stopRemoteSession} className="back-to-dashboard-btn">
            ← Volver al Dashboard
          </button>
          <div className="session-user-info">
            <span>Sesión activa: {user.name}</span>
            <span className="user-plan">{user.planType.toUpperCase()}</span>
          </div>
        </div>
        <RemoteSupport />
      </div>
    );
  }

  // Vista normal del dashboard
  return (
    <div className="dashboard">
      {/* Modal de Mejorar Plan Unificado */}
      {showUpgradeModal && (
        <div className="modal-overlay">
          <div className="upgrade-modal">
            <div className="modal-header">
              <h3>🚀 Mejorar Plan</h3>
              <button onClick={closeUpgradeModal} className="modal-close-btn">×</button>
            </div>
            <div className="modal-content">
              <div className="upgrade-message">
                <p>Desbloquea todo el potencial de GrapeAssist</p>
                <p><strong>Elige el plan perfecto para tus necesidades:</strong></p>
              </div>
              
              <div className="plans-comparison">
                <div className="plan-card">
                  <div className="plan-header">
                    <h4>Plan Básico</h4>
                    <div className="plan-price">$9.99/mes</div>
                  </div>
                  <ul className="plan-features">
                    <li>✅ 3 Conexiones Simultáneas</li>
                    <li>✅ Hasta 10 Licencias</li>
                    <li>✅ Soporte Básico</li>
                    <li>✅ Encriptación Estándar</li>
                    <li>❌ Soporte Prioritario</li>
                    <li>❌ Funciones Empresariales</li>
                  </ul>
                  <button 
                    className="plan-select-btn"
                    onClick={() => handleUpgradePlan('basic')}
                  >
                    Elegir Básico
                  </button>
                </div>
                
                <div className="plan-card featured">
                  <div className="plan-badge">Recomendado</div>
                  <div className="plan-header">
                    <h4>Plan Pro</h4>
                    <div className="plan-price">$19.99/mes</div>
                  </div>
                  <ul className="plan-features">
                    <li>✅ 6 Conexiones Simultáneas</li>
                    <li>✅ Hasta 20 Licencias</li>
                    <li>✅ Soporte Premium 24/7</li>
                    <li>✅ Encriptación Avanzada</li>
                    <li>✅ Soporte Prioritario</li>
                    <li>✅ Todas las Funciones</li>
                  </ul>
                  <button 
                    className="plan-select-btn primary"
                    onClick={() => handleUpgradePlan('pro')}
                  >
                    Elegir Pro
                  </button>
                </div>
              </div>
              
              <div className="modal-actions">
                <button onClick={closeUpgradeModal} className="cancel-btn">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <div className="dashboard-logo">
              <img src="/uva.png" alt="GrapeAssist" />
              <span>GrapeAssist</span>
            </div>
            <div className="dashboard-user">
              <div className="user-plan-info">
                <span className="welcome-text">Hola, {user.name}</span>
                <span className={`plan-badge ${user.planType}`}>
                  Plan: {user.planType.toUpperCase()}
                </span>
                {(user.planType === 'demo' || user.planType === 'basic') && (
                  <button 
                    className="improve-plan-btn"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    Mejorar Plan
                  </button>
                )}
              </div>
              <button onClick={logout} className="btn-logout">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-welcome">
            <h1>Panel de Control Técnico</h1>
            <div className="plan-info">
              <span className={`plan-badge ${user.planType}`}>
                Plan: {user.planType.toUpperCase()}
              </span>
              {userLimits && (
                <span className="connections-counter">
                  {userLimits.planType === 'demo' ? (
                    <>Conexiones demo: {userLimits.trialUsed || 0}/3</>
                  ) : (
                    <>Conexiones activas: {userLimits.activeConnections || 0}</>
                  )}
                </span>
              )}
              {(user.planType === 'demo' || user.planType === 'basic') && (
                <button 
                  className="improve-plan-btn secondary"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Mejorar Plan
                </button>
              )}
            </div>
          </div>

          {/* Navegación de pestañas */}
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'remote' ? 'active' : ''}`}
              onClick={() => setActiveTab('remote')}
            >
              Asistencia Remota
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Historial de Sesiones
            </button>
          </div>

          {/* Contenido de pestañas */}
          <div className="tab-content">
            {activeTab === 'remote' && (
              <div className="remote-tab">
                <div className="connection-panel">
                  <h2 className="connection-title">Iniciar Asistencia Remota</h2>
                  
                  {userLimits && (() => {
                    const canConnect = (() => {
                      switch (userLimits.planType) {
                        case 'demo': return userLimits.trialUsed < 3;
                        case 'basic': return userLimits.activeConnections < 3;
                        case 'pro': return userLimits.activeConnections < 6;
                        case 'enterprise': return true;
                        default: return true;
                      }
                    })();

                    if (!canConnect) {
                      return (
                        <div className="demo-limit-reached">
                          <div className="limit-header">
                            <h3>🚫 Límite Alcanzado</h3>
                            <p>
                              {userLimits.planType === 'demo' 
                                ? 'Has usado tus 3 conexiones demo gratuitas.'
                                : `Has alcanzado el límite de conexiones de tu plan ${userLimits.planType}.`
                              }
                            </p>
                          </div>
                          <div className="limit-content">
                            <p>Actualiza tu plan para continuar brindando asistencia:</p>
                            <ul>
                              <li>✅ Hasta 10 licencias (Básico) o 20 licencias (Pro)</li>
                              <li>✅ Soporte {userLimits.planType === 'demo' ? 'básico' : 'premium 24/7'}</li>
                              <li>✅ Encriptación {userLimits.planType === 'demo' ? 'estándar' : 'avanzada'}</li>
                              <li>✅ {userLimits.planType === 'demo' ? '3' : '6'} Conexiones Simultáneas</li>
                            </ul>
                            <button 
                              className="upgrade-btn"
                              onClick={() => setShowUpgradeModal(true)}
                            >
                              Mejorar Plan
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="session-guide">
                        <div className="session-limits">
                          <h4>Límites de tu plan:</h4>
                          <div className="limits-grid">
                            <div className="limit-item">
                              <span className="limit-label">Conexiones {userLimits.planType === 'demo' ? 'demo' : 'simultáneas'}:</span>
                              <span className="limit-value">
                                {userLimits.planType === 'demo' 
                                  ? `${userLimits.trialUsed || 0}/3` 
                                  : userLimits.planType === 'basic' ? '3' :
                                    userLimits.planType === 'pro' ? '6' : 'Ilimitadas'
                                }
                              </span>
                            </div>
                            <div className="limit-item">
                              <span className="limit-label">Tiempo por sesión:</span>
                              <span className="limit-value">
                                {userLimits.planType === 'demo' ? '30 min' : 'Ilimitado'}
                              </span>
                            </div>
                            <div className="limit-item">
                              <span className="limit-label">Control remoto:</span>
                              <span className="limit-value">
                                {userLimits.planType === 'demo' ? '✅ Básico' : '✅ Completo'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={startRemoteSession}
                          className="start-session-btn"
                          disabled={loading}
                        >
                          {loading ? '🔄 Cargando...' : '🚀 Iniciar Sesión Remota'}
                        </button>

                        {userLimits.planType === 'demo' && (
                          <div className="demo-warning">
                            <p>
                              ⚠️ Te quedan <strong>{3 - (userLimits.trialUsed || 0)} conexiones demo</strong>. 
                              Cada sesión iniciada consume 1 conexión.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="history-tab">
                <h2>Historial de Sesiones</h2>
                
                {sessionHistory.length > 0 ? (
                  <div className="sessions-list">
                    <div className="sessions-header">
                      <span>Fecha y Hora</span>
                      <span>Duración</span>
                      <span>Estado</span>
                      <span>Código Cliente</span>
                    </div>
                    {sessionHistory.map((session) => (
                      <div key={session.id} className="session-item">
                        <span className="session-date">{formatDate(session.date)}</span>
                        <span className="session-duration">{session.duration}</span>
                        {getStatusBadge(session.status)}
                        <span className="session-code">{session.clientCode}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-sessions">
                    <p>No hay sesiones registradas aún.</p>
                    <p>Inicia tu primera sesión remota para ver el historial aquí.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
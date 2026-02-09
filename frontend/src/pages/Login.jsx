import PropTypes from 'prop-types';
import { useState } from 'react';
import './Login.css';

const Login = ({ onLoginExitoso, onCambiarARegistro }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Usuario no encontrado');
      }

      const usuario = await response.json();
      localStorage.setItem('usuarioid', usuario.id);
      localStorage.setItem('usuarioemail', usuario.email);
      localStorage.setItem('usuarionombre', usuario.nombre);
      
      console.log('Login exitoso:', usuario);
      if (onLoginExitoso) onLoginExitoso(usuario);
    } catch (err) {
      setError(err.message);
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Bienvenido</h2>
        <p className="subtitle">Sistema de Recomendación de Vehículos</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            {/* CORRECCIÓN 1: Label conectado con htmlFor */}
            <label htmlFor="login-email">Correo Electrónico</label>
            <input
              id="login-email" /* CORRECCIÓN 2: ID para conectar con el label */
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              autoFocus
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="divider">
          <span>¿No tienes cuenta?</span>
        </div>

        <button className="btn-registro-link" onClick={onCambiarARegistro}>
          Regístrate aquí
        </button>
      </div>
    </div>
  );
};

// CORRECCIÓN 3: Validación de Props
Login.propTypes = {
  onLoginExitoso: PropTypes.func,
  onCambiarARegistro: PropTypes.func
};

export default Login;
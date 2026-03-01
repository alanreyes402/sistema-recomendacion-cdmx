import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, Car } from 'lucide-react';

const Auth = ({ onLoginExitoso }) => {
  // Estado para alternar entre 'login' y 'registro'
  const [modo, setModo] = useState('login');
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  
  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = modo === 'login' ? '/api/usuarios/login' : '/api/usuarios/registro';
    const payload = modo === 'login' 
      ? { email, password } 
      : { nombre, email, password };

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ocurrió un error');
      }

      const usuario = await response.json();
      localStorage.setItem('usuarioid', usuario.id);
      localStorage.setItem('usuarioemail', usuario.email);
      localStorage.setItem('usuarionombre', usuario.nombre);
      
      console.log(`${modo === 'login' ? 'Login' : 'Registro'} exitoso:`, usuario);
      if (onLoginExitoso) onLoginExitoso(usuario);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
        
        {/* Logo y Título */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Car size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bienvenido</h2>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex bg-gray-100 p-1 rounded-full mb-8">
          <button
            type="button"
            onClick={() => { setModo('login'); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              modo === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => { setModo('registro'); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              modo === 'registro' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campo Nombre (Solo en Registro) */}
          {modo === 'registro' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required={modo === 'registro'}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>
          )}

          {/* Campo Correo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com"
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={modo === 'registro' ? "Mín. 8 caracteres" : "••••••••"}
                required
                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Opciones extra (Solo en Login) */}
          {modo === 'login' && (
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Recuperar clave
              </a>
            </div>
          )}

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading 
              ? 'Procesando...' 
              : modo === 'login' ? 'Entrar' : 'Registrarse'}
          </button>

        </form>
      </div>
    </div>
  );
};

Auth.propTypes = {
  onLoginExitoso: PropTypes.func.isRequired
};

export default Auth;
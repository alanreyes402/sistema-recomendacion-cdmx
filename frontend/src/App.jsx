import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import Recomendaciones from './components/Recomendaciones';
import Catalogo from './pages/Catalogo';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('landing');

  // Verificar sesión al cargar
  useEffect(() => {
    const usuarioId = localStorage.getItem('usuarioid');
    const usuarioEmail = localStorage.getItem('usuarioemail');
    const usuarioNombre = localStorage.getItem('usuarionombre');

    if (usuarioId && usuarioEmail) {
      console.log('👤 Sesión encontrada:', { usuarioId, usuarioEmail, usuarioNombre });
      setUsuario({
        id: Number.parseInt(usuarioId, 10),
        email: usuarioEmail,
        nombre: usuarioNombre
      });
      setVistaActual('recomendaciones');
    } else {
      console.log('👤 No hay sesión activa');
    }
  }, []);

  // Función para manejar el registro del wizard
  const handleStartJourney = async (preferences) => {
    try {
      // VALIDACIÓN: Verificar que preferences existe
      if (!preferences) {
        console.error('❌ preferences es null o undefined');
        alert('Error: No se recibieron las preferencias del formulario');
        return;
      }

      if (!preferences.email) {
        console.error('❌ Email faltante en preferences:', preferences);
        alert('Error: Email no proporcionado');
        return;
      }

      console.log('📝 Preferencias recibidas del wizard:', preferences);
      
      const payload = {
        nombre: preferences.email.split('@')[0] || 'Usuario',
        email: preferences.email,
        edad: 30,
        genero: 'Otro',
        presupuesto_min: Number(preferences.presupuestomin) || 200000,
        presupuesto_max: Number(preferences.presupuestomax) || 600000,
        tipo_vehiculo_preferido: 'Sedán',
        holograma_prioridad: Boolean(preferences.prioridadholograma),
        uso_principal: preferences.usodiario ? 'Trabajo' : 
                       preferences.usofinsemana ? 'Recreación' : 
                       preferences.usofamiliar ? 'Familia' : 'Mixto',
        num_pasajeros_habitual: 2,
        alcaldia: 'Benito Juárez',
        tiene_estacionamiento: false,
        experiencia_conduccion: 'Intermedio',
        combustible_preferido: 'Gasolina',
        transmision_preferida: 'Automática',
        segmento_preferido: 'Compacto'
      };

      console.log('📤 Payload enviando al backend:', JSON.stringify(payload, null, 2));

      const response = await fetch('http://localhost:8000/api/usuarios/registro', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log('📥 Respuesta del servidor:', responseData);

      if (!response.ok) {
        console.error('❌ Error del servidor (status ' + response.status + '):', responseData);
        throw new Error(responseData.detail || JSON.stringify(responseData));
      }

      console.log('✅ Usuario creado exitosamente:', responseData);
      
      localStorage.setItem('usuarioid', responseData.id);
      localStorage.setItem('usuarioemail', responseData.email);
      localStorage.setItem('usuarionombre', responseData.nombre);
      
      console.log('💾 Datos guardados en localStorage');
      
      setUsuario({
        id: responseData.id,
        email: responseData.email,
        nombre: responseData.nombre
      });
      
      setVistaActual('recomendaciones');
      
    } catch (err) {
      console.error('❌ Error completo:', err);
      console.error('❌ Stack trace:', err.stack);
      alert('❌ Error al crear tu perfil:\n\n' + err.message);
    }
  };

  // Función para cerrar sesión
  const handleCerrarSesion = () => {
    console.log('👋 Cerrando sesión');
    localStorage.clear();
    setUsuario(null);
    setVistaActual('landing');
  };

  // Si NO hay usuario, mostrar Landing
  if (!usuario) {
    return <LandingPage onStartJourney={handleStartJourney} />;
  }

  // Si HAY usuario, mostrar Dashboard
  return (
    <div className="App min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              AutoMatch CDMX
            </h1>
            
            <div className="flex items-center gap-4">
              <span className="text-slate-400">{usuario.email}</span>
              
              <button
                onClick={() => setVistaActual('recomendaciones')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  vistaActual === 'recomendaciones'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Para Ti
              </button>
              
              <button
                onClick={() => setVistaActual('catalogo')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  vistaActual === 'catalogo'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Catálogo
              </button>
              
              <button
                onClick={handleCerrarSesion}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main>
        {vistaActual === 'recomendaciones' ? (
          <Recomendaciones usuarioId={usuario.id} />
        ) : (
          <Catalogo />
        )}
      </main>
    </div>
  );
}

export default App;
//probandoooooooooo
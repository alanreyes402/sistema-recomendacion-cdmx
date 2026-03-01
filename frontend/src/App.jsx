import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import TestWizard from './components/TestWizard';
import Recomendaciones from './components/Recomendaciones';
import Catalogo from './pages/Catalogo';
import Auth from "./components/Auth";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('catalogo'); 

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuarioid');
    const usuarioEmail = localStorage.getItem('usuarioemail');
    const usuarioNombre = localStorage.getItem('usuarionombre');

    if (usuarioId && usuarioEmail) {
      setUsuario({
        id: Number.parseInt(usuarioId, 10),
        email: usuarioEmail,
        nombre: usuarioNombre
      });
    }
  }, []);

 const handleStartJourney = async (preferenciasDelTest) => {
    try {
      console.log("📊 Preferencias recolectadas:", preferenciasDelTest);
      
      const usuarioIdExistente = localStorage.getItem('usuarioid');
      let emailUsuario = localStorage.getItem('usuarioemail');
      let nombreUsuario = localStorage.getItem('usuarionombre');
      let passwordUsuario = 'invitado123'; 
      
      if (!emailUsuario) {
        const timestamp = Date.now();
        emailUsuario = `invitado_${timestamp}@automatch.com`;
        nombreUsuario = `Invitado`;
      }

      const asegurarArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);
      const pasajerosArray = asegurarArray(preferenciasDelTest.num_pasajeros_habitual);
      
      const maxPasajeros = pasajerosArray.length > 0 
        ? Math.max(...pasajerosArray.map(val => {
            const texto = String(val).toLowerCase();
            if (texto.includes('7') || texto.includes('mas')) return 7;
            if (texto.includes('5') || texto.includes('4')) return 5;
            if (texto.includes('2') || texto.includes('1')) return 2;
            return 4; 
          }))
        : 4;

      // Ampliamos el rango de presupuesto para asegurar que haya resultados
      const presupuestoMaximo = (preferenciasDelTest.presupuesto_max || 300000);

      const payload = {
        nombre: nombreUsuario,
        email: emailUsuario,
        password: passwordUsuario,
        presupuesto_min: 20000, // Bajamos el mínimo para que abarque autos económicos como los de tu catálogo
        presupuesto_max: presupuestoMaximo * 1.5, // Damos 50% de holgura para que el modelo de ML tenga opciones
        uso_principal: asegurarArray(preferenciasDelTest.uso_principal).join(', ') || 'Mixto',
        num_pasajeros_habitual: maxPasajeros,
        transmision_preferida: asegurarArray(preferenciasDelTest.transmision_preferida).join(', ') || 'Automática',
        combustible_preferido: asegurarArray(preferenciasDelTest.combustible_preferido).join(', ') || 'Gasolina',
        holograma_prioridad: asegurarArray(preferenciasDelTest.color_engomado).length > 0 ? '00' : 'no_importa'
      };

      // LÓGICA CLAVE: Si ya tiene ID, ACTUALIZAMOS. Si no, REGISTRAMOS.
      const url = usuarioIdExistente 
        ? `http://localhost:8000/api/usuarios/${usuarioIdExistente}/preferencias`
        : 'http://localhost:8000/api/usuarios/registro';
        
      const metodo = usuarioIdExistente ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: metodo,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || JSON.stringify(responseData));
      }
      
      // Guardamos en local (responseData.usuario viene del PUT, responseData directo viene del POST)
      const idGuardar = responseData.usuario ? responseData.usuario.id : responseData.id;
      const emailGuardar = responseData.usuario ? responseData.usuario.email : responseData.email;
      const nombreGuardar = responseData.usuario ? responseData.usuario.nombre : responseData.nombre;

      localStorage.setItem('usuarioid', idGuardar);
      localStorage.setItem('usuarioemail', emailGuardar);
      localStorage.setItem('usuarionombre', nombreGuardar);
      
      setUsuario({ id: idGuardar, email: emailGuardar, nombre: nombreGuardar });
      
      // Forzamos la actualización de la vista de recomendaciones
      setVistaActual('catalogo'); // Un pequeño truco de react
      setTimeout(() => setVistaActual('recomendaciones'), 50);
      
    } catch (err) {
      console.error('❌ Error completo:', err);
      alert('❌ Error al procesar tu test:\n\n' + err.message);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    setUsuario(null);
    setVistaActual('catalogo');
  };

  if (vistaActual === 'landing') return <LandingPage onStartJourney={() => setVistaActual('test')} />;
  if (vistaActual === 'test') return <TestWizard onComplete={handleStartJourney} />;

  return (
    <div className="App min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer transition-transform hover:scale-105" 
              onClick={() => setVistaActual('catalogo')}
            >
              AutoMatch CDMX
            </h1>
            
            <div className="flex items-center gap-4">
              {usuario ? (
                <>
                  <span className="text-gray-500 font-medium hidden md:inline-block">
                    {usuario.nombre === 'Invitado' ? 'Modo Invitado' : usuario.email}
                  </span>
                  
                  {/* NUEVO: Botón de Hacer Test para usuarios logueados */}
                  <button
                    onClick={() => setVistaActual('test')}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold transition-colors"
                  >
                    Actualizar Test
                  </button>

                  <button
                    onClick={() => setVistaActual('recomendaciones')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      vistaActual === 'recomendaciones' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Para Ti
                  </button>
                  <button
                    onClick={() => setVistaActual('catalogo')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      vistaActual === 'catalogo' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Catálogo
                  </button>
                  <button
                    onClick={handleCerrarSesion}
                    className="px-4 py-2 bg-gray-100 hover:bg-red-50 border border-gray-200 hover:border-red-200 hover:text-red-600 rounded-lg font-semibold text-gray-600 transition-colors"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setVistaActual('login')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      vistaActual === 'login' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => setVistaActual('test')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Iniciar Test
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-6 pb-12">
        {vistaActual === 'login' ? (
          <Auth 
            onLoginExitoso={(user) => {
              setUsuario(user);
              // CORRECCIÓN: Ahora manda al catálogo después de loguearse
              setVistaActual('catalogo');
            }} 
            onCambiarARegistro={() => alert("Vista de registro en construcción")}
          />
        ) : vistaActual === 'recomendaciones' && usuario ? (
          <Recomendaciones usuarioId={usuario.id} />
        ) : (
          <Catalogo />
        )}
      </main>
    </div>
  );
}

export default App;
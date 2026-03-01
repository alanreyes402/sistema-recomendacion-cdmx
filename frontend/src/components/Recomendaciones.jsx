import { useState, useEffect } from 'react';
import { MapPin, Heart } from 'lucide-react';
import PropTypes from 'prop-types';
import FichaTecnicaModal from './FichaTecnicaModal'; // Asegúrate de que este archivo exista en la misma carpeta

const Recomendaciones = ({ usuarioId }) => {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);
  
  // Estado para controlar el modal de la ficha técnica
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

  useEffect(() => {
    const fetchRecomendaciones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Buscando recomendaciones para usuario:', usuarioId);
        
        const response = await fetch(
          `http://localhost:8000/api/usuarios/${usuarioId}/recomendaciones?top_n=${topN}`
        );
        
        if (!response.ok) {
          throw new Error('Error al obtener recomendaciones');
        }
        
        const data = await response.json();
        console.log('✅ Recomendaciones recibidas:', data);
        setRecomendaciones(data.recomendaciones || data);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) {
      fetchRecomendaciones();
    }
  }, [usuarioId, topN]);

  // Función para registrar interacción en el backend
  const registrarInteraccion = async (vehiculoId, tipo) => {
    try {
      await fetch('http://localhost:8000/api/interacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioId,
          vehiculo_id: vehiculoId,
          tipo_interaccion: tipo
        })
      });
      console.log(`✅ Interacción registrada: ${tipo} en vehículo ${vehiculoId}`);
    } catch (err) {
      console.error('Error registrando interacción:', err);
    }
  };

  // Abre el modal y registra el clic
  const handleVerDetalles = (vehiculo) => {
    registrarInteraccion(vehiculo.vehiculo_id, 'click');
    setVehiculoSeleccionado(vehiculo);
  };

  // Registra el favorito sin abrir el modal
  const handleFavorito = (e, vehiculo) => {
    e.stopPropagation(); 
    registrarInteraccion(vehiculo.vehiculo_id, 'favorito');
    alert(`❤️ ${vehiculo.marca} ${vehiculo.modelo} añadido a tus favoritos`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-500 font-medium">Calculando tus mejores opciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h3 className="text-xl font-bold text-red-600 mb-2">Error al cargar</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header estilo Catálogo */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recomendaciones Para Ti
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Seleccionados especialmente para tu perfil
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              id="top-n-select"
              value={topN} 
              onChange={(e) => setTopN(Number.parseInt(e.target.value, 10))}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value={5}>Mejores 5</option>
              <option value={10}>Mejores 10</option>
              <option value={15}>Mejores 15</option>
              <option value={20}>Mejores 20</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        {recomendaciones.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-xl text-gray-500 font-medium">
              Ajusta tus filtros en el test para encontrar más opciones.
            </p>
          </div>
        ) : (
          /* Grid de Recomendaciones */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recomendaciones.map((rec) => (
              <div
                key={rec.vehiculo_id}
                onClick={() => handleVerDetalles(rec)}
                onMouseEnter={() => registrarInteraccion(rec.vehiculo_id, 'vista')}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-100 flex flex-col group"
              >
                {/* Mitad superior: Placeholder gris con badges */}
                <div className="h-52 bg-gray-200 relative p-4 flex justify-between items-start">
                  <span className="bg-white text-blue-700 text-xs font-black px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                    {rec.tipo_vehiculo || 'SEMINUEVO'}
                  </span>
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                    {(rec.score * 100).toFixed(0)}% Match
                  </span>
                </div>

                {/* Mitad inferior: Información */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">
                    {rec.marca} {rec.modelo}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">Modelo {rec.año}</p>

                  <div className="mt-auto">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Precio de venta
                    </p>
                    <div className="flex justify-between items-end mb-4">
                      <p className="text-xl font-black text-gray-900">
                        ${rec.precio.toLocaleString('es-MX')} MXN
                      </p>
                      <button 
                        onClick={(e) => handleFavorito(e, rec)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Heart size={20} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                      <MapPin size={18} className="text-gray-400" />
                      <p className="text-xs text-blue-600 font-medium truncate max-w-[180px]" title={rec.razon}>
                        {rec.razon.split('|')[0] || 'Sugerido para ti'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Renderizado del Modal */}
      {vehiculoSeleccionado && (
        <FichaTecnicaModal 
          vehiculo={vehiculoSeleccionado} 
          onClose={() => setVehiculoSeleccionado(null)} 
        />
      )}
    </div>
  );
};

Recomendaciones.propTypes = {
  usuarioId: PropTypes.number
};

export default Recomendaciones;
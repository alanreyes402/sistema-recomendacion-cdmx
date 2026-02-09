import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Award } from 'lucide-react';
import PropTypes from 'prop-types';

const Recomendaciones = ({ usuarioId }) => {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);

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
    } else {
      console.warn('⚠️ No hay usuarioId');
    }
  }, [usuarioId, topN]);

  // Función para registrar interacción
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

  const handleVerDetalles = (vehiculo) => {
    registrarInteraccion(vehiculo.vehiculo_id, 'click');
    alert(`Ver detalles de ${vehiculo.marca} ${vehiculo.modelo}`);
  };

  const handleFavorito = (vehiculo) => {
    registrarInteraccion(vehiculo.vehiculo_id, 'favorito');
    alert(`❤️ ${vehiculo.marca} ${vehiculo.modelo} añadido a favoritos`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-xl text-slate-300">Cargando recomendaciones personalizadas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-8">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-2xl p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-red-400 mb-4">❌ Error</h3>
          <p className="text-slate-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold text-white transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-50 mb-2">
              Recomendaciones Para Ti
            </h2>
            <p className="text-slate-400">
              {recomendaciones.length} vehículos perfectos para tu perfil
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* CORRECCIÓN: label for + id */}
            <label htmlFor="top-n-select" className="text-slate-300 font-semibold">
              Mostrar:
            </label>
            <select 
              id="top-n-select"
              value={topN} 
              onChange={(e) => setTopN(Number.parseInt(e.target.value, 10))}
              className="px-4 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-50 font-semibold cursor-pointer hover:border-purple-500 transition-colors"
            >
              <option value={5}>5 vehículos</option>
              <option value={10}>10 vehículos</option>
              <option value={15}>15 vehículos</option>
              <option value={20}>20 vehículos</option>
            </select>
          </div>
        </div>

        {/* Grid de Recomendaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recomendaciones.map((rec, index) => (
            <motion.div
              key={rec.vehiculo_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden hover:border-purple-500 transition-all duration-300 group"
              onMouseEnter={() => registrarInteraccion(rec.vehiculo_id, 'vista')}
            >
              {/* Badge de ranking */}
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                #{index + 1}
              </div>

              {/* Score bar */}
              <div className="relative h-3 bg-slate-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rec.score * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="absolute h-full bg-gradient-to-r from-emerald-500 to-green-400"
                />
              </div>

              {/* Contenido */}
              <div className="p-6">
                {/* Título */}
                <h3 className="text-2xl font-bold text-slate-50 mb-1">
                  {rec.marca} {rec.modelo}
                </h3>
                <p className="text-slate-400 mb-4">{rec.año}</p>

                {/* Precio */}
                <div className="mb-4">
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    ${rec.precio.toLocaleString('es-MX')}
                  </p>
                </div>

                {/* Detalles */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500 rounded-full text-xs font-bold text-emerald-400 flex items-center gap-1">
                    🍃 Holograma {rec.holograma}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500 rounded-full text-xs font-bold text-blue-400">
                    {rec.tipo_vehiculo}
                  </span>
                </div>

                {/* Score visual */}
                <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm font-semibold">Compatibilidad</span>
                    <span className="text-emerald-400 text-lg font-black">
                      {(rec.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Tus preferencias</p>
                      <p className="text-purple-400 font-bold">
                        {(rec.score_usuario * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Similitud</p>
                      <p className="text-pink-400 font-bold">
                        {(rec.score_knn * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Razones */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
                  <p className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
                    <Award size={14} />
                    ¿Por qué te lo recomendamos?
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {rec.razon}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerDetalles(rec)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-bold text-white transition-all transform hover:scale-105"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => handleFavorito(rec)}
                    className="px-4 py-3 bg-slate-700 hover:bg-red-500 border-2 border-slate-600 hover:border-red-500 rounded-lg transition-all transform hover:scale-105"
                  >
                    <Heart className="text-slate-300" size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {recomendaciones.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-400">
              No hay recomendaciones disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// CORRECCIÓN: Agregamos PropTypes
Recomendaciones.propTypes = {
  usuarioId: PropTypes.number
};

export default Recomendaciones;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Heart } from 'lucide-react';

const Catalogo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    marca: '',
    holograma: '',
    precioMin: '',
    precioMax: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/vehiculos?limite=300')
      .then(res => res.json())
      .then(data => {
        const vehicles = data.vehiculos || data;
        setVehiculos(vehicles);
        setFiltrados(vehicles);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let resultado = [...vehiculos];

    if (busqueda) {
      resultado = resultado.filter(v =>
        `${v.marca} ${v.modelo}`.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtros.marca) {
      resultado = resultado.filter(v => v.marca === filtros.marca);
    }

    if (filtros.holograma) {
      resultado = resultado.filter(v => v.holograma === filtros.holograma);
    }

    // CORRECCIÓN 1: Number.parseInt con base 10
    if (filtros.precioMin) {
      resultado = resultado.filter(v => v.precio >= Number.parseInt(filtros.precioMin, 10));
    }
    if (filtros.precioMax) {
      resultado = resultado.filter(v => v.precio <= Number.parseInt(filtros.precioMax, 10));
    }

    setFiltrados(resultado);
  }, [busqueda, filtros, vehiculos]);

  // CORRECCIÓN 2: sort con localeCompare para evitar error de ordenamiento
  const marcasUnicas = [...new Set(vehiculos.map(v => v.marca))].sort((a, b) => a.localeCompare(b));

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltros({ marca: '', holograma: '', precioMin: '', precioMax: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-xl text-slate-300">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-black mb-3">
              <span className="text-slate-50">Catálogo </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
                CDMX
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-lg">
              <span className="text-2xl">🚗</span>
              <p>
                Explorando <span className="text-purple-400 font-bold">{filtrados.length}</span> de{' '}
                <span className="text-slate-300 font-bold">{vehiculos.length}</span> vehículos disponibles
              </p>
            </div>
          </motion.div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-wrap">
            {/* Búsqueda */}
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                aria-label="Buscar vehículo por marca o modelo" // Extra seguridad
                type="text"
                placeholder="Buscar marca, modelo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-slate-50 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Botón filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                mostrarFiltros
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-2 border-slate-700'
              }`}
            >
              <Filter size={20} />
              Filtros
            </button>

            {/* Botón limpiar */}
            {(busqueda || filtros.marca || filtros.holograma || filtros.precioMin || filtros.precioMax) && (
              <button
                onClick={limpiarFiltros}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
              >
                <X size={20} />
                Limpiar
              </button>
            )}
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Marca - CORRECCIÓN 3: Label conectado con ID */}
                <div>
                  <label htmlFor="filtro-marca" className="block text-sm font-semibold text-slate-300 mb-2">Marca</label>
                  <select
                    id="filtro-marca"
                    value={filtros.marca}
                    onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-50 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Todas las marcas</option>
                    {marcasUnicas.map(marca => (
                      <option key={marca} value={marca}>{marca}</option>
                    ))}
                  </select>
                </div>

                {/* Holograma - CORRECCIÓN 3: Label conectado con ID */}
                <div>
                  <label htmlFor="filtro-holograma" className="block text-sm font-semibold text-slate-300 mb-2">Holograma</label>
                  <select
                    id="filtro-holograma"
                    value={filtros.holograma}
                    onChange={(e) => setFiltros({ ...filtros, holograma: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-50 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Todos</option>
                    <option value="Exento">Exento (00)</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>

                {/* Precio mínimo - CORRECCIÓN 3: Label conectado con ID */}
                <div>
                  <label htmlFor="filtro-min-precio" className="block text-sm font-semibold text-slate-300 mb-2">Precio Mín.</label>
                  <input
                    id="filtro-min-precio"
                    type="number"
                    placeholder="$50,000"
                    value={filtros.precioMin}
                    onChange={(e) => setFiltros({ ...filtros, precioMin: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-50 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Precio máximo - CORRECCIÓN 3: Label conectado con ID */}
                <div>
                  <label htmlFor="filtro-max-precio" className="block text-sm font-semibold text-slate-300 mb-2">Precio Máx.</label>
                  <input
                    id="filtro-max-precio"
                    type="number"
                    placeholder="$1,000,000"
                    value={filtros.precioMax}
                    onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-50 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Grid de vehículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtrados.map((vehiculo, index) => (
            <motion.div
              key={vehiculo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden hover:border-purple-500 transition-all duration-300 group"
            >
              {/* Header con holograma */}
              <div className="relative h-3 bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/50 to-green-400/50" />
              </div>

              {/* Contenido */}
              <div className="p-5">
                {/* Badge de holograma */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    vehiculo.holograma === 'Exento'
                      ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                      : vehiculo.holograma === '0'
                      ? 'bg-green-500/20 border border-green-500 text-green-400'
                      : vehiculo.holograma === '1'
                      ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400'
                      : 'bg-red-500/20 border border-red-500 text-red-400'
                  }`}>
                    🍃 Holograma {vehiculo.holograma}
                  </span>
                </div>

                {/* Título */}
                <h3 className="text-xl font-bold text-slate-50 mb-1">
                  {vehiculo.marca} {vehiculo.modelo}
                </h3>
                <p className="text-slate-400 mb-3 text-sm">{vehiculo.año}</p>

                {/* Especificaciones */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>⚙️</span>
                    <span>{vehiculo.tipo_vehiculo || 'Sedán'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>⛽</span>
                    <span>{vehiculo.combustible || 'Gasolina'}</span>
                  </div>
                </div>

                {/* Precio */}
                <div className="mb-4">
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    ${vehiculo.precio.toLocaleString('es-MX')}
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Ver detalles de ${vehiculo.marca} ${vehiculo.modelo}`)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold text-white text-sm transition-all"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => alert(`❤️ ${vehiculo.marca} ${vehiculo.modelo} añadido a favoritos`)}
                    className="px-3 py-2 bg-slate-700 hover:bg-red-500 border-2 border-slate-600 hover:border-red-500 rounded-lg transition-all"
                  >
                    <Heart size={18} className="text-slate-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filtrados.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-400 mb-4">No se encontraron vehículos</p>
            <button
              onClick={limpiarFiltros}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-white transition-all"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
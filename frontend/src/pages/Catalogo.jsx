import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown } from 'lucide-react';

const Catalogo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se ajustó para utilizar el parámetro de paginación de tu backend (page_size)
    fetch('http://localhost:8000/api/vehiculos?page_size=100')
      .then(res => res.json())
      .then(data => {
        // Tu backend en FastAPI devuelve un objeto con la llave "vehiculos"
        const vehicles = data.vehiculos || [];
        setVehiculos(vehicles);
        setFiltrados(vehicles);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar:', err);
        setLoading(false);
      });
  }, []);

  // Buscador local para filtrar por marca o modelo
  useEffect(() => {
    if (busqueda) {
      const resultado = vehiculos.filter(v =>
        `${v.marca} ${v.modelo}`.toLowerCase().includes(busqueda.toLowerCase())
      );
      setFiltrados(resultado);
    } else {
      setFiltrados(vehiculos);
    }
  }, [busqueda, vehiculos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-500 font-medium">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Barra de búsqueda principal */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por servicio, marca o modelo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none transition-colors shadow-sm"
          />
        </div>

        {/* Cabecera de resultados y ordenamiento */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <span className="text-gray-500 text-sm font-medium">
            Resultados encontrados
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            Más relevantes
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Grid de vehículos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtrados.map((vehiculo) => (
            <div
              key={vehiculo.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Espacio para la imagen */}
              <div className="relative h-48 bg-gray-200 w-full flex-shrink-0">
                {/* Etiqueta SEMINUEVO estática */}
                <div className="absolute top-3 left-3 bg-white text-blue-600 text-[10px] font-extrabold tracking-wide px-2 py-1 rounded shadow-sm z-10">
                  SEMINUEVO
                </div>
              </div>

              {/* Información del vehículo */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                  {vehiculo.marca} {vehiculo.modelo}
                </h3>
                <p className="text-sm text-gray-500 mb-5 font-medium">
                  Modelo {vehiculo.año}
                </p>

                <div className="mt-auto">
                  <p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wide font-semibold">
                    Precio de venta
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    ${vehiculo.precio.toLocaleString('es-MX')} MXN
                  </p>
                </div>

                <hr className="my-4 border-gray-100" />

                {/* Ícono de ubicación en el pie de la tarjeta */}
                <div className="flex items-center">
                  <MapPin size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje por si la búsqueda no arroja resultados */}
        {filtrados.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">No se encontraron vehículos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
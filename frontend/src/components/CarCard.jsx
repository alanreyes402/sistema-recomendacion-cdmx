import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Leaf } from 'lucide-react';
import { useState } from 'react';
import PropTypes from 'prop-types';

const CarCard = ({ vehiculo, onClick }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const getBadgeColor = (holograma) => {
    if (holograma === '00' || holograma === '0') return 'bg-emerald-500';
    if (holograma === '1') return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* Glassmorphism Card */}
      <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-700 hover:border-purple-500 transition-all"
        >
          <Heart 
            size={20} 
            className={isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-slate-400'} 
          />
        </button>

        {/* Car Image */}
        <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
          {vehiculo.imagen ? (
            <img 
              src={vehiculo.imagen} 
              alt={`${vehiculo.marca} ${vehiculo.modelo}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap size={48} className="text-slate-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`${getBadgeColor(vehiculo.holograma)} px-2 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1`}>
              <Leaf size={12} />
              Holograma {vehiculo.holograma}
            </span>
            {vehiculo.estrellasseguridad >= 4 && (
              <span className="bg-blue-500 px-2 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1">
                <Shield size={12} />
                {vehiculo.estrellasseguridad}★
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-50">
            {vehiculo.marca} {vehiculo.modelo}
          </h3>

          {/* Specs */}
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>{vehiculo.ano}</span>
            <span>•</span>
            <span>{vehiculo.combustible}</span>
            <span>•</span>
            <span>{vehiculo.transmision}</span>
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-slate-700">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Desde</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  ${(vehiculo.precio / 1000).toFixed(0)}K
                </p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-sm font-bold text-white transition-all">
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

CarCard.propTypes = {
  vehiculo: PropTypes.object, // <--- OJO: Debe decir 'vehiculo' (como en tu error), no 'vehicle'
  onClick: PropTypes.func     // <--- Asegúrate de que esta coma esté aquí
};

export default CarCard;
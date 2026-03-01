import React, { useState } from 'react';
import { X, Wallet, CalendarDays, Fuel, ShieldCheck, Maximize, Star, Award, ThumbsUp } from 'lucide-react';

// Fíjate que ahora recibimos "usuarioId" como prop para saber quién está calificando
const FichaTecnicaModal = ({ vehiculo, usuarioId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [calificando, setCalificando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  if (!vehiculo) return null;

  const procesarRazones = (razonString) => {
    if (!razonString) return [];
    const razonesBrutas = razonString.split('|').map(r => r.trim()).filter(r => r);
    
    return razonesBrutas.map((razon, index) => {
      const texto = razon.toLowerCase();
      let titulo = "Destacado";
      let icono = <Award className="text-blue-500" size={24} />;
      let bgIcono = "bg-blue-50";

      if (texto.includes('presupuesto') || texto.includes('precio')) {
        titulo = "Economía";
        icono = <Wallet className="text-emerald-600" size={24} />;
        bgIcono = "bg-emerald-50";
      } else if (texto.includes('holograma') || texto.includes('circula')) {
        titulo = "Circulación";
        icono = <CalendarDays className="text-red-500" size={24} />;
        bgIcono = "bg-red-50";
      } else if (texto.includes('rendimiento') || texto.includes('km/l')) {
        titulo = "Eficiencia";
        icono = <Fuel className="text-blue-600" size={24} />;
        bgIcono = "bg-blue-50";
      } else if (texto.includes('seguridad') || texto.includes('estrella')) {
        titulo = "Seguridad";
        icono = <ShieldCheck className="text-purple-600" size={24} />;
        bgIcono = "bg-purple-50";
      } else if (texto.includes('compacto')) {
        titulo = "Practicidad";
        icono = <Maximize className="text-orange-500" size={24} />;
        bgIcono = "bg-orange-50";
      } else if (texto.includes('similar') || texto.includes('gustos')) {
        titulo = "Tus Gustos";
        icono = <ThumbsUp className="text-indigo-500" size={24} />;
        bgIcono = "bg-indigo-50";
      }

      return { id: index, titulo, descripcion: razon, icono, bgIcono };
    });
  };

  // NUEVA FUNCIÓN: Envía la calificación al backend
  const handleCalificar = async (estrellas) => {
    setRating(estrellas);
    setCalificando(true);
    setMensaje("");

    try {
      await fetch('http://localhost:8000/api/interacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioId,
          vehiculo_id: vehiculo.id || vehiculo.vehiculo_id, // Depende de cómo lo mande tu backend
          tipo_interaccion: 'calificacion',
          calificacion: estrellas,
          peso: estrellas >= 4 ? 5.0 : (estrellas <= 2 ? -2.0 : 1.0) // Lógica rápida de pesos
        })
      });
      setMensaje("¡Gracias por tu opinión!");
      
      // Borramos el mensaje después de 3 segundos
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error('Error al guardar calificación:', err);
      setMensaje("Error al guardar");
    } finally {
      setCalificando(false);
    }
  };

  const razonesProcesadas = procesarRazones(vehiculo.razon);
  const imageUrl = `https://source.unsplash.com/800x600/?car,${vehiculo.marca.toLowerCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-200">
          <div className="absolute top-6 left-6 z-10 bg-green-500 text-white px-4 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1">
            {(vehiculo.score * 100).toFixed(0)}% Coincidencia
          </div>
          <img 
            src={imageUrl} 
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
          <div className="mb-8 pr-8">
            <h2 className="text-3xl font-black text-gray-900 mb-1">
              {vehiculo.marca} • {vehiculo.modelo} {vehiculo.año}
            </h2>
            <p className="text-gray-500 font-medium flex gap-2">
              <span>{vehiculo.kilometraje_km ? `${vehiculo.kilometraje_km.toLocaleString()} km` : 'Kilometraje no especificado'}</span>
              <span>•</span>
              <span>Transmisión {vehiculo.transmision?.toLowerCase() || 'no especificada'}</span>
            </p>
          </div>

          <div className="bg-[#f8faff] rounded-2xl p-6 mb-8 border border-blue-50">
            <h3 className="text-blue-600 font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">🧁</span> 
              Por qué te recomendamos este auto
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Basado en tus respuestas de la ciudad y tus preferencias:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {razonesProcesadas.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${item.bgIcono}`}>
                    {item.icono}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{item.titulo}</h4>
                    <p className="text-xs text-gray-500 leading-tight">{item.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto text-center border-t border-gray-100 pt-6">
            <p className="text-gray-900 font-bold mb-3">¿Qué te pareció?</p>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleCalificar(star)}
                  disabled={calificando}
                  className={`transition-colors duration-200 focus:outline-none ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                  }`}
                >
                  <Star size={36} fill={star <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            {/* Mensaje de feedback al guardar */}
            {mensaje && (
              <p className="text-sm font-bold text-green-600 animate-in fade-in">{mensaje}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FichaTecnicaModal;
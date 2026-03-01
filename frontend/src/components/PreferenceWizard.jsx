import React, { useState } from 'react';
import { 
  Building2, Car, Mountain, Briefcase, Key, 
  Users, Settings, Fuel, Zap, Leaf, CalendarDays 
} from 'lucide-react';

const TestWizard = ({ onComplete }) => {
  const [presupuestoMax, setPresupuestoMax] = useState(300000);
  
  // AHORA SON ARREGLOS PARA PERMITIR MÚLTIPLES SELECCIONES
  const [selecciones, setSelecciones] = useState({
    uso: [],
    pasajeros: [],
    transmision: [],
    combustible: [],
    engomado: []
  });

  const toggleSeleccion = (categoria, valor) => {
    setSelecciones(prev => {
      const actual = prev[categoria];
      // Si ya está seleccionado, lo quitamos. Si no, lo agregamos.
      if (actual.includes(valor)) {
        return { ...prev, [categoria]: actual.filter(v => v !== valor) };
      } else {
        return { ...prev, [categoria]: [...actual, valor] };
      }
    });
  };

  const handleVerResultados = () => {
    const preferencias = {
      presupuesto_max: presupuestoMax,
      uso_principal: selecciones.uso, // Es un array
      num_pasajeros_habitual: selecciones.pasajeros, // Es un array
      transmision_preferida: selecciones.transmision, // Es un array
      combustible_preferido: selecciones.combustible, // Es un array
      color_engomado: selecciones.engomado // Es un array
    };
    onComplete(preferencias);
  };

  const renderBurbuja = (categoria, valor, Icono, etiqueta) => {
    const isSelected = selecciones[categoria].includes(valor);
    return (
      <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => toggleSeleccion(categoria, valor)}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
          isSelected 
            ? 'bg-blue-50 border-2 border-blue-600 text-blue-600 scale-110' 
            : 'bg-white border-2 border-transparent text-gray-400 hover:bg-gray-50'
        }`}>
          <Icono size={32} strokeWidth={isSelected ? 2.5 : 2} />
        </div>
        <span className={`text-sm font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
          {etiqueta}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* SECCIÓN 1: Diseña tu auto ideal */}
        <section className="text-center space-y-8">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Diseña tu auto ideal</h2>
            <p className="text-gray-500">Escoge todo lo que se acople a tus necesidades.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm max-w-xl mx-auto border border-gray-100">
            <h3 className="text-gray-500 font-medium mb-4">Presupuesto Máximo</h3>
            <p className="text-4xl font-black text-blue-600 mb-6">
              ${presupuestoMax.toLocaleString('es-MX')}
            </p>
            <input 
              type="range" 
              min="100000" 
              max="1500000" 
              step="50000"
              value={presupuestoMax}
              onChange={(e) => setPresupuestoMax(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 max-w-3xl mx-auto pt-8">
            {renderBurbuja('uso', 'Ciudad', Building2, 'Ciudad')}
            {renderBurbuja('uso', 'Carretera', Car, 'Carretera')}
            {renderBurbuja('uso', 'Aventurero', Mountain, 'Aventurero')}
            {renderBurbuja('uso', 'Ejecutivo', Briefcase, 'Ejecutivo')}
            {renderBurbuja('uso', 'Primer Auto', Key, 'Primer Auto')}
            
            {renderBurbuja('pasajeros', '2', Users, '1 ó 2 (aprox)')}
            {renderBurbuja('pasajeros', '5', Users, '4 - 5 (aprox)')}
            {renderBurbuja('pasajeros', '7', Users, 'Más de 5 (aprx)')}
            
            {renderBurbuja('transmision', 'Automática', Settings, 'Automático')}
            {renderBurbuja('transmision', 'Manual', Settings, 'Manual')}
            
            {renderBurbuja('combustible', 'Gasolina', Fuel, 'Gasolina')}
            {renderBurbuja('combustible', 'Híbrido', Zap, 'Híbrido')}
            {renderBurbuja('combustible', 'Eléctrico', Zap, 'Eléctrico')}
            {renderBurbuja('combustible', 'Max Ahorro', Leaf, 'Max Ahorro')}
          </div>
        </section>

        {/* SECCIÓN 2: Planea tu movilidad */}
        <section className="text-center space-y-8 pt-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Planea tu movilidad (Hoy No Circula)</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              Selecciona un engomado para conocer su restricción y evitar contratiempos.
            </p>
          </div>

          <div className="flex justify-center gap-6">
            {[
              { color: 'Amarillo', bg: 'bg-yellow-400' },
              { color: 'Rosa', bg: 'bg-pink-500' },
              { color: 'Rojo', bg: 'bg-red-500' },
              { color: 'Verde', bg: 'bg-green-500' },
              { color: 'Azul', bg: 'bg-blue-500' }
            ].map((eng) => (
              <div key={eng.color} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => toggleSeleccion('engomado', eng.color)}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-white shadow-sm transition-all ${selecciones.engomado.includes(eng.color) ? 'ring-4 ring-blue-200 scale-110' : ''}`}>
                  <div className={`w-14 h-14 rounded-full ${eng.bg}`}></div>
                </div>
                <span className="text-sm font-semibold text-gray-600">{eng.color}</span>
              </div>
            ))}
          </div>
          {/* Aquí mantienes la tarjeta de restricciones igual */}
        </section>

        <div className="flex justify-center pb-12">
          <button 
            onClick={handleVerResultados}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-16 rounded-full text-lg shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105"
          >
            Ver Resultados
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestWizard;
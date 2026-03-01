import React, { useState } from 'react';
import { 
  Building2, Car, Mountain, Briefcase, Key, 
  Users, Settings, Fuel, Zap, Leaf, CalendarDays 
} from 'lucide-react';

const TestWizard = ({ onComplete }) => {
  const [presupuestoMax, setPresupuestoMax] = useState(300000);
  
  // Nuevo estado para saber qué engomado tiene el cursor encima
  const [hoveredEngomado, setHoveredEngomado] = useState(null);
  
  const [selecciones, setSelecciones] = useState({
    uso: '',
    pasajeros: '',
    transmision: '',
    combustible: '',
    engomado: ''
  });

  const toggleSeleccion = (categoria, valor) => {
    setSelecciones(prev => ({
      ...prev,
      [categoria]: prev[categoria] === valor ? '' : valor
    }));
  };

  const handleVerResultados = () => {
    const preferencias = {
      presupuesto_max: presupuestoMax,
      uso_principal: selecciones.uso,
      num_pasajeros_habitual: selecciones.pasajeros,
      transmision_preferida: selecciones.transmision,
      combustible_preferido: selecciones.combustible,
      color_engomado: selecciones.engomado
    };
    onComplete(preferencias);
  };

  const renderBurbuja = (categoria, valor, Icono, etiqueta) => {
    const isSelected = selecciones[categoria] === valor;
    return (
      <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => toggleSeleccion(categoria, valor)}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
          isSelected 
            ? 'bg-blue-50 border-2 border-blue-500 text-blue-500 scale-110' 
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

  // Datos reales del Hoy No Circula para las tarjetas
  const engomadosData = [
    { color: 'amarillo', bg: 'bg-yellow-400', label: 'Amarillo', day: 'LUNES', digits: '5 y 6' },
    { color: 'rosa', bg: 'bg-pink-500', label: 'Rosa', day: 'MARTES', digits: '7 y 8' },
    { color: 'rojo', bg: 'bg-red-500', label: 'Rojo', day: 'MIÉRCOLES', digits: '3 y 4' },
    { color: 'verde', bg: 'bg-green-500', label: 'Verde', day: 'JUEVES', digits: '1 y 2' },
    { color: 'azul', bg: 'bg-blue-500', label: 'Azul', day: 'VIERNES', digits: '9 y 0' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* SECCIÓN 1: Diseña tu auto ideal */}
        <section className="text-center space-y-8">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Diseña tu auto ideal</h2>
            <p className="text-gray-500">Escoge todo lo que se acople a tus necesidades.</p>
          </div>

          {/* Slider de Presupuesto */}
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

          {/* Grid de Burbujas */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 max-w-3xl mx-auto pt-8">
            {renderBurbuja('uso', 'ciudad', Building2, 'Ciudad')}
            {renderBurbuja('uso', 'carretera', Car, 'Carretera')}
            {renderBurbuja('uso', 'aventurero', Mountain, 'Aventurero')}
            {renderBurbuja('uso', 'ejecutivo', Briefcase, 'Ejecutivo')}
            {renderBurbuja('uso', 'primer_auto', Key, 'Primer Auto')}
            
            {renderBurbuja('pasajeros', '1_2', Users, '1 ó 2 (aprox)')}
            {renderBurbuja('pasajeros', '4_5', Users, '4 - 5 (aprox)')}
            {renderBurbuja('pasajeros', 'mas_5', Users, 'Más de 5 (aprx)')}
            
            {renderBurbuja('transmision', 'automatica', Settings, 'Automático')}
            {renderBurbuja('transmision', 'manual', Settings, 'Manual')}
            
            {renderBurbuja('combustible', 'gasolina', Fuel, 'Gasolina')}
            {renderBurbuja('combustible', 'hibrido', Zap, 'Híbrido')}
            {renderBurbuja('combustible', 'electrico', Zap, 'Eléctrico')}
            {renderBurbuja('combustible', 'ahorro', Leaf, 'Max Ahorro')}
          </div>
        </section>

        {/* SECCIÓN 2: Planea tu movilidad */}
        <section className="text-center space-y-8 pt-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Planea tu movilidad (Hoy No Circula)</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              El Programa rige en la Ciudad de México limitando la circulación vehicular basándose en criterios de Días y Horarios. Selecciona un engomado para conocer su restricción y evitar contratiempos.
            </p>
          </div>

          {/* Círculos de Engomados con Overlay en Hover */}
          <div className="flex justify-center gap-6">
            {engomadosData.map((eng) => (
              <div 
                key={eng.color} 
                className="flex flex-col items-center gap-2 cursor-pointer group" 
                onClick={() => toggleSeleccion('engomado', eng.color)}
                onMouseEnter={() => setHoveredEngomado(eng.color)}
                onMouseLeave={() => setHoveredEngomado(null)}
              >
                {/* Contenedor relativo para alojar la superposición oscura */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-white shadow-sm transition-all overflow-hidden relative ${selecciones.engomado === eng.color ? 'ring-4 ring-gray-200 scale-110' : ''}`}>
                  
                  {/* Círculo de color original */}
                  <div className={`w-16 h-16 rounded-full ${eng.bg}`}></div>
                  
                  {/* Superposición (Aparece solo cuando el mouse está encima) */}
                  <div className={`absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white transition-opacity duration-300 ${hoveredEngomado === eng.color ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-xs font-black tracking-widest">{eng.day}</span>
                    <span className="text-[10px] text-gray-300 mt-1">Terminación</span>
                    <span className="text-sm font-bold text-white">{eng.digits}</span>
                  </div>

                </div>
                <span className="text-sm font-semibold text-gray-600">{eng.label}</span>
              </div>
            ))}
          </div>

          {/* Tarjeta de Restricciones */}
          <div className="bg-white rounded-3xl p-8 shadow-sm max-w-4xl mx-auto border border-gray-100 text-left relative overflow-hidden mt-8">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays className="text-red-500" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Restricciones Sabatinas</h3>
            </div>
            <p className="text-sm text-gray-500 mb-8 border-b pb-4">Horario: <strong>De 5:00 a 22:00 horas</strong></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-blue-600 font-bold mb-2">HOLOGRAMA 1</h4>
                <p className="text-sm text-gray-800"><strong>Impares (1,3,5,7,9):</strong><br/>Descansan 1º y 3º sábado.</p>
                <p className="text-sm text-gray-800 mt-2"><strong>Pares (0,2,4,6,8):</strong><br/>Descansan 2º y 4º sábado.</p>
              </div>
              <div>
                <h4 className="text-blue-600 font-bold mb-2">HOLOGRAMA 2</h4>
                <p className="text-sm text-gray-800">Descansan <strong>todos</strong> los sábados.</p>
              </div>
              <div>
                <h4 className="text-green-600 font-bold mb-2">HOLOGRAMA 00 Y 0</h4>
                <p className="text-sm text-gray-800"><strong>Exentos:</strong> Circulan libremente.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Botón Final */}
        <div className="flex justify-center pb-12 mt-12">
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
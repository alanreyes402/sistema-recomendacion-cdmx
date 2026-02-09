import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import CarCard from '../components/CarCard';
import PreferenceWizard from '../components/PreferenceWizard';

const LandingPage = ({ onStartJourney }) => {
  const [showWizard, setShowWizard] = useState(false);
  const [topPicks, setTopPicks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/vehiculos?limite=8')
      .then(res => res.json())
      .then(data => setTopPicks(data.vehiculos || data))
      .catch(err => console.error('Error:', err));
  }, []);

  // FUNCIÓN QUE RECIBE LOS DATOS DEL WIZARD
  const handleWizardComplete = (preferences) => {
    console.log('🎯 LandingPage: Wizard completado con:', preferences);
    
    // Verificar que preferences existe
    if (!preferences) {
      console.error('❌ LandingPage: preferences es null');
      alert('Error: No se recibieron preferencias del wizard');
      return;
    }
    
    if (!preferences.email) {
      console.error('❌ LandingPage: Email faltante en preferences');
      alert('Error: Email no proporcionado');
      return;
    }
    
    // Cerrar el wizard
    setShowWizard(false);
    
    // Llamar a la función del padre (App.jsx)
    console.log('🚀 LandingPage: Llamando a onStartJourney...');
    if (onStartJourney) {
      onStartJourney(preferences);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-pink-900/20" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 animate-move-bg" 
               style={{
                 backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                 backgroundSize: '50px 50px'
               }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black text-slate-50 mb-6 leading-tight">
              Domina la{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
                CDMX
              </span>
              <br />
              con el auto perfecto
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto">
              IA que analiza precios, holograma y baches por ti
            </p>

            {/* Features Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { icon: <Zap size={20} />, text: 'Búsqueda Inteligente' },
                { icon: <Shield size={20} />, text: 'Verificados' },
                { icon: <TrendingUp size={20} />, text: 'Mejor Precio' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-full text-slate-300 font-semibold"
                >
                  {feature.icon}
                  {feature.text}
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('🔵 Botón CTA clickeado - Abriendo wizard');
                setShowWizard(true);
              }}
              className="group px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-black text-xl text-white shadow-2xl shadow-purple-500/50 transition-all flex items-center gap-3 mx-auto"
            >
              <Sparkles className="group-hover:rotate-12 transition-transform" />
              Iniciar Test de Compatibilidad
              <Sparkles className="group-hover:-rotate-12 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Top Picks Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-slate-50 mb-4">Top Picks CDMX</h2>
            <p className="text-xl text-slate-400">Los más buscados esta semana</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topPicks.map((vehiculo, index) => (
              <motion.div
                key={vehiculo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <CarCard 
                  vehiculo={vehiculo} 
                  onClick={() => {
                    console.log('🚗 Card clickeado - Abriendo wizard');
                    setShowWizard(true);
                  }} 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wizard Modal */}
      <PreferenceWizard
        isOpen={showWizard}
        onClose={() => {
          console.log('❌ Wizard cerrado sin completar');
          setShowWizard(false);
        }}
        onComplete={handleWizardComplete}
      />
    </div>
  );
};

// CORRECCIÓN FINAL: Validación de props
LandingPage.propTypes = {
  onStartJourney: PropTypes.func
};

export default LandingPage;
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';

const PreferenceWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    presupuestomin: 200000,
    presupuestomax: 600000,
    usodiario: false,
    usofinsemana: false,
    usofamiliar: false,
    prioridadahorro: false,
    prioridadseguridad: false,
    prioridadholograma: false,
    email: ''
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!formData.email || formData.email.trim() === '') {
      alert('⚠️ Por favor ingresa tu email');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('⚠️ Por favor ingresa un email válido');
      return;
    }
    
    console.log('📧 Datos del wizard completados:', formData);
    onComplete(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-full transition-colors"
            type="button"
          >
            <X size={24} className="text-slate-400" />
          </button>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-400">Paso {step} de 4</span>
              <span className="text-sm font-semibold text-purple-400">{(step / 4 * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step 1: Presupuesto */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-black text-slate-50 mb-2">¿Cuánto quieres invertir?</h2>
                <p className="text-slate-400">Define tu rango de presupuesto</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="wizard-min-price" className="text-sm font-semibold text-slate-300 mb-2 block">
                    Presupuesto Mínimo
                  </label>
                  <input
                    id="wizard-min-price"
                    type="range"
                    min="100000"
                    max="1000000"
                    step="50000"
                    value={formData.presupuestomin}
                    onChange={(e) => setFormData({ ...formData, presupuestomin: Number.parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <p className="text-2xl font-bold text-purple-400 mt-2">
                    ${formData.presupuestomin.toLocaleString('es-MX')}
                  </p>
                </div>
                <div>
                  <label htmlFor="wizard-max-price" className="text-sm font-semibold text-slate-300 mb-2 block">
                    Presupuesto Máximo
                  </label>
                  <input
                    id="wizard-max-price"
                    type="range"
                    min="200000"
                    max="2000000"
                    step="50000"
                    value={formData.presupuestomax}
                    onChange={(e) => setFormData({ ...formData, presupuestomax: Number.parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-600"
                  />
                  <p className="text-2xl font-bold text-pink-400 mt-2">
                    ${formData.presupuestomax.toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Tipo de Uso */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-black text-slate-50 mb-2">¿Cómo lo usarás?</h2>
                <p className="text-slate-400">Selecciona todas las que apliquen</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: 'usodiario', label: 'Uso Diario', desc: 'Para ir al trabajo o escuela' },
                  { key: 'usofinsemana', label: 'Fin de Semana', desc: 'Para paseos y recreación' },
                  { key: 'usofamiliar', label: 'Familiar', desc: 'Para toda la familia' }
                ].map((uso) => (
                  <button
                    key={uso.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, [uso.key]: !formData[uso.key] })}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData[uso.key]
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <h3 className="text-xl font-bold text-slate-50 mb-1">{uso.label}</h3>
                    <p className="text-slate-400 text-sm">{uso.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Prioridades */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-black text-slate-50 mb-2">¿Qué es más importante?</h2>
                <p className="text-slate-400">Elige tus prioridades principales</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: 'prioridadahorro', label: 'Ahorro de Gasolina', icon: '⛽' },
                  { key: 'prioridadseguridad', label: 'Seguridad Máxima', icon: '🛡️' },
                  { key: 'prioridadholograma', label: 'Holograma 00', icon: '🍃' }
                ].map((prioridad) => (
                  <button
                    key={prioridad.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, [prioridad.key]: !formData[prioridad.key] })}
                    className={`p-6 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      formData[prioridad.key]
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-4xl">{prioridad.icon}</span>
                    <h3 className="text-xl font-bold text-slate-50">{prioridad.label}</h3>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Email Capture */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <Sparkles size={48} className="text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-slate-50 mb-2">
                  ¡Tenemos 15 autos perfectos para ti!
                </h2>
                <p className="text-slate-400">Ingresa tu email para ver los resultados</p>
              </div>

              <input
                aria-label="Correo electrónico"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && formData.email) {
                    handleSubmit();
                  }
                }}
                className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl text-slate-50 text-lg focus:border-purple-500 focus:outline-none transition-colors"
                autoFocus
              />

              <button
                onClick={handleSubmit}
                disabled={!formData.email}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2"
                type="button"
              >
                Ver Mis Resultados
                <Sparkles size={20} />
              </button>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-slate-300 transition-colors flex items-center gap-2"
                type="button"
              >
                <ArrowLeft size={20} />
                Atrás
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
                type="button"
              >
                Siguiente
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

PreferenceWizard.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onComplete: PropTypes.func
};

export default PreferenceWizard;
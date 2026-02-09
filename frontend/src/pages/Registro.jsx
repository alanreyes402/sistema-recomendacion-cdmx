import PropTypes from 'prop-types';
import { useState } from 'react';
import './Registro.css';

const Registro = ({ onRegistroExitoso, onVolverALogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    edad: 30,
    genero: 'Masculino',
    presupuestomin: 200000,
    presupuestomax: 500000,
    tipovehiculopreferido: 'Sedán',
    hologramaprioridad: true,
    usoprincipal: 'Trabajo',
    numpasajeroshabitual: 1,
    alcaldia: 'Benito Juárez',
    tieneestacionamiento: false,
    experienciaconduccion: 'Intermedio',
    combustiblepreferido: 'Gasolina',
    transmisionpreferida: 'Automática',
    segmentopreferido: 'Compacto',
    terminacionplaca: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el registro');
      }

      const usuario = await response.json();
      
      // Guardar en localStorage
      localStorage.setItem('usuarioid', usuario.id);
      localStorage.setItem('usuarioemail', usuario.email);
      localStorage.setItem('usuarionombre', usuario.nombre);
      
      console.log('Usuario registrado:', usuario);
      
      if (onRegistroExitoso) {
        onRegistroExitoso(usuario);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <h2>Crea tu Perfil</h2>
        <p className="subtitle">Cuéntanos qué buscas para recomendarte el vehículo perfecto</p>

        {error && <div className="alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Información Personal */}
          <section className="form-section">
            <h3>Información Personal</h3>
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edad">Edad</label>
                <input
                  id="edad"
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: Number.parseInt(e.target.value, 10) })} 
                  min="18"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="genero">Género</label>
                <select id="genero" name="genero" value={formData.genero} onChange={handleChange}>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </section>

          {/* Presupuesto */}
          <section className="form-section">
            <h3>Presupuesto</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="presupuestomin">Mínimo</label>
                <input
                  id="presupuestomin"
                  type="number"
                  name="presupuestomin"
                  value={formData.presupuestomin}
                  onChange={(e) => setFormData({ ...formData, presupuestomin: Number.parseInt(e.target.value, 10) })}
                  step="10000"
                  required
                />
                <span className="helper">${Number(formData.presupuestomin).toLocaleString('es-MX')}</span>
              </div>

              <div className="form-group">
                <label htmlFor="presupuestomax">Máximo</label>
                <input
                  id="presupuestomax"
                  type="number"
                  name="presupuestomax"
                  value={formData.presupuestomax}
                  onChange={(e) => setFormData({ ...formData, presupuestomax: Number.parseInt(e.target.value, 10) })}
                  step="10000"
                  required
                />
                <span className="helper">${Number(formData.presupuestomax).toLocaleString('es-MX')}</span>
              </div>
            </div>
          </section>

          {/* Preferencias del Vehículo */}
          <section className="form-section">
            <h3>Preferencias del Vehículo</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipovehiculopreferido">Tipo de Vehículo</label>
                <select id="tipovehiculopreferido" name="tipovehiculopreferido" value={formData.tipovehiculopreferido} onChange={handleChange}>
                  <option value="Sedán">Sedán</option>
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Minivan">Minivan</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="combustiblepreferido">Combustible</label>
                <select id="combustiblepreferido" name="combustiblepreferido" value={formData.combustiblepreferido} onChange={handleChange}>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Eléctrico">Eléctrico</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transmisionpreferida">Transmisión</label>
                <select id="transmisionpreferida" name="transmisionpreferida" value={formData.transmisionpreferida} onChange={handleChange}>
                  <option value="Automática">Automática</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="segmentopreferido">Segmento</label>
                <select id="segmentopreferido" name="segmentopreferido" value={formData.segmentopreferido} onChange={handleChange}>
                  <option value="Compacto">Compacto</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Grande">Grande</option>
                  <option value="Lujo">Lujo</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="hologramaprioridad">
                <input
                  id="hologramaprioridad"
                  type="checkbox"
                  name="hologramaprioridad"
                  checked={formData.hologramaprioridad}
                  onChange={handleChange}
                />
                <span>Priorizar holograma verde/exento (importante para CDMX)</span>
              </label>
            </div>
          </section>

          {/* Uso y Ubicación */}
          <section className="form-section">
            <h3>Uso y Ubicación</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="usoprincipal">Uso Principal</label>
                <select id="usoprincipal" name="usoprincipal" value={formData.usoprincipal} onChange={handleChange}>
                  <option value="Trabajo">Trabajo</option>
                  <option value="Familia">Familia</option>
                  <option value="Recreación">Recreación</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="numpasajeroshabitual">Pasajeros Habituales</label>
                <select id="numpasajeroshabitual" name="numpasajeroshabitual" value={formData.numpasajeroshabitual} onChange={handleChange}>
                  <option value="1">Solo yo</option>
                  <option value="2">2 personas</option>
                  <option value="3">3 personas</option>
                  <option value="4">4 personas</option>
                  <option value="5">5+ personas</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="alcaldia">Alcaldía</label>
                <select id="alcaldia" name="alcaldia" value={formData.alcaldia} onChange={handleChange}>
                  <option value="Álvaro Obregón">Álvaro Obregón</option>
                  <option value="Azcapotzalco">Azcapotzalco</option>
                  <option value="Benito Juárez">Benito Juárez</option>
                  <option value="Coyoacán">Coyoacán</option>
                  <option value="Cuajimalpa">Cuajimalpa</option>
                  <option value="Cuauhtémoc">Cuauhtémoc</option>
                  <option value="Gustavo A. Madero">Gustavo A. Madero</option>
                  <option value="Iztacalco">Iztacalco</option>
                  <option value="Iztapalapa">Iztapalapa</option>
                  <option value="Magdalena Contreras">Magdalena Contreras</option>
                  <option value="Miguel Hidalgo">Miguel Hidalgo</option>
                  <option value="Milpa Alta">Milpa Alta</option>
                  <option value="Tláhuac">Tláhuac</option>
                  <option value="Tlalpan">Tlalpan</option>
                  <option value="Venustiano Carranza">Venustiano Carranza</option>
                  <option value="Xochimilco">Xochimilco</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="experienciaconduccion">Experiencia de Conducción</label>
                <select id="experienciaconduccion" name="experienciaconduccion" value={formData.experienciaconduccion} onChange={handleChange}>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="tieneestacionamiento">
                <input
                  id="tieneestacionamiento"
                  type="checkbox"
                  name="tieneestacionamiento"
                  checked={formData.tieneestacionamiento}
                  onChange={handleChange}
                />
                <span>Tengo estacionamiento en casa</span>
              </label>
            </div>
          </section>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creando perfil...' : 'Crear Cuenta'}
          </button>

          <div className="divider">
            <span>¿Ya tienes cuenta?</span>
          </div>

          <button 
            type="button"
            className="btn-volver-login" 
            onClick={onVolverALogin}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

// Validaciones de props
Registro.propTypes = {
  onRegistroExitoso: PropTypes.func,
  onVolverALogin: PropTypes.func
};

export default Registro;
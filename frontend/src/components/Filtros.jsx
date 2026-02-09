import PropTypes from 'prop-types';
import React from 'react';
import './Filtros.css';

const Filtros = ({ filtros, onChange, marcas }) => {
  return (
    <div className="filtros-container">
      <h3>🔍 Filtrar Vehículos</h3>
      
      <div className="filtro-grupo">
        {/* CORRECCIÓN 1: Unimos label con select usando ID */}
        <label htmlFor="filtro-marca">Marca</label>
        <select 
          id="filtro-marca"
          value={filtros.marca || ''} 
          onChange={(e) => onChange({ ...filtros, marca: e.target.value })}
        >
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m.marca} value={m.marca}>
              {m.marca} ({m.total})
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-grupo">
        {/* CORRECCIÓN 2: Unimos label con select usando ID */}
        <label htmlFor="filtro-holograma">Holograma</label>
        <select 
          id="filtro-holograma"
          value={filtros.holograma || ''} 
          onChange={(e) => onChange({ ...filtros, holograma: e.target.value })}
        >
          <option value="">Todos</option>
          <option value="00">00 (Exento)</option>
          <option value="0">0 (Verde)</option>
          <option value="1">1 (Amarillo)</option>
          <option value="2">2 (Rosado)</option>
        </select>
      </div>

      <button 
        className="btn-limpiar"
        onClick={() => onChange({ marca: '', holograma: '' })}
      >
        Limpiar Filtros
      </button>
    </div>
  );
};

Filtros.propTypes = {
  onChange: PropTypes.func,
  filtros: PropTypes.object,
  marcas: PropTypes.array
};

export default Filtros;
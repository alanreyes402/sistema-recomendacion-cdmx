import PropTypes from 'prop-types';
import React from 'react';
import './VehiculoCard.css';

const VehiculoCard = ({ vehiculo }) => {
  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const getHologramaColor = (holograma) => {
    const colores = {
      '0': '#4CAF50',
      '00': '#2196F3',
      '1': '#FFC107',
      '2': '#FF9800',
    };
    return colores[holograma] || '#9E9E9E';
  };

  return (
    <div className="vehiculo-card">
      <div className="card-header">
        <span 
          className="holograma-badge" 
          style={{ backgroundColor: getHologramaColor(vehiculo.holograma) }}
        >
          Holograma {vehiculo.holograma}
        </span>
        <span className="tipo-badge">{vehiculo.tipo_vehiculo}</span>
      </div>

      <div className="card-body">
        <h3 className="vehiculo-titulo">
          {vehiculo.marca} {vehiculo.modelo}
        </h3>
        
        <div className="vehiculo-detalles">
          <div className="detalle-item">
            <span className="detalle-label">📅 Año:</span>
            <span className="detalle-valor">{vehiculo.año}</span>
          </div>
          
          <div className="detalle-item">
            <span className="detalle-label">⛽ Combustible:</span>
            <span className="detalle-valor">{vehiculo.combustible}</span>
          </div>
          
          <div className="detalle-item">
            <span className="detalle-label">💰 Precio:</span>
            <span className="detalle-valor precio">{formatoPrecio(vehiculo.precio)}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn-detalles">Ver Detalles</button>
      </div>
    </div>
  );
};

// CORRECCIÓN: Definimos la forma exacta del objeto 'vehiculo'
VehiculoCard.propTypes = {
  vehiculo: PropTypes.shape({
    holograma: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tipo_vehiculo: PropTypes.string,
    marca: PropTypes.string,
    modelo: PropTypes.string,
    año: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    combustible: PropTypes.string,
    precio: PropTypes.number
  }).isRequired
};

export default VehiculoCard;
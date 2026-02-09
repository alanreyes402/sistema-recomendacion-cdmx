# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class Interaccion(Base):
    __tablename__ = "interacciones"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relaciones
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    
    # Tipo de interacción
    tipo_interaccion = Column(String(50), nullable=False)  
    # Tipos: vista, favorito, consulta_precio, prueba_manejo, interes_compra
    
    # Peso de la interacción (para el modelo de recomendación)
    peso = Column(Float, default=1.0)
    # vista: 1.0
    # favorito: 3.0
    # consulta_precio: 5.0
    # prueba_manejo: 7.0
    # interes_compra: 10.0
    
    # Calificación explícita (opcional, 1-5 estrellas)
    calificacion = Column(Float, nullable=True)
    
    # Tiempo de visualización en segundos (para vistas)
    tiempo_visualizacion = Column(Integer, nullable=True)
    
    # Metadata
    fecha_interaccion = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones ORM
    usuario = relationship("Usuario", backref="interacciones")
    vehiculo = relationship("Vehiculo", backref="interacciones")
    
    def __repr__(self):
        return f"<Interaccion Usuario:{self.usuario_id} - Vehiculo:{self.vehiculo_id} - Tipo:{self.tipo_interaccion}>"
# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Float
from app.database.connection import Base

class Vehiculo(Base):
    __tablename__ = "vehiculos"
    
    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String(50), nullable=False, index=True)
    modelo = Column(String(100), nullable=False)
    tipo_vehiculo = Column(String(20), nullable=False)  # nuevo, seminuevo
    año = Column(Integer, nullable=False, index=True)
    precio = Column(Float, nullable=False)
    tipo_carroceria = Column(String(50))
    combustible = Column(String(50), nullable=False, index=True)
    transmision = Column(String(50))
    cilindros = Column(Integer)
    rendimiento_ciudad_kmL = Column(Float)
    capacidad_pasajeros = Column(Integer)
    cajuela_litros = Column(Integer)
    segmento = Column(String(50))
    holograma = Column(String(10), nullable=False, index=True)
    largo_m = Column(Float)
    ancho_m = Column(Float)
    altura_cm = Column(Float)  # Cambiado a Float
    costo_mantenimiento_anual = Column(Float)
    disponibilidad_refacciones = Column(String(20))
    kilometraje_km = Column(Float)  # Cambiado a Float
    altura_libre_suelo_cm = Column(Float)  # ✅ AGREGADO
    tipo_aspiracion = Column(String(50))  # ✅ AGREGADO
    estrellas_seguridad = Column(Integer)  # ✅ AGREGADO
    conectividad = Column(String(10))  # ✅ AGREGADO
    emisiones_CO2_gkm = Column(Float)  # ✅ AGREGADO
    
    def __repr__(self):
        return f"<Vehiculo {self.marca} {self.modelo} ({self.año})>"
# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional

class VehiculoBase(BaseModel):
    marca: str
    modelo: str
    tipo_vehiculo: str
    año: int
    precio: float
    tipo_carroceria: Optional[str] = None
    combustible: str
    transmision: Optional[str] = None
    cilindros: Optional[int] = None
    rendimiento_ciudad_kmL: Optional[float] = None
    capacidad_pasajeros: Optional[int] = None
    cajuela_litros: Optional[int] = None
    segmento: Optional[str] = None
    holograma: str
    largo_m: Optional[float] = None
    ancho_m: Optional[float] = None
    altura_cm: Optional[float] = None
    costo_mantenimiento_anual: Optional[float] = None
    disponibilidad_refacciones: Optional[str] = None
    kilometraje_km: Optional[float] = None
    altura_libre_suelo_cm: Optional[float] = None
    tipo_aspiracion: Optional[str] = None
    estrellas_seguridad: Optional[int] = None
    conectividad: Optional[str] = None
    emisiones_CO2_gkm: Optional[float] = None

class VehiculoResponse(VehiculoBase):
    id: int
    
    class Config:
        from_attributes = True

class VehiculoListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    vehiculos: list[VehiculoResponse]

class EstadisticasResponse(BaseModel):
    total_vehiculos: int
    por_holograma: dict
    por_combustible: dict
    por_tipo_vehiculo: dict
    precio_promedio: float
    precio_minimo: float
    precio_maximo: float
    top_marcas: list[dict]
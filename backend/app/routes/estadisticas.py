# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.vehiculo import Vehiculo
from app.schemas.vehiculo import EstadisticasResponse

router = APIRouter(prefix="/api/estadisticas", tags=["Estadísticas"])

@router.get("/test")
def test_estadisticas():
    """Endpoint de prueba"""
    return {"message": "Router de estadísticas funcionando"}

@router.get("/", response_model=EstadisticasResponse)
def obtener_estadisticas(db: Session = Depends(get_db)):
    """Obtiene estadísticas generales del catálogo"""
    # Total de vehículos
    total = db.query(Vehiculo).count()
    
    # Por holograma
    hologramas = db.query(
        Vehiculo.holograma,
        func.count(Vehiculo.id).label('total')
    ).group_by(Vehiculo.holograma).all()
    por_holograma = {holo: total for holo, total in hologramas}
    
    # Por combustible
    combustibles = db.query(
        Vehiculo.combustible,
        func.count(Vehiculo.id).label('total')
    ).group_by(Vehiculo.combustible).all()
    por_combustible = {comb: total for comb, total in combustibles}
    
    # Por tipo de vehículo
    tipos = db.query(
        Vehiculo.tipo_vehiculo,
        func.count(Vehiculo.id).label('total')
    ).group_by(Vehiculo.tipo_vehiculo).all()
    por_tipo_vehiculo = {tipo: total for tipo, total in tipos}
    
    # Estadísticas de precio
    precio_promedio = db.query(func.avg(Vehiculo.precio)).scalar() or 0
    precio_minimo = db.query(func.min(Vehiculo.precio)).scalar() or 0
    precio_maximo = db.query(func.max(Vehiculo.precio)).scalar() or 0
    
    # Top 10 marcas
    top_marcas = db.query(
        Vehiculo.marca,
        func.count(Vehiculo.id).label('total')
    ).group_by(Vehiculo.marca).order_by(func.count(Vehiculo.id).desc()).limit(10).all()
    top_marcas_list = [{"marca": marca, "total": total} for marca, total in top_marcas]
    
    return {
        "total_vehiculos": total,
        "por_holograma": por_holograma,
        "por_combustible": por_combustible,
        "por_tipo_vehiculo": por_tipo_vehiculo,
        "precio_promedio": float(precio_promedio),
        "precio_minimo": float(precio_minimo),
        "precio_maximo": float(precio_maximo),
        "top_marcas": top_marcas_list
    }
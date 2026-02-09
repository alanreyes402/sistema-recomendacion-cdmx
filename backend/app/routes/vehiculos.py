# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
from app.database.connection import get_db
from app.models.vehiculo import Vehiculo
from app.schemas.vehiculo import VehiculoResponse, VehiculoListResponse, EstadisticasResponse

router = APIRouter(prefix="/api/vehiculos", tags=["Vehículos"])

@router.get("/", response_model=VehiculoListResponse)
def listar_vehiculos(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    marca: Optional[str] = Query(None, description="Filtrar por marca"),
    holograma: Optional[str] = Query(None, description="Filtrar por holograma"),
    combustible: Optional[str] = Query(None, description="Filtrar por combustible"),
    tipo_vehiculo: Optional[str] = Query(None, description="nuevo o seminuevo"),
    precio_min: Optional[float] = Query(None, description="Precio mínimo"),
    precio_max: Optional[float] = Query(None, description="Precio máximo"),
    año_min: Optional[int] = Query(None, description="Año mínimo"),
    año_max: Optional[int] = Query(None, description="Año máximo"),
    search: Optional[str] = Query(None, description="Búsqueda por marca o modelo"),
    db: Session = Depends(get_db)
):
    """
    Lista vehículos con paginación y filtros opcionales
    """
    # Query base
    query = db.query(Vehiculo)
    
    # Aplicar filtros
    if marca:
        query = query.filter(Vehiculo.marca.ilike(f"%{marca}%"))
    
    if holograma:
        query = query.filter(Vehiculo.holograma == holograma)
    
    if combustible:
        query = query.filter(Vehiculo.combustible == combustible)
    
    if tipo_vehiculo:
        query = query.filter(Vehiculo.tipo_vehiculo == tipo_vehiculo)
    
    if precio_min is not None:
        query = query.filter(Vehiculo.precio >= precio_min)
    
    if precio_max is not None:
        query = query.filter(Vehiculo.precio <= precio_max)
    
    if año_min is not None:
        query = query.filter(Vehiculo.año >= año_min)
    
    if año_max is not None:
        query = query.filter(Vehiculo.año <= año_max)
    
    if search:
        query = query.filter(
            or_(
                Vehiculo.marca.ilike(f"%{search}%"),
                Vehiculo.modelo.ilike(f"%{search}%")
            )
        )
    
    # Contar total
    total = query.count()
    
    # Calcular paginación
    total_pages = (total + page_size - 1) // page_size
    offset = (page - 1) * page_size
    
    # Obtener vehículos
    vehiculos = query.order_by(Vehiculo.precio).offset(offset).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "vehiculos": vehiculos
    }

@router.get("/{vehiculo_id}", response_model=VehiculoResponse)
def obtener_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un vehículo por su ID
    """
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()
    
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    return vehiculo

@router.get("/marcas/listar")
def listar_marcas(db: Session = Depends(get_db)):
    """
    Lista todas las marcas disponibles con el conteo de vehículos
    """
    marcas = db.query(
        Vehiculo.marca,
        func.count(Vehiculo.id).label('total')
    ).group_by(Vehiculo.marca).order_by(Vehiculo.marca).all()
    
    return [{"marca": marca, "total": total} for marca, total in marcas]

@router.get("/hologramas/listar")
def listar_hologramas(db: Session = Depends(get_db)):
    """
    Lista todos los hologramas disponibles con el conteo de vehículos
    """
    hologramas = db.query(
        Vehiculo.holograma,
        func.count(Vehiculo.id).label('total')
    ).group_by(Vehiculo.holograma).order_by(Vehiculo.holograma).all()
    
    return [{"holograma": holo, "total": total} for holo, total in hologramas]

@router.get("/combustibles/listar")
def listar_combustibles(db: Session = Depends(get_db)):
    """
    Lista todos los tipos de combustible disponibles
    """
    combustibles = db.query(
        Vehiculo.combustible,
        func.count(Vehiculo.id).label('total')
    ).group_by(Vehiculo.combustible).order_by(Vehiculo.combustible).all()
    
    return [{"combustible": comb, "total": total} for comb, total in combustibles]
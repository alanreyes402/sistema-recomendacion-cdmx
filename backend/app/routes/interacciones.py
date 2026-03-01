# -*- coding: utf-8 -*-
"""
Router de Interacciones
Registrar acciones del usuario para aprendizaje del modelo
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.database.connection import get_db
from app.models.interaccion import Interaccion
from app.models.usuario import Usuario
from app.models.vehiculo import Vehiculo

router = APIRouter(
    prefix="/api",
    tags=["Interacciones"]
)

# Schemas
class InteraccionCreate(BaseModel):
    usuario_id: int
    vehiculo_id: int
    tipo_interaccion: str  # "vista", "click", "favorito", "contacto", "compartir", "calificacion"
    
    # NUEVO: Permitimos recibir la calificación y el peso desde el frontend
    calificacion: Optional[float] = None
    peso: Optional[float] = None


# Endpoints
@router.post("/interacciones", status_code=201)
async def registrar_interaccion(
    interaccion: InteraccionCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar interacción usuario-vehículo para aprendizaje
    """
    
    # Verificar que el usuario existe
    usuario = db.query(Usuario).filter(Usuario.id == interaccion.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail=f"Usuario {interaccion.usuario_id} no encontrado")
    
    # Verificar que el vehículo existe
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == interaccion.vehiculo_id).first()
    if not vehiculo:
        raise HTTPException(status_code=404, detail=f"Vehículo {interaccion.vehiculo_id} no encontrado")
    
    # Mapear tipo a peso por defecto (si el front no manda uno)
    pesos = {
        "vista": 1.0,
        "click": 2.0,
        "favorito": 5.0,
        "contacto": 10.0,
        "compartir": 3.0,
        "calificacion": 1.0 # Base, se sobrescribe si llega el peso
    }
    
    # Usar el peso enviado por el front, o el del diccionario por defecto
    peso_final = interaccion.peso if interaccion.peso is not None else pesos.get(interaccion.tipo_interaccion, 1.0)
    
    # Crear interacción (AHORA INCLUYE LA CALIFICACIÓN)
    nueva_interaccion = Interaccion(
        usuario_id=interaccion.usuario_id,
        vehiculo_id=interaccion.vehiculo_id,
        tipo_interaccion=interaccion.tipo_interaccion,
        peso=peso_final,
        calificacion=interaccion.calificacion, # Guardamos las estrellitas
        fecha_interaccion=datetime.now()
    )
    
    db.add(nueva_interaccion)
    db.commit()
    db.refresh(nueva_interaccion)
    
    print(f"✅ Interacción: Usuario {interaccion.usuario_id} → Vehículo {interaccion.vehiculo_id} ({interaccion.tipo_interaccion} | Peso: {peso_final} | Estrellas: {interaccion.calificacion})")
    
    return {
        "message": "Interacción registrada exitosamente",
        "interaccion_id": nueva_interaccion.id,
        "tipo": interaccion.tipo_interaccion,
        "peso": peso_final,
        "calificacion": interaccion.calificacion,
        "vehiculo": {
            "id": vehiculo.id,
            "marca": vehiculo.marca,
            "modelo": vehiculo.modelo
        }
    }

@router.get("/usuarios/{usuario_id}/interacciones")
async def obtener_interacciones_usuario(
    usuario_id: int,
    limite: int = 50,
    db: Session = Depends(get_db)
):
    """
    Obtener historial de interacciones de un usuario
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail=f"Usuario {usuario_id} no encontrado")
    
    interacciones = db.query(Interaccion).filter(
        Interaccion.usuario_id == usuario_id
    ).order_by(
        Interaccion.fecha_interaccion.desc()
    ).limit(limite).all()
    
    resultado = []
    for interaccion in interacciones:
        vehiculo = db.query(Vehiculo).filter(Vehiculo.id == interaccion.vehiculo_id).first()
        resultado.append({
            "id": interaccion.id,
            "vehiculo_id": interaccion.vehiculo_id,
            "tipo": interaccion.tipo_interaccion,
            "peso": interaccion.peso,
            "calificacion": interaccion.calificacion, # NUEVO
            "fecha": interaccion.fecha_interaccion,
            "vehiculo": {
                "marca": vehiculo.marca if vehiculo else None,
                "modelo": vehiculo.modelo if vehiculo else None,
                "año": vehiculo.año if vehiculo else None,
                "precio": vehiculo.precio if vehiculo else None
            } if vehiculo else None
        })
    
    return {
        "usuario_id": usuario_id,
        "usuario_nombre": usuario.nombre,
        "total_interacciones": len(resultado),
        "interacciones": resultado
    }

@router.get("/vehiculos/{vehiculo_id}/interacciones")
async def obtener_interacciones_vehiculo(
    vehiculo_id: int,
    limite: int = 50,
    db: Session = Depends(get_db)
):
    """
    Ver qué usuarios han mostrado interés en este vehículo
    """
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()
    if not vehiculo:
        raise HTTPException(status_code=404, detail=f"Vehículo {vehiculo_id} no encontrado")
    
    interacciones = db.query(Interaccion).filter(
        Interaccion.vehiculo_id == vehiculo_id
    ).order_by(
        Interaccion.fecha_interaccion.desc()
    ).limit(limite).all()
    
    return {
        "vehiculo_id": vehiculo_id,
        "vehiculo": {
            "marca": vehiculo.marca,
            "modelo": vehiculo.modelo,
            "año": vehiculo.año,
            "precio": vehiculo.precio
        },
        "total_interacciones": len(interacciones),
        "interacciones": [
            {
                "id": i.id,
                "usuario_id": i.usuario_id,
                "tipo": i.tipo_interaccion,
                "peso": i.peso,
                "calificacion": i.calificacion, # NUEVO
                "fecha": i.fecha_interaccion
            }
            for i in interacciones
        ]
    }
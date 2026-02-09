# -*- coding: utf-8 -*-
"""
Router de Usuarios
Registro, login y gestión de preferencias
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

from app.database.connection import get_db
from app.models.usuario import Usuario

router = APIRouter(
    prefix="/api",
    tags=["Usuarios"]
)


# Schemas (modelos de datos para validación)
class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    edad: int
    genero: str
    presupuesto_min: int
    presupuesto_max: int
    tipo_vehiculo_preferido: Optional[str] = None
    holograma_prioridad: bool = True
    uso_principal: str
    num_pasajeros_habitual: int
    alcaldia: str
    tiene_estacionamiento: bool
    experiencia_conduccion: str
    combustible_preferido: Optional[str] = None
    transmision_preferida: Optional[str] = None
    segmento_preferido: Optional[str] = None
    terminacion_placa: Optional[int] = None


class UsuarioLogin(BaseModel):
    email: EmailStr


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    edad: int
    presupuesto_min: int
    presupuesto_max: int
    tipo_vehiculo_preferido: Optional[str] = None
    holograma_prioridad: bool
    uso_principal: str
    alcaldia: str
    
    class Config:
        from_attributes = True


# Endpoints
@router.post("/usuarios/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registrar nuevo usuario con sus preferencias
    
    - **nombre**: Nombre completo del usuario
    - **email**: Email único (se valida que no exista)
    - **edad**: Edad del usuario
    - **presupuesto_min**: Presupuesto mínimo en pesos
    - **presupuesto_max**: Presupuesto máximo en pesos
    - **tipo_vehiculo_preferido**: Tipo de vehículo preferido (Sedán, SUV, etc.)
    - **holograma_prioridad**: Si le importa el holograma verde/exento
    - **uso_principal**: Trabajo, Familia, Recreación, Mixto
    - **num_pasajeros_habitual**: Número de pasajeros habitual
    - **alcaldia**: Alcaldía donde vive
    - **tiene_estacionamiento**: Si tiene estacionamiento propio
    - **experiencia_conduccion**: Principiante, Intermedio, Avanzado
    - **combustible_preferido**: Gasolina, Híbrido, Eléctrico, Diesel
    - **transmision_preferida**: Automática, Manual, CVT
    - **segmento_preferido**: Compacto, Mediano, Grande, Lujo
    - **terminacion_placa**: Terminación de placa (opcional)
    """
    
    # Verificar si el email ya existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El email '{usuario.email}' ya está registrado. Usa otro email o inicia sesión."
        )
    
    # Validar presupuesto
    if usuario.presupuesto_min >= usuario.presupuesto_max:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El presupuesto mínimo debe ser menor al presupuesto máximo"
        )
    
    # Crear usuario
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        edad=usuario.edad,
        genero=usuario.genero,
        presupuesto_min=usuario.presupuesto_min,
        presupuesto_max=usuario.presupuesto_max,
        tipo_vehiculo_preferido=usuario.tipo_vehiculo_preferido,
        holograma_prioridad=usuario.holograma_prioridad,
        uso_principal=usuario.uso_principal,
        num_pasajeros_habitual=usuario.num_pasajeros_habitual,
        alcaldia=usuario.alcaldia,
        tiene_estacionamiento=usuario.tiene_estacionamiento,
        experiencia_conduccion=usuario.experiencia_conduccion,
        combustible_preferido=usuario.combustible_preferido,
        transmision_preferida=usuario.transmision_preferida,
        segmento_preferido=usuario.segmento_preferido,
        terminacion_placa=usuario.terminacion_placa,
        fecha_registro=datetime.now()
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    print(f"✅ Usuario registrado: ID={nuevo_usuario.id}, Email={nuevo_usuario.email}")
    
    return nuevo_usuario


@router.post("/usuarios/login", response_model=UsuarioResponse)
async def login_usuario(credenciales: UsuarioLogin, db: Session = Depends(get_db)):
    """
    Login simple por email (sin password)
    
    - **email**: Email del usuario registrado
    
    Devuelve los datos del usuario si existe
    """
    
    usuario = db.query(Usuario).filter(Usuario.email == credenciales.email).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con email '{credenciales.email}' no encontrado. Por favor regístrate primero."
        )
    
    print(f"✅ Login exitoso: ID={usuario.id}, Email={usuario.email}")
    
    return usuario


@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """
    Obtener información de un usuario por su ID
    
    - **usuario_id**: ID del usuario
    """
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=404, 
            detail=f"Usuario con ID {usuario_id} no encontrado"
        )
    
    return usuario


@router.put("/usuarios/{usuario_id}/preferencias")
async def actualizar_preferencias(
    usuario_id: int,
    preferencias: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """
    Actualizar preferencias de un usuario
    
    - **usuario_id**: ID del usuario
    - Envía solo los campos que quieres actualizar
    """
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=404, 
            detail=f"Usuario con ID {usuario_id} no encontrado"
        )
    
    # Actualizar campos (solo los que vengan en el request)
    campos_actualizados = []
    for key, value in preferencias.dict(exclude_unset=True).items():
        if hasattr(usuario, key):
            setattr(usuario, key, value)
            campos_actualizados.append(key)
    
    db.commit()
    db.refresh(usuario)
    
    print(f"✅ Preferencias actualizadas para usuario {usuario_id}: {campos_actualizados}")
    
    return {
        "message": "Preferencias actualizadas exitosamente",
        "campos_actualizados": campos_actualizados,
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "presupuesto_min": usuario.presupuesto_min,
            "presupuesto_max": usuario.presupuesto_max,
            "tipo_vehiculo_preferido": usuario.tipo_vehiculo_preferido
        }
    }


@router.get("/usuarios")
async def listar_usuarios(limite: int = 10, db: Session = Depends(get_db)):
    """
    Listar usuarios registrados (para pruebas)
    
    - **limite**: Número máximo de usuarios a devolver
    """
    
    usuarios = db.query(Usuario).limit(limite).all()
    
    return {
        "total": len(usuarios),
        "usuarios": [
            {
                "id": u.id,
                "nombre": u.nombre,
                "email": u.email,
                "edad": u.edad,
                "presupuesto_min": u.presupuesto_min,
                "presupuesto_max": u.presupuesto_max,
                "fecha_registro": u.fecha_registro
            }
            for u in usuarios
        ]
    }
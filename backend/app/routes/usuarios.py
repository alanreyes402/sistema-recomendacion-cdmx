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
    password: str 
    
    # Hemos puesto valores por defecto para evitar errores cuando se crea un "Invitado"
    edad: Optional[int] = 30
    genero: Optional[str] = "No especificado"
    presupuesto_min: Optional[float] = 0.0
    presupuesto_max: Optional[float] = 0.0
    tipo_vehiculo_preferido: Optional[str] = "ambos"
    holograma_prioridad: Optional[str] = "no_importa" # CORREGIDO: Ahora es str en lugar de bool
    uso_principal: Optional[str] = "mixto"
    num_pasajeros_habitual: Optional[int] = 4
    alcaldia: Optional[str] = "No especificada"
    tiene_estacionamiento: Optional[str] = "no" # El modelo DB espera String ('si'/'no')
    experiencia_conduccion: Optional[str] = "intermedio"
    combustible_preferido: Optional[str] = None
    transmision_preferida: Optional[str] = None
    segmento_preferido: Optional[str] = None
    terminacion_placa: Optional[int] = None

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str 

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    
    class Config:
        from_attributes = True

# Endpoints
@router.post("/usuarios/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registrar nuevo usuario básico y sus preferencias del Test
    """
    # Verificar si el email ya existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if usuario_existente:
        # Si es un invitado repetido (poco probable por el timestamp), lo dejamos pasar, 
        # pero si es un usuario real, marcamos error.
        if not usuario.email.startswith("invitado_"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El email '{usuario.email}' ya está registrado. Usa otro email o inicia sesión."
            )
        else:
            return usuario_existente
    
    # Crear usuario con TODOS los datos (¡DESCOMENTADOS!)
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password=usuario.password,
        fecha_registro=datetime.now(),
        
        # DATOS DEL TEST WIZARD
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
        terminacion_placa=usuario.terminacion_placa
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    print(f"✅ Usuario registrado: ID={nuevo_usuario.id}, Email={nuevo_usuario.email}")
    
    return nuevo_usuario

@router.post("/usuarios/login", response_model=UsuarioResponse)
async def login_usuario(credenciales: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == credenciales.email).first()
    if not usuario or usuario.password != credenciales.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
    print(f"✅ Login exitoso: ID={usuario.id}, Email={usuario.email}")
    return usuario

@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail=f"Usuario con ID {usuario_id} no encontrado")
    return usuario

@router.put("/usuarios/{usuario_id}/preferencias")
async def actualizar_preferencias(usuario_id: int, preferencias: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail=f"Usuario con ID {usuario_id} no encontrado")
    
    campos_actualizados = []
    for key, value in preferencias.model_dump(exclude_unset=True).items():
        if hasattr(usuario, key):
            setattr(usuario, key, value)
            campos_actualizados.append(key)
    
    db.commit()
    db.refresh(usuario)
    print(f"✅ Preferencias actualizadas para usuario {usuario_id}: {campos_actualizados}")
    
    return {
        "message": "Preferencias actualizadas exitosamente",
        "campos_actualizados": campos_actualizados,
        "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email}
    }

@router.get("/usuarios")
async def listar_usuarios(limite: int = 10, db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).limit(limite).all()
    return {
        "total": len(usuarios),
        "usuarios": [{"id": u.id, "nombre": u.nombre, "email": u.email, "fecha_registro": u.fecha_registro} for u in usuarios]
    }
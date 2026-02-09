# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base


# Crear las tablas
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="API Recomendación Vehículos CDMX",
    description="Sistema de recomendación personalizada para compra de vehículos",
    version="1.0.0"
)


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "¡API de Recomendación de Vehículos CDMX funcionando!",
        "status": "success",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "service": "vehiculos-recomendacion"
    }


# Importar routers DESPUÉS de crear la app
try:
    from app.routes import vehiculos, estadisticas, recomendaciones, interacciones, usuarios  # ← AGREGADO usuarios
    
    app.include_router(vehiculos.router)
    app.include_router(estadisticas.router)
    app.include_router(recomendaciones.router, tags=["Recomendaciones"])
    app.include_router(interacciones.router)
    app.include_router(usuarios.router, tags=["Usuarios"])  # ← NUEVO
    
    print("✅ Routers cargados correctamente")
except Exception as e:
    print(f"❌ Error al cargar routers: {e}")
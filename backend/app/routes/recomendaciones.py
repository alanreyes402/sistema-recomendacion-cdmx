# -*- coding: utf-8 -*-
"""
Router de Recomendaciones
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import joblib
import os

from app.database.connection import get_db
from app.models.usuario import Usuario
from app.ml.sistema_recomendacion import SistemaRecomendacionHibrido

router = APIRouter(
    prefix="/api",  # ← AGREGAR ESTO
    tags=["Recomendaciones"]
)

MODELO_PATH = "app/ml/modelo_recomendacion.pkl"
modelo_cargado = None

def cargar_modelo():
    global modelo_cargado
    if modelo_cargado is None:
        if not os.path.exists(MODELO_PATH):
            raise FileNotFoundError(f"Modelo no encontrado en {MODELO_PATH}")
        
        print(f"📦 Cargando modelo desde {MODELO_PATH}...")
        modelo_cargado = joblib.load(MODELO_PATH)
        print(f"✅ Modelo cargado: {modelo_cargado.get('version', 'desconocido')}")
    
    return modelo_cargado


@router.get("/usuarios/{usuario_id}/recomendaciones")
async def obtener_recomendaciones(
    usuario_id: int,
    top_n: int = 10,
    db: Session = Depends(get_db)
):
    """Obtener recomendaciones personalizadas"""
    try:
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail=f"Usuario {usuario_id} no encontrado")
        
        modelo = cargar_modelo()
        
        sistema = SistemaRecomendacionHibrido()
        sistema.knn_model = modelo['knn_model']
        sistema.preprocessor = modelo['preprocessor']
        sistema.features_matrix = modelo['features_matrix']
        sistema.df_vehiculos = modelo['df_vehiculos']
        sistema.df_interacciones = modelo['df_interacciones']
        
        recomendaciones = sistema.recomendar(usuario_id, db, top_n=top_n)
        
        resultado = []
        for rec in recomendaciones:
            v = rec['vehiculo']
            resultado.append({
                'vehiculo_id': v.id,
                'marca': v.marca,
                'modelo': v.modelo,
                'año': v.año,
                'precio': v.precio,
                'holograma': v.holograma,
                'tipo_vehiculo': v.tipo_vehiculo,
                'combustible': v.combustible if v.combustible else None,
                'transmision': v.transmision if v.transmision else None,
                'score': rec['score'],
                'score_usuario': rec['score_usuario'],
                'score_knn': rec['score_knn'],
                'razon': rec['razon']
            })
        
        return {
            'usuario_id': usuario_id,
            'usuario_nombre': usuario.nombre,
            'total': len(resultado),
            'recomendaciones': resultado
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/recomendaciones/info")
async def info_modelo():
    """Info del modelo"""
    try:
        modelo = cargar_modelo()
        return {
            'status': 'ok',
            'version': modelo.get('version'),
            'fecha_entrenamiento': modelo.get('fecha_entrenamiento'),
            'num_vehiculos': len(modelo['df_vehiculos']),
            'num_interacciones': len(modelo['df_interacciones'])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

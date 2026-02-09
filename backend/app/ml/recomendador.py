# -*- coding: utf-8 -*-
"""
Sistema de recomendaciones híbrido con LightFM
Combina filtrado colaborativo + características de contenido
"""
import numpy as np
import pandas as pd
from lightfm import LightFM
from lightfm.data import Dataset
from scipy.sparse import csr_matrix
from sqlalchemy.orm import Session
from typing import List, Dict, Tuple
import joblib
import os

from app.models.usuario import Usuario
from app.models.vehiculo import Vehiculo
from app.models.interaccion import Interaccion

class SistemaRecomendacion:
    """Sistema de recomendaciones basado en LightFM"""
    
    def __init__(self):
        self.modelo = None
        self.dataset = None
        self.user_features = None
        self.item_features = None
        self.user_id_map = {}
        self.item_id_map = {}
        self.reverse_item_map = {}
        
    def preparar_datos(self, db: Session):
        """Prepara datos para entrenamiento"""
        print("📊 Preparando datos para el modelo...")
        
        # Obtener todos los datos
        usuarios = db.query(Usuario).all()
        vehiculos = db.query(Vehiculo).all()
        interacciones = db.query(Interaccion).all()
        
        print(f"   ✓ Usuarios: {len(usuarios)}")
        print(f"   ✓ Vehículos: {len(vehiculos)}")
        print(f"   ✓ Interacciones: {len(interacciones)}")
        
        # Crear mapeos de IDs
        self.user_id_map = {u.id: idx for idx, u in enumerate(usuarios)}
        self.item_id_map = {v.id: idx for idx, v in enumerate(vehiculos)}
        self.reverse_item_map = {idx: v.id for idx, v in enumerate(vehiculos)}
        
        # Crear dataset de LightFM
        self.dataset = Dataset()
        
        # Definir características de usuarios
        user_features_list = [
            'edad_18_30', 'edad_31_45', 'edad_46_65',
            'presupuesto_bajo', 'presupuesto_medio', 'presupuesto_alto',
            'holograma_00', 'holograma_0', 'holograma_1', 'holograma_2', 'holograma_no_importa',
            'uso_trabajo', 'uso_familia', 'uso_recreativo', 'uso_mixto',
            'tipo_nuevo', 'tipo_seminuevo', 'tipo_ambos',
            'combustible_hibrido', 'combustible_electrico', 'combustible_gasolina'
        ]
        
        # Definir características de vehículos
        item_features_list = [
            'precio_bajo', 'precio_medio', 'precio_alto', 'precio_premium',
            'holograma_00', 'holograma_0', 'holograma_1', 'holograma_2',
            'tipo_nuevo', 'tipo_seminuevo',
            'combustible_hibrido', 'combustible_electrico', 'combustible_gasolina',
            'segmento_compacto', 'segmento_mediano', 'segmento_suv', 'segmento_pickup'
        ]
        
        # Fit del dataset
        self.dataset.fit(
            users=[u.id for u in usuarios],
            items=[v.id for v in vehiculos],
            user_features=user_features_list,
            item_features=item_features_list
        )
        
        # Crear matriz de interacciones
        interactions_data = [
            (i.usuario_id, i.vehiculo_id, i.peso) 
            for i in interacciones
        ]
        
        interactions, weights = self.dataset.build_interactions(interactions_data)
        
        # Construir features de usuarios
        user_features_data = []
        for u in usuarios:
            features = []
            
            # Edad
            if u.edad <= 30:
                features.append('edad_18_30')
            elif u.edad <= 45:
                features.append('edad_31_45')
            else:
                features.append('edad_46_65')
            
            # Presupuesto
            if u.presupuesto_max <= 300000:
                features.append('presupuesto_bajo')
            elif u.presupuesto_max <= 500000:
                features.append('presupuesto_medio')
            else:
                features.append('presupuesto_alto')
            
            # Holograma
            if u.holograma_prioridad == '00':
                features.append('holograma_00')
            elif u.holograma_prioridad == '0':
                features.append('holograma_0')
            elif u.holograma_prioridad == '1':
                features.append('holograma_1')
            elif u.holograma_prioridad == '2':
                features.append('holograma_2')
            else:
                features.append('holograma_no_importa')
            
            # Uso
            if u.uso_principal == 'trabajo':
                features.append('uso_trabajo')
            elif u.uso_principal == 'familia':
                features.append('uso_familia')
            elif u.uso_principal == 'recreativo':
                features.append('uso_recreativo')
            else:
                features.append('uso_mixto')
            
            # Tipo de vehículo
            if u.tipo_vehiculo_preferido == 'nuevo':
                features.append('tipo_nuevo')
            elif u.tipo_vehiculo_preferido == 'seminuevo':
                features.append('tipo_seminuevo')
            else:
                features.append('tipo_ambos')
            
            # Combustible
            if 'Híbrido' in u.combustible_preferido:
                features.append('combustible_hibrido')
            elif 'Eléctrico' in u.combustible_preferido:
                features.append('combustible_electrico')
            else:
                features.append('combustible_gasolina')
            
            user_features_data.append((u.id, features))
        
        self.user_features = self.dataset.build_user_features(user_features_data)
        
        # Construir features de vehículos
        item_features_data = []
        for v in vehiculos:
            features = []
            
            # Precio
            if v.precio <= 300000:
                features.append('precio_bajo')
            elif v.precio <= 450000:
                features.append('precio_medio')
            elif v.precio <= 600000:
                features.append('precio_alto')
            else:
                features.append('precio_premium')
            
            # Holograma
            if v.holograma == '00':
                features.append('holograma_00')
            elif v.holograma == '0':
                features.append('holograma_0')
            elif v.holograma == '1':
                features.append('holograma_1')
            else:
                features.append('holograma_2')
            
            # Tipo
            if v.tipo_vehiculo == 'nuevo':
                features.append('tipo_nuevo')
            else:
                features.append('tipo_seminuevo')
            
            # Combustible
            if 'Híbrido' in v.combustible:
                features.append('combustible_hibrido')
            elif 'Eléctrico' in v.combustible:
                features.append('combustible_electrico')
            else:
                features.append('combustible_gasolina')
            
            # Segmento
            if v.segmento:
                if 'Compacto' in v.segmento:
                    features.append('segmento_compacto')
                elif 'Mediano' in v.segmento or 'Sedán' in v.segmento:
                    features.append('segmento_mediano')
                elif 'SUV' in v.segmento:
                    features.append('segmento_suv')
                elif 'Pickup' in v.segmento:
                    features.append('segmento_pickup')
            
            item_features_data.append((v.id, features))
        
        self.item_features = self.dataset.build_item_features(item_features_data)
        
        print("✅ Datos preparados correctamente")
        return interactions, weights
    
    def entrenar(self, interactions, weights):
        """Entrena el modelo de recomendación"""
        print("\n🤖 Entrenando modelo de recomendación...")
        print(f"   Interacciones shape: {interactions.shape}")
        print(f"   User features shape: {self.user_features.shape}")
        print(f"   Item features shape: {self.item_features.shape}")
    
    try:
        # Crear modelo híbrido
        print("   Creando modelo LightFM...")
        self.modelo = LightFM(
            no_components=50,
            loss='warp',
            learning_rate=0.05,
            random_state=42
        )
        print("   ✓ Modelo creado")
        
        # Entrenar
        print("   Iniciando entrenamiento (30 épocas)...")
        print("   Esto puede tardar 2-5 minutos...")
        
        for epoch in range(30):
            self.modelo.fit_partial(
                interactions,
                user_features=self.user_features,
                item_features=self.item_features,
                sample_weight=weights,
                epochs=1,
                num_threads=1  # Usar 1 thread para evitar problemas
            )
            if epoch % 5 == 0:
                print(f"   ✓ Época {epoch}/30 completada")
        
        print("   ✓ Entrenamiento completado")
        print("✅ Modelo entrenado exitosamente")
        
    except Exception as e:
        print(f"\n❌ Error durante el entrenamiento: {e}")
        import traceback
        traceback.print_exc()
        raise
    
    def _generar_razon(self, usuario: Usuario, vehiculo: Vehiculo) -> str:
        """Genera una explicación de por qué se recomienda este vehículo"""
        razones = []
        
        # Precio
        if usuario.presupuesto_min <= vehiculo.precio <= usuario.presupuesto_max:
            razones.append("dentro de tu presupuesto")
        
        # Holograma
        if usuario.holograma_prioridad != 'no_importa' and usuario.holograma_prioridad == vehiculo.holograma:
            razones.append(f"holograma {vehiculo.holograma} (tu preferencia)")
        
        # Tipo
        if usuario.tipo_vehiculo_preferido == vehiculo.tipo_vehiculo:
            razones.append(f"vehículo {vehiculo.tipo_vehiculo}")
        
        if razones:
            return "Recomendado: " + ", ".join(razones)
        else:
            return "Basado en tus preferencias generales"
    
    def guardar_modelo(self, ruta: str = "app/ml/modelo_recomendacion.pkl"):
        """Guarda el modelo entrenado"""
        datos = {
            'modelo': self.modelo,
            'dataset': self.dataset,
            'user_features': self.user_features,
            'item_features': self.item_features,
            'user_id_map': self.user_id_map,
            'item_id_map': self.item_id_map,
            'reverse_item_map': self.reverse_item_map
        }
        joblib.dump(datos, ruta)
        print(f"✅ Modelo guardado en {ruta}")
    
    def cargar_modelo(self, ruta: str = "app/ml/modelo_recomendacion.pkl"):
        """Carga un modelo previamente entrenado"""
        if not os.path.exists(ruta):
            raise Exception(f"No se encontró el modelo en {ruta}")
        
        datos = joblib.load(ruta)
        self.modelo = datos['modelo']
        self.dataset = datos['dataset']
        self.user_features = datos['user_features']
        self.item_features = datos['item_features']
        self.user_id_map = datos['user_id_map']
        self.item_id_map = datos['item_id_map']
        self.reverse_item_map = datos['reverse_item_map']
        
        print("✅ Modelo cargado exitosamente")
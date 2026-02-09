# -*- coding: utf-8 -*-
"""
Script de Entrenamiento - Sistema de Recomendación Híbrido con KNN
VERSIÓN OPTIMIZADA PARA CDMX

Combina: 
- Scoring personalizado por usuario (contenido) con lógica CDMX
- KNN para similitud entre vehículos (colaborativo)
- Explicabilidad completa
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.neighbors import NearestNeighbors
import joblib
import time

from app.database.connection import SessionLocal
from app.models.vehiculo import Vehiculo
from app.models.usuario import Usuario
from app.models.interaccion import Interaccion


class SistemaRecomendacionHibrido:
    """Sistema híbrido: Scoring personalizado + KNN para similitud"""
    
    def __init__(self):
        self.knn_model = None
        self.preprocessor = None
        self.features_matrix = None
        self.df_vehiculos = None
        self.df_interacciones = None
    
    def preparar_datos(self, db):
        """Cargar datos de la BD"""
        print("📊 Cargando datos desde PostgreSQL...")
        
        # Vehículos
        vehiculos = db.query(Vehiculo).all()
        data_vehiculos = [{
            'id': v.id,
            'marca': v.marca,
            'modelo': v.modelo,
            'tipo_vehiculo': v.tipo_vehiculo,
            'ano': v.año,  # ← CORREGIDO: año con tilde
            'precio': v.precio,
            'combustible': v.combustible,
            'transmision': v.transmision or 'Manual',
            'rendimiento_ciudad_kmL': v.rendimiento_ciudad_kmL or 10.0,
            'holograma': v.holograma,
            'segmento': v.segmento or 'Compacto',
            'estrellas_seguridad': v.estrellas_seguridad or 3,
            'capacidad_pasajeros': v.capacidad_pasajeros or 5,
            'largo_m': v.largo_m or 4.5,
            'ancho_m': v.ancho_m or 1.8,
            'emisiones_CO2_g_km': v.emisiones_CO2_gkm or 150  # ← CORREGIDO: emisiones_CO2_gkm sin guiones
        } for v in vehiculos]
        
        self.df_vehiculos = pd.DataFrame(data_vehiculos)
        
        # Interacciones
        interacciones = db.query(Interaccion).all()
        data_interacciones = [{
            'usuario_id': i.usuario_id,
            'vehiculo_id': i.vehiculo_id,
            'peso': i.peso
        } for i in interacciones]
        
        self.df_interacciones = pd.DataFrame(data_interacciones)
        
        print(f"   ✓ Vehículos: {len(self.df_vehiculos)}")
        print(f"   ✓ Interacciones: {len(self.df_interacciones)}")
    
    def entrenar_knn(self):
        """Entrenar modelo KNN para similitud entre vehículos"""
        print("\n🤖 Entrenando modelo KNN...")
        
        # Features para similitud
        categorical_features = ['holograma', 'tipo_vehiculo', 'transmision', 'segmento', 'marca', 'combustible']
        numeric_features = ['precio', 'rendimiento_ciudad_kmL', 'estrellas_seguridad', 'ano']
        
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', MinMaxScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
            ])
        
        # Transformar datos
        self.features_matrix = self.preprocessor.fit_transform(self.df_vehiculos)
        
        # Entrenar KNN
        self.knn_model = NearestNeighbors(n_neighbors=20, metric='cosine', n_jobs=1)
        self.knn_model.fit(self.features_matrix)
        
        print("   ✓ Modelo KNN entrenado exitosamente")
    
    def calcular_score_usuario(self, vehiculo_row, usuario):
        """Score personalizado por usuario con lógica optimizada para CDMX (60% del score final)"""
        score = 0.0
        
        # 1. Presupuesto (25%)
        if usuario.presupuesto_min <= vehiculo_row['precio'] <= usuario.presupuesto_max:
            score += 0.25
        elif vehiculo_row['precio'] < usuario.presupuesto_min:
            score += 0.15
        elif vehiculo_row['precio'] > usuario.presupuesto_max:
            score -= 0.10
        
        # 2. Tipo de vehículo (15%)
        if usuario.tipo_vehiculo_preferido and vehiculo_row['tipo_vehiculo'] == usuario.tipo_vehiculo_preferido:
            score += 0.15
        
        # --- MEJORA: Lógica más agresiva para CDMX ---
        
        # 3. Holograma (20%): Prioridad absoluta a Exentos si el usuario lo pide
        if usuario.holograma_prioridad:
            if vehiculo_row['holograma'] == 'Exento':
                score += 0.20  # ¡Premio mayor para híbridos/eléctricos!
            elif vehiculo_row['holograma'] in ['00', '0']:
                score += 0.15
            elif vehiculo_row['holograma'] == '1':
                score += 0.05
            elif vehiculo_row['holograma'] not in ['Exento', '00', '0', '1', '2']:
                score -= 0.05
        
        # 4. Combustible (10%)
        if usuario.combustible_preferido:
            if vehiculo_row['combustible'] == usuario.combustible_preferido:
                score += 0.10
            # Bonus extra para híbridos/eléctricos en CDMX
            if vehiculo_row['combustible'] in ['Híbrido', 'Eléctrico', 'Hibrido']:
                score += 0.05
        
        # 5. Transmisión (10%)
        if usuario.transmision_preferida and vehiculo_row['transmision'] == usuario.transmision_preferida:
            score += 0.10
        
        # 6. Rendimiento (10%)
        if vehiculo_row['rendimiento_ciudad_kmL'] >= 15:
            score += 0.10
        elif vehiculo_row['rendimiento_ciudad_kmL'] >= 12:
            score += 0.05
        
        # --- PENALIZACIONES ESPECÍFICAS CDMX ---
        
        # 7. Penalización por bajo rendimiento (crítico para CDMX)
        if vehiculo_row['rendimiento_ciudad_kmL'] < 10:
            score -= 0.08
        
        # 8. Penalización por vehículos muy grandes (difíciles de estacionar en CDMX)
        if vehiculo_row['largo_m'] > 5.0 or vehiculo_row['ancho_m'] > 2.0:
            score -= 0.05
        
        # 9. Penalización por altas emisiones (contaminación CDMX)
        if vehiculo_row['emisiones_CO2_g_km'] > 200:
            score -= 0.08
        elif vehiculo_row['emisiones_CO2_g_km'] > 150:
            score -= 0.03
        
        # 10. Bonus por seguridad (importante en CDMX)
        if vehiculo_row['estrellas_seguridad'] >= 5:
            score += 0.05
        elif vehiculo_row['estrellas_seguridad'] >= 4:
            score += 0.03
        
        # Asegurar que el score esté entre 0 y 1
        return max(0.0, min(score, 1.0))
    
    def obtener_vehiculos_interactuados(self, usuario_id):
        """Obtener IDs de vehículos con los que el usuario interactuó"""
        if self.df_interacciones.empty:
            return []
        
        interacciones_usuario = self.df_interacciones[
            self.df_interacciones['usuario_id'] == usuario_id
        ].sort_values('peso', ascending=False)
        
        return interacciones_usuario['vehiculo_id'].head(5).tolist()
    
    def recomendar(self, usuario_id, db, top_n=10):
        """Generar recomendaciones híbridas"""
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        
        if not usuario:
            return []
        
        # Obtener vehículos que el usuario ya vio/interactuó
        vehiculos_vistos = self.obtener_vehiculos_interactuados(usuario_id)
        
        recomendaciones = []
        
        for idx, vehiculo_row in self.df_vehiculos.iterrows():
            vehiculo_id = vehiculo_row['id']
            
            # 1. Score personalizado (60%)
            score_usuario = self.calcular_score_usuario(vehiculo_row, usuario)
            
            # 2. Score KNN por similitud con vehículos vistos (40%)
            score_knn = 0.0
            if vehiculos_vistos:
                for vehiculo_visto_id in vehiculos_vistos:
                    try:
                        idx_visto = self.df_vehiculos[self.df_vehiculos['id'] == vehiculo_visto_id].index[0]
                        distances, indices = self.knn_model.kneighbors([self.features_matrix[idx_visto]], n_neighbors=20)
                        
                        if idx in indices[0]:
                            pos = np.nonzero(indices[0] == idx)[0][0]
                            similitud = 1 - distances[0][pos]
                            score_knn += similitud
                    except:
                        pass
                
                if vehiculos_vistos:
                    score_knn = score_knn / len(vehiculos_vistos)
            
            # 3. Score final combinado
            score_final = (score_usuario * 0.6) + (score_knn * 0.4)
            
            recomendaciones.append({
                'vehiculo_id': vehiculo_id,
                'score': round(score_final, 4),
                'score_usuario': round(score_usuario, 4),
                'score_knn': round(score_knn, 4)
            })
        
        # Ordenar y retornar top N
        recomendaciones = sorted(recomendaciones, key=lambda x: x['score'], reverse=True)
        
        # Enriquecer con datos del vehículo
        resultado = []
        for rec in recomendaciones[:top_n]:
            vehiculo = db.query(Vehiculo).filter(Vehiculo.id == rec['vehiculo_id']).first()
            if vehiculo:
                resultado.append({
                    'vehiculo': vehiculo,
                    'score': rec['score'],
                    'score_usuario': rec['score_usuario'],
                    'score_knn': rec['score_knn'],
                    'razon': self._generar_razon(vehiculo, usuario, rec['score_usuario'], rec['score_knn'])
                })
        
        return resultado
    
    def _generar_razon(self, vehiculo, usuario, score_usuario, score_knn):
        """Generar explicación mejorada con contexto CDMX"""
        razones = []
        
        if usuario.presupuesto_min <= vehiculo.precio <= usuario.presupuesto_max:
            razones.append("✓ Dentro de tu presupuesto")
        
        if usuario.tipo_vehiculo_preferido and vehiculo.tipo_vehiculo == usuario.tipo_vehiculo_preferido:
            razones.append(f"✓ {vehiculo.tipo_vehiculo} como buscas")
        
        if vehiculo.holograma == 'Exento':
            razones.append("🌿 EXENTO - Circula todos los días (Híbrido/Eléctrico)")
        elif vehiculo.holograma in ['00', '0']:
            razones.append("✓ Holograma Exento/Verde - Circula todos los días")
        elif vehiculo.holograma == '1':
            razones.append("Holograma 1 - Buena circulación")
        
        if vehiculo.rendimiento_ciudad_kmL and vehiculo.rendimiento_ciudad_kmL > 15:
            razones.append(f"⛽ Excelente rendimiento ({vehiculo.rendimiento_ciudad_kmL} km/L)")
        
        if vehiculo.estrellas_seguridad and vehiculo.estrellas_seguridad >= 5:
            razones.append(f"⭐ Máxima seguridad ({vehiculo.estrellas_seguridad} estrellas)")
        
        if score_knn > 0.3:
            razones.append("Similar a vehículos que te interesan")
        
        if vehiculo.largo_m and vehiculo.largo_m < 4.5:
            razones.append("Compacto - Ideal para estacionar en CDMX")
        
        return " | ".join(razones) if razones else "Recomendado por tus preferencias"
    
    def guardar_modelo(self, ruta="app/ml/modelo_recomendacion.pkl"):
        """Guardar modelo"""
        os.makedirs(os.path.dirname(ruta), exist_ok=True)
        
        artifact = {
            'knn_model': self.knn_model,
            'preprocessor': self.preprocessor,
            'features_matrix': self.features_matrix,
            'df_vehiculos': self.df_vehiculos,
            'df_interacciones': self.df_interacciones,
            'version': 'hibrido-knn-cdmx-1.0',
            'fecha_entrenamiento': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        joblib.dump(artifact, ruta)
        print(f"   ✓ Modelo guardado en {ruta}")
    
    def cargar_modelo(self, ruta="app/ml/modelo_recomendacion.pkl"):
        """Cargar modelo"""
        if not os.path.exists(ruta):
            raise FileNotFoundError(f"No se encontró el modelo en {ruta}")
        
        artifact = joblib.load(ruta)
        self.knn_model = artifact['knn_model']
        self.preprocessor = artifact['preprocessor']
        self.features_matrix = artifact['features_matrix']
        self.df_vehiculos = artifact['df_vehiculos']
        self.df_interacciones = artifact['df_interacciones']
        
        print(f"   ✓ Modelo cargado desde {ruta}")


# ==================== SCRIPT DE ENTRENAMIENTO ====================

def main():
    print("="*60)
    print("ENTRENAMIENTO MODELO HÍBRIDO KNN - VERSIÓN CDMX")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        start_time = time.time()
        
        # Crear y entrenar sistema
        sistema = SistemaRecomendacionHibrido()
        sistema.preparar_datos(db)
        sistema.entrenar_knn()
        sistema.guardar_modelo()
        
        elapsed = time.time() - start_time
        print(f"\n⏱️  Tiempo total: {elapsed:.2f} segundos")
        
        # ===== PRUEBA DE RECOMENDACIONES =====
        print("\n" + "="*60)
        print("🧪 PRUEBA DE RECOMENDACIONES")
        print("="*60)
        
        # Probar con los primeros 3 usuarios
        usuarios_prueba = db.query(Usuario).limit(3).all()
        
        for usuario in usuarios_prueba:
            recomendaciones = sistema.recomendar(usuario.id, db, top_n=5)
            
            if recomendaciones:
                print(f"\n👤 Usuario: {usuario.nombre}")
                print(f"   💰 Presupuesto: ${usuario.presupuesto_min:,.0f} - ${usuario.presupuesto_max:,.0f}")
                print(f"   🚗 Preferencias: {usuario.tipo_vehiculo_preferido or 'Sin especificar'}")
                print(f"   🚦 Holograma prioritario: {'Sí' if usuario.holograma_prioridad else 'No'}")
                print(f"\n   📋 Top 5 recomendaciones:")
                
                for i, rec in enumerate(recomendaciones, 1):
                    v = rec['vehiculo']
                    print(f"\n   {i}. {v.marca} {v.modelo} ({v.año})")
                    print(f"      💰 ${v.precio:,.0f} | 🚦 Holograma: {v.holograma} | ⛽ {v.rendimiento_ciudad_kmL} km/L")
                    print(f"      📊 Score: {rec['score']:.4f} (Usuario: {rec['score_usuario']:.3f} | KNN: {rec['score_knn']:.3f})")
                    print(f"      💡 {rec['razon']}")
        
        print("\n" + "="*60)
        print("✅ ENTRENAMIENTO COMPLETADO EXITOSAMENTE")
        print("="*60)
        print(f"\n📁 Modelo guardado en: app/ml/modelo_recomendacion.pkl")
        print(f"📦 Versión: hibrido-knn-cdmx-1.0")
        print(f"🕐 Fecha: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    exit(main())
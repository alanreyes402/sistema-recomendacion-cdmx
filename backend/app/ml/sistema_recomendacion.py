# -*- coding: utf-8 -*-
"""
Sistema de Recomendación Híbrido con KNN
Clase para generar recomendaciones
"""
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.vehiculo import Vehiculo


class SistemaRecomendacionHibrido:
    """Sistema híbrido: Scoring personalizado + KNN para similitud"""
    
    def __init__(self):
        self.knn_model = None
        self.preprocessor = None
        self.features_matrix = None
        self.df_vehiculos = None
        self.df_interacciones = None
    
    def obtener_vehiculos_interactuados(self, usuario_id):
        """Obtener IDs de vehículos con los que el usuario interactuó"""
        if self.df_interacciones.empty:
            return []
        
        interacciones_usuario = self.df_interacciones[
            self.df_interacciones['usuario_id'] == usuario_id
        ].sort_values('peso', ascending=False)
        
        return interacciones_usuario['vehiculo_id'].head(5).tolist()
    
    def calcular_score_usuario(self, vehiculo_row, usuario):
        """Score personalizado por usuario con lógica optimizada para CDMX"""
        score = 0.0
        
        if usuario.presupuesto_min <= vehiculo_row['precio'] <= usuario.presupuesto_max:
            score += 0.25
        elif vehiculo_row['precio'] < usuario.presupuesto_min:
            score += 0.15
        elif vehiculo_row['precio'] > usuario.presupuesto_max:
            score -= 0.10
        
        if usuario.tipo_vehiculo_preferido and vehiculo_row['tipo_vehiculo'] == usuario.tipo_vehiculo_preferido:
            score += 0.15
        
        if usuario.holograma_prioridad:
            if vehiculo_row['holograma'] == 'Exento':
                score += 0.20
            elif vehiculo_row['holograma'] in ['00', '0']:
                score += 0.15
            elif vehiculo_row['holograma'] == '1':
                score += 0.05
            elif vehiculo_row['holograma'] not in ['Exento', '00', '0', '1', '2']:
                score -= 0.05
        
        if usuario.combustible_preferido:
            if vehiculo_row['combustible'] == usuario.combustible_preferido:
                score += 0.10
            if vehiculo_row['combustible'] in ['Híbrido', 'Eléctrico', 'Hibrido']:
                score += 0.05
        
        if usuario.transmision_preferida and vehiculo_row['transmision'] == usuario.transmision_preferida:
            score += 0.10
        
        if vehiculo_row['rendimiento_ciudad_kmL'] >= 15:
            score += 0.10
        elif vehiculo_row['rendimiento_ciudad_kmL'] >= 12:
            score += 0.05
        
        if vehiculo_row['rendimiento_ciudad_kmL'] < 10:
            score -= 0.08
        
        if vehiculo_row['largo_m'] > 5.0 or vehiculo_row['ancho_m'] > 2.0:
            score -= 0.05
        
        if vehiculo_row['emisiones_CO2_g_km'] > 200:
            score -= 0.08
        elif vehiculo_row['emisiones_CO2_g_km'] > 150:
            score -= 0.03
        
        if vehiculo_row['estrellas_seguridad'] >= 5:
            score += 0.05
        elif vehiculo_row['estrellas_seguridad'] >= 4:
            score += 0.03
        
        return max(0.0, min(score, 1.0))
    
    def recomendar(self, usuario_id, db: Session, top_n=10):
        """Generar recomendaciones híbridas (OPTIMIZADO)"""
        from app.models.usuario import Usuario
        from app.models.vehiculo import Vehiculo
        
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            return []
        
        vehiculos_vistos = self.obtener_vehiculos_interactuados(usuario_id)
        
        # PRE-FILTRAR vehículos por presupuesto para reducir cálculos
        margen = 0.2  # 20% de margen
        precio_min_filtro = usuario.presupuesto_min * (1 - margen)
        precio_max_filtro = usuario.presupuesto_max * (1 + margen)
        
        df_filtrado = self.df_vehiculos[
            (self.df_vehiculos['precio'] >= precio_min_filtro) &
            (self.df_vehiculos['precio'] <= precio_max_filtro)
        ]
        
        print(f"🔍 Filtrando: {len(self.df_vehiculos)} → {len(df_filtrado)} vehículos")
        
        recomendaciones = []
        
        # Calcular scores solo para vehículos filtrados
        for idx, vehiculo_row in df_filtrado.iterrows():
            vehiculo_id = vehiculo_row['id']
            score_usuario = self.calcular_score_usuario(vehiculo_row, usuario)
            
            # Score KNN (40%)
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
            
            score_final = (score_usuario * 0.6) + (score_knn * 0.4)
            
            recomendaciones.append({
                'vehiculo_id': vehiculo_id,
                'score': round(score_final, 4),
                'score_usuario': round(score_usuario, 4),
                'score_knn': round(score_knn, 4)
            })
        
        # Ordenar y tomar top N
        recomendaciones = sorted(recomendaciones, key=lambda x: x['score'], reverse=True)[:top_n * 3]
        
        # Enriquecer con datos completos
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
        """Generar explicación"""
        razones = []
        
        if usuario.presupuesto_min <= vehiculo.precio <= usuario.presupuesto_max:
            razones.append("Dentro de tu presupuesto")
        
        if usuario.tipo_vehiculo_preferido and vehiculo.tipo_vehiculo == usuario.tipo_vehiculo_preferido:
            razones.append(f"{vehiculo.tipo_vehiculo} como buscas")
        
        # --- CORRECCIÓN DE TEXTOS DE HOLOGRAMA ---
        if vehiculo.holograma == 'Exento':
            razones.append("EXENTO - Circula todos los dias")
        elif vehiculo.holograma in ['00', '0']:
            razones.append("Holograma 0 y 00 - Circula todos los días")
        elif vehiculo.holograma == '1':
            razones.append("Holograma 1 - Descansa 2 sábados al mes")
        elif vehiculo.holograma == '2':
            razones.append("Holograma 2 - Descansa todos los sábados")
        # -----------------------------------------
            
        if vehiculo.rendimiento_ciudad_kmL and vehiculo.rendimiento_ciudad_kmL > 15:
            razones.append(f"Excelente rendimiento ({vehiculo.rendimiento_ciudad_kmL} km/L)")
        
        if vehiculo.estrellas_seguridad and vehiculo.estrellas_seguridad >= 5:
            razones.append(f"Maxima seguridad ({vehiculo.estrellas_seguridad} estrellas)")
        
        if score_knn > 0.3:
            razones.append("Similar a vehiculos que te interesan")
        
        if vehiculo.largo_m and vehiculo.largo_m < 4.5:
            razones.append("Compacto - Ideal para CDMX")
        
        return " | ".join(razones) if razones else "Recomendado por tus preferencias"
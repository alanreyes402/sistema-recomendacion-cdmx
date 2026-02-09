# -*- coding: utf-8 -*-
import pandas as pd
import sys
import os

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import func
from app.database.connection import SessionLocal, engine, Base
from app.models.vehiculo import Vehiculo

def corregir_holograma_en_carga(año, combustible, holograma_csv):
    """
    Re-aplica la lógica de hologramas al cargar,
    para corregir el problema de "00" que se convierte en "0"
    """
    combustible = str(combustible).lower().strip()
    año = int(año)
    
    # Regla 1: Eléctricos e Híbridos son Exentos
    if 'híbrido' in combustible or 'eléctrico' in combustible or 'hibrido' in combustible:
        return 'Exento'
    
    # Regla 2: Autos nuevos (2024-2025) son 00
    if año >= 2024:
        return '00'
    
    # Regla 3: Autos de 2017 a 2023 son 0
    if 2017 <= año <= 2023:
        return '0'
    
    # Regla 4: Autos de 2009 a 2016 son 1
    if 2009 <= año <= 2016:
        return '1'
    
    # Regla 5: Autos más viejos son 2
    if año < 2009:
        return '2'
    
    return '0'

def cargar_vehiculos_a_db():
    """
    Carga los vehículos del CSV limpio a PostgreSQL
    """
    
    # 1. Crear las tablas si no existen
    print("📦 Creando tablas en PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tablas creadas")
    
    # 2. Cargar el CSV limpio
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'vehiculos_cdmx_limpio.csv')
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: No se encontró el archivo {csv_path}")
        print("Ejecuta primero: python scripts/limpiar_csv.py")
        return
    
    print(f"\n📄 Cargando CSV desde: {csv_path}")
    # Leer holograma como string para preservar "00"
    df = pd.read_csv(csv_path, encoding='utf-8-sig', dtype={'holograma': str})
    print(f"✓ CSV cargado: {len(df)} vehículos")
    
    # 3. Re-aplicar lógica de hologramas (corrige el problema de "00" → "0")
    print("\n🔧 Re-aplicando lógica de hologramas...")
    df['holograma'] = df.apply(
        lambda row: corregir_holograma_en_carga(row['año'], row['combustible'], row['holograma']),
        axis=1
    )
    
    print("\n🔍 Verificando hologramas después de corrección:")
    print(df['holograma'].value_counts().sort_index())
    
    # 4. Crear sesión de base de datos
    db = SessionLocal()
    
    try:
        # 5. Limpiar datos existentes (opcional)
        print("\n🗑️  Limpiando datos existentes...")
        db.query(Vehiculo).delete()
        db.commit()
        print("✓ Datos anteriores eliminados")
        
        # 6. Insertar vehículos
        print("\n💾 Insertando vehículos en PostgreSQL...")
        vehiculos_insertados = 0
        errores = 0
        
        for index, row in df.iterrows():
            try:
                vehiculo = Vehiculo(
                    marca=row['marca'],
                    modelo=row['modelo'],
                    tipo_vehiculo=row['tipo_vehiculo'],
                    año=int(row['año']),
                    precio=float(row['precio']),
                    tipo_carroceria=row['tipo_carroceria'],
                    combustible=row['combustible'],
                    transmision=row['transmision'],
                    cilindros=int(row['cilindros']) if pd.notna(row['cilindros']) else None,
                    rendimiento_ciudad_kmL=float(row['rendimiento_ciudad_kmL']) if pd.notna(row['rendimiento_ciudad_kmL']) else None,
                    capacidad_pasajeros=int(row['capacidad_pasajeros']) if pd.notna(row['capacidad_pasajeros']) else None,
                    cajuela_litros=int(row['cajuela_litros']) if pd.notna(row['cajuela_litros']) else None,
                    segmento=row['segmento'],
                    holograma=row['holograma'],
                    largo_m=float(row['largo_m']) if pd.notna(row['largo_m']) else None,
                    ancho_m=float(row['ancho_m']) if pd.notna(row['ancho_m']) else None,
                    altura_cm=float(row['altura_cm']) if pd.notna(row['altura_cm']) else None,
                    costo_mantenimiento_anual=float(row['costo_mantenimiento_anual']) if pd.notna(row['costo_mantenimiento_anual']) else None,
                    disponibilidad_refacciones=row['disponibilidad_refacciones'],
                    kilometraje_km=float(row['kilometraje_km']) if pd.notna(row['kilometraje_km']) else None,
                    altura_libre_suelo_cm=float(row['altura_libre_suelo_cm']) if pd.notna(row['altura_libre_suelo_cm']) else None,
                    tipo_aspiracion=row['tipo_aspiracion'],
                    estrellas_seguridad=int(row['estrellas_seguridad']) if pd.notna(row['estrellas_seguridad']) else None,
                    conectividad=row['conectividad'],
                    emisiones_CO2_gkm=float(row['emisiones_CO2_gkm']) if pd.notna(row['emisiones_CO2_gkm']) else None
                )
                
                db.add(vehiculo)
                vehiculos_insertados += 1
                
                # Commit cada 50 vehículos
                if vehiculos_insertados % 50 == 0:
                    db.commit()
                    print(f"  ✓ {vehiculos_insertados}/{len(df)} vehículos insertados...")
                
            except Exception as e:
                errores += 1
                if errores <= 5:  # Mostrar solo los primeros 5 errores
                    print(f"  ⚠️  Error en fila {index}: {e}")
                continue
        
        # Commit final
        db.commit()
        print(f"\n✅ Total insertado: {vehiculos_insertados} vehículos")
        if errores > 0:
            print(f"⚠️  Total de errores: {errores}")
        
        # 7. Verificar la inserción
        print("\n🔍 Verificando datos en PostgreSQL...")
        total_db = db.query(Vehiculo).count()
        print(f"✓ Total en base de datos: {total_db}")
        
        # Estadísticas
        print("\n📊 Estadísticas por holograma:")
        hologramas = db.query(Vehiculo.holograma, func.count(Vehiculo.id)).group_by(Vehiculo.holograma).all()
        for holo, count in hologramas:
            porcentaje = (count / total_db * 100) if total_db > 0 else 0
            print(f"  {holo}: {count} vehículos ({porcentaje:.1f}%)")
        
        print("\n📊 Estadísticas por tipo_vehiculo:")
        tipos = db.query(Vehiculo.tipo_vehiculo, func.count(Vehiculo.id)).group_by(Vehiculo.tipo_vehiculo).all()
        for tipo, count in tipos:
            print(f"  {tipo}: {count} vehículos")
        
        print("\n📊 Estadísticas por combustible:")
        combustibles = db.query(Vehiculo.combustible, func.count(Vehiculo.id)).group_by(Vehiculo.combustible).all()
        for comb, count in combustibles:
            print(f"  {comb}: {count} vehículos")
        
        print("\n📊 Ejemplos de vehículos 2024-2025 (deben tener holograma '00'):")
        ejemplos_nuevos = db.query(Vehiculo).filter(Vehiculo.año >= 2024, Vehiculo.combustible == 'gasolina').limit(5).all()
        for v in ejemplos_nuevos:
            print(f"  - {v.marca} {v.modelo} ({v.año}) - Holograma: '{v.holograma}' - ${v.precio:,.0f}")
        
        print("\n📊 Ejemplos de vehículos híbridos/eléctricos (deben tener 'Exento'):")
        ejemplos_exentos = db.query(Vehiculo).filter(Vehiculo.holograma == 'Exento').limit(5).all()
        for v in ejemplos_exentos:
            print(f"  - {v.marca} {v.modelo} ({v.año}) - Combustible: {v.combustible} - Holograma: '{v.holograma}'")
        
        print("\n📊 Rango de precios:")
        precio_min = db.query(func.min(Vehiculo.precio)).scalar()
        precio_max = db.query(func.max(Vehiculo.precio)).scalar()
        precio_avg = db.query(func.avg(Vehiculo.precio)).scalar()
        print(f"  - Mínimo: ${precio_min:,.0f} MXN")
        print(f"  - Máximo: ${precio_max:,.0f} MXN")
        print(f"  - Promedio: ${precio_avg:,.0f} MXN")
        
    except Exception as e:
        print(f"\n❌ Error durante la carga: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    
    finally:
        db.close()
        print("\n✅ Conexión a base de datos cerrada")

if __name__ == "__main__":
    print("🚗 Iniciando carga de vehículos a PostgreSQL...\n")
    cargar_vehiculos_a_db()
    print("\n✅ ¡Proceso completado!")

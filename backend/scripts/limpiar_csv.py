# -*- coding: utf-8 -*-
import pandas as pd
import os

def limpiar_vehiculos_csv():
    """
    Limpia el CSV de vehículos:
    - Corrige encoding (UTF-8 y Latin-1)
    - Limpia caracteres mal codificados (Mojibake)
    - Aplica lógica real de hologramas CDMX
    """
    
    # 1. Rutas de archivos
    input_file = r"C:\Users\P51\Desktop\Archivos\vehiculos_cdmx_300_corregido.csv"
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'vehiculos_cdmx_limpio.csv')
    
    # 2. Cargar el archivo con manejo de encoding
    try:
        df = pd.read_csv(input_file, encoding='utf-8')
        print("✓ Archivo cargado con UTF-8")
    except UnicodeDecodeError:
        df = pd.read_csv(input_file, encoding='latin-1')
        print("✓ Archivo cargado con Latin-1")
    
    print(f"✓ Total de vehículos: {len(df)}")
    print(f"✓ Columnas: {list(df.columns)}")
    
    # 3. Limpiar nombres de columnas (quitar Mojibake)
    df.columns = (df.columns
                  .str.replace('aÃ±o', 'año')
                  .str.replace('transmisiÃ³n', 'transmisión')
                  .str.replace('Ã³', 'ó')
                  .str.replace('Ã¡', 'á')
                  .str.replace('Ã©', 'é')
                  .str.replace('Ã­', 'í')
                  .str.replace('Ãº', 'ú'))
    
    print("✓ Nombres de columnas limpiados")
    
    # 4. Limpiar datos en las celdas
    def limpiar_texto(txt):
        if isinstance(txt, str):
            return (txt.replace('Ã³', 'ó')
                      .replace('Ã¡', 'á')
                      .replace('Ã©', 'é')
                      .replace('Ã­', 'í')
                      .replace('Ãº', 'ú')
                      .replace('Ã±', 'ñ'))
        return txt
    
    df = df.applymap(limpiar_texto)
    print("✓ Datos de celdas limpiados")
    
    # 5. Debug: Ver distribución de años ANTES de corregir
    print("\n🔍 DEBUG - Distribución de años:")
    print(df['año'].value_counts().sort_index())
    
    print("\n🔍 DEBUG - Tipo de datos de 'año':")
    print(df['año'].dtype)
    
    print("\n🔍 DEBUG - Ejemplos de combustibles:")
    print(df['combustible'].unique())
    
    # 6. Asegurar que 'año' es numérico
    df['año'] = pd.to_numeric(df['año'], errors='coerce')
    
    # 7. Aplicar lógica real de Hologramas CDMX
    def corregir_holograma(row):
        try:
            combustible = str(row['combustible']).lower().strip()
            año = int(row['año'])
            
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
            
            # Default (no debería llegar aquí)
            return '0'
            
        except Exception as e:
            print(f"Error procesando: {row['marca']} {row['modelo']} - {e}")
            return '0'
    
    df['holograma'] = df.apply(corregir_holograma, axis=1)
    print("\n✓ Hologramas corregidos según normativa CDMX")
    
    # 8. Debug: Ver algunos ejemplos de la corrección
    print("\n🔍 DEBUG - Ejemplos de vehículos 2024-2025:")
    vehiculos_2024_2025 = df[df['año'] >= 2024][['marca', 'modelo', 'año', 'combustible', 'tipo_vehiculo', 'holograma']].head(10)
    print(vehiculos_2024_2025.to_string())
    
    print("\n🔍 DEBUG - Ejemplos de híbridos/eléctricos:")
    hibridos = df[df['combustible'].str.contains('híbrido|eléctrico', case=False, na=False)][['marca', 'modelo', 'año', 'combustible', 'holograma']].head(10)
    print(hibridos.to_string())
    
    # 9. Guardar archivo limpio
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"\n✅ Archivo limpio guardado en: {output_file}")
    
    # 10. Resumen estadístico
    print("\n📊 Resumen de hologramas:")
    holograma_counts = df['holograma'].value_counts().sort_index()
    for holo, count in holograma_counts.items():
        print(f"  {holo}: {count} vehículos ({count/len(df)*100:.1f}%)")
    
    print("\n📊 Resumen por año:")
    print(df.groupby('año')['holograma'].value_counts().sort_index())
    
    print("\n📊 Resumen de precios:")
    print(f"  - Mínimo: ${df['precio'].min():,.0f} MXN")
    print(f"  - Máximo: ${df['precio'].max():,.0f} MXN")
    print(f"  - Promedio: ${df['precio'].mean():,.0f} MXN")
    
    print("\n📊 Tipos de vehículos:")
    print(df['tipo_vehiculo'].value_counts())
    
    print("\n📊 Combustibles:")
    print(df['combustible'].value_counts())
    
    return df

if __name__ == "__main__":
    print("🚗 Iniciando limpieza del CSV de vehículos CDMX...\n")
    df = limpiar_vehiculos_csv()
    print("\n✅ ¡Limpieza completada!")

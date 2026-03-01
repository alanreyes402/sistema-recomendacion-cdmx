# -*- coding: utf-8 -*-
"""
Script para crear/actualizar todas las tablas en la base de datos
"""
from app.database.connection import engine, Base
from app.models import Vehiculo, Usuario, Interaccion

def crear_tablas():
    """Crea todas las tablas definidas en los modelos"""
    print("🔄 Creando tablas en la base de datos...")
    
    try:
        # 👇 AGREGAR ESTA LÍNEA (Borra las tablas viejas) 👇
        Base.metadata.drop_all(bind=engine) 
        
        # Crea las tablas con la nueva estructura
        Base.metadata.create_all(bind=engine)
        
        print("✅ Tablas creadas exitosamente:")
        print("   - vehiculos")
        print("   - usuarios")
        print("   - interacciones")
    except Exception as e:
        print(f"❌ Error al crear tablas: {e}")
        raise

if __name__ == "__main__":
    crear_tablas()
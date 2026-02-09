# -*- coding: utf-8 -*-
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.database.connection import engine, Base
from app.models.vehiculo import Vehiculo

print("🗑️  Eliminando tablas existentes...")
Base.metadata.drop_all(bind=engine)
print("✅ Tablas eliminadas")

print("\n📦 Creando tablas nuevas con todos los campos...")
Base.metadata.create_all(bind=engine)
print("✅ Tablas creadas")

print("\n✅ Listo para cargar datos!")
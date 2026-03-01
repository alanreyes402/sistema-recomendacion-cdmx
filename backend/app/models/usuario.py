# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Float, Date
from app.database.connection import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    
    # NUEVO: Columna para la contraseña
    password = Column(String(255), nullable=False) 
    
    # MODIFICADO: Quitamos el nullable=False porque ahora se llenará después en el Wizard
    edad = Column(Integer, nullable=True) 
    
    genero = Column(String(20))  # Masculino, Femenino, Otro
    
    # Preferencias y características
    presupuesto_min = Column(Float)
    presupuesto_max = Column(Float)
    tipo_vehiculo_preferido = Column(String(50))  # nuevo, seminuevo, ambos
    holograma_prioridad = Column(String(10))  # 00, 0, 1, 2, no_importa
    uso_principal = Column(String(50))  # trabajo, familia, recreativo, mixto
    num_pasajeros_habitual = Column(Integer)
    
    # Ubicación y contexto CDMX
    alcaldia = Column(String(100))  # Álvaro Obregón, Benito Juárez, etc.
    tiene_estacionamiento = Column(String(10))  # si, no
    experiencia_conduccion = Column(String(20))  # principiante, intermedio, avanzado
    
    # Preferencias específicas
    combustible_preferido = Column(String(50))  # Gasolina, Híbrido, Eléctrico, no_importa
    transmision_preferida = Column(String(20))  # manual, automática, no_importa
    segmento_preferido = Column(String(50))  # Compacto, Mediano, SUV, Pickup, etc.
    
    # Restricción Hoy No Circula
    terminacion_placa = Column(Integer)  # 0-9 para calcular "Hoy No Circula"
    
    # Metadata
    fecha_registro = Column(Date)
    
    def __repr__(self):
        return f"<Usuario {self.nombre} - ID: {self.id}>"
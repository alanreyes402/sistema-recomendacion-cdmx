# -*- coding: utf-8 -*-
"""
Script para generar datos sintéticos de usuarios e interacciones
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import random
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.usuario import Usuario
from app.models.interaccion import Interaccion
from app.models.vehiculo import Vehiculo

# Listas para generar datos realistas
NOMBRES = [
    "Juan", "María", "Carlos", "Ana", "Luis", "Carmen", "José", "Laura",
    "Miguel", "Sofía", "Pedro", "Isabel", "Diego", "Elena", "Antonio",
    "Claudia", "Fernando", "Patricia", "Roberto", "Gabriela", "Ricardo",
    "Mónica", "Javier", "Andrea", "Alejandro", "Daniela", "Sergio", "Lucía",
    "Raúl", "Mariana", "Eduardo", "Paola", "Francisco", "Adriana", "Manuel"
]

APELLIDOS = [
    "García", "Rodríguez", "Martínez", "Hernández", "López", "González",
    "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez",
    "Díaz", "Cruz", "Morales", "Jiménez", "Ruiz", "Mendoza", "Castillo"
]

ALCALDIAS = [
    "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán",
    "Cuajimalpa", "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco",
    "Iztapalapa", "Magdalena Contreras", "Miguel Hidalgo", "Milpa Alta",
    "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"
]

USO_PRINCIPAL = ["trabajo", "familia", "recreativo", "mixto"]
EXPERIENCIA = ["principiante", "intermedio", "avanzado"]
GENEROS = ["Masculino", "Femenino", "Otro"]

def generar_email(nombre, apellido, numero):
    """Genera un email único"""
    dominios = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"]
    return f"{nombre.lower()}.{apellido.lower()}{numero}@{random.choice(dominios)}"

def generar_usuario(db: Session, numero: int):
    """Genera un usuario con perfil coherente"""
    nombre = random.choice(NOMBRES)
    apellido = random.choice(APELLIDOS)
    edad = random.randint(22, 65)
    
    # Presupuesto basado en edad
    if edad < 30:
        presupuesto_base = random.randint(180000, 400000)
    elif edad < 45:
        presupuesto_base = random.randint(250000, 600000)
    else:
        presupuesto_base = random.randint(300000, 750000)
    
    presupuesto_min = presupuesto_base * 0.8
    presupuesto_max = presupuesto_base * 1.2
    
    # Preferencias coherentes
    genero = random.choice(GENEROS)
    uso_principal = random.choice(USO_PRINCIPAL)
    
    # Tipo de vehículo basado en edad y uso
    if uso_principal == "familia":
        tipo_vehiculo = random.choice(["seminuevo", "nuevo"])
        segmento = random.choice(["SUV", "Minivan", "Mediano/Familiar"])
        num_pasajeros = random.randint(4, 7)
    elif uso_principal == "trabajo":
        tipo_vehiculo = "seminuevo"
        segmento = random.choice(["Compacto", "Mediano/Familiar", "Sedán"])
        num_pasajeros = random.randint(1, 3)
    else:
        tipo_vehiculo = random.choice(["nuevo", "seminuevo", "ambos"])
        segmento = random.choice(["Compacto", "Deportivo", "SUV", "Pickup"])
        num_pasajeros = random.randint(2, 5)
    
    # Prioridad de holograma
    if random.random() < 0.7:
        holograma_prioridad = random.choice(["00", "0", "1"])
    else:
        holograma_prioridad = "no_importa"
    
    # Combustible preferido
    if holograma_prioridad in ["00", "0"]:
        combustible = random.choice(["Híbrido", "Eléctrico", "Gasolina"])
    else:
        combustible = random.choice(["Gasolina", "no_importa"])
    
    usuario = Usuario(
        nombre=f"{nombre} {apellido}",
        email=generar_email(nombre, apellido, numero),
        edad=edad,
        genero=genero,
        presupuesto_min=presupuesto_min,
        presupuesto_max=presupuesto_max,
        tipo_vehiculo_preferido=tipo_vehiculo,
        holograma_prioridad=holograma_prioridad,
        uso_principal=uso_principal,
        num_pasajeros_habitual=num_pasajeros,
        alcaldia=random.choice(ALCALDIAS),
        tiene_estacionamiento=random.choice(["si", "no"]),
        experiencia_conduccion=random.choice(EXPERIENCIA),
        combustible_preferido=combustible,
        transmision_preferida=random.choice(["automática", "manual", "no_importa"]),
        segmento_preferido=segmento,
        terminacion_placa=random.randint(0, 9),
        fecha_registro=date.today() - timedelta(days=random.randint(1, 365))
    )
    
    return usuario

def es_vehiculo_compatible(usuario: Usuario, vehiculo):
    """Verifica compatibilidad entre usuario y vehículo"""
    score = 0
    
    # Compatibilidad de precio
    if usuario.presupuesto_min <= vehiculo.precio <= usuario.presupuesto_max:
        score += 10
    elif usuario.presupuesto_min * 0.7 <= vehiculo.precio <= usuario.presupuesto_max * 1.3:
        score += 5
    else:
        score -= 5
    
    # Compatibilidad de holograma
    if usuario.holograma_prioridad != "no_importa":
        if vehiculo.holograma == usuario.holograma_prioridad:
            score += 8
        elif vehiculo.holograma in ["00", "0"] and usuario.holograma_prioridad in ["00", "0"]:
            score += 5
        else:
            score -= 2
    
    # Compatibilidad de tipo
    if usuario.tipo_vehiculo_preferido == "ambos" or usuario.tipo_vehiculo_preferido == vehiculo.tipo_vehiculo:
        score += 5
    
    # Compatibilidad de segmento
    if usuario.segmento_preferido and vehiculo.segmento and usuario.segmento_preferido in str(vehiculo.segmento):
        score += 6
    
    # Compatibilidad de combustible
    if usuario.combustible_preferido == "no_importa" or usuario.combustible_preferido == vehiculo.combustible:
        score += 4
    
    # Compatibilidad de pasajeros
    if vehiculo.capacidad_pasajeros and vehiculo.capacidad_pasajeros >= usuario.num_pasajeros_habitual:
        score += 3
    
    return score

def generar_interacciones_para_usuario(db: Session, usuario: Usuario, vehiculos: list):
    """Genera interacciones realistas para un usuario"""
    interacciones = []
    
    # Calcular compatibilidad
    vehiculos_con_score = []
    for vehiculo in vehiculos:
        score = es_vehiculo_compatible(usuario, vehiculo)
        if score > 0:
            vehiculos_con_score.append((vehiculo, score))
    
    vehiculos_con_score.sort(key=lambda x: x[1], reverse=True)
    
    num_interacciones = random.randint(5, 25)
    
    for i, (vehiculo, score) in enumerate(vehiculos_con_score[:num_interacciones]):
        if i < 10:
            prob_interaccion = 0.9
        elif i < 20:
            prob_interaccion = 0.6
        else:
            prob_interaccion = 0.3
        
        if random.random() < prob_interaccion:
            # Tipo de interacción basado en score
            if score > 20:
                tipo_interaccion = random.choices(
                    ["vista", "favorito", "consulta_precio", "prueba_manejo", "interes_compra"],
                    weights=[20, 30, 25, 15, 10]
                )[0]
            elif score > 10:
                tipo_interaccion = random.choices(
                    ["vista", "favorito", "consulta_precio", "prueba_manejo"],
                    weights=[30, 35, 25, 10]
                )[0]
            else:
                tipo_interaccion = random.choices(
                    ["vista", "favorito"],
                    weights=[80, 20]
                )[0]
            
            pesos = {
                "vista": 1.0,
                "favorito": 3.0,
                "consulta_precio": 5.0,
                "prueba_manejo": 7.0,
                "interes_compra": 10.0
            }
            
            calificacion = None
            if tipo_interaccion in ["favorito", "consulta_precio", "prueba_manejo", "interes_compra"]:
                if score > 20:
                    calificacion = random.uniform(4.0, 5.0)
                elif score > 10:
                    calificacion = random.uniform(3.0, 4.5)
                else:
                    calificacion = random.uniform(2.5, 4.0)
            
            tiempo_vis = None
            if tipo_interaccion == "vista":
                if score > 15:
                    tiempo_vis = random.randint(60, 300)
                else:
                    tiempo_vis = random.randint(10, 60)
            
            # CORREGIDO: Manejo de fechas
            dias_desde_registro = (date.today() - usuario.fecha_registro).days
            if dias_desde_registro <= 0:
                dias_desde_registro = 1
            
            fecha_base = usuario.fecha_registro + timedelta(days=random.randint(0, dias_desde_registro))
            fecha_interaccion = datetime.combine(fecha_base, datetime.min.time()) + timedelta(
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            interaccion = Interaccion(
                usuario_id=usuario.id,
                vehiculo_id=vehiculo.id,
                tipo_interaccion=tipo_interaccion,
                peso=pesos[tipo_interaccion],
                calificacion=calificacion,
                tiempo_visualizacion=tiempo_vis,
                fecha_interaccion=fecha_interaccion
            )
            
            interacciones.append(interaccion)
    
    return interacciones

def main():
    """Función principal"""
    db = SessionLocal()
    
    try:
        print("🚀 Iniciando generación de datos sintéticos...\n")
        
        vehiculos = db.query(Vehiculo).all()
        if not vehiculos:
            print("❌ Error: No hay vehículos en la base de datos.")
            return
        
        print(f"✅ Encontrados {len(vehiculos)} vehículos\n")
        
        # Generar usuarios
        print("👥 Generando usuarios...")
        num_usuarios = 800
        
        for i in range(1, num_usuarios + 1):
            usuario = generar_usuario(db, i)
            db.add(usuario)
            
            if i % 100 == 0:
                db.commit()
                print(f"   ✓ {i}/{num_usuarios} usuarios creados")
        
        db.commit()
        print(f"✅ {num_usuarios} usuarios creados\n")
        
        # Generar interacciones
        print("🔗 Generando interacciones...")
        usuarios = db.query(Usuario).all()
        interacciones_totales = 0
        
        for idx, usuario in enumerate(usuarios, 1):
            interacciones = generar_interacciones_para_usuario(db, usuario, vehiculos)
            for interaccion in interacciones:
                db.add(interaccion)
            
            interacciones_totales += len(interacciones)
            
            if idx % 100 == 0:
                db.commit()
                print(f"   ✓ {idx}/{len(usuarios)} usuarios - {interacciones_totales} interacciones")
        
        db.commit()
        print(f"✅ {interacciones_totales} interacciones creadas\n")
        
        # Resumen
        print("=" * 60)
        print("📊 RESUMEN")
        print("=" * 60)
        print(f"👥 Usuarios: {num_usuarios}")
        print(f"🔗 Interacciones: {interacciones_totales}")
        print(f"📈 Promedio: {interacciones_totales / num_usuarios:.1f} por usuario")
        
        print("\n📊 Por tipo de interacción:")
        for tipo in ["vista", "favorito", "consulta_precio", "prueba_manejo", "interes_compra"]:
            count = db.query(Interaccion).filter(Interaccion.tipo_interaccion == tipo).count()
            porcentaje = (count / interacciones_totales) * 100
            print(f"   {tipo:20} {count:5} ({porcentaje:5.1f}%)")
        
        print("\n✅ Completado!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
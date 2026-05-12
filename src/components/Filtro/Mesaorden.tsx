//import React from "react";
import { Users, Receipt, Utensils, Clock } from "lucide-react";
import { useState } from "react";


interface MesaProps {
  numero_mesa: string; //lo usaremos como identificador paar cada mesa, "mesa 1, mesa2, .."
  capacidad?: number;
  HoraSalida?: string;
  HoraEntrada: string;
  estado: 'disponible' | 'ocupada' | 'cuenta_pedida' | 'limpieza';
  idOrden: number;
}

export default function MesaOrden({estado, numero_mesa, capacidad, HoraEntrada, idOrden}: MesaProps){
  const MesaColor = {
    disponible: {
      colorPrincipal: "#6167db",
      bgSubtle: "bg-[#6167db]/10",
      borde: "border-[#6167db]/40",
      texto: "text-[#6167db]",
      etiqueta: "Disponible"
    },
    ocupada: {
      colorPrincipal: "#b93e9f",
      bgSubtle: "bg-[#b93e9f]/10",
      borde: "border-[#b93e9f]/40",
      texto: "text-[#b93e9f]",
      etiqueta: "En Servicio"
    },
    cuenta_pedida: {
      colorPrincipal: "#20b37e",
      bgSubtle: "bg-[#20b37e]/10",
      borde: "border-[#20b37e]/40",
      texto: "text-[#20b37e]",
      etiqueta: "Por Pagar"
    },
    limpieza: {
      colorPrincipal: "#f59e0b",
      bgSubtle: "bg-[#f59e0b]/10",
      borde: "border-[#f59e0b]/40",
      texto: "text-[#f59e0b]",
      etiqueta: "Limpieza"
    }
  };

        const estilo = MesaColor[estado];
        

  return (
    <div 
      className={`relative group p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer flex flex-col justify-between min-h-[160px] 
      ${estilo.bgSubtle} ${estilo.borde} ${estilo.texto}`}
    >
      {/* Indicador de ID de Orden (solo si está ocupada o cuenta pedida) */}
      {(estado === 'ocupada' || estado === 'cuenta_pedida') && (
        <div className="absolute -top-2 -right-2 bg-gray-900 border border-current px-2 py-1 rounded-md text-[10px] font-bold shadow-xl">
          ORDen #{idOrden}
        </div>
      )}

      {/* Fila Superior: Número y Capacidad */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight">{numero_mesa}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
            {estilo.etiqueta}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/20">
          <Users size={14} />
          <span className="text-sm font-bold">{capacidad}</span>
        </div>
      </div>

      {/* Fila Inferior: Info de tiempo o Icono de estado */}
      <div className="mt-4 flex items-end justify-between">
        {estado === 'disponible' ? (
          <div className="opacity-20 group-hover:opacity-100 transition-opacity">
            <Utensils size={28} />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <Clock size={14} className="opacity-70" />
              <span className="font-medium">Entrada: {HoraEntrada}</span>
            </div>
            {estado === 'cuenta_pedida' && (
              <div className="flex items-center gap-1.5 text-xs animate-pulse">
                <Receipt size={14} />
                <span className="font-bold text-white bg-[#20b37e] px-1.5 rounded">Cobrar</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
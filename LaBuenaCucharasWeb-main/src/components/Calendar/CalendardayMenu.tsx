
import React, { useState, useMemo } from "react";
import ModalMenuDia from "../../Features/Menu/modals/ModalCalendariodia";
import { Utensils, Edit2, Clock, Sunrise, Sun, Moon, FileText, Plus } from "lucide-react";
import type { Menu_dario } from "../../context/Interfaces/Platillos";
import { useMenu_diario } from "../../context/Hooks/hookMenu_diario";

export const CalendarioMenuDia: React.FC = () => {
  const {
    diaHoy,
    meses,
    Anio,
    modalDta,
    setmodalDta,
    obtenerPlatilloDia,
    listaPlatillos,
    guardarOEditarMenu
  } = useMenu_diario();

  const [diaSeleccionado] = useState<number>(diaHoy.getDate());
  const [platilloSeleccionado, setPlatilloSeleccionado] = useState<Menu_dario | null>(null);

  // Formateador nativo de moneda para Córdobas (NIO) sin decimales molestos
  const formatCordobas = (value: number) => {
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(value);
  };

  // Mapeo de horas operativas (6:00 AM - 9:00 PM) //No recuerdo su horario, por favor, revisar
  const horasDelDia = useMemo(() => {
    const horas = [];
    for (let i = 6; i <= 21; i++) {
      const ampm = i >= 12 ? 'PM' : 'AM';
      const horaFormateada = i > 12 ? i - 12 : i;
      horas.push({
        valor24: i,
        etiqueta: `${horaFormateada}${ampm}`,
        tipo: i < 11 ? 'desayuno' : i < 16 ? 'almuerzo' : 'cena'
      });
    }
    return horas;
  }, []);

  // los platillos mapeados día seleccionado
  const platillosDelDia = useMemo(() => {
    return obtenerPlatilloDia(diaSeleccionado) || [];
  }, [diaSeleccionado, obtenerPlatilloDia]);

  // Genera el string "YYYY-MM-DD" local correcto para inyectar al nuevo registro
  const fechaISOSeleccionada = useMemo(() => {
    const mesFormateado = String(meses + 1).padStart(2, '0');
    const diaFormateado = String(diaSeleccionado).padStart(2, '0');
    return `${Anio}-${mesFormateado}-${diaFormateado}`;
  }, [diaSeleccionado, meses, Anio]);

  // Inicializa el modal con la fecha del planificador vacía
  const abrirModalNuevoPlatillo = () => {
    setmodalDta({
      id: undefined,
      Fecha: fechaISOSeleccionada,
      NombrePlatillo: "",
      Monto: 0,
      Hora: "12:00" // Hora sugerida por defecto
    });
  };

  const handleGuardarModal = async (data: any): Promise<void> => {
    try {
      await guardarOEditarMenu(data);
      setPlatilloSeleccionado(null); // Resetea selección para forzar refresco visual
    } catch (error) {
      console.error("Error al guardar en el planificador:", error);
    }
  };

  const nombreDiaActual = useMemo(() => {
    const fecha = new Date(Anio, meses, diaSeleccionado);
    return fecha.toLocaleDateString('es-NI', { weekday: 'long' });
  }, [diaSeleccionado, meses, Anio]);

  const fechaHeaderTexto = useMemo(() => {
    const fecha = new Date(Anio, meses, diaSeleccionado);
    return fecha.toLocaleDateString('es-NI', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [diaSeleccionado, meses, Anio]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-2xl border border-sky-200/80 bg-[#e1ebef] shadow-sm min-h-[750px]">
      
      {/* ================= COLUMNA IZQUIERDA: TIMELINE DIARIO (8 Columnas) ================= */}
      <div className="lg:col-span-8 border-r border-slate-300/80 flex flex-col h-[750px] bg-[#e8f0f3]">
        
        {/* Header de la Agenda */}
        <div className="p-5 border-b border-slate-300/80 flex flex-wrap justify-between items-center gap-4 bg-[#dbe7ec]">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight capitalize">{fechaHeaderTexto}</h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5 capitalize">{nombreDiaActual}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#edf3f5] p-0.5 rounded-xl border border-slate-300">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-900 text-xs font-bold rounded-lg shadow-sm cursor-default">Vista diaria</span>
            </div>
            <button
              onClick={abrirModalNuevoPlatillo}
              className="px-4 py-2 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-900/15 active:scale-98 uppercase flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Menu
            </button>
          </div>
        </div>

        {/* Lista de horas con scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative divide-y divide-slate-200/80">
          {horasDelDia.map((hora) => {
            //Evaluamos los registros segun hora
            const platillosDelBloque = platillosDelDia.filter((p: any) => {
              if (!p.Hora) return hora.tipo === 'almuerzo';
              const horaPlatillo = typeof p.Hora === 'string' ? parseInt(p.Hora.split(':')[0], 10) : p.Hora;
              
              if (hora.tipo === 'desayuno') return horaPlatillo < 11;
              if (hora.tipo === 'almuerzo') return horaPlatillo >= 11 && horaPlatillo < 16;
              return horaPlatillo >= 16;
            });

            return (
              <div key={hora.valor24} className="flex min-h-[68px] group/row relative hover:bg-sky-100/50 transition-colors">
                {/* Reloj indicador a la izquierda */}
                <div className="w-16 text-right pr-4 py-2 text-[10px] font-black text-slate-500 select-none uppercase tracking-wider">
                  {hora.etiqueta}
                </div>
                
                {/* Contenedor de celdas horarias */}
                <div className="flex-1 p-1.5 relative border-l border-slate-300/80 flex flex-col gap-1 justify-center">
                  {hora.valor24 === 6 && (
                    <span className="absolute top-1 left-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Apertura y preparación</span>
                  )}
                  
                  {/* Divisores de turnos operativos */}
                  {((hora.valor24 === 7 && hora.tipo === 'desayuno') || 
                    (hora.valor24 === 12 && hora.tipo === 'almuerzo') || 
                    (hora.valor24 === 18 && hora.tipo === 'cena')) && (
                      <div className="absolute right-3 top-2 flex items-center gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity">
                        {hora.tipo === 'desayuno' && <Sunrise className="w-3 h-3 text-amber-700" />}
                        {hora.tipo === 'almuerzo' && <Sun className="w-3 h-3 text-cyan-700" />}
                        {hora.tipo === 'cena' && <Moon className="w-3 h-3 text-indigo-700" />}
                        <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">{hora.tipo}</span>
                      </div>
                  )}

                  {/* Renderizado de platillos diarios */}
                  {platillosDelBloque.length > 0 && (hora.valor24 === 8 || hora.valor24 === 13 || hora.valor24 === 19) ? (
                    <div className="grid grid-cols-1 gap-1 w-full max-w-2xl">
                      {platillosDelBloque.map((platillo) => (
                        <div
                          key={platillo.id ?? `${platillo.Fecha}-${platillo.NombrePlatillo}`}
                          onClick={() => setPlatilloSeleccionado(platillo)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between group/item
                            ${platilloSeleccionado?.id === platillo.id
                              ? 'bg-cyan-100 border-cyan-400 text-cyan-950 shadow-sm'
                              : 'bg-[#f1f6f7] hover:bg-white/80 border-slate-200 hover:border-cyan-300 text-slate-700'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Utensils className={`w-3.5 h-3.5 shrink-0 ${platilloSeleccionado?.id === platillo.id ? 'text-cyan-800' : 'text-slate-500'}`} />
                            <span className="text-xs font-bold truncate">{platillo.NombrePlatillo}</span>
                          </div>
                          {platillo.Monto !== undefined && (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shadow-inner transition-colors
                              ${platilloSeleccionado?.id === platillo.id 
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                              }
                            `}>
                              {formatCordobas(platillo.Monto)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= COLUMNA DERECHA: SECCIÓN DETALLE (4 Columnas) ================= */}
      <div className="lg:col-span-4 bg-[#dce7eb] p-4 sm:p-6 flex flex-col h-[750px] justify-between">
        
        <div className="bg-[#e8f0f3] p-5 sm:p-6 rounded-2xl border border-slate-300/80 shadow-sm flex-1 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-slate-300/80 pb-3 flex items-center gap-2 text-slate-800">
              <FileText className="w-4 h-4 text-cyan-800" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">Ficha del menú diario</h3>
            </div>

            {platilloSeleccionado ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-800 block">Nombre comercial</span>
                    <h4 className="text-base font-black text-slate-800 leading-tight mt-1">{platilloSeleccionado.NombrePlatillo}</h4>
                  </div>
                  
                  {platilloSeleccionado.Monto !== undefined && (
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Monto establecido del día</span>
                      <p className="text-base font-black text-emerald-800 mt-0.5 font-mono">
                        {formatCordobas(platilloSeleccionado.Monto)}
                      </p>
                    </div>
                  )}

                  {platilloSeleccionado.Hora && (
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Hora de servicio registrada</span>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-700 text-xs font-bold bg-[#f0f5f7] p-2 rounded-lg border border-slate-300 w-fit font-mono">
                        <Clock className="w-3.5 h-3.5 text-cyan-800" />
                        <span>{platilloSeleccionado.Hora}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-2.5 bg-[#dfe9ed]/70">
                <Utensils className="w-8 h-8 text-slate-400 animate-pulse" />
                <p className="text-xs font-semibold text-slate-600 max-w-[200px]">
                  Presiona sobre cualquier platillo de la agenda para inspeccionar el monto y la hora asignados.
                </p>
              </div>
            )}
          </div>

          {platilloSeleccionado && (
            <button
              type="button"
              onClick={() => setmodalDta(platilloSeleccionado)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-900/15 transition-colors uppercase tracking-wider"
            >
              <Edit2 size={13} /> Modificar Asignación
            </button>
          )}
        </div>

      </div>

      {/* MODAL */}
      {modalDta && (
        <ModalMenuDia 
          MenuData={modalDta} 
          listaPlatillos={listaPlatillos as any} 
          onClose={() => setmodalDta(null)} 
          onSave={handleGuardarModal}
        />
      )}
    </div>
  );
};

export default CalendarioMenuDia;

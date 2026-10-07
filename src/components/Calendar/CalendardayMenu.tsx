
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
    return fecha.toLocaleDateString('en-US', { weekday: 'long' });
  }, [diaSeleccionado, meses, Anio]);

  const fechaHeaderTexto = useMemo(() => {
    const fecha = new Date(Anio, meses, diaSeleccionado);
    return fecha.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [diaSeleccionado, meses, Anio]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 bg-gray-800 rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[750px]">
      
      {/* ================= COLUMNA IZQUIERDA: TIMELINE DIARIO (8 Columnas) ================= */}
      <div className="lg:col-span-8 border-r border-gray-800 flex flex-col h-[750px] bg-gray-900">
        
        {/* Header de la Agenda */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-950/40">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">{fechaHeaderTexto}</h1>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{nombreDiaActual}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-950 p-0.5 rounded-xl border border-gray-800">
              <span className="px-3 py-1 bg-gray-800 text-blue-400 text-xs font-bold rounded-lg shadow-sm cursor-default">Day view</span>
            </div>
            <button
              onClick={abrirModalNuevoPlatillo}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition-all shadow-lg hover:shadow-blue-600/10 active:scale-98 uppercase flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Menu
            </button>
          </div>
        </div>

        {/* Lista de horas con scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative divide-y divide-gray-800/60">
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
              <div key={hora.valor24} className="flex min-h-[68px] group/row relative hover:bg-gray-950/30 transition-colors">
                {/* Reloj indicador a la izquierda */}
                <div className="w-16 text-right pr-4 py-2 text-[10px] font-black text-gray-500 select-none uppercase tracking-wider">
                  {hora.etiqueta}
                </div>
                
                {/* Contenedor de celdas horarias */}
                <div className="flex-1 p-1.5 relative border-l border-gray-800/80 flex flex-col gap-1 justify-center">
                  {hora.valor24 === 6 && (
                    <span className="absolute top-1 left-3 text-[9px] font-black uppercase tracking-wider text-gray-600">Apertura y Preparación</span>
                  )}
                  
                  {/* Divisores de turnos operativos */}
                  {((hora.valor24 === 7 && hora.tipo === 'desayuno') || 
                    (hora.valor24 === 12 && hora.tipo === 'almuerzo') || 
                    (hora.valor24 === 18 && hora.tipo === 'cena')) && (
                      <div className="absolute right-3 top-2 flex items-center gap-1 opacity-30 group-hover/row:opacity-100 transition-opacity">
                        {hora.tipo === 'desayuno' && <Sunrise className="w-3 h-3 text-amber-500" />}
                        {hora.tipo === 'almuerzo' && <Sun className="w-3 h-3 text-sky-400" />}
                        {hora.tipo === 'cena' && <Moon className="w-3 h-3 text-indigo-400" />}
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">{hora.tipo}</span>
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
                              ? 'bg-gray-800 border-blue-500 text-white shadow-md'
                              : 'bg-gray-950/50 hover:bg-gray-800/60 border-gray-800 hover:border-gray-700 text-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Utensils className={`w-3.5 h-3.5 shrink-0 ${platilloSeleccionado?.id === platillo.id ? 'text-blue-400' : 'text-gray-500'}`} />
                            <span className="text-xs font-bold truncate">{platillo.NombrePlatillo}</span>
                          </div>
                          {platillo.Monto !== undefined && (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shadow-inner transition-colors
                              ${platilloSeleccionado?.id === platillo.id 
                                ? 'bg-gray-900 text-emerald-400 border-gray-700' 
                                : 'bg-gray-900 text-gray-400 border-gray-800'
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
      <div className="lg:col-span-4 bg-gray-950/40 p-6 flex flex-col h-[750px] justify-between">
        
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-sm flex-1 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-gray-800/80 pb-3 flex items-center gap-2 text-white">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Ficha del Menú Diario</h3>
            </div>

            {platilloSeleccionado ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block">Nombre Comercial</span>
                    <h4 className="text-base font-black text-white leading-tight mt-1">{platilloSeleccionado.NombrePlatillo}</h4>
                  </div>
                  
                  {platilloSeleccionado.Monto !== undefined && (
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">Monto Establecido del Día</span>
                      <p className="text-base font-black text-emerald-400 mt-0.5 font-mono">
                        {formatCordobas(platilloSeleccionado.Monto)}
                      </p>
                    </div>
                  )}

                  {platilloSeleccionado.Hora && (
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">Hora de Servicio Registrada</span>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-300 text-xs font-bold bg-gray-950 p-2 rounded-lg border border-gray-800/60 w-fit font-mono">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{platilloSeleccionado.Hora}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 border border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-gray-500 gap-2.5 bg-gray-950/20">
                <Utensils className="w-8 h-8 text-gray-700 animate-pulse" />
                <p className="text-xs font-semibold text-gray-500 max-w-[200px]">
                  Presiona sobre cualquier platillo de la agenda para inspeccionar el monto y la hora asignados.
                </p>
              </div>
            )}
          </div>

          {platilloSeleccionado && (
            <button
              type="button"
              onClick={() => setmodalDta(platilloSeleccionado)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md hover:shadow-blue-600/10 transition-colors uppercase tracking-wider"
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
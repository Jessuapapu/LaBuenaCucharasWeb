import { useState } from "react";
import { Clock, Plus, Pencil, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { useHorarios } from "../context/Hooks/useConfigMenu";
import type { CambioDeHoraModel, CambioDeHoraModelEditar } from "../context/Interfaces/cambiosdehora";

import { HorarioModal } from "../Features/Horario_config/modal/HorarioModal";
import { LineaDeTiempoGlobal } from "../Features/Horario_config/comunes/LineaDeTiempoGlobal";
import { TimeRangeVisualizer } from "../Features/Horario_config/comunes/TimeRangeVisualizer";
import { RankingHoras } from "../Features/Horario_config/comunes/RankingHorarios";
export default function HorariosPage() {
    const { horarios, loading, error, agregarHorario, actualizarHorario, eliminarHorario } = useHorarios();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [nombreOriginal, setNombreOriginal] = useState<string>("");

    const [formData, setFormData] = useState<CambioDeHoraModelEditar>({
        nombre: "",
        HoraInicio: "08:00",
        HoraFinal: "18:00",
        estado: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let exito = false;

        if (isEditing) {
            const payload: CambioDeHoraModelEditar = {
                ...formData,
                nombreNuevo: formData.nombre !== nombreOriginal ? formData.nombre : undefined,
                nombre: nombreOriginal
            };
            exito = await actualizarHorario(payload);
        } else {
            exito = await agregarHorario(formData);
        }

        if (exito) closeModal();
    };

    const handleDelete = async (nombre: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar el horario "${nombre}"?`)) return;
        await eliminarHorario(nombre);
    };

    const openNewModal = () => {
        setFormData({ nombre: "", HoraInicio: "08:00", HoraFinal: "18:00", estado: true });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (horario: CambioDeHoraModel) => {
        setNombreOriginal(horario.nombre);
        setFormData({ ...horario, nombreNuevo: "" });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setFormData({ nombre: "", HoraInicio: "08:00", HoraFinal: "18:00", estado: true });
            setNombreOriginal("");
            setIsEditing(false);
        }, 200);
    };

    const paletaTarjetas = [
        { fondo: "from-[#d7eafa] to-[#d4ece8]", borde: "border-sky-300/80", divisor: "border-sky-200", bloque: "bg-[#e4f0ef] border-sky-200", inicio: "text-sky-800", fin: "text-blue-800", flecha: "text-sky-700" },
        { fondo: "from-[#dcefdc] to-[#cfe9df]", borde: "border-emerald-300/80", divisor: "border-emerald-200", bloque: "bg-[#e7f1e7] border-emerald-200", inicio: "text-emerald-800", fin: "text-teal-800", flecha: "text-emerald-700" },
        { fondo: "from-[#f5e7c9] to-[#f0ddc8]", borde: "border-amber-300/80", divisor: "border-amber-200", bloque: "bg-[#f5eddd] border-amber-200", inicio: "text-amber-900", fin: "text-orange-800", flecha: "text-amber-700" },
        { fondo: "from-[#e8def2] to-[#ddd8ef]", borde: "border-violet-300/80", divisor: "border-violet-200", bloque: "bg-[#eee9f3] border-violet-200", inicio: "text-violet-800", fin: "text-indigo-800", flecha: "text-violet-700" },
        { fondo: "from-[#f4ded8] to-[#f0e3d2]", borde: "border-rose-300/80", divisor: "border-rose-200", bloque: "bg-[#f5ebe3] border-rose-200", inicio: "text-rose-800", fin: "text-orange-800", flecha: "text-rose-700" },
        { fondo: "from-[#d8e7f0] to-[#e2e8d7]", borde: "border-indigo-300/80", divisor: "border-indigo-200", bloque: "bg-[#e7edf0] border-indigo-200", inicio: "text-indigo-800", fin: "text-teal-800", flecha: "text-indigo-700" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Manejo de Errores */}
            {error && (
                <div className="bg-rose-100 border border-rose-300 p-4 rounded-xl text-rose-900 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* 1. Encabezado */}
            <div className="bg-gradient-to-r from-[#d2eaf0] via-[#e1eee7] to-[#f2e5d0] p-6 rounded-2xl border border-sky-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-sky-700 to-teal-700 rounded-xl text-white shadow-md shadow-teal-900/15">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Horarios de Comida</h1>
                        <p className="text-slate-700 mt-0.5 text-lg md:text-xl font-medium">Administra los rangos de tiempo del menú.</p>
                    </div>
                </div>

                {!loading && (
                    <button
                        onClick={openNewModal}
                        className="flex items-center gap-2 bg-gradient-to-r from-sky-700 to-teal-700 hover:from-sky-600 hover:to-teal-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-900/10 self-start md:self-auto"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Horario
                    </button>
                )}
            </div>

            {/* 2. Timeline Global */}
            {!loading && horarios.length > 0 && (
                <div className="bg-[#e2efed] p-6 rounded-2xl border border-teal-200 shadow-sm">
                    <LineaDeTiempoGlobal horarios={horarios} />
                </div>
            )}

            {/* 3. Panel de Horas Concurrentes (Nuevo) */}
            <RankingHoras variant="page" />

            {/* 4. Tarjetas de Datos */}
            <div className="bg-[#e4efea] p-6 rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-emerald-200 bg-gradient-to-r from-[#cee7d4] to-[#d5e9e6] rounded-t-xl mb-2">
                    <h3 className="text-2xl font-bold text-emerald-950">Rangos Actuales</h3>
                </div>

                <div className="p-4 bg-[#e9f1e9] rounded-b-xl">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-teal-700 gap-3">
                            <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
                            <span className="text-teal-900 font-bold text-xs uppercase tracking-widest animate-pulse">Sincronizando horarios...</span>
                        </div>
                    ) : horarios.length === 0 ? (
                        <div className="text-center py-10 text-emerald-900">
                            No hay rangos de hora configurados.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {horarios.map((horario, index) => {
                                const color = paletaTarjetas[index % paletaTarjetas.length];
                                return (
                                <div key={horario.nombre} className={`bg-gradient-to-br ${color.fondo} p-5 rounded-2xl border ${color.borde} shadow-sm transition-transform duration-200 hover:scale-[1.01] group flex flex-col justify-between`}>
                                    
                                    <div className={`flex justify-between items-start mb-4 border-b ${color.divisor} pb-3`}>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider">{horario.nombre}</h3>
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mt-2 inline-block ${horario.estado ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                                                {horario.estado ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(horario)} className="p-2 text-sky-800 hover:bg-sky-100 rounded-lg transition-colors">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(horario.nombre)} className="p-2 text-rose-800 hover:bg-rose-100 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`flex flex-col gap-2 ${color.bloque} p-4 rounded-xl border`}>
                                        <div className="flex items-center justify-between text-slate-700">
                                            <div className="text-center">
                                                <span className={`block text-[10px] uppercase font-bold ${color.inicio} mb-1`}>Inicio</span>
                                                <span className="text-xl font-black text-slate-900">{horario.HoraInicio}</span>
                                            </div>
                                            <div className={`${color.flecha} font-light text-2xl`}>→</div>
                                            <div className="text-center">
                                                <span className={`block text-[10px] uppercase font-bold ${color.fin} mb-1`}>Fin</span>
                                                <span className="text-xl font-black text-slate-900">{horario.HoraFinal}</span>
                                            </div>
                                        </div>

                                        <TimeRangeVisualizer 
                                            inicio={horario.HoraInicio} 
                                            fin={horario.HoraFinal} 
                                            colorIndex={index} 
                                        />
                                    </div>
                                </div>
                            );})}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <HorarioModal
                isOpen={isModalOpen}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onClose={closeModal}
            />

        </div>
    );
}

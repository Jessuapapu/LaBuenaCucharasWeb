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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Manejo de Errores */}
            {error && (
                <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl text-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* 1. Encabezado */}
            <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white-400 shadow-lg shadow-blue-500/20">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Horarios de Comida</h1>
                        <p className="text-slate-500 mt-0.5 text-2xl font-medium">Administra los rangos de tiempo del menú.</p>
                    </div>
                </div>

                {!loading && (
                    <button
                        onClick={openNewModal}
                        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-500/20 self-start md:self-auto"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Horario
                    </button>
                )}
            </div>

            {/* 2. Timeline Global */}
            {!loading && horarios.length > 0 && (
                <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5">
                    <LineaDeTiempoGlobal horarios={horarios} />
                </div>
            )}

            {/* 3. Panel de Horas Concurrentes (Nuevo) */}
            <RankingHoras variant="page" />

            {/* 4. Tarjetas de Datos */}
            <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-800/50 bg-slate-900/40 rounded-t-xl mb-2">
                    <h3 className="text-2xl font-bold text-white">Rangos Actuales</h3>
                </div>

                <div className="p-4 bg-slate-950/20 rounded-b-xl">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-sky-500 gap-3">
                            <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Sincronizando horarios...</span>
                        </div>
                    ) : horarios.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            No hay rangos de hora configurados.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {horarios.map((horario, index) => (
                                <div key={horario.nombre} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 shadow-xl transition-transform duration-200 hover:scale-[1.01] group flex flex-col justify-between">
                                    
                                    <div className="flex justify-between items-start mb-4 border-b border-slate-800/60 pb-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">{horario.nombre}</h3>
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mt-2 inline-block ${horario.estado ? 'bg-green-900/50 text-green-400 border border-green-500/30' : 'bg-red-900/50 text-red-400 border border-red-500/30'}`}>
                                                {horario.estado ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(horario)} className="p-2 text-sky-400 hover:bg-slate-800/60 rounded-lg transition-colors">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(horario.nombre)} className="p-2 text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                                        <div className="flex items-center justify-between text-slate-400">
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Inicio</span>
                                                <span className="text-xl font-black text-white">{horario.HoraInicio}</span>
                                            </div>
                                            <div className="text-slate-600 font-light text-2xl">→</div>
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fin</span>
                                                <span className="text-xl font-black text-white">{horario.HoraFinal}</span>
                                            </div>
                                        </div>

                                        <TimeRangeVisualizer 
                                            inicio={horario.HoraInicio} 
                                            fin={horario.HoraFinal} 
                                            colorIndex={index} 
                                        />
                                    </div>
                                </div>
                            ))}
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
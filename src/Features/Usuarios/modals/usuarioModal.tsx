import React, { useState, useEffect } from 'react';
import { Shield, X, Key } from 'lucide-react';

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  modoEdicion: boolean;
  usernameInicial: string;
  rolInicial: string;
  onGuardar: (username: string, password?: string, rol?: string) => Promise<void>;
}

export default function UsuarioModal({ isOpen, onClose, modoEdicion, usernameInicial, rolInicial, onGuardar}: UsuarioModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Mesero');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar datos cuando se abre para edición
  useEffect(() => {
    if (isOpen) {
      setUsername(modoEdicion ? usernameInicial: "");
      setRol(modoEdicion ? rolInicial: "Mesero ");
      setPassword('');
    }
  }, [isOpen, usernameInicial, rolInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onGuardar(username, password || undefined, rol);
      onClose();
    } catch (err) {
      console.error("Error al procesar el usuario:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#e5f0ed] rounded-2xl border border-sky-200 w-full max-w-md shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center bg-gradient-to-r from-[#cde7ed] to-[#dcebdc] border-b border-sky-200 px-6 py-4">
          <h2 className="font-black text-slate-800 text-base flex items-center gap-2">
            <Shield size={18} className="text-sky-800" />
            {modoEdicion ? `Modificar: ${usernameInicial}` : 'Registrar Nuevo Usuario'}
          </h2>
          <button 
            onClick={onClose}
            className="text-sky-900 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-sky-950/80 uppercase tracking-wide mb-1.5">
              Nombre de Usuario
            </label>
            <input
              type="text"
              required
              disabled={modoEdicion}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej. marianog"
              className="w-full px-3.5 py-2 rounded-xl border border-sky-300 text-sm text-slate-900 bg-[#f0f5e9] focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:bg-[#dfe9e5] disabled:text-slate-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-950/80 uppercase tracking-wide mb-1.5">
              Contraseña {modoEdicion && <span className="text-slate-600 normal-case font-normal">(Vacío para mantener actual)</span>}
            </label>
            <div className="relative">
              <input
                type="password"
                required={!modoEdicion}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={modoEdicion ? "••••••••" : "Asigna una contraseña segura"}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-sky-300 text-sm text-slate-900 bg-[#f0f5e9] focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 font-mono transition-all duration-200"
              />
              <Key size={16} className="absolute left-3.5 top-3 text-sky-800" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-teal-950/80 uppercase tracking-wide mb-1.5">
              Rols del Sistema
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 bg-[#eef4e8] transition-all duration-200"
            >
              <option value="Administrador">Administrador</option>
              <option value="Cajero">Cajero</option>
              <option value="Mesero">Mesero</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-sky-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-sky-900 hover:text-sky-950 hover:bg-[#d6e8e8] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-sky-700 to-teal-700 hover:from-sky-600 hover:to-teal-600 rounded-xl shadow-sm transition-colors"
            >
              {modoEdicion ? 'Guardar Cambios' : 'Registrar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

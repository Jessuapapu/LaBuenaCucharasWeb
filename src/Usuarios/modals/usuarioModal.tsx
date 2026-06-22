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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h2 className="font-black text-slate-800 text-base flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            {modoEdicion ? `Modificar: ${usernameInicial}` : 'Registrar Nuevo Usuario'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Nombre de Usuario
            </label>
            <input
              type="text"
              required
              disabled={modoEdicion}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej. marianog"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Contraseña {modoEdicion && <span className="text-slate-400 normal-case font-normal">(Vacío para mantener actual)</span>}
            </label>
            <div className="relative">
              <input
                type="password"
                required={!modoEdicion}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={modoEdicion ? "••••••••" : "Asigna una contraseña segura"}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono transition-all duration-200"
              />
              <Key size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Rols del Sistema
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white transition-all duration-200"
            >
              <option value="Administrador">Administrador</option>
              <option value="Cajero">Cajero</option>
              <option value="Mesero">Mesero</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
            >
              {modoEdicion ? 'Guardar Cambios' : 'Registrar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
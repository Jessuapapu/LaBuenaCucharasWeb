import { useState } from 'react';
import { Shield, Edit2, UserX, CheckCircle, XCircle } from 'lucide-react';
import type { UsuarioData } from '../interfaces/usuarios';

interface UsuariosTablaProps {
  usuariosIniciales: UsuarioData[];
  onEditar: (usuario: UsuarioData) => void;
  onDesactivar: (username: string) => Promise<boolean>;
}

export default function UsuariosTabla({ usuariosIniciales, onEditar, onDesactivar }: UsuariosTablaProps) {
    const [usuarios, setUsuarios] = useState<UsuarioData[]>(usuariosIniciales);

    const handleDesactivarUsuario = async (usernameTarget: string) => {
    if (window.confirm(`¿Desactivar al usuario "${usernameTarget}"?`)) {
      const exito = await onDesactivar(usernameTarget);
      if (exito) {
        setUsuarios(prev => 
          prev.map(u => u.Username === usernameTarget ? { ...u, activo: false } : u)
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Usuario</th>
              <th className="py-4 px-6">Rol asignado</th>
              <th className="py-4 px-6">Fecha Registro</th>
              <th className="py-4 px-6">Estado</th>
              <th className="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 italic font-medium">
                  No hay usuarios registrados en el sistema.
                </td>
              </tr>
            ) : (
              usuarios.map((user) => (
                <tr key={user.Username} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {user.Username}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Shield size={14} className="text-slate-400" />
                      {user.rol}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono text-xs">
                    {new Date(user.fecha_creacion).toLocaleDateString('es-NI', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.activo 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {user.activo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEditar(user)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors duration-150"
                        title="Editar Usuario/Rol"
                      >
                        <Edit2 size={16} />
                      </button>
                      {user.activo && (
                        <button
                          onClick={() => handleDesactivarUsuario(user.Username)} // 👈 Corregido para llamar a la lógica con confirmación
                          className="p-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition-colors duration-150"
                          title="Desactivar acceso"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
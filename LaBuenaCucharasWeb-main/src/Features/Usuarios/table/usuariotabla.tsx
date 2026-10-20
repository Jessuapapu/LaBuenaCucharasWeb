import { useState, useEffect } from 'react';
import { Shield, Edit2, UserX, CheckCircle, XCircle } from 'lucide-react';
import type { UsuarioData } from '../../../context/Interfaces/usuarios';

interface UsuariosTablaProps {
  usuariosIniciales: UsuarioData[];
  onEditar: (usuario: UsuarioData) => void;
  onDesactivar: (username: string) => Promise<boolean>;
}

export default function UsuariosTabla({ usuariosIniciales, onEditar, onDesactivar }: UsuariosTablaProps) {
    const [usuarios, setUsuarios] = useState<UsuarioData[]>(usuariosIniciales);

    useEffect(() => {
    setUsuarios(usuariosIniciales);
  }, [usuariosIniciales]);

  const handleDesactivarUsuario = async (usernameTarget: string) => {
    if (window.confirm(`¿Seguro que deseas revocar el acceso al usuario "${usernameTarget}"?`)) {
      const exito = await onDesactivar(usernameTarget);
      if (exito) {
        // Optimistic UI update: cambia el estado local de forma reactiva e instantánea
        setUsuarios(prev => 
          prev.map(u => u.Username === usernameTarget ? { ...u, activo: false } : u)
        );
      }
    }
  };

  return (
    <div className="bg-[#e8f1ed] rounded-2xl border border-teal-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#d0e7e8] to-[#dcebdc] border-b border-teal-200 text-teal-950 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Usuario</th>
              <th className="py-4 px-6">Rol asignado</th>
              <th className="py-4 px-6">Fecha Registro</th>
              <th className="py-4 px-6">Estado</th>
              <th className="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-100 text-slate-800 text-sm">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-teal-900 italic font-medium">
                  No hay usuarios registrados en el sistema.
                </td>
              </tr>
            ) : (
              usuarios.map((user) => (
                <tr key={user.Username} className="odd:bg-[#eaf2e9] even:bg-[#e3efed] hover:bg-[#d4e9e7] transition-colors duration-150">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {user.Username}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Shield size={14} className="text-sky-800" />
                      {user.rol}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-700 font-mono text-xs">
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
                        className="p-1.5 hover:bg-sky-100 text-sky-900 hover:text-sky-700 rounded-lg transition-colors duration-150"
                        title="Editar Usuario/Rol"
                      >
                        <Edit2 size={16} />
                      </button>
                      {user.activo && (
                        <button
                          onClick={() => handleDesactivarUsuario(user.Username)} // 👈 Corregido para llamar a la lógica con confirmación
                          className="p-1.5 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg transition-colors duration-150"
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

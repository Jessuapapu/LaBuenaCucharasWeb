import { useEffect, useState } from "react";
import { useUsuarios } from "../context/Hooks/hookUsuario"; 
import UsuariosTabla from "../Features/Usuarios/table/usuariotabla";
import UsuarioModal from "../Features/Usuarios/modals/usuarioModal";
import { Users, UserPlus, ShieldCheck, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function UsuarioPage() {
  const { usuarios, loading, error, fetchUsuarios, registrarUsuario, actualizarUsuario, desactivarUsuario } = useUsuarios();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usernameSeleccionado, setUsernameSeleccionado] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("Mesero");

  // Carga inicial de datos
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleAbrirEditar = (usuario: any) => {
    setModoEdicion(true);
    setUsernameSeleccionado(usuario.Username);
    setRolSeleccionado(usuario.rol);
    setModalOpen(true);
  };

  const handleAbrirCrear = () => {
    setModoEdicion(false);
    setUsernameSeleccionado("");
    setRolSeleccionado("Mesero");
    setModalOpen(true);
  };

  // Esta es la función que se encarga de acoplarse al Hook
  const handleGuardar = async (username: string, password?: string, rol?: string) => {
    let exito;
    if (modoEdicion) {
      exito = await actualizarUsuario(username, password, rol);
    } else {
      exito = await registrarUsuario(username, password || "", rol || "Mesero");
    }
    if (exito) setModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-xs font-bold shadow-sm">
          ⚠️ Error del sistema: {error}
        </div>
      )}

      {/* ENCABEZADO */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#d2eaf0] via-[#e1eee7] to-[#f2e5d0] p-6 rounded-2xl border border-sky-200 shadow-sm gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-sky-700 to-teal-700 rounded-xl text-white shadow-md shadow-teal-900/10">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Control de Usuarios
            </h1>
            <p className="text-slate-700 mt-0.5 text-xs font-semibold">
              Administra las credenciales, accesos y roles del personal del restaurante.
            </p>
          </div>
        </div>

        {/* Botón de Registro Rápido */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAbrirCrear}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-700 to-teal-700 hover:from-sky-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-900/10 transition-colors uppercase tracking-wider self-start sm:self-auto"
        >
          <UserPlus size={16} />
          Nuevo Usuario
        </motion.button>
      </header>

      {/* TABLA DE DATOS */}
      <div className="bg-[#e4efec] rounded-2xl border border-teal-200 overflow-hidden shadow-sm">
        {/* Sub-header de la Tabla */}
        <div className="p-5 border-b border-teal-200 bg-gradient-to-r from-[#d1e8e7] to-[#dcebdc] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900">Personal Registrado</h3>
          </div>
          <span className="text-[10px] font-mono text-teal-950 uppercase bg-[#cce5df] px-2.5 py-1 rounded-md border border-teal-300 font-bold">
            Seguridad Activa
          </span>
        </div>
        
        <div className="p-4 bg-[#dcebe8]">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-sky-800 gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sky-950 font-bold text-[10px] tracking-widest uppercase animate-pulse">
                Cargando...
              </span>
            </div>
          ) : (
            <UsuariosTabla 
              key={usuarios.length} // Forzar refresco si el catálogo cambia de tamaño
              usuariosIniciales={usuarios}
              onEditar={handleAbrirEditar}
              onDesactivar={desactivarUsuario} 
            />
          )}
        </div>
      </div>

      {/* MODAL */}
      <UsuarioModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        modoEdicion={modoEdicion}
        usernameInicial={usernameSeleccionado}
        rolInicial={rolSeleccionado}
        onGuardar={handleGuardar}
      />

    </div>
  );
}

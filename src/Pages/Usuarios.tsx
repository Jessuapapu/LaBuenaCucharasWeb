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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-white-800 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">
              Control de Usuarios
            </h1>
            <p className="text-slate-500 mt-0.5 text-[10px] font-semibold">
              Administra las credenciales, accesos y roles del personal del restaurante.
            </p>
          </div>
        </div>

        {/* Botón de Registro Rápido */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAbrirCrear}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/10 transition-colors uppercase tracking-wider self-start sm:self-auto"
        >
          <UserPlus size={16} />
          Nuevo Usuario
        </motion.button>
      </header>

      {/* TABLA DE DATOS */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm shadow-slate-900/5">
        {/* Sub-header de la Tabla */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-700">Personal Registrado</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/40 font-bold">
            Seguridad Activa
          </span>
        </div>
        
        <div className="p-4 bg-slate-800/50 backdrop-blur-md">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-blue-500 gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-slate-800 font-bold text-[10px] tracking-widest uppercase animate-pulse">
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
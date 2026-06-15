import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { Lock, User, Loader2, UtensilsCrossed } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const backgroundStyle = {
        // 1. Apunta a tu archivo SVG
        backgroundImage: `url('/src/assets/Fondo.svg')`,
        // 2. Asegura que se repita
        backgroundRepeat: 'repeat',
        // 3. Define el tamaño de cada "mosaico" (AJUSTAR ESTO)
        backgroundSize: '300px 170px', 
         
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Error en la autenticación");
            }

            // Usar el contexto de autenticación para sincronizar estado y socket
            const userInfo = data.user_info || { username: username, rol: "usuario" };
            login(data.access_token, userInfo);

            // Redirección limpia
            navigate("/");

        } catch (err: any) {
            console.error("Error de login:", err);
            setError(err.message || "No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 relative overflow-hidden">
            
            {/* --- FONDO REPETITIVO SVG --- */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.14] pointer-events-none bg-blend-multiply"
                style={backgroundStyle}
            ></div>

            {/*TARJETA DE LOGIN*/}
            <div className="w-full max-w-md bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl shadow-blue-900/5 border border-white/60 p-8 z-10 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 relative">

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full" />

                {/* Encabezado / Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-blue-50 text-blue-600 p-3 rounded-xl mb-3 shadow-inner">
                        <UtensilsCrossed size={28} className="animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        La Buena Cuchara
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Gestión de pedidos, inventario y facturación
                    </p>
                </div>

                {/* Manejo de Alertas de Error */}
                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-xs font-semibold text-center animate-in fade-in zoom-in-95 duration-200">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Usuario
                        </label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
                                placeholder="Introduce tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 mt-2 text-sm uppercase tracking-wide
                            ${loading 
                                ? "bg-slate-400 cursor-wait shadow-none" 
                                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:scale-[0.98] shadow-blue-600/15"}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            "Ingresar al Sistema"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { Lock, User, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">La Buena Cuchara</h2>
                    <p className="text-gray-400 text-sm mt-2">Ingresa tus credenciales para acceder al sistema</p>
                </div>

                {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-medium text-center animate-in fade-in duration-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Usuario</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                                placeholder="Tu nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contraseña</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 mt-2
                            ${loading ? "bg-blue-800 cursor-wait opacity-80" : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98]"}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Autenticando...
                            </>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
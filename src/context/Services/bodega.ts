// src/services/bodegaService.ts

const API_BASE = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

export async function obtenerRegistrosBodega() {
  const res = await fetch(`${API_BASE}/bodega/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Inyección de seguridad
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error("Error al obtener registros");
  return res.json();
}

export async function obtenerIngredientesBodega() {
  const res = await fetch(`${API_BASE}/ingredientes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Inyección de seguridad
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error("Error al obtener ingredientes");
  return res.json();
}

export async function obtenerInsumosBodega() {
  const res = await fetch(`${API_BASE}/insumos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Inyección de seguridad
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error("Error al obtener insumos");
  return res.json();
}

export async function obtenerDetallesBodega(idRegistro: number) {
  const res = await fetch(`${API_BASE}/bodega/detalles/${idRegistro}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Inyección de seguridad
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error("Error al obtener detalles");
  return res.json();
}
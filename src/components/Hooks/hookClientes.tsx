import { useCallback, useState } from "react";

export interface cliente{
      nombre: string;
      correo: string;
      telefono: number;
      direccion: string; 
}

export interface Contrato{
    nombre_cliente: string;
    numero_contrato: number;
    fechainicio: Date;
    fechafin: Date;
}

export function useCliente(){
    const [clientes, setclientes]= useState<cliente[]>([]);
    const [loading, setloading]= useState(true);
    const [error, setError]= useState<string | null>(null);

    const fetchCliente= useCallback(async() =>{
        try{
            const response= await fetch("http://127.0.0.1:8001/clientes/");
      if (!response.ok) throw new Error("Error al conectar con el servidor");
      
      const data = await response.json();
        

        setError(null);
    } catch (err) {
      setError("No se pudo cargar el comedor");
    } finally {
      setloading(false);
    }
    }, []);
}
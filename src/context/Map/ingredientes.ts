import type { Ingredientes } from "../interfaces/Platillos";

export const IngredientesMapper ={
    toFrontend(apiData: any): Ingredientes {
    if (!apiData) {
      return {
        IdIngredeintes: 0,
        nombreIngrediente: "Sin nombre",
        stock_ingredientes: 0
      };
    }

    return {
      // Mapeamos
      IdIngredeintes: apiData.IdIngrediente || apiData.IdIngredeintes || 0,
      nombreIngrediente: apiData.NombreIngrediente || apiData.nombreIngrediente || "",
      stock_ingredientes: apiData.StockIngredientes !== undefined ? apiData.StockIngredientes : (apiData.stock_ingredientes || 0)
    };
  },

  toList(apiList: any[]): Ingredientes[] {
    if (!Array.isArray(apiList)) return [];
    return apiList.map(item => this.toFrontend(item));
  }
}
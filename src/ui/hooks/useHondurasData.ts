import { DEPARTAMENTOS } from '../../core/domain/catalogs/honduras';

export interface MunicipioData {
  id: number;
  nombre: string;
}

export interface DepartamentoData {
  id: number;
  nombre: string;
  municipios: MunicipioData[];
}

export function useHondurasData() {
  return { departamentos: DEPARTAMENTOS as DepartamentoData[], loading: false };
}

export interface SoilLocation {
  lat: number;
  lon: number;
}

export interface SoilType {
  texture_class: string;
  fao_classification: string;
}

export interface SoilPhysical {
  sand_pct: number;
  silt_pct: number;
  clay_pct: number;
  bulk_density_g_cm3: number;
}

export interface SoilChemical {
  ph_h2o: number;
  organic_matter_pct: number;
  nitrogen_g_kg: number;
  cec_cmol_kg: number;
}

export interface SoilResponse {
  location: SoilLocation;
  soil_type: SoilType;
  physical: SoilPhysical;
  chemical: SoilChemical;
}

export interface SoilLocation {
  lat: number;
  lon: number;
}

export interface SoilType {
  texture_class: string | null;
  fao_classification: string | null;
}

export interface SoilPhysical {
  sand_pct: number | null;
  silt_pct: number | null;
  clay_pct: number | null;
  bulk_density_g_cm3: number | null;
}

export interface SoilChemical {
  ph_h2o: number | null;
  organic_matter_pct: number | null;
  nitrogen_g_kg: number | null;
  cec_cmol_kg: number | null;
}

export interface SoilWater {
  capacity_field_vol_pct: number | null;
  capacity_wilt_vol_pct: number | null;
}

export interface SoilResponse {
  location: SoilLocation;
  soil_type: SoilType;
  physical: SoilPhysical;
  chemical: SoilChemical;
  water?: SoilWater | null;
  _meta?: {
    latency_seconds?: number;
  };
}

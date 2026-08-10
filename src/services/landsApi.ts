/**
 * Lands data layer (Supabase). Maps the `lands` table ↔ the app's FarmListing,
 * with CRUD + a Realtime subscription. Used by FarmListingsContext when Supabase
 * is configured; otherwise the context falls back to in-memory mock.
 */
import { supabase } from './supabase';
import type { FarmListing } from '../context/FarmListingsContext';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

const landToApp = (r: any): FarmListing => ({
  id: r.id,
  title: r.title,
  soilType: r.soil_type || '',
  acres: r.acres != null ? String(r.acres) : '',
  acresLabel: r.acres != null ? `${r.acres} Acres` : undefined,
  location: r.location || '',
  district: r.district || '',
  state: r.state || '',
  locationLabel: r.location ? `${r.location}, ${r.district || ''}` : undefined,
  tenure: r.tenure || '',
  pricePerYear: r.price_per_year || '',
  leaseType: r.lease_type || undefined,
  description: r.description || undefined,
  imageUrl: r.image_url || '',
  ownerId: r.owner_id,
  ownerName: r.owner_name || 'Owner',
  createdAt: new Date(r.created_at),
  status: r.status,
  selfFarmed: r.self_farmed ?? undefined,
  plotGeoJSON: r.geo || undefined,
  lastYearCrop: r.last_year_crop || undefined,
  lastYearEarnings: r.last_year_earnings || undefined,
  currentCrop: r.current_crop || undefined,
  waterSource: r.water_source || undefined,
  surveyNumber: r.survey_number || undefined,
  verified: r.verified ?? undefined,
  verifiedOwnerName: r.verified_owner || undefined,
  mediaUrls: Array.isArray(r.media) ? r.media : undefined,
});

const toRow = (l: Partial<FarmListing>) => {
  const row: Record<string, any> = {};
  if (l.title !== undefined) row.title = l.title;
  if (l.soilType !== undefined) row.soil_type = l.soilType;
  if (l.acres !== undefined) row.acres = parseFloat(String(l.acres)) || null;
  if (l.location !== undefined) row.location = l.location;
  if (l.district !== undefined) row.district = l.district;
  if (l.state !== undefined) row.state = l.state;
  if (l.tenure !== undefined) row.tenure = l.tenure;
  if (l.pricePerYear !== undefined) row.price_per_year = l.pricePerYear;
  if (l.leaseType !== undefined) row.lease_type = l.leaseType;
  if (l.description !== undefined) row.description = l.description;
  if (l.imageUrl !== undefined) row.image_url = l.imageUrl;
  if (l.status !== undefined) row.status = l.status;
  if (l.selfFarmed !== undefined) row.self_farmed = l.selfFarmed;
  if (l.plotGeoJSON !== undefined) row.geo = l.plotGeoJSON;
  if (l.lastYearCrop !== undefined) row.last_year_crop = l.lastYearCrop;
  if (l.lastYearEarnings !== undefined) row.last_year_earnings = l.lastYearEarnings;
  if (l.currentCrop !== undefined) row.current_crop = l.currentCrop;
  if (l.waterSource !== undefined) row.water_source = l.waterSource;
  if (l.surveyNumber !== undefined) row.survey_number = l.surveyNumber;
  if (l.verified !== undefined) row.verified = l.verified;
  if (l.verifiedOwnerName !== undefined) row.verified_owner = l.verifiedOwnerName;
  if (l.mediaUrls !== undefined) row.media = l.mediaUrls;
  return row;
};

export const landsApi = {
  async fetchLands(): Promise<FarmListing[]> {
    const { data } = await db().from('lands').select('*').order('created_at', { ascending: false });
    return (data || []).map(landToApp);
  },

  async insertLand(listing: Omit<FarmListing, 'id' | 'createdAt'>, ownerId: string, ownerName: string): Promise<string> {
    const { data, error } = await db()
      .from('lands')
      .insert({ ...toRow(listing), owner_id: ownerId, owner_name: ownerName })
      .select('id')
      .single();
    if (error || !data) throw error || new Error('Insert failed');
    return data.id as string;
  },

  async updateLand(id: string, updates: Partial<FarmListing>): Promise<void> {
    await db().from('lands').update(toRow(updates)).eq('id', id);
  },

  async deleteLand(id: string): Promise<void> {
    await db().from('lands').delete().eq('id', id);
  },

  subscribe(onChange: () => void): () => void {
    const c = db();
    const channel = c
      .channel('lands-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lands' }, onChange)
      .subscribe();
    return () => {
      c.removeChannel(channel);
    };
  },
};

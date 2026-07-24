/**
 * Profiles directory (Supabase). Lets owners discover and contact farmers who
 * onboarded on the platform. Read access is allowed by the "profiles read" RLS
 * policy. Returns [] when Supabase isn't configured (mock mode).
 */
import { supabase } from './supabase';

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  location?: string;
  district?: string;
  state?: string;
  hasWhatsapp: boolean;
  createdAt?: string;
}

function mapRow(r: any): FarmerProfile {
  return {
    id: r.id,
    name: r.name || 'Farmer',
    phone: r.phone || '',
    location: r.location || undefined,
    district: r.district || undefined,
    state: r.state || undefined,
    hasWhatsapp: r.has_whatsapp ?? true,
    createdAt: r.created_at || undefined,
  };
}

export const profilesApi = {
  /** All farmers on the platform (newest first), for the owner Tenants directory. */
  async fetchFarmers(signal?: AbortSignal): Promise<FarmerProfile[]> {
    if (!supabase) return [];
    try {
      let q = supabase
        .from('profiles')
        .select('id, name, phone, location, district, state, has_whatsapp, created_at')
        .eq('role', 'farmer')
        .order('created_at', { ascending: false });
      if (signal) q = q.abortSignal(signal);
      const { data, error } = await q;
      if (error || !data) return [];
      return data.filter(r => r.phone).map(mapRow);
    } catch {
      return [];
    }
  },

  /** Look up specific farmers by id (e.g. to show their saved location on a lease request card). */
  async fetchFarmersByIds(ids: string[]): Promise<FarmerProfile[]> {
    if (!supabase || ids.length === 0) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, phone, location, district, state, has_whatsapp, created_at')
        .in('id', ids);
      if (error || !data) return [];
      return data.map(mapRow);
    } catch {
      return [];
    }
  },

  /** Realtime: re-run onChange whenever a profile is added/updated. */
  subscribe(onChange: () => void): () => void {
    if (!supabase) return () => {};
    const channel = supabase
      .channel('profiles-directory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onChange)
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  },
};

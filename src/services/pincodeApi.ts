/**
 * PIN-code → location lookup via the free India Post API (api.postalpincode.in).
 * No API key, no quota. Returns State / District / Taluk(Block) + the list of
 * area/post-office names so the Add-Farm form can auto-fill from a 6-digit PIN.
 */

export interface PinLocation {
  state: string;
  district: string;
  taluk: string;
  areas: string[];
}

/** Title-case to match our bundled State/District/Taluk dataset casing. */
function tc(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

export async function lookupPincode(pin: string, signal?: AbortSignal): Promise<PinLocation | null> {
  if (!/^\d{6}$/.test(pin)) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal });
    if (!res.ok) return null;
    const json = await res.json();
    const rec = Array.isArray(json) ? json[0] : null;
    const offices: any[] = rec?.PostOffice || [];
    if (rec?.Status !== 'Success' || offices.length === 0) return null;

    const po = offices[0];
    const areas = Array.from(new Set(offices.map(o => tc(o.Name)).filter(Boolean)));
    return {
      state: tc(po.State),
      district: tc(po.District),
      taluk: tc(po.Block || po.Division || ''),
      areas,
    };
  } catch {
    return null;
  }
}

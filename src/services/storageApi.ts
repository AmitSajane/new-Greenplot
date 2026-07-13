/**
 * Supabase Storage uploads for farm media (photos/videos).
 *
 * Images come from the picker with base64 (reliable in RN) → decoded to bytes
 * and uploaded. Videos (no base64) are uploaded from their file URI via a blob.
 * Returns a public URL to store on the listing, or null on failure (caller keeps
 * the local URI as a fallback so the form still works offline).
 */
import { supabase } from './supabase';

const DEFAULT_BUCKET = 'farm-media';

/** Dependency-free base64 → Uint8Array (RN has no reliable atob/Buffer). */
function base64ToBytes(b64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = clean.length;
  const pad = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  const byteLength = Math.floor((len * 3) / 4) - pad;
  const bytes = new Uint8Array(byteLength);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e1 = lookup[clean.charCodeAt(i)];
    const e2 = lookup[clean.charCodeAt(i + 1)];
    const e3 = lookup[clean.charCodeAt(i + 2)];
    const e4 = lookup[clean.charCodeAt(i + 3)];
    if (p < byteLength) bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (p < byteLength) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (p < byteLength) bytes[p++] = ((e3 & 3) << 6) | e4;
  }
  return bytes;
}

const extFromMime = (mime?: string) => {
  if (!mime) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('quicktime') || mime.includes('mov')) return 'mov';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('m4a') || mime.includes('aac')) return 'm4a';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('wav')) return 'wav';
  return 'jpg';
};

function uniquePath(ownerId: string, ext: string) {
  return `${ownerId || 'anon'}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export const storageApi = {
  /** Whether uploads are possible (Supabase configured). */
  get enabled() {
    return !!supabase;
  },

  /** Upload an image (base64 from the picker). Returns a public URL or null. */
  async uploadImage(base64: string, mime: string, ownerId: string, bucket = DEFAULT_BUCKET): Promise<string | null> {
    if (!supabase || !base64) return null;
    try {
      const path = uniquePath(ownerId, extFromMime(mime));
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, base64ToBytes(base64).buffer, { contentType: mime || 'image/jpeg', upsert: true });
      if (error) return null;
      return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    } catch {
      return null;
    }
  },

  /** Upload a file (e.g. video) from its local URI via a blob. Returns URL or null. */
  async uploadFromUri(uri: string, mime: string, ownerId: string, bucket = DEFAULT_BUCKET): Promise<string | null> {
    if (!supabase || !uri) return null;
    try {
      const blob = await (await fetch(uri)).blob();
      const path = uniquePath(ownerId, extFromMime(mime));
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, blob, { contentType: mime || blob.type || 'video/mp4', upsert: true });
      if (error) return null;
      return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    } catch {
      return null;
    }
  },

  /** Same as uploadFromUri but returns the failure reason and the storage
   * path (needed to delete the file later, e.g. an expired story) instead of
   * swallowing errors. Picked video assets have no base64 (impractical for
   * multi-MB files), so this is the upload path video actually goes through. */
  async uploadFromUriDetailed(
    uri: string,
    mime: string,
    ownerId: string,
    bucket = DEFAULT_BUCKET,
  ): Promise<{ url: string; path: string } | { error: string }> {
    if (!supabase) return { error: 'Backend not configured' };
    if (!uri) return { error: 'No file to upload' };
    try {
      const blob = await (await fetch(uri)).blob();
      const path = uniquePath(ownerId, extFromMime(mime));
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, blob, { contentType: mime || blob.type || 'video/mp4', upsert: true });
      if (error) return { error: error.message };
      const url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      return { url, path };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Upload failed' };
    }
  },

  /** Upload from base64 (photo or video), returning the failure reason instead
   * of swallowing it. Prefer this over a blob/fetch(uri) upload — converting a
   * local file to a Blob and re-uploading it often serializes as empty
   * content in React Native's networking layer ("No content provided"). */
  async uploadBase64Detailed(
    base64: string,
    mime: string,
    ownerId: string,
    bucket = DEFAULT_BUCKET,
  ): Promise<{ url: string; path: string } | { error: string }> {
    if (!supabase) return { error: 'Backend not configured' };
    if (!base64) return { error: 'No file to upload' };
    try {
      const path = uniquePath(ownerId, extFromMime(mime));
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, base64ToBytes(base64).buffer, { contentType: mime || 'image/jpeg', upsert: true });
      if (error) return { error: error.message };
      const url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      return { url, path };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Upload failed' };
    }
  },

  /** Delete an uploaded object (e.g. an expired story). */
  async remove(path: string, bucket = DEFAULT_BUCKET): Promise<boolean> {
    if (!supabase || !path) return false;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  },
};

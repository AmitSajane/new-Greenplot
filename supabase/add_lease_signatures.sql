-- ============================================================================
-- Farmer digital signature on lease agreements.
-- Run in: Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run (idempotent: IF NOT EXISTS / ON CONFLICT / exception guards).
-- ============================================================================

-- Farmer draws their signature (finger, on-screen pad) when accepting a
-- lease agreement; we store the resulting PNG's public URL + when it was
-- signed. Owner-side signing is still auto-set on approval (unchanged).
alter table lease_agreements add column if not exists farmer_signature_url text;
alter table lease_agreements add column if not exists farmer_signed_at     timestamptz;

-- No RLS change needed: the existing "agr write" policy already lets either
-- party update their own agreement row (auth.uid() in (farmer_id, owner_id)).

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', true)
on conflict (id) do nothing;

-- Same convention as the other media buckets: uploads/deletes require the
-- object's first path segment to be the caller's own uid.
do $$ begin
  create policy "signatures read" on storage.objects for select
    using (bucket_id = 'signatures');

  create policy "signatures insert" on storage.objects for insert
    with check (bucket_id = 'signatures' and auth.uid()::text = (storage.foldername(name))[1]);

  create policy "signatures delete" on storage.objects for delete
    using (bucket_id = 'signatures' and auth.uid()::text = (storage.foldername(name))[1]);
exception when duplicate_object then null; end $$;

-- Adds a "water_source" column to the lands table, backing the new Water
-- Source dropdown on the Add Farm listing screen (Borewell / Well / River
-- Pipeline / Canals / Depend on Rain). Run once in Supabase Dashboard ->
-- SQL Editor. Safe to re-run.

alter table lands add column if not exists water_source text;

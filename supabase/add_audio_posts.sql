-- Adds 'audio' as a valid posts.media_type so voice-note posts can be
-- created in the Community feed (playback of images/video/audio already
-- works from the app; this just unblocks the DB write).
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.

-- Postgres enums can only gain values, never lose them, and each ALTER TYPE
-- ... ADD VALUE must run outside a transaction block — that's why this is a
-- standalone statement rather than wrapped in the do $$ ... $$ pattern used
-- elsewhere in this folder.
alter type post_media_type add value if not exists 'audio';

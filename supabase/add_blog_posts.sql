-- Adds "Blog" as a post content type (title + long-form body) alongside the
-- existing Photo/Video/Text posts. Run once in Supabase Dashboard -> SQL
-- Editor. Safe to re-run.

alter table posts add column if not exists title text;

alter type post_media_type add value if not exists 'blog';

-- Atomic like/unlike toggle: updates post_likes AND posts.likes_count
-- together, so the counter can't race between concurrent likers. Regular
-- users can't update posts.likes_count directly (the "posts update" policy
-- only allows the author to edit their own post), so this runs as
-- security definer and checks auth.uid() itself instead.
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.

create or replace function public.toggle_post_like(p_post_id uuid)
returns boolean -- true if now liked, false if now unliked
language plpgsql
security definer
set search_path = public
as $$
declare
  already_liked boolean;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  select exists(
    select 1 from post_likes where post_id = p_post_id and user_id = auth.uid()
  ) into already_liked;

  if already_liked then
    delete from post_likes where post_id = p_post_id and user_id = auth.uid();
    update posts set likes_count = greatest(likes_count - 1, 0) where id = p_post_id;
    return false;
  else
    insert into post_likes (post_id, user_id) values (p_post_id, auth.uid());
    update posts set likes_count = likes_count + 1 where id = p_post_id;
    return true;
  end if;
end;
$$;

grant execute on function public.toggle_post_like(uuid) to authenticated;

-- תיקון RLS לרעיונות — צוות מחובר (authenticated + auth_user_id) רואה הכל
-- הרץ אם הרעיונות "נעלמו" אחרי מיגרציה 007

drop policy if exists "ideas_select" on public.ideas;

-- משתמש מחובר דרך Supabase Auth (auth_user_id מקושר) — רואה את כל הרעיונות
create policy "ideas_select_authenticated_team"
  on public.ideas for select
  to authenticated
  using (public.current_app_user_id() is not null);

-- אורח (anon) — רק רעיונות עם guest_session_id
create policy "ideas_select_guest_anon"
  on public.ideas for select
  to anon
  using (guest_session_id is not null);

-- מנהל/יוצר/מוקצה — גם דרך anon אם אין עדיין JWT (גיבוי)
create policy "ideas_select_anon_creator"
  on public.ideas for select
  to anon
  using (
    guest_session_id is not null
    or created_by_user_id in (select id from public.app_users where active = true)
  );

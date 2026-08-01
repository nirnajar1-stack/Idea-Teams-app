-- Allow popup view mode for linked boards (Notion etc.)
alter table public.app_linked_boards
  drop constraint if exists app_linked_boards_view_mode_check;

alter table public.app_linked_boards
  add constraint app_linked_boards_view_mode_check
  check (view_mode in ('iframe', 'link', 'popup'));

update public.app_linked_boards
set view_mode = 'popup'
where provider = 'notion' and view_mode = 'link';

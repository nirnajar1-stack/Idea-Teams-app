-- קטגוריית "טכני" לבקשות/רעיונות
alter table public.ideas drop constraint if exists ideas_category_check;

alter table public.ideas
  add constraint ideas_category_check
  check (category in ('development', 'monitoring', 'technical'));

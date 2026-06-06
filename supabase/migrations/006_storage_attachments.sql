-- IdeaFlow 006 — Supabase Storage for idea attachments & concept images

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'idea-attachments',
  'idea-attachments',
  true,
  10485760, -- 10 MB
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Dev policies — replace in 007 with auth-based policies
create policy "dev_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'idea-attachments');

create policy "dev_storage_public_insert"
  on storage.objects for insert
  with check (bucket_id = 'idea-attachments');

create policy "dev_storage_public_update"
  on storage.objects for update
  using (bucket_id = 'idea-attachments');

create policy "dev_storage_public_delete"
  on storage.objects for delete
  using (bucket_id = 'idea-attachments');

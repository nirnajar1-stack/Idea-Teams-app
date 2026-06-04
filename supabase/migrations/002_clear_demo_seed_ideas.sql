-- מחיקת רעיונות דמו שהועלו בעבר ל-Supabase (הרץ פעם אחת ב-SQL Editor)

delete from public.ideas
where id in (
  'if-9042',
  'if-8801',
  'if-8702',
  'if-8603',
  'if-8504',
  'if-8405',
  'if-8306',
  'if-8207'
);

create unique index if not exists adherence_logs_unique_item_day
  on public.adherence_logs (assignment_id, plan_item_id, date);

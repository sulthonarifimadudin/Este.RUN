-- Create user_badges table
create table user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  badge_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

-- Enable RLS
alter table user_badges enable row level security;

-- Policies
create policy "Users can view their own badges"
  on user_badges for select
  using (auth.uid() = user_id);

create policy "Users can insert their own badges"
  on user_badges for insert
  with check (auth.uid() = user_id);

-- If we want public profiles to show badges too:
create policy "Public can view badges"
  on user_badges for select
  using (true);

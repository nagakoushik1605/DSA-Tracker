-- DSA Progress Tracker - secure Supabase schema
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id text primary key,
  name text not null,
  icon text,
  sort_order integer not null
);

create table if not exists public.subtopics (
  id text primary key,
  topic_id text not null references public.topics(id) on delete cascade,
  name text not null,
  sort_order integer not null
);

create table if not exists public.problems (
  id text primary key,
  subtopic_id text not null references public.subtopics(id) on delete cascade,
  title text not null,
  platform text not null default 'LeetCode',
  url text not null,
  difficulty text not null check (difficulty in ('Easy','Medium','Hard')),
  xp integer not null,
  sort_order integer not null,
  importance text check (importance in ('Essential','Important','Practice')),
  tags text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_problem_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null references public.problems(id) on delete cascade,
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED','ATTEMPTED','SOLVED')),
  attempts integer not null default 0,
  revision_required boolean not null default false,
  completed_at timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, problem_id)
);

-- Make this script safe to run on the earlier tracker schema too.
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.problems add column if not exists number text;
alter table public.problems add column if not exists importance text;
alter table public.problems add column if not exists tags text[] not null default '{}';
alter table public.problems add column if not exists is_published boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.subtopics enable row level security;
alter table public.problems enable row level security;
alter table public.user_problem_progress enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
for select to authenticated using (auth.uid() = id or public.is_admin());

-- Topics and concepts are read-only from the application.
drop policy if exists "Public read topics" on public.topics;
drop policy if exists "Public read subtopics" on public.subtopics;
create policy "Authenticated read topics" on public.topics
for select to authenticated using (true);
create policy "Authenticated read subtopics" on public.subtopics
for select to authenticated using (true);

-- The student tracker is public: anyone can read published problems without creating a user account.
-- Only an authenticated account whose profile role is admin can see hidden problems or change data.
drop policy if exists "Public read problems" on public.problems;
drop policy if exists "Read published problems or all for admin" on public.problems;
drop policy if exists "Public read published problems" on public.problems;
drop policy if exists "Authenticated read published problems or admin" on public.problems;
create policy "Public read published problems" on public.problems
for select to anon using (is_published = true);
create policy "Authenticated read published problems or admin" on public.problems
for select to authenticated using (is_published = true or public.is_admin());
create policy "Admin insert problems" on public.problems
for insert to authenticated with check (public.is_admin());
create policy "Admin update problems" on public.problems
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin delete problems" on public.problems
for delete to authenticated using (public.is_admin());

-- Each user can only read/write their own progress.
drop policy if exists "Users read own progress" on public.user_problem_progress;
drop policy if exists "Users insert own progress" on public.user_problem_progress;
drop policy if exists "Users update own progress" on public.user_problem_progress;
create policy "Users read own progress" on public.user_problem_progress
for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own progress" on public.user_problem_progress
for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own progress" on public.user_problem_progress
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed only the roadmap structure. No problems are inserted here.
insert into public.topics (id,name,icon,sort_order) values ('arrays','Arrays','▦',1) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-1','arrays','Array Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-2','arrays','Prefix Sum',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-3','arrays','Difference Array',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-4','arrays','Two Pointers',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-5','arrays','Sliding Window',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-6','arrays','Kadane''s Algorithm',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-7','arrays','Sorting-Based Problems',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-8','arrays','Interval Problems',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-9','arrays','Matrix / 2D Arrays',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-10','arrays','Array Manipulation',10) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('arrays-11','arrays','Advanced Array Problems',11) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('strings','Strings','Aa',2) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-1','strings','String Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-2','strings','Frequency Counting',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-3','strings','Palindrome',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-4','strings','Anagrams',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-5','strings','Substrings',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-6','strings','String Manipulation',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-7','strings','String Hashing',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-8','strings','Pattern Matching',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('strings-9','strings','Advanced String Problems',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('linked-list','Linked List','↔',3) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-1','linked-list','Singly Linked List',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-2','linked-list','Doubly Linked List',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-3','linked-list','Circular Linked List',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-4','linked-list','Reversal',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-5','linked-list','Fast and Slow Pointers',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-6','linked-list','Merge Linked Lists',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-7','linked-list','Cycle Problems',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-8','linked-list','Intersection Problems',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('linked-list-9','linked-list','Advanced Linked List',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('stack-queue','Stack & Queue','▤',4) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-1','stack-queue','Stack Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-2','stack-queue','Queue Basics',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-3','stack-queue','Deque',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-4','stack-queue','Parentheses Problems',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-5','stack-queue','Monotonic Stack',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-6','stack-queue','Monotonic Queue',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-7','stack-queue','Next Greater Element',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-8','stack-queue','Expression Problems',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('stack-queue-9','stack-queue','Stack/Queue Design Problems',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('hashing','Hashing','#',5) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('hashing-1','hashing','HashMap',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('hashing-2','hashing','HashSet',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('hashing-3','hashing','Frequency Counting',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('hashing-4','hashing','Duplicate Detection',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('hashing-5','hashing','Prefix Sum + Hashing',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('hashing-6','hashing','Hashing with Strings',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('hashing-7','hashing','Advanced Hashing Problems',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('recursion','Recursion','↻',6) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('recursion-1','recursion','Basic Recursion',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('recursion-2','recursion','Recursion on Arrays',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('recursion-3','recursion','Recursion on Strings',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('recursion-4','recursion','Recursion on Linked Lists',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('recursion-5','recursion','Recursive Tree Problems',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('recursion-6','recursion','Recursion Patterns',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('backtracking','Backtracking','⌁',7) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-1','backtracking','Subsets',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-2','backtracking','Subsequences',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-3','backtracking','Permutations',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-4','backtracking','Combinations',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-5','backtracking','Combination Sum',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-6','backtracking','N-Queens',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-7','backtracking','Sudoku',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-8','backtracking','Maze Problems',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('backtracking-9','backtracking','Advanced Backtracking',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('trees','Trees','⌁',8) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-1','trees','Binary Tree Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-2','trees','Tree Traversals',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-3','trees','Tree Properties',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-4','trees','Tree Views',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-5','trees','Tree Path Problems',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-6','trees','Binary Search Tree',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-7','trees','Tree Construction',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-8','trees','Lowest Common Ancestor',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trees-9','trees','Advanced Tree Problems',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('binary-search','Binary Search','⌕',9) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('binary-search-1','binary-search','Binary Search Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('binary-search-2','binary-search','Lower Bound',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('binary-search-3','binary-search','Upper Bound',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('binary-search-4','binary-search','Search in Rotated Array',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('binary-search-5','binary-search','Binary Search on Answer',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('binary-search-6','binary-search','Search in 2D Matrix',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('binary-search-7','binary-search','Advanced Binary Search',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('heap','Heap / Priority Queue','△',10) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-1','heap','Heap Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-2','heap','Min Heap',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-3','heap','Max Heap',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-4','heap','Priority Queue',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-5','heap','Top K Problems',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-6','heap','Kth Largest / Smallest',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-7','heap','Merge K Problems',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-8','heap','Median Problems',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('heap-9','heap','Heap Design Problems',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('graphs','Graphs','◎',11) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-1','graphs','Graph Representation',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-2','graphs','BFS',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-3','graphs','DFS',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-4','graphs','Connected Components',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-5','graphs','Cycle Detection',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-6','graphs','Bipartite Graph',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-7','graphs','Topological Sort',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-8','graphs','Shortest Path',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-9','graphs','Dijkstra',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-10','graphs','Bellman-Ford',10) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-11','graphs','Floyd-Warshall',11) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-12','graphs','Minimum Spanning Tree',12) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-13','graphs','Prim''s Algorithm',13) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-14','graphs','Kruskal''s Algorithm',14) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-15','graphs','Disjoint Set Union',15) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('graphs-16','graphs','Advanced Graph Problems',16) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('greedy','Greedy','↗',12) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-1','greedy','Greedy Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-2','greedy','Activity Selection',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-3','greedy','Interval Scheduling',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-4','greedy','Fractional Knapsack',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-5','greedy','Job Scheduling',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-6','greedy','Jump Problems',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-7','greedy','Gas Station',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-8','greedy','Huffman Coding',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('greedy-9','greedy','Advanced Greedy',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('dp','Dynamic Programming','◫',13) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-1','dp','DP Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-2','dp','1D DP',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-3','dp','2D DP',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-4','dp','Grid DP',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-5','dp','Knapsack',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-6','dp','Subsequence DP',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-7','dp','String DP',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-8','dp','Partition DP',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-9','dp','Interval DP',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-10','dp','DP on Trees',10) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-11','dp','DP with Bitmask',11) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('dp-12','dp','Advanced DP',12) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('trie','Trie','⌘',14) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trie-1','trie','Trie Basics',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trie-2','trie','Prefix Search',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trie-3','trie','Word Search',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trie-4','trie','Autocomplete Problems',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trie-5','trie','Bitwise Trie',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('trie-6','trie','Advanced Trie',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('bit','Bit Manipulation','◈',15) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-1','bit','AND / OR / XOR',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-2','bit','Bit Shifting',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-3','bit','Set Bit',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-4','bit','Clear Bit',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-5','bit','Toggle Bit',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-6','bit','Count Set Bits',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-7','bit','Power of Two',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-8','bit','Bitmasking',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('bit-9','bit','Advanced Bit Manipulation',9) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('sliding-window','Sliding Window','□',16) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('sliding-window-1','sliding-window','Fixed Window',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('sliding-window-2','sliding-window','Variable Window',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('sliding-window-3','sliding-window','Frequency-Based Window',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('sliding-window-4','sliding-window','Longest Substring Problems',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('sliding-window-5','sliding-window','Minimum Window Problems',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('sliding-window-6','sliding-window','Advanced Sliding Window',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('two-pointers','Two Pointers','↔',17) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('two-pointers-1','two-pointers','Opposite Direction',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('two-pointers-2','two-pointers','Same Direction',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('two-pointers-3','two-pointers','Fast / Slow Pointer',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('two-pointers-4','two-pointers','Pair Problems',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('two-pointers-5','two-pointers','Triplet Problems',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('two-pointers-6','two-pointers','Array Partitioning',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('two-pointers-7','two-pointers','Advanced Two Pointer Problems',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('divide-conquer','Divide & Conquer','÷',18) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('divide-conquer-1','divide-conquer','Merge Sort',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('divide-conquer-2','divide-conquer','Quick Sort',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('divide-conquer-3','divide-conquer','Binary Search',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('divide-conquer-4','divide-conquer','Divide and Conquer Arrays',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('divide-conquer-5','divide-conquer','Divide and Conquer Trees',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('divide-conquer-6','divide-conquer','Advanced Problems',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.topics (id,name,icon,sort_order) values ('advanced','Advanced DSA','◇',19) on conflict (id) do update set name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('advanced-1','advanced','Disjoint Set Union',1) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('advanced-2','advanced','Segment Tree',2) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('advanced-3','advanced','Fenwick Tree',3) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('advanced-4','advanced','Sparse Table',4) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('advanced-5','advanced','Advanced Graphs',5) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('advanced-6','advanced','Advanced Trees',6) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('advanced-7','advanced','Advanced String Algorithms',7) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
insert into public.subtopics (id,topic_id,name,sort_order) values ('advanced-8','advanced','Advanced Data Structures',8) on conflict (id) do update set topic_id=excluded.topic_id, name=excluded.name, sort_order=excluded.sort_order;
-- IMPORTANT: create the admin user in Supabase Authentication first.
-- Then, as the project owner, run ONE statement like this with the real email:
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
--
-- Do not put the service-role/secret key in the frontend.
-- After the admin is created, use the app's Admin Console to change the password.

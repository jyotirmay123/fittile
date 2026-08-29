-- This deployment is single-owner: the web build is public, so the publishable
-- key is too. Row Level Security already isolates rows per user; this closes the
-- remaining door by refusing to create any account outside the allowlist.
create table if not exists public.allowed_signups (
  email text primary key,
  created_at timestamptz not null default now()
);

-- No policies: only the service role and the SECURITY DEFINER trigger may read it.
alter table public.allowed_signups enable row level security;

create or replace function public.enforce_signup_allowlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null
     or not exists (
       select 1 from public.allowed_signups a
       where lower(a.email) = lower(new.email)
     ) then
    raise exception 'Sign-ups are closed for this Fitile deployment.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_signup_allowlist on auth.users;
create trigger enforce_signup_allowlist
  before insert on auth.users
  for each row execute function public.enforce_signup_allowlist();

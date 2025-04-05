-- drop everything
alter table if exists public.gist drop constraint if exists gist_userid_fkey;
alter table if exists public.session drop constraint if exists session_userid_fkey;
drop index if exists gist_owner_idx;

drop table if exists public.user;
drop table if exists public.session;
drop table if exists public.gist;
drop table if exists public.todo;

drop function if exists public.get_user;
drop function if exists public.gist_create;
drop function if exists public.gist_update;
drop function if exists public.gist_destroy;
drop function if exists public.login;
drop function if exists public.logout;

create table public.user (
	id bigserial primary key,
	created_at timestamptz default now(),
	updated_at timestamptz,
	github_id int8 unique,
	github_name text,
	github_login text,
	github_avatar_url text
);

create table public.session (
	id uuid default extensions.uuid_generate_v4() not null primary key,
	created_at timestamptz default now(),
	userid int8,
	expires timestamptz default now() + '1 year'
);

create table public.gist (
	id uuid default extensions.uuid_generate_v4() not null primary key,
	created_at timestamptz default now(),
	name text,
	files json,
	userid int8,
	updated_at timestamptz,
	deleted_at timestamptz
);

create table public.todo (
	uid uuid default extensions.uuid_generate_v4() not null primary key,
	created_at timestamptz default now(),
	guestid uuid not null,
	text text,
	done boolean
);

-- foreign key relations
alter table public.gist add constraint gist_userid_fkey foreign key (userid) references public.user (id);
alter table public.session add constraint session_userid_fkey foreign key (userid) references public.user (id);

-- indexes
create index gist_owner_idx on public.gist using btree (userid);
create index todo_owner_idx on public.todo using btree (guestid);

-- functions
create or replace function public.get_user (sessionid uuid)
returns record
language plpgsql volatile
as $$
	declare
		ret record;
		_ record;
	begin
		select userid from session where session.id = sessionid into _;

		select id, github_name, github_login, github_avatar_url from public.user into ret where public.user.id = _.userid;

		return ret;
	end;
$$;

create or replace function public.gist_list (
	list_search text,
	list_userid int8,
	list_count int4,
	list_start int4
)
returns table (
	id uuid,
	name text,
	created_at timestamptz,
	updated_at timestamptz
)
language plpgsql volatile
as $$
	begin
		return query
		select gist.id, gist.name, gist.created_at, gist.updated_at
		from gist
		where gist.userid = list_userid and gist.deleted_at is null and gist.name ilike ('%' || list_search || '%')
		order by coalesce(gist.updated_at, gist.created_at) desc
		limit list_count + 1
		offset list_start;
	end;
$$;

create or replace function public.gist_create (name text, files json, userid int8)
returns record
language plpgsql volatile
as $$
	declare
		ret record;
	begin
		insert into gist (name, files, userid)
		values (name, files, userid) returning gist.id, gist.name, gist.files, gist.userid into ret;

		return ret;
	end;
$$;

create or replace function public.gist_destroy (
	gist_ids uuid[],
	gist_userid int8
)
returns void
language plpgsql volatile
as $$
	begin
		update gist set deleted_at = now() where id = any(gist_ids) and userid = gist_userid;
	end;
$$;

create or replace function public.gist_update (
	gist_id uuid,
	gist_name text,
	gist_files json,
	gist_userid int8
)
returns record
language plpgsql volatile
as $$
	declare
		ret record;
	begin
		update gist
			set name = gist_name, files = gist_files, updated_at = now()
			where id = gist_id and userid = gist_userid and deleted_at is null
			returning id, name, files, userid into ret;

		return ret;
	end;
$$;

create or replace function public.login (
	user_github_id int8,
	user_github_name text,
	user_github_login text,
	user_github_avatar_url text
)
returns record
language plpgsql volatile
as $$
	declare
		_ record;
		ret record;
	begin
		insert into "user" (github_id, github_name, github_login, github_avatar_url, updated_at)
		values (user_github_id, user_github_name, user_github_login, user_github_avatar_url, now())
		on conflict (github_id) do update set github_name = user_github_name, github_login = user_github_login, github_avatar_url = user_github_avatar_url, updated_at = now() where public."user".github_id = user_github_id
		returning id into _;

		insert into "session" (userid) values (_.id) returning session.id as sessionid, session.userid, session.expires into ret;

		return ret;
	end;
$$;

create or replace function public.logout (
	sessionid uuid
)
returns void
language plpgsql volatile
as $$
	begin
		delete from session where id = sessionid;
	end;
$$;

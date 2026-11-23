-- Run once per confirmed Auth account. Replace the email, name and role first.
do $$
declare
 account_email text := 'replace-me@example.invalid';
 account_role text := 'staff'; -- 'staff' = บุคลากร, 'hr' = เจ้าหน้าที่ HR
 account_id uuid;
begin
 select id into strict account_id from auth.users where lower(email)=lower(account_email);
 insert into public.hr_members(id,role) values(account_id,account_role)
 on conflict(id) do update set role=excluded.role;
 insert into public.hr_profiles(id,prefix,first_name,last_name) values(account_id,'นาย','ชื่อทดสอบ','นามสกุลทดสอบ')
 on conflict(id) do update set prefix=excluded.prefix,first_name=excluded.first_name,last_name=excluded.last_name;
end $$;

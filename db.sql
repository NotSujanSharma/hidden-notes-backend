-- drop existing tables in reverse order of creation (due to foreign key constraints)
drop table if exists tokens;
drop table if exists messages;
drop table if exists links;
drop table if exists users;

-- CREATE TABLE statements
create table users (
   user_id        serial primary key,
   name           varchar(255) not null,
   email          varchar(255) unique not null,
   password_hash  varchar(255) not null,
   email_verified boolean default false,
   created_at     timestamp default current_timestamp
);

create table links (
   link_id varchar(255) primary key,
   user_id integer
      references users ( user_id )
         on delete cascade
);

create table messages (
   message_id   serial primary key,
   recipient_id integer
      references users ( user_id )
         on delete cascade,
   content      text not null,
   category     varchar(50),
   created_at   timestamp default current_timestamp,
   is_read      boolean default false,
   is_flagged   boolean default false
);

create table tokens (
   token_id   serial primary key,
   user_id    integer
      references users ( user_id )
         on delete cascade,
   token      varchar(255) not null,
   type       varchar(20) not null,  -- 'verification' or 'reset'
   expires_at timestamp not null
);
CREATE TABLE public.t_environments (
	id bigserial primary key,
	name varchar NOT NULL,
	description varchar not NULL,
	active boolean NOT NULL DEFAULT true
);

create table public.t_range (
	id bigserial primary key,
	id_environment integer not null,
	sequence int not null,
	range_start int8 not null,
	range_end int8 null,
	billing_type varchar not null,
	unit_value numeric(19,8) null,
	constraint fk_range_environment foreign key (id_environment) REFERENCES t_environments (id)
);

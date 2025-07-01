INSERT INTO public.t_environments (id, "name", description, active) VALUES(35, 'becker-calcados', 'Becker Calçados', true);

INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(267, 35, 1, 1, 500000, 'FIXED', 6000.00000000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(268, 35, 2, 500001, 1000000, 'PER_TRANSACTION', 0.00150000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(269, 35, 3, 1000001, 2000000, 'PER_TRANSACTION', 0.00145000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(270, 35, 4, 2000001, 4000000, 'PER_TRANSACTION', 0.00140000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(271, 35, 5, 4000001, 8000000, 'PER_TRANSACTION', 0.00135000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(272, 35, 6, 8000001, 16000000, 'PER_TRANSACTION', 0.00130000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(273, 35, 7, 16000001, 32000000, 'PER_TRANSACTION', 0.00125000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(274, 35, 8, 32000001, 64000000, 'PER_TRANSACTION', 0.00120000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(275, 35, 9, 64000001, 128000000, 'PER_TRANSACTION', 0.00115000);
INSERT INTO public.t_range (id, id_environment, "sequence", range_start, range_end, billing_type, unit_value) VALUES(276, 35, 10, 128000001, NULL, 'PER_TRANSACTION', 0.00110000);

-- ajusta ranges torra
UPDATE public.t_range
	SET unit_value=0.000316
	WHERE id=260;
UPDATE public.t_range
	SET unit_value=26330
	WHERE id=259;

-- ajusta ranges confpay
UPDATE public.t_range
	SET unit_value=3159.60
	WHERE id=243;
UPDATE public.t_range
	SET unit_value=0.00421
	WHERE id=244;

-- ajusta ranges becker
UPDATE public.t_range
	SET unit_value=0.0012040498360
	WHERE id=208;
UPDATE public.t_range
	SET unit_value=0.0012587793740
	WHERE id=207;
UPDATE public.t_range
	SET unit_value=0.0013135089120
	WHERE id=206;
UPDATE public.t_range
	SET unit_value=0.0013682384500
	WHERE id=205;
UPDATE public.t_range
	SET unit_value=0.0014229679880
	WHERE id=204;
UPDATE public.t_range
	SET unit_value=0.0014776975260
	WHERE id=203;
UPDATE public.t_range
	SET unit_value=0.0015324270640
	WHERE id=202;
UPDATE public.t_range
	SET unit_value=0.0015871566020
	WHERE id=201;
UPDATE public.t_range
	SET unit_value=0.0016418861400
	WHERE id=200;
UPDATE public.t_range
	SET unit_value=4378.36
	WHERE id=199;

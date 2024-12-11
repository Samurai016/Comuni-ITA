--
-- PostgreSQL database dump
--

--
-- Name: comuni; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comuni (
    codice character varying NOT NULL,
    nome character varying NOT NULL,
    "nomeStraniero" character varying,
    "codiceCatastale" character varying,
    cap character varying,
    prefisso character varying,
    lat real,
    lng real,
    provincia character varying,
    email character varying,
    pec character varying,
    telefono character varying,
    fax character varying,
    popolazione integer,
);


ALTER TABLE public.comuni OWNER TO postgres;

--
-- Name: province; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.province (
    codice character varying NOT NULL,
    nome character varying NOT NULL,
    sigla text,
    regione character varying NOT NULL
);


ALTER TABLE public.province OWNER TO postgres;

--
-- Name: regioni; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regioni (
    nome character varying NOT NULL
);


ALTER TABLE public.regioni OWNER TO postgres;

--
-- Name: comuni comuni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comuni
    ADD CONSTRAINT comuni_pkey PRIMARY KEY (codice);


--
-- Name: province province_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.province
    ADD CONSTRAINT province_pkey PRIMARY KEY (codice);


--
-- Name: regioni regioni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regioni
    ADD CONSTRAINT regioni_pkey PRIMARY KEY (nome);


--
-- Name: comuni comuni_provincia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comuni
    ADD CONSTRAINT comuni_provincia_fkey FOREIGN KEY (provincia) REFERENCES public.province(codice) ON DELETE CASCADE;


--
-- Name: province province_regione_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.province
    ADD CONSTRAINT province_regione_fkey FOREIGN KEY (regione) REFERENCES public.regioni(nome) ON DELETE CASCADE;


--
-- Name: comuni Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.comuni FOR SELECT USING (true);


--
-- Name: province Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.province FOR SELECT USING (true);


--
-- Name: regioni Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.regioni FOR SELECT USING (true);


--
-- Name: comuni; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.comuni ENABLE ROW LEVEL SECURITY;

--
-- Name: province; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.province ENABLE ROW LEVEL SECURITY;

--
-- Name: regioni; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.regioni ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: TABLE comuni; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.comuni TO anon;
GRANT ALL ON TABLE public.comuni TO authenticated;
GRANT ALL ON TABLE public.comuni TO service_role;


--
-- Name: TABLE province; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.province TO anon;
GRANT ALL ON TABLE public.province TO authenticated;
GRANT ALL ON TABLE public.province TO service_role;


--
-- Name: TABLE regioni; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.regioni TO anon;
GRANT ALL ON TABLE public.regioni TO authenticated;
GRANT ALL ON TABLE public.regioni TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;
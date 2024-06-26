# Guida al deployment del progetto su Supabase
Questa guida ti accompagnerà passo dopo passo nel processo di deployment del progetto su una tua istanza di Supabase.

# 1. Setup Supabase
1. Crea un account [Supabase](https://supabase.com/dashboard/sign-up) o effettua il [login](https://supabase.com/dashboard/sign-up)
2. Accedi alla dashboard dei progetti ([https://supabase.com/dashboard/projects](https://supabase.com/dashboard/projects))
3. Crea un nuovo progetto cliccando su *"New Project"*
    1. Assegna un nome al progetto e crea una password per il database (**è importante salvare questa password in un luogo sicuro in quanto potrebbe servire in futuro**)
    2. Scegli **Central EU** come regione
    3. Clicca *Create new project*
    4. Attendi che Supabase crei il progetto
4. Dalla barra laterale apri il *SQL Editor*
5. Incolla il codice che trovi nel file [schema.sql](https://github.com/Samurai016/Comuni-ITA/blob/master/setup/schema.sql) e avvia la query cliccando su *Run*
6. Dalla barra laterale apri il *Table Editor*
7. Seleziona la tabella `regioni`
8. Importa i dati cliccando *Import data via CSV* (utilizza i file .csv che trovi in [questa cartella](https://github.com/Samurai016/Comuni-ITA/blob/master/setup))
9. Ripeti gli step da *6* a *8* per le tabelle `province` e poi `comuni` (l'ordine di esecuzione è importante per garantire l'integrità delle chiavi esterne)

# 2. Deploy del progetto
1. [Installa il Supabase CLI in locale](https://supabase.com/docs/guides/cli/getting-started#installing-the-supabase-cli)
2. Clona la repository in una cartella a scelta
3. All'interno della cartella del progetto avvia un terminale a riga di comando
4. [Segui le istruzioni riportate in questa guida per linkare il progetto Supabase alla cartella locale.](https://supabase.com/docs/guides/functions/deploy)  
Fermati prima del punto [*Deploy your Edge Functions*](https://supabase.com/docs/guides/functions/deploy#deploy-your-edge-functions)
5. Effettua il deploy delle funzioni utilizzando i seguenti comandi:
```bash
supabase functions deploy comuni --no-verify-jwt
supabase functions deploy province --no-verify-jwt
supabase functions deploy regioni --no-verify-jwt
```
L'utilizzo della flag [`--no-verify-jwt`](https://supabase.com/docs/guides/functions/quickstart#skipping-authorization-checks) è fondamentale per poter rendere l'API utilizzabile pubblicamente.
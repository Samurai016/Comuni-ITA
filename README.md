# [Comuni ITA API](https://comuni-ita.readme.io/)
![Versione](https://img.shields.io/github/v/release/Samurai016/Comuni-ITA?style=flat-square&label=versione)
[![Hosted on Supabase](https://img.shields.io/badge/Hosted%20on%20Supabase-passing?style=flat-square&logo=supabase&labelColor=1c1c1c&color=1c1c1c)](https://axqvoqvbfjpaamphztgd.functions.supabase.co)
[![Leggi la documentazione](https://img.shields.io/badge/Leggi%20la%20documentazione-passing?style=flat-square&logo=Read%20the%20Docs&labelColor=8CA1AF&color=8CA1AF&logoColor=white)](https://comuni-ita.readme.io/)

> ### Legacy project
> Questa repository è la versione aggiornata della repository [Comuni-ITA-legacy](https://github.com/Samurai016/Comuni-ITA-legacy).  
> È possibile usare quella repository per installare una versione standalone dell'API non gestita con Supabase.

Tramite questa REST API hai accesso ad una lista di tutti i comuni, le province e le regioni italiane. I dati sono ottenuti e aggiornamenti da un sistema di aggiornamento semiautomatico che preleva i dati direttamente dagli archivi ISTAT e integra le informazioni mancanti interrogando Wikidata.  
I dati non ottenuti automaticamente dal sistema vengono inoltrati direttamente a me che procedo a verificarli e modificarli manualmente.  

L'API è [scaricabile e installabile su una propria istanza di Supabase](https://github.com/Samurai016/Comuni-ITA/blob/master/setup) oppure è usufruibile in maniera gratuita all'indirizzo https://axqvoqvbfjpaamphztgd.functions.supabase.co.  
Dato che l'API è hostata su un servizio gratuito sarebbe opportuno evitare di sovraccaricare l'API per dare a tutti la possibilità di accedervi.  

In questa wiki troverai una spiegazione di come funzionano gli endpoint e di come installare l'API su un server.  

La documentazione è disponibile anche all'indirizzo https://comuni-ita.readme.io/ 

**License:** [MIT](https://opensource.org/licenses/MIT)  
**Credits:** Logo inpired by: [Castle by Jasfart from the Noun Project](https://thenounproject.com/omataloon/)

# Indice

- [Endpoints](#endpoints)
  - [GET /comuni](#-comuni)
  - [GET /comuni/{regione}](#-comuniregione)
  - [GET /comuni/provincia/{provincia}](#-comuniprovinciaprovincia)
  - [GET /province](#-province)
  - [GET /province/{regione}](#-provinceregione)
  - [GET /regioni](#-regioni)
- [Dettagli sulle regioni e sulle province](#dettagli-sulle-regioni-e-sulle-province)
- [Sistema di paging](#sistema-di-paging)
- [Installazione su progetto Supabase](#installazione-su-progetto-supabase)
- [Sistema di aggiornamento](#sistema-di-aggiornamento)

# Endpoints

## [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) /comuni](https://axqvoqvbfjpaamphztgd.functions.supabase.co/comuni)

Ottieni la lista di tutti i comuni italiani.

### [Documentazione](https://comuni-ita.readme.io/reference/comuni-1)

## [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) /comuni/{regione}](https://axqvoqvbfjpaamphztgd.functions.supabase.co/comuni/trentino%20alto%20adige)

Ottieni la lista di tutti i comuni della regione indicata.

### [Documentazione](https://comuni-ita.readme.io/reference/comuni-regione)

## [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) /comuni/provincia/{provincia}](https://axqvoqvbfjpaamphztgd.functions.supabase.co/comuni/provincia/bolzano)

Ottieni la lista di tutti i comuni della provincia indicata.

### [Documentazione](https://comuni-ita.readme.io/reference/comuni-provincia)

## [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) /province](https://axqvoqvbfjpaamphztgd.functions.supabase.co/province)

Ottieni la lista di tutte le province italiane.

### [Documentazione](https://comuni-ita.readme.io/reference/province-1)

## [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) /province/{regione}](https://axqvoqvbfjpaamphztgd.functions.supabase.co/province/trentino%20alto%20adige)

Ottieni la lista di tutte le province della regione indicata.

### [Documentazione](https://comuni-ita.readme.io/reference/province-regione)

## [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) /regioni](https://axqvoqvbfjpaamphztgd.functions.supabase.co/regioni)

Ottieni la lista delle regioni italiane.

### [Documentazione](https://comuni-ita.readme.io/reference/regioni-1)

# Dettagli sulle regioni e sulle province

Per evitare incongruenze coi nomi di regioni e province, si consiglia di verificare i nomi attraverso gli endpoint `/regioni` e `/province`.  \
In generale i nomi vanno scritti utilizzando i caratteri speciali come apostrofi, spazi o trattini.

# Sistema di paging

A causa delle risorse limitate di Supabase, è stato implementato un sistema di paging per evitare di sovraccaricare il server.   
**Il sistema limita la risposa a 500 elementi per pagina.**  

Per ottenere i successivi 500 elementi è necessario specificare il parametro `page` nell'URL.  
È possibile personalizzare il numero di elementi per pagina tramite il parametro `pagesize` nell'URL (limitato comunque a massimo 500 elementi).  

**Essendo gli endpoint `/regioni` e `/province` molto leggeri, non è necessario specificare il parametro `page` per ottenere tutti i risultati.**

# Installazione su progetto Supabase
Tramite questa repo è possibile installare l'API su una propria istanza di Supabase seguendo la [guida di installazione](https://github.com/Samurai016/Comuni-ITA/blob/master/setup).

# Sistema di aggiornamento
L'API è dotata di un sistema di aggiornamento semiautomatico che preleva i dati direttamente dagli archivi ISTAT e ministeriali e integra le informazioni mancanti interrogando Wikidata.
I dettagli sul funzionamento del sistema di aggiornamento sono disponibili [nell'apposita cartella](https://github.com/Samurai016/Comuni-ITA/blob/master/updater).

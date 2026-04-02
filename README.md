# ngFeed

Applicazione frontend moderna di feed social ispirata a Threads, realizzata con Angular 21. ngFeed permette di creare post, seguire altri utenti, cercare utenti, salvare preferiti e interagire con un feed personalizzato.

## Funzionalità

| Funzionalità       | Posizione                        | Descrizione                                                                                                              |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Autenticazione** | `features/auth/`                 | Login e Registrazione con Firebase Auth, auto-login da localStorage, gestione scadenza token, toggle visibilità password |
| **Post**           | `features/posts/`                | Creazione, modifica, eliminazione, like, menu opzioni, vista post completo                                               |
| **Profili utente** | `features/user/`                 | Visualizzazione profilo, modifica profilo, segui/smetti di seguire, card utente                                          |
| **Feed home**      | `features/home/`                 | Feed Per te (tutti i post), Feed Seguiti (post di account seguiti), navigazione a tab                                    |
| **Ricerca**        | `features/search/`               | Ricerca utenti con input debounced, filtro per verificati e ordinamento in base ai più seguiti                           |
| **Preferiti**      | `features/favorites/`            | Visualizzazione post salvati                                                                                             |
| **Tema**           | `core/services/theme.service.ts` | Modalità chiaro/scuro/sistema, persistenza in localStorage, script anti-flash in `index.html`                            |
| **Modal e Toast**  | `core/services/`                 | Modal centralizzato (crea-post/modifica-post/elimina-post/modifica-utente), notifiche toast                              |
| **Layout**         | `app.html`, `core/layout/`       | Header visibile solo su mobile; navbar sempre visibile; skip link "Vai al contenuto"; stati fetching/errore con retry    |

## Architettura e pattern

- **Componenti standalone** – Nessun NgModule; tutti i componenti usano `imports` e API standalone
- **Stato basato su signal** – `signal()`, `computed()`, `effect()` nei servizi (PostService, UserService, AuthService, ModalService, ToastService, ThemeService)
- **Change detection OnPush** – Utilizzata ovunque per le performance
- **Lazy loading** – Le route Search, Favorites, Followed, Auth, User, FullPost, NotFound sono caricate in modo lazy
- **Dependency injection** – Funzione `inject()`, `providedIn: 'root'` per i servizi
- **Cleanup** – `DestroyRef` con `takeUntilDestroyed()` per la pulizia delle sottoscrizioni
- **Struttura cartelle** – `core/` (config, guards, layout, services, types, utils, pages), `features/` (auth, favorites, home, posts, search, user), `shared/` (components, directives, pipes)

## Accessibilità

- **ARIA** – `aria-label`, `aria-live`, `aria-modal`, `aria-invalid`, `aria-describedby`, `role="dialog"`, `role="tablist"`, `role="alert"` su modal, toast, form e tab
- **Gestione focus** – Angular CDK A11y (`cdkTrapFocus`, `cdkFocusInitial`), direttiva custom `focus-field`, `focusFirstInvalidField()` in `edit-user.ts` e `post-form.ts`
- **Navigazione da tastiera** – `tabindex` dinamico per dropdown e tab
- **Regioni live** – I toast usano `aria-live="polite"`/`assertive`; gli errori dei form usano `role="alert"`
- **Icone decorative** – `aria-hidden` sulle icon Lucide dove appropriato

## Integrazione backend

Questo è un **progetto orientato al frontend** – nessun codice server-side. Tutti i dati risiedono su Firebase.

- **Firebase Authentication** – REST API Identity Toolkit (`signUp`, `signInWithPassword`)
- **Firebase Realtime Database** – REST API per post, utenti, post salvati/mi piace, following. Le regole sono intenzionalmente permissive per lo sviluppo; da restringere in produzione reale.
- **Configurazione Firebase** – Config centralizzata in `core/config/firebase.config.ts` con `FIREBASE_CONFIG` (InjectionToken), fornita in `app.config.ts`
- **Flusso auth** – Token Firebase salvato in localStorage; auto-login all'avvio e auto-logout alla scadenza. _Nota:_ localStorage è accessibile da JavaScript e quindi esposto a XSS; in produzione reale si può valutare l'uso di cookie HttpOnly con refresh token per mitigare il rischio.
- **Caricamento dati** – `forkJoin` in `app.ts` per il fetch parallelo iniziale di post, info utente e dati correlati
- **Pattern RxJS** – `switchMap` (debounce), `catchError`, `tap`, `takeUntilDestroyed`, `finalize`

_I conteggi di like e follow non sono aggregati né persistiti lato server – richiederebbero Cloud Functions o logica server simile. L'app si concentra solo sulle funzionalità client-side._

_Nota: URL Firebase e API key sono in `core/config/firebase.config.ts`. Sarebbe da valutare l'uso di variabili d'ambiente in produzione reale._

## Tech Stack

| Categoria        | Tecnologie                                   |
| ---------------- | -------------------------------------------- |
| **Framework**    | Angular 21.1, TypeScript 5.9                 |
| **Styling**      | Tailwind CSS                                 |
| **Stato e dati** | RxJS 7.8, Angular Signals                    |
| **Testing**      | Vitest                                       |
| **Backend**      | Firebase (Authentication, Realtime Database) |

## Struttura del progetto

```
src/app/
├── core/                    # Logica core dell'applicazione
│   ├── config/              # Configurazione (Firebase)
│   ├── guards/              # Auth guard
│   ├── layout/              # Header (mobile), navbar
│   ├── pages/               # Pagine errore (not-found, error)
│   ├── services/            # Auth, post, user, modal, toast, theme
│   ├── types/               # Modelli user e post
│   └── utils/               # Utility (safe-avatar-url, relative-post-time)
├── features/                # Moduli funzionali
│   ├── auth/                # Autenticazione
│   ├── favorites/           # Post salvati
│   ├── home/                # Feed Per te e Seguiti (wrapper con tab)
│   ├── posts/               # CRUD post, visualizzazione, azioni
│   ├── search/              # Ricerca utenti
│   └── user/                # Profilo, modifica, follow
├── shared/                  # Componenti, direttive e pipe riutilizzabili
│   ├── components/          # Button, modal, loader, toast, dropdown, skeletons, ecc.
│   ├── directives/          # click-outside, focus-field
│   └── pipes/               # safe-avatar-url, relative-post-time
└── app.ts                   # Componente root
```

## Routing

Le route sono definite in `app.routes.ts`. `Home` è il layout principale con route figlie (`home.routes.ts`): Per te e Seguiti. Lazy loading per Search, Favorites, User, FullPost, Followed e NotFound.

| Path                        | Componente | Lazy | Descrizione                                |
| --------------------------- | ---------- | ---- | ------------------------------------------ |
| `/`                         | —          | —    | Redirect a `/per-te`                       |
| `/per-te`                   | ForYou     | No   | Feed "Per te" (tutti i post)               |
| `/seguiti`                  | Followed   | Sì   | Feed "Seguiti" (post degli utenti seguiti) |
| `/cerca`                    | Search     | Sì   | Ricerca utenti                             |
| `/preferiti`                | Favorites  | Sì   | Post salvati (protetta da auth guard)      |
| `/utente/:id`               | User       | Sì   | Profilo utente; redirect a `posts`         |
| `/utente/:id/posts`         | UserPosts  | No   | Tab post del profilo                       |
| `/utente/:id/repost`        | UserPosts  | No   | Tab repost del profilo                     |
| `/utente/:id/posts/:postId` | FullPost   | Sì   | Vista singolo post                         |
| `/auth`                     | Auth       | Sì   | Login e registrazione                      |
| `**`                        | NotFound   | Sì   | Pagina 404                                 |

**Configurazione:** `provideRouter(routes, withComponentInputBinding(), withRouterConfig({ paramsInheritanceStrategy: 'always' }))` in `app.config.ts` – i parametri di route sono esposti come input dei componenti e ereditati dalle route parent.

## Sviluppo

### Prerequisiti

- Node.js (LTS consigliato)
- npm 11.x

### Installazione

```bash
npm install
```

### Avvio server

```bash
npx ng serve
# oppure
npm start
```

Apri `http://localhost:4200/`. L'app si ricarica automaticamente alle modifiche (hot reload).

### Avvio senza hot reload

Se desideri avviare il server **senza hot reload** (disabilitando HMR, hot module replacement) — ad esempio per debug, profiling o in ambienti dove il live reload causa problemi — puoi usare il flag `--no-hmr`:

```bash
npx ng serve --no-hmr
```

Questo avvia il server senza aggiornare automaticamente la pagina alle modifiche dei file sorgente.

### Build

```bash
npx ng build
# oppure
npm run build
```

L'output è in `dist/`. Le build di produzione sono ottimizzate di default.

### Test

```bash
npx ng test --watch=false
# oppure
npm test
```

I test unitari usano [Vitest](https://vitest.dev/). Esistono spec per: auth, button, loader, not-found, verified-icon, empty-wrapper, user, feed-skeleton, post, theme.

## Risorse aggiuntive

- [Panoramica Angular CLI](https://angular.dev/tools/cli)
- [Documentazione Angular](https://angular.dev)

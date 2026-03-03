/*
 * Come e' organizzato questo file?
 * ────────────────────────────────
 * 1. IMPORT   → portiamo dentro gli strumenti necessari
 * 2. MOCK     → creiamo versioni "finte" delle cose che il servizio
 *               usa (localStorage, matchMedia, classList) per poterle
 *               controllare nei test
 * 3. DESCRIBE → raggruppiamo i test per funzionalita' (initTheme,
 *               setTheme, ecc.)
 * 4. IT       → ogni singolo test: "dovrebbe fare X"
 * 5. EXPECT   → la verifica vera e propria: il risultato e' quello
 *               che ci aspettavamo?
 */

// ─── IMPORT ──────────────────────────────────────────────────────────
// TestBed: l'ambiente di test di Angular, ci permette di creare
//          istanze di servizi come se fossimo dentro l'app vera.
import { TestBed } from '@angular/core/testing';

// vi e Mock vengono da Vitest (il framework di test che usiamo).
// vi ci da' strumenti per creare funzioni "finte" (mock) che
// possiamo controllare e osservare dall'esterno.
// Mock e' semplicemente il tipo TypeScript di una funzione mock.
import { vi, type Mock } from 'vitest';

// Il servizio che stiamo testando + il tipo ThemeMode che esporta.
import { ThemeService, type ThemeMode } from './theme.service';

// ─── INIZIO DELLA SUITE DI TEST ─────────────────────────────────────
// `describe` crea un "gruppo" di test. Tutto quello che riguarda
// ThemeService sta dentro questo blocco.
describe('ThemeService', () => {
  // Variabili condivise tra tutti i test di questo gruppo.
  // Vengono re-inizializzate prima di ogni singolo test (nel beforeEach).

  // `service` e' l'istanza del ThemeService che testeremo.
  let service: ThemeService;

  // `classListToggle` e' una funzione finta che sostituisce
  // document.documentElement.classList.toggle().
  // Il servizio reale la chiama per aggiungere/togliere la classe
  // 'dark' dall'elemento <html>. Noi la sostituiamo con una mock
  // perche' nei test non abbiamo un DOM reale e vogliamo solo
  // verificare CHE venga chiamata e CON QUALI argomenti.
  let classListToggle: Mock;

  // `mediaListeners` tiene traccia dei listener registrati su
  // matchMedia. Quando il servizio chiama addEventListener('change', fn)
  // salviamo fn qui, cosi' possiamo invocarla manualmente nel test
  // per simulare un cambio di tema del sistema operativo.
  let mediaListeners: Map<string, EventListener>;

  // `mediaMatches` controlla cosa risponde matchMedia.matches.
  // true = il sistema operativo e' in dark mode
  // false = il sistema operativo e' in light mode
  // Possiamo cambiarla in ogni test per simulare scenari diversi.
  let mediaMatches: boolean;

  // ─── MOCK DI matchMedia ──────────────────────────────────────────
  //
  // Il servizio reale fa: window.matchMedia('(prefers-color-scheme: dark)')
  // Questo restituisce un oggetto MediaQueryList che dice se il
  // sistema operativo e' in dark mode (.matches) e permette di
  // ascoltare i cambiamenti (addEventListener).
  //
  // Nei test non abbiamo un sistema operativo vero, quindi creiamo
  // un oggetto finto che:
  //  - restituisce il valore di `mediaMatches` quando leggi .matches
  //  - salva/rimuove i listener in `mediaListeners` cosi' li possiamo
  //    richiamare manualmente
  function createMockMediaQueryList(): MediaQueryList {
    mediaListeners = new Map();
    return {
      // `get matches()` e' un getter: ogni volta che il servizio
      // legge .matches, esegue questa funzione e restituisce il
      // valore attuale di mediaMatches.
      get matches() {
        return mediaMatches;
      },
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      // vi.fn() crea una "funzione spia" (spy). Si comporta come una
      // funzione normale, ma Vitest registra ogni chiamata cosi'
      // possiamo verificarla dopo con expect().
      addEventListener: vi.fn((event: string, cb: EventListener) => {
        mediaListeners.set(event, cb);
      }),
      removeEventListener: vi.fn((event: string) => {
        mediaListeners.delete(event);
      }),
      // Questi servono solo per completare l'interfaccia TypeScript
      // di MediaQueryList, il servizio non li usa.
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }

  // ─── SETUP (prima di OGNI test) ─────────────────────────────────
  //
  // `beforeEach` viene eseguito automaticamente PRIMA di ogni singolo
  // `it(...)`. Serve a preparare un ambiente pulito, cosi' ogni test
  // parte da zero e non dipende dai risultati di un altro test.
  beforeEach(() => {
    // Partiamo con il sistema operativo in light mode (false = no dark)
    mediaMatches = false;

    // Sostituiamo la funzione globale window.matchMedia con la nostra
    // versione finta. Quando il servizio chiamera' matchMedia(...),
    // ricevera' il nostro mock invece di quello vero del browser.
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => createMockMediaQueryList()),
    );

    // Creiamo una funzione finta per classList.toggle e la montiamo
    // sul documento. Cosi' quando il servizio fa
    // document.documentElement.classList.toggle('dark', true/false)
    // non modifica il DOM reale ma chiama la nostra mock.
    classListToggle = vi.fn();
    vi.spyOn(document.documentElement.classList, 'toggle').mockImplementation(classListToggle);

    // Puliamo localStorage per evitare che dati di un test precedente
    // influenzino il test corrente.
    localStorage.clear();

    // Configuriamo l'ambiente Angular di test (vuoto, perche'
    // ThemeService e' providedIn: 'root' e non ha dipendenze
    // Angular da iniettare).
    TestBed.configureTestingModule({});

    // Chiediamo ad Angular di crearci un'istanza del ThemeService.
    // E' come fare `new ThemeService()` ma passando per il sistema
    // di dependency injection di Angular.
    service = TestBed.inject(ThemeService);
  });

  // ─── PULIZIA (dopo OGNI test) ──────────────────────────────────
  //
  // `afterEach` viene eseguito DOPO ogni singolo test.
  // Ripristiniamo tutto allo stato originale per non inquinare
  // i test successivi.
  afterEach(() => {
    // Ripristina tutte le funzioni spiate (spyOn) al loro originale
    vi.restoreAllMocks();
    // Ripristina le variabili globali sostituite (stubGlobal)
    vi.unstubAllGlobals();
  });

  // ─── TEST BASE ─────────────────────────────────────────────────
  //
  // `it(...)` definisce un singolo test. Il primo argomento e' una
  // descrizione leggibile di cosa verifichiamo; il secondo e' la
  // funzione che contiene il test vero e proprio.
  //
  // `expect(X).toBeTruthy()` verifica che X esista e non sia
  // null/undefined/false/0. E' il test piu' semplice: "il servizio
  // si crea senza errori?"
  it('dovrebbe essere creato correttamente', () => {
    expect(service).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  //  initTheme — inizializzazione del tema all'avvio dell'app
  // ═══════════════════════════════════════════════════════════════
  //
  // `describe` dentro `describe` crea un sotto-gruppo. Qui testiamo
  // tutti gli scenari del metodo initTheme().
  describe('initTheme', () => {
    // SCENARIO: l'utente apre l'app per la prima volta, non ha mai
    // scelto un tema → localStorage e' vuoto → il servizio deve
    // usare 'system' come default.
    it('dovrebbe usare "system" come default se localStorage e\' vuoto', () => {
      // ARRANGE (prepara): niente da fare, localStorage e' gia' vuoto
      // ACT (agisci): chiamiamo il metodo che vogliamo testare
      service.initTheme();

      // ASSERT (verifica): controlliamo che il risultato sia corretto.
      // themeMode() legge il valore del signal Angular.
      expect(service.themeMode()).toBe('system');
    });

    // SCENARIO: l'utente aveva gia' scelto 'dark' in passato.
    // Il servizio deve leggere quel valore da localStorage e usarlo.
    it('dovrebbe ripristinare un tema valido salvato in localStorage', () => {
      // Simuliamo che l'utente avesse gia' scelto 'dark'
      localStorage.setItem('ngfeed-theme', 'dark');

      service.initTheme();

      expect(service.themeMode()).toBe('dark');
    });

    // SCENARIO: localStorage contiene un valore invalido (magari
    // corrotto o scritto da un'altra app). Il servizio deve ignorarlo
    // e tornare al default 'system'.
    it('dovrebbe tornare a "system" se il valore salvato non e\' valido', () => {
      // 'neon' non e' un ThemeMode valido (solo 'light'|'dark'|'system')
      localStorage.setItem('ngfeed-theme', 'neon');

      service.initTheme();

      expect(service.themeMode()).toBe('system');
    });

    // SCENARIO: quando il tema risolto e' 'dark', il servizio deve
    // aggiungere la classe CSS 'dark' all'elemento <html>.
    // Verifichiamo che classList.toggle sia stato chiamato con ('dark', true).
    it('dovrebbe aggiungere la classe "dark" quando il tema e\' dark', () => {
      localStorage.setItem('ngfeed-theme', 'dark');

      service.initTheme();

      // toHaveBeenCalledWith verifica gli argomenti esatti con cui
      // la funzione mock e' stata chiamata.
      // toggle('dark', true) → aggiunge la classe
      expect(classListToggle).toHaveBeenCalledWith('dark', true);
    });

    // SCENARIO: tema light → la classe 'dark' NON deve essere presente.
    // toggle('dark', false) la rimuove.
    it('dovrebbe rimuovere la classe "dark" quando il tema e\' light', () => {
      localStorage.setItem('ngfeed-theme', 'light');

      service.initTheme();

      // toggle('dark', false) → rimuove la classe
      expect(classListToggle).toHaveBeenCalledWith('dark', false);
    });

    // SCENARIO: modalita' 'system' con SO in dark mode.
    // Il servizio non sa direttamente se usare light o dark;
    // deve chiedere a matchMedia. Qui simuliamo che il SO sia
    // in dark mode (mediaMatches = true) e verifichiamo che
    // resolvedTheme diventi 'dark'.
    it('dovrebbe risolvere "system" usando la preferenza del SO', () => {
      // Simuliamo: il sistema operativo e' in dark mode
      mediaMatches = true;

      service.initTheme();

      // resolvedTheme() e' il tema effettivo dopo aver risolto 'system'
      expect(service.resolvedTheme()).toBe('dark');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  getTheme — lettura del tema corrente
  // ═══════════════════════════════════════════════════════════════

  describe('getTheme', () => {
    // Verifica semplice: dopo aver impostato 'dark', getTheme()
    // deve restituire 'dark'.
    it('dovrebbe restituire il tema corrente', () => {
      service.setTheme('dark');

      expect(service.getTheme()).toBe('dark');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  setTheme — cambio del tema da parte dell'utente
  // ═══════════════════════════════════════════════════════════════

  describe('setTheme', () => {
    // Verifica che il signal themeMode venga aggiornato.
    // I signal sono il sistema reattivo di Angular: quando il valore
    // cambia, i componenti che lo leggono si aggiornano automaticamente.
    it('dovrebbe aggiornare il signal themeMode', () => {
      service.setTheme('light');

      expect(service.themeMode()).toBe('light');
    });

    // Verifica che la scelta venga salvata in localStorage, cosi'
    // alla prossima apertura dell'app il tema viene ripristinato.
    it('dovrebbe salvare la scelta in localStorage', () => {
      service.setTheme('dark');

      expect(localStorage.getItem('ngfeed-theme')).toBe('dark');
    });

    // Verifica che la classe CSS 'dark' venga applicata al DOM.
    // Senza questo, la pagina non cambierebbe aspetto visivo.
    it('dovrebbe aggiungere/togliere la classe "dark" sull\'elemento html', () => {
      service.setTheme('dark');

      expect(classListToggle).toHaveBeenCalledWith('dark', true);
    });

    // Verifica che resolvedTheme sia coerente con la modalita' scelta.
    // Quando scegli 'light' o 'dark' esplicitamente, il tema risolto
    // deve corrispondere (nessuna ambiguita' come con 'system').
    it('dovrebbe aggiornare resolvedTheme in base al tema scelto', () => {
      service.setTheme('light');
      expect(service.resolvedTheme()).toBe('light');

      service.setTheme('dark');
      expect(service.resolvedTheme()).toBe('dark');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  Listener del tema di sistema
  // ═══════════════════════════════════════════════════════════════
  //
  // Quando la modalita' e' 'system', il servizio deve ascoltare i
  // cambiamenti del tema del SO (es: l'utente attiva dark mode dal
  // pannello di controllo di Windows/macOS). Per farlo registra un
  // event listener su matchMedia. Questi test verificano che il
  // listener venga aggiunto, rimosso e che funzioni correttamente.

  describe('listener del tema di sistema', () => {
    // Quando scelgo 'system', il servizio DEVE registrare un listener
    // sull'evento 'change' di matchMedia.
    it('dovrebbe registrare un listener quando la modalita\' e\' "system"', () => {
      service.setTheme('system');

      // Verifica che nel nostro Map dei listener esista la chiave 'change'
      expect(mediaListeners.has('change')).toBe(true);
    });

    // Quando passo da 'system' a un tema esplicito (es: 'dark'),
    // il listener non serve piu' e deve essere rimosso per evitare
    // memory leak e comportamenti indesiderati.
    it('dovrebbe rimuovere il listener quando si esce dalla modalita\' "system"', () => {
      service.setTheme('system');
      // Ora passiamo a dark mode → il listener deve sparire
      service.setTheme('dark');

      expect(mediaListeners.has('change')).toBe(false);
    });

    // Simuliamo un cambio di tema del SO mentre siamo in modalita'
    // 'system'. Il servizio deve reagire e aggiornare tutto.
    it('dovrebbe riapplicare il tema quando il SO cambia preferenza', () => {
      service.setTheme('system');
      // Resettiamo il conteggio delle chiamate alla mock,
      // perche' setTheme ha gia' chiamato classListToggle.
      // Ci interessa solo verificare le chiamate DOPO il cambio del SO.
      classListToggle.mockClear();

      // Simuliamo: il SO passa a dark mode
      mediaMatches = true;
      // Recuperiamo il listener che il servizio ha registrato
      // e lo invochiamo manualmente, come farebbe il browser
      // quando il SO cambia tema.
      const listener = mediaListeners.get('change')!;
      listener(new Event('change'));

      expect(service.resolvedTheme()).toBe('dark');
      expect(classListToggle).toHaveBeenCalledWith('dark', true);
    });

    // Se il listener esiste ancora (magari per un bug) ma la modalita'
    // non e' piu' 'system', il servizio deve ignorare l'evento.
    // Questo test verifica quel meccanismo di sicurezza.
    it('dovrebbe ignorare i cambiamenti del SO se la modalita\' non e\' "system"', () => {
      service.setTheme('system');
      // Salviamo il riferimento al listener PRIMA di cambiare tema
      const listener = mediaListeners.get('change')!;

      // Passiamo a light mode esplicito
      service.setTheme('light');
      classListToggle.mockClear();

      // Simuliamo il cambio del SO → non dovrebbe succedere nulla
      listener(new Event('change'));

      // not.toHaveBeenCalled() verifica che la mock NON sia stata
      // chiamata. Se fosse chiamata, significherebbe un bug.
      expect(classListToggle).not.toHaveBeenCalled();
    });
  });
});

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

/* ────────────────────────────────────────────────────────
   German translations – keyed by the English source string.
   t('English text') → returns German when lang === 'de'.
   ──────────────────────────────────────────────────────── */
const de = {

  // ── Login ──
  'Sign in to access the admin dashboard': 'Melden Sie sich an, um auf das Admin-Dashboard zuzugreifen',
  'NAF Logo': 'NAF-Logo',
  'NAF SUPPORT': 'NAF SUPPORT',
  'Username': 'Benutzername',
  'Password': 'Passwort',
  'Enter your username': 'Benutzername eingeben',
  'Remember me': 'Angemeldet bleiben',
  'Sign In': 'Anmelden',
  'Signing in…': 'Anmeldung läuft…',
  'Invalid Credentials. Please try again.': 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
  'Network error. Please check your connection.': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',

  // ── Header / Nav ──
  'NAF Support': 'NAF Support',
  'Interface language': 'Oberflächensprache',
  'Language': 'Sprache',
  'English': 'Englisch',
  'Deutsch': 'Deutsch',
  'Click to logout': 'Zum Abmelden klicken',
  'Admin': 'Admin',
  'Logout': 'Abmelden',

  // ── Dashboard KPIs ──
  'Support workspace': 'Support-Arbeitsbereich',
  'Every request. One queue. Website form and email.': 'Alle Anfragen an einem Ort – über Webformular und E-Mail.',
  '+  New ticket': '+  Neues Ticket',
  'Open': 'Offen',
  'Awaiting response': 'Wartet auf Antwort',
  'In Progress': 'In Bearbeitung',
  'Being handled': 'Wird bearbeitet',
  'Closed': 'Geschlossen',
  'Closed today': 'Heute geschlossen',
  'Failed to load tickets': 'Tickets konnten nicht geladen werden',
  'Retrying': 'Erneuter Versuch läuft…',
  'Retry': 'Wiederholen',

  // ── Status filter pills ──
  'All active': 'Alle aktiven Tickets',
  'OPEN': 'OFFEN',
  'IN_PROGRESS': 'IN BEARBEITUNG',
  'CLOSED': 'GESCHLOSSEN',

  // ── Search & controls ──
  'Search name, email, phone, reference…': 'Nach Name, E-Mail, Telefon oder Vorgangsnummer suchen…',
  'Columns': 'Spalten',
  'Reference ID + created date/time': 'Referenz-ID + Erstellungsdatum/-zeit',
  'Source / channel': 'Quelle / Kanal',
  'Subject + description preview': 'Betreff + Beschreibungsvorschau',
  'Full name + email / phone': 'Vollständiger Name + E-Mail / Telefon',
  'Account type': 'Kontotyp',
  'Machine ID / Location': 'Maschinen-ID / Standort',
  'Request type': 'Anfragetyp',
  'Uploaded media indicator': 'Anzeige hochgeladener Medien',
  'Status': 'Status',
  '＋ Phone number as separate column': '＋ Telefonnummer als separate Spalte',
  '＋ Full message / description': '＋ Vollständige Nachricht / Beschreibung',
  'Filter': 'Filter',
  'All channels': 'Alle Kanäle',
  'Website form': 'Webformular',
  'Email': 'E-Mail',
  'WhatsApp': 'WhatsApp',
  'All request types': 'Alle Anfragetypen',
  'All account types': 'Alle Kontotypen',
  'Clear filters': 'Filter zurücksetzen',

  // ── Table headers ──
  'Reference / Created': 'Referenz / Erstellt',
  'Subject / Description': 'Betreff / Beschreibung',
  'Requester / Account': 'Anfragender / Konto',
  'Machine / Location': 'Maschine / Standort',

  // ── Pagination / refresh ──
  'Showing': 'Zeige',
  'of': 'von',
  'active tickets': 'aktive Tickets',
  'Refreshing': 'Aktualisierung',
  'Auto-refresh 30s': 'Automatische Aktualisierung alle 30 Sek.',
  ' · All times CEST': ' · Alle Zeitangaben: MEZ/MESZ',
  // Falls die Dashboard-Komponente im Winter CET statt CEST verwendet:
  ' · All times CET': ' · Alle Zeitangaben: MEZ/MESZ',
  'Refresh tickets': 'Tickets aktualisieren',

  // ── Table row data ──
  'Photo': 'Foto',
  'File': 'Datei',
  'Files': 'Dateien',
  'file': 'Datei',
  'files': 'Dateien',
  'No Subject': 'Kein Betreff',
  'No description': 'Keine Beschreibung',
  'No media': 'Keine Medien',
  'Unknown User': 'Unbekannter Benutzer',
  'Not provided': 'Nicht angegeben',

  // ── Empty states ──
  'No results found': 'Keine Ergebnisse gefunden',
  'No tickets yet': 'Noch keine Tickets',
  'Try adjusting your search query or changing the status filter.': 'Versuchen Sie, Ihre Suchanfrage anzupassen oder den Statusfilter zu ändern.',
  'When support tickets are submitted, they will appear here.': 'Wenn Support-Tickets eingereicht werden, erscheinen sie hier.',

  // ── Mobile cards ──
  'View': 'Ansehen',
  'Delete': 'Löschen',

  // ── Delete modal ──
  'Delete Ticket?': 'Ticket löschen?',
  'Are you sure you want to delete ticket': 'Möchten Sie das folgende Ticket wirklich löschen? Vorgangsnummer:',
  // Bevorzugt: vollständige Vorlage mit t('Are you sure you want to delete ticket {ticketRef}?', { ticketRef }).
  'Are you sure you want to delete ticket {ticketRef}?': 'Möchten Sie das Ticket {ticketRef} wirklich löschen?',
  'This action cannot be undone.': 'Diese Aktion kann nicht rückgängig gemacht werden.',
  'Cancel': 'Abbrechen',

  // ── Ticket detail ──
  'Only image or PDF files smaller than 5 MB can be attached.': 'Es können nur Bild- oder PDF-Dateien mit weniger als 5 MB angehängt werden.',
  '← Back': '← Zurück',
  'Created ': 'Erstellt: ',
  'Start progress': 'Bearbeitung starten',
  'Close ticket': 'Ticket schließen',
  'Reopen ticket': 'Ticket wiedereröffnen',
  'Ticket details': 'Ticket-Details',
  'Source': 'Quelle',
  'Requester': 'Anfragender',
  'Conversation': 'Konversation',
  'Internal note': 'Interne Notiz',
  'Internal': 'Intern',
  'Attachment': 'Anhang',
  'Image': 'Bild',
  'This ticket is closed. Reopen it to reply.': 'Dieses Ticket ist geschlossen. Öffnen Sie es erneut, um zu antworten.',
  'Replies stay on WhatsApp.': 'Antworten erfolgen weiterhin über WhatsApp.',
  'Replies stay on email.': 'Antworten erfolgen weiterhin per E-Mail.',
  'Reply on WhatsApp': 'Auf WhatsApp antworten',
  'Reply by email': 'Per E-Mail antworten',
  'Write only the reply body. The email template already includes the greeting and closing.': 'Schreiben Sie nur den Antworttext. Die E-Mail-Vorlage enthält bereits Begrüßung und Abschluss.',
  'Write an internal note…': 'Interne Notiz schreiben…',
  'Notes are only visible to staff.': 'Notizen sind nur für Mitarbeiter sichtbar.',
  'Attach image or PDF': 'Bild oder PDF anhängen',
  'Attach image or PDF (up to 10 MB total)': 'Bild oder PDF anhängen (insgesamt bis 10 MB)',
  'Attach': 'Anhängen',
  'Max. 10 MB total': 'Max. insgesamt 10 MB',
  'Uploading attachments': 'Anhänge werden hochgeladen',
  'Keep this window open until upload completes.': 'Lassen Sie dieses Fenster geöffnet, bis der Upload abgeschlossen ist.',
  'Finishing reply': 'Antwort wird abgeschlossen',
  'Upload complete. Waiting for confirmation…': 'Upload abgeschlossen. Warten auf Bestätigung…',
  'Sending…': 'Wird gesendet…',
  'Send reply': 'Antwort senden',
  'Save note': 'Notiz speichern',
  'Close image preview': 'Bildvorschau schließen',
  'Ticket attachment': 'Ticket-Anhang',

  // ── Email modal ──
  'Send Email': 'E-Mail senden',
  'To': 'An',
  'Subject': 'Betreff',
  'Message': 'Nachricht',
  'Attachments': 'Anhänge',
  'Click to attach files': 'Klicken zum Anhängen von Dateien',

  // ── New ticket modal ──
  '✓ Ticket created': '✓ Ticket erstellt',
  '· Open': '· Offen',
  'Your ticket is ready. The customer confirmation will use the selected reply channel.': 'Das Ticket wurde erstellt. Die Kundenbestätigung wird über den ausgewählten Antwortkanal versendet.',
  'Back to tickets': 'Zurück zu Tickets',
  'New ticket': 'Neues Ticket',
  'Create a support request on behalf of a customer.': 'Erstellen Sie eine Supportanfrage im Namen eines Kunden.',
  'REPLY CHANNEL': 'ANTWORTKANAL',
  'Full name *': 'Vollständiger Name *',
  'Enter full name': 'Vollständigen Namen eingeben',
  'Email (optional)': 'E-Mail (optional)',
  'Email *': 'E-Mail *',
  'Phone number *': 'Telefonnummer *',
  'Phone number': 'Telefonnummer',
  'Enter phone number': 'Telefonnummer eingeben',
  'Optional': 'Optional',
  'name@example.com': 'name@beispiel.de',
  'Account type *': 'Kontotyp *',
  'Select account type': 'Kontotyp auswählen',
  'Request type *': 'Anfragetyp *',
  'Select request type': 'Anfragetyp auswählen',
  'Subject *': 'Betreff *',
  'Briefly describe the request': 'Beschreiben Sie die Anfrage kurz',
  'Message / Description *': 'Nachricht / Beschreibung *',
  'What happened? Include any details that will help us.': 'Was ist passiert? Geben Sie alle Details an, die uns helfen können.',
  'file selected': 'Datei ausgewählt',
  'files selected': 'Dateien ausgewählt',
  '+ Add photos, video or audio': '+ Fotos, Video oder Audio hinzufügen',
  'Send a confirmation on WhatsApp': 'Bestätigung per WhatsApp senden',
  'Send a ticket confirmation to the customer': 'Ticketbestätigung an den Kunden senden',
  'Replies will be sent by WhatsApp. A phone number is required.': 'Antworten werden per WhatsApp gesendet. Eine Telefonnummer ist erforderlich.',
  'New tickets start as Open. * Required fields': 'Neue Tickets erhalten zunächst den Status „Offen“. * Pflichtfelder',
  'Please complete the required fields before creating this ticket.': 'Bitte füllen Sie die Pflichtfelder aus, bevor Sie dieses Ticket erstellen.',
  'Create ticket': 'Ticket erstellen',
  'The server took too long to respond. Please try again.': 'Der Server hat zu lange gebraucht. Bitte versuchen Sie es erneut.',
  'Unable to create the ticket. Please try again.': 'Das Ticket konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
  'Replies will be sent by': 'Antworten erfolgen über',
  'The channel stays fixed for this ticket.': 'Der Kanal bleibt für dieses Ticket festgelegt.',

  // ── Toasts ──
  'Notice': 'Hinweis',
  'Status Updated': 'Status aktualisiert',
  'Ticket status changed to': 'Ticketstatus geändert auf',
  'Update Failed': 'Aktualisierung fehlgeschlagen',
  'Ticket Deleted': 'Ticket gelöscht',
  'has been removed.': 'wurde entfernt.',
  'Delete Failed': 'Löschen fehlgeschlagen',
  'Reply sent': 'Antwort gesendet',
  'Reply not sent': 'Antwort nicht gesendet',
  'Attachment upload failed': 'Anhang-Upload fehlgeschlagen',
  'Only files up to 10 MB total can be attached.': 'Es können insgesamt nur Dateien bis 10 MB angehängt werden.',
  'Only image or PDF files up to 10 MB total can be attached.': 'Es können insgesamt nur Bild- oder PDF-Dateien bis 10 MB angehängt werden.',
  'Attachment upload failed. No text-only fallback was sent.': 'Der Anhang konnte nicht hochgeladen werden. Es wurde keine Text-Ersatznachricht gesendet.',
  'The reply could not be delivered.': 'Die Antwort konnte nicht zugestellt werden.',
  'Reply saved, delivery failed': 'Antwort gespeichert, Zustellung fehlgeschlagen',
  'Reply sent to': 'Antwort gesendet an',
  'the customer': 'den Kunden',
  'The reply was saved locally, but n8n could not deliver it to WhatsApp/email.': 'Die Antwort wurde lokal gespeichert, aber n8n konnte sie nicht per WhatsApp/E-Mail zustellen.',
  'Note Added': 'Notiz hinzugefügt',
  'Internal note saved to conversation.': 'Interne Notiz zur Konversation gespeichert.',
  'Email Sent Successfully': 'E-Mail erfolgreich gesendet',
  'Email sent to': 'E-Mail gesendet an',
  'with': 'mit',
  'attachment(s)': 'Anhang/Anhänge',
  'missing phone number': 'fehlende Telefonnummer',
  'missing email address': 'fehlende E-Mail-Adresse',
  'Delivered': 'Zugestellt',
  'Undelivered': 'Nicht zugestellt',

  // ── Customer notification messages ──
  'has been reopened. We will continue helping you.': 'wurde wiedereröffnet. Wir helfen Ihnen weiter.',
  'is now in progress. Our support team is working on it.': 'ist jetzt in Bearbeitung. Unser Support-Team arbeitet daran.',
  'has been closed. If you still need help, reply with this ticket reference.': 'wurde geschlossen. Wenn Sie weitere Hilfe benötigen, antworten Sie mit dieser Ticketreferenz.',
  'Your support ticket': 'Ihr Support-Ticket',
  'status is now': 'Status ist jetzt',

  // ── Data display values (backend stores English, UI shows German) ──
  'Machine Issue': 'Maschinenproblem',
  'Payment / Refund': 'Zahlung / Erstattung',
  'NAF Membership': 'NAF-Mitgliedschaft',
  'NAF Wallet': 'NAF Wallet',
  'Mobile App': 'Mobile App',
  'NAF Cloud System': 'NAF Cloud System',
  'Reservation / Pickup': 'Reservierung / Abholung',
  'Complaint': 'Beschwerde',
  'Feedback / Suggestion': 'Feedback / Vorschlag',
  'Partnership / Business Support': 'Partnerschaft / Geschäftsunterstützung',
  'Other': 'Sonstiges',
  'Customer / Guest': 'Kunde / Gast',
  'NAF Member': 'NAF-Mitglied',
  'Business / Partner': 'Geschäft / Partner',
  'Not collected': 'Nicht erfasst',
  'not_collected': 'Nicht erfasst',

  // ── Misc ──
  'Germany time': 'Deutsche Zeit',
  'Support Request': 'Supportanfrage',
  'No description provided.': 'Keine Beschreibung angegeben.',
  'Customer': 'Kunde',
  'Unknown': 'Unbekannt',
  'Support Team': 'Support-Team',
  'N/A': 'k. A.',
  'Issue': 'Problem',
  'attachment': 'Anhang',
  'saved locally — n8n webhook pending setup': 'lokal gespeichert – Einrichtung des n8n-Webhooks ausstehend',
  'replies': 'Antworten',
};

/* ──────────────────── React context ──────────────────── */
const I18nContext = createContext();

const DEFAULT_LANGUAGE = 'de';
const STORAGE_KEY = 'naf_lang';

function getStoredLanguage() {
  // Browser-Speicher ist z. B. bei SSR oder deaktiviertem Storage nicht verfügbar.
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'de' ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getStoredLanguage);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = useCallback((key, params) => {
    if (typeof key !== 'string' || !key) return key;

    // Keine geerbten Object-Eigenschaften als Übersetzung verwenden.
    let translated = lang === 'de' && Object.prototype.hasOwnProperty.call(de, key)
      ? de[key]
      : key;

    // Split/join vermeidet Sonderzeichen-Probleme von regulären Ausdrücken.
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([name, value]) => {
        translated = translated.split(`{${name}}`).join(String(value ?? ''));
      });
    }

    return translated;
  }, [lang]);

  const switchLang = useCallback((newLang) => {
    const nextLang = newLang === 'en' ? 'en' : 'de';
    setLang(nextLang);

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, nextLang);
      }
    } catch {
      // Sprachwechsel funktioniert weiterhin, auch wenn der Speicher gesperrt ist.
    }
  }, []);

  const value = useMemo(() => ({
    t,
    lang,
    setLang: switchLang,
    locale: lang === 'de' ? 'de-DE' : 'en-GB',
  }), [t, lang, switchLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useTranslation = () => useContext(I18nContext);

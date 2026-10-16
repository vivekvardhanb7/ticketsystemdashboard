// Paste this code into the n8n node "Find Existing Ticket - Exact Match".
// It fixes replies from dashboard-created tickets by reading all supported
// reference/email field names returned by the staging API.

const inputs = $input.all();
const output = [];
const PAGE_SIZE = 100;
const MAX_PAGES = 100;
const ISSUES_URL = 'https://staging-api.naf-cloudsystem.de/api/NAFWebsite/issues';

function parse(value) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
}

function normalize(value) {
  return String(value || '').normalize('NFKC').replace(/[\u200b-\u200f\ufeff\u2060]/g, '')
    .replace(/[\u2010-\u2015\u2212]/g, '-').trim().toUpperCase();
}

function emailValue(value) {
  if (typeof value === 'string') {
    const match = value.match(/<([^<>]+)>/);
    return String(match ? match[1] : value).trim().toLowerCase();
  }
  if (value && typeof value === 'object') {
    return String(value.address || value.email || value.value || '').trim().toLowerCase();
  }
  return '';
}

function ticketEmail(ticket) {
  return [
    ticket?.email, ticket?.customerEmail, ticket?.contactEmail,
    ticket?.requesterEmail, ticket?.emailAddress,
    ticket?.customer?.email, ticket?.requester?.email, ticket?.contact?.email,
    ticket?.issueData?.email, ticket?.data?.email
  ].map(emailValue).find(Boolean) || '';
}

function ticketReference(ticket) {
  return String([
    ticket?.ticketId, ticket?.ticketReference, ticket?.ticketRef,
    ticket?.ticketNumber, ticket?.issueReference, ticket?.issueNumber,
    ticket?.reference, ticket?.referenceNumber, ticket?.number,
    ticket?.issueData?.ticketId, ticket?.issueData?.ticketReference,
    ticket?.data?.ticketId, ticket?.data?.ticketReference
  ].find(value => String(value ?? '').trim()) || '').trim();
}

function ticketInternalId(ticket) {
  return ticket?.id ?? ticket?.issueId ?? ticket?.ticket?.id ?? ticket?.issue?.id ?? '';
}

function subjectInfo(value) {
  let text = normalize(value).toLowerCase();
  let isReply = false;
  const prefix = /^(?:\[(?:external|extern)\]\s*)?(re|aw|antw|fw|fwd|wg)\s*(?:\[\d+\]|\(\d+\))?\s*:\s*/i;
  while (prefix.test(text)) { isReply = true; text = text.replace(prefix, ''); }
  text = text.replace(/^\[(?:external|extern)\]\s*/i, '')
    .replace(/\bNAF\s*-\s*[A-Z0-9]+(?:\s*-\s*[A-Z0-9]+)*\b/gi, '')
    .replace(/[\[\]()]/g, '').replace(/^[\s:|\-]+|[\s:|\-]+$/g, '')
    .replace(/^wir haben ihre anfrage erhalten\s*:\s*/i, '')
    .replace(/\s+/g, ' ').trim();
  return { isReply, normalizedSubject: text };
}

function listFrom(payload, depth = 0) {
  if (depth > 8) return null;
  const value = parse(payload);
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return null;
  for (const key of ['content', 'issues', 'tickets', 'items', 'results', 'records', 'data', 'body', 'result', 'response']) {
    if (value[key] !== undefined) {
      const list = listFrom(value[key], depth + 1);
      if (list !== null) return list;
    }
  }
  return null;
}

function ticketYear(ticket) {
  for (const key of ['submittedAt', 'createdAt', 'createdDateTime', 'created_at']) {
    const date = new Date(ticket?.[key] || '');
    if (!Number.isNaN(date.getTime())) return date.getUTCFullYear();
  }
  return null;
}

function derivedReference(ticket) {
  const id = Number(ticketInternalId(ticket));
  const year = ticketYear(ticket);
  return Number.isSafeInteger(id) && id >= 0 && year ? `NAF-${year}-${1000 + id}` : '';
}

for (let i = 0; i < inputs.length; i++) {
  const email = inputs[i].json || {};
  if (!email.authToken) throw new Error('Missing token for NAF ticket lookup.');

  const wanted = normalize(email.ticketRef);
  if ((email.ticketRefs || []).length > 1) {
    throw new Error('Multiple ticket references in subject; manual review required.');
  }

  const tickets = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await this.helpers.httpRequest({
      method: 'GET',
      url: `${ISSUES_URL}?page=${page}&size=${PAGE_SIZE}`,
      headers: { Accept: 'application/json', Authorization: `Bearer ${email.authToken}` },
      timeout: 30000
    });
    const pageTickets = listFrom(response);
    if (!Array.isArray(pageTickets)) throw new Error('Unrecognized ticket-list response.');
    tickets.push(...pageTickets);
    if (pageTickets.length < PAGE_SIZE) break;
    if (page === MAX_PAGES - 1) throw new Error('Ticket search exceeded pagination limit.');
  }

  const fromEmail = emailValue(email.email);
  let matches = tickets.filter(ticket => {
    const references = [ticketReference(ticket), derivedReference(ticket)].map(normalize).filter(Boolean);
    return wanted && references.includes(wanted);
  });
  let matchMethod = matches.length ? 'REFERENCE' : '';

  // If the subject contains the old display reference, also verify the
  // internal ID, year, and customer email before accepting the match.
  if (!matches.length) {
    const legacy = /^NAF-(20\d{2})-(\d+)$/.exec(wanted);
    if (legacy && fromEmail) {
      const expectedYear = Number(legacy[1]);
      const expectedId = Number(legacy[2]) - 1000;
      matches = tickets.filter(ticket =>
        Number(ticketInternalId(ticket)) === expectedId &&
        ticketYear(ticket) === expectedYear &&
        ticketEmail(ticket) === fromEmail &&
        /^NAF-/i.test(ticketReference(ticket) || derivedReference(ticket))
      );
      if (matches.length) matchMethod = 'VERIFIED_LEGACY_REFERENCE';
    }
  }

  // Dashboard replies historically did not always include the ticket
  // reference in the subject. Use subject + sender only when unique.
  if (!matches.length && !wanted && !(email.ticketRefs || []).length && fromEmail) {
    const normalizedSubject = subjectInfo(email.subject).normalizedSubject;
    if (normalizedSubject) {
      matches = tickets.filter(ticket =>
        ticketEmail(ticket) === fromEmail &&
        subjectInfo(ticket.subject).normalizedSubject === normalizedSubject
      );
      if (matches.length) matchMethod = 'UNIQUE_SUBJECT_AND_SENDER';
    }
  }

  if (matches.length > 1) {
    throw new Error(`Ambiguous ticket match for ${email.subject || email.ticketRef || 'reply'}.`);
  }

  const match = matches[0] || null;
  const internalId = ticketInternalId(match);
  const ownerEmail = ticketEmail(match);
  const senderMatches = Boolean(ownerEmail && fromEmail && ownerEmail === fromEmail);
  const matchedTicket = Boolean(match && String(internalId).trim() && senderMatches);
  const { authToken, ...safeEmail } = email;

  output.push({
    json: {
      ...safeEmail,
      matchedTicket,
      ticketId: matchedTicket ? String(internalId) : '',
      matchedReference: match ? (ticketReference(match) || derivedReference(match)) : '',
      matchingStatus: !match ? 'NOT_FOUND' : !String(internalId).trim() ? 'NO_INTERNAL_ID' : !senderMatches ? 'SENDER_MISMATCH' : 'FOUND',
      matchMethod: matchedTicket ? matchMethod : '',
      lookedUpRecords: tickets.length
    },
    pairedItem: { item: i }
  });
}

return output;

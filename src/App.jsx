import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  LayoutDashboard,
  RefreshCw,
  Trash2,
  Mail,
  Search,
  X,
  Send,
  User,
  Eye,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  FileText,
  Briefcase,
  Paperclip,
  Image as ImageIcon,
  PlusCircle,
  AlertTriangle,
  Inbox,
  Calendar,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  Globe,
  ChevronDown,
  Check,
  LogOut,
  Bell
} from 'lucide-react';
import logo from './assets/naf-logo-animated.gif';
import LoginPage from './LoginPage';
import { COLORS, getAuthHeaders, timeAgo } from './designTokens';
import { useTranslation } from './i18n.jsx';

const TICKETS_PER_PAGE = 10;
// WhatsApp remains supported by the webhook code for a future release, but is
// intentionally hidden from this deployment's dashboard and ticket form.
const WHATSAPP_ENABLED = false;
const N8N_TICKET_EVENTS_URL = import.meta.env.VITE_N8N_TICKET_EVENTS_URL || 'https://n8n.naf-cloudsystem.de/webhook/ticket-events';
const N8N_WHATSAPP_TICKET_EVENTS_URL = import.meta.env.VITE_N8N_WHATSAPP_TICKET_EVENTS_URL || 'https://n8n.naf-cloudsystem.de/webhook/whatsapp-ticket-events';
const DISPLAY_TIME_ZONE = 'Europe/Berlin';
// n8n receives reply attachments as base64 inside JSON. A 10 MB raw-file
// limit becomes roughly 13.3 MB on the wire because base64 adds about 33%.
// The n8n/proxy request-body limit must therefore be configured above that.
const MAX_REPLY_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_REPLY_TOTAL_BYTES = 10 * 1024 * 1024;

function normalizeApiTimestamp(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw) ? raw : `${raw}Z`;
}

function parseTicketDate(value) {
  const date = new Date(normalizeApiTimestamp(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function ticketYear(value) {
  const date = parseTicketDate(value);
  if (!date) return new Date().getFullYear();
  return Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric'
  }).format(date));
}

function formatTicketShortDate(value, locale = 'de-DE') {
  const date = parseTicketDate(value);
  if (!date) return '';
  return date.toLocaleDateString(locale, {
    timeZone: DISPLAY_TIME_ZONE,
    day: '2-digit',
    month: 'short'
  }) + ' · ' + date.toLocaleTimeString(locale, {
    timeZone: DISPLAY_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatTicketDate(value, locale = 'de-DE') {
  const date = parseTicketDate(value);
  if (!date) return '';
  const zone = new Intl.DateTimeFormat('en-GB', {
    timeZone: DISPLAY_TIME_ZONE,
    timeZoneName: 'short'
  }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || 'Germany time';
  return date.toLocaleDateString(locale, {
    timeZone: DISPLAY_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + date.toLocaleTimeString(locale, {
    timeZone: DISPLAY_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ` ${zone}`;
}

function getAttachmentPreviewUrl(attachment) {
  if (!attachment) return '';
  if (typeof attachment === 'string') return attachment.trim();
  const directUrl = attachment.url
    || attachment.dataUrl
    || attachment.previewUrl
    || attachment.fileUrl
    || attachment.downloadUrl
    || attachment.path
    || attachment.filePath
    || '';
  if (directUrl) return directUrl;

  const rawData = attachment.data || attachment.base64 || attachment.base64Data || attachment.content || '';
  if (!rawData || typeof rawData !== 'string') return '';
  if (rawData.startsWith('data:')) return rawData;
  const mimeType = attachment.type || attachment.mimeType || attachment.contentType || '';
  if (mimeType.startsWith('image')) return `data:${mimeType};base64,${rawData}`;
  return '';
}

function getAttachmentName(attachment, attachmentUrl = '') {
  if (attachment && typeof attachment === 'object' && attachment.name) {
    return String(attachment.name);
  }

  const source = attachmentUrl || (typeof attachment === 'string' ? attachment : '');
  const pathname = String(source).split(/[?#]/)[0];
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (!lastSegment) return 'Attachment';

  let filename = lastSegment;
  try {
    filename = decodeURIComponent(lastSegment);
  } catch {
    // Keep the URL segment when it is not URI encoded correctly.
  }

  // Staging stores uploaded files as <generated-uuid>_<original-name>.
  // Show only the original filename in the dashboard.
  return filename.replace(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[_-]/i,
    ''
  ) || 'Attachment';
}

function getAttachmentType(attachment, attachmentUrl = '', attachmentName = '') {
  if (attachment && typeof attachment === 'object') {
    const declaredType = attachment.type || attachment.mimeType || attachment.contentType || '';
    if (declaredType) return declaredType;
  }

  const source = `${attachmentName} ${attachmentUrl}`;
  return /\.(png|jpe?g|gif|webp|avif|svg)(?:$|[?#])/i.test(source) ? 'image/*' : '';
}

function normalizeAttachment(attachment) {
  if (!attachment) return attachment;
  const attachmentUrl = getAttachmentPreviewUrl(attachment);
  const attachmentName = getAttachmentName(attachment, attachmentUrl);
  const attachmentType = getAttachmentType(attachment, attachmentUrl, attachmentName);

  if (typeof attachment === 'string') {
    return { url: attachmentUrl, name: attachmentName, type: attachmentType };
  }

  return {
    ...attachment,
    ...(attachmentUrl && !attachment.url ? { url: attachmentUrl } : {}),
    ...(attachmentName && !attachment.name ? { name: attachmentName } : {}),
    ...(attachmentType && !attachment.type ? { type: attachmentType } : {})
  };
}

function fileAttachmentMetadata(file) {
  const isPreviewable = file.type?.startsWith('image/') || file.type === 'application/pdf';
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    url: isPreviewable ? URL.createObjectURL(file) : ''
  };
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    data: String(reader.result || '').split(',')[1] || '',
  });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const localFilePreviewUrls = new WeakMap();

function getLocalFilePreviewUrl(file) {
  if (!file || !file.type?.startsWith('image/')) return '';
  if (!localFilePreviewUrls.has(file)) localFilePreviewUrls.set(file, URL.createObjectURL(file));
  return localFilePreviewUrls.get(file);
}

let attachmentPreviewDbPromise;

function openAttachmentPreviewDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (!attachmentPreviewDbPromise) {
    attachmentPreviewDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('naf-support-attachment-previews', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('previews', { keyPath: 'key' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return attachmentPreviewDbPromise;
}

async function persistAttachmentPreviews(ticketId, files) {
  const imageFiles = (files || []).filter(file => file.type?.startsWith('image/'));
  if (!ticketId || imageFiles.length === 0) return;

  try {
    const db = await openAttachmentPreviewDb();
    if (!db) return;
    const records = await Promise.all(imageFiles.map(async file => {
      const encoded = await fileToBase64(file);
      return {
        key: `${ticketId}::${file.name}::${file.size}`,
        ticketId: String(ticketId),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: `data:${file.type};base64,${encoded.data}`
      };
    }));
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('previews', 'readwrite');
      const store = transaction.objectStore('previews');
      records.forEach(record => store.put(record));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('Could not persist attachment preview:', error.message);
  }
}

async function hydrateAttachmentPreviews(ticketId, history) {
  if (!ticketId || !Array.isArray(history) || history.length === 0) return history;

  try {
    const db = await openAttachmentPreviewDb();
    if (!db) return history;
    const records = await new Promise((resolve, reject) => {
      const request = db.transaction('previews', 'readonly').objectStore('previews').getAll();
      request.onsuccess = () => resolve(request.result.filter(record => record.ticketId === String(ticketId)));
      request.onerror = () => reject(request.error);
    });
    if (records.length === 0) return history;

    return history.map(email => ({
      ...email,
      attachments: (email.attachments || []).map(attachment => {
        const normalizedAttachment = normalizeAttachment(attachment);
        const attachmentName = String(normalizedAttachment?.name || '').trim().toLowerCase();
        const attachmentSize = Number(attachment.size || 0);
        const record = records.find(item => {
          const recordName = String(item.name || '').trim().toLowerCase();
          const recordSize = Number(item.size || 0);
          const sameName = attachmentName && recordName && attachmentName === recordName;
          const sameSize = attachmentSize > 0 && recordSize > 0 && attachmentSize === recordSize;
          return sameName && (sameSize || attachmentSize === 0 || recordSize === 0);
        });
        return record
          ? { ...normalizedAttachment, type: normalizedAttachment.type || record.type, url: normalizedAttachment.url || record.dataUrl }
          : normalizedAttachment;
      })
    }));
  } catch (error) {
    console.warn('Could not load attachment preview:', error.message);
    return history;
  }
}

function buildTicketReplySubject(ticket, subject = '') {
  const reference = String(
    ticket?.ticketId
      || ticket?.ticketReference
      || ticket?.ticketNumber
      || ticket?.id
      || ''
  ).trim();
  const base = String(subject || ticket?.subject || reference || 'Support request').trim();
  if (!reference || base.toLowerCase().includes(reference.toLowerCase())) return base;
  return `${base} (${reference})`;
}

function getDesktopNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return window.Notification.permission;
}

function sendNewTicketDesktopNotification(ticket) {
  if (getDesktopNotificationPermission() !== 'granted') return;
  const reference = ticket.ticketId || ticket.ticketReference || ticket.ticketNumber || ticket.id || 'New ticket';
  const subject = ticket.subject || 'New support request';
  const notification = new window.Notification('New support ticket', {
    body: `${reference} · ${subject}`,
    tag: `naf-ticket-${ticket.id || reference}`,
  });
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

function getTicketEmailTemplate(ticket, eventType, ticketStatus) {
  const reference = String(
    ticket?.ticketId
      || ticket?.ticketReference
      || ticket?.ticketNumber
      || ticket?.id
      || ''
  ).trim();
  const normalizedEvent = String(eventType || '').trim().toUpperCase();
  const normalizedStatus = String(ticketStatus || ticket?.status || 'OPEN').trim().toUpperCase();

  let label = 'Support reply';
  let preheader = `You have a new response about ${reference}.`;
  if (normalizedEvent === 'TICKET_RECEIVED') {
    label = 'Request received';
    preheader = `Your reference is ${reference}. Reply here to add details.`;
  } else if (normalizedEvent === 'STATUS_CHANGED' && normalizedStatus === 'IN_PROGRESS') {
    label = 'In Progress';
    preheader = `Our team has started reviewing ${reference}.`;
  } else if (normalizedEvent === 'STATUS_CHANGED' && normalizedStatus === 'CLOSED') {
    label = 'Ticket closed';
    preheader = `Review the outcome for ${reference}.`;
  } else if (normalizedEvent === 'STATUS_CHANGED' && normalizedStatus === 'OPEN') {
    label = 'Ticket reopened';
    preheader = `We will continue helping with ${reference}.`;
  }

  return {
    subject: reference ? `[${reference}] ${label}` : label,
    preheader,
  };
}

async function notifyTicketEvent(ticket, eventType, extra = {}, options = {}) {
  const { message, attachments, ...eventFields } = extra;
  const { onUploadProgress } = options;
  const rawChannel = String(ticket.channel || ticket.source || '').trim();
  const ticketPhone = ticket.phone || ticket.whatsappNumber || ticket.recipientPhoneNumber || '';
  const channel = rawChannel
    ? normalizeChannel(rawChannel)
    : (ticketPhone && !ticket.email ? 'WhatsApp' : 'Website form');
  const isWhatsApp = channel === 'WhatsApp';
  const normalizedTicketPhone = isWhatsApp ? normalizeWhatsAppPhone(ticketPhone) : ticketPhone;
  const ticketRef = String(ticket.ticketId || ticket.ticketReference || ticket.ticketNumber || ticket.id || '').trim();
  const ticketStatus = eventFields.ticketStatus || ticket.status || 'OPEN';
  const emailTemplate = getTicketEmailTemplate({ ...ticket, ticketId: ticketRef }, eventType, ticketStatus);
  const recipient = eventFields.to || (isWhatsApp
    ? normalizedTicketPhone
    : ticket.email || '');
  if (isWhatsApp && !String(recipient).trim()) {
    throw new Error(`WhatsApp ticket ${ticketRef || ticket.id || ''} has no phone number`);
  }
  if (!isWhatsApp && !String(recipient).trim()) {
    throw new Error(`Website/email ticket ${ticketRef || ticket.id || ''} has no customer email address`);
  }
  const payload = {
    eventType,
    ticketStatus,
    channel,
    to: recipient,
    phone: normalizedTicketPhone,
    email: ticket.email || '',
    toName: ticket.contactPerson || ticket.fullName || '',
    subject: eventFields.subject || ticket.subject || ticket.ticketId || '',
    ticketId: ticket.id || ticket.ticketId || '',
    ticketRef,
    ticketReference: ticketRef,
    emailSubject: eventFields.emailSubject || emailTemplate.subject,
    emailPreheader: eventFields.emailPreheader || emailTemplate.preheader,
    requestType: ticket.requestType || 'Support Request',
    ...eventFields,
  };

  if (message) payload.message = message;
  if (attachments?.length) {
    const totalBytes = attachments.reduce((sum, file) => sum + Number(file?.size || 0), 0);
    if (attachments.some(file => Number(file?.size || 0) > MAX_REPLY_ATTACHMENT_BYTES)) {
      throw new Error('An attachment is larger than 10 MB.');
    }
    if (totalBytes > MAX_REPLY_TOTAL_BYTES) {
      throw new Error('The reply attachments exceed the 10 MB total limit.');
    }
    payload.attachments = await Promise.all(attachments.map(fileToBase64));
  }

  const eventUrl = isWhatsApp ? N8N_WHATSAPP_TICKET_EVENTS_URL : N8N_TICKET_EVENTS_URL;
  const requestBody = JSON.stringify(payload);

  // Fetch does not expose request-upload progress in the browser. Use XHR
  // only when a caller asks for progress; all other events keep the existing
  // fetch path and behavior.
  if (typeof onUploadProgress === 'function' && typeof XMLHttpRequest !== 'undefined') {
    onUploadProgress(0);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let processingTimer = null;
      let displayedProgress = 0;
      const stopProcessingProgress = () => {
        if (processingTimer !== null) {
          window.clearInterval(processingTimer);
          processingTimer = null;
        }
      };
      const startProcessingProgress = () => {
        if (processingTimer !== null) return;
        displayedProgress = Math.max(displayedProgress, 90);
        onUploadProgress(displayedProgress);
        processingTimer = window.setInterval(() => {
          displayedProgress = Math.min(99, displayedProgress + 1);
          onUploadProgress(displayedProgress);
          if (displayedProgress >= 99) stopProcessingProgress();
        }, 700);
      };
      xhr.open('POST', eventUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 180000;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const uploadProgress = Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)));
          // The browser reports 100% when bytes leave the browser, but n8n
          // may still be processing the request. Reserve 100% for success.
          if (uploadProgress >= 100) {
            startProcessingProgress();
          } else {
            displayedProgress = Math.min(90, uploadProgress);
            onUploadProgress(displayedProgress);
          }
        }
      };
      xhr.onload = () => {
        stopProcessingProgress();
        if (xhr.status >= 200 && xhr.status < 300) {
          onUploadProgress(100);
          resolve(true);
          return;
        }
        const detail = String(xhr.responseText || '').trim();
        reject(new Error(`n8n returned ${xhr.status}${detail ? `: ${detail.slice(0, 240)}` : ''}`));
      };
      xhr.onerror = () => {
        stopProcessingProgress();
        reject(new Error('Failed to reach the n8n webhook.'));
      };
      xhr.ontimeout = () => {
        stopProcessingProgress();
        reject(new Error('The attachment upload timed out.'));
      };
      xhr.onabort = () => {
        stopProcessingProgress();
        reject(new Error('The attachment upload was cancelled.'));
      };
      xhr.send(requestBody);
    });
  }

  const response = await fetch(eventUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`n8n returned ${response.status}${detail ? `: ${detail.slice(0, 240)}` : ''}`);
  }
  return true;
}


/* -------------------------------------------------------------------------- */
/* CUSTOM HOOKS                                                               */
/* -------------------------------------------------------------------------- */


/** Animates a number from 0 → target over ~600ms */
function useCountUp(target, duration = 300) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === prevTarget.current && value === target) return;
    prevTarget.current = target;

    const start = performance.now();
    const from = 0;
    let rafId;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

/** Debounced value hook */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}




const REQUEST_TYPE_MAPPING = {
  "technical": "Machine Issue",
  "payment": "Payment / Refund",
  "membership": "NAF Membership",
  "wallet": "NAF Wallet",
  "mobile_app": "Mobile App",
  "naf_cloud": "NAF Cloud System",
  "naf.cloud": "NAF Cloud System",
  "naf cloud": "NAF Cloud System",
  "naf cloud system": "NAF Cloud System",
  "reservation": "Reservation / Pickup",
  "complaint": "Complaint",
  "feedback": "Feedback / Suggestion",
  "partnership": "Partnership / Business Support",
  "other": "Other"
};

function normalizeRequestType(value) {
  const rawValue = String(value || '').trim();
  return REQUEST_TYPE_MAPPING[rawValue.toLowerCase()] || rawValue || 'Other';
}

const ACCOUNT_TYPE_MAPPING = {
  "user": "Customer / Guest",
  "member": "NAF Member",
  "business": "Business / Partner",
  "other": "Other",
  "not_collected": "Not collected",
  "Not collected": "Not collected"
};

function normalizeChannel(value) {
  const channel = String(value || '').toLowerCase();
  if (channel.includes('whatsapp')) return 'WhatsApp';
  if (channel.includes('email')) return 'Email';
  return 'Website form';
}

function extractIssuePage(payload) {
  const root = payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;
  if (Array.isArray(root)) return { items: root, totalPages: 1 };
  if (!root || typeof root !== 'object') return { items: [], totalPages: 1 };

  const items = [root.content, root.issues, root.tickets, root.items, root.results]
    .find(value => Array.isArray(value));
  if (items) {
    const totalPages = Number(root.totalPages);
    return {
      items,
      totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : null,
    };
  }
  if (Array.isArray(root.data)) return { items: root.data, totalPages: 1 };
  return { items: [], totalPages: 1 };
}

const MISSING_VALUE_MARKERS = new Set([
  '',
  '-',
  '—',
  'n/a',
  'k.a.',
  'k. a.',
  'not provided',
  'nicht angegeben'
]);

function normalizeMissingValue(value) {
  const normalized = String(value ?? '').trim();
  return MISSING_VALUE_MARKERS.has(normalized.toLowerCase()) ? 'N/A' : normalized;
}

function isMissingValue(value) {
  return normalizeMissingValue(value) === 'N/A';
}

function displayRequestType(value, t) {
  return t(normalizeRequestType(value));
}

function displayAccountType(value, t) {
  return t(ACCOUNT_TYPE_MAPPING[value] || value || 'Customer / Guest');
}

function getUiChannel(value) {
  const normalized = normalizeChannel(value);
  return !WHATSAPP_ENABLED && normalized === 'WhatsApp' ? 'Email' : normalized;
}

function displayChannel(value, t) {
  return t(getUiChannel(value));
}

function extractEmailAddress(...values) {
  for (const value of values) {
    if (!value) continue;
    if (typeof value === 'object') {
      const nested = extractEmailAddress(
        value.emailAddress,
        value.address,
        value.email,
        value.value,
        value.contact,
        value.requester,
        value.customer
      );
      if (nested) return nested;
      continue;
    }
    const match = String(value).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (match) return match[0];
  }
  return '';
}

function normalizeWhatsAppPhone(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

/* -------------------------------------------------------------------------- */
/* MAIN APP COMPONENT                                                         */
/* -------------------------------------------------------------------------- */


export default function App() {
  const { t, lang, locale } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('authData') || sessionStorage.getItem('authData');
    return saved ? JSON.parse(saved) : false;
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState(null);
  const refreshInFlight = useRef(false);
  const notifiedWebsiteTickets = useRef(new Set());
  const hasLoadedTicketSnapshot = useRef(false);

  const handleLogout = () => {
    localStorage.removeItem('authData');
    sessionStorage.removeItem('authData');
    notifiedWebsiteTickets.current.clear();
    hasLoadedTicketSnapshot.current = false;
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (!toast || toast.variant === 'error' || toast.variant === 'progress') return undefined;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load Uploaded Fonts via @font-face and set Global Styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      
      body {
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background-color: ${COLORS.backgrounds.main};
        color: ${COLORS.text.body};
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        min-height: 100vh;
      }
      
      h1, h2, h3, h4, .font-heading, .ticket-main-heading {
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: ${COLORS.text.heading};
      }

      input, textarea, select, button, label, p, span, div {
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .force-satoshi {
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      }

      .custom-scrollbar::-webkit-scrollbar { width: 8px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: ${COLORS.backgrounds.main}; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }

      /* Toast animations */
      @keyframes toastDrop {
        from { transform: translateY(-12px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes shrinkWidth {
        from { width: 100%; }
        to { width: 0%; }
      }
      .toast-enter { animation: toastDrop 0.3s ease-out; }
      .toast-progress { animation: shrinkWidth 5s linear forwards; }

      /* Count-up fade */
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .kpi-animate { animation: fadeInUp 0.2s ease-out; }

      /* Mobile card animations */
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .card-animate { animation: cardIn 0.15s ease-out forwards; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  // Data Fetching from API
  const fetchTickets = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    try {
      const headers = getAuthHeaders(isAuthenticated);
      const pageSize = 100;
      const requestPage = async (page) => {
        const response = await fetch(`/api/NAFWebsite/issues?page=${page}&size=${pageSize}`, { headers });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('authData');
            sessionStorage.removeItem('authData');
            setIsAuthenticated(false);
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      };

      const firstData = await requestPage(0);
      if (!firstData) return;
      const firstPage = extractIssuePage(firstData);
      const totalPages = firstPage.totalPages;
      const remainingPages = Number.isFinite(totalPages)
        ? Math.max(0, Math.min(totalPages, 100) - 1)
        : (firstPage.items.length === pageSize ? 99 : 0);
      const remainingData = remainingPages > 0
        ? await Promise.all(Array.from({ length: remainingPages }, (_, index) => requestPage(index + 1)))
        : [];
      const rawContent = [firstPage, ...remainingData.filter(Boolean).map(extractIssuePage)]
        .flatMap(page => page.items);

      const docs = rawContent.map(item => {
        // Handle potentially re-mapped fields from backend
        const descText = item.description || item.bodyPreview || "";
        
        const extractedEmail = extractEmailAddress(
          item.email,
          item.from,
          item.senderEmail,
          item.customerEmail,
          item.contactEmail,
          item.requesterEmail,
          item.emailAddress,
          item.issueData?.email,
          item.issueData?.contactEmail,
          item.issueData?.contactDetails?.email,
          item.data?.email,
          item.data?.contactEmail,
          item.data?.contactDetails?.email,
          item.customer?.email,
          item.contact?.email,
          item.requester?.email
        );
        let contactName = item.fullName || item.contactPerson || item.senderName || "";

        if (!contactName && typeof extractedEmail === 'string' && extractedEmail) {
          const emailNameMatch = extractedEmail.match(/^([^<@]+)/);
          if (emailNameMatch) contactName = emailNameMatch[1].trim();
        }

        // Ensure numeric ID generation is safe for string IDs
        const rawDate = item.submittedAt || item.createdDateTime || item.receivedDateTime || new Date().toISOString();
        const createdAt = normalizeApiTimestamp(rawDate);
        const year = ticketYear(createdAt);
        let numericId = 0;
        if (typeof item.id === 'number') {
           numericId = item.id;
        } else if (typeof item.id === 'string') {
           numericId = Math.abs(item.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % 10000;
        }

        // Extract location from the description text instead of relying solely on bodyPreview, 
        // because the backend API might map bodyPreview -> description and drop bodyPreview.
        let parsedLocation = item.machineLocation || item.location;
        if (!parsedLocation && descText) {
          const locMatch = descText.match(/Machine Location:\s*(.+)/i);
          if (locMatch) parsedLocation = locMatch[1].trim();
        }

          const rawPhone = item.phoneNumber
            || item.phone
            || item.whatsappNumber
            || item.recipientPhoneNumber
            || item.issueData?.phoneNumber
            || item.data?.phoneNumber
            || item.customer?.phoneNumber
            || '';
          const machineLocation = normalizeMissingValue(item.machineLocation
            || item.location
            || item.machineId
            || item.issueData?.machineLocation
            || item.issueData?.location
            || item.data?.machineLocation
            || item.data?.location
            || parsedLocation);
          const rawEmail = extractedEmail;
          const rawChannel = String(
            item.source
            || item.channel
            || item.issueData?.source
            || item.data?.source
            || ''
          ).trim().toLowerCase();
          const normalizedChannel = rawChannel
            ? normalizeChannel(rawChannel)
            : (rawPhone && !rawEmail ? 'WhatsApp' : 'Website form');
          const rawRequestType = String(item.requestType || '').trim().toLowerCase();
          const isEmailIntake = normalizedChannel === 'Email'
            && !rawChannel.includes('manual')
            && (!rawRequestType || rawRequestType === 'email support');
          const apiTicketReference = [
            item.ticketReference,
            item.ticketRef,
            item.ticketNumber,
            item.issueReference,
            item.issueNumber,
            item.ticketId !== undefined && item.ticketId !== null ? String(item.ticketId) : ''
          ].find(value => String(value || '').trim());
          const displayTicketId = apiTicketReference
            ? (String(apiTicketReference).toUpperCase().startsWith('NAF-')
              ? String(apiTicketReference)
              : `NAF-${apiTicketReference}`)
            : `NAF-${year}-${1000 + numericId}`;
          const normalizedPhone = normalizedChannel === 'WhatsApp'
            ? normalizeWhatsAppPhone(rawPhone)
            : rawPhone;

          return {
            id: item.id?.toString() || Math.random().toString(36),
            ticketId: displayTicketId,
            contactPerson: contactName || "Unknown User",
            email: extractedEmail,
            phone: normalizedPhone,
            requestType: isEmailIntake ? "Other" : normalizeRequestType(item.requestType),
            problemType: item.subject || "Issue",
            subject: item.subject || "No Subject",
            description: descText,
            location: machineLocation,
            machineLocation,
            machineId: normalizeMissingValue(item.machineId),
            accountType: isEmailIntake ? "Not collected" : (ACCOUNT_TYPE_MAPPING[item.accountType] || item.accountType || "Customer / Guest"),
            urgency: ["Normal"],
            status: String(item.status || "OPEN").toUpperCase(),
            createdAt,
            channel: normalizedChannel,
            source: normalizedChannel,
            media: (item.mediaFilePathsAsList || []).map(url => ({
            url: url,
            type: url.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image/jpeg' : 'application/octet-stream',
            name: url.split('/').pop() || 'attachment'
          }))
        };
      });

      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Announce tickets that appeared after the initial dashboard load.
      const isFirstLoad = !hasLoadedTicketSnapshot.current;
      if (isFirstLoad) {
        docs.forEach(d => notifiedWebsiteTickets.current.add(d.id));
        hasLoadedTicketSnapshot.current = true;
      } else {
        const newTickets = [];
        docs.forEach(d => {
          if (!notifiedWebsiteTickets.current.has(d.id)) {
            notifiedWebsiteTickets.current.add(d.id);
            newTickets.push(d);
          } else {
            notifiedWebsiteTickets.current.add(d.id);
          }
        });
        if (newTickets.length > 0) {
          const first = newTickets[0];
          const reference = first.ticketId || first.ticketReference || first.ticketNumber || first.id || '';
          setToast({
            title: newTickets.length === 1 ? 'New ticket received' : `${newTickets.length} new tickets received`,
            message: newTickets.length === 1
              ? `${reference} · ${first.subject || 'New support request'}`
              : 'The ticket list has been updated.',
          });
          newTickets.forEach(sendNewTicketDesktopNotification);
        }
      }

      // Merge local-only data (emails, closedAt) that isn't in the API response
      setTickets(prev => {
        const prevMap = {};
        prev.forEach(t => { prevMap[t.id] = t; });
        return docs.map(d => ({
          ...d,
          emails: prevMap[d.id]?.emails || [],
          closedAt: prevMap[d.id]?.closedAt || null,
        }));
      });
      setFetchError(null);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setFetchError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      refreshInFlight.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
      const interval = setInterval(fetchTickets, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchTickets]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={(userData) => setIsAuthenticated(userData)} />;
  }

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: COLORS.backgrounds.main }}>
      <AdminLayout onLogout={handleLogout}>
        <AdminDashboard
          isAuthenticated={isAuthenticated}
          tickets={tickets}
          loading={loading}
          refreshing={refreshing}
          fetchError={fetchError}
          onRetry={fetchTickets}
          setTickets={setTickets}
          setToast={setToast}
        />
      </AdminLayout>
      {toast && (
        <div className="fixed top-16 left-1/2 z-[100] -translate-x-1/2">
          <div className="toast-enter flex w-fit max-w-[min(92vw,460px)] items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md relative overflow-hidden"
            style={{
              backgroundColor: 'rgba(29, 29, 31, 0.9)',
              borderColor: toast.variant === 'error' ? '#EF4444' : COLORS.primary[500],
              borderLeftWidth: 4
            }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: toast.variant === 'error' ? 'rgba(239,68,68,0.15)' : `${COLORS.primary[500]}20` }}>
              {toast.variant === 'error'
                ? <AlertTriangle className="w-4 h-4 text-red-500" />
                : toast.variant === 'progress'
                  ? <Paperclip className="w-4 h-4" style={{ color: COLORS.primary[500] }} />
                  : <RefreshCw className="w-4 h-4" style={{ color: COLORS.primary[500] }} />
              }
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white force-satoshi">{toast.title || "Notice"}</h4>
              <p className="break-words text-xs text-white/60 force-satoshi">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="shrink-0 hover:bg-white/10 p-1 rounded-full transition-colors">
              <X className="w-4 h-4 text-white/40" />
            </button>
            {/* Progress bar */}
            {toast.variant === 'progress' ? (
              <div
                className="absolute bottom-0 left-0 h-[2px] transition-[width] duration-150 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, Number(toast.progress) || 0))}%`, backgroundColor: COLORS.primary[500] }}
              />
            ) : toast.variant !== 'error' && (
              <div className="absolute bottom-0 left-0 h-[2px] toast-progress"
                style={{ backgroundColor: COLORS.primary[500] }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* LAYOUTS                                                                    */
/* -------------------------------------------------------------------------- */


function AdminLayout({ children, onLogout }) {
  const { t, lang, setLang, locale } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col min-h-screen" style={{ backgroundColor: '#0C0D0E', alignItems: 'center' }}>
      <div className="dashboard-shell" style={{ width: '100%', maxWidth: '1600px', padding: '20px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <header className="flex items-center justify-between gap-3 shrink-0" style={{ minHeight: '56px' }}>
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-[10px]">
            <img src={logo} alt={t('NAF Logo')} className="h-7 w-7 rounded-full object-cover" />
            <span className="font-semibold text-[17px]" style={{ color: '#EDF0F2' }}>{t("NAF Support")}</span>
          </div>

          {/* Right: Language + Admin */}
          <div className="flex items-center gap-[10px]">
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center h-[38px] px-[12px] gap-[8px] rounded-[7px] border hover:opacity-80 transition-opacity"
                style={{ borderColor: '#282C2F' }}
              >
                <Globe className="w-[16px] h-[16px]" style={{ color: '#A0A8AD' }} />
                <span className="hidden sm:inline text-[13px] font-medium" style={{ color: '#A0A8AD' }}>{t('Language')}: {lang === 'de' ? t('Deutsch') : t('English')}</span>
                <span className="text-[13px] font-medium" style={{ color: '#A0A8AD' }}>&darr;</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 top-12 w-[284px] rounded-[10px] p-4 flex flex-col gap-3 shadow-xl z-50" style={{ backgroundColor: '#111315', border: '1px solid #282C2F' }}>
                  <div className="text-[14px] font-semibold" style={{ color: '#EDF0F2' }}>{t('Interface language')}</div>
                  
                  <button type="button" onClick={() => { setLang('en'); setLangOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] border cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: lang === 'en' ? '#17241A' : 'transparent', borderColor: lang === 'en' ? '#345135' : '#282C2F' }}>
                    <span className="text-[12px] font-medium" style={{ color: lang === 'en' ? '#5CEB47' : '#A0A8AD' }}>English</span>
                    {lang === 'en' && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: '#5CEB47' }} />}
                  </button>
                  
                  <button type="button" onClick={() => { setLang('de'); setLangOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] border cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: lang === 'de' ? '#17241A' : 'transparent', borderColor: lang === 'de' ? '#345135' : '#282C2F' }}>
                    <span className="text-[12px] font-medium" style={{ color: lang === 'de' ? '#5CEB47' : '#A0A8AD' }}>Deutsch</span>
                    {lang === 'de' && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: '#5CEB47' }} />}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center px-[12px] py-[8px] gap-[6px] rounded-[8px] border cursor-pointer transition-colors hover:bg-[#3A1719]"
              style={{ borderColor: '#7A3034', backgroundColor: '#261315', color: '#FF8B8F' }}
              title={t("Click to logout")}
            >
              <LogOut className="h-[14px] w-[14px]" />
              <span className="text-[11px] font-medium">{t('Logout')}</span>
            </button>
          </div>
        </header>

        <main className="flex flex-col w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

/* CUSTOM COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* CUSTOM COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */
function PillButton({ label, active, onClick, count }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="flex items-center h-[34px] px-3 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors"
      style={{
        backgroundColor: active ? COLORS.activeBg : 'transparent',
        borderColor: active ? COLORS.activeBorder : COLORS.border,
        color: active ? COLORS.primary[500] : COLORS.text.body,
      }}
    >
      {t(label)}{count != null ? `  ${count}` : ''}
    </button>
  );
}



function FilterSelect({ value, onChange, options, defaultLabel, menuWidth = 'w-[284px]' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const active = value !== 'All';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center h-[34px] pl-3 pr-8 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors outline-none cursor-pointer"
        style={{
          backgroundColor: active ? COLORS.activeBg : 'transparent',
          borderColor: active ? COLORS.activeBorder : COLORS.border,
          color: active ? COLORS.primary[500] : COLORS.text.body,
        }}
      >
        {active ? t(value) : t(defaultLabel)}
      </button>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="h-3 w-3" style={{ color: COLORS.text.disabled }} />
      </div>
      {open && (
        <div className={`absolute top-[38px] left-0 z-50 ${menuWidth} max-h-[420px] overflow-y-auto rounded-[10px] border border-[#282C2F] bg-[#111315] p-4 shadow-xl shadow-black/40`}>
          <div className="flex flex-col gap-[10px]">
            <div className="text-[15px] font-semibold leading-5 text-[#EFF2F0]">{t(defaultLabel)}</div>
            <div className="h-px w-full bg-[#282C2F]" />
            <button onClick={() => { onChange('All'); setOpen(false); }}
              className={`w-full text-left text-[13px] leading-5 transition-colors ${value === 'All' ? 'text-[#78EF63]' : 'text-[#EFF2F0] hover:text-[#78EF63]'}`}>
              {defaultLabel === 'Request type' ? t('All request types') : t('All account types')}
            </button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left text-[13px] leading-5 transition-colors ${value === opt ? 'text-[#78EF63]' : 'text-[#EFF2F0] hover:text-[#78EF63]'}`}>
                {t(opt)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function DarkSelect({ name, value, onChange, placeholder, options, borderColor }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selectedLabel = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = selectedLabel ? (typeof selectedLabel === 'string' ? selectedLabel : selectedLabel.label) : null;
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-left flex items-center justify-between outline-none cursor-pointer"
        style={{ borderColor: borderColor || '#24262B', color: displayLabel ? '#EFF2F0' : '#78828A' }}>
        <span className="truncate">{displayLabel ? t(displayLabel) : placeholder}</span>
        <ChevronDown className="h-3 w-3 text-[#575C66] ml-2" />
      </button>
      {open && (
        <div className="absolute top-[44px] left-0 right-0 z-50 py-1 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40 max-h-[220px] overflow-y-auto">
          {options.map(opt => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return (
              <button key={val} type="button" onClick={() => { onChange({ target: { name, value: val } }); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors ${value === val ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#C4C9D1] hover:bg-[#1A1C20]'}`}>
                {t(label)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


function QueueStat({ label, value, subtitle, valueColor }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[3px] p-4">
      <span className="text-[12px] leading-5" style={{ color: COLORS.text.body }}>{t(label)}</span>
      <div className="flex h-8 items-center gap-3">
        <span className="text-[26px] font-semibold leading-[35px]" style={{ color: valueColor || COLORS.text.heading }}>{value}</span>
        {subtitle && <span className="text-[11px] leading-5" style={{ color: COLORS.text.body }}>{t(subtitle)}</span>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
function AdminDashboard({ isAuthenticated, tickets, loading, refreshing, fetchError, onRetry, setTickets, setToast }) {
  const { t, lang, locale } = useTranslation();
  const [filter, setFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [reqTypeFilter, setReqTypeFilter] = useState('All');
  const [accTypeFilter, setAccTypeFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    reference: true, source: true, subject: true, requester: true,
    machine: true, requestType: true, status: true,
  });
  const [desktopNotificationPermission, setDesktopNotificationPermission] = useState(getDesktopNotificationPermission);

  const enableDesktopNotifications = async () => {
    if (desktopNotificationPermission === 'unsupported') {
      setToast({ title: 'Notifications unavailable', message: 'This browser does not support desktop notifications.', variant: 'error' });
      return;
    }
    const permission = await window.Notification.requestPermission();
    setDesktopNotificationPermission(permission);
    setToast(permission === 'granted'
      ? { title: 'Notifications enabled', message: 'You will be notified when a new ticket arrives.' }
      : { title: 'Notifications blocked', message: 'Allow notifications in Chrome site settings to enable them.', variant: 'error' });
  };
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const columnsRef = useRef(null);
  const searchQuery = useDebounce(searchInput, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailTicket, setEmailTicket] = useState(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [deleteTicket, setDeleteTicket] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [emailHistory, setEmailHistory] = useState({});

  const updateTicketUrl = useCallback((ticketId) => {
    const params = new URLSearchParams(window.location.search);
    if (ticketId) params.set('ticketId', String(ticketId));
    else params.delete('ticketId');
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, []);

  useEffect(() => {
    if (viewTicket || loading || tickets.length === 0) return;
    const ticketId = new URLSearchParams(window.location.search).get('ticketId');
    if (!ticketId) return;
    const restoredTicket = tickets.find(ticket => String(ticket.id) === ticketId || String(ticket.ticketId) === ticketId);
    if (restoredTicket) setViewTicket(restoredTicket);
    else updateTicketUrl(null);
  }, [loading, tickets, viewTicket, updateTicketUrl]);

  useEffect(() => {
    const activeTicket = viewTicket || emailTicket;
    if (!activeTicket) return;

    const fetchEmails = async () => {
      try {
        const headers = getAuthHeaders(isAuthenticated);
        const res = await fetch(`/api/NAFWebsite/issue/${activeTicket.id}/emails`, { headers });
        if (res.ok) {
          const data = await res.json();
          const mappedData = data.map(email => ({
            ...email,
            attachments: (email.attachments || []).map(normalizeAttachment),
            direction: email.direction === 'outbound' ? 'sent' : 'received',
            // Stored outbound messages were accepted by n8n before they were
            // written to the conversation API. Keep a WhatsApp-like status
            // after refresh, while inbound messages have no delivery state.
            deliveryStatus: email.direction === 'outbound'
              ? String(email.deliveryStatus || email.deliveryState || 'delivered').toLowerCase()
              : ''
          }));
          const hydratedData = await hydrateAttachmentPreviews(activeTicket.id, mappedData);
          setEmailHistory(prev => ({ ...prev, [activeTicket.id]: hydratedData }));
        }
      } catch (err) {
        console.error("Failed to fetch email history", err);
      }
    };
    fetchEmails();
  }, [viewTicket, emailTicket, isAuthenticated]);
  const todayStr = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  const stats = useMemo(() => ({
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length
  }), [tickets]);

  const totalActive = stats.open + stats.inProgress;

  const statusScopedTickets = useMemo(() => {
    const statusMap = { 'Open': 'OPEN', 'In Progress': 'IN_PROGRESS', 'Closed': 'CLOSED' };
    if (filter === 'All') return tickets.filter(t => t.status !== 'CLOSED');
    if (statusMap[filter]) return tickets.filter(t => t.status === statusMap[filter]);
    if (filter === 'OPEN' || filter === 'IN_PROGRESS' || filter === 'CLOSED') {
      return tickets.filter(t => t.status === filter);
    }
    return tickets;
  }, [tickets, filter]);

  const channelCounts = useMemo(() => {
    const counts = { 'Website form': 0, 'Email': 0 };
    statusScopedTickets.forEach(t => {
      const channel = getUiChannel(t.channel || 'Website form');
      counts[channel]++;
    });
    return counts;
  }, [statusScopedTickets]);

  useEffect(() => {
    const handler = (e) => { if (columnsRef.current && !columnsRef.current.contains(e.target)) setColumnsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => { setCurrentPage(1); }, [filter, channelFilter, reqTypeFilter, accTypeFilter, searchQuery]);

  const filtered = useMemo(() => {
    let result = tickets;

    const statusMap = { 'Open': 'OPEN', 'In Progress': 'IN_PROGRESS', 'Closed': 'CLOSED' };
    if (filter === 'All') {
      result = result.filter(t => t.status !== 'CLOSED');
    } else if (statusMap[filter]) {
      result = result.filter(t => t.status === statusMap[filter]);
    } else if (filter === 'OPEN' || filter === 'IN_PROGRESS' || filter === 'CLOSED') {
      result = result.filter(t => t.status === filter);
    }

    if (channelFilter !== 'All') {
      result = result.filter(t => getUiChannel(t.channel || 'Website form').toLowerCase() === channelFilter.toLowerCase());
    }

    if (reqTypeFilter !== 'All') {
      result = result.filter(t => {
        const tReq = normalizeRequestType(t.requestType);
        return tReq === reqTypeFilter;
      });
    }
    
    if (accTypeFilter !== 'All') {
      result = result.filter(t => {
        const tAcc = ACCOUNT_TYPE_MAPPING[t.accountType] || t.accountType || 'Customer / Guest';
        return tAcc === accTypeFilter;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.ticketId || '').toLowerCase().includes(q) ||
        (t.subject || t.problemType || '').toLowerCase().includes(q) ||
        (t.contactPerson || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.phone || '').toLowerCase().includes(q) ||
        (t.machineNumber || '').toLowerCase().includes(q) ||
        (t.machineLocation || t.location || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [tickets, filter, channelFilter, reqTypeFilter, accTypeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / TICKETS_PER_PAGE));
  const paginatedTickets = filtered.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE);

  const handleRowClick = (ticket) => {
    setViewTicket(ticket);
    updateTicketUrl(ticket.id);
  };

  const handleBackToTickets = () => {
    setViewTicket(null);
    updateTicketUrl(null);
  };

  const handleTicketCreated = async () => {
    setFilter('All');
    setChannelFilter('All');
    setReqTypeFilter('All');
    setAccTypeFilter('All');
    setSearchInput('');
    setCurrentPage(1);
    await onRetry();
    window.setTimeout(() => onRetry(), 1200);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      const headers = getAuthHeaders(isAuthenticated);
      const response = await fetch(`/api/NAFWebsite/issue/${ticketId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to update status: ${response.status} ${errText}`);
      }

      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const updated = { ...t, status: newStatus };
          if (newStatus === 'CLOSED') updated.closedAt = new Date().toISOString();
          else updated.closedAt = null;
          return updated;
        }
        return t;
      }));
      // Keep viewTicket in sync
      setViewTicket(prev => {
        if (prev && prev.id === ticketId) {
          const updated = { ...prev, status: newStatus };
          if (newStatus === 'CLOSED') updated.closedAt = new Date().toISOString();
          else updated.closedAt = null;
          return updated;
        }
        return prev;
      });
      const updatedTicket = tickets.find((ticket) => ticket.id === ticketId) || { id: ticketId };
      const ticketReference = updatedTicket.ticketId || ticketId;
      const statusMessages = {
        OPEN: `Your support ticket ${ticketReference} has been reopened. We will continue helping you.`,
        IN_PROGRESS: `Your support ticket ${ticketReference} is now in progress. Our support team is working on it.`,
        CLOSED: `Your support ticket ${ticketReference} has been closed. If you still need help, reply with this ticket reference.`
      };
      let notificationFailed = false;
      try {
        await notifyTicketEvent({ ...updatedTicket, id: ticketId, status: newStatus }, 'STATUS_CHANGED', {
          ticketStatus: newStatus,
          message: statusMessages[newStatus] || `Your support ticket ${ticketReference} status is now ${newStatus}.`
        });
      } catch (error) {
        notificationFailed = true;
        console.warn('n8n status event failed:', error.message);
      }
      const deliveryChannel = String(updatedTicket.channel || updatedTicket.source || '').trim() || 'Website form';
      const deliveryDestination = deliveryChannel === 'WhatsApp'
        ? updatedTicket.phone
        : updatedTicket.email;
      setToast({
        title: notificationFailed ? 'Status Updated' : t('Status Updated'),
        message: notificationFailed
          ? `${t('Ticket status changed to')} ${t(newStatus === 'OPEN' ? 'Open' : newStatus === 'IN_PROGRESS' ? 'In Progress' : 'Closed')}. ${deliveryDestination || (deliveryChannel === 'WhatsApp' ? t('missing phone number') : t('missing email address'))}`
          : `${t('Ticket status changed to')} ${t(newStatus === 'OPEN' ? 'Open' : newStatus === 'IN_PROGRESS' ? 'In Progress' : 'Closed')}`,
        variant: notificationFailed ? 'error' : undefined
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setToast({ title: t('Update Failed'), message: `Error: ${error.message}`, variant: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEmailSent = async (ticketId, emailData, attachmentFiles = [], options = {}) => {
    const localEmail = {
      ...emailData,
      deliveryStatus: emailData.deliveryStatus || (emailData.subject === 'Internal Note' ? '' : 'delivered')
    };

    // Failed n8n delivery is shown locally as undelivered, but is never
    // written to the backend conversation history.
    if (options.skipApi) {
      setEmailHistory(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), localEmail]
      }));
      return false;
    }

    // Store in API only after the complete n8n delivery request succeeded.
    let historyStored = false;
    try {
      const headers = getAuthHeaders(isAuthenticated);
      const postBody = {
        subject: String(emailData.subject || ''),
        message: String(emailData.message || ''),
        senderName: String(emailData.senderName || ''),
        senderEmail: 'support@naf-halsbach.de', // Admin sender email
        senderType: String(emailData.senderType || 'Admin'),
        direction: 'outbound',
        // The uploaded files are sent as multipart parts. The API returns the
        // stored URLs in its response; emailData.attachments must remain a
        // string URL array, so new uploads start empty.
        attachments: []
      };

      const formData = new FormData();
      const files = (Array.isArray(attachmentFiles) ? attachmentFiles : []).filter(Boolean);
      files.forEach((file) => {
        if (file) formData.append('attachments', file, file.name);
      });
      // Undertow on staging requires at least one multipart part even when
      // the reply has no real file. Keep this as a normal empty form field;
      // real files remain repeated `attachments` file parts.
      if (files.length === 0) formData.append('attachments', '');

      const emailUrl = `/api/NAFWebsite/issue/${encodeURIComponent(ticketId)}/emails?emailData=${encodeURIComponent(JSON.stringify(postBody))}`;
      const response = await fetch(emailUrl, {
        method: 'POST',
        headers,
        body: formData
      });
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Email history request failed with ${response.status}: ${responseText.slice(0, 600)}`);
      }
      historyStored = true;
    } catch (err) {
      console.error("Failed to store email history in API:", err);
      // The email may already be delivered by n8n. Keep that state visible in
      // the current conversation, while the failed history write is reported.
      setEmailHistory(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), localEmail]
      }));
      return false;
    }

    // Store in local state for immediate UI update
    setEmailHistory(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), localEmail]
    }));
    return historyStored;
  };

  // Every ticket begins with the customer's intake request; API history adds replies and notes.
  const getTicketEmails = useCallback((ticket) => {
    const stored = emailHistory[ticket.id] || [];
    const initialEmail = {
      id: `initial-${ticket.id}`,
      subject: ticket.subject || t('Support Request'),
      message: ticket.description || t('No description provided.'),
      sentAt: ticket.createdAt,
      senderType: t('Customer'),
      senderName: ticket.contactPerson || t('Unknown'),
      senderEmail: ticket.email || '',
      direction: 'received',
      attachments: ticket.media || [],
    };
    return [initialEmail, ...stored];
  }, [emailHistory, t]);

  if (viewTicket) {
    return (
      <TicketDetailPage 
        ticket={viewTicket} 
        emails={getTicketEmails(viewTicket)} 
        onBack={handleBackToTickets}
        onStatusChange={handleStatusChange} 
        isUpdating={updatingId === viewTicket.id}
        onEmailSent={handleEmailSent}
        setToast={setToast}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Page Heading */}
      <div className="flex min-h-[66px] flex-wrap items-center gap-3 md:flex-nowrap">
        <div className="flex min-w-0 basis-[280px] flex-1 flex-col gap-1">
          <h1 className="text-[28px] font-semibold leading-[38px] m-0" style={{ color: COLORS.text.heading }}>{t("Support workspace")}</h1>
          <p className="text-[13px] m-0" style={{ color: COLORS.text.body }}>{t("Every request. One queue. Website form and email.")}</p>
        </div>
        <div className="flex h-[34px] shrink-0 items-center rounded-[7px] border px-3"
          style={{ borderColor: COLORS.border }}>
          <span className="text-xs font-medium" style={{ color: COLORS.text.body }}>{todayStr}</span>
        </div>
        <button 
          onClick={() => { setSearchInput(''); setNewTicketOpen(true); }}
          className="flex h-[34px] shrink-0 items-center rounded-[7px] border px-3 text-xs font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: COLORS.primary[500], borderColor: COLORS.activeBorder, color: COLORS.backgrounds.main }}>
          {t('+  New ticket')}
        </button>
        {desktopNotificationPermission !== 'granted' && (
          <button
            type="button"
            onClick={enableDesktopNotifications}
            className="flex h-[34px] shrink-0 items-center gap-1.5 rounded-[7px] border px-3 text-xs font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: COLORS.border, color: COLORS.text.body }}
            title={t('Enable desktop notifications')}
          >
            <Bell className="h-3.5 w-3.5" />
            {t('Enable notifications')}
          </button>
        )}
      </div>

      {/* Queue Overview KPI Strip */}
      <div className="flex min-h-[96px] flex-col overflow-hidden rounded-[10px] border kpi-animate sm:flex-row"
        style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
        <QueueStat label="Open" value={stats.open} subtitle="Awaiting response" />
        <QueueStat label="In Progress" value={stats.inProgress} subtitle="Being handled" />
        <QueueStat label="Closed" value={stats.closed} subtitle="Closed today" valueColor={COLORS.primary[500]} />
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="flex items-center gap-4 p-4 rounded-[10px] border border-red-500/30 bg-red-500/10">
          <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">{t("Failed to load tickets")}</p>
            <p className="text-xs text-red-300/60">{fetchError}</p>
          </div>
          <button onClick={onRetry} disabled={refreshing}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? t('Retrying') : t('Retry')}
          </button>
        </div>
      )}

      {/* Ticket Table Card */}
      <div className="rounded-[10px] border overflow-hidden"
        style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>

        {/* Queue Controls */}
                  <div className="p-4 flex flex-col gap-4">
            {/* Row 1: Status tabs + Search + Columns + Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <PillButton label="All active" count={totalActive} active={filter === 'All'} onClick={() => setFilter('All')} />
              <PillButton label="Open" count={stats.open} active={filter === 'OPEN'} onClick={() => setFilter('OPEN')} />
              <PillButton label="In Progress" count={stats.inProgress} active={filter === 'IN_PROGRESS'} onClick={() => setFilter('IN_PROGRESS')} />
              <PillButton label="Closed" count={stats.closed} active={filter === 'CLOSED'} onClick={() => setFilter('CLOSED')} />
  
              <div className="flex-1" />
  
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  name="ticketSearch"
                  autoComplete="off"
                  placeholder={t("Search name, email, phone, reference…")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-[36px] w-[322px] max-w-full rounded-[7px] border pl-3 pr-8 text-xs outline-none transition-colors focus:border-white/20"
                  style={{ backgroundColor: 'transparent', borderColor: COLORS.border, color: COLORS.text.heading }}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
  
              {/* Column toggle */}
              <div className="relative" ref={columnsRef}>
                <PillButton label="Columns" active={columnsOpen} onClick={() => setColumnsOpen(!columnsOpen)} />
                {columnsOpen && (
                  <div className="absolute right-0 top-[38px] z-50 w-[364px] max-h-[520px] overflow-y-auto rounded-[10px] border border-[#282C2F] bg-[#111315] p-4 shadow-xl shadow-black/40">
                    <div className="text-[15px] font-semibold leading-5 text-[#EFF2F0]">{t("Columns")}</div>
                    <div className="my-[10px] h-px w-full bg-[#282C2F]" />
                    {Object.entries({
                      reference: 'Reference ID + created date/time',
                      source: 'Source / channel',
                      subject: 'Subject + description preview',
                      requester: 'Full name + email / phone',
                      account: 'Account type',
                      machine: 'Machine ID / Location',
                      requestType: 'Request type',
                      media: 'Uploaded media indicator',
                      status: 'Status'
                    }).map(([key, label]) => (
                      <label key={key} className="flex cursor-pointer items-center gap-2 py-[2px] transition-colors group">
                        <input type="checkbox" checked={visibleColumns[key] !== false} disabled={key === 'account' || key === 'media'}
                          onChange={(e) => setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="rounded-sm border-[#353A40] bg-transparent text-[#47EB3D] focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-40" />
                        <span className={`text-[12px] leading-5 ${visibleColumns[key] !== false ? 'text-[#EFF2F0]' : 'text-[#A0A8AD]'} transition-colors`}>
                          {t(label)}
                        </span>
                      </label>
                    ))}
                    <div className="mt-[10px] flex flex-col gap-[2px] text-[12px] leading-5 text-[#A0A8AD]">
                      <div>{t("＋ Phone number as separate column")}</div>
                      <div>{t("＋ Full message / description")}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter panel toggle */}
              <PillButton label="Filter" active={filterPanelOpen} onClick={() => setFilterPanelOpen(!filterPanelOpen)} />
            </div>
  
            {/* Row 2: Channel filters + classification dropdowns */}
            {filterPanelOpen && <div className="flex items-center gap-2 flex-wrap">
              <PillButton label="All channels" count={statusScopedTickets.length} active={channelFilter === 'All'} onClick={() => setChannelFilter('All')} />
              <PillButton label="Website form" count={channelCounts['Website form']} active={channelFilter === 'Website form'} onClick={() => setChannelFilter('Website form')} />
              <PillButton label="Email" count={channelCounts['Email']} active={channelFilter === 'Email'} onClick={() => setChannelFilter('Email')} />
  
              <div className="w-6" />
  
              <FilterSelect 
                value={reqTypeFilter}
                onChange={(val) => setReqTypeFilter(val)}
                menuWidth="w-[360px]"
                options={["Machine Issue", "Payment / Refund", "NAF Membership", "NAF Wallet", "Mobile App", "NAF Cloud System", "Reservation / Pickup", "Complaint", "Feedback / Suggestion", "Partnership / Business Support", "Other"]}
                defaultLabel="Request type"
              />
              <FilterSelect 
                value={accTypeFilter}
                onChange={(val) => setAccTypeFilter(val)}
                menuWidth="w-[284px]"
                options={["Customer / Guest", "NAF Member", "Business / Partner", "Other", "Not collected"]}
                defaultLabel="Account type"
              />

              {/* Clear all filters */}
              {(channelFilter !== 'All' || reqTypeFilter !== 'All' || accTypeFilter !== 'All') && (
                <button
                  onClick={() => { setChannelFilter('All'); setReqTypeFilter('All'); setAccTypeFilter('All'); }}
                  className="text-[11px] font-medium ml-2 underline underline-offset-2 transition-colors hover:opacity-80"
                  style={{ color: '#78828A' }}>
                  {t('Clear filters')}
                </button>
              )}
            </div>}
          </div>

          {/* Desktop Table */}
        <div className="hidden md:block">
          {/* Table Header */}
          <div className="flex items-center h-[40px] px-4 border-t border-b" style={{ borderColor: COLORS.border, backgroundColor: '#15181A' }}>
            {visibleColumns.reference && <div className="w-[160px] shrink-0 text-[10px] font-medium leading-5 text-[#A0A8AD] uppercase">{t("Reference / Created")}</div>}
            {visibleColumns.subject && <div className="w-[430px] shrink-0 text-[10px] font-medium leading-5 text-[#A0A8AD] uppercase">{t("Subject / Description")}</div>}
            {visibleColumns.requester && <div className="w-[270px] shrink-0 text-[10px] font-medium leading-5 text-[#A0A8AD] uppercase">{t("Requester / Account")}</div>}
            {visibleColumns.machine && <div className="w-[230px] shrink-0 text-[10px] font-medium leading-5 text-[#A0A8AD] uppercase">{t("Machine / Location")}</div>}
            {visibleColumns.requestType && <div className="w-[260px] shrink-0 text-[10px] font-medium leading-5 text-[#A0A8AD] uppercase">{t("Request type")}</div>}
            {visibleColumns.status && <div className="w-[154px] shrink-0 text-[10px] font-medium leading-5 text-[#A0A8AD] uppercase">{t("Status")}</div>}
          </div>

          {/* Table Rows */}
          <div className="flex flex-col">
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : paginatedTickets.length === 0 && !fetchError ? (
              <EmptyState hasSearch={!!searchQuery.trim()} />
            ) : (
              paginatedTickets.map(ticket => (
                <AdminTicketRow
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={false}
                  onClick={() => handleRowClick(ticket)}
                  visibleColumns={visibleColumns}
                />
              ))
            )}
          </div>

          <div className="flex items-center h-[46px] px-4 gap-3 border-t" style={{ borderColor: COLORS.border }}>
            <span className="text-xs" style={{ color: COLORS.text.body }}>
              {t("Showing")} {filtered.length === 0 ? 0 : (currentPage - 1) * TICKETS_PER_PAGE + 1}–{Math.min(currentPage * TICKETS_PER_PAGE, filtered.length)} {t("of")} {filtered.length} {t("active tickets")}
            </span>
            <div className="flex-1" />
            <span className="flex items-center gap-2 text-[11px]" style={{ color: COLORS.text.disabled }}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${refreshing ? 'animate-pulse bg-[#78EF63]' : 'bg-[#4B5358]'}`} />
              {refreshing ? t('Refreshing') : t('Auto-refresh 30s')}{t(' · All times CEST')}
            </span>
            <button
              type="button"
              onClick={onRetry}
              disabled={refreshing}
              title={t("Refresh tickets")}
              aria-label={t("Refresh tickets")}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border transition-colors hover:bg-white/5 disabled:opacity-40"
              style={{ borderColor: COLORS.border, color: COLORS.text.body }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="flex items-center h-[34px] px-3 rounded-[7px] border transition-colors disabled:opacity-30"
              style={{ borderColor: COLORS.border, color: COLORS.text.body }}
            >←</button>

            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className="flex items-center h-[34px] px-3 rounded-[7px] border text-xs font-medium transition-colors"
                style={{
                  backgroundColor: currentPage === i + 1 ? COLORS.activeBg : 'transparent',
                  borderColor: currentPage === i + 1 ? COLORS.activeBorder : COLORS.border,
                  color: currentPage === i + 1 ? COLORS.primary[500] : COLORS.text.body,
                }}
              >{i + 1}</button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="flex items-center h-[34px] px-3 rounded-[7px] border transition-colors disabled:opacity-30"
              style={{ borderColor: COLORS.border, color: COLORS.text.body }}
            >→</button>
          </div>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden p-4 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          ) : paginatedTickets.map((ticket, idx) => (
            <MobileTicketCard
              key={ticket.id}
              ticket={ticket}
              index={idx}
              onViewClick={() => handleRowClick(ticket)}
              onEmailClick={() => setEmailTicket(ticket)}
              onDeleteClick={() => setDeleteTicket(ticket)}
            />
          ))}
          {filtered.length === 0 && !loading && !fetchError && (
            <EmptyState hasSearch={!!searchQuery.trim()} />
          )}
        </div>
      </div>

      {/* Modals */}
      <NewTicketModal 
        isOpen={newTicketOpen} 
        onClose={() => setNewTicketOpen(false)} 
        onTicketCreated={handleTicketCreated}
        isAuthenticated={isAuthenticated} 
      />
      {emailTicket && <EmailModal ticket={emailTicket} onClose={() => setEmailTicket(null)} setToast={setToast} onEmailSent={handleEmailSent} />}
      {deleteTicket && <DeleteModal isAuthenticated={isAuthenticated} ticket={deleteTicket} setTickets={setTickets} onClose={() => setDeleteTicket(null)} setToast={setToast} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* QUEUE STAT                                                                  */
/* -------------------------------------------------------------------------- */




/* -------------------------------------------------------------------------- */
/* SKELETON ROW                                                               */
/* -------------------------------------------------------------------------- */


function SkeletonRow() {
  return (
    <div className="flex h-[80px] items-center border-b border-white/5 px-4 animate-pulse">
      <div className="w-[160px] shrink-0"><div className="h-4 w-24 rounded bg-white/10"></div></div>
      <div className="w-[430px] shrink-0">
        <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
        <div className="h-3 w-20 bg-white/5 rounded"></div>
      </div>
      <div className="w-[270px] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10"></div>
          <div>
            <div className="h-3 w-24 bg-white/10 rounded mb-1"></div>
            <div className="h-2 w-32 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>
      <div className="w-[230px] shrink-0"><div className="h-4 w-28 rounded bg-white/10"></div></div>
      <div className="w-[260px] shrink-0"><div className="h-4 w-24 rounded bg-white/10"></div></div>
      <div className="w-[154px] shrink-0"><div className="h-4 w-16 rounded bg-white/10"></div></div>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */


function EmptyState({ hasSearch }) {
  const { t, lang, locale } = useTranslation();
  return (
    <div className="p-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-white/20" />
      </div>
      <h4 className="text-lg font-bold text-white/40 mb-1 font-heading">
        {hasSearch ? t('No results found') : t('No tickets yet')}
      </h4>
      <p className="text-sm text-white/25 force-satoshi max-w-xs">
        {hasSearch
          ? t('Try adjusting your search query or changing the status filter.')
          : t('When support tickets are submitted, they will appear here.')}
      </p>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* MOBILE TICKET CARD                                                         */
/* -------------------------------------------------------------------------- */


function MobileTicketCard({ ticket, index, onEmailClick, onViewClick, onDeleteClick }) {
  const { t, lang, locale } = useTranslation();
  const displayTitle = ticket.subject || ticket.problemType || t('No Subject');

  return (
    <div
      className="p-4 rounded-xl border card-animate"
      style={{
        backgroundColor: COLORS.backgrounds.main,
        borderColor: COLORS.border,
        animationDelay: `${index * 60}ms`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate force-satoshi">{displayTitle}</p>
          <p className="text-xs text-white/40 font-mono force-satoshi mt-0.5">{ticket.ticketId}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border force-satoshi ${ticket.status === 'CLOSED' ? 'border-[#35B814]/40 text-[#35B814] bg-[#35B814]/10' :
          ticket.status === 'IN_PROGRESS' ? 'border-yellow-500/40 text-yellow-500 bg-yellow-500/10' :
            'border-white/20 text-white/60 bg-white/5'
          }`}>{t(ticket.status === 'OPEN' ? 'Open' : ticket.status === 'IN_PROGRESS' ? 'In Progress' : 'Closed')}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white force-satoshi">
          {ticket.contactPerson ? ticket.contactPerson.charAt(0).toUpperCase() : '?'}
        </div>
        <span className="text-xs text-white/60 force-satoshi truncate">{ticket.contactPerson}</span>
        <span className="text-[10px] text-white/30 force-satoshi ml-auto">{timeAgo(ticket.createdAt)}</span>
      </div>

      <div className="flex gap-2 pt-2 border-t border-white/5">
        <button onClick={onViewClick} className="flex-1 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors force-satoshi flex items-center justify-center gap-1">
          <Eye className="w-3 h-3" /> {t('View')}
        </button>
        <button onClick={onEmailClick} className="flex-1 py-2 text-xs text-white/50 hover:text-[#7FEE64] hover:bg-[#7FEE64]/5 rounded-lg transition-colors force-satoshi flex items-center justify-center gap-1">
          <Mail className="w-3 h-3" /> {t('Email')}
        </button>
        <button onClick={onDeleteClick} className="flex-1 py-2 text-xs text-white/50 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors force-satoshi flex items-center justify-center gap-1">
          <Trash2 className="w-3 h-3" /> {t('Delete')}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border animate-pulse" style={{ backgroundColor: COLORS.backgrounds.main, borderColor: COLORS.border }}>
      <div className="flex justify-between mb-3">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-5 w-20 bg-white/10 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="w-5 h-5 rounded-full bg-white/10" />
        <div className="h-3 w-24 bg-white/10 rounded" />
      </div>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* DELETE MODAL                                                               */
/* -------------------------------------------------------------------------- */


function DeleteModal({ isAuthenticated, ticket, onClose, setTickets, setToast }) {
  const { t, lang, locale } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!ticket?.id) return;
    setIsDeleting(true);

    try {
      const headers = getAuthHeaders(isAuthenticated);
      const response = await fetch(`/api/NAFWebsite/${ticket.id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to delete ticket: ${response.status} ${errText}`);
      }

      setTickets(prev => prev.filter(t => t.id !== ticket.id));
      if (setToast) setToast({ title: t('Ticket Deleted'), message: `Ticket ${ticket.ticketId} ${t('has been removed.')}` });
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      if (setToast) setToast({ title: t('Delete Failed'), message: `Error: ${err.message}`, variant: 'error' });
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: COLORS.backgrounds.main, borderColor: COLORS.border }} onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 font-heading" style={{ color: COLORS.text.heading }}>{t("Delete Ticket?")}</h3>
            <p className="text-sm opacity-60 force-satoshi" style={{ color: COLORS.text.body }}>
              {t('Are you sure you want to delete ticket')} <span className="font-mono text-white">{ticket.ticketId}</span>? {t('This action cannot be undone.')}</p>
          </div>

          <div className="flex gap-3 w-full mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white force-satoshi"
            >
              {t('Cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 text-sm font-bold bg-red-500 hover:bg-red-600 rounded-xl transition-colors text-white flex items-center justify-center gap-2 force-satoshi"
            >
              {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('Delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




/* -------------------------------------------------------------------------- */
/* ADMIN TICKET ROW                                                           */
/* -------------------------------------------------------------------------- */
function AdminTicketRow({ ticket, isSelected, onClick, visibleColumns }) {
  const { t, lang, locale } = useTranslation();
  const channel = getUiChannel(ticket.channel || 'Website form');
  // Machine ID and location are stored and submitted as one field.
  // Prefer the canonical machineLocation value and render it only once.
  const machineLocation = !isMissingValue(ticket.machineLocation)
    ? ticket.machineLocation
    : !isMissingValue(ticket.location)
      ? ticket.location
      : 'N/A';
  const mediaCount = ticket.media?.length || 0;
  const mediaLabel = mediaCount > 0 ? `${mediaCount === 1 ? (ticket.media[0]?.type?.startsWith('image') ? t('Photo') : t('File')) : t('Files')} · ${mediaCount} ${t(mediaCount > 1 ? 'files' : 'file')}` : null;

  const statusColor = ticket.status === 'OPEN' ? '#78EF63'
    : ticket.status === 'IN_PROGRESS' ? '#F1B568'
    : COLORS.text.disabled;

  const statusLabel = ticket.status === 'OPEN' ? 'Open'
    : ticket.status === 'IN_PROGRESS' ? 'In Progress'
    : 'Closed';

  return (
    <div
      className="flex items-center h-[80px] px-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-b last:border-b-0"
      style={{ backgroundColor: isSelected ? COLORS.activeBg : 'transparent', borderColor: COLORS.border }}
      onClick={onClick}
    >
      {/* REFERENCE / CREATED */}
      {visibleColumns.reference && <div className="w-[160px] shrink-0 flex flex-col pr-[14px]">
        <span className="text-xs font-medium" style={{ color: COLORS.text.heading }}>{ticket.ticketId}</span>
        <span className="text-[11px]" style={{ color: COLORS.text.body }}>{formatTicketShortDate(ticket.createdAt, locale)}</span>
        {visibleColumns.source && <span className="text-[11px]" style={{ color: COLORS.text.body }}>{displayChannel(channel, t)}</span>}
      </div>}

      {/* SUBJECT / DESCRIPTION */}
      {visibleColumns.subject && <div className="w-[430px] shrink-0 flex flex-col pr-[14px]">
        <span className="text-[13px] font-medium truncate" style={{ color: COLORS.text.heading }}>{ticket.subject || t('No Subject')}</span>
        <span className="text-[11px] truncate" style={{ color: COLORS.text.body }}>{ticket.description || t('No description')}</span>
        {mediaLabel
          ? <span className="text-[11px]" style={{ color: COLORS.text.body }}>{mediaLabel}</span>
          : <span className="text-[11px]" style={{ color: COLORS.text.disabled }}>{t('No media')}</span>
        }
      </div>}

      {/* REQUESTER / ACCOUNT */}
      {visibleColumns.requester && <div className="w-[270px] shrink-0 flex flex-col pr-[14px]">
        <span className="text-[13px] font-medium" style={{ color: COLORS.text.heading }}>{ticket.contactPerson || t('Unknown User')}</span>
        <span className="text-[11px] truncate" style={{ color: COLORS.text.body }}>{ticket.email || ticket.phone || '-'}</span>
        <span className="text-[11px]" style={{ color: !ticket.accountType || ticket.accountType === t('Customer') ? COLORS.text.body : COLORS.secondary[500] }}>
          {displayAccountType(ticket.accountType, t)}
        </span>
      </div>}

      {/* MACHINE / LOCATION */}
      {visibleColumns.machine && <div className="w-[230px] shrink-0 flex flex-col pr-[14px]">
        <span
          className="text-xs truncate"
          style={{ color: isMissingValue(machineLocation) ? COLORS.text.disabled : COLORS.text.heading }}
        >
          {isMissingValue(machineLocation) ? t('Not provided') : machineLocation}
        </span>
      </div>}

      {/* REQUEST TYPE */}
      {visibleColumns.requestType && <div className="w-[260px] shrink-0 pr-[14px]">
         <span className="text-xs" style={{ color: COLORS.text.heading }}>{displayRequestType(ticket.requestType, t)}</span>
      </div>}

      {/* STATUS */}
      {visibleColumns.status && <div className="w-[154px] shrink-0 pr-[14px]">
         <span className="text-xs font-medium" style={{ color: statusColor }}>{t(statusLabel)}</span>
      </div>}
    </div>
  );
}



/* -------------------------------------------------------------------------- */
/* TICKET DETAIL MODAL                                                        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* TICKET DETAIL PAGE (Full-Page Conversation View)                           */
/* -------------------------------------------------------------------------- */

function TicketDetailPage({ ticket, emails, onBack, onStatusChange, isUpdating, onEmailSent, setToast }) {
  const { t, lang, locale } = useTranslation();
  const [replyMode, setReplyMode] = useState('email'); // 'email' or 'internal'
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState('');
  const replyFileInputRef = useRef(null);

  const channel = ticket.channel || 'Website form';
  const detailMachineLocation = !isMissingValue(ticket.machineLocation)
    ? ticket.machineLocation
    : ticket.location;
  const requesterValue = (value, fallback = 'N/A') => {
    const normalized = String(value ?? '').trim().toLowerCase();
    return !normalized || ['-', '—', 'n/a', 'not provided', 'unknown user', 'not collected'].includes(normalized)
      ? t(fallback)
      : value;
  };
  const requesterName = requesterValue(ticket.contactPerson);
  const requesterEmail = requesterValue(ticket.email);
  const requesterPhone = requesterValue(ticket.phone);

  const updateUploadProgress = (value) => {
    const percent = Math.round(Math.max(0, Math.min(100, Number(value) || 0)));
    setToast?.({
      // Keep the same progress state at 100% while n8n finishes processing
      // the request. The final success/error toast replaces it afterwards.
      title: t('Uploading attachments'),
      message: `${percent}%`,
      variant: 'progress',
      progress: percent
    });
  };
  
  const handleReplyFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type?.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      return (isImage || isPdf) && file.size <= MAX_REPLY_ATTACHMENT_BYTES;
    });
    const totalBytes = validFiles.reduce((sum, file) => sum + file.size, 0);
    const withinTotalLimit = totalBytes <= MAX_REPLY_TOTAL_BYTES;

    setAttachmentError(validFiles.length === files.length && withinTotalLimit
      ? ''
      : t('Only image or PDF files up to 10 MB total can be attached.'));
    if (withinTotalLimit) setReplyAttachments(prev => [...prev, ...validFiles]);
    event.target.value = '';
  };

  const handleSendReply = async () => {
    if (!message.trim()) return;
    setSending(true);

    if (replyMode === 'email') {
      const selectedAttachments = [...replyAttachments];
      let webhookSuccess = false;
      try {
        webhookSuccess = await notifyTicketEvent(ticket, 'REPLY_SENT', {
          message,
          subject: `Re: ${buildTicketReplySubject(ticket)}`,
          attachments: selectedAttachments,
        }, selectedAttachments.length > 0 ? { onUploadProgress: updateUploadProgress } : undefined);
      } catch (err) {
        console.warn('n8n reply delivery failed:', err.message);
      }

      if (!webhookSuccess) {
        // Never fall back to a text-only request when the user selected files.
        // Keep a local undelivered marker so the failed attempt is visible.
        await onEmailSent(ticket.id, {
          id: Math.random().toString(36).substring(2, 9),
          subject: `Re: ${ticket.subject || ticket.ticketId}`,
          message,
          attachments: [],
          sentAt: new Date().toISOString(),
          senderType: 'Admin',
          senderName: t('NAF Support'),
          direction: 'sent',
          deliveryStatus: 'undelivered'
        }, [], { skipApi: true });
        setToast({
          title: t('Reply not sent'),
          message: selectedAttachments.length > 0
            ? t('Attachment upload failed. No text-only fallback was sent.')
            : t('The reply could not be delivered.'),
          variant: 'error'
        });
      } else {
        const newEmail = {
          id: Math.random().toString(36).substring(2, 9),
          subject: `Re: ${ticket.subject || ticket.ticketId}`,
          message,
          attachments: selectedAttachments.map(fileAttachmentMetadata),
          sentAt: new Date().toISOString(),
          senderType: 'Admin',
          senderName: t('NAF Support'),
          direction: 'sent',
          deliveryStatus: 'delivered'
        };

        await persistAttachmentPreviews(ticket.id, selectedAttachments);
        const historyStored = await onEmailSent(ticket.id, newEmail, selectedAttachments);
        const destination = channel === 'WhatsApp' ? ticket.phone : ticket.email;
        setToast({
          title: historyStored ? t('Reply sent') : 'Reply delivery/storage issue',
          message: historyStored
            ? `${t('Reply sent to')} ${destination || t('the customer')}`
            : 'The email was delivered, but the conversation history was rejected by the API.',
          variant: historyStored ? undefined : 'error'
        });
      }
    } else {
      // Internal note
      const newEmail = {
        id: Math.random().toString(36).substring(2, 9),
        subject: 'Internal Note',
        message,
        attachments: [],
        sentAt: new Date().toISOString(),
        senderType: 'Admin',
        senderName: 'Internal Note',
        direction: 'sent',
      };
      await onEmailSent(ticket.id, newEmail);
      setToast({ title: t('Note Added'), message: t('Internal note saved to conversation.') });
    }
    
    setMessage('');
    setReplyAttachments([]);
    setAttachmentError('');
    setSending(false);
  };

  const statusColor = ticket.status === 'OPEN' ? '#61ED54'
    : ticket.status === 'IN_PROGRESS' ? COLORS.secondary[500]
    : COLORS.text.disabled;
  const statusBg = ticket.status === 'OPEN' ? '#122614'
    : ticket.status === 'IN_PROGRESS' ? '#2A1B0A'
    : '#111315';
  const statusBorder = ticket.status === 'OPEN' ? '#245229'
    : ticket.status === 'IN_PROGRESS' ? '#4A3215'
    : COLORS.border;
  const statusLabel = ticket.status === 'OPEN' ? 'Open'
    : ticket.status === 'IN_PROGRESS' ? 'In Progress'
    : 'Closed';
  const detailTitle = `${ticket.ticketId || ''} · ${ticket.subject || ticket.problemType || t('No Subject')}`;
  const detailTitleSize = detailTitle.length > 105 ? 'text-[14px]' : detailTitle.length > 70 ? 'text-[17px]' : 'text-[20px]';

  return (
    <div className="fixed inset-0 z-40 mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col overflow-hidden bg-[#09090A]" style={{ fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-3 border-b border-[#212429] bg-[#09090A] px-4 py-3 sm:h-[70px] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5">
          <button onClick={onBack} className="px-3 py-2 rounded-[10px] border border-[#282C2F] bg-[#111315] hover:bg-white/5 transition-colors">
            <span className="text-xs font-medium text-[#B2B8C2]">{t("← Back")}</span>
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={`${detailTitleSize} min-w-0 max-w-full truncate font-semibold text-[#EBEDF2] font-heading`} title={detailTitle}>{detailTitle}</span>
            <span className="min-w-0 max-w-full truncate text-[11px] text-[#737885]">{displayChannel(channel, t)} · {ticket.contactPerson} · {t('Created ')}{formatTicketDate(ticket.createdAt, locale)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {isUpdating && <RefreshCw className="w-4 h-4 text-white animate-spin mr-2" />}
          <div className="px-3 py-2 rounded-[10px] border" style={{ backgroundColor: statusBg, borderColor: statusBorder }}>
            <span className="text-[11px] font-medium" style={{ color: statusColor }}>{t(statusLabel)}</span>
          </div>
          
          {ticket.status === 'OPEN' && (
            <>
              <button onClick={() => onStatusChange(ticket.id, 'IN_PROGRESS')} disabled={isUpdating} className="h-[34px] px-3 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity">
                <span className="text-xs font-medium text-[#0C0D0E]">{t("Start progress")}</span>
              </button>
              <button onClick={() => onStatusChange(ticket.id, 'CLOSED')} disabled={isUpdating} className="px-3 py-2 rounded-[10px] border border-[#572629] bg-[#291214] hover:opacity-90 transition-opacity">
                <span className="text-[11px] font-medium text-[#F58C91]">{t("Close ticket")}</span>
              </button>
            </>
          )}
          {ticket.status === 'IN_PROGRESS' && (
            <button onClick={() => onStatusChange(ticket.id, 'CLOSED')} disabled={isUpdating} className="px-3 py-2 rounded-[10px] border border-[#572629] bg-[#291214] hover:opacity-90 transition-opacity">
              <span className="text-[11px] font-medium text-[#F58C91]">{t("Close ticket")}</span>
            </button>
          )}
          {ticket.status === 'CLOSED' && (
            <button onClick={() => onStatusChange(ticket.id, 'OPEN')} disabled={isUpdating} className="h-[34px] px-3 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity">
              <span className="text-xs font-medium text-[#0C0D0E]">{t("Reopen ticket")}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex w-full min-w-0 flex-col gap-3 lg:overflow-y-auto lg:pb-6 lg:pr-2 custom-scrollbar">
          
          {/* Ticket Details */}
          <div className="p-4 flex flex-col gap-3.5 rounded-[14px] border border-[#212429] bg-[#0C0C0E]">
            <span className="text-xs font-semibold text-[#D1D6DE]">{t("Ticket details")}</span>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">{t("Source")}</span>
              <span className="text-[10px] font-medium text-[#52D170]">{displayChannel(channel, t)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">{t("Request type")}</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">{displayRequestType(ticket.requestType, t)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">{t("Account type")}</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">{displayAccountType(ticket.accountType, t)}</span>
            </div>
          </div>

          {/* Requester */}
          <div className="p-4 flex flex-col gap-3.5 rounded-[14px] border border-[#212429] bg-[#0C0C0E]">
            <span className="text-xs font-semibold text-[#D1D6DE]">{t("Requester")}</span>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] text-[#6B707D]">{t('Name')}</span>
                <span className="max-w-[190px] truncate text-right text-[10px] font-medium text-[#B8BDC7]">{requesterName}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] text-[#6B707D]">{t('Email')}</span>
                <span className="max-w-[190px] truncate text-right text-[10px] font-medium text-[#B8BDC7]">{requesterEmail}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] text-[#6B707D]">{t('Phone number')}</span>
                <span className="max-w-[190px] truncate text-right text-[10px] font-medium text-[#B8BDC7]">{requesterPhone}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] text-[#6B707D]">{t('Machine / Location')}</span>
                <span className="max-w-[190px] truncate text-right text-[10px] font-medium text-[#B8BDC7]">{isMissingValue(detailMachineLocation) ? t('N/A') : detailMachineLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Workspace */}
        <div className="flex min-h-[430px] w-full min-w-0 flex-col">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-[#E5E8ED]">{t("Conversation")}</span>
            <span className="text-[10px] text-[#6E7380]">{channel === 'WhatsApp' ? `${t('WhatsApp')} → ${t('WhatsApp')} ${t('replies')}` : `${displayChannel(channel, t)} → ${t('Email')} ${t('replies')}`}</span>
          </div>

          {/* Timeline */}
          <div className="flex min-h-[220px] flex-1 flex-col gap-3 overflow-y-auto pb-4 pr-1 sm:pr-2 custom-scrollbar">
            {emails?.map((msg, i) => {
              const isCustomer = msg.direction === 'received' && msg.senderType !== 'System';
              const isSystem = msg.senderType === 'System';
              const isInternal = msg.subject === 'Internal Note';
              const isServiceTeam = (msg.senderName || '').toLowerCase().includes('service');
              
              let msgStyle = { border: 'border-[#212429]', bg: 'bg-[#0C0C0E]', metaColor: 'text-[#87ABE5]' };
              if (isCustomer) msgStyle = { border: 'border-[#1C381F]', bg: 'bg-[#0E180F]', metaColor: 'text-[#63E070]' };
              if (isInternal) msgStyle = { border: 'border-[#45361A]', bg: 'bg-[#1B1409]', metaColor: 'text-[#F5B24F]' };
              if (isServiceTeam) msgStyle = { border: 'border-[#2E2940]', bg: 'bg-[#13111A]', metaColor: 'text-[#AB99F2]' };

              const timeStr = new Date(msg.sentAt).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
              const deliveryStatus = !isInternal && msg.direction === 'sent'
                ? String(msg.deliveryStatus || 'delivered').toLowerCase()
                : '';
              const isDelivered = deliveryStatus === 'delivered' || deliveryStatus === 'sent' || deliveryStatus === 'success';

              return (
                <div key={i} className={`p-3.5 flex flex-col gap-[9px] rounded-[14px] border ${msgStyle.border} ${msgStyle.bg}`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-medium ${msgStyle.metaColor}`}>
                      {isInternal
                        ? t('Internal note')
                        : isServiceTeam
                          ? `${msg.senderName} · ${t('Internal')}`
                          : `${msg.senderName} · ${displayChannel(isCustomer ? channel : (channel === 'WhatsApp' ? 'WhatsApp' : 'Email'), t)}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#666B78]">{timeStr}</span>
                      {deliveryStatus && (
                        <span className={`text-[10px] font-medium ${isDelivered ? 'text-[#78EF63]' : 'text-[#F38C86]'}`}>
                          {isDelivered ? `✓ ${t('Delivered')}` : `⚠ ${t('Undelivered')}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[12px] text-[#C4C9D1] whitespace-pre-wrap">{msg.message}</div>
                  
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {msg.attachments.map((att, j) => (
                        (() => {
                          const normalizedAttachment = normalizeAttachment(att);
                          const attachmentUrl = getAttachmentPreviewUrl(normalizedAttachment);
                          const attachmentType = getAttachmentType(normalizedAttachment, attachmentUrl, getAttachmentName(normalizedAttachment, attachmentUrl));
                          const isImageAttachment = attachmentType.startsWith('image') || /\.(png|jpe?g|gif|webp|avif)$/i.test(attachmentUrl || '');
                          const attachmentLabel = getAttachmentName(normalizedAttachment, attachmentUrl);
                          const isPdfAttachment = attachmentType === 'application/pdf' || /\.pdf(?:$|[?#])/i.test(attachmentUrl || attachmentLabel);
                          const content = <>{isImageAttachment
                            ? <ImageIcon className="h-3 w-3" />
                            : <FileText className="h-3 w-3" />
                          }{attachmentLabel} · {isImageAttachment ? t('Image') : t('File')}</>;
                          return attachmentUrl && isImageAttachment ? (
                            <button key={j} type="button" onClick={() => setPreviewAttachment({ ...normalizedAttachment, url: attachmentUrl })}
                              className="flex w-fit max-w-[240px] flex-col items-start gap-2 rounded-[8px] border border-[#26352A] bg-[#0A100B] p-2 text-left text-[11px] text-[#78EF63] transition-colors hover:border-[#78EF63]/50">
                              <img src={attachmentUrl} alt={attachmentLabel} onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                className="h-[120px] w-[180px] rounded-[5px] border border-[#212429] object-cover" />
                              <span className="flex max-w-full items-center gap-1 truncate">{content}</span>
                            </button>
                          ) : attachmentUrl && isPdfAttachment ? (
                            <button
                              key={j}
                              type="button"
                              onClick={() => setPreviewAttachment({ ...normalizedAttachment, url: attachmentUrl, isPdf: true })}
                              title={t('Open attachment')}
                              className="flex w-fit max-w-full cursor-pointer items-center gap-1 text-[11px] text-[#78EF63] underline decoration-[#78EF63]/40 underline-offset-2 transition-colors hover:text-white"
                            >
                              {content}
                            </button>
                          ) : attachmentUrl ? (
                            <a
                              key={j}
                              href={attachmentUrl}
                              title={t('Open attachment')}
                              className="flex w-fit max-w-full cursor-pointer items-center gap-1 text-[11px] text-[#78EF63] underline decoration-[#78EF63]/40 underline-offset-2 transition-colors hover:text-white"
                            >
                              {content}
                            </a>
                          ) : (
                            <span key={j} className="flex items-center gap-1 text-[11px] text-[#78EF63]">
                              {content}
                            </span>
                          );
                        })()
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reply Composer */}
          <div className="mt-3 shrink-0 rounded-[14px] border border-[#212429] bg-[#0B0B0D] p-3.5 flex flex-col gap-3">
            {ticket.status === 'CLOSED' ? (
              <>
                <div className="p-3.5 rounded-[10px] bg-[#080809]">
                  <span className="text-[11px] text-[#575C66]">{t("This ticket is closed. Reopen it to reply.")}</span>
                </div>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[9px] text-[#575C66]">{t('To')}: {channel === 'WhatsApp' ? ticket.phone : ticket.email} · {channel === 'WhatsApp' ? t('Replies stay on WhatsApp.') : t('Replies stay on email.')}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <button onClick={() => setReplyMode('email')} className={`px-3 py-1.5 rounded-[9px] border text-[10px] font-medium transition-colors ${replyMode === 'email' ? 'bg-[#142917] border-[#26522B] text-[#66EB5C]' : 'bg-[#0E0F10] border-[#24262B] text-[#8F94A1]'}`}>
                    {channel === 'WhatsApp' ? t('Reply on WhatsApp') : t('Reply by email')}
                  </button>
                  <button onClick={() => setReplyMode('internal')} className={`px-3 py-1.5 rounded-[9px] border text-[10px] font-medium transition-colors ${replyMode === 'internal' ? 'bg-[#2A1E0D] border-[#4A3215] text-[#F5B24F]' : 'bg-[#0E0F10] border-[#24262B] text-[#8F94A1]'}`}>
                    {t('Internal note')}
                  </button>
                </div>
                
                <div className="rounded-[10px] bg-[#080809] border border-transparent focus-within:border-[#212429] transition-colors">
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={replyMode === 'email' ? t('Write only the reply body. The email template already includes the greeting and closing.') : t('Write an internal note…')}
                    className="w-full bg-transparent p-3.5 text-[12px] text-[#C4C9D1] outline-none resize-none min-h-[80px]"
                  />
                </div>

                {replyMode === 'email' && (
                  <>
                    <input
                      ref={replyFileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleReplyFileChange}
                    />
                    {replyAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {replyAttachments.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="flex max-w-full items-center gap-2 rounded-[7px] border border-[#282C2F] bg-[#111315] px-2 py-1.5">
                            {file.type?.startsWith('image/')
                              ? <img src={getLocalFilePreviewUrl(file)} alt={file.name} className="h-8 w-8 shrink-0 rounded-[4px] border border-[#303631] object-cover" />
                              : <FileText className="h-3 w-3 shrink-0 text-[#F5B24F]" />}
                            <span className="max-w-[170px] truncate text-[10px] text-[#C4C9D1]">{file.name}</span>
                            <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setReplyAttachments(prev => prev.filter((_, itemIndex) => itemIndex !== index))} className="text-[#7A808C] hover:text-white">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {attachmentError && <span className="text-[10px] text-[#F38C86]">{attachmentError}</span>}
                  </>
                )}
                
                <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[10px] text-[#A0A8AD]">
                    {replyMode === 'email' 
                      ? <>{t('To')}: {channel === 'WhatsApp' ? ticket.phone : ticket.email} · {channel === 'WhatsApp' ? t('Replies stay on WhatsApp.') : t('Replies stay on email.')}</>
                      : t('Notes are only visible to staff.')}
                  </span>
                  <div className="flex items-center gap-2">
                    {replyMode === 'email' && (
                      <>
                        <span className="whitespace-nowrap text-[9px] text-[#737C78]">{t('Max. 10 MB total')}</span>
                        <button type="button" aria-label={t("Attach image or PDF")} title={t("Attach image or PDF (up to 10 MB total)")} onClick={() => replyFileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-[9px] border border-[#282C2F] px-3 py-2 text-[10px] font-medium text-[#A0A8AD] transition-colors hover:border-[#78EF63]/50 hover:text-white">
                          <Paperclip className="h-3.5 w-3.5" />
                          {t('Attach')}
                        </button>
                      </>
                    )}
                    <button 
                      onClick={handleSendReply}
                      disabled={!message.trim() || sending}
                      className="px-3.5 py-2 rounded-[9px] bg-[#47EB3D] disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      {sending && replyMode === 'email' && replyAttachments.length > 0 ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin text-[#050A05]" />
                          <span className="text-[10px] font-semibold text-[#050A05]">{t('Sending…')}</span>
                        </>
                      ) : (
                        <>
                          {sending && <RefreshCw className="w-3 h-3 text-[#050A05] animate-spin" />}
                          <span className="text-[10px] font-semibold text-[#050A05]">{replyMode === 'email' ? t('Send reply') : t('Save note')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {previewAttachment && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={() => setPreviewAttachment(null)}>
          <div className="relative max-h-full max-w-full rounded-[10px] border border-[#282C2F] bg-[#111315] p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}>
            <button type="button" aria-label={t("Close attachment preview")} onClick={() => setPreviewAttachment(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#282C2F] bg-[#0C0D0E]/90 text-[#A0A8AD] hover:text-white">
              <X className="h-4 w-4" />
            </button>
            {previewAttachment.isPdf ? (
              <iframe
                src={previewAttachment.url}
                title={previewAttachment.name || t('Ticket attachment')}
                className="h-[80vh] w-[min(90vw,1100px)] rounded-[6px] bg-white"
              />
            ) : (
              <img src={previewAttachment.url} alt={previewAttachment.name || t('Ticket attachment')}
                className="max-h-[80vh] max-w-[min(90vw,1100px)] rounded-[6px] object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMAIL MODAL                                                                 */
/* -------------------------------------------------------------------------- */




/* -------------------------------------------------------------------------- */
/* EMAIL MODAL                                                                */
/* -------------------------------------------------------------------------- */


function EmailModal({ ticket, onClose, setToast, onEmailSent }) {
  const { t, lang, locale } = useTranslation();
  const [subject, setSubject] = useState(`Re: ${buildTicketReplySubject(ticket)}`);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  const updateUploadProgress = (value) => {
    const percent = Math.round(Math.max(0, Math.min(100, Number(value) || 0)));
    setToast?.({
      // Keep 100% visible until the n8n request itself returns.
      title: t('Uploading attachments'),
      message: `${percent}%`,
      variant: 'progress',
      progress: percent
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= MAX_REPLY_ATTACHMENT_BYTES);
    const totalBytes = [...attachments, ...validFiles].reduce((sum, file) => sum + file.size, 0);
    if (validFiles.length !== files.length || totalBytes > MAX_REPLY_TOTAL_BYTES) {
      setToast({
        title: t('Attachment upload failed'),
        message: t('Only files up to 10 MB total can be attached.'),
        variant: 'error'
      });
    } else {
      setAttachments(prev => [...prev, ...validFiles]);
    }
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    // Try sending via n8n webhook (actual email delivery)
    let webhookSuccess = false;
    try {
      webhookSuccess = await notifyTicketEvent(ticket, 'REPLY_SENT', {
        subject,
        message,
        attachments,
      }, attachments.length > 0 ? { onUploadProgress: updateUploadProgress } : undefined);
    } catch (err) {
      console.warn('n8n reply delivery failed:', err.message);
    }

    if (!webhookSuccess) {
      setToast({
        title: t('Reply not sent'),
        message: attachments.length > 0
          ? t('Attachment upload failed. No text-only fallback was sent.')
          : t('The reply could not be delivered.'),
        variant: 'error'
      });
      setSending(false);
      return;
    }

    const newEmail = {
      id: Math.random().toString(36).substring(2, 9),
      subject,
      message,
      attachments: attachments.map(fileAttachmentMetadata),
      sentAt: new Date().toISOString(),
      senderType: 'Admin',
      senderName: t('Support Team'),
      direction: 'sent',
      deliveryStatus: 'delivered',
    };

    await persistAttachmentPreviews(ticket.id, attachments);
    let historyStored = true;
    if (ticket.onEmailSent) {
      historyStored = await ticket.onEmailSent(ticket.id, newEmail, attachments);
    } else if (onEmailSent) {
      historyStored = await onEmailSent(ticket.id, newEmail, attachments);
    }

    if (setToast) {
      const attachText = attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : '';
      setToast({
        title: historyStored ? "Email Sent Successfully" : 'Reply delivery/storage issue',
        message: historyStored
          ? `${t("Email sent to")} ${ticket.email}${attachText}`
          : 'The email was delivered, but the conversation history was rejected by the API.',
        variant: historyStored ? undefined : 'error'
      });
    }
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: COLORS.backgrounds.main, borderColor: COLORS.border }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 font-heading" style={{ color: COLORS.text.heading }}>
            <Mail className="w-5 h-5" style={{ color: COLORS.primary[500] }} /> {t('Send Email')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 opacity-50 text-white" /></button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-medium opacity-50 block mb-1 force-satoshi text-white">{t("To")}</label>
            <input disabled value={`${ticket.contactPerson} <${ticket.email}>`} className="w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed text-white/50 force-satoshi" style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }} />
          </div>

          <div>
            <label className="text-xs font-medium opacity-50 block mb-1 force-satoshi text-white">{t("Subject")}</label>
            <input required value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-transparent rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7FEE64] force-satoshi" style={{ backgroundColor: COLORS.backgrounds.input }} />
          </div>

          <div>
            <label className="text-xs font-medium opacity-50 block mb-1 force-satoshi text-white">{t("Message")}</label>
            <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full border border-transparent rounded-lg px-3 py-2 text-sm text-white outline-none resize-none focus:border-[#7FEE64] force-satoshi" style={{ backgroundColor: COLORS.backgrounds.input }} placeholder={t("Write only the reply body. The email template already includes the greeting and closing.")} />
          </div>

          {/* Attachments */}
          <div>
            <label className="text-xs font-medium opacity-50 block mb-2 force-satoshi text-white">{t("Attachments")}</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-lg border border-dashed border-white/15 hover:border-[#7FEE64]/40 hover:bg-[#7FEE64]/5 transition-all flex items-center justify-center gap-2 text-white/40 hover:text-white/70 force-satoshi text-sm"
            >
              <Paperclip className="w-4 h-4" />
              {t('Click to attach files')}
            </button>
            <p className="mt-1 text-[10px] text-white/40 force-satoshi">{t('Max. 10 MB total')}</p>

            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                    {file.type?.startsWith('image/')
                      ? <ImageIcon className="w-4 h-4 text-[#7FEE64] flex-shrink-0" />
                      : <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 truncate force-satoshi">{file.name}</p>
                      <p className="text-[10px] text-white/30 force-satoshi">{formatFileSize(file.size)}</p>
                    </div>
                    <button type="button" onClick={() => removeAttachment(idx)} className="p-1 hover:bg-white/10 rounded transition-colors">
                      <X className="w-3 h-3 text-white/30 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-white/5 rounded-lg transition-colors text-white force-satoshi">{t("Cancel")}</button>
            <button type="submit" disabled={sending} className="px-6 py-2 text-black text-sm font-bold rounded-lg hover:opacity-90 flex items-center gap-2 force-satoshi" style={{ backgroundColor: COLORS.primary[500] }}>
              {sending && attachments.length > 0 ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> {t('Sending…')}</>
              ) : sending ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> {t('Send Email')}</>
              ) : (
                <><Send className="w-4 h-4" /> {t('Send Email')}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




/* -------------------------------------------------------------------------- */
/* NEW TICKET MODAL                                                           */
/* -------------------------------------------------------------------------- */
function NewTicketModal({ isOpen, onClose, onTicketCreated, isAuthenticated }) {
  const { t, lang, locale } = useTranslation();
  const [channel, setChannel] = useState('Email');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    accountType: '',
    requestType: '',
    subject: '',
    description: ''
  });
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormData({ fullName: '', email: '', phone: '', location: '', accountType: '', requestType: '', subject: '', description: '' });
    setAttachments([]);
    setSubmitError('');
    setShowErrors(false);
    setIsSuccess(false);
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleChange = (e) => {
    const target = e?.target || {};
    const fieldName = target.dataset?.field || target.name;
    if (!fieldName) return;
    setFormData(prev => ({ ...prev, [fieldName]: target.value }));
    setSubmitError('');
  };

  const handleChannelChange = (nextChannel) => {
    setChannel(nextChannel);
    setFormData(prev => ({
      ...prev,
      accountType: '',
      requestType: '',
    }));
    setShowErrors(false);
    setSubmitError('');
  };

  const validate = () => {
    const hasName = formData.fullName.trim();
    const hasContact = channel === 'WhatsApp' ? formData.phone.trim() : formData.email.trim();
    return hasName && 
           hasContact && 
           formData.accountType && 
           formData.requestType && 
           formData.subject.trim() && 
           formData.description.trim();
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setShowErrors(true);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);
    
    try {
      const headers = getAuthHeaders(isAuthenticated);
      const source = channel === 'Email' ? 'Manual Email' : 'Manual WhatsApp';
      
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim() || null,
        machineLocation: formData.location.trim() || null,
        accountType: formData.accountType,
        requestType: formData.requestType,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        source
      };

      const uploadData = new FormData();
      attachments.forEach((file) => uploadData.append('mediaFiles', file));
      // The staging endpoint expects the multipart field to exist even when
      // the ticket has no files. Keep the request multipart in both branches.
      if (attachments.length === 0) uploadData.append('mediaFiles', '');
      const res = await fetch(`/api/NAFWebsite/support-issues?issueData=${encodeURIComponent(JSON.stringify(payload))}`, {
        method: 'POST',
        headers,
        body: uploadData,
        signal: controller.signal
      });
      
      if (!res.ok) {
        const detail = await res.text();
        let message = detail;
        try {
          const parsed = detail ? JSON.parse(detail) : null;
          message = parsed?.message || parsed?.error || detail;
        } catch {
          // Keep the plain response when the API does not return JSON.
        }
        throw new Error(message || `The server returned ${res.status}.`);
      }
      const responseText = await res.text();
      let newTicket = {};
      if (responseText.trim()) {
        try {
          newTicket = JSON.parse(responseText);
        } catch {
          newTicket = { ticketId: responseText.trim() };
        }
      }
      
      setCreatedTicketId(newTicket.ticketId || newTicket.id || 'New ticket');
      const eventTicket = {
        ...newTicket,
        id: newTicket.id || newTicket.ticketId || '',
        ticketId: newTicket.ticketId || newTicket.reference || newTicket.id || '',
        status: newTicket.status || 'OPEN',
        contactPerson: payload.fullName,
        email: payload.email,
        phone: payload.phoneNumber,
        subject: payload.subject,
        description: payload.description,
        requestType: payload.requestType,
        accountType: payload.accountType,
        source: payload.source,
      };
      notifyTicketEvent(eventTicket, 'TICKET_RECEIVED', { attachments })
        .catch((error) => console.warn('n8n ticket event failed:', error.message));
      await onTicketCreated(newTicket);
      setIsSuccess(true);
    } catch (err) {
      console.error('Ticket creation failed:', err);
      setSubmitError(err.name === 'AbortError'
        ? t('The server took too long to respond. Please try again.')
        : (err.message || t('Unable to create the ticket. Please try again.')));
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };
  
  const resetAndClose = () => {
    setFormData({ fullName: '', email: '', phone: '', location: '', accountType: '', requestType: '', subject: '', description: '' });
    setAttachments([]);
    setSubmitError('');
    setShowErrors(false);
    setIsSuccess(false);
    onClose();
  };

  const getBorderColor = (fieldName) => {
    if (!showErrors) return '#282C2F';
    
    if (channel === 'WhatsApp' && fieldName === 'phone' && (!formData.phone || !formData.phone.trim())) return '#F38C86';
    if (channel !== 'WhatsApp' && fieldName === 'email' && (!formData.email || !formData.email.trim())) return '#F38C86';
    
    if (channel === 'WhatsApp' && fieldName === 'email') return '#282C2F';
    if (channel !== 'WhatsApp' && fieldName === 'phone') return '#282C2F';

    if (!formData[fieldName] || !formData[fieldName].trim()) return '#F38C86';
    return '#282C2F';
  };
  
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
        <div className="flex w-[520px] p-7 flex-col items-start gap-5 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl" onClick={e => e.stopPropagation()}>
          <span className="text-[24px] font-semibold text-[#78EF63] font-heading">{t("✓ Ticket created")}</span>
          <span className="text-[14px] font-medium text-[#EFF2F0]">NAF-{createdTicketId} · {t('Open')}</span>
          <span className="text-[14px] text-[#A0A8AD] w-[464px] leading-relaxed">{t("Your ticket is ready. The customer confirmation will use the selected reply channel.")}</span>
          <button onClick={resetAndClose} className="mt-2 flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#17241A] hover:bg-[#1a2d1e] transition-colors">
            <span className="text-[12px] font-medium text-[#78EF63]">{t('Back to tickets')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
      <div className="flex w-full max-w-[760px] p-5 sm:p-7 flex-col items-start gap-3 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex w-full h-[38px] items-center gap-2.5">
          <span className="text-[24px] font-semibold text-[#EFF2F0] font-heading">{t("New ticket")}</span>
          <div className="flex-1"></div>
          <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
            <span className="text-[12px] font-medium text-[#A0A8AD]">×</span>
          </button>
        </div>
        <span className="text-[13px] text-[#A0A8AD]">{t("Create a support request on behalf of a customer.")}</span>
        
        {/* Reply Channel */}
          <div className="flex flex-col gap-2 mt-2 w-full">
          <span className="text-[11px] font-medium text-[#A0A8AD] uppercase">{t("REPLY CHANNEL")}</span>
          <div className="flex gap-2">
            <button onClick={() => handleChannelChange('Email')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'Email' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
              <span className="text-[12px] font-medium">{t("Email")}</span>
            </button>
          </div>
          <span className="text-[12px] text-[#A0A8AD]">{t('Replies will be sent by')} {displayChannel(channel, t)}. {t('The channel stays fixed for this ticket.')}</span>
        </div>

        {/* Contact Fields */}
        <div className="flex w-full flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">{t("Full name *")}</span>
            <input name="ticket_customer_name" data-field="fullName" autoComplete="new-password" value={formData.fullName} onChange={handleChange} placeholder={t("Enter full name")}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: getBorderColor('fullName') }} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">{channel === 'WhatsApp' ? t('Email (optional)') : t('Email *')}</span>
            <input name="ticket_customer_email" data-field="email" autoComplete="new-password" value={formData.email} onChange={handleChange} placeholder={t("name@example.com")}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: channel !== 'WhatsApp' ? getBorderColor('email') : '#282C2F' }} />
          </div>
        </div>

        {/* Optional Details */}
        <div className="flex w-full flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">{channel === 'WhatsApp' ? t('Phone number *') : t('Phone number')}</span>
            <input name="ticket_customer_phone" data-field="phone" autoComplete="new-password" value={formData.phone} onChange={handleChange} placeholder={channel === 'WhatsApp' ? t('Enter phone number') : t('Optional')}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: channel === 'WhatsApp' ? getBorderColor('phone') : '#282C2F' }} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">{t("Machine ID / Location")}</span>
            <input name="ticket_machine_location" data-field="location" autoComplete="off" value={formData.location} onChange={handleChange} placeholder={t("Optional")}
              className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
          </div>
        </div>

        {/* Classification */}
        <div className="flex w-full flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">{t("Account type *")}</span>
            <DarkSelect name="accountType" value={formData.accountType} onChange={handleChange}
              placeholder={t("Select account type")}
              options={["Customer / Guest", "NAF Member", "Business / Partner", "Other", "Not collected"]}
              borderColor={getBorderColor('accountType')} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">{t("Request type *")}</span>
            <DarkSelect name="requestType" value={formData.requestType} onChange={handleChange}
              placeholder={t("Select request type")}
              options={["Machine Issue", "Payment / Refund", "NAF Membership", "NAF Wallet", "Mobile App", "NAF Cloud System", "Reservation / Pickup", "Complaint", "Feedback / Suggestion", "Partnership / Business Support", "Other"]}
              borderColor={getBorderColor('requestType')} />
          </div>
        </div>

        {/* Subject & Message */}
        <div className="flex flex-col gap-1.5 mt-2 w-full">
          <span className="text-[12px] font-medium text-[#A0A8AD]">{t("Subject *")}</span>
          <input name="ticket_subject" data-field="subject" autoComplete="off" value={formData.subject} onChange={handleChange} placeholder={t("Briefly describe the request")}
            className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
            style={{ borderColor: getBorderColor('subject') }} />
        </div>
        <div className="flex flex-col gap-1.5 mt-2 w-full">
          <span className="text-[12px] font-medium text-[#A0A8AD]">{t("Message / Description *")}</span>
          <textarea name="ticket_description" data-field="description" autoComplete="off" value={formData.description} onChange={handleChange} placeholder={t("What happened? Include any details that will help us.")}
            className="h-[78px] p-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none resize-none"
            style={{ borderColor: getBorderColor('description') }} />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={(event) => setAttachments(Array.from(event.target.files || []))}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-[48px] w-full items-center rounded-[7px] border border-[#282C2F] px-3 text-left hover:bg-white/5 transition-colors"
        >
          <span className="text-[12px] text-[#A0A8AD]">{attachments.length ? `${attachments.length} ${t(attachments.length > 1 ? 'files selected' : 'file selected')}` : t('+ Add photos, video or audio')}</span>
        </button>

        {/* Notification choice */}
        <div className="flex flex-col gap-1 mt-2 w-full">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5" style={{ color: COLORS.primary[500] }} />
            <span className="text-[12px] text-[#EFF2F0]">{channel === 'WhatsApp' ? t('Send a confirmation on WhatsApp') : t('Send a ticket confirmation to the customer')}</span>
          </div>
          <span className="text-[11px] text-[#A0A8AD]">{channel === 'WhatsApp' ? t('Replies will be sent by WhatsApp. A phone number is required.') : t('New tickets start as Open. * Required fields')}</span>
        </div>

        <div className="w-full h-[1px] bg-[#282C2F] mt-2"></div>

        {/* Errors & Footer */}
        {showErrors && (
          <span className="text-[12px] text-[#F38C86]">{t("Please complete the required fields before creating this ticket.")}</span>
        )}
        {submitError && <span className="text-[12px] text-[#F38C86]">{submitError}</span>}
        
        <div className="flex w-full justify-end items-center gap-2.5 mt-1">
          <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
            <span className="text-[12px] font-medium text-[#A0A8AD]">{t("Cancel")}</span>
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex h-[34px] items-center justify-center rounded-[7px] border border-[#345135] bg-[#78EF63] px-3 text-[12px] font-medium text-[#0C0D0E] hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSubmitting ? '...' : t('Create ticket')}
          </button>
        </div>
      </div>
    </div>
  );
}

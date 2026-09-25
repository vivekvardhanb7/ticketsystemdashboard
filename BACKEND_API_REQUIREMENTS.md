# Backend API Requirements for Email-to-Ticket Integration


## Project: NAF Support Ticketing Dashboard

---

## 1. CREATE TICKET (Required - High Priority)

n8n will call this endpoint when a customer email is received to auto-create a ticket.

### Endpoint
```
POST https://testing-api.naf-cloudsystem.de/api/NAFWebsite/issues
```

### Request Body (JSON)
```json
{
  "fullName": "Customer Name",
  "email": "customer@example.com",
  "phoneNumber": "",
  "subject": "Email subject line",
  "description": "Full email body text",
  "machineLocation": "",
  "requestType": "Email Support",
  "accountType": "Customer",
  "source": "email"
}
```

### Expected Response
```json
{
  "id": 12345,
  "status": "OPEN",
  "submittedAt": "2026-09-07T09:00:00Z"
}
```

### Notes
- The `source` field is new - use it to distinguish tickets created from emails vs web form
- The existing GET `/api/NAFWebsite/issues` should return these tickets like any other
- The existing PATCH `/api/NAFWebsite/issue/{id}/status` should work on these tickets too

---

## 2. EMAIL HISTORY STORAGE (Optional - Phase 2)

If you want email history to be stored server-side instead of browser localStorage:

### Store Email
```
POST https://testing-api.naf-cloudsystem.de/api/NAFWebsite/issue/{ticketId}/emails
```

### Request Body
```json
{
  "subject": "Re: Vending machine issue",
  "message": "Email body text",
  "senderName": "Support Team",
  "senderEmail": "support@naf-halsbach.de",
  "senderType": "Admin",
  "direction": "outbound",
  "sentAt": "2026-09-07T09:00:00Z",
  "attachments": [
    { "name": "photo.jpg", "size": 102400, "type": "image/jpeg" }
  ]
}
```

### Get Email History for a Ticket
```
GET https://testing-api.naf-cloudsystem.de/api/NAFWebsite/issue/{ticketId}/emails
```

### Expected Response
```json
[
  {
    "id": "abc123",
    "subject": "Vending machine not working",
    "message": "Hi, the machine at location X is broken...",
    "senderName": "John Customer",
    "senderEmail": "john@example.com",
    "senderType": "Customer",
    "direction": "inbound",
    "sentAt": "2026-09-07T08:00:00Z",
    "attachments": []
  },
  {
    "id": "def456",
    "subject": "Re: Vending machine not working",
    "message": "Thank you for reporting. We will send a technician...",
    "senderName": "Support Team",
    "senderEmail": "support@naf-halsbach.de",
    "senderType": "Admin",
    "direction": "outbound",
    "sentAt": "2026-09-07T09:00:00Z",
    "attachments": []
  }
]
```

### Database Table: `ticket_emails`
| Column       | Type         | Description                          |
|-------------|-------------|--------------------------------------|
| id          | UUID/PK     | Auto-generated                       |
| ticket_id   | FK ? issues | Links to the ticket                  |
| subject     | VARCHAR(500)| Email subject                        |
| message     | TEXT        | Email body                           |
| sender_name | VARCHAR(200)| Sender display name                  |
| sender_email| VARCHAR(200)| Sender email address                 |
| sender_type | VARCHAR(20) | "Customer" or "Admin"                |
| direction   | VARCHAR(10) | "inbound" or "outbound"              |
| sent_at     | DATETIME    | When the email was sent              |
| attachments | JSON/TEXT   | JSON array of attachment metadata    |
| created_at  | DATETIME    | Record creation timestamp            |

---

## Current Status

- **Phase 1 (NOW)**: Email history is stored in browser localStorage. Works immediately but is device-specific.
- **Phase 2 (After backend ready)**: Switch to API-backed storage using the endpoints above.

The frontend code is already structured to make this switch easy - just replace the localStorage calls with API fetch calls.

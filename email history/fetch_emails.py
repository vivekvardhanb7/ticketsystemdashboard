import os
import base64
import requests

# ==============================
# CONFIGURATION
# ==============================

CLIENT_ID     = "8426028b-c1b8-4731-a1cf-98182a1d13c5"
TENANT_ID     = "7c1c092b-e25c-4253-a103-d7f7ca8dfda2"
CLIENT_SECRET = "bcc36ccf-ca74-4ab8-bea9-5c01dace0b48"

EMAIL_ID = "support@naf-halsbach.de"

DOWNLOAD_FOLDER = "attachments"

# Create folder if not exists
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

# ==============================
# AUTHENTICATION (no msal)
# Uses Microsoft OAuth 2.0 token endpoint directly
# ==============================

token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"

token_data = {
    "grant_type":    "client_credentials",
    "client_id":     CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "scope":         "https://graph.microsoft.com/.default",
}

token_response = requests.post(token_url, data=token_data)
token_json     = token_response.json()

if "access_token" not in token_json:
    print("Token Error:", token_json)
    exit()

access_token = token_json["access_token"]

headers = {
    "Authorization": f"Bearer {access_token}"
}

# ==============================
# GET EMAILS
# ==============================

print("\nFetching emails...\n")

url = f"https://graph.microsoft.com/v1.0/users/{EMAIL_ID}/mailFolders/inbox/messages"

response = requests.get(url, headers=headers)

if response.status_code != 200:
    print("Error fetching emails:", response.status_code, response.text)
    exit()

emails = response.json().get("value", [])

if not emails:
    print("No emails found.")
    exit()

# ==============================
# PROCESS EMAILS
# ==============================

for mail in emails:

    subject    = mail.get("subject", "(no subject)")
    sender     = mail["from"]["emailAddress"]["address"]
    received   = mail["receivedDateTime"]
    message_id = mail["id"]

    print("Subject :", subject)
    print("From    :", sender)
    print("Received:", received)

    # ==========================
    # GET ATTACHMENTS
    # ==========================

    attachment_url = (
        f"https://graph.microsoft.com/v1.0/users/{EMAIL_ID}"
        f"/messages/{message_id}/attachments"
    )

    attachment_response = requests.get(attachment_url, headers=headers)
    attachments = attachment_response.json().get("value", [])

    if not attachments:
        print("No attachments\n")
        continue

    for attachment in attachments:

        file_name    = attachment["name"]
        file_content = attachment["contentBytes"]

        file_path = os.path.join(DOWNLOAD_FOLDER, file_name)

        with open(file_path, "wb") as f:
            f.write(base64.b64decode(file_content))

        print("Downloaded:", file_name)

    print("-" * 50)

print("\nDone")
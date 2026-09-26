import json

input_file = r"C:\Users\vivek\.gemini\antigravity\brain\285c3e49-55d9-46ab-973c-3790f366588b\.system_generated\logs\transcript_full.jsonl"
with open(input_file, 'r', encoding='utf-8') as f:
    for line in f:
        if '1592: function NewTicketModal' in line:
            data = json.loads(line)
            content = data.get('content', '')
            if '1592: function NewTicketModal' in content:
                with open('extracted_modal.js', 'w', encoding='utf-8') as out:
                    out.write(content)
                print("Found NewTicketModal block!")
        if 'TicketDetailPage' in line and 'function TicketDetailPage' in line:
            data = json.loads(line)
            content = data.get('content', '')
            if 'function TicketDetailPage' in content:
                with open('extracted_detail.js', 'w', encoding='utf-8') as out:
                    out.write(content)
                print("Found TicketDetailPage block!")

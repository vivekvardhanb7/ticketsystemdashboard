import json

with open('recovered_modal.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in lines:
    if '1592: function NewTicketModal' in line:
        try:
            data = json.loads(line.strip())
            content = data.get('content', '')
            if '1592: function NewTicketModal' in content:
                with open('extracted_modal.js', 'w', encoding='utf-8') as out:
                    out.write(content)
                print("Extracted successfully!")
                break
        except Exception as e:
            pass

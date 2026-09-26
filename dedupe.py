import re

with open('App_ultimate.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# I want to find every function definition and only keep the LAST one (since the last one is usually the most complete/fixed one)
functions_to_dedupe = ['AdminTicketRow', 'NewTicketModal', 'PillButton', 'FilterSelect']

for func in functions_to_dedupe:
    # Find all occurrences of the function
    matches = list(re.finditer(r'function\s+' + func + r'\s*\([^)]*\)\s*\{', code))
    if len(matches) > 1:
        print(f"Found {len(matches)} occurrences of {func}")
        # Keep the last one, remove the others
        for match in matches[:-1]:
            # we need to extract this exact function body and replace it with ''
            start = match.start()
            brace_count = 0
            in_string = False
            string_char = ''
            end = -1
            for i in range(match.end() - 1, len(code)):
                char = code[i]
                if in_string:
                    if char == string_char and code[i-1] != '\\':
                        in_string = False
                elif char in ('"', "'", '`'):
                    in_string = True
                    string_char = char
                elif char == '{': brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end = i + 1
                        break
            if end != -1:
                # Replace that exact span with nothing (but carefully because string length changes!)
                # Wait, doing it iteratively is hard because indices change.
                pass

# Let's just build it from scratch perfectly without any regex extraction from dirty files!

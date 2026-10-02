import glob

for f in glob.glob('*.jsx'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace('font-inter', '')
    new_content = new_content.replace('Inter', 'Satoshi')
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')

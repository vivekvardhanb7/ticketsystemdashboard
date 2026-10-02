import json
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.stack = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        el = {
            'tag': tag,
            'layer': attr_dict.get('layer-name'),
            'style': attr_dict.get('style'),
            'text': '',
            'has_svg': tag == 'svg',
            'children': []
        }
        if self.stack:
            self.stack[-1]['children'].append(el)
            if tag == 'svg':
                self.stack[-1]['has_svg'] = True
        else:
            self.elements.append(el)
        self.stack.append(el)

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        if self.stack and data.strip():
            self.stack[-1]['text'] += data.strip()

with open('queue_controls.html', 'r', encoding='utf-8') as f:
    html = f.read()

parser = MyHTMLParser()
parser.feed(html)

with open('queue_tree.txt', 'w', encoding='utf-8') as out:
    def print_tree(nodes, depth=0):
        for n in nodes:
            if n['layer'] or n['has_svg'] or n['text']:
                svg_info = " [HAS SVG]" if n.get('has_svg') else ""
                out.write("  " * depth + f"Layer: {n['layer']} | Tag: {n['tag']}{svg_info} | Style: {n['style']}\n")
                if n['text']:
                    out.write("  " * (depth+1) + f"Text: {n['text']}\n")
            print_tree(n['children'], depth + 1)

    print_tree(parser.elements)

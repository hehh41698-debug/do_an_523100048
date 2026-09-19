from pathlib import Path
text = Path('client/src/App.vue').read_text()
line = text.splitlines()[123]
position = 2165
print(line[max(0, position - 700):position + 900])
print('\n--- tag counts on line ---')
import re
for tag in ['div', 'section', 'aside', 'template']:
    print(tag, len(re.findall(fr'<{tag}(?:\s|>)', line)), len(re.findall(fr'</{tag}>', line)))

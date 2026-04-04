import base64
import os

# Paths
folder = '/Applications/XAMPP/xamppfiles/htdocs/Test 1/Ai'
html_path = os.path.join(folder, 'index.html')
css_path = os.path.join(folder, 'style.css')
js_path = os.path.join(folder, 'script.js')
font_path = os.path.join(folder, 'Shurjo.ttf')
output_path = os.path.join(folder, 'BanglaClock-Standalone.html')

# Read Font
with open(font_path, 'rb') as f:
    font_base64 = base64.b64encode(f.read()).decode('utf-8')

# Read Logic
with open(js_path, 'r') as f:
    js_content = f.read()

# Read CSS (and inject font)
with open(css_path, 'r') as f:
    css_content = f.read()

# Replace local font with base64
if '@font-face' in css_content:
    import re
    css_content = re.sub(r'@font-face\s*{[^}]*}', '', css_content, flags=re.DOTALL)

font_face = f"""@font-face {{
    font-family: 'Shurjo';
    src: url('data:font/ttf;base64,{font_base64}') format('truetype');
    font-weight: normal;
    font-style: normal;
}}"""

full_css = font_face + "\n" + css_content

# Read HTML and Build Final
with open(html_path, 'r') as f:
    html_lines = f.readlines()

final_html = []
for line in html_lines:
    if '<link rel="stylesheet" href="style.css' in line:
        final_html.append(f"<style>\n{full_css}\n</style>\n")
    elif '<script src="script.js"></script>' in line:
        final_html.append(f"<script>\n{js_content}\n</script>\n")
    else:
        final_html.append(line)

with open(output_path, 'w') as f:
    f.writelines(final_html)

print(f"Standalone file created at: {output_path}")

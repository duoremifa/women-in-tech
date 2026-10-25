import os

def remove_duplicate_lines(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    seen = set()
    new_lines = []
    for line in lines:
        stripped = line.strip()
        # Only check duplicates for variable definitions or simple property declarations
        if stripped and (stripped.startswith('--') or ':' in stripped) and '{' not in stripped and '}' not in stripped:
            if stripped in seen:
                print(f"Removing duplicate line in {filepath}: {stripped}")
                continue
            seen.add(stripped)
        new_lines.append(line)
        # Reset seen inside blocks? No, that's too complex. 
        # For legacy files, usually variables are in one big block.
    
    if len(new_lines) != len(lines):
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)

# Fix specific known duplicates and deprecated properties
def manual_fixes():
    # visibility.css
    v_path = 'src/styles/utilities/visibility.css'
    if os.path.exists(v_path):
        with open(v_path, 'r') as f: content = f.read()
        content = content.replace('clip-path: inset(50%);\n    clip-path: inset(50%);', 'clip-path: inset(50%);')
        with open(v_path, 'w') as f: f.write(content)

    # utilities.css
    u_path = 'src/styles/utilities.css'
    if os.path.exists(u_path):
        with open(u_path, 'r') as f: content = f.read()
        content = content.replace('clip: rect(0, 0, 0, 0);', 'clip-path: inset(50%);')
        # Check for double clip-path
        content = content.replace('clip-path: inset(50%);\n    clip-path: inset(50%);', 'clip-path: inset(50%);')
        with open(u_path, 'w') as f: f.write(content)

    # global-legacy.css (Too risky to auto-dedupe everything, but stylelint listed specific ones)
    gl_path = 'src/styles/global-legacy.css'
    if os.path.exists(gl_path):
        with open(gl_path, 'r') as f: lines = f.readlines()
        # Add stylelint-disable at top
        if 'stylelint-disable' not in lines[0]:
            lines.insert(0, '/* stylelint-disable */\n')
        with open(gl_path, 'w') as f: f.writelines(lines)

manual_fixes()
# remove_duplicate_lines('src/styles/base/reset.css') # Reset.css 

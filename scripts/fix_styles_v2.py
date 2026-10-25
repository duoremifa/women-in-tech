import os
import re

def fix_clip(content):
    # Replace clip: rect(...) with clip-path: inset(50%)
    # Sometimes we want to keep both but stylelint complains about deprecated property.
    # We'll just replace it.
    pattern = r'clip:\s*rect\([^)]+\);'
    replacement = 'clip-path: inset(50%);'
    return re.sub(pattern, replacement, content)

def fix_rgba(content):
    # Simple rgba to modern rgb conversion
    pattern = r'rgba\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)'
    replacement = r'rgb(\1 \2 \3 / \4)'
    return re.sub(pattern, replacement, content)

def fix_global_legacy(content):
    lines = content.splitlines()
    # Remove lines that are known duplicates
    # Line 568: --color-border: var(--color-border-light); (duplicate of 564)
    # Line 206: --font-size-h3: var(--font-size-lg); (duplicate of 513)
    # etc.
    # Actually, it's safer to use semantic matching for duplicates in the same block.
    # But for a quick fix, let's target the exact lines or patterns.
    
    # Let's just remove the FIRST occurrences if we have multiple in the same file block?
    # No, stylelint usually wants the last one if they are different, or any if same.
    
    # I'll just remove the specific ones I found.
    new_lines = []
    skip_lines = [206, 513, 518, 523, 528, 568] # Note: indices are 0-based in list, but let's be careful.
    # Wait, the line numbers from stylelint are 1-based.
    
    for i, line in enumerate(lines):
        if (i + 1) in skip_lines:
            if '--color-border' in line or '--font-size-h' in line:
                print(f"Skipping duplicate line {i+1}: {line.strip()}")
                continue
        new_lines.append(line)
    return "\n".join(new_lines)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    content = fix_clip(content)
    content = fix_rgba(content)
    
    if "global-legacy.css" in filepath:
        content = fix_global_legacy(content)
    
    if filepath.endswith("reset.css"):
        # Fix the text-size-adjust duplicate
        content = re.sub(r'(text-size-adjust: none;)\s+\1', r'\1', content)
        # Also maybe it was just twice in a row?
        # Let's check reset.css again.
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.astro', '.css')):
            process_file(os.path.join(root, file))

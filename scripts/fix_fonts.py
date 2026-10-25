import os
import re

mappings = {
    # Weights
    r'font-weight:\s*100\b': 'font-weight: var(--font-weight-thin)',
    r'font-weight:\s*300\b': 'font-weight: var(--font-weight-light)',
    r'font-weight:\s*400\b': 'font-weight: var(--font-weight-normal)',
    r'font-weight:\s*500\b': 'font-weight: var(--font-weight-medium)',
    r'font-weight:\s*600\b': 'font-weight: var(--font-weight-semibold)',
    r'font-weight:\s*700\b': 'font-weight: var(--font-weight-bold)',
    
    # Font Sizes
    r'font-size:\s*0\.75rem\b': 'font-size: var(--font-size-xs)',
    r'font-size:\s*0\.8rem\b': 'font-size: var(--font-size-xs)',
    r'font-size:\s*0\.8em\b': 'font-size: var(--font-size-xs)',
    r'font-size:\s*0\.85rem\b': 'font-size: var(--font-size-sm)',
    r'font-size:\s*0\.875rem\b': 'font-size: var(--font-size-sm)',
    r'font-size:\s*0\.9rem\b': 'font-size: var(--font-size-sm)',
    r'font-size:\s*0\.9em\b': 'font-size: var(--font-size-sm)',
    r'font-size:\s*0\.95rem\b': 'font-size: var(--font-size-base)',
    r'font-size:\s*1rem\b': 'font-size: var(--font-size-base)',
    r'font-size:\s*1\.05rem\b': 'font-size: var(--font-size-base)',
    r'font-size:\s*1\.1rem\b': 'font-size: var(--font-size-lg)',
    r'font-size:\s*1\.125rem\b': 'font-size: var(--font-size-lg)',
    r'font-size:\s*1\.25rem\b': 'font-size: var(--font-size-xl)',
    r'font-size:\s*1\.25em\b': 'font-size: var(--font-size-xl)',
    r'font-size:\s*1\.4rem\b': 'font-size: var(--font-size-2xl)',
    r'font-size:\s*1\.5rem\b': 'font-size: var(--font-size-2xl)',
    r'font-size:\s*1\.75rem\b': 'font-size: var(--font-size-3xl)',
    r'font-size:\s*1\.875rem\b': 'font-size: var(--font-size-3xl)',
    r'font-size:\s*2rem\b': 'font-size: var(--font-size-4xl)', # Close enough
    r'font-size:\s*2\.25rem\b': 'font-size: var(--font-size-4xl)',
    r'font-size:\s*2\.5rem\b': 'font-size: var(--font-size-4xl)', # Mapping up or down?
    r'font-size:\s*3rem\b': 'font-size: var(--font-size-5xl)',
    r'font-size:\s*4rem\b': 'font-size: var(--font-size-6xl)',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in mappings.items():
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.astro', '.css')):
            process_file(os.path.join(root, file))

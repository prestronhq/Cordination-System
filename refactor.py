import os
import glob
import re

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Tokens and class replacements
replacements = [
    ("bg-[#1e3a5f]", "bg-surface-inverse"),
    ("bg-[#2d6a4f]", "bg-secondary-600"),
    ("text-blue-900", "text-primary-600"),
    ("bg-blue-900", "bg-primary-600"),
    ("hover:bg-blue-800", "hover:bg-primary-700"),
    ("border-blue-900", "border-primary-600"),
    ("text-blue-100", "text-primary-100"),
    ("text-blue-200", "text-primary-200"),
    ("text-blue-700", "text-primary-700"),
    ("text-blue-800", "text-primary-800"),
    ("hover:text-blue-800", "hover:text-primary-700"),
    ("hover:text-blue-700", "hover:text-primary-600"),
    ("bg-blue-50", "bg-primary-50"),
    ("hover:bg-blue-50", "hover:bg-primary-50"),
    ("border-blue-200", "border-primary-200"),
    ("border-blue-300", "border-primary-300"),
    
    ("text-green-700", "text-secondary-700"),
    ("text-green-800", "text-secondary-800"),
    ("bg-green-100", "bg-secondary-100"),
    ("bg-green-50", "bg-secondary-50"),
    ("border-green-200", "border-secondary-200"),
    
    ("text-yellow-700", "text-warning-700"),
    ("text-yellow-800", "text-warning-800"),
    ("bg-yellow-100", "bg-warning-100"),
    ("bg-yellow-50", "bg-warning-50"),
    ("border-yellow-200", "border-warning-200"),
    ("text-yellow-500", "text-warning-500"),
    
    ("text-red-700", "text-error-700"),
    ("text-red-800", "text-error-800"),
    ("bg-red-100", "bg-error-100"),
    ("bg-red-50", "bg-error-50"),
    ("border-red-200", "border-error-200"),

    ("text-gray-900", "text-text-strong"),
    ("text-gray-800", "text-text-strong"),
    ("text-gray-700", "text-text-default"),
    ("text-gray-600", "text-text-muted"),
    ("text-gray-500", "text-text-muted"),
    ("text-gray-400", "text-text-subtle"),
    ("text-gray-300", "text-border-strong"),
    ("border-gray-200", "border-border-default"),
    ("border-gray-300", "border-border-strong"),
    ("bg-gray-50", "bg-surface-1"),
    ("bg-gray-100", "bg-surface-2"),
    ("hover:bg-gray-50", "hover:bg-surface-2"),
]

admin_files = glob.glob('app/admin/**/*.tsx', recursive=True)
officer_files = glob.glob('app/officer/**/*.tsx', recursive=True)
component_files = glob.glob('components/**/*.tsx', recursive=True)

for f in admin_files + officer_files + component_files:
    if "Header" in f or "Nav" in f or "Button" in f or "SectorIcon" in f:
        continue # mostly handled
    replace_in_file(f, replacements)

import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    content = content.replace("<span>{sc.sectorIcon}</span>", "<SectorIcon iconKey={sc.sectorIcon} className=\"size-4 p-0 bg-transparent text-current\" />")
    content = content.replace("<span className=\"text-xl flex-shrink-0 mt-0.5\">{update.sector.icon}</span>", "<SectorIcon iconKey={update.sector.icon} className=\"size-8 p-1.5\" />")
    content = content.replace("<span className=\"text-2xl flex-shrink-0 mt-0.5\">{update.sector.icon}</span>", "<SectorIcon iconKey={update.sector.icon} className=\"size-10 p-2\" />")
    content = content.replace("<span>{s.icon}</span>", "<SectorIcon iconKey={s.icon} className=\"size-4 p-0 bg-transparent text-current\" />")
    content = content.replace("<span>{update.sector.icon}</span>", "<SectorIcon iconKey={update.sector.icon} className=\"size-4 p-0 bg-transparent text-current\" />")

    if orig != content:
        if "SectorIcon" not in orig:
            content = "import { SectorIcon } from \"@/components/SectorIcon\";\n" + content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

admin_files = glob.glob('app/admin/**/*.tsx', recursive=True)
officer_files = glob.glob('app/officer/**/*.tsx', recursive=True)

for f in admin_files + officer_files:
    replace_in_file(f)


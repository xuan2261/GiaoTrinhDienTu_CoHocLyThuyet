import os
import re

mapping = {
    'ch1-1-3b.js': 'ch1-1-3b',
    'ch1-1-3c.js': 'ch1-1-3c',
    'ch1-1-4b.js': 'ch1-1-4b',
    'ch1-1-5b.js': 'ch1-1-5b',
    'ch1-1-6.js': 'ch1-1-6',
    'ch1-1-6b.js': 'ch1-1-6b',
    'ch1-2-3b.js': 'ch1-2-3b',
    'ch1-2-4.js': 'ch1-2-4',
    'ch1-3-8.js': 'ch1-3-8',
    'ch1-5-1.js': 'ch1-5-1',
    'ch1-5-2.js': 'ch1-5-2',
    'ch1-5-3.js': 'ch1-5-3',
    'ch1-6-1.js': 'ch1-6-1',
    'ch1-6-2.js': 'ch1-6-2',
    'ch1-6-3.js': 'ch1-6-3',
}

base_dir = r'D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\routes\ch1'

for filename, new_id in mapping.items():
    file_path = os.path.join(base_dir, filename)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update RouteRegistry.register
        content = re.sub(r"window\.RouteRegistry\.register\('ch1-\d-\d(?:[a-z])?'", f"window.RouteRegistry.register('{new_id}'", content)
        
        # Update SIM_MAP
        content = re.sub(r"window\.SIM_MAP\['ch1-\d-\d(?:[a-z])?'\]", f"window.SIM_MAP['{new_id}']", content)
        
        # Update comments (optional but good)
        content = re.sub(r"Ch1-\d-\d(?:[a-z])?:", f"{new_id.capitalize()}:", content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename} to {new_id}")
    else:
        print(f"File not found: {filename}")

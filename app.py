from flask import Flask, render_template, jsonify, request
import random
import csv
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

GROUPS = ['A', 'B', 'C', 'Dog', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T']
PACKAGES = list(range(1, 19))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/spin', methods=['POST'])
def spin():
    shuffled_groups = GROUPS.copy()
    shuffled_packages = PACKAGES.copy()
    random.shuffle(shuffled_groups)
    random.shuffle(shuffled_packages)

    offset = random.randint(0, 17)
    
    results = []
    for i, group in enumerate(shuffled_groups):
        package_index = (i + offset) % 18
        results.append({
            'group': group,
            'package': shuffled_packages[package_index]
        })
        
    sorted_results = sorted(results, key=lambda x: x['group'])
        
    return jsonify({
        'shuffled_groups': shuffled_groups,
        'shuffled_packages': shuffled_packages,
        'offset': offset,
        'results': sorted_results
    })

@app.route('/export-pdf', methods=['POST'])
def export_pdf():
    data = request.json
    package_to_group = {int(item['package']): item['group'] for item in data}
    
    # ใช้ BASE_DIR เพื่อให้หาไฟล์เจอทั้ง local และ Vercel
    template_path = os.path.join(BASE_DIR, 'PackageSheets.csv')
    
    try:
        with open(template_path, mode='r', encoding='utf-8-sig') as f:
            csv_reader = list(csv.reader(f))
    except FileNotFoundError:
        return jsonify({"error": "ไม่พบไฟล์เทมเพลต"}), 404

    for i in range(2, min(20, len(csv_reader))):
        try:
            package_number = int(csv_reader[i][1])
            if package_number in package_to_group:
                csv_reader[i][0] = package_to_group[package_number]
        except (ValueError, IndexError):
            pass

    return jsonify({'table_data': csv_reader})

if __name__ == '__main__':
    app.run(debug=False)
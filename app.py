from flask import Flask, render_template, jsonify, request, Response
import random
import csv
import io

app = Flask(__name__)

GROUPS = ['A', 'B', 'C', 'Dog', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T']
PACKAGES = list(range(1, 19))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/spin', methods=['POST'])
def spin():
    # 1. สุ่มสลับตำแหน่งตัวอักษรและตัวเลขบนวงล้อใหม่ทุกครั้ง (Shuffle Layout)
    shuffled_groups = GROUPS.copy()
    shuffled_packages = PACKAGES.copy()
    random.shuffle(shuffled_groups)
    random.shuffle(shuffled_packages)

    # 2. สุ่มค่า Offset (0-17) เพื่อกำหนดตำแหน่งการหยุดสัมพัทธ์ทางกลศาสตร์
    offset = random.randint(0, 17)
    
    results = []
    for i, group in enumerate(shuffled_groups):
        package_index = (i + offset) % 18
        results.append({
            'group': group,
            'package': shuffled_packages[package_index]
        })
        
    # 3. จัดเรียงผลลัพธ์ในตารางสรุปตามตัวอักษร A->T เสมอ
    sorted_results = sorted(results, key=lambda x: x['group'])
        
    return jsonify({
        'shuffled_groups': shuffled_groups,
        'shuffled_packages': shuffled_packages,
        'offset': offset,
        'results': sorted_results
    })

@app.route('/export-pdf', methods=['POST'])
def export_pdf():
    data = request.json  # รับผลลัพธ์การจับคู่ล่าสุดจาก Frontend
    
    # แปลงโครงสร้างข้อมูลเพื่อให้จับคู่ค้นหาผ่านหมายเลข Package ได้รวดเร็ว
    package_to_group = {int(item['package']): item['group'] for item in data}
    
    # เปิดอ่านไฟล์เทมเพลตต้นฉบับ .csv
    template_filename = 'Copy of Package - Sheet1.csv'
    try:
        with open(template_filename, mode='r', encoding='utf-8-sig') as f:
            csv_reader = list(csv.reader(f))
    except FileNotFoundError:
        return jsonify({"error": "ไม่พบไฟล์เทมเพลต 'Copy of Package - Sheet1.csv' ในโฟลเดอร์หลัก"}), 404

    # นำข้อมูลชื่อ Group ไปหยอดลงใน Column A ตั้งแต่แถวที่ 3-20
    for i in range(2, min(20, len(csv_reader))):
        try:
            package_number = int(csv_reader[i][1])  # อ่านเลข Package จากคอลัมน์ B
            if package_number in package_to_group:
                csv_reader[i][0] = package_to_group[package_number]  # เขียนชื่อ Group ลงคอลัมน์ A
        except (ValueError, IndexError):
            pass

    # ส่งข้อมูลตารางที่ประมวลผลเติมเต็มเรียบร้อยแล้วกลับไปเป็นรูปแบบ JSON
    return jsonify({'table_data': csv_reader})

if __name__ == '__main__':
    app.run(debug=True)
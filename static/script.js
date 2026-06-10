const outerCanvas = document.getElementById('outerWheel');
const innerCanvas = document.getElementById('innerWheel');
const ctxOut = outerCanvas.getContext('2d');
const ctxIn = innerCanvas.getContext('2d');

// ปรับจานสีใหม่อ้างอิงจากรูปภาพสดใส: แดงเลือดหมู, ขาวนวล, เหลืองทอง, และเนื้อครีม
const colorsOut = ['#8b1e22', '#ffffff', '#ffd15c', '#f7ebd7', '#cc3338', '#fffcf7'];
const colorsIn = ['#ffd15c', '#ffffff', '#8b1e22', '#fffcf7', '#f3af22', '#f7ebd7'];

// วาดโครงสร้างวงล้อเริ่มต้น
const defaultGroups = ['A', 'B', 'C', 'Dog', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T'];
const defaultPackages = Array.from({length: 18}, (_, i) => i + 1);
drawWheel(ctxOut, outerCanvas, defaultGroups, 250, 160, colorsOut, true);
drawWheel(ctxIn, innerCanvas, defaultPackages, 160, 0, colorsIn, false);

function drawWheel(ctx, canvas, choices, outerRadius, innerRadius, colorPalette, isOuter) {
    const totalSegments = choices.length;
    const anglePerSegment = (2 * Math.PI) / totalSegments;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2); // ตั้งเป้าเข็มที่ 12 นาฬิกา

    for (let i = 0; i < totalSegments; i++) {
        const currentBgColor = colorPalette[i % colorPalette.length];
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerRadius, i * anglePerSegment, (i + 1) * anglePerSegment);
        ctx.lineTo(0, 0);
        ctx.fillStyle = currentBgColor;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#e8d0b0'; // เส้นแบ่งช่องสีเนื้อทองนวลสไตล์ย้อนยุค
        ctx.stroke();

        ctx.save();
        ctx.rotate(i * anglePerSegment + anglePerSegment / 2);
        
        // คำนวณสีตัวอักษรให้อ่านง่ายตามสีพื้นหลังของช่องสุ่ม
        if (currentBgColor === '#8b1e22' || currentBgColor === '#cc3338') {
            ctx.fillStyle = '#ffffff'; // ช่องสีแดง ให้ตัวอักษรสีขาว
        } else if (currentBgColor === '#ffd15c' || currentBgColor === '#f3af22') {
            ctx.fillStyle = '#4a2829'; // ช่องสีเหลือง ให้ตัวอักษรสีน้ำตาลแดงเข้ม
        } else {
            ctx.fillStyle = '#8b1e22'; // ช่องสีขาว/ครีม ให้ตัวอักษรสีแดงเลือดหมู
        }
        
        ctx.font = 'bold 15px Prompt, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(choices[i].toString(), outerRadius - 15, 5);
        ctx.restore();
    }
    ctx.restore();
}

let currentResults = null;

document.getElementById('spinBtn').addEventListener('click', async () => {
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('openModalBtn').disabled = true;
    document.getElementById('exportPdfBtn').disabled = true;

    // 1. เรียกผลลัพธ์การสลับ Layout แอนิเมชันจาก Python Backend
    const response = await fetch('/spin', { method: 'POST' });
    const data = await response.json();
    currentResults = data.results;

    // 2. เคลียร์องศาวงล้อกลับไปจุดเริ่มต้นเพื่อป้องกันอาการหมุนกระตุกถอยหลัง
    outerCanvas.style.transition = 'none';
    innerCanvas.style.transition = 'none';
    outerCanvas.style.transform = 'rotate(0deg)';
    innerCanvas.style.transform = 'rotate(0deg)';
    outerCanvas.offsetHeight; 
    innerCanvas.offsetHeight;

    // 3. วาดภาพตัวอักษรที่สลับตำแหน่งใหม่ลงบน Canvas ทันทีก่อนเริ่มแอนิเมชัน
    drawWheel(ctxOut, outerCanvas, data.shuffled_groups, 250, 160, colorsOut, true);
    drawWheel(ctxIn, innerCanvas, data.shuffled_packages, 160, 0, colorsIn, false);

    // 4. สุ่มระยะเวลาการหมุน (5-10 วินาที) ไม่ให้เท่ากัน
    const outerDuration = 5 + Math.random() * 5; 
    let innerDuration = 5 + Math.random() * 5;
    while (Math.abs(outerDuration - innerDuration) < 0.5) {
        innerDuration = 5 + Math.random() * 5;
    }

    // สุ่มจำนวนรอบความเร็วฐานให้แยกกันเด็ดขาดเพื่อความเร็วที่ไม่เท่ากัน
    const outerCycles = 6 + Math.floor(Math.random() * 4); 
    let innerCycles = 6 + Math.floor(Math.random() * 4);
    while (outerCycles === innerCycles) {
        innerCycles = 6 + Math.floor(Math.random() * 4);
    }

    // 5. คำนวณหาจุดหยุดให้ลงล็อคกลศาสตร์พอดีเป๊ะ
    const segmentAngle = 360 / 18; 
    const randomOuterOffset = Math.floor(Math.random() * 18); 
    
    const outerTargetDegrees = (outerCycles * 360) + (randomOuterOffset * segmentAngle);
    const landedOuterIndex = (18 - randomOuterOffset) % 18;
    
    const landedInnerIndex = (landedOuterIndex + data.offset) % 18;
    const innerTargetDegrees = (innerCycles * 360) + (landedInnerIndex * segmentAngle);

    // 6. ใส่ CSS Transition สั่งหมุนวงล้อส่วนทางกัน (วงนอกตามเข็ม (+) / วงในทวนเข็ม (-))
    outerCanvas.style.transition = `transform ${outerDuration}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
    innerCanvas.style.transition = `transform ${innerDuration}s cubic-bezier(0.1, 0.8, 0.2, 1)`;

    outerCanvas.style.transform = `rotate(${outerTargetDegrees}deg)`;
    innerCanvas.style.transform = `rotate(-${innerTargetDegrees}deg)`;

    // 7. เมื่อวงล้อทั้งหมดหยุดเคลื่อนไหวสนิท
    const maxDuration = Math.max(outerDuration, innerDuration);
    setTimeout(() => {
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('openModalBtn').disabled = false;
        document.getElementById('exportPdfBtn').disabled = false;
        
        populateTable(data.results);
        document.getElementById('resultModal').classList.remove('hidden'); // แสดงป๊อปอัพออโต้
    }, maxDuration * 1000);
});

function populateTable(results) {
    const tbody = document.querySelector('#resultTable tbody');
    tbody.innerHTML = '';
    results.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${row.group}</strong></td><td>${row.package}</td>`;
        tbody.appendChild(tr);
    });
}

// ==================== CONTROLS MODAL POP-UP ====================
const resultModal = document.getElementById('resultModal');
document.getElementById('openModalBtn').addEventListener('click', () => {
    resultModal.classList.remove('hidden');
});
document.getElementById('closeModalBtn').addEventListener('click', () => {
    resultModal.classList.add('hidden');
});
window.addEventListener('click', (event) => {
    if (event.target === resultModal) {
        resultModal.classList.add('hidden');
    }
});

// ==================== EXPORT PDF (LANDSCAPE A4) ====================
document.getElementById('exportPdfBtn').addEventListener('click', async () => {
    if (!currentResults) return;

    const response = await fetch('/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentResults)
    });
    
    const data = await response.json();
    if (data.error) { alert(data.error); return; }
    const tableData = data.table_data;

    // เจนเนอเรตหน้ากระดาษ Virtual HTML ส่งไปแปลงเป็น PDF แนวนอนภาษาไทย
    const pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '12mm 10mm';
    pdfContainer.style.fontFamily = "'Prompt', sans-serif";
    pdfContainer.style.backgroundColor = "#ffffff";
    pdfContainer.style.color = "#4a2829";
    
    const title = document.createElement('h2');
    title.innerText = 'ตารางสรุปผลการสุ่มจับคู่แพ็กเกจ - ค่ายวิษณุกรรมบุตร';
    title.style.textAlign = 'center';
    title.style.color = '#8b1e22';
    title.style.margin = '0 0 5px 0';
    title.style.fontSize = '20px';
    title.style.fontWeight = '700';
    pdfContainer.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.innerText = 'คณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย';
    subtitle.style.textAlign = 'center';
    subtitle.style.color = '#b8860b';
    subtitle.style.margin = '0 0 22px 0';
    subtitle.style.fontSize = '13px';
    subtitle.style.fontWeight = '600';
    pdfContainer.appendChild(subtitle);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '10px';

    tableData.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        row.forEach(cell => {
            const cellElement = rowIndex < 2 ? document.createElement('th') : document.createElement('td');
            cellElement.innerText = cell || ''; 
            
            cellElement.style.border = '1px solid #e8d0b0';
            cellElement.style.padding = '6px 4px';
            cellElement.style.textAlign = 'center';
            cellElement.style.fontFamily = "'Prompt', sans-serif";
            
            if (rowIndex < 2) {
                cellElement.style.backgroundColor = '#8b1e22';
                cellElement.style.color = '#ffffff';
                cellElement.style.fontWeight = '600';
            } else {
                cellElement.style.color = '#374151';
                // ไฮไลต์ช่องคอลัมน์แรก (Group) ที่ได้จากผลสุ่มให้ออกมาเป็นแถบสีเนื้อครีมทองเด่นชัดในไฟล์ PDF
                if (cell === row[0] && cell !== '') {
                    cellElement.style.fontWeight = 'bold';
                    cellElement.style.color = '#8b1e22';
                    cellElement.style.backgroundColor = '#fff8ee';
                }
            }
            tr.appendChild(cellElement);
        });
        table.appendChild(tr);
    });

    pdfContainer.appendChild(table);

    const opt = {
        margin:       6,
        filename:     'Vishnu_Camp_Package_Result.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(pdfContainer).save();
});

// =====================================================
//  SHARED WHEEL CONFIG
// =====================================================
const colorsOut = ['#8b1e22', '#ffffff', '#ffd15c', '#f7ebd7', '#cc3338', '#fffcf7'];
const colorsIn  = ['#ffd15c', '#ffffff', '#8b1e22', '#fffcf7', '#f3af22', '#f7ebd7'];
 
const ALL_GROUPS   = ['A','B','C','Dog','E','F','G','H','J','K','L','M','N','P','Q','R','S','T'];
const ALL_PACKAGES = Array.from({length: 18}, (_, i) => i + 1);
 
function drawWheel(ctx, canvas, choices, outerRadius, innerRadius, colorPalette) {
    const total = choices.length;
    if (total === 0) return;
    const anglePerSeg = (2 * Math.PI) / total;
 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
 
    for (let i = 0; i < total; i++) {
        const bg = colorPalette[i % colorPalette.length];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerRadius, i * anglePerSeg, (i + 1) * anglePerSeg);
        ctx.lineTo(0, 0);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#e8d0b0';
        ctx.stroke();
 
        ctx.save();
        ctx.rotate(i * anglePerSeg + anglePerSeg / 2);
        if (bg === '#8b1e22' || bg === '#cc3338') {
            ctx.fillStyle = '#ffffff';
        } else if (bg === '#ffd15c' || bg === '#f3af22') {
            ctx.fillStyle = '#4a2829';
        } else {
            ctx.fillStyle = '#8b1e22';
        }
        ctx.font = 'bold 15px Prompt, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(choices[i].toString(), outerRadius - 15, 5);
        ctx.restore();
    }
    ctx.restore();
}
 
// =====================================================
//  MODE SELECTOR
// =====================================================
document.getElementById('selectMode1').addEventListener('click', () => {
    document.getElementById('modeSelector').classList.add('hidden');
    document.getElementById('mode1Screen').classList.remove('hidden');
    initMode1();
});
document.getElementById('selectMode2').addEventListener('click', () => {
    document.getElementById('modeSelector').classList.add('hidden');
    document.getElementById('mode2Screen').classList.remove('hidden');
    initMode2();
});
document.getElementById('backFromMode1').addEventListener('click', () => {
    document.getElementById('mode1Screen').classList.add('hidden');
    document.getElementById('modeSelector').classList.remove('hidden');
});
document.getElementById('backFromMode2').addEventListener('click', () => {
    document.getElementById('mode2Screen').classList.add('hidden');
    document.getElementById('modeSelector').classList.remove('hidden');
});
 
// =====================================================
//  MODE 1 — NORMAL (original logic, unchanged)
// =====================================================
function initMode1() {
    const outerCanvas = document.getElementById('outerWheel');
    const innerCanvas = document.getElementById('innerWheel');
    const ctxOut = outerCanvas.getContext('2d');
    const ctxIn  = innerCanvas.getContext('2d');
 
    drawWheel(ctxOut, outerCanvas, ALL_GROUPS,   250, 160, colorsOut);
    drawWheel(ctxIn,  innerCanvas, ALL_PACKAGES, 160, 0,   colorsIn);
}
 
let currentResults = null;
 
document.getElementById('spinBtn').addEventListener('click', async () => {
    const outerCanvas = document.getElementById('outerWheel');
    const innerCanvas = document.getElementById('innerWheel');
 
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('openModalBtn').disabled = true;
    document.getElementById('exportPdfBtn').disabled = true;
 
    const response = await fetch('/spin', { method: 'POST' });
    const data = await response.json();
    currentResults = data.results;
 
    outerCanvas.style.transition = 'none';
    innerCanvas.style.transition = 'none';
    outerCanvas.style.transform  = 'rotate(0deg)';
    innerCanvas.style.transform  = 'rotate(0deg)';
    outerCanvas.offsetHeight;
    innerCanvas.offsetHeight;
 
    const ctxOut = outerCanvas.getContext('2d');
    const ctxIn  = innerCanvas.getContext('2d');
    drawWheel(ctxOut, outerCanvas, data.shuffled_groups,   250, 160, colorsOut);
    drawWheel(ctxIn,  innerCanvas, data.shuffled_packages, 160, 0,   colorsIn);
 
    const outerDuration = 5 + Math.random() * 5;
    let   innerDuration = 5 + Math.random() * 5;
    while (Math.abs(outerDuration - innerDuration) < 0.5) {
        innerDuration = 5 + Math.random() * 5;
    }
    const outerCycles = 6 + Math.floor(Math.random() * 4);
    let   innerCycles = 6 + Math.floor(Math.random() * 4);
    while (outerCycles === innerCycles) {
        innerCycles = 6 + Math.floor(Math.random() * 4);
    }
 
    const segAngle         = 360 / 18;
    const randomOuterOff   = Math.floor(Math.random() * 18);
    const outerTargetDeg   = (outerCycles * 360) + (randomOuterOff * segAngle);
    const landedOuterIndex = (18 - randomOuterOff) % 18;
    const landedInnerIndex = (landedOuterIndex + data.offset) % 18;
    const innerTargetDeg   = (innerCycles * 360) + (landedInnerIndex * segAngle);
 
    outerCanvas.style.transition = `transform ${outerDuration}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
    innerCanvas.style.transition = `transform ${innerDuration}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
    outerCanvas.style.transform  = `rotate(${outerTargetDeg}deg)`;
    innerCanvas.style.transform  = `rotate(-${innerTargetDeg}deg)`;
 
    const maxDuration = Math.max(outerDuration, innerDuration);
    setTimeout(() => {
        document.getElementById('spinBtn').disabled      = false;
        document.getElementById('openModalBtn').disabled = false;
        document.getElementById('exportPdfBtn').disabled = false;
        populateTable(data.results);
        document.getElementById('resultModal').classList.remove('hidden');
    }, maxDuration * 1000);
});
 
function populateTable(results) {
    const tbody = document.querySelector('#resultTable tbody');
    tbody.innerHTML = '';
    results.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.group}</td><td>${row.package}</td>`;
        tbody.appendChild(tr);
    });
}
 
const resultModal = document.getElementById('resultModal');
document.getElementById('openModalBtn').addEventListener('click', () => {
    resultModal.classList.remove('hidden');
});
document.getElementById('closeModalBtn').addEventListener('click', () => {
    resultModal.classList.add('hidden');
});
window.addEventListener('click', e => {
    if (e.target === resultModal) resultModal.classList.add('hidden');
});
 
document.getElementById('exportPdfBtn').addEventListener('click', () => exportPdf(currentResults));
 
// =====================================================
//  MODE 2 — ELIMINATION
// =====================================================
let remainingGroups   = [];
let remainingPackages = [];
let eliminationHistory = [];   // store ผลทั้งหมดไว้ export
let mode2Round = 0;
let mode2Spinning = false;
 
function getMode2WheelSize() {
    const wrap = document.querySelector('.mode2-wheel-wrap');
    return wrap ? wrap.offsetWidth : 380;
}
 
function initMode2() {
    remainingGroups    = [...ALL_GROUPS];
    remainingPackages  = [...ALL_PACKAGES];
    eliminationHistory = [];
    mode2Round         = 0;
 
    const oc = document.getElementById('outerWheel2');
    const ic = document.getElementById('innerWheel2');
 
    // sync canvas resolution to actual rendered size
    const sz = getMode2WheelSize();
    oc.width  = sz; oc.height = sz;
    ic.width  = Math.round(sz * 0.638); ic.height = Math.round(sz * 0.638);
 
    oc.style.transition = 'none';
    ic.style.transition = 'none';
    oc.style.transform  = 'rotate(0deg)';
    ic.style.transform  = 'rotate(0deg)';
 
    const outerR = sz / 2;
    const innerR = Math.round(sz * 0.638 / 2);
    drawWheel(oc.getContext('2d'), oc, remainingGroups,   outerR, 0, colorsOut);
    drawWheel(ic.getContext('2d'), ic, remainingPackages, innerR, 0, colorsIn);
 
    updateRemainingBadge();
    document.getElementById('exportPdfBtn2').disabled = true;
    document.getElementById('announceResult').classList.add('hidden');
    document.getElementById('announcePlaceholder').style.display = 'flex';
    document.getElementById('historyList').innerHTML = '<p class="history-empty">ยังไม่มีผลลัพธ์</p>';
}
 
function updateRemainingBadge() {
    const n = remainingGroups.length;
    document.getElementById('remainingCount').textContent =
        n > 0 ? `เหลือ ${n} คู่` : '✅ ครบทุกคู่แล้ว';
}
 
document.getElementById('spinBtn2').addEventListener('click', async () => {
    if (mode2Spinning || remainingGroups.length === 0) return;
    mode2Spinning = true;
 
    const oc = document.getElementById('outerWheel2');
    const ic = document.getElementById('innerWheel2');
    document.getElementById('spinBtn2').disabled     = true;
    document.getElementById('exportPdfBtn2').disabled = true;
 
    // เรียก backend spin โดยส่ง remaining list
    const response = await fetch('/spin_subset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            groups:   remainingGroups,
            packages: remainingPackages
        })
    });
    const data = await response.json();
 
    // reset transform ก่อน
    oc.style.transition = 'none';
    ic.style.transition = 'none';
    oc.style.transform  = 'rotate(0deg)';
    ic.style.transform  = 'rotate(0deg)';
    oc.offsetHeight;
    ic.offsetHeight;
 
    const n  = remainingGroups.length;
    const sz = getMode2WheelSize();
    oc.width = sz; oc.height = sz;
    ic.width = Math.round(sz * 0.638); ic.height = Math.round(sz * 0.638);
    const outerR = sz / 2;
    const innerR = Math.round(sz * 0.638 / 2);
    drawWheel(oc.getContext('2d'), oc, data.shuffled_groups,   outerR, 0, colorsOut);
    drawWheel(ic.getContext('2d'), ic, data.shuffled_packages, innerR, 0, colorsIn);
 
    // animation
    const outerDur = 4 + Math.random() * 3;
    let   innerDur = 4 + Math.random() * 3;
    while (Math.abs(outerDur - innerDur) < 0.4) innerDur = 4 + Math.random() * 3;
 
    const outerCyc = 5 + Math.floor(Math.random() * 3);
    let   innerCyc = 5 + Math.floor(Math.random() * 3);
    while (outerCyc === innerCyc) innerCyc = 5 + Math.floor(Math.random() * 3);
 
    const segAngle       = 360 / n;
    const randomOff      = Math.floor(Math.random() * n);
    const outerTargetDeg = (outerCyc * 360) + (randomOff * segAngle);
    const landedOuter    = (n - randomOff) % n;
    const landedInner    = (landedOuter + data.offset) % n;
    const innerTargetDeg = (innerCyc * 360) + (landedInner * segAngle);
 
    oc.style.transition = `transform ${outerDur}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
    ic.style.transition = `transform ${innerDur}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
    oc.style.transform  = `rotate(${outerTargetDeg}deg)`;
    ic.style.transform  = `rotate(-${innerTargetDeg}deg)`;
 
    const maxDur = Math.max(outerDur, innerDur);
    setTimeout(() => {
        // หาผลลัพธ์จาก data.results ที่ index 0 (first pair after offset landing)
        // Backend ส่ง results sorted แต่เราต้องการแค่คู่ที่ชนะรอบนี้
        // → ใช้ลูกที่อยู่ตรงหัวลูกศร ซึ่งคือ shuffled_groups[landedOuter]
        const winGroup   = data.shuffled_groups[landedOuter];
        const winPackage = data.shuffled_packages[landedInner];
 
        mode2Round++;
        eliminationHistory.push({ group: winGroup, package: winPackage });
 
        // ตัดออกจาก remaining
        remainingGroups   = remainingGroups.filter(g => g !== winGroup);
        remainingPackages = remainingPackages.filter(p => p !== winPackage);
 
        // แสดงผลประกาศ
        showAnnounce(winGroup, winPackage, mode2Round);
 
        // วาดวงล้อใหม่ที่ตัดแล้ว (reset transform ก่อน)
        oc.style.transition = 'none';
        ic.style.transition = 'none';
        oc.style.transform  = 'rotate(0deg)';
        ic.style.transform  = 'rotate(0deg)';
        oc.offsetHeight;
        ic.offsetHeight;
 
        if (remainingGroups.length > 0) {
            const sz2 = getMode2WheelSize();
            oc.width = sz2; oc.height = sz2;
            ic.width = Math.round(sz2 * 0.638); ic.height = Math.round(sz2 * 0.638);
            drawWheel(oc.getContext('2d'), oc, remainingGroups,   sz2/2,                      0, colorsOut);
            drawWheel(ic.getContext('2d'), ic, remainingPackages, Math.round(sz2*0.638/2), 0, colorsIn);
        } else {
            // วงล้อว่าง — วาด canvas เปล่า
            oc.getContext('2d').clearRect(0, 0, oc.width, oc.height);
            ic.getContext('2d').clearRect(0, 0, ic.width, ic.height);
        }
 
        updateRemainingBadge();
        addHistoryChip(winGroup, winPackage);
 
        document.getElementById('spinBtn2').disabled     = remainingGroups.length === 0;
        document.getElementById('exportPdfBtn2').disabled = eliminationHistory.length === 0;
        mode2Spinning = false;
    }, maxDur * 1000);
});
 
function showAnnounce(group, pkg, round) {
    document.getElementById('announcePlaceholder').style.display = 'none';
    const box = document.getElementById('announceResult');
    box.classList.remove('hidden');
    // force re-animation
    box.style.animation = 'none';
    box.offsetHeight;
    box.style.animation = '';
    document.getElementById('roundNumber').textContent  = round;
    document.getElementById('announceGroup').textContent   = group;
    document.getElementById('announcePackage').textContent = pkg;
}
 
function addHistoryChip(group, pkg) {
    const list = document.getElementById('historyList');
    const empty = list.querySelector('.history-empty');
    if (empty) empty.remove();
 
    const chip = document.createElement('div');
    chip.className = 'history-chip';
    chip.innerHTML = `<span class="chip-group">${group}</span><span class="chip-sep">→</span><span class="chip-pkg">Pkg ${pkg}</span>`;
    list.prepend(chip);  // ใหม่อยู่บน
}
 
document.getElementById('exportPdfBtn2').addEventListener('click', () => {
    exportPdf(eliminationHistory);
});
 
// =====================================================
//  SHARED EXPORT PDF
// =====================================================
async function exportPdf(results) {
    if (!results || results.length === 0) return;
 
    const response = await fetch('/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
    });
    const data = await response.json();
    if (data.error) { alert(data.error); return; }
    const tableData = data.table_data;
 
    const pdfContainer = document.createElement('div');
    pdfContainer.style.cssText = 'padding:12mm 10mm;font-family:Prompt,sans-serif;background:#fff;color:#4a2829;';
 
    const title = document.createElement('h2');
    title.innerText = 'ตารางสรุปผลการสุ่มจับคู่แพ็กเกจ - ค่ายวิษณุกรรมบุตร';
    Object.assign(title.style, { textAlign:'center', color:'#8b1e22', margin:'0 0 5px', fontSize:'20px', fontWeight:'700' });
    pdfContainer.appendChild(title);
 
    const subtitle = document.createElement('p');
    subtitle.innerText = 'คณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย';
    Object.assign(subtitle.style, { textAlign:'center', color:'#b8860b', margin:'0 0 22px', fontSize:'13px', fontWeight:'600' });
    pdfContainer.appendChild(subtitle);
 
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:10px;';
    tableData.forEach((row, ri) => {
        const tr = document.createElement('tr');
        row.forEach((cell, ci) => {
            const el = ri < 1 ? document.createElement('th') : document.createElement('td');
            el.innerText = cell || '';
            el.style.border  = '1px solid #e8d0b0';
            el.style.padding = '6px 4px';
            el.style.textAlign = 'center';
            el.style.fontFamily = 'Prompt, sans-serif';
            if (ri < 1) {
                el.style.backgroundColor = '#8b1e22';
                el.style.color = '#ffffff';
                el.style.fontWeight = '600';
            } else {
                el.style.color = '#374151';
                if (ci === 0 && cell !== '') {
                    el.style.fontWeight = 'bold';
                    el.style.color = '#8b1e22';
                    el.style.backgroundColor = '#fff8ee';
                }
            }
            tr.appendChild(el);
        });
        table.appendChild(tr);
    });
    pdfContainer.appendChild(table);
 
    html2pdf().set({
        margin: 6,
        filename: 'Vishnu_Camp_Package_Result.pdf',
        image: { type:'jpeg', quality:0.98 },
        html2canvas: { scale:2, useCORS:true },
        jsPDF: { unit:'mm', format:'a4', orientation:'landscape' }
    }).from(pdfContainer).save();
}
 

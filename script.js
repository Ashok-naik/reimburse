/* TASK / SEAP — Reimbursement Portal logic */

function getTodayIso() {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

const SAMPLE = {
  year: '2026',
  month: 'Sep',
  noteFileNo: 'TASK/SEAP/2026/Sep/6374',
  noteFileNum: '1',
  dt: getTodayIso(),
  trainerName: 'Ashok Kumar Naik Guguloth',
  empId: '6374',
  designation: ' Technical Trainer',
  department: 'SEAP',
  college: 'RC Khammam',
  course: 'FrontEnd',
  district: 'Khammam',
  travelDate: getTodayIso(),
  amount: 1080,
  regRef: 'Training Calendar.',
};

/* ---------- Helpers ---------- */

function indianFormat(num) {
  const str = Number(num) || 0;
  const s = str.toFixed(0);
  if (s.length <= 3) return s;
  const last = s.slice(-3);
  const rest = s.slice(0, -3);
  const parts = [];
  let chunk = rest;
  while (chunk.length > 3) {
    parts.unshift(chunk.slice(-3));
    chunk = chunk.slice(0, -3);
  }
  if (chunk) parts.unshift(chunk);
  return parts.join(',') + ',' + last;
}

function numberToWords(num) {
  const small = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tensMap = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function two(v) {
    if (v === 0) return '';
    if (v < 20) return small[v];
    const t = Math.floor(v / 10), o = v % 10;
    return o ? tensMap[t] + ' ' + small[o] : tensMap[t];
  }
  function three(v) {
    const h = Math.floor(v / 100);
    const rest = v % 100;
    let s = h ? small[h] + ' hundred' : '';
    const r = two(rest);
    if (s && r) s += ' ';
    return (s + r).trim();
  }
  const n = Math.round(Number(num) || 0);
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  const parts = [];
  if (crore) parts.push(three(crore) + ' crore');
  if (lakh) parts.push(three(lakh) + ' lakh');
  if (thousand) parts.push(three(thousand) + ' thousand');
  if (rest) parts.push(three(rest));
  const words = parts.filter(Boolean).join(' ');
  if (!words) return 'Zero';
  return words.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function claimRefFor(empId, noteFileNum) {
  const id = (empId || '').trim();
  const num = (noteFileNum !== undefined && noteFileNum !== null ? String(noteFileNum) : (document.getElementById('tableNoteFileNum')?.value || '1')).trim();
  const yr = (document.getElementById('tableYear')?.value || '2026').trim();
  const mo = (document.getElementById('tableMonth')?.value || 'Sep').trim();
  const base = 'TASK/SEAP/' + yr + '/' + mo + '/' + (id || '5800');
  return num ? base + ' / Note file No: ' + num : base;
}

function fmtDate(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length < 3) return iso;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function readClaims() {
  try { return JSON.parse(localStorage.getItem('reimburseClaims') || '[]'); } catch (e) { return []; }
}

function saveClaim(claim) {
  const claims = readClaims();
  claims.unshift(claim);
  localStorage.setItem('reimburseClaims', JSON.stringify(claims.slice(0, 10)));
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const claims = readClaims();
  if (!claims.length) {
    list.innerHTML = '<li class="history-empty">No claims submitted yet.</li>';
    return;
  }
  list.innerHTML = claims.map(c => (
    '<li>' +
      '<span class="h-ref">' + c.ref + '</span> &middot; ' +
      'Rs. (' + c.amountFormatted + '/-) &middot; ' +
      'Trainer: ' + c.trainerName + ' &middot; ' +
      '<span class="h-date">' + c.displayDate + '</span>' +
    '</li>'
  )).join('');
}

/* ---------- Populate summary & narrative ---------- */

function updateSummary() {
  const amountEl = document.getElementById('amount');
  const amount = Number(amountEl ? amountEl.value : 0) || 0;
  const formatted = 'Rs. (' + indianFormat(amount) + '/-)';

  const summaryAmt = document.getElementById('summaryAmount');
  if (summaryAmt) summaryAmt.textContent = formatted;

  const tableAmt = document.getElementById('tableAmount');
  if (tableAmt) tableAmt.textContent = indianFormat(amount);

  const words = numberToWords(amount);
  const wordsText = amount > 0 ? 'Rupees ' + words + ' Only' : '\u2014';
  const summaryWords = document.getElementById('summaryWords');
  if (summaryWords) summaryWords.textContent = wordsText;

  const tableWords = document.getElementById('tableWords');
  if (tableWords) tableWords.textContent = amount > 0 ? 'Rupees ' + words + ' Only' : 'Zero';

  const empIdVal = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('empId')?.value || '').trim();
  const noteNumVal = (document.getElementById('tableNoteFileNum')?.value || '1').trim();
  const ref = claimRefFor(empIdVal, noteNumVal);
  const claimRefEl = document.getElementById('claimRef');
  if (claimRefEl) claimRefEl.textContent = ref;

  const noteDisplay = document.getElementById('noteFileNoDisplay');
  if (noteDisplay) noteDisplay.textContent = ref;

  const pdfNoteNum = document.getElementById('pdfNoteFileNum');
  if (pdfNoteNum) pdfNoteNum.textContent = noteNumVal || '1';

  const pdfYr = document.getElementById('pdfYear');
  if (pdfYr) pdfYr.textContent = (document.getElementById('tableYear')?.value || '2026').trim();
  const pdfMo = document.getElementById('pdfMonth');
  if (pdfMo) pdfMo.textContent = (document.getElementById('tableMonth')?.value || 'Sep').trim();

  const dtVal = document.getElementById('tableDt')?.value || document.getElementById('dt')?.value || SAMPLE.dt;
  const dtDisplay = document.getElementById('dtDisplay');
  if (dtDisplay) dtDisplay.textContent = fmtDate(dtVal);
}

function updateNarrative() {
  const name = (document.getElementById('tableTrainer')?.value || document.getElementById('trainerName')?.value || '').trim() || '(Trainer Name)';
  const emp = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('empId')?.value || '').trim() || '(Emp Id)';
  const amount = Number(document.getElementById('amount')?.value) || 0;
  const words = numberToWords(amount);
  const formatted = 'Rs. (' + indianFormat(amount) + '/-)';

  const nTrainer = document.getElementById('narrativeTrainer');
  if (nTrainer) nTrainer.textContent = name;
  const nEmp = document.getElementById('narrativeEmpId');
  if (nEmp) nEmp.textContent = emp;
  const nAmt = document.getElementById('narrativeAmount');
  if (nAmt) nAmt.textContent = indianFormat(amount);
  const nWords = document.getElementById('narrativeWords');
  if (nWords) nWords.textContent = amount > 0 ? 'Rupees ' + words + ' Only' : 'Zero';
}

/* ---------- Travel Table Sync & Row Management ---------- */

function parseKmsAllowance(val) {
  if (!val) return 80;
  const str = String(val).trim();

  // 1. Check if expression has multiplication: e.g. "35*10", "35KM * 10", "35 * ₹10 = 350"
  const beforeEquals = str.split('=')[0].trim();
  const multMatch = beforeEquals.match(/([\d.]+)\s*(?:km|kms)?\s*[*x×]\s*(?:[₹]|rs\.?)?\s*([\d.]+)/i);
  if (multMatch) {
    const km = parseFloat(multMatch[1]) || 0;
    const rate = parseFloat(multMatch[2]) || 0;
    return Math.round(km * rate);
  }

  // 2. Check if it has "= ₹350" or similar
  const eqMatch = str.match(/=\s*(?:[₹]|rs\.?)?\s*([\d.]+)/i);
  if (eqMatch) {
    return Math.round(parseFloat(eqMatch[1])) || 80;
  }

  // 3. Check for currency match: e.g. "₹80"
  const match = str.match(/[₹RS]\s*(\d+)/i) || str.match(/(\d+)\s*(?:RS|INR|₹)/i);
  if (match) return parseInt(match[1]) || 80;

  // 4. Multiple numbers fallback: e.g. "8*10"
  const numbers = str.match(/\d+(?:\.\d+)?/g);
  if (numbers && numbers.length >= 2) {
    const n1 = parseFloat(numbers[0]);
    const n2 = parseFloat(numbers[1]);
    return Math.round(n1 * n2);
  }
  if (numbers && numbers.length === 1) {
    const n = parseFloat(numbers[0]);
    return Math.round(n * 10);
  }
  return 80;
}

function formatAndCalculateKms(kmsInput) {
  if (!kmsInput) return;
  const raw = kmsInput.value.trim();
  if (!raw) return;

  const beforeEquals = raw.split('=')[0].trim();
  const multMatch = beforeEquals.match(/([\d.]+)\s*(?:km|kms)?\s*[*x×]\s*(?:[₹]|rs\.?)?\s*([\d.]+)/i);
  if (multMatch) {
    const km = parseFloat(multMatch[1]) || 0;
    const rate = parseFloat(multMatch[2]) || 0;
    const total = Math.round(km * rate);
    kmsInput.value = `${km}KM * ₹${rate} = ₹${total}`;
    return;
  }

  // Format if user wrote e.g. "35" or "35km"
  const singleMatch = raw.match(/^([\d.]+)\s*(?:km|kms)?$/i);
  if (singleMatch) {
    const km = parseFloat(singleMatch[1]) || 0;
    const rate = 10;
    const total = Math.round(km * rate);
    kmsInput.value = `${km}KM * ₹${rate} = ₹${total}`;
    return;
  }
}

function updateTravelRow(input) {
  const row = input.closest('tr');
  if (!row) return;
  const totalSpan = row.querySelector('.travel-total');
  const foodInput = row.querySelector('.travel-food-input') || row.querySelector('input[type="number"]');
  const kmsInput = row.querySelector('.travel-kms-input') || row.querySelectorAll('input[type="text"]')[2];

  const foodVal = parseInt(foodInput ? foodInput.value : 0) || 0;
  const kmsVal = parseKmsAllowance(kmsInput ? kmsInput.value : '');
  const totalVal = foodVal + kmsVal;

  if (totalSpan) totalSpan.textContent = totalVal;
  updateTravelGrandTotal();
}

function updateTravelGrandTotal() {
  const totalSpans = document.querySelectorAll('.travel-table tbody .travel-total');
  let sum = 0;
  totalSpans.forEach(span => {
    const raw = span.textContent.replace(/[^\d]/g, '');
    sum += Number(raw) || 0;
  });

  const footRow = document.querySelector('.travel-table tfoot .total-row');
  if (footRow) {
    const strongs = footRow.querySelectorAll('strong');
    if (strongs.length >= 2) {
      strongs[0].textContent = 'Total Amount: (Rupees ' + numberToWords(sum) + ' Only)';
      strongs[1].textContent = '₹' + indianFormat(sum);
    }
  }

  // Update claim amount to match travel breakdown
  const amtInput = document.getElementById('amount');
  if (amtInput) {
    amtInput.value = sum;
    updateSummary();
    updateNarrative();
  }
}

function attachTravelRowListeners(tr) {
  const foodInput = tr.querySelector('.travel-food-input') || tr.querySelector('input[type="number"]');
  if (foodInput) {
    foodInput.addEventListener('input', () => updateTravelRow(foodInput));
    foodInput.addEventListener('change', () => updateTravelRow(foodInput));
  }
  const kmsInput = tr.querySelector('.travel-kms-input') || tr.querySelectorAll('input[type="text"]')[2];
  if (kmsInput) {
    kmsInput.addEventListener('input', () => updateTravelRow(kmsInput));
    kmsInput.addEventListener('change', () => {
      formatAndCalculateKms(kmsInput);
      updateTravelRow(kmsInput);
    });
    kmsInput.addEventListener('blur', () => {
      formatAndCalculateKms(kmsInput);
      updateTravelRow(kmsInput);
    });
    kmsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        formatAndCalculateKms(kmsInput);
        updateTravelRow(kmsInput);
        kmsInput.blur();
      }
    });
  }
}

function getTodayIso() {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

function addTravelRow(data = {}) {
  const tbody = document.getElementById('travelTableBody') || document.querySelector('.travel-table tbody');
  if (!tbody) return;

  const today = getTodayIso();
  const dt = data.date || today;
  const from = data.from || 'Home';
  const to = data.to || 'College';
  const kms = data.kms || '8KM * ₹10 = ₹80';
  const mode = data.mode || 'Bike';
  const food = data.food !== undefined ? data.food : 0;
  const total = data.total !== undefined ? data.total : (Number(food) + parseKmsAllowance(kms));

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="date" value="${dt}" class="travel-input" /></td>
    <td><input type="text" value="${from}" class="travel-input" /></td>
    <td><input type="text" value="${to}" class="travel-input" /></td>
    <td><input type="text" value="${kms}" class="travel-input travel-kms-input" placeholder="e.g. 35*10" /></td>
    <td><input type="text" value="${mode}" class="travel-input" /></td>
    <td>
      <div class="travel-currency-wrap">
        <span class="currency-prefix">₹</span>
        <input type="number" value="${food}" class="travel-food-input" min="0" step="1" placeholder="0" oninput="updateTravelRow(this)" />
      </div>
    </td>
    <td><span style="font-weight:600;margin-right:2px;">₹</span><span class="travel-total">${total}</span></td>
    <td class="no-print">
      <button type="button" class="btn-del-row" title="Delete Row" onclick="deleteTravelRow(this)">&times;</button>
    </td>
  `;

  attachTravelRowListeners(tr);
  tbody.appendChild(tr);
  updateTravelGrandTotal();
}

function deleteTravelRow(btn) {
  const row = btn.closest('tr');
  if (!row) return;
  const tbody = row.closest('tbody');
  if (tbody && tbody.querySelectorAll('tr').length <= 1) {
    alert('At least one travel row is required in the claim breakdown.');
    return;
  }
  row.remove();
  updateTravelGrandTotal();
}

// Expose row management functions to global window scope
window.addTravelRow = addTravelRow;
window.deleteTravelRow = deleteTravelRow;
window.updateTravelRow = updateTravelRow;
window.syncPdfTravelTable = syncPdfTravelTable;

function syncPdfTravelTable() {
  const srcRows = document.querySelectorAll('.travel-table tbody tr');
  const targetBody = document.getElementById('pdfTravelBody');
  if (!targetBody) return;
  targetBody.innerHTML = '';

  let grandTotal = 0;
  srcRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const totalSpan = row.querySelector('.travel-total');
    if (!inputs.length) return;

    const dt = fmtDate(inputs[0]?.value || '') || fmtDate(getTodayIso());
    const from = inputs[1]?.value || '';
    const to = inputs[2]?.value || '';
    const kms = inputs[3]?.value || '8KM * ₹10 = ₹80';
    const mode = inputs[4]?.value || '';
    const food = inputs[5]?.value || '0';
    const total = totalSpan ? totalSpan.textContent.replace(/[^\d]/g, '').trim() : (parseInt(food) + parseKmsAllowance(kms));
    grandTotal += Number(total) || 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:2.5px 3px;border:1px solid #444;text-align:center;font-size:16px;">${dt}</td>
      <td style="padding:2.5px 3px;border:1px solid #444;text-align:center;font-size:16px;">${from}</td>
      <td style="padding:2.5px 3px;border:1px solid #444;text-align:center;font-size:16px;">${to}</td>
      <td style="padding:2.5px 3px;border:1px solid #444;text-align:center;font-size:16px;">${kms}</td>
      <td style="padding:2.5px 3px;border:1px solid #444;text-align:center;font-size:16px;">${mode}</td>
      <td style="padding:2.5px 3px;border:1px solid #444;text-align:center;font-size:16px;">₹${food}</td>
      <td style="padding:2.5px 3px;border:1px solid #444;text-align:center;font-size:16px;">₹${total}</td>
    `;
    targetBody.appendChild(tr);
  });

  const travelTotalNum = document.getElementById('pdfTravelTotalNum');
  const travelTotalWords = document.getElementById('pdfTravelTotalWords');
  if (travelTotalNum) travelTotalNum.textContent = '₹' + indianFormat(grandTotal);
  if (travelTotalWords) {
    travelTotalWords.textContent = grandTotal > 0 ? 'Rupees ' + numberToWords(grandTotal) + ' Only' : 'Zero';
  }

  // Adjust table margin if rows are added, keeping exact 50px gap for standard 6 rows
  const pdfTravelTable = document.getElementById('pdfTravelTable');
  if (pdfTravelTable) {
    const rowCount = srcRows.length;
    const mb = rowCount <= 6 ? 50 : Math.max(8, 50 - (rowCount - 6) * 12);
    pdfTravelTable.style.marginBottom = mb + 'px';
  }
}

/* ---------- Sample loader ---------- */

function loadSample() {
  const today = getTodayIso();
  SAMPLE.dt = today;
  SAMPLE.travelDate = today;

  // Set hidden fields
  const hiddenFields = ['noteFileNo', 'dt', 'trainerName', 'empId', 'designation', 'department', 'college', 'course', 'district', 'travelDate', 'amount', 'regRef'];
  hiddenFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && SAMPLE[id] !== undefined) el.value = SAMPLE[id];
  });

  // Set visible table inputs
  const map = {
    tableYear: SAMPLE.year || '2026',
    tableMonth: SAMPLE.month || 'Sep',
    tableEmpId: SAMPLE.empId,
    tableEmpIdVal: SAMPLE.empId,
    tableNoteFileNum: SAMPLE.noteFileNum || '1',
    tableNoteNo: SAMPLE.noteFileNo,
    tableDt: SAMPLE.dt,
    tableTrainer: SAMPLE.trainerName,
    tableDesignation: SAMPLE.designation,
    tableDept: SAMPLE.department,
    tableCollege: SAMPLE.college,
    tableCourse: SAMPLE.course,
    tableDistrict: SAMPLE.district,
    tableTravel: SAMPLE.travelDate,
    regRef: SAMPLE.regRef,
    amount: SAMPLE.amount,
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = map[id];
  });

  // Reset and populate travel rows
  const tbody = document.getElementById('travelTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    const today = getTodayIso();
    const sampleRows = [
      { date: today, from: 'Home', to: 'College', kms: '8KM * ₹10 = ₹80', mode: 'Bike', food: 200, total: 280 },
      { date: today, from: 'College', to: 'Home', kms: '8KM * ₹10 = ₹80', mode: 'Bike', food: 0, total: 80 },
      { date: today, from: 'Home', to: 'College', kms: '8KM * ₹10 = ₹80', mode: 'Bike', food: 200, total: 280 },
      { date: today, from: 'College', to: 'Home', kms: '8KM * ₹10 = ₹80', mode: 'Bike', food: 0, total: 80 },
      { date: today, from: 'Home', to: 'College', kms: '8KM * ₹10 = ₹80', mode: 'Bike', food: 200, total: 280 },
      { date: today, from: 'College', to: 'Home', kms: '8KM * ₹10 = ₹80', mode: 'Bike', food: 0, total: 80 },
    ];
    sampleRows.forEach(r => addTravelRow(r));
  }

  // Load sample Page 2 images
  initSampleImages();

  updateSummary();
  updateNarrative();
  updateTravelGrandTotal();
}

/* ---------- Validation & submit ---------- */

function validate() {
  const trainerName = (document.getElementById('tableTrainer')?.value || document.getElementById('trainerName')?.value || '').trim();
  const empId = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('empId')?.value || '').trim();
  const college = (document.getElementById('tableCollege')?.value || document.getElementById('college')?.value || '').trim();
  const course = (document.getElementById('tableCourse')?.value || document.getElementById('course')?.value || '').trim();
  const district = (document.getElementById('tableDistrict')?.value || document.getElementById('district')?.value || '').trim();
  const travelDate = document.getElementById('tableTravel')?.value || document.getElementById('travelDate')?.value || '';
  const amount = Number(document.getElementById('amount')?.value) || 0;

  let ok = true;
  const missing = (label, cond) => {
    if (!cond && ok) { alert('Please fill in the required field: ' + label); ok = false; }
  };
  missing('Name of the Trainer', trainerName.length > 0);
  missing('Emp Id', empId.length > 0);
  missing('Name of the College(s)', college.length > 0);
  missing('Course Title', course.length > 0);
  missing('District', district.length > 0);
  missing('Travel Date', travelDate.length > 0);
  missing('Amount', amount > 0);
  if (ok && empId && !/^\d+$/.test(empId)) {
    alert('Emp Id must be numeric.');
    ok = false;
  }
  return ok;
}

/* ---------- PDF Generation ---------- */

async function generatePDF() {
  const trainerName = (document.getElementById('tableTrainer')?.value || document.getElementById('trainerName')?.value || '').trim() || 'Trainer';
  const empId = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('empId')?.value || '').trim() || '5800';
  const noteNum = (document.getElementById('tableNoteFileNum')?.value || '1').trim();
  const college = (document.getElementById('tableCollege')?.value || document.getElementById('college')?.value || '').trim() || 'College';
  const course = (document.getElementById('tableCourse')?.value || document.getElementById('course')?.value || '').trim() || 'Course';
  const district = (document.getElementById('tableDistrict')?.value || document.getElementById('district')?.value || '').trim() || 'District';
  const amount = Number(document.getElementById('amount')?.value) || 0;
  const noteNo = claimRefFor(empId, noteNum);
  const dtVal = document.getElementById('tableDt')?.value || document.getElementById('dt')?.value || '';
  const dt = fmtDate(dtVal) || '09/09/2026';
  const travelDateVal = document.getElementById('tableTravel')?.value || document.getElementById('travelDate')?.value || '';
  const travelDate = fmtDate(travelDateVal) || '01.09.2026';
  const regRef = (document.getElementById('regRef')?.value || '').trim() || 'Training Calendar.';
  const amountWords = numberToWords(amount);
  const designation = (document.getElementById('tableDesignation')?.value || document.getElementById('designation')?.value || '').trim() || 'Trainer';
  const department = (document.getElementById('tableDept')?.value || document.getElementById('department')?.value || '').trim() || 'SEAP';

  // Update PDF placeholders
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  const yr = (document.getElementById('tableYear')?.value || '2026').trim();
  const mo = (document.getElementById('tableMonth')?.value || 'Sep').trim();
  setTxt('pdfYear', yr);
  setTxt('pdfMonth', mo);
  setTxt('pdfTrainer', trainerName);
  setTxt('pdfTrainer2', trainerName);
  setTxt('pdfEmpId', empId);
  setTxt('pdfEmpId2', empId);
  setTxt('pdfEmpId3', empId);
  setTxt('pdfNoteFileNum', noteNum || '1');
  setTxt('pdfNoteNo', noteNo);
  setTxt('pdfDt', dt);
  setTxt('pdfDesignation', designation);
  setTxt('pdfDept', department);
  setTxt('pdfCollege', college);
  setTxt('pdfCourse', course);
  setTxt('pdfDistrict', district);
  setTxt('pdfTravel', travelDate);
  setTxt('pdfAmount', indianFormat(amount));
  setTxt('pdfAmount2', indianFormat(amount));
  setTxt('pdfWords', amount > 0 ? 'Rupees ' + amountWords + ' Only' : 'Zero');
  setTxt('pdfRegRef', regRef);

  // Sync travel breakdown rows into PDF
  syncPdfTravelTable();

  // Sync all uploaded images into PDF Page 2
  syncPdfImages();
  await waitForPdfImages();

  const element = document.getElementById('pdfTemplate');
  if (!element) {
    alert('PDF template element not found.');
    return;
  }

  const cleanFilename = 'Reimbursement_' + noteNo.replace(/[\/\\?%*:|"<>]/g, '-') + '.pdf';
  const opt = {
    margin: [10, 10, 10, 10],
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: 'legacy' }
  };

  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save().catch(function(err) {
      console.error('PDF error:', err);
      alert('PDF download could not be completed via html2pdf. Opening print dialog...');
      window.print();
    });
  } else {
    alert('PDF library not loaded. Opening print dialog...');
    window.print();
  }
}

function submit() {
  if (!validate()) return;
  const trainerName = (document.getElementById('tableTrainer')?.value || document.getElementById('trainerName')?.value || '').trim();
  const empId = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('empId')?.value || '').trim();
  const noteNum = (document.getElementById('tableNoteFileNum')?.value || '1').trim();
  const college = (document.getElementById('tableCollege')?.value || document.getElementById('college')?.value || '').trim();
  const course = (document.getElementById('tableCourse')?.value || document.getElementById('course')?.value || '').trim();
  const district = (document.getElementById('tableDistrict')?.value || document.getElementById('district')?.value || '').trim();
  const amount = Number(document.getElementById('amount')?.value) || 0;
  const amountFormatted = 'Rs. (' + indianFormat(amount) + '/-)';

  const claim = {
    ref: claimRefFor(empId, noteNum),
    noteNum: noteNum,
    trainerName: trainerName,
    empId: empId,
    college: college,
    course: course,
    district: district,
    amount: amount,
    amountFormatted: indianFormat(amount),
    date: document.getElementById('tableDt')?.value || document.getElementById('dt')?.value || '',
    displayDate: fmtDate(document.getElementById('tableDt')?.value || document.getElementById('dt')?.value || ''),
  };
  saveClaim(claim);
  renderHistory();

  const modalRef = document.getElementById('modalRef');
  if (modalRef) modalRef.textContent = claim.ref;
  const modalMsg = document.getElementById('modalMsg');
  if (modalMsg) {
    modalMsg.textContent =
      'Trainer ' + trainerName + ' (Emp Id ' + empId + ') — expenditure of ' + amountFormatted +
      ' for course "' + course + '" at ' + college + ' has been submitted for kind approval.';
  }

  const modal = document.getElementById('successModal');
  if (modal) {
    modal.removeAttribute('hidden');
    modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Automatically trigger PDF download after submit
  setTimeout(generatePDF, 500);
}

/* ---------- Setup Sync & Event Listeners ---------- */

function syncInput(visibleId, hiddenId, callback) {
  const visible = document.getElementById(visibleId);
  const hidden = document.getElementById(hiddenId);
  if (!visible) return;

  const onUpdate = () => {
    if (hidden) hidden.value = visible.value;
    if (callback) callback(visible.value);
  };

  visible.addEventListener('input', onUpdate);
  visible.addEventListener('change', onUpdate);
}

// EmpId two-way sync
const tableEmpId = document.getElementById('tableEmpId');
const tableEmpIdVal = document.getElementById('tableEmpIdVal');
const hiddenEmpId = document.getElementById('empId');

function onEmpIdChange(val) {
  const clean = val.trim();
  if (tableEmpId && tableEmpId.value !== clean) tableEmpId.value = clean;
  if (tableEmpIdVal && tableEmpIdVal.value !== clean) tableEmpIdVal.value = clean;
  if (hiddenEmpId) hiddenEmpId.value = clean;

  const yr = (document.getElementById('tableYear')?.value || '2026').trim();
  const mo = (document.getElementById('tableMonth')?.value || 'Sep').trim();
  const newNote = 'TASK/SEAP/' + yr + '/' + mo + '/' + (clean || '5800');
  const tableNote = document.getElementById('tableNoteNo');
  if (tableNote) tableNote.value = newNote;
  const hiddenNote = document.getElementById('noteFileNo');
  if (hiddenNote) hiddenNote.value = newNote;

  updateSummary();
  updateNarrative();
}

const tableYear = document.getElementById('tableYear');
const tableMonth = document.getElementById('tableMonth');
function onYearMonthChange() {
  const cleanEmp = (document.getElementById('tableEmpIdVal')?.value || '6374').trim();
  const yr = (tableYear?.value || '2026').trim();
  const mo = (tableMonth?.value || 'Sep').trim();
  const newNote = 'TASK/SEAP/' + yr + '/' + mo + '/' + (cleanEmp || '5800');
  const tableNote = document.getElementById('tableNoteNo');
  if (tableNote) tableNote.value = newNote;
  const hiddenNote = document.getElementById('noteFileNo');
  if (hiddenNote) hiddenNote.value = newNote;

  updateSummary();
}
if (tableYear) {
  tableYear.addEventListener('input', onYearMonthChange);
  tableYear.addEventListener('change', onYearMonthChange);
}
if (tableMonth) {
  tableMonth.addEventListener('input', onYearMonthChange);
  tableMonth.addEventListener('change', onYearMonthChange);
}

if (tableEmpId) {
  tableEmpId.addEventListener('input', () => onEmpIdChange(tableEmpId.value));
  tableEmpId.addEventListener('change', () => onEmpIdChange(tableEmpId.value));
}
if (tableEmpIdVal) {
  tableEmpIdVal.addEventListener('input', () => onEmpIdChange(tableEmpIdVal.value));
  tableEmpIdVal.addEventListener('change', () => onEmpIdChange(tableEmpIdVal.value));
}

// Sync other table inputs
syncInput('tableTrainer', 'trainerName', () => { updateSummary(); updateNarrative(); });
syncInput('tableDesignation', 'designation', () => {});
syncInput('tableDept', 'department', () => {});
syncInput('tableCollege', 'college', () => {});
syncInput('tableCourse', 'course', () => {});
syncInput('tableDistrict', 'district', () => {});
syncInput('tableTravel', 'travelDate', () => {});
syncInput('tableNoteNo', 'noteFileNo', () => updateSummary());
syncInput('tableDt', 'dt', () => updateSummary());

const tableNoteFileNum = document.getElementById('tableNoteFileNum');
if (tableNoteFileNum) {
  tableNoteFileNum.addEventListener('input', () => updateSummary());
  tableNoteFileNum.addEventListener('change', () => updateSummary());
}

// Amount listener
const amountInput = document.getElementById('amount');
if (amountInput) {
  amountInput.addEventListener('input', () => {
    updateSummary();
    updateNarrative();
  });
  amountInput.addEventListener('change', () => {
    updateSummary();
    updateNarrative();
  });
}

// Action buttons
const submitBtn = document.getElementById('submitBtn');
if (submitBtn) submitBtn.addEventListener('click', submit);

const downloadPdfBtn = document.getElementById('downloadPdfBtn');
if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', generatePDF);

const downloadModalPdfBtn = document.getElementById('downloadModalPdfBtn');
if (downloadModalPdfBtn) downloadModalPdfBtn.addEventListener('click', generatePDF);

const loadSampleBtn = document.getElementById('loadSampleBtn');
if (loadSampleBtn) loadSampleBtn.addEventListener('click', loadSample);

const addTravelRowBtn = document.getElementById('addTravelRowBtn');
if (addTravelRowBtn) addTravelRowBtn.addEventListener('click', () => addTravelRow());

const closeModalBtn = document.getElementById('closeModalBtn');
const successModal = document.getElementById('successModal');
if (closeModalBtn && successModal) {
  closeModalBtn.addEventListener('click', () => successModal.setAttribute('hidden', ''));
}
if (successModal) {
  successModal.addEventListener('click', e => {
    if (e.target === successModal) successModal.setAttribute('hidden', '');
  });
}

// Ensure ALL calendar date inputs reflect the current date across all responsive designs
function initAllDateInputsToCurrent() {
  const todayIso = getTodayIso();

  // 1. All input[type="date"] in forms, tables, and rows
  document.querySelectorAll('input[type="date"]').forEach(inp => {
    inp.value = todayIso;
  });

  // 2. Specific claim date fields and hidden sync fields
  const tableDt = document.getElementById('tableDt');
  if (tableDt) tableDt.value = todayIso;
  const hiddenDt = document.getElementById('dt');
  if (hiddenDt) hiddenDt.value = todayIso;

  const tableTravel = document.getElementById('tableTravel');
  if (tableTravel) tableTravel.value = todayIso;
  const hiddenTravel = document.getElementById('travelDate');
  if (hiddenTravel) hiddenTravel.value = todayIso;

  // 3. Header text date display
  const dtDisplay = document.getElementById('dtDisplay');
  if (dtDisplay) dtDisplay.textContent = fmtDate(todayIso);
}
initAllDateInputsToCurrent();

// Attach listeners to all initial rows in travel table
document.querySelectorAll('.travel-table tbody tr').forEach(tr => {
  attachTravelRowListeners(tr);
});

/* ---------- Image Handling (PDF Page 2 Supporting Documents) ---------- */

// Store active image data URLs in memory:
// 1 = Training Photo, 2 = Portal Screenshot, 3 = Google Maps Screenshot
window.uploadedImages = {
  1: '',
  2: '',
  3: ''
};

function initSampleImages() {
  const photo = window.SAMPLE_IMG_PHOTO || 'images/sample_training_photo.png';
  const portal = window.SAMPLE_IMG_SCREENSHOT || 'images/sample_portal_screenshot.png';
  const map = window.SAMPLE_IMG_MAP || 'images/sample_map_screenshot.png';

  applyImageToUIAndPdf(1, photo);
  applyImageToUIAndPdf(2, portal);
  applyImageToUIAndPdf(3, map);
}

function applyImageToUIAndPdf(idx, dataUrl) {
  window.uploadedImages[idx] = dataUrl;

  const previewImg = document.getElementById('webImgPreview' + idx);
  const pdfImg = document.getElementById('pdfImg' + idx);
  const placeholder = document.getElementById('emptyPlaceholder' + idx);
  const wrapper = document.getElementById('pdfImgWrapper' + idx);

  if (previewImg) {
    previewImg.src = dataUrl;
    previewImg.style.display = 'block';
  }
  if (placeholder) {
    placeholder.style.display = 'none';
  }
  if (pdfImg) {
    pdfImg.src = dataUrl;
    pdfImg.style.display = 'block';
  }
  if (wrapper) {
    wrapper.style.display = 'block';
  }
}

function handleImageSelect(input, targetIdx) {
  const file = input.files && input.files[0];
  if (!file) return;

  const idx = targetIdx || (input.id === 'fileInput1' ? 1 : input.id === 'fileInput2' ? 2 : 3);

  const reader = new FileReader();
  reader.onload = (e) => {
    const rawDataUrl = e.target.result;

    // Optimize/downscale high-res images to avoid huge memory/canvas freezing in html2pdf
    const img = new Image();
    img.onload = () => {
      const maxDim = 1600;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const optimizedUrl = canvas.toDataURL(format, 0.88);
        applyImageToUIAndPdf(idx, optimizedUrl);
      } catch (err) {
        applyImageToUIAndPdf(idx, rawDataUrl);
      }
    };
    img.onerror = () => {
      applyImageToUIAndPdf(idx, rawDataUrl);
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

function clearImage(idx) {
  window.uploadedImages[idx] = '';

  const fileInput = document.getElementById('fileInput' + idx);
  const previewImg = document.getElementById('webImgPreview' + idx);
  const pdfImg = document.getElementById('pdfImg' + idx);
  const placeholder = document.getElementById('emptyPlaceholder' + idx);
  const wrapper = document.getElementById('pdfImgWrapper' + idx);

  if (fileInput) fileInput.value = '';
  if (previewImg) {
    previewImg.src = '';
    previewImg.style.display = 'none';
  }
  if (placeholder) {
    placeholder.style.display = 'block';
  }
  if (pdfImg) {
    pdfImg.src = '';
    pdfImg.style.display = 'none';
  }
  if (wrapper) {
    wrapper.style.display = 'none';
  }
}

function syncPdfImages() {
  [1, 2, 3].forEach(idx => {
    const webImg = document.getElementById('webImgPreview' + idx);
    const pdfImg = document.getElementById('pdfImg' + idx);
    const wrapper = document.getElementById('pdfImgWrapper' + idx);

    const activeSrc = (webImg && webImg.src && webImg.style.display !== 'none' && !webImg.src.endsWith('/'))
      ? webImg.src
      : (window.uploadedImages && window.uploadedImages[idx]) || '';

    if (activeSrc) {
      if (pdfImg) {
        pdfImg.src = activeSrc;
        pdfImg.style.display = 'block';
      }
      if (wrapper) wrapper.style.display = 'block';
    } else {
      if (pdfImg) {
        pdfImg.src = '';
        pdfImg.style.display = 'none';
      }
      if (wrapper) wrapper.style.display = 'none';
    }
  });
}

async function waitForPdfImages() {
  const imgs = [
    document.getElementById('pdfImg1'),
    document.getElementById('pdfImg2'),
    document.getElementById('pdfImg3')
  ].filter(Boolean);

  await Promise.all(imgs.map(img => {
    if (!img.src || img.style.display === 'none') return Promise.resolve();
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      setTimeout(resolve, 400);
    });
  }));
}

function setupDragAndDrop(areaId, inputId, callback) {
  const area = document.getElementById(areaId);
  const input = document.getElementById(inputId);
  if (!area || !input) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    area.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      area.classList.add('drag-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    area.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      area.classList.remove('drag-active');
    }, false);
  });

  area.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length) {
      input.files = files;
      if (callback) callback(input);
    }
  }, false);
}

function setupImageUploadListeners() {
  [1, 2, 3].forEach(idx => {
    const f = document.getElementById('fileInput' + idx);
    if (f) f.addEventListener('change', () => handleImageSelect(f, idx));
    setupDragAndDrop('previewArea' + idx, 'fileInput' + idx, inp => handleImageSelect(inp, idx));
  });
}

// Expose functions globally
window.handleImageSelect = handleImageSelect;
window.clearImage = clearImage;
window.syncPdfImages = syncPdfImages;
window.initSampleImages = initSampleImages;
window.generatePDF = generatePDF;

setupImageUploadListeners();

// Initialize sample images
initSampleImages();

// Initial render
updateSummary();
updateNarrative();
updateTravelGrandTotal();
renderHistory();

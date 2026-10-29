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

const SAMPLE_OUTSIDE = {
  year: '2026',
  month: 'Sep',
  noteFileNo: 'TASK/SEAP/2026/Sep/6374',
  noteFileNum: '1',
  dt: getTodayIso(),
  trainerName: 'Ashok Kumar Naik Guguloth',
  empId: '6374',
  designation: 'Technical Trainer',
  department: 'SEAP',
  college: 'Govt Degree College, Warangal',
  course: 'Full Stack Web Development',
  district: 'Warangal',
  travelDate: getTodayIso(),
  amount: 2700,
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
  const id = (empId || document.getElementById('tableEmpIdVal')?.placeholder || document.getElementById('tableEmpId')?.placeholder || '6374').trim();
  const num = (noteFileNum !== undefined && noteFileNum !== null ? String(noteFileNum) : (document.getElementById('tableNoteFileNum')?.value || '1')).trim();
  const yr = (document.getElementById('tableYear')?.value || '2026').trim();
  const mo = (document.getElementById('tableMonth')?.value || 'Sep').trim();
  const base = 'TASK/SEAP/' + yr + '/' + mo + '/' + (id || '6374');
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

function updateTravelRowNumbers() {
  const tbody = document.getElementById('travelTableBody') || document.querySelector('.travel-table tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    let snoCell = tr.querySelector('.travel-sno');
    if (!snoCell) {
      snoCell = document.createElement('td');
      snoCell.className = 'travel-sno';
      tr.insertBefore(snoCell, tr.firstChild);
    }
    snoCell.textContent = String(index + 1);
  });
}

function addTravelRow(data = {}) {
  const tbody = document.getElementById('travelTableBody') || document.querySelector('.travel-table tbody');
  if (!tbody) return;

  const headerKm = document.getElementById('headerKmsInput')?.value;
  const defaultFormula = (headerKm && !isNaN(parseFloat(headerKm)))
    ? `${parseFloat(headerKm)}KM * ₹10 = ₹${Math.round(parseFloat(headerKm) * 10)}`
    : '8KM * ₹10 = ₹80';

  const rows = tbody.querySelectorAll('tr');
  const rowIndex = rows.length;
  // Static repeating flow: 1st trip of day (even index 0, 2, 4...) is ₹200, 2nd trip (odd index 1, 3, 5...) is ₹0
  const defaultFood = (rowIndex % 2 === 0) ? 200 : 0;
  const food = data.food !== undefined ? Number(data.food) : defaultFood;

  const today = getTodayIso();
  const dt = data.date || today;
  const from = data.from || '';
  const to = data.to || '';
  const kms = data.kms || defaultFormula;
  const mode = data.mode || '';
  const total = data.total !== undefined ? data.total : (Number(food) + parseKmsAllowance(kms));

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="travel-sno">${rowIndex + 1}</td>
    <td><input type="date" value="${dt}" class="travel-input" /></td>
    <td><input type="text" value="${from}" placeholder="${rowIndex % 2 === 0 ? 'Home' : 'College'}" class="travel-input" /></td>
    <td><input type="text" value="${to}" placeholder="${rowIndex % 2 === 0 ? 'College' : 'Home'}" class="travel-input" /></td>
    <td><input type="text" value="${data.kms || ''}" placeholder="e.g. ${defaultFormula}" class="travel-input travel-kms-input" /></td>
    <td><input type="text" value="${mode}" placeholder="Bike" class="travel-input" /></td>
    <td>
      <span class="travel-food-static ${Number(food) === 0 ? 'zero' : ''}">₹${food}</span>
      <input type="hidden" class="travel-food-input" value="${food}" />
    </td>
    <td><span style="font-weight:600;margin-right:2px;">₹</span><span class="travel-total">${total}</span></td>
    <td class="no-print">
      <button type="button" class="btn-del-row" title="Delete Row" onclick="deleteTravelRow(this)">&times;</button>
    </td>
  `;

  attachTravelRowListeners(tr);
  tbody.appendChild(tr);
  updateTravelRowNumbers();
  updateTravelGrandTotal();
}

function refreshFoodWaterFlow() {
  const tbody = document.getElementById('travelTableBody') || document.querySelector('.travel-table tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    // Alternating static flow: 1st row = 200, 2nd row = 0, 3rd row = 200, 4th row = 0...
    const foodVal = (index % 2 === 0) ? 200 : 0;
    const foodSpan = tr.querySelector('.travel-food-static');
    const foodHidden = tr.querySelector('.travel-food-input');

    if (foodSpan) {
      foodSpan.textContent = `₹${foodVal}`;
      if (foodVal === 0) {
        foodSpan.classList.add('zero');
      } else {
        foodSpan.classList.remove('zero');
      }
    }
    if (foodHidden) {
      foodHidden.value = foodVal;
    }

    const totalSpan = tr.querySelector('.travel-total');
    const kmsInput = tr.querySelector('.travel-kms-input');
    const kmsVal = parseKmsAllowance(kmsInput ? kmsInput.value : '');
    const rowTotal = foodVal + kmsVal;
    if (totalSpan) totalSpan.textContent = rowTotal;
  });

  updateTravelRowNumbers();
  updateTravelGrandTotal();
  syncPdfTravelTable();
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
  updateTravelRowNumbers();
  refreshFoodWaterFlow();
}

function applyHeaderKmsToAllRows() {
  const headerInput = document.getElementById('headerKmsInput');
  if (!headerInput) return;
  const raw = headerInput.value.trim();
  if (raw === '') return;
  const km = parseFloat(raw);
  if (isNaN(km) || km < 0) return;

  const rate = 10;
  const formatted = `${km}KM * ₹${rate} = ₹${Math.round(km * rate)}`;

  const rows = document.querySelectorAll('#travelTableBody tr');
  rows.forEach(tr => {
    const kmsInput = tr.querySelector('.travel-kms-input');
    if (kmsInput) {
      kmsInput.value = formatted;
      updateTravelRow(kmsInput);
    }
  });

  updateTravelGrandTotal();
  syncPdfTravelTable();
}

// Expose row management functions to global window scope
window.addTravelRow = addTravelRow;
window.deleteTravelRow = deleteTravelRow;
window.updateTravelRow = updateTravelRow;
window.updateTravelRowNumbers = updateTravelRowNumbers;
window.syncPdfTravelTable = syncPdfTravelTable;
window.fitPdfToSinglePage = fitPdfToSinglePage;
window.applyHeaderKmsToAllRows = applyHeaderKmsToAllRows;
window.refreshFoodWaterFlow = refreshFoodWaterFlow;

function syncPdfTravelTable() {
  const srcRows = document.querySelectorAll('.travel-table tbody tr');
  const targetBody = document.getElementById('pdfTravelBody');
  if (!targetBody) return;
  targetBody.innerHTML = '';

  let grandTotal = 0;
  srcRows.forEach((row, index) => {
    const inputs = row.querySelectorAll('input');
    const totalSpan = row.querySelector('.travel-total');
    if (!inputs.length) return;

    const sno = index + 1;
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
      <td style="padding:2.5px 3px;border:1px solid #444;text-align:center;font-size:16px;">${sno}</td>
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
    travelTotalWords.textContent = grandTotal > 0 ? 'Rupees ' + numberToWords(grandTotal) + ' Only' : 'Rupees Zero Only';
  }

  // Dynamically fit Page 1 layout to single page budget
  fitPdfToSinglePage();
}

/**
 * Auto-scales claim details value spans if needed to guarantee
 * that values fit on a single horizontal line without wrapping or overflow.
 */
function fitClaimDetailsValues(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const valueTds = table.querySelectorAll('tbody td:nth-child(2), tbody td:nth-child(4)');
  valueTds.forEach(td => {
    const span = td.querySelector('span');
    if (!span) return;
    span.style.fontSize = '';
    let size = 15;
    while (td.scrollWidth > td.clientWidth + 0.5 && size > 10.5) {
      size -= 0.5;
      span.style.fontSize = size + 'px';
    }
  });
}

/**
 * Dynamic PDF Page 1 Layout Adjuster
 * Ensures all claim data, travel rows, full declaration, 3x3 approval matrix (with protected signing space),
 * and Version March 2025 footer fit strictly within a single A4 page.
 */
function fitPdfToSinglePage() {
  const page1 = document.getElementById('pdfPage1');
  if (!page1) return { isValid: false, pageHeight: 0, maxHeight: 1035 };

  // 281mm printable height - 12mm reserved for fixed footer & gap = 269mm @ 96 DPI (1016px ceiling)
  const MAX_PAGE_HEIGHT = 1015;

  const travelTable = document.getElementById('pdfTravelTable');
  const travelThs = travelTable ? Array.from(travelTable.querySelectorAll('thead th')) : [];
  const travelTds = travelTable ? Array.from(travelTable.querySelectorAll('tbody td, tfoot td')) : [];
  const approvalTable = document.getElementById('pdfApprovalTable');
  const approvalTds = approvalTable ? Array.from(approvalTable.querySelectorAll('td')) : [];
  const declBlock = document.getElementById('pdfDeclarationBlock');
  const declPs = declBlock ? Array.from(declBlock.querySelectorAll('p')) : [];
  const headerSection = document.getElementById('pdfHeaderSection');
  const headerMetaTds = headerSection ? Array.from(headerSection.querySelectorAll('#pdfEmpDetailsTable td')) : [];
  const narrativeBlock = document.getElementById('pdfNarrativeRefBlock');
  const narrativePs = narrativeBlock ? Array.from(narrativeBlock.querySelectorAll('p')) : [];
  const versionFooter = document.getElementById('pdfPage1Version');

  // Baseline Reset: clear previously applied inline styles before measuring
  page1.style.width = '190mm';
  page1.style.padding = '0 3.5mm 0 1.5mm';
  page1.style.boxSizing = 'border-box';

  if (travelTable) {
    travelTable.style.marginTop = '4px';
    travelTable.style.marginBottom = '32px';
    travelTable.style.fontSize = '16px';
  }
  travelThs.forEach(th => {
    th.style.padding = '2.5px 3px';
    th.style.fontSize = '16px';
    th.style.lineHeight = 'normal';
  });
  travelTds.forEach(td => {
    td.style.padding = '2.5px 3px';
    td.style.fontSize = '16px';
    td.style.lineHeight = 'normal';
  });

  if (approvalTable) {
    approvalTable.style.width = '100%';
    approvalTable.style.marginLeft = 'auto';
    approvalTable.style.marginRight = 'auto';
    approvalTable.style.marginTop = '4px';
  }
  approvalTds.forEach(td => {
    td.style.height = '72px';
    td.style.padding = '4px 6px';
    td.style.fontSize = '13px';
  });

  if (declBlock) {
    declBlock.style.marginTop = '0px';
  }
  declPs.forEach((p, idx) => {
    p.style.fontSize = '16px';
    p.style.lineHeight = '1.45';
    p.style.margin = idx === 2 ? '4px 0 2px 0' : '2px 0';
  });

  headerMetaTds.forEach((td, idx) => {
    const col = idx % 4;
    td.style.padding = (col === 2) ? '2px 0 2px 4px' : '2px 0';
    td.style.fontSize = '15px';
    td.style.whiteSpace = 'nowrap';
  });
  fitClaimDetailsValues('pdfEmpDetailsTable');

  if (narrativeBlock) {
    narrativeBlock.style.marginTop = '2px';
  }
  narrativePs.forEach((p, idx) => {
    p.style.fontSize = '16px';
    p.style.lineHeight = idx === 3 ? '1.45' : 'normal';
    p.style.margin = idx === 3 ? '4px 2px 4px 12px' : '1px 0';
  });

  if (versionFooter) {
    versionFooter.style.display = 'none';
  }

  function measureHeight() {
    return Math.ceil(Math.max(page1.getBoundingClientRect().height, page1.scrollHeight, page1.offsetHeight));
  }

  let currentH = measureHeight();
  if (currentH <= MAX_PAGE_HEIGHT) {
    return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'none' };
  }

  // Priority 1: Remove unnecessary margins and blank gaps
  const marginSteps = ['22px', '14px', '8px', '4px'];
  for (const mb of marginSteps) {
    if (travelTable) travelTable.style.marginBottom = mb;
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'margin-reduced' };
    }
  }

  // Priority 2: Reduce travel table cell padding
  const padSteps = ['2px 2.5px', '1.5px 2px', '1px 2px'];
  for (const pad of padSteps) {
    travelThs.forEach(th => th.style.padding = pad);
    travelTds.forEach(td => td.style.padding = pad);
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'padding-reduced' };
    }
  }

  // Priority 3: Use compact, readable table typography
  const fontSteps = ['15px', '14.5px', '14px', '13.5px', '13px', '12.5px'];
  for (const fs of fontSteps) {
    if (travelTable) travelTable.style.fontSize = fs;
    travelThs.forEach(th => th.style.fontSize = fs);
    travelTds.forEach(td => td.style.fontSize = fs);
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'table-font-reduced' };
    }
  }

  // Priority 4: Reduce unnecessary header and declaration spacing
  const declFontSteps = ['14.5px', '14px', '13.5px'];
  for (const dfs of declFontSteps) {
    headerMetaTds.forEach((td, idx) => {
      const col = idx % 4;
      td.style.fontSize = dfs;
      td.style.padding = (col === 2) ? '1px 0 1px 4px' : '1px 0';
    });
    narrativePs.forEach((p, idx) => {
      p.style.fontSize = dfs;
      p.style.lineHeight = idx === 3 ? '1.3' : 'normal';
      p.style.margin = idx === 3 ? '2px 2px 2px 8px' : '1px 0';
    });
    declPs.forEach(p => {
      p.style.fontSize = dfs;
      p.style.lineHeight = '1.3';
      p.style.margin = '1px 0';
    });
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'header-decl-compact' };
    }
  }

  // Priority 5: Adjust flexible section spacing while preserving original hierarchy
  if (travelTable) {
    travelTable.style.marginTop = '2px';
    travelTable.style.marginBottom = '2px';
  }
  if (approvalTable) approvalTable.style.marginTop = '2px';
  if (versionFooter) versionFooter.style.display = 'none';
  if (narrativeBlock) narrativeBlock.style.marginTop = '0px';

  currentH = measureHeight();
  if (currentH <= MAX_PAGE_HEIGHT) {
    return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'flexible-spacing-compact' };
  }

  // Priority 6: Extreme fallback (only when heavily overflowing, e.g. 15+ multi-line rows)
  // Approval cells baseline is 72px; strict minimum signing space is 50px (never below 50px!)
  const approvalHeightSteps = [66, 60, 56, 52, 50];
  for (const ah of approvalHeightSteps) {
    approvalTds.forEach(td => td.style.height = ah + 'px');
    travelThs.forEach(th => { th.style.padding = '1px 1.5px'; th.style.fontSize = '12px'; });
    travelTds.forEach(td => { td.style.padding = '1px 1.5px'; td.style.fontSize = '12px'; });
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'proportional-scaling-min50' };
    }
  }

  return {
    isValid: currentH <= 1045,
    pageHeight: currentH,
    maxHeight: MAX_PAGE_HEIGHT,
    adjustments: 'extreme'
  };
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

  // Reset header KMS to 8
  const headerKmsInput = document.getElementById('headerKmsInput');
  if (headerKmsInput) headerKmsInput.value = '8';

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
  clearImage(1);
  clearImage(2);
  clearImage(3);

  updateSummary();
  updateNarrative();
  updateTravelGrandTotal();
}

/* ---------- Validation & submit ---------- */

function validate() {
  const trainerName = (document.getElementById('tableTrainer')?.value || document.getElementById('trainerName')?.value || document.getElementById('tableTrainer')?.placeholder || '').trim();
  const empId = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('empId')?.value || document.getElementById('tableEmpIdVal')?.placeholder || '').trim();
  const college = (document.getElementById('tableCollege')?.value || document.getElementById('college')?.value || document.getElementById('tableCollege')?.placeholder || '').trim();
  const course = (document.getElementById('tableCourse')?.value || document.getElementById('course')?.value || document.getElementById('tableCourse')?.placeholder || '').trim();
  const district = (document.getElementById('tableDistrict')?.value || document.getElementById('district')?.value || document.getElementById('tableDistrict')?.placeholder || '').trim();
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

async function generatePDF(options = {}) {
  const trainerName = (document.getElementById('tableTrainer')?.value || document.getElementById('trainerName')?.value || '').trim() || document.getElementById('tableTrainer')?.placeholder || 'Ashok Kumar Naik Guguloth';
  const empId = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('empId')?.value || '').trim() || document.getElementById('tableEmpIdVal')?.placeholder || '6374';
  const noteNum = (document.getElementById('tableNoteFileNum')?.value || '1').trim();
  const college = (document.getElementById('tableCollege')?.value || document.getElementById('college')?.value || '').trim() || document.getElementById('tableCollege')?.placeholder || 'RC Khammam';
  const course = (document.getElementById('tableCourse')?.value || document.getElementById('course')?.value || '').trim() || document.getElementById('tableCourse')?.placeholder || 'FrontEnd';
  const district = (document.getElementById('tableDistrict')?.value || document.getElementById('district')?.value || '').trim() || document.getElementById('tableDistrict')?.placeholder || 'Khammam';
  const amount = Number(document.getElementById('amount')?.value) || 0;
  const noteNo = claimRefFor(empId, noteNum);
  const dtVal = document.getElementById('tableDt')?.value || document.getElementById('dt')?.value || '';
  const dt = fmtDate(dtVal) || '09/09/2026';
  const travelDateVal = document.getElementById('tableTravel')?.value || document.getElementById('travelDate')?.value || '';
  const travelDate = fmtDate(travelDateVal) || '01.09.2026';
  const regRef = (document.getElementById('regRef')?.value || '').trim() || 'Training Calendar.';
  const amountWords = numberToWords(amount);
  const designation = (document.getElementById('tableDesignation')?.value || document.getElementById('designation')?.value || '').trim() || document.getElementById('tableDesignation')?.placeholder || 'Technical Trainer';
  const department = (document.getElementById('tableDept')?.value || document.getElementById('department')?.value || '').trim() || document.getElementById('tableDept')?.placeholder || 'SEAP';

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

  // Wait for web fonts if available
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // 1. Sync travel breakdown rows into PDF
  syncPdfTravelTable();

  // 2. Sync all uploaded images into PDF Page 2
  syncPdfImages();
  await waitForPdfImages();

  // 3. Dynamically fit Page 1 layout
  const fitResult = fitPdfToSinglePage();

  const page1 = document.getElementById('pdfPage1');
  const page2 = document.getElementById('pdfPage2');
  if (!page1 || !page2) {
    alert('PDF template elements not found.');
    return;
  }

  const cleanFilename = 'Reimbursement_' + noteNo.replace(/[\/\\?%*:|"<>]/g, '-') + '.pdf';
  const opt = {
    margin: [8, 10, 8, 10],
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: false,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  if (typeof html2pdf === 'undefined') {
    alert('PDF library not loaded. Opening print dialog...');
    window.print();
    return;
  }

  try {
    // Ensure DOM footer is hidden during html2canvas capture so it never paints at moving positions
    const domFooter = document.getElementById('pdfPage1Version');
    if (domFooter) domFooter.style.display = 'none';

    // Render Page 1 to jsPDF
    const w1 = html2pdf().set(opt).from(page1);
    await w1.toPdf();
    const pdf = await w1.get('pdf');

    // Guarantee Page 1 is strictly 1 page
    while (pdf.internal.getNumberOfPages() > 1) {
      pdf.deletePage(pdf.internal.getNumberOfPages());
    }

    // Draw fixed footer on Page 1 at exact coordinates (independent of travel rows or content height)
    pdf.setPage(1);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    // Exact fixed coordinates: X = 198.5 mm (right aligned with 11.5mm right margin), Y = 288.5 mm (8.5mm bottom margin)
    pdf.text('Version March 2025', 198.5, 288.5, { align: 'right' });

    // Render Page 2 to canvas
    const w2 = html2pdf().set(opt).from(page2);
    await w2.toCanvas();
    const canvas2 = await w2.get('canvas');

    // Add Page 2
    pdf.addPage();
    const imgWidth = 190;
    const imgHeight = (canvas2.height * imgWidth) / canvas2.width;
    pdf.addImage(canvas2, 'JPEG', 10, 8, imgWidth, Math.min(281, imgHeight));

    // Guarantee total page count is strictly 2
    while (pdf.internal.getNumberOfPages() > 2) {
      pdf.deletePage(pdf.internal.getNumberOfPages());
    }

    const pageCount = pdf.internal.getNumberOfPages();

    const resultObj = {
      success: true,
      pdf: pdf,
      pageCount: pageCount,
      fitResult: fitResult,
      toPdf: () => ({
        get: async (key) => (key === 'pdf' ? pdf : resultObj)
      })
    };

    if (!options || options.save !== false) {
      pdf.save(cleanFilename);
    }

    return resultObj;
  } catch (err) {
    console.error('PDF error:', err);
    alert('PDF download could not be completed via html2pdf. Opening print dialog...');
    window.print();
  }
}

function submit() {
  if (!validate()) return;
  const trainerName = (document.getElementById('tableTrainer')?.value || document.getElementById('trainerName')?.value || document.getElementById('tableTrainer')?.placeholder || '').trim();
  const empId = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('empId')?.value || document.getElementById('tableEmpIdVal')?.placeholder || '').trim();
  const noteNum = (document.getElementById('tableNoteFileNum')?.value || '1').trim();
  const college = (document.getElementById('tableCollege')?.value || document.getElementById('college')?.value || document.getElementById('tableCollege')?.placeholder || '').trim();
  const course = (document.getElementById('tableCourse')?.value || document.getElementById('course')?.value || document.getElementById('tableCourse')?.placeholder || '').trim();
  const district = (document.getElementById('tableDistrict')?.value || document.getElementById('district')?.value || document.getElementById('tableDistrict')?.placeholder || '').trim();
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
  const empVal = clean || document.getElementById('tableEmpIdVal')?.placeholder || '6374';
  const newNote = 'TASK/SEAP/' + yr + '/' + mo + '/' + empVal;
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
  const cleanEmp = (document.getElementById('tableEmpIdVal')?.value || document.getElementById('tableEmpIdVal')?.placeholder || '6374').trim();
  const yr = (tableYear?.value || '2026').trim();
  const mo = (tableMonth?.value || 'Sep').trim();
  const newNote = 'TASK/SEAP/' + yr + '/' + mo + '/' + cleanEmp;
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
if (downloadModalPdfBtn) {
  downloadModalPdfBtn.addEventListener('click', () => {
    if (window.currentReimbursementType === 'outside-city') {
      generateOutsidePDF();
    } else {
      generatePDF();
    }
  });
}

const loadSampleBtn = document.getElementById('loadSampleBtn');
if (loadSampleBtn) loadSampleBtn.addEventListener('click', loadSample);

const addTravelRowBtn = document.getElementById('addTravelRowBtn');
if (addTravelRowBtn) addTravelRowBtn.addEventListener('click', () => addTravelRow());

// Table header KMS auto-calculator listener
const headerKmsInput = document.getElementById('headerKmsInput');
if (headerKmsInput) {
  headerKmsInput.addEventListener('input', applyHeaderKmsToAllRows);
  headerKmsInput.addEventListener('change', applyHeaderKmsToAllRows);
}

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
window.fitPdfToSinglePage = fitPdfToSinglePage;

setupImageUploadListeners();

// Start with empty proof slots on the Within City form.
[1, 2, 3].forEach(clearImage);

// Initial render
updateTravelRowNumbers();
updateSummary();
updateNarrative();
updateTravelGrandTotal();
syncPdfTravelTable();
renderHistory();

/* ========================================================================= */
/* ============ OUTSIDE-CITY REIMBURSEMENT MODULE (PHASE 1 & 2) ============ */
/* ========================================================================= */

window.currentReimbursementType = 'within-city';

const setTxt = (id, txt) => {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
};

function switchReimbursementType(type) {
  const viewWithin = document.getElementById('viewWithinCity');
  const viewOutside = document.getElementById('viewOutsideCity');
  const tabWithin = document.getElementById('tabWithinCity');
  const tabOutside = document.getElementById('tabOutsideCity');
  const headerTitle = document.getElementById('headerMainTitle');

  if (type === 'outside-city') {
    if (viewWithin) viewWithin.style.display = 'none';
    if (viewOutside) viewOutside.style.display = 'block';
    if (tabWithin) {
      tabWithin.classList.remove('active');
      tabWithin.setAttribute('aria-selected', 'false');
    }
    if (tabOutside) {
      tabOutside.classList.add('active');
      tabOutside.setAttribute('aria-selected', 'true');
    }
    if (headerTitle) headerTitle.textContent = 'Reimbursement Outside City';
    window.currentReimbursementType = 'outside-city';
    updateStickyHeaderHeight();
    syncOutsidePdfTravelTable();
  } else {
    if (viewOutside) viewOutside.style.display = 'none';
    if (viewWithin) viewWithin.style.display = 'block';
    if (tabOutside) {
      tabOutside.classList.remove('active');
      tabOutside.setAttribute('aria-selected', 'false');
    }
    if (tabWithin) {
      tabWithin.classList.add('active');
      tabWithin.setAttribute('aria-selected', 'true');
    }
    if (headerTitle) headerTitle.textContent = 'Reimbursement With-in City';
    window.currentReimbursementType = 'within-city';
    updateStickyHeaderHeight();
    syncPdfTravelTable();
  }
}

/**
 * Dynamically computes and updates the sticky header height CSS custom property
 * so that subordinate sticky elements (like desktop Claim Summary card) align perfectly.
 */
function updateStickyHeaderHeight() {
  const stickyHeader = document.getElementById('appStickyHeader');
  if (stickyHeader) {
    const h = stickyHeader.offsetHeight;
    document.documentElement.style.setProperty('--sticky-header-height', h + 'px');
  }
}
window.addEventListener('resize', updateStickyHeaderHeight);
window.addEventListener('DOMContentLoaded', updateStickyHeaderHeight);
window.updateStickyHeaderHeight = updateStickyHeaderHeight;

function updateOutsideTravelRowNumbers() {
  const tbody = document.getElementById('outsideTravelTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    let snoCell = tr.querySelector('.outside-sno');
    if (!snoCell) {
      snoCell = document.createElement('td');
      snoCell.className = 'outside-sno';
      tr.insertBefore(snoCell, tr.firstChild);
    }
    snoCell.textContent = String(index + 1);
  });
}

function updateOutsideRowTotal(inputOrRow) {
  const row = inputOrRow.closest ? inputOrRow.closest('tr') : inputOrRow;
  if (!row) return;

  const fareInp = row.querySelector('.outside-fare');
  const accomInp = row.querySelector('.outside-accom');
  const foodInp = row.querySelector('.outside-food');
  const totalSpan = row.querySelector('.outside-row-total');

  const fareVal = parseFloat(fareInp ? fareInp.value : 0) || 0;
  const accomVal = parseFloat(accomInp ? accomInp.value : 0) || 0;
  const foodVal = parseFloat(foodInp ? foodInp.value : 0) || 0;

  const rowTotal = Math.round(fareVal + accomVal + foodVal);
  if (totalSpan) totalSpan.textContent = indianFormat(rowTotal);

  updateOutsideGrandTotal();
}

function updateOutsideGrandTotal() {
  const rows = document.querySelectorAll('#outsideTravelTableBody tr');
  let sum = 0;
  rows.forEach(tr => {
    const totalSpan = tr.querySelector('.outside-row-total');
    if (totalSpan) {
      const raw = totalSpan.textContent.replace(/[^\d]/g, '');
      sum += Number(raw) || 0;
    }
  });

  const footNum = document.getElementById('outsideTravelTotalNum');
  const footWords = document.getElementById('outsideTravelTotalWords');
  if (footNum) footNum.textContent = '₹' + indianFormat(sum);
  if (footWords) {
    footWords.textContent = sum > 0 ? 'Rupees ' + numberToWords(sum) + ' Only' : 'Rupees Zero Only';
  }

  const amtInput = document.getElementById('outsideAmount');
  if (amtInput) amtInput.value = sum;

  updateOutsideSummary();
  updateOutsideNarrative();
  syncOutsidePdfTravelTable();
}

function addOutsideTravelRow(data = {}) {
  const tbody = document.getElementById('outsideTravelTableBody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  const rowIndex = rows.length;
  const today = getTodayIso();

  const from = data.from || '';
  const to = data.to || '';
  const startDate = data.startDate || today;
  const endDate = data.endDate || today;
  const distance = data.distance || '';
  const mode = data.mode || 'Train';
  const fare = data.fare !== undefined ? data.fare : 350;
  const accommodation = data.accommodation !== undefined ? data.accommodation : (rowIndex % 2 === 0 ? 1200 : 0);
  const food = data.food !== undefined ? data.food : (rowIndex % 2 === 0 ? 600 : 200);
  const total = Math.round((Number(fare) || 0) + (Number(accommodation) || 0) + (Number(food) || 0));

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="outside-sno">${rowIndex + 1}</td>
    <td><input type="text" value="${from}" class="outside-input outside-from" placeholder="${rowIndex % 2 === 0 ? 'Hyderabad (Secunderabad)' : 'Warangal (Kazipet)'}" /></td>
    <td><input type="text" value="${to}" class="outside-input outside-to" placeholder="${rowIndex % 2 === 0 ? 'Warangal (Kazipet)' : 'Hyderabad (Secunderabad)'}" /></td>
    <td><input type="date" value="${startDate}" class="outside-input outside-start-date" /></td>
    <td><input type="date" value="${endDate}" class="outside-input outside-end-date" /></td>
    <td><input type="text" value="${distance}" class="outside-input outside-distance" placeholder="e.g. 150 KM" /></td>
    <td>
      <select class="outside-input outside-select outside-mode">
        <option value="Train"${mode === 'Train' ? ' selected' : ''}>Train</option>
        <option value="Bus"${mode === 'Bus' ? ' selected' : ''}>Bus</option>
        <option value="Car / Cab"${mode === 'Car / Cab' ? ' selected' : ''}>Car / Cab</option>
        <option value="Bike"${mode === 'Bike' ? ' selected' : ''}>Bike</option>
        <option value="Auto"${mode === 'Auto' ? ' selected' : ''}>Auto</option>
        <option value="Flight"${mode === 'Flight' ? ' selected' : ''}>Flight</option>
        <option value="Other"${mode === 'Other' ? ' selected' : ''}>Other</option>
      </select>
    </td>
    <td><input type="number" min="0" step="any" value="${fare}" class="outside-input outside-fare" placeholder="0" /></td>
    <td><input type="number" min="0" step="any" value="${accommodation}" class="outside-input outside-accom" placeholder="0" /></td>
    <td><input type="number" min="0" step="any" value="${food}" class="outside-input outside-food" placeholder="0" /></td>
    <td><span style="font-weight:700;">₹</span><span class="outside-row-total">${indianFormat(total)}</span></td>
    <td class="no-print">
      <button type="button" class="btn-del-row" title="Delete Row" onclick="deleteOutsideTravelRow(this)">&times;</button>
    </td>
  `;

  attachOutsideTravelRowListeners(tr);
  tbody.appendChild(tr);
  updateOutsideTravelRowNumbers();
  updateOutsideGrandTotal();
}

function attachOutsideTravelRowListeners(tr) {
  const expenseInputs = tr.querySelectorAll('.outside-fare, .outside-accom, .outside-food');
  expenseInputs.forEach(inp => {
    inp.addEventListener('input', () => updateOutsideRowTotal(inp));
    inp.addEventListener('change', () => updateOutsideRowTotal(inp));
  });

  const otherInputs = tr.querySelectorAll('input, select');
  otherInputs.forEach(inp => {
    if (!inp.classList.contains('outside-fare') && !inp.classList.contains('outside-accom') && !inp.classList.contains('outside-food')) {
      inp.addEventListener('change', () => syncOutsidePdfTravelTable());
      inp.addEventListener('input', () => syncOutsidePdfTravelTable());
    }
  });
}

function deleteOutsideTravelRow(btn) {
  const row = btn.closest('tr');
  if (!row) return;
  const tbody = row.closest('tbody');
  if (tbody && tbody.querySelectorAll('tr').length <= 1) {
    alert('At least one travel row is required in the outside-city claim breakdown.');
    return;
  }
  row.remove();
  updateOutsideTravelRowNumbers();
  updateOutsideGrandTotal();
}

function updateOutsideSummary() {
  const amtInput = document.getElementById('outsideAmount');
  const val = parseInt(amtInput ? amtInput.value : 0) || 0;
  const words = val > 0 ? 'Rupees ' + numberToWords(val) + ' Only' : 'Zero';

  const sumAmt = document.getElementById('outsideSummaryAmount');
  const sumWrd = document.getElementById('outsideSummaryWords');
  const tblAmt = document.getElementById('outsideTableAmount');
  const tblWrd = document.getElementById('outsideTableWords');

  if (sumAmt) sumAmt.textContent = 'Rs. (' + indianFormat(val) + '/-)';
  if (sumWrd) sumWrd.textContent = words;
  if (tblAmt) tblAmt.textContent = indianFormat(val);
  if (tblWrd) tblWrd.textContent = words;

  const empId = (document.getElementById('outsideTableEmpIdVal')?.value || document.getElementById('outsideTableEmpId')?.placeholder || '6374').trim();
  const noteNum = (document.getElementById('outsideTableNoteFileNum')?.value || '1').trim();
  const yr = (document.getElementById('outsideTableYear')?.value || '2026').trim();
  const mo = (document.getElementById('outsideTableMonth')?.value || 'Sep').trim();
  const ref = `TASK/SEAP/${yr}/${mo}/${empId} / Note file No: ${noteNum}`;

  const claimRefEl = document.getElementById('outsideClaimRef');
  if (claimRefEl) claimRefEl.textContent = ref;
  const dispNote = document.getElementById('outsideNoteFileNoDisplay');
  if (dispNote) dispNote.textContent = ref;
  const dispDt = document.getElementById('outsideDtDisplay');
  const dtVal = document.getElementById('outsideTableDt')?.value || getTodayIso();
  if (dispDt) dispDt.textContent = fmtDate(dtVal);
}

function updateOutsideNarrative() {
  const trainer = (document.getElementById('outsideTableTrainer')?.value || document.getElementById('outsideTableTrainer')?.placeholder || '').trim();
  const empId = (document.getElementById('outsideTableEmpIdVal')?.value || document.getElementById('outsideTableEmpIdVal')?.placeholder || '').trim();
  const amt = parseInt(document.getElementById('outsideAmount')?.value || 0) || 0;

  const nTrainer = document.getElementById('outsideNarrativeTrainer');
  const nEmpId = document.getElementById('outsideNarrativeEmpId');
  const nAmt = document.getElementById('outsideNarrativeAmount');
  const nWords = document.getElementById('outsideNarrativeWords');

  if (nTrainer) nTrainer.textContent = trainer ? trainer : '(Trainer Name)';
  if (nEmpId) nEmpId.textContent = empId ? empId : '(Emp Id)';
  if (nAmt) nAmt.textContent = indianFormat(amt);
  if (nWords) nWords.textContent = amt > 0 ? 'Rupees ' + numberToWords(amt) + ' Only' : 'Zero';
}

function loadOutsideSample() {
  const today = getTodayIso();
  SAMPLE_OUTSIDE.dt = today;
  SAMPLE_OUTSIDE.travelDate = today;

  const map = {
    outsideTableYear: SAMPLE_OUTSIDE.year || '2026',
    outsideTableMonth: SAMPLE_OUTSIDE.month || 'Sep',
    outsideTableEmpId: SAMPLE_OUTSIDE.empId,
    outsideTableEmpIdVal: SAMPLE_OUTSIDE.empId,
    outsideTableNoteFileNum: SAMPLE_OUTSIDE.noteFileNum || '1',
    outsideTableNoteNo: SAMPLE_OUTSIDE.noteFileNo,
    outsideTableDt: SAMPLE_OUTSIDE.dt,
    outsideTableTrainer: SAMPLE_OUTSIDE.trainerName,
    outsideTableDesignation: SAMPLE_OUTSIDE.designation,
    outsideTableDept: SAMPLE_OUTSIDE.department,
    outsideTableCollege: SAMPLE_OUTSIDE.college,
    outsideTableCourse: SAMPLE_OUTSIDE.course,
    outsideTableDistrict: SAMPLE_OUTSIDE.district,
    outsideTableTravel: SAMPLE_OUTSIDE.travelDate,
  };

  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el && map[id] !== undefined) el.value = map[id];
  });

  const tbody = document.getElementById('outsideTravelTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    const sampleRows = [
      {
        from: 'Hyderabad (Secunderabad)',
        to: 'Warangal (Kazipet)',
        startDate: today,
        endDate: today,
        distance: '150 KM',
        mode: 'Train',
        fare: 350,
        accommodation: 1200,
        food: 600
      },
      {
        from: 'Warangal (Kazipet)',
        to: 'Hyderabad (Secunderabad)',
        startDate: today,
        endDate: today,
        distance: '150 KM',
        mode: 'Train',
        fare: 350,
        accommodation: 0,
        food: 200
      },
      {
        from: 'Hyderabad (Secunderabad)',
        to: 'Warangal (Kazipet)',
        startDate: today,
        endDate: today,
        distance: '150 KM',
        mode: 'Train',
        fare: 350,
        accommodation: 0,
        food: 200
      },
      {
        from: 'Warangal (Kazipet)',
        to: 'Hyderabad (Secunderabad)',
        startDate: today,
        endDate: today,
        distance: '150 KM',
        mode: 'Train',
        fare: 350,
        accommodation: 0,
        food: 200
      },
      {
        from: 'Hyderabad (Secunderabad)',
        to: 'Warangal (Kazipet)',
        startDate: today,
        endDate: today,
        distance: '150 KM',
        mode: 'Train',
        fare: 350,
        accommodation: 0,
        food: 200
      },
      {
        from: 'Warangal (Kazipet)',
        to: 'Hyderabad (Secunderabad)',
        startDate: today,
        endDate: today,
        distance: '150 KM',
        mode: 'Train',
        fare: 350,
        accommodation: 0,
        food: 200
      },
      {
        from: 'Hyderabad (Secunderabad)',
        to: 'Warangal (Kazipet)',
        startDate: today,
        endDate: today,
        distance: '150 KM',
        mode: 'Train',
        fare: 350,
        accommodation: 0,
        food: 200
      }
    ];
    sampleRows.forEach(r => addOutsideTravelRow(r));
  }

  initOutsideSampleImages();
  updateOutsideSummary();
  updateOutsideNarrative();
  updateOutsideGrandTotal();
}

function syncOutsidePdfTravelTable() {
  const srcRows = document.querySelectorAll('#outsideTravelTableBody tr');
  const targetBody = document.getElementById('pdfOutsideTravelBody');
  if (!targetBody) return;
  targetBody.innerHTML = '';

  let grandTotal = 0;
  srcRows.forEach((row, index) => {
    const sno = index + 1;
    const from = row.querySelector('.outside-from')?.value || '';
    const to = row.querySelector('.outside-to')?.value || '';
    const startDate = fmtDate(row.querySelector('.outside-start-date')?.value || '') || fmtDate(getTodayIso());
    const endDate = fmtDate(row.querySelector('.outside-end-date')?.value || '') || fmtDate(getTodayIso());
    const distance = row.querySelector('.outside-distance')?.value || '';
    const mode = row.querySelector('.outside-mode')?.value || 'Train';
    const fare = row.querySelector('.outside-fare')?.value || '0';
    const accom = row.querySelector('.outside-accom')?.value || '0';
    const food = row.querySelector('.outside-food')?.value || '0';
    const totalSpan = row.querySelector('.outside-row-total');
    const total = totalSpan ? totalSpan.textContent.replace(/[^\d]/g, '').trim() : (parseInt(fare) + parseInt(accom) + parseInt(food));
    grandTotal += Number(total) || 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:5.5%;box-sizing:border-box;">${sno}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:12.5%;box-sizing:border-box;white-space:normal;overflow-wrap:anywhere;">${from}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:12.5%;box-sizing:border-box;white-space:normal;overflow-wrap:anywhere;">${to}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:11.75%;box-sizing:border-box;">${startDate}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:11.75%;box-sizing:border-box;">${endDate}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:8%;box-sizing:border-box;">${distance}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:8%;box-sizing:border-box;">${mode}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:7%;box-sizing:border-box;">₹${indianFormat(fare)}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:7.5%;box-sizing:border-box;">₹${indianFormat(accom)}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:7.5%;box-sizing:border-box;">₹${indianFormat(food)}</td>
      <td style="padding:2.5px 2px;border:1px solid #444;text-align:center;font-size:12px;width:8%;box-sizing:border-box;">₹${indianFormat(total)}</td>
    `;
    targetBody.appendChild(tr);
  });

  const travelTotalNum = document.getElementById('pdfOutsideTravelTotalNum');
  const travelTotalWords = document.getElementById('pdfOutsideTravelTotalWords');
  if (travelTotalNum) travelTotalNum.textContent = '₹' + indianFormat(grandTotal);
  if (travelTotalWords) {
    travelTotalWords.textContent = grandTotal > 0 ? 'Rupees ' + numberToWords(grandTotal) + ' Only' : 'Rupees Zero Only';
  }

  // Also sync PDF metadata fields
  const trainer = document.getElementById('outsideTableTrainer')?.value || document.getElementById('outsideTableTrainer')?.placeholder || '';
  const empId = document.getElementById('outsideTableEmpIdVal')?.value || document.getElementById('outsideTableEmpIdVal')?.placeholder || '';
  const yr = document.getElementById('outsideTableYear')?.value || '2026';
  const mo = document.getElementById('outsideTableMonth')?.value || 'Sep';
  const noteNum = document.getElementById('outsideTableNoteFileNum')?.value || '1';
  const dtVal = document.getElementById('outsideTableDt')?.value || getTodayIso();
  const designation = document.getElementById('outsideTableDesignation')?.value || document.getElementById('outsideTableDesignation')?.placeholder || '';
  const dept = document.getElementById('outsideTableDept')?.value || document.getElementById('outsideTableDept')?.placeholder || '';
  const college = document.getElementById('outsideTableCollege')?.value || document.getElementById('outsideTableCollege')?.placeholder || '';
  const course = document.getElementById('outsideTableCourse')?.value || document.getElementById('outsideTableCourse')?.placeholder || '';
  const district = document.getElementById('outsideTableDistrict')?.value || document.getElementById('outsideTableDistrict')?.placeholder || '';
  const travelDate = document.getElementById('outsideTableTravel')?.value || getTodayIso();

  setTxt('pdfOutsideYear', yr);
  setTxt('pdfOutsideMonth', mo);
  setTxt('pdfOutsideEmpId', empId);
  setTxt('pdfOutsideEmpId2', empId);
  setTxt('pdfOutsideEmpId3', empId);
  setTxt('pdfOutsideNoteFileNum', noteNum);
  setTxt('pdfOutsideDt', fmtDate(dtVal));
  setTxt('pdfOutsideTrainer', trainer);
  setTxt('pdfOutsideTrainer2', trainer);
  setTxt('pdfOutsideDesignation', designation);
  setTxt('pdfOutsideDept', dept);
  setTxt('pdfOutsideCollege', college);
  setTxt('pdfOutsideCourse', course);
  setTxt('pdfOutsideDistrict', district);
  setTxt('pdfOutsideTravel', fmtDate(travelDate));
  setTxt('pdfOutsideAmount', indianFormat(grandTotal));
  setTxt('pdfOutsideAmount2', indianFormat(grandTotal));
  setTxt('pdfOutsideWords', grandTotal > 0 ? 'Rupees ' + numberToWords(grandTotal) + ' Only' : 'Rupees Zero Only');

  fitOutsidePdfToSinglePage();
}

/**
 * Dynamic Outside-City PDF Page 1 Layout Adjuster
 * Ensures all claim data, travel rows, full declaration, 3x3 approval matrix (with protected signing space),
 * and Version March 2025 footer fit strictly within a single A4 page.
 */
function fitOutsidePdfToSinglePage() {
  const page1 = document.getElementById('pdfOutsidePage1');
  if (!page1) return { isValid: false, pageHeight: 0, maxHeight: 1015 };

  const MAX_PAGE_HEIGHT = 1015;

  const travelTable = document.getElementById('pdfOutsideTravelTable');
  const travelThs = travelTable ? Array.from(travelTable.querySelectorAll('thead th')) : [];
  const travelTds = travelTable ? Array.from(travelTable.querySelectorAll('tbody td, tfoot td')) : [];
  const approvalTable = document.getElementById('pdfOutsideApprovalTable');
  const approvalTds = approvalTable ? Array.from(approvalTable.querySelectorAll('td')) : [];
  const declBlock = document.getElementById('pdfOutsideDeclarationBlock');
  const declPs = declBlock ? Array.from(declBlock.querySelectorAll('p')) : [];
  const headerSection = document.getElementById('pdfOutsideHeaderSection');
  const headerMetaTds = headerSection ? Array.from(headerSection.querySelectorAll('#pdfOutsideEmpDetailsTable td')) : [];
  const narrativeBlock = document.getElementById('pdfOutsideNarrativeRefBlock');
  const narrativePs = narrativeBlock ? Array.from(narrativeBlock.querySelectorAll('p')) : [];
  const versionFooter = document.getElementById('pdfOutsidePage1Version');

  // Baseline Reset
  page1.style.width = '190mm';
  page1.style.padding = '0 3.5mm 0 1.5mm';
  page1.style.boxSizing = 'border-box';

  const empDetailsTable = document.getElementById('pdfOutsideEmpDetailsTable');
  if (empDetailsTable) {
    empDetailsTable.style.width = '100%';
    empDetailsTable.style.marginLeft = 'auto';
    empDetailsTable.style.marginRight = 'auto';
  }

  if (travelTable) {
    travelTable.style.width = '100%';
    travelTable.style.marginLeft = 'auto';
    travelTable.style.marginRight = 'auto';
    travelTable.style.marginTop = '4px';
    travelTable.style.marginBottom = '28px';
    travelTable.style.fontSize = '12.5px';
  }
  travelThs.forEach(th => {
    th.style.padding = th.getAttribute('rowspan') ? '6px 2px' : '4px 2px';
    th.style.fontSize = th.getAttribute('rowspan') ? '12px' : '11.5px';
    th.style.lineHeight = '1.2';
    th.style.verticalAlign = 'middle';
    th.style.textAlign = 'center';
    th.style.whiteSpace = 'normal';
    th.style.overflowWrap = 'anywhere';
    th.style.background = '#ffffff';
  });
  travelTds.forEach(td => {
    td.style.padding = '3px 2px';
    td.style.fontSize = '12px';
    td.style.lineHeight = '1.2';
    td.style.verticalAlign = 'middle';
    td.style.whiteSpace = 'normal';
    td.style.overflowWrap = 'anywhere';
  });

  if (approvalTable) {
    approvalTable.style.width = '100%';
    approvalTable.style.marginLeft = 'auto';
    approvalTable.style.marginRight = 'auto';
    approvalTable.style.marginTop = '4px';
  }
  approvalTds.forEach(td => {
    td.style.height = '72px';
    td.style.padding = '4px 6px';
    td.style.fontSize = '13px';
  });

  if (declBlock) {
    declBlock.style.marginTop = '0px';
  }
  declPs.forEach((p, idx) => {
    p.style.fontSize = '16px';
    p.style.lineHeight = '1.45';
    p.style.margin = idx === 2 ? '4px 0 2px 0' : '2px 0';
  });

  headerMetaTds.forEach((td, idx) => {
    const col = idx % 4;
    td.style.padding = (col === 2) ? '2px 0 2px 4px' : '2px 0';
    td.style.fontSize = '15px';
    td.style.whiteSpace = 'nowrap';
  });
  fitClaimDetailsValues('pdfOutsideEmpDetailsTable');

  if (narrativeBlock) {
    narrativeBlock.style.marginTop = '2px';
  }
  narrativePs.forEach((p, idx) => {
    p.style.fontSize = '16px';
    p.style.lineHeight = idx === 3 ? '1.45' : 'normal';
    p.style.margin = idx === 3 ? '4px 2px 4px 12px' : '1px 0';
  });

  if (versionFooter) {
    versionFooter.style.display = 'none';
  }

  function measureHeight() {
    return Math.ceil(Math.max(page1.getBoundingClientRect().height, page1.scrollHeight, page1.offsetHeight));
  }

  let currentH = measureHeight();
  if (currentH <= MAX_PAGE_HEIGHT) {
    return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'none' };
  }

  // Priority 1: Reduce travelTable marginBottom
  const marginSteps = ['20px', '14px', '8px', '4px'];
  for (const mb of marginSteps) {
    if (travelTable) travelTable.style.marginBottom = mb;
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'margin-reduced' };
    }
  }

  // Priority 2: Reduce travel data cell padding
  const padSteps = ['2px 2px', '1.5px 2px', '1px 2px'];
  for (const pad of padSteps) {
    travelTds.forEach(td => td.style.padding = pad);
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'padding-reduced' };
    }
  }

  // Priority 3: Reduce table font sizes
  const fontSteps = ['11.5px', '11px', '10.5px', '10px'];
  for (const fs of fontSteps) {
    if (travelTable) travelTable.style.fontSize = fs;
    travelThs.forEach(th => th.style.fontSize = fs);
    travelTds.forEach(td => td.style.fontSize = fs);
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'table-font-reduced' };
    }
  }

  // Priority 4: Reduce header and declaration text sizes
  const declFontSteps = ['14.5px', '14px', '13.5px'];
  for (const dfs of declFontSteps) {
    headerMetaTds.forEach((td, idx) => {
      const col = idx % 4;
      td.style.fontSize = dfs;
      td.style.padding = (col === 2) ? '1px 0 1px 4px' : '1px 0';
    });
    narrativePs.forEach((p, idx) => {
      p.style.fontSize = dfs;
      p.style.lineHeight = idx === 3 ? '1.3' : 'normal';
      p.style.margin = idx === 3 ? '2px 2px 2px 8px' : '1px 0';
    });
    declPs.forEach(p => {
      p.style.fontSize = dfs;
      p.style.lineHeight = '1.3';
      p.style.margin = '1px 0';
    });
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'header-decl-compact' };
    }
  }

  // Priority 5: Reduce flexible margins
  if (travelTable) {
    travelTable.style.marginTop = '2px';
    travelTable.style.marginBottom = '2px';
  }
  if (approvalTable) approvalTable.style.marginTop = '2px';
  if (narrativeBlock) narrativeBlock.style.marginTop = '0px';

  currentH = measureHeight();
  if (currentH <= MAX_PAGE_HEIGHT) {
    return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'flexible-spacing-compact' };
  }

  // Priority 6: Safe proportional scaling of approval signature boxes (down to min 50px)
  const approvalHeightSteps = [66, 60, 56, 52, 50];
  for (const ah of approvalHeightSteps) {
    approvalTds.forEach(td => td.style.height = ah + 'px');
    travelThs.forEach(th => { th.style.padding = '3px 1.5px'; th.style.fontSize = '9.5px'; });
    travelTds.forEach(td => { td.style.padding = '1px 1.5px'; td.style.fontSize = '9.5px'; });
    currentH = measureHeight();
    if (currentH <= MAX_PAGE_HEIGHT) {
      return { isValid: true, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'proportional-scaling-min50' };
    }
  }

  return { isValid: false, pageHeight: currentH, maxHeight: MAX_PAGE_HEIGHT, adjustments: 'overflow' };
}

/* ---------- Outside-City Image Upload ---------- */
window.uploadedOutsideImages = {
  1: '',
  2: ''
};

function handleOutsideImageSelect(input, index) {
  const file = input.files && input.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    applyOutsideImageToUIAndPdf(index, e.target.result);
  };
  reader.readAsDataURL(file);
}

function applyOutsideImageToUIAndPdf(index, dataUrl) {
  window.uploadedOutsideImages[index] = dataUrl;
  const webImg = document.getElementById('outsideWebImgPreview' + index);
  const emptyPlaceholder = document.getElementById('outsideEmptyPlaceholder' + index);
  if (webImg) {
    webImg.src = dataUrl;
    webImg.style.display = 'block';
  }
  if (emptyPlaceholder) emptyPlaceholder.style.display = 'none';

  const pdfImg = document.getElementById('pdfOutsideImg' + index);
  if (pdfImg) pdfImg.src = dataUrl;
}

function clearOutsideImage(index) {
  window.uploadedOutsideImages[index] = '';
  const webImg = document.getElementById('outsideWebImgPreview' + index);
  const emptyPlaceholder = document.getElementById('outsideEmptyPlaceholder' + index);
  const fileInput = document.getElementById('outsideFileInput' + index);

  if (webImg) {
    webImg.src = '';
    webImg.style.display = 'none';
  }
  if (emptyPlaceholder) emptyPlaceholder.style.display = 'block';
  if (fileInput) fileInput.value = '';

  const pdfImg = document.getElementById('pdfOutsideImg' + index);
  if (pdfImg) pdfImg.src = '';
}

function initOutsideSampleImages() {
  const photo = window.SAMPLE_IMG_PHOTO || 'images/sample_training_photo.png';
  const portal = window.SAMPLE_IMG_SCREENSHOT || 'images/sample_portal_screenshot.png';

  applyOutsideImageToUIAndPdf(1, photo);
  applyOutsideImageToUIAndPdf(2, portal);
}

/* ---------- Outside-City Submission ---------- */
function submitOutside() {
  const trainerName = (document.getElementById('outsideTableTrainer')?.value || document.getElementById('outsideTableTrainer')?.placeholder || '').trim();
  const empId = (document.getElementById('outsideTableEmpIdVal')?.value || document.getElementById('outsideTableEmpIdVal')?.placeholder || '').trim();
  const noteNum = (document.getElementById('outsideTableNoteFileNum')?.value || '1').trim();
  const total = document.getElementById('outsideAmount')?.value || 0;

  const ref = `TASK/SEAP/2026/Sep/${empId || '6374'} / Note file No: ${noteNum || '1'}`;
  const modalRef = document.getElementById('modalRef');
  const modalMsg = document.getElementById('modalMsg');
  if (modalRef) modalRef.textContent = ref;
  if (modalMsg) modalMsg.textContent = `Your Outside-City reimbursement claim for Rs. ${indianFormat(total)} has been submitted for approval.`;

  const successModal = document.getElementById('successModal');
  if (successModal) successModal.removeAttribute('hidden');

  const record = {
    id: 'OUT-' + Date.now(),
    ref: ref,
    amount: total,
    date: getTodayIso(),
    trainer: trainerName || 'Ashok Kumar Naik Guguloth',
    type: 'Outside-City'
  };

  const list = JSON.parse(localStorage.getItem('reimburse_history_outside_v1') || '[]');
  list.unshift(record);
  localStorage.setItem('reimburse_history_outside_v1', JSON.stringify(list.slice(0, 10)));
  renderOutsideHistory();
}

function renderOutsideHistory() {
  const ul = document.getElementById('outsideHistoryList');
  if (!ul) return;
  const list = JSON.parse(localStorage.getItem('reimburse_history_outside_v1') || '[]');
  if (!list.length) {
    ul.innerHTML = '<li class="history-empty">No outside-city claims submitted yet in this session. Click "Submit for Kind Approval" above to record a claim.</li>';
    return;
  }
  ul.innerHTML = list.map(item => `
    <li class="history-item">
      <div>
        <strong>${item.ref}</strong> &middot; <span>${item.date}</span>
        <div style="font-size:12px;color:var(--muted);">${item.trainer} &middot; ₹${indianFormat(item.amount)}</div>
      </div>
      <span class="pill pill-draft" style="font-size:11px;">Submitted</span>
    </li>
  `).join('');
}

/* ---------- Outside-City PDF Generation (Phase 2 Ready) ---------- */
async function waitForOutsidePdfImages() {
  const imgs = [
    document.getElementById('pdfOutsideImg1'),
    document.getElementById('pdfOutsideImg2')
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

async function generateOutsidePDF(options = {}) {
  // Wait for web fonts if available
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // 1. Sync outside travel breakdown rows into PDF
  syncOutsidePdfTravelTable();

  // 2. Wait for supporting images to be ready
  await waitForOutsidePdfImages();

  // 3. Dynamically fit Page 1 layout
  const fitResult = fitOutsidePdfToSinglePage();

  const trainerName = (document.getElementById('outsideTableTrainer')?.value || document.getElementById('outsideTableTrainer')?.placeholder || 'Trainer').trim();
  const empId = (document.getElementById('outsideTableEmpIdVal')?.value || document.getElementById('outsideTableEmpIdVal')?.placeholder || '6374').trim();
  const cleanFilename = `TASK_SEAP_OutsideCity_Reimbursement_${empId}_${trainerName.replace(/\s+/g, '_')}.pdf`;

  const page1 = document.getElementById('pdfOutsidePage1');
  const page2 = document.getElementById('pdfOutsidePage2');

  if (!page1) {
    alert('PDF template not found.');
    return;
  }

  const opt = {
    margin: [8, 10, 8, 10],
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: false, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    const domFooter = document.getElementById('pdfOutsidePage1Version');
    if (domFooter) domFooter.style.display = 'none';

    const w1 = html2pdf().set(opt).from(page1);
    await w1.toPdf();
    const pdf = await w1.get('pdf');

    while (pdf.internal.getNumberOfPages() > 1) {
      pdf.deletePage(pdf.internal.getNumberOfPages());
    }

    pdf.setPage(1);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    pdf.text('Version March 2025', 198.5, 288.5, { align: 'right' });

    if (page2) {
      const w2 = html2pdf().set(opt).from(page2);
      await w2.toCanvas();
      const canvas2 = await w2.get('canvas');

      pdf.addPage();
      const imgWidth = 190;
      const imgHeight = (canvas2.height * imgWidth) / canvas2.width;
      pdf.addImage(canvas2, 'JPEG', 10, 8, imgWidth, Math.min(281, imgHeight));

      while (pdf.internal.getNumberOfPages() > 2) {
        pdf.deletePage(pdf.internal.getNumberOfPages());
      }
    }

    const pageCount = pdf.internal.getNumberOfPages();
    const resultObj = {
      success: true,
      pdf: pdf,
      pageCount: pageCount,
      fitResult: fitResult,
      toPdf: () => ({ get: async (key) => (key === 'pdf' ? pdf : resultObj) })
    };

    if (!options || options.save !== false) {
      pdf.save(cleanFilename);
    }
    return resultObj;
  } catch (err) {
    console.error('Outside PDF error:', err);
    alert('PDF generation could not complete. Opening print dialog...');
    window.print();
  }
}

/* ---------- Setup Outside-City Listeners & Init ---------- */
function setupOutsideListeners() {
  const loadBtn = document.getElementById('loadOutsideSampleBtn');
  if (loadBtn) loadBtn.addEventListener('click', loadOutsideSample);

  const addBtn = document.getElementById('addOutsideTravelRowBtn');
  if (addBtn) addBtn.addEventListener('click', () => addOutsideTravelRow());

  const subBtn = document.getElementById('outsideSubmitBtn');
  if (subBtn) subBtn.addEventListener('click', submitOutside);

  const pdfBtn = document.getElementById('downloadOutsidePdfBtn');
  if (pdfBtn) pdfBtn.addEventListener('click', generateOutsidePDF);

  // Live input sync
  const outsideInputIds = [
    'outsideTableTrainer', 'outsideTableEmpIdVal', 'outsideTableYear', 'outsideTableMonth',
    'outsideTableNoteFileNum', 'outsideTableDt', 'outsideTableDesignation', 'outsideTableDept',
    'outsideTableCollege', 'outsideTableCourse', 'outsideTableDistrict', 'outsideTableTravel', 'outsideAmount'
  ];
  outsideInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        updateOutsideSummary();
        updateOutsideNarrative();
        syncOutsidePdfTravelTable();
      });
      el.addEventListener('change', () => {
        updateOutsideSummary();
        updateOutsideNarrative();
        syncOutsidePdfTravelTable();
      });
    }
  });

  // Setup outside drag and drop
  [1, 2].forEach(idx => {
    const f = document.getElementById('outsideFileInput' + idx);
    if (f) f.addEventListener('change', () => handleOutsideImageSelect(f, idx));
    setupDragAndDrop('outsidePreviewArea' + idx, 'outsideFileInput' + idx, inp => handleOutsideImageSelect(inp, idx));
  });
}

// Expose Outside-City functions globally
window.switchReimbursementType = switchReimbursementType;
window.addOutsideTravelRow = addOutsideTravelRow;
window.deleteOutsideTravelRow = deleteOutsideTravelRow;
window.updateOutsideRowTotal = updateOutsideRowTotal;
window.updateOutsideGrandTotal = updateOutsideGrandTotal;
window.updateOutsideTravelRowNumbers = updateOutsideTravelRowNumbers;
window.updateOutsideSummary = updateOutsideSummary;
window.updateOutsideNarrative = updateOutsideNarrative;
window.loadOutsideSample = loadOutsideSample;
window.submitOutside = submitOutside;
window.renderOutsideHistory = renderOutsideHistory;
window.syncOutsidePdfTravelTable = syncOutsidePdfTravelTable;
window.generateOutsidePDF = generateOutsidePDF;
window.handleOutsideImageSelect = handleOutsideImageSelect;
window.clearOutsideImage = clearOutsideImage;
window.fitOutsidePdfToSinglePage = fitOutsidePdfToSinglePage;

setupOutsideListeners();
[1, 2].forEach(clearOutsideImage);
for (let row = 0; row < 7; row += 1) {
  addOutsideTravelRow({ fare: 0, accommodation: 0, food: 0 });
}
updateOutsideGrandTotal();
renderOutsideHistory();
switchReimbursementType('within-city');

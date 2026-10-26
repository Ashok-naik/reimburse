# Project Documentation: Training Reimbursement With-in City (Note File Portal)

**Organization:** Telangana Academy for Skill and Knowledge (TASK) / Special Employment Assistance Program (SEAP)  
**Project Name:** Training Reimbursement With-in City — Note File Based Claim Workflow Portal  
**Document Version:** 4.0.0  
**Status:** Production Ready  
**Date:** October 2026  
**Primary Architect / Contributor:** Ashok Kumar Naik Guguloth (Emp ID: 6374, Technical Trainer, SEAP)  

---

## 1. Executive Summary

The **Training Reimbursement With-in City Portal** is an enterprise-grade, offline-capable single-page web application (SPA) engineered for Technical Trainers and Administrative Officers under the **Telangana Academy for Skill and Knowledge (TASK)** and **Special Employment Assistance Program (SEAP)**. 

The application automates, standardizes, and digitizes the traditional paper-based "Note File" reimbursement workflow for local travel expenditures incurred during college training deployments. It replaces cumbersome physical paperwork, error-prone manual arithmetic, and fragmented attachment management with an intuitive, responsive web portal that generates a **pixel-perfect, strictly 2-page PDF** ready for institutional submission, multi-tiered bureaucratic scrutiny, and financial audit.

```
+-------------------------------------------------------------------------------+
|                             WEB INTERACTION LAYER                             |
|  [Trainer & Note Info] -> [Travel Table (Auto KM*Rate)] -> [Upload 3 Proofs]  |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                            CLIENT-SIDE CORE ENGINE                            |
|    - Live Arithmetic & Currency Parser   - Base64 In-Memory Image Pipeline    |
|    - Indian Number-to-Words Converter    - Zero-Taint Canvas Pre-Encoder      |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                            TWO-PAGE PDF COMPILER                              |
|  PAGE 1: Official Note File, Travel Breakdown, Narrative, Approval Matrix    |
|  PAGE 2: Supporting Proofs in Single Column (Photo, Portal, Google Map Pic)   |
+-------------------------------------------------------------------------------+
```

---

## 2. Problem Statement & Motivation

### 2.1 The Traditional Workflow Challenges
In educational outreach and technical skilling programs across regional districts (such as RC Khammam, Kodad, etc.), technical trainers commute daily between their bases and designated colleges. Historically, reimbursement was processed through physical note files formatted as Microsoft Word documents (`local_reimburse.docx`):

1. **Manual Math Errors:** Commute distances, per-kilometer motorcycle/car rates, and daily food/water allowances had to be calculated by hand. Inconsistencies between line items and summary totals often stalled finance approvals.
2. **Disjointed Number-to-Words Formatting:** Trainers had to manually convert currency numbers into formal Indian words (e.g., *Rupees One Thousand Eighty Only*), frequently introducing discrepancies.
3. **Evidence Fragmentation:** Government compliance mandates three strict pieces of evidence for each local travel claim:
   - A classroom photograph with enrolled students and the training banner.
   - A screenshot from the official college skilling portal showing session dates and student counts.
   - A verified Google Maps route directions screenshot showing departure, destination college, and measured kilometer distance.
   In traditional manual filing, these screenshots caused inconsistent page overflows, distorted aspect ratios, and extra blank pages.
4. **Bureaucratic Sign-Off Requirements:** Formal institutional governance requires a strict hierarchical approval matrix: *Initiator*, *Coordinator*, *Supervisor*, *Manager Accounts*, *COO*, and *Chief Executive Officer*. Note files had to strictly accommodate these signature blocks without spilling across arbitrary page breaks.

### 2.2 Project Goals
- Provide an all-in-one, browser-native portal operating with **zero backend dependencies** and **100% offline functionality**.
- Automate all calculations dynamically (subtotals, food allowances, grand totals, and Indian currency words).
- Provide an integrated proof-upload interface for all 3 required photographic attachments.
- Guarantee an exact **two-page PDF export** matching the official Telangana Government / TASK note file formatting standards, completely eliminating third-page spillover.

---

## 3. Technology Stack & Design Architecture

The application is built on a high-efficiency, lightweight, and resilient client-side stack designed to run in any modern web browser without requiring web servers, databases, or runtime environments like Node.js or Python.

| Component | Technology | Rationale & Purpose |
| :--- | :--- | :--- |
| **User Interface** | HTML5 (Semantic Structure) | Clean document markup ensuring native accessibility and deterministic print rendering. |
| **Styling & Layout** | CSS3 (Custom Properties & Flexbox/Grid) | Modern navy/slate design system, responsive forms, custom tables, print media stylesheets. |
| **Client Logic** | Vanilla JavaScript (ES6+) | Blazing fast DOM updates, live event listeners, arithmetic parser, regex matchers, drag-and-drop. |
| **PDF Rendering Engine**| `html2pdf.js` v0.10.1 (bundled) | Client-side HTML-to-Canvas rendering with jsPDF backend for native PDF binary creation. |
| **Safe Image Pipeline** | Base64 Data URL Architecture | Eliminates `SecurityError: Tainted canvas` exceptions when running directly from `file:///`. |
| **Persistence** | Browser `localStorage` API | Local caching of submitted claims, reference IDs, and submission timestamps. |

```
[Local Browser: file:/// or Static Host]
  │
  ├── index.html               (Main portal view & hidden #pdfTemplate container)
  ├── styles.css               (Enterprise design system & print formatting)
  ├── script.js                (Arithmetic, DOM listeners, image management, PDF generator)
  ├── sample_images_data.js    (Offline Base64 data strings for sample attachments)
  └── html2pdf.bundle.min.js   (Canvas & PDF generation library)
```

---

## 4. Functional Modules & Implementation Details

### 4.1 Module 1: Claim Identification & Note File Generator
- **Dynamic Note File Numbering:** Dynamically constructs official government-standard reference numbers in the format:
  $$\text{Reference} = \text{TASK/SEAP/}\{\text{Year}\}/\{\text{Month}\}/\{\text{EmpId}\} \text{ / Note file No: } \{\text{NoteNum}\}$$
- **Synchronized Date System:** Formats ISO date values (`YYYY-MM-DD`) into formal display dates (`DD/MM/YYYY` and `DD.MM.YYYY`).
- **Real-Time Data Propagation:** Updates the claim summary badge, narrative text, and PDF header synchronously as the user types.

### 4.2 Module 2: Trainer & Course Metadata
Captures deployment parameters including:
- Name of the Trainer (e.g., `Ashok Kumar Naik Guguloth`)
- Employee ID (e.g., `6374`)
- Designation (e.g., `Technical Trainer`)
- Department / Location (e.g., `SEAP`)
- College / Center Deployed (e.g., `RC Khammam`)
- Course Title (e.g., `FrontEnd`)
- District (e.g., `Khammam`)
- Travel Date (Defaults to current date via `new Date().toISOString().split('T')[0]`)

### 4.3 Module 3: Dynamic Travel Breakdown Engine
A dynamic travel grid with real-time arithmetic calculation:

```
+-----------------------------------------------------------------------------------------------------+
| Travel Date  |   From   |    To    |       KMS       | Mode | Food/Water | Total | Action         |
+--------------+----------+----------+-----------------+------+------------+-------+----------------+
| [2026-10-25] | College  | Home     | 8KM * ₹10 = ₹80 | Bike |   ₹ 200    | ₹ 280 | [ × ] (Delete) |
+-----------------------------------------------------------------------------------------------------+
| TOTAL AMOUNT: (Rupees One Thousand Eighty Only)                                    | ₹ 1,080        |
+-----------------------------------------------------------------------------------------------------+
```

- **Smart Arithmetic Expression Parser:** Users can type expressions such as `35*10`, `35KM * 10`, `40.7 * 10`, or `8KM * ₹10 = ₹80`. The parser matches the pattern:
  $$\text{RegEx: } /(\d+(?:\.\d+)?)\s*(?:km)?\s*[*xX×]\s*(?:[₹rRsS.]+)?\s*(\d+(?:\.\d+)?)/i$$
  It automatically calculates $\text{KM} \times \text{Rate}$, displays the formatted formula, and writes the calculated travel allowance.
- **Embedded Currency Prefix:** The Food/Water input box features a styled inline `₹` symbol prefix inside the control border, ensuring clean visual presentation.
- **Row-Level Summation:**
  $$\text{Row Total} = (\text{KM} \times \text{Rate}) + \text{Food Allowance}$$
- **Grand Total & Currency Words Generator:** Automatically sums all active rows and translates the numeric integer into capitalized Indian English words:
  $$1080 \longrightarrow \text{"Rupees One Thousand Eighty Only"}$$
- **Dynamic Row Management:** Users can add rows with pre-filled default dates and source/destination college pairings, or delete individual rows with instant total recalculation.

### 4.4 Module 4: Live Reimbursement Request Statement (Narrative)
Automatically generates a formal legal narrative citing the subject, training calendar reference, trainer identity, and expenditure:
> *"In this regard, I, **Ashok Kumar Naik Guguloth**, Emp Id **6374** spent an amount of **Rs. 1,080 /-** (**Rupees One Thousand Eighty Only**). Hence, I request you to reimburse the expenditure incurred by me. Submitted for Kind Approval."*

### 4.5 Module 5: Hierarchical Approval Matrix & Version Footer
Renders a structured 3×3 approval grid aligned with public-sector signing hierarchies inside the official PDF export template:
- **Tier 1 (Initiation):** Initiator $\rightarrow$ Coordinator $\rightarrow$ Supervisor
- **Tier 2 (Review):** Manager Accounts $\rightarrow$ *[Null]* $\rightarrow$ Chief Operating Officer (COO)
- **Tier 3 (Sanction):** *[Null]* $\rightarrow$ Chief Executive Officer (CEO) $\rightarrow$ *[Null]*
- **Formatting:** Fixed `72px` cell height with bottom-aligned text to provide ample room for physical or digital signatures and official rubber stamps while maintaining optimal vertical balance.
- **Web UI Streamlining & Action Flow:** On the interactive Web UI, the static approval grid card is disabled/hidden, and the **"Submit for Kind Approval"** action button is positioned directly after Module 6 (Supporting Documents / Attachments Card). This establishes a seamless, linear user journey: Claim Details $\rightarrow$ Travel Breakdown $\rightarrow$ Narrative Statement $\rightarrow$ Upload 3 Proofs $\rightarrow$ Submit for Kind Approval.
- **Institutional Version Footer (Page 1 Only):** Displays the official version label **`Version March 2025`** at the bottom right of Page 1, matching the exact position, font (`Calibri`), and layout of the reference document (`local_reimburse.docx`).

### 4.6 Module 6: Triple-Proof Evidence & Image Engine
Provides three dedicated image slots on the Web UI, organized in a responsive 3-column grid:
1. **Classroom Training Photo:** Proof of presence with students and official program banner.
2. **Training Details / Portal Screenshot:** Academic validation showing portal session registration and attendance numbers.
3. **Google Maps Route Screenshot ("Google Pic"):** Verified travel path, origin/destination pins, and odometer-checked distance.

**Features of the Image Engine:**
- **Interactive Controls:** Drag-and-drop dropzones, click-to-browse file inputs, live previews, and clear (`×`) buttons.
- **Automatic Client-Side Downscaling:** High-resolution smartphone photos (12MP–48MP) are downscaled to a maximum dimension of 1600px using an in-memory HTML5 Canvas and compressed at 88% JPEG quality. This prevents browser tab crashes, out-of-memory errors, and canvas freezing during PDF export.
- **Base64 Offline Initialization:** Default sample images are pre-loaded as Base64 strings from `sample_images_data.js`, avoiding CORS and `file:///` local protocol taint errors.

### 4.7 Module 7: Two-Page PDF Compilation Engine
The export engine leverages `html2pdf.js` with an isolated, fixed-dimension template (`width: 190mm`):
- **Page 1 Contents:** Running Header, Claim Metadata, Subject & Ref, Travel Breakdown Table, Narrative Statement, and Approval Matrix.
- **Page Break Control:** A zero-height delimiter with `page-break-before: always; break-before: page;` cleanly partitions Page 1 from Page 2.
- **Page 2 Single-Column Layout:** Renders all three images vertically in sequential order, each enclosed in an aesthetic border with formal bold headers.
- **Strict Height Budgeting:** Constrains image heights to `max-height: 74mm`, ensuring Page 2 utilizes vertical whitespace while strictly capping total height below the A4 threshold:
  $$\text{Total Page 2 Height} \approx 42\text{px (Header)} + 16\text{px (Gaps)} + 3 \times 308\text{px (Containers)} = 982\text{px} < 1047\text{px (A4 Max)}$$
  **Result:** Strictly 2 pages generated every time with **zero spillover**.

---

## 5. UI/UX Design System & Spacing Specifications

The interface implements a corporate palette tailored for educational and governmental applications:

```
Color Palette:
  --navy:         #16324f  (Headers, Primary Titles, Form Accents)
  --navy-dark:    #0f2338  (Hero Header, Total Highlights)
  --navy-light:   #2a5a8c  (Focus Rings, Hover Outlines)
  --gold:         #d4af37  (Accent Borders, Status Badges)
  --bg-slate:     #f1f5f9  (Page Background)
  --card-white:   #ffffff  (Elevated Card Surfaces)
  --border:       #e2e8f0  (Structural Table Borders)
  --text:         #1e293b  (High-Contrast Body Text)
  --muted:        #64748b  (Subtitles, Captions, Placeholders)
```

### Component Spacing Standard
As requested by institutional guidelines, cards follow a strict 15px vertical rhythm:
- `#claimDetailsCard` $\rightarrow$ `margin-bottom: 15px;`
- `#travelBreakdownCard` $\rightarrow$ `margin-bottom: 15px;`
- `#narrativeCard` $\rightarrow$ `margin-bottom: 15px;`
- `#approvalWorkflowCard` $\rightarrow$ `margin-bottom: 15px;`
- `#uploadImagesCard` $\rightarrow$ `margin-bottom: 15px;`

### 5.2 Multi-Device Responsive Architecture (Mobile, Tab, Notepad)
The system adapts seamlessly to any screen size across 3 distinct device tiers while preserving strict PDF isolation:
1. **Mobile Phones (< 640px - Samsung Galaxy, iPhone, Google Pixel):**
   - Single-column card flow with responsive container padding (`0 12px`) and card padding (`16px 14px`).
   - Claim details table converts to vertical mobile card inputs (`display: block`) with full-width touch-friendly inputs.
   - Travel breakdown table is enclosed in `.table-responsive` (`overflow-x: auto; min-width: 680px;`) with a visible swipe hint (`.table-scroll-hint`).
   - Supporting image upload cards stack vertically (1 column) with large touch-friendly upload buttons.
   - Full-width `#submitBtn` with comfortable $48\text{px}$ tap height.
2. **Tablets / Tabs (640px – 1024px - iPad Mini, iPad 10th Gen, Galaxy Tab):**
   - In portrait (640px – 900px), layout collapses into a single column with the Claim Summary rendered as a responsive stats grid.
   - In landscape (900px – 1024px), balanced 2-column grid (`1.7fr` / `1fr`) prevents input squishing.
   - Image upload cards display in a 2-column or 3-column layout.
3. **Notepads & Laptops (1024px – 1366px - Netbooks, 13" / 15.6" Laptops):**
   - Fluid `1.8fr` / `1fr` layout with $18\text{px}$–$20\text{px}$ gutters.
   - Full 8-column travel table displayed at full width without horizontal scrolling.
   - High-density 3-column image evidence upload grid.

---

## 6. Mathematical & Algorithmic Foundations

### 6.1 Indian Numbering System Converter
Unlike western numbering (millions, billions), Indian financial note files require grouping in Hundreds, Thousands, Lakhs, and Crores.

$$\text{Value} = \sum (\text{Crores} \times 10^7) + (\text{Lakhs} \times 10^5) + (\text{Thousands} \times 10^3) + \text{Remainder}$$

```javascript
// Function extract from script.js
function numberToWords(num) {
  const n = Math.round(Number(num) || 0);
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  // Combines components into: "Rupees [Words] Only"
}
```

### 6.2 Indian Currency Formatting Regex
Separates the final 3 digits with a comma, followed by pairs of 2 digits:
$$1080 \longrightarrow \text{"1,080"} \quad \vert \quad 125000 \longrightarrow \text{"1,25,000"}$$

---

## 7. Verification, Testing & Quality Assurance

Automated testing was conducted via Microsoft Edge headless browser connected via the Chrome DevTools Protocol (CDP) on Windows.

| Test Case | Scenario / Condition | Expected Behavior | Observed Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Arithmetic Travel Input | Typing `8KM * 10` evaluates to ₹80 | Subtotal computed as ₹80, grand total updated | **PASS** |
| **TC-02** | Food Currency Styling | Food input retains `₹` prefix beside amount | Prefix remains static, input parses clean integer | **PASS** |
| **TC-03** | Date Auto-Default | New rows created on current date | Populated with current client ISO date string | **PASS** |
| **TC-04** | Table Background Color | Header & total rows black text on white | High contrast `#000` text on `#fff` background | **PASS** |
| **TC-05** | Card Spacing Integrity | 15px vertical margin between cards | Exactly 15px margin confirmed via computed styles | **PASS** |
| **TC-06** | Image Downscaling | User uploads 5MB 4000×3000px photo | Resized to 1600px width, clean 88% JPEG data URL | **PASS** |
| **TC-07** | Proof Drag-and-Drop | Dragging image file into preview box | Triggers preview, updates in-memory array | **PASS** |
| **TC-08** | Single Column Page 2 | 3 photos arranged vertically on Page 2 | Confirmed sequential stack (Photo, Portal, Map) | **PASS** |
| **TC-09** | Height Utilization | Image max-height increased from 58mm to 74mm | Page 2 height increased from 805px to 982px | **PASS** |
| **TC-10** | Strict 2-Page PDF | Exporting claim to PDF via `html2pdf.js` | `pageCount === 2` strictly enforced | **PASS** |
| **TC-11** | Version Footer (Page 1 Only) | "Version March 2025" rendered at bottom right of Page 1 | Verified present on Page 1, absent on Page 2 | **PASS** |
| **TC-12** | Clean Page 2 Header | Note File No & Date removed from Page 2 top-right | Clean section header banner without metadata clutter | **PASS** |
| **TC-13** | Page 1 16px Font Sizing | Claim details, Sub/Ref, Travel Table & Narrative set to 16px | 16px rendered clearly across all 4 sections; 142px safety buffer; pageCount === 2 | **PASS** |
| **TC-14** | Post-Travel Breakdown Gap | 50px vertical spacing after Travel Table | Exactly 50px margin separation before Narrative; pageCount === 2 strictly maintained | **PASS** |
| **TC-15** | Approval Workflow Cell Height | Cell height adjusted by -30px (to 72px) | Ample room for official signatures/stamps; Page 1 height 930px; 117px safety buffer; pageCount === 2 | **PASS** |
| **TC-16** | Approval Workflow UI & Button Flow | Hide Approval Workflow card on Web UI; relocate Submit button after Supporting Documents card; keep Approval Workflow matrix in PDF template | Web UI hides #approvalWorkflowCard; #submitBtn appears directly after Supporting Documents card; PDF template retains 3x3 Approval Matrix intact; pageCount === 2 strictly maintained | **PASS** |
| **TC-17** | Multi-Device Responsive Architecture | Verify responsive presentation across mobile (360px-412px), tabs (768px-1024px), and notepads (1152px-1366px) | 100% pass across all 10 tested viewports; zero horizontal body overflow; .table-responsive smoothly scrollable; PDF template retains strict 2-page compilation (pageCount === 2) | **PASS** |
| **TC-18** | User-Friendly Modern Website UI | Transform website UI with clean labels, icons, sticky summary dashboard, pro-tip calculator banner, highlighted narrative tokens, and prominent CTA while strictly preserving PDF template | All interactive form fields functional with live 2-way sync; sticky sidebar with total callout; pro-tip travel banner; PDF template completely untouched and verified strictly 2 pages | **PASS** |

---

## 8. File Structure & Deployment

```
c:\Users\Ashok Kumar\Desktop\reimburse\
│
├── index.html                  # Main user portal view & hidden PDF generation template
├── styles.css                  # UI layout, responsive breakpoints, print/PDF rules
├── script.js                   # Arithmetic parser, dynamic table logic, PDF export engine
├── sample_images_data.js       # Base64-encoded strings for sample training & map images
├── html2pdf.bundle.min.js      # Bundled client-side HTML-to-PDF rendering library
├── local_reimburse.docx        # Institutional reference source document
└── images/                     # Raw sample images directory
    ├── sample_training_photo.png
    ├── sample_portal_screenshot.png
    └── sample_map_screenshot.png
```

### How to Run:
1. Double-click `index.html` in Windows Explorer to open directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.
2. Edit trainer details or travel breakdown rows as required.
3. Review auto-calculated totals, narrative statement, and upload slots.
4. Click **"Download PDF"** to compile and save the official 2-page claim document.

---

## 9. Conclusion & Operational Impact

The **TASK / SEAP Training Reimbursement Portal** delivers an automated, audit-compliant solution tailored to institutional reimbursement workflows. By enforcing arithmetic precision, embedding required visual evidence into a single-column layout, and guaranteeing an exact two-page output, the portal eliminates paperwork bottlenecks, reduces administrative turnaround time, and ensures high financial transparency.

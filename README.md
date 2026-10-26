# TASK / SEAP Training Reimbursement Portal

> **Live Website (GitHub Pages):** [https://ashok-naik.github.io/reimburse/](https://ashok-naik.github.io/reimburse/)

---

## 📌 Project Overview

The **TASK / SEAP Training Reimbursement Portal** is a production-grade, client-side web application designed for Technical Trainers and Coordinators under **TASK (Telangana Academy for Skill and Knowledge)** and **SEAP**.

The portal streamlines within-city training and conveyance expenditure reimbursement claims through automated arithmetic calculations, live legal narrative synchronization, triple-proof evidence attachment, and guaranteed **strict 2-page institutional PDF export**.

---

## 🚀 Live Demo

Access the live application directly in your browser:  
🔗 **[https://ashok-naik.github.io/reimburse/](https://ashok-naik.github.io/reimburse/)**

---

## ✨ Key Features

- **Automated Arithmetic Mileage Engine:** Type natural multiplication formulas such as `8*10`, `35*10`, or `8KM * ₹10 = ₹80` in the distance/rate column to calculate travel allowance automatically.
- **Two-Way Real-Time Data Sync:** Updates to trainer identity, employee ID, note file numbers, or amounts immediately reflect across the form, summary cards, and the legal narrative statement.
- **Indian Financial Numbering & Words Converter:** Converts numeric sums (e.g. `₹1,080`) into formalized Indian currency text (*"Rupees One Thousand Eighty Only"*).
- **Triple-Proof Evidence System:** Upload dropzones for:
  1. Classroom Training Photo (with student banner)
  2. Training Details / Portal Attendance Screenshot
  3. Google Maps Route & Distance Screenshot
- **Strict 2-Page PDF Export Guarantee:** Zero-spillover PDF compilation via `html2pdf.js`:
  - **Page 1:** Header metadata, claim details, travel breakdown table, legal narrative declaration, 3×3 approval matrix, and `Version March 2025` footer.
  - **Page 2:** Single-column layout embedding all 3 visual proofs.
- **Multi-Device Responsive Design:** Tailored user experience across:
  - 📱 **Mobile Phones (< 640px):** Single-column stacked layout, touch-scrollable travel table, full-width thumb-friendly buttons.
  - 📟 **Tablets / Tabs (640px – 1024px):** Responsive 4-stat metric dashboard, fluid image grid.
  - 💻 **Notepads & Laptops (1024px – 1366px):** Sticky summary sidebar, full-width travel grid.

---

## 🛠️ Technology Stack

- **Markup & Layout:** HTML5 (Semantic Structure)
- **Styling:** Modern CSS3 (CSS Grid, Flexbox, Custom Properties, Print Media Rules)
- **Engine Logic:** Vanilla JavaScript (ES6+, Canvas API image compression, RegEx parser)
- **PDF Generation Engine:** `html2pdf.js` (bundled client-side library)

---

## 📂 Project Structure

```
reimburse/
├── index.html                  # Main application view & isolated PDF generation template
├── styles.css                  # Modern UI styles, responsive tiers & print rules
├── script.js                   # Dynamic travel calculations, live sync & PDF export
├── sample_images_data.js       # Base64-encoded fallback sample evidence images
├── html2pdf.bundle.min.js      # Bundled client-side HTML-to-PDF rendering engine
├── PROJECT_DOCUMENT.md         # Comprehensive institutional project documentation
├── local_reimburse.docx        # Institutional reference source document
├── images/                     # Sample training & route proof images
│   ├── sample_training_photo.png
│   ├── sample_portal_screenshot.png
│   └── sample_map_screenshot.png
└── README.md                   # Project overview & live GitHub Pages link
```

---

## 📄 License & Institutional Usage

Developed for official internal claim processing under **TASK / SEAP** guidelines.

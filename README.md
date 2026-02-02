# PETVision

**An Automated Polymer Segregator using Computer Vision & Deep Learning**

**PETVision**is a multi-service application designed to modernize the recycling industry by automating the identification and classification of PET bottles.  
It uses advanced AI techniques to analyze images of compressed bottles and provides real-time analytics for inventory management, pricing optimization, and quality control.

---

## 🚀 Key Features

The system processes images of plastic bales and performs the following tasks:

### 1. Color Code Identification
Detects and classifies bottles into industry-standard color categories for accurate pricing:
- **Clear / Transparent** – Colorless bottles (highest value)
- **Light Blue** – Common for packaged drinking water
- **Green** – Soft drinks and beer bottles
- **Brown / Amber** – Beverage bottles
- **Mixed / Other** – Remaining colors

---

### 2. Material Type Detection
Ensures material purity by distinguishing PET bottles from contaminants:
- **PET Identification** – Detects recycling code `1`, `PET`, `PETE`, and typical glossy/transparent appearance
- **Contaminant Flagging** – Identifies Non-PET plastics such as HDPE (Code 2), PP (Code 5), and PVC (Code 3)

---

### 3. Size & Weight Estimation
Classifies bottles into standard size categories and estimates weight:
- **200–300 ml** → ~10–12 g  
- **500–600 ml** → ~18–25 g  
- **1 Liter** → ~35–45 g  
- **2 Liter** → ~55–70 g  

---

### 4. Brand Recognition
Identifies major beverage brands using logo detection and label analysis to support  
**EPR (Extended Producer Responsibility)** compliance.

Supported brands include:  
Bisleri, Kinley, Aquafina, Coca-Cola, Pepsi, Sprite, Fanta, Minute Maid, Tropicana, and others.

---

### 5. Analytics Dashboard
Generates a detailed report for every uploaded batch, including:
- Total bottle count
- PET vs Non-PET ratio
- Color distribution (pie chart)
- Size distribution (bar chart)
- Quality grading (% of clear PET)
- Exportable reports (PDF / Excel)

---

## 🛠 Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js (Express)
- **ML Service:** Python (FastAPI)
- **AI / ML Models:** YOLOv8 (Segmentation), EfficientNet (Classification)
- **Containerization:** Docker

---

## ✅ Quick Start (Recommended: Docker)

### 1. Prepare ML Models
Copy the required ML model files into:

ml_service/models/


Required files:
- `yolov8n-seg.pt`
- `efficientnet_pet_vs_nonpet.pth`
- `efficientnet_brands.pth`
- `brand_classes.txt`

---

### 2. Run All Services

From the project root:

```bash
npm run docker:up
Services will be available at:

Frontend: http://localhost:5173

Backend API: http://localhost:4000

ML Service: http://localhost:8000
(Docker internal service name: ml_service)

To stop all services:

npm run docker:down
⚡ Run Services Locally (Without Docker)
npm install
npm --prefix frontend run dev
npm run dev
pip install -r ml_service/requirements.txt
npm run ml:run

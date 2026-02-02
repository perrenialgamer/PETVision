# =========================================================
# inference.py
# 1. YOLOv8-Seg (Detection & Mask)
# 2. EfficientNet-B0 (Material: PET vs Non-PET)
# 3. EfficientNet-B0 (Brand: 4 Classes + Thresholding)
# 4. Heuristics (Color & Size)
# =========================================================

from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
import torch
import timm
from torchvision import transforms
from ultralytics import YOLO
import os

# -------------------------
# CONFIG
# -------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMG_SIZE = 224

# Thresholds
PET_THRESHOLD = 0.5         # Material Confidence
BRAND_THRESHOLD = 0.65      # <--- CRITICAL: If brand conf is lower than 65%, call it "Generic"

# Paths (Ensure these exist in 'models/' folder)
YOLO_MODEL_PATH = "models/yolov8n-seg.pt"
PET_MODEL_PATH = "models/efficientnet_pet_vs_nonpet.pth"
BRAND_MODEL_PATH = "models/efficientnet_brands.pth"
BRAND_CLASSES_PATH = "models/brand_classes.txt"

# Size Thresholds (Height ratio)
SIZE_THRESH_SMALL = 0.35
SIZE_THRESH_MED = 0.55
SIZE_THRESH_LARGE = 0.75

# -------------------------
# FastAPI app
# -------------------------
app = FastAPI(title="Bottle Classification API (Material, Color, Size, Brand)")

# -------------------------
# 1. LOAD MODELS
# -------------------------
print("⏳ Loading Models...")

# A. YOLO
yolo_model = YOLO(YOLO_MODEL_PATH)
BOTTLE_CLASS_ID = [k for k, v in yolo_model.names.items() if v == "bottle"][0]
print("✅ YOLOv8-Seg loaded")

# B. Material Model
eff_material = timm.create_model("efficientnet_b0", pretrained=False, num_classes=2)
try:
    eff_material.load_state_dict(torch.load(PET_MODEL_PATH, map_location=DEVICE))
    eff_material.to(DEVICE).eval()
    print("✅ Material Model loaded")
except Exception as e:
    print(f"❌ Error loading Material Model: {e}")

# C. Brand Model
# Read class names first
try:
    with open(BRAND_CLASSES_PATH, "r") as f:
        BRAND_CLASSES = [line.strip() for line in f.readlines()]
    print(f"✅ Brand Classes: {BRAND_CLASSES}")
    
    # Initialize model with correct number of classes
    eff_brand = timm.create_model("efficientnet_b0", pretrained=False, num_classes=len(BRAND_CLASSES))
    eff_brand.load_state_dict(torch.load(BRAND_MODEL_PATH, map_location=DEVICE))
    eff_brand.to(DEVICE).eval()
    print("✅ Brand Model loaded")
except Exception as e:
    print(f"❌ Error loading Brand Model: {e}")
    BRAND_CLASSES = [] # Fallback

# -------------------------
# Transforms
# -------------------------
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# =========================================================
# HELPER FUNCTIONS
# =========================================================

def crop_bottle_from_mask(image_bgr, mask, box, padding=8):
    H, W = image_bgr.shape[:2]
    mask_resized = cv2.resize(mask.astype(np.float32), (W, H), interpolation=cv2.INTER_NEAREST)
    x1, y1, x2, y2 = map(int, box)
    
    x1 = max(0, x1 - padding); y1 = max(0, y1 - padding)
    x2 = min(W, x2 + padding); y2 = min(H, y2 + padding)

    crop_img = image_bgr[y1:y2, x1:x2]
    crop_mask = mask_resized[y1:y2, x1:x2]

    if crop_img.size == 0 or crop_mask.size == 0: return None

    crop_mask = (crop_mask > 0.5).astype(np.uint8) * 255
    crop_mask_3c = np.repeat(crop_mask[:, :, None], 3, axis=2)
    return cv2.bitwise_and(crop_img, crop_mask_3c), [x1, y1, x2, y2]

def predict_material_ai(crop_bgr):
    img_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    tensor = transform(img_rgb).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        probs = torch.softmax(eff_material(tensor), dim=1)[0]
    
    # Assuming Index 1 is PET (Check your training!)
    pet_prob = probs[1].item() 
    return ("PET", pet_prob) if pet_prob >= PET_THRESHOLD else ("NON-PET", pet_prob)

def predict_brand_ai(crop_bgr):
    """
    Predicts brand using EfficientNet, but defaults to 'Generic' 
    if confidence is low or if Material is Non-PET.
    """
    if not BRAND_CLASSES: return "Unknown (No Model)", 0.0

    img_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    tensor = transform(img_rgb).unsqueeze(0).to(DEVICE)
    
    with torch.no_grad():
        probs = torch.softmax(eff_brand(tensor), dim=1)[0]
    
    conf, idx = torch.max(probs, 0)
    conf = conf.item()
    
    # --- LOGIC TO HANDLE MISSING 'OTHER' CLASS ---
    if conf < BRAND_THRESHOLD:
        return f"Generic/Other (Low Conf: {conf:.2f})", conf
    
    return BRAND_CLASSES[idx.item()], conf

def get_color_heuristic(crop_img):
    if crop_img is None or crop_img.size == 0: return "Unknown", "Empty"
    hsv = cv2.cvtColor(crop_img, cv2.COLOR_BGR2HSV)
    h, w = hsv.shape[:2]
    center = hsv[int(h*0.3):int(h*0.7), int(w*0.3):int(w*0.7)] # Center 40%
    if center.size == 0: center = hsv
    
    sat = np.mean(center[:,:,1])
    val = np.mean(center[:,:,2])
    
    # Weighted Hue Calculation
    mask = center[:,:,1] > 20
    hue = np.mean(center[:,:,0][mask]) if np.sum(mask) > 10 else 0

    if sat < 35: return "Clear", "High Value PET"
    if 30 <= hue < 95: return "Green", "Soft Drink"
    if 95 <= hue < 145: return "Blue", "Water/Cooler"
    if val < 160: return "Brown", "Beer/Pharma"
    return "Mixed/Other", f"H:{int(hue)}"

def get_size_heuristic(bbox, img_h):
    h = bbox[3] - bbox[1]
    ratio = h / img_h
    if ratio < SIZE_THRESH_SMALL: return "200ml", "10-12g"
    if ratio < SIZE_THRESH_MED: return "500ml", "18-25g"
    if ratio < SIZE_THRESH_LARGE: return "1L", "35-45g"
    return "2L", "55-70g"

# =========================================================
# PIPELINE
# =========================================================
def predict_image_pipeline(image_bgr):
    results = yolo_model(image_bgr, conf=0.25, iou=0.5, device=DEVICE, verbose=False)
    r = results[0]

    if r.masks is None or r.boxes is None:
        return {"status": "no_bottle_detected", "objects": []}

    bottle_idxs = np.where(r.boxes.cls.cpu().numpy() == BOTTLE_CLASS_ID)[0]
    img_h = image_bgr.shape[0]
    objects = []

    for idx in bottle_idxs:
        # 1. Crop
        crop_res = crop_bottle_from_mask(image_bgr, r.masks.data.cpu().numpy()[idx], r.boxes.xyxy.cpu().numpy()[idx])
        if not crop_res: continue
        crop_img, bbox = crop_res

        # 2. Material
        mat_label, mat_conf = predict_material_ai(crop_img)

        # 3. Color
        col_label, col_desc = get_color_heuristic(crop_img)
        if mat_label == "NON-PET": col_label = "Mixed/Other"

        # 4. Size
        sz_label, wt_est = get_size_heuristic(bbox, img_h)

        # 5. Brand (AI + Logic)
        if mat_label == "PET":
            brand_label, brand_conf = predict_brand_ai(crop_img)
        else:
            # brand_label = "Contaminant"
            brand_label, brand_conf = predict_brand_ai(crop_img)
            brand_conf = 0.0

        objects.append({
            "object_id": len(objects) + 1,
            "bbox": bbox,
            "material": mat_label,
            "material_conf": round(float(mat_conf), 2),
            "color": col_label,
            "size": sz_label,
            "weight_est": wt_est,
            "brand": brand_label,
            "brand_conf": round(float(brand_conf), 2)
        })

    return {"status": "success", "count": len(objects), "objects": objects}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
    return predict_image_pipeline(img) if img is not None else {"error": "Invalid Image"}
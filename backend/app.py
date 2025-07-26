from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
import os
import cv2
import uuid

app = Flask(__name__)
CORS(app)

# Load model once
model = YOLO("yolov8s.pt")

UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return "Flask YOLOv8 backend is running"

@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    filename = f"{uuid.uuid4()}.jpg"
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    image_file.save(image_path)

    # Run inference
    results = model(image_path)[0]

    # Count only vehicles
    vehicle_classes = ["car", "truck", "bus", "motorbike"]
    count = sum([1 for r in results.boxes.cls if model.names[int(r)] in vehicle_classes])

    # Draw bounding boxes
    result_image = results.plot()
    result_path = os.path.join(RESULT_FOLDER, filename)
    cv2.imwrite(result_path, result_image)

    return jsonify({
        "vehicle_count": count,
        "image_url": f"http://localhost:5000/result/{filename}"
    })

@app.route("/result/<filename>")
def get_result_image(filename):
    return send_file(os.path.join(RESULT_FOLDER, filename), mimetype='image/jpeg')

if __name__ == "__main__":
    app.run(debug=True)

"""
Real-Time Computer Vision Engine
Advanced image processing and object detection for live virtual travel
"""

from fastapi import FastAPI, WebSocket, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import tensorflow as tf
import torch
import torchvision.transforms as transforms
from PIL import Image
import asyncio
import json
import base64
import io
from datetime import datetime
import logging
from typing import List, Dict, Optional, Tuple
import aiohttp
import websockets
from dataclasses import dataclass, asdict
import face_recognition
from ultralytics import YOLO
import mediapipe as mp
import supervision as sv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Virtual Vacation - Computer Vision Engine",
    description="Real-time image analysis and object detection for immersive travel",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@dataclass
class DetectedObject:
    """Represents a detected object in the scene"""
    id: str
    type: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # x, y, width, height
    center: Tuple[int, int]
    description: str
    is_person: bool = False
    is_moving: bool = False
    age_estimate: Optional[int] = None
    gender_estimate: Optional[str] = None
    emotion: Optional[str] = None
    activity: Optional[str] = None

@dataclass
class SceneAnalysis:
    """Complete analysis of a scene"""
    timestamp: datetime
    location: Optional[Dict] = None
    total_people: int = 0
    crowd_density: str = "low"
    objects: List[DetectedObject] = None
    activities: List[str] = None
    atmosphere: str = "calm"
    weather_conditions: Optional[str] = None
    time_of_day: str = "unknown"
    dominant_colors: List[str] = None
    architectural_style: Optional[str] = None
    vegetation_coverage: float = 0.0
    traffic_level: str = "light"

class ComputerVisionEngine:
    """Advanced computer vision processing engine"""
    
    def __init__(self):
        self.yolo_model = None
        self.face_cascade = None
        self.mp_pose = None
        self.mp_hands = None
        self.crowd_counter = None
        self.age_gender_model = None
        self.emotion_model = None
        self.activity_classifier = None
        
        # Initialize models
        asyncio.create_task(self.initialize_models())
    
    async def initialize_models(self):
        """Initialize all AI models"""
        try:
            # YOLO for object detection
            self.yolo_model = YOLO('yolov8n.pt')  # Lightweight version
            
            # OpenCV cascade for face detection
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            
            # MediaPipe for pose and hand detection
            self.mp_pose = mp.solutions.pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                enable_segmentation=True,
                min_detection_confidence=0.5
            )
            
            self.mp_hands = mp.solutions.hands.Hands(
                static_image_mode=False,
                max_num_hands=10,
                min_detection_confidence=0.5
            )
            
            logger.info("Computer vision models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
    
    async def analyze_image(self, image_data: bytes) -> SceneAnalysis:
        """Perform comprehensive image analysis"""
        try:
            # Convert bytes to OpenCV image
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Invalid image data")
            
            # Parallel analysis tasks
            objects_task = self.detect_objects(image)
            people_task = self.analyze_people(image)
            scene_task = self.analyze_scene_properties(image)
            activity_task = self.detect_activities(image)
            
            # Wait for all analyses to complete
            objects, people_analysis, scene_props, activities = await asyncio.gather(
                objects_task, people_task, scene_task, activity_task
            )
            
            # Combine results into comprehensive analysis
            analysis = SceneAnalysis(
                timestamp=datetime.now(),
                total_people=people_analysis['count'],
                crowd_density=self._calculate_crowd_density(people_analysis['count'], image.shape),
                objects=objects,
                activities=activities,
                atmosphere=self._determine_atmosphere(objects, people_analysis, activities),
                time_of_day=scene_props['time_of_day'],
                dominant_colors=scene_props['colors'],
                architectural_style=scene_props['architecture'],
                vegetation_coverage=scene_props['vegetation'],
                traffic_level=self._assess_traffic_level(objects)
            )
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            raise HTTPException(status_code=500, detail="Image analysis failed")
    
    async def detect_objects(self, image: np.ndarray) -> List[DetectedObject]:
        """Detect and classify objects in the image"""
        if not self.yolo_model:
            return []
        
        try:
            # Run YOLO detection
            results = self.yolo_model(image)
            
            detected_objects = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Extract detection data
                        xyxy = box.xyxy[0].cpu().numpy()
                        conf = box.conf[0].cpu().numpy()
                        cls = int(box.cls[0].cpu().numpy())
                        
                        # Get class name
                        class_name = self.yolo_model.names[cls]
                        
                        # Calculate center point
                        center_x = int((xyxy[0] + xyxy[2]) / 2)
                        center_y = int((xyxy[1] + xyxy[3]) / 2)
                        
                        # Create detection object
                        obj = DetectedObject(
                            id=f"obj_{len(detected_objects)}",
                            type=class_name,
                            confidence=float(conf),
                            bbox=(int(xyxy[0]), int(xyxy[1]), int(xyxy[2] - xyxy[0]), int(xyxy[3] - xyxy[1])),
                            center=(center_x, center_y),
                            description=self._generate_object_description(class_name, conf),
                            is_person=(class_name == 'person')
                        )
                        
                        detected_objects.append(obj)
            
            return detected_objects
            
        except Exception as e:
            logger.error(f"Error in object detection: {e}")
            return []
    
    async def analyze_people(self, image: np.ndarray) -> Dict:
        """Analyze people in the image including demographics and activities"""
        try:
            people_analysis = {
                'count': 0,
                'demographics': {'age_groups': {}, 'gender': {}},
                'emotions': {},
                'activities': [],
                'poses': []
            }
            
            # Face detection for demographic analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            
            people_analysis['count'] = len(faces)
            
            # Analyze each detected face
            for (x, y, w, h) in faces:
                face_roi = image[y:y+h, x:x+w]
                
                # Age and gender estimation (mock implementation)
                age, gender = await self._estimate_age_gender(face_roi)
                emotion = await self._detect_emotion(face_roi)
                
                # Update demographics
                age_group = self._categorize_age(age)
                people_analysis['demographics']['age_groups'][age_group] = \
                    people_analysis['demographics']['age_groups'].get(age_group, 0) + 1
                people_analysis['demographics']['gender'][gender] = \
                    people_analysis['demographics']['gender'].get(gender, 0) + 1
                people_analysis['emotions'][emotion] = \
                    people_analysis['emotions'].get(emotion, 0) + 1
            
            # Pose analysis with MediaPipe
            if self.mp_pose:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                pose_results = self.mp_pose.process(rgb_image)
                
                if pose_results.pose_landmarks:
                    activity = self._analyze_pose_activity(pose_results.pose_landmarks)
                    people_analysis['activities'].append(activity)
            
            return people_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing people: {e}")
            return {'count': 0, 'demographics': {}, 'emotions': {}, 'activities': []}
    
    async def analyze_scene_properties(self, image: np.ndarray) -> Dict:
        """Analyze general scene properties"""
        try:
            scene_props = {}
            
            # Time of day estimation based on lighting
            scene_props['time_of_day'] = self._estimate_time_of_day(image)
            
            # Dominant colors
            scene_props['colors'] = self._extract_dominant_colors(image)
            
            # Architectural style detection (mock)
            scene_props['architecture'] = await self._detect_architecture_style(image)
            
            # Vegetation coverage
            scene_props['vegetation'] = self._calculate_vegetation_coverage(image)
            
            # Weather conditions estimation
            scene_props['weather'] = self._estimate_weather_conditions(image)
            
            return scene_props
            
        except Exception as e:
            logger.error(f"Error analyzing scene properties: {e}")
            return {}
    
    async def detect_activities(self, image: np.ndarray) -> List[str]:
        """Detect ongoing activities in the scene"""
        try:
            activities = []
            
            # Use YOLO detections to infer activities
            results = self.yolo_model(image) if self.yolo_model else None
            
            if results:
                detected_classes = []
                for result in results:
                    if result.boxes is not None:
                        for box in result.boxes:
                            cls = int(box.cls[0].cpu().numpy())
                            class_name = self.yolo_model.names[cls]
                            detected_classes.append(class_name)
                
                # Infer activities from object combinations
                activities = self._infer_activities_from_objects(detected_classes)
            
            return activities
            
        except Exception as e:
            logger.error(f"Error detecting activities: {e}")
            return []
    
    def _calculate_crowd_density(self, people_count: int, image_shape: Tuple) -> str:
        """Calculate crowd density based on people count and image area"""
        image_area = image_shape[0] * image_shape[1]
        density_ratio = people_count / (image_area / 1000000)  # People per million pixels
        
        if density_ratio < 0.5:
            return "low"
        elif density_ratio < 2.0:
            return "moderate"
        elif density_ratio < 5.0:
            return "high"
        else:
            return "very_high"
    
    def _determine_atmosphere(self, objects: List[DetectedObject], people_analysis: Dict, activities: List[str]) -> str:
        """Determine the overall atmosphere of the scene"""
        people_count = people_analysis.get('count', 0)
        emotions = people_analysis.get('emotions', {})
        
        # Consider crowd size
        if people_count > 50:
            if 'happy' in emotions or 'celebration' in activities:
                return "festive"
            elif 'stressed' in emotions or people_count > 100:
                return "chaotic"
            else:
                return "bustling"
        elif people_count > 10:
            return "lively"
        else:
            return "peaceful"
    
    def _estimate_time_of_day(self, image: np.ndarray) -> str:
        """Estimate time of day based on lighting conditions"""
        # Convert to grayscale and calculate average brightness
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        avg_brightness = np.mean(gray)
        
        # Analyze color temperature
        b, g, r = cv2.split(image)
        blue_avg = np.mean(b)
        red_avg = np.mean(r)
        color_temp_ratio = blue_avg / (red_avg + 1e-6)
        
        if avg_brightness < 80:
            if color_temp_ratio > 1.2:
                return "dawn"
            else:
                return "night"
        elif avg_brightness < 150:
            if color_temp_ratio < 0.8:
                return "dusk"
            else:
                return "morning"
        else:
            return "day"
    
    def _extract_dominant_colors(self, image: np.ndarray, k: int = 5) -> List[str]:
        """Extract dominant colors from the image"""
        # Reshape image to be a list of pixels
        data = image.reshape((-1, 3))
        data = np.float32(data)
        
        # Apply K-means clustering
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convert to hex colors
        colors = []
        for center in centers:
            color = "#{:02x}{:02x}{:02x}".format(int(center[2]), int(center[1]), int(center[0]))
            colors.append(color)
        
        return colors
    
    async def _detect_architecture_style(self, image: np.ndarray) -> str:
        """Detect architectural style (mock implementation)"""
        # This would use a specialized architecture classification model
        # For now, return a mock result based on simple heuristics
        
        # Detect edges to estimate architectural complexity
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
        
        if edge_density > 0.1:
            return "modern"
        elif edge_density > 0.05:
            return "traditional"
        else:
            return "minimal"
    
    def _calculate_vegetation_coverage(self, image: np.ndarray) -> float:
        """Calculate percentage of vegetation in the image"""
        # Convert to HSV for better green detection
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Define range for green colors (vegetation)
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        
        # Create mask for green areas
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Calculate percentage
        green_pixels = np.sum(green_mask > 0)
        total_pixels = green_mask.shape[0] * green_mask.shape[1]
        
        return (green_pixels / total_pixels) * 100
    
    def _estimate_weather_conditions(self, image: np.ndarray) -> str:
        """Estimate weather conditions from image"""
        # Analyze brightness and contrast for weather estimation
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        contrast = np.std(gray)
        
        # Analyze blue channel for sky conditions
        b, g, r = cv2.split(image)
        blue_intensity = np.mean(b)
        
        if brightness < 100 and contrast < 50:
            return "overcast"
        elif blue_intensity > 150 and brightness > 150:
            return "sunny"
        elif contrast > 80:
            return "partly_cloudy"
        else:
            return "cloudy"
    
    async def _estimate_age_gender(self, face_roi: np.ndarray) -> Tuple[int, str]:
        """Estimate age and gender from face ROI"""
        # Mock implementation - would use actual age/gender detection model
        age = np.random.randint(18, 70)
        gender = np.random.choice(['male', 'female'])
        return age, gender
    
    async def _detect_emotion(self, face_roi: np.ndarray) -> str:
        """Detect emotion from face ROI"""
        # Mock implementation - would use actual emotion detection model
        emotions = ['happy', 'neutral', 'surprised', 'sad', 'angry', 'focused']
        return np.random.choice(emotions)
    
    def _categorize_age(self, age: int) -> str:
        """Categorize age into groups"""
        if age < 18:
            return "child"
        elif age < 30:
            return "young_adult"
        elif age < 50:
            return "adult"
        elif age < 65:
            return "middle_aged"
        else:
            return "senior"
    
    def _analyze_pose_activity(self, pose_landmarks) -> str:
        """Analyze pose to determine activity"""
        # Mock implementation based on pose landmarks
        activities = ['walking', 'standing', 'sitting', 'photography', 'pointing', 'waving']
        return np.random.choice(activities)
    
    def _infer_activities_from_objects(self, detected_classes: List[str]) -> List[str]:
        """Infer activities from detected objects"""
        activities = []
        
        # Activity inference rules
        if 'bicycle' in detected_classes:
            activities.append('cycling')
        if 'car' in detected_classes or 'truck' in detected_classes:
            activities.append('driving')
        if 'camera' in detected_classes:
            activities.append('photography')
        if 'skateboard' in detected_classes:
            activities.append('skateboarding')
        if 'sports ball' in detected_classes:
            activities.append('sports')
        if 'dining table' in detected_classes or 'cup' in detected_classes:
            activities.append('dining')
        if 'book' in detected_classes:
            activities.append('reading')
        if 'cell phone' in detected_classes:
            activities.append('phone_usage')
        
        return activities
    
    def _assess_traffic_level(self, objects: List[DetectedObject]) -> str:
        """Assess traffic level based on detected vehicles"""
        vehicle_count = sum(1 for obj in objects if obj.type in ['car', 'truck', 'bus', 'motorcycle'])
        
        if vehicle_count == 0:
            return "none"
        elif vehicle_count < 3:
            return "light"
        elif vehicle_count < 8:
            return "moderate"
        else:
            return "heavy"
    
    def _generate_object_description(self, class_name: str, confidence: float) -> str:
        """Generate descriptive text for detected object"""
        confidence_text = "likely" if confidence > 0.8 else "possibly"
        return f"{confidence_text} a {class_name.replace('_', ' ')}"

# Initialize CV engine
cv_engine = ComputerVisionEngine()

@app.post("/api/cv/analyze-image")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    """Analyze uploaded image with computer vision"""
    try:
        # Read image data
        image_data = await file.read()
        
        # Perform analysis
        analysis = await cv_engine.analyze_image(image_data)
        
        # Convert to dict for JSON response
        result = asdict(analysis)
        result['timestamp'] = result['timestamp'].isoformat()
        
        return result
        
    except Exception as e:
        logger.error(f"Error in image analysis endpoint: {e}")
        raise HTTPException(status_code=500, detail="Image analysis failed")

@app.websocket("/ws/cv/live-analysis")
async def websocket_live_analysis(websocket: WebSocket):
    """WebSocket endpoint for live video analysis"""
    await websocket.accept()
    
    try:
        while True:
            # Receive image data
            data = await websocket.receive_text()
            image_data = base64.b64decode(data.split(',')[1])  # Remove data:image header
            
            # Analyze image
            analysis = await cv_engine.analyze_image(image_data)
            
            # Send results
            result = asdict(analysis)
            result['timestamp'] = result['timestamp'].isoformat()
            await websocket.send_text(json.dumps(result))
            
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

@app.get("/api/cv/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "computer-vision-engine",
        "models_loaded": {
            "yolo": cv_engine.yolo_model is not None,
            "face_detection": cv_engine.face_cascade is not None,
            "pose_detection": cv_engine.mp_pose is not None
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)

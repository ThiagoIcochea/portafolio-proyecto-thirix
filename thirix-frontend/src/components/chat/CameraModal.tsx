import { useEffect, useRef, useState } from "react";
import { X, Circle } from "lucide-react";

import {
  FilesetResolver,
  FaceLandmarker
} from "@mediapipe/tasks-vision";

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraModal({
  open,
  onClose,
  onCapture
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const [effect, setEffect] = useState("normal");


   
  useEffect(() => {
    if (!open) return;

    startCamera();
    loadModel();

    return () => {
      stopCamera();
    };
  }, [open]);

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const loadModel = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
        },
        runningMode: "VIDEO",
        numFaces: 1
      }
    );
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };


  const getFilter = () => {
    switch (effect) {
      case "gray":
        return "grayscale(100%)";

      case "vintage":
        return "sepia(70%) contrast(110%)";

      case "cinematic":
        return "contrast(130%) saturate(120%) brightness(90%)";

      case "cold":
        return "hue-rotate(180deg) saturate(120%)";

      case "warm":
        return "sepia(30%) saturate(150%) brightness(105%)";

      case "neon":
        return "contrast(160%) saturate(250%)";

      case "sketch":
        return "grayscale(100%) contrast(220%) blur(0.5px)";

      default:
        return "none";
    }
  };

  
  const capture = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    
    ctx.filter = getFilter();

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.filter = "none";

    canvas.toBlob(blob => {
      if (!blob) return;

      const file = new File(
        [blob],
        `selfie-${Date.now()}.png`,
        { type: "image/png" }
      );

      onCapture(file);

      
      stopCamera();
      onClose();
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">

       
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white"
        >
          <X size={20} />
        </button>

      
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-[700px] h-[500px] object-cover"
          style={{ filter: getFilter() }}
        />

        
        <div className="flex flex-wrap justify-center gap-2 p-3 bg-black text-white text-xs">
          {[
            "normal",
            "gray",
            "vintage",
            "cinematic",
            "cold",
            "warm",
            "neon",
            "sketch"
          ].map(e => (
            <button
              key={e}
              onClick={() => setEffect(e)}
              className={`px-3 py-1 rounded-full ${
                effect === e ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

       
        <div className="flex justify-center pb-6 bg-black">
          <button
            onClick={capture}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg"
          >
            <Circle size={42} fill="black" />
          </button>
        </div>

      </div>
    </div>
  );
}
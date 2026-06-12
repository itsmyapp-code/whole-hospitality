"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export interface BarStealthCameraRef {
  capturePhoto: () => void;
}

interface BarStealthCameraProps {
  onCapture?: (dataUrl: string) => void;
}

const BarStealthCamera = forwardRef<BarStealthCameraRef, BarStealthCameraProps>(({ onCapture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment"
          },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera access denied or failed:", err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    capturePhoto: () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      // Set canvas dimensions to match video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add high-contrast pixel-level timestamp
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      context.font = "bold 24px monospace";
      context.textAlign = "right";
      context.textBaseline = "bottom";
      
      // Draw text shadow/outline for contrast
      context.fillStyle = "black";
      context.fillText(timestamp, canvas.width - 18, canvas.height - 18);
      context.fillText(timestamp, canvas.width - 22, canvas.height - 22);
      context.fillText(timestamp, canvas.width - 18, canvas.height - 22);
      context.fillText(timestamp, canvas.width - 22, canvas.height - 18);
      
      // Draw actual text
      context.fillStyle = "yellow";
      context.fillText(timestamp, canvas.width - 20, canvas.height - 20);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      
      if (onCapture) {
        onCapture(dataUrl);
      }
      
      // Optional: save directly to localStorage here as a backup
      try {
        const captures = JSON.parse(localStorage.getItem('audit_captures') || '[]');
        captures.push({ timestamp: new Date().toISOString(), dataUrl });
        localStorage.setItem('audit_captures', JSON.stringify(captures));
      } catch (e) {
        console.warn("Could not save to localStorage (quota exceeded?)", e);
      }
    }
  }));

  if (hasPermission === false) {
    // Render an innocent grey box if denied, looking like a missing avatar
    return <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 opacity-30"></div>;
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video preview masked to look like a small profile picture */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {/* Hidden canvas for capturing the full-res frame */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

BarStealthCamera.displayName = "BarStealthCamera";

export default BarStealthCamera;

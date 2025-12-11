import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Camera as CameraIcon, Upload, X } from 'lucide-react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Unable to access camera. Please verify permissions or use file upload.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video dimension
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent z-10">
        <button onClick={onCancel} className="text-white p-2 rounded-full bg-white/10 backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
        <div className="text-white font-medium">Scan ID Card</div>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>

      {/* Camera Viewport */}
      <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6 max-w-sm">
            <p className="mb-4 text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[85%] aspect-[1.586/1] border-2 border-white/50 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-0.5 -ml-0.5 rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-0.5 -mr-0.5 rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-0.5 -ml-0.5 rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-0.5 -mr-0.5 rounded-br-sm"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 text-sm font-medium">
                  Align ID card within frame
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center gap-6">
        
        {/* Shutter Button */}
        {!error && (
           <button 
           onClick={takePhoto}
           className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/50 transition-all hover:scale-105"
         >
           <div className="w-16 h-16 bg-white rounded-full"></div>
         </button>
        )}

        {/* File Upload Fallback */}
        <div className="w-full flex justify-center">
          <label className="flex items-center gap-2 text-white/90 text-sm cursor-pointer hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
            <Upload className="w-4 h-4" />
            <span>Upload from Gallery</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

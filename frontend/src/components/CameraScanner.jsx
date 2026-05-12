import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Image as ImageIcon, RefreshCw, UploadCloud } from 'lucide-react';

export default function CameraScanner({ onCapture }) {
  const webcamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [facingMode, setFacingMode] = useState('environment');

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto relative h-[75vh]">
      
      {/* Main Viewfinder */}
      <div className="relative w-full h-full bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-200/50 flex flex-col items-center justify-center">
        {isCameraActive ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode }}
              className="absolute inset-0 object-cover w-full h-full"
            />
            {/* Flip camera button - subtle glass top right */}
            <button
              onClick={toggleCamera}
              className="absolute top-6 right-6 p-3 bg-white/30 hover:bg-white/50 text-gray-800 backdrop-blur-md rounded-full shadow-sm transition-all active:scale-95 z-10"
              title="Flip Camera"
            >
              <RefreshCw size={20} />
            </button>
            
            {/* Minimalist target frame */}
            <div className="absolute inset-0 m-8 border-2 border-white/50 rounded-3xl pointer-events-none z-0 mix-blend-overlay"></div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 z-10">
            <UploadCloud size={48} className="mb-4 text-gray-300" />
            <p className="font-medium text-gray-600">Select an image from your gallery.</p>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-between z-20">
        
        {/* Switch Mode Button */}
        <button
          onClick={() => setIsCameraActive(!isCameraActive)}
          className="p-4 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors active:scale-95"
          title={isCameraActive ? "Switch to Upload" : "Switch to Camera"}
        >
          {isCameraActive ? <ImageIcon size={22} /> : <Camera size={22} />}
        </button>

        {/* Capture / Upload Primary Action */}
        <div className="flex-1 flex justify-center">
          {isCameraActive ? (
            <button
              onClick={capture}
              className="w-16 h-16 rounded-full border-[4px] border-gray-900 bg-white flex items-center justify-center shadow-md active:scale-90 transition-transform relative"
            >
              <div className="w-12 h-12 rounded-full bg-gray-900" />
            </button>
          ) : (
            <label className="py-3 px-6 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 active:bg-black text-white font-semibold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer">
              <ImageIcon size={20} />
              <span>Choose Image</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>

        {/* Placeholder to balance flex spacing with the left button */}
        <div className="w-[54px] h-[54px]" />
      </div>
    </div>
  );
}

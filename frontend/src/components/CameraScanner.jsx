import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, RefreshCw } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-6">
      <div className="relative w-full aspect-[4/3] bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center group">
        {isCameraActive ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode }}
              className="object-cover w-full h-full"
            />
            {/* Flip camera button */}
            <button
              onClick={toggleCamera}
              className="absolute top-4 right-4 p-3 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 rounded-full transition-all active:scale-95 z-10"
              title="Flip Camera"
            >
              <RefreshCw size={20} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-white/60">
            <Upload size={48} className="mb-4 text-white/40" />
            <p>Upload a clear photo of the ingredient list.</p>
          </div>
        )}
        
        {/* Overlay frame for guidance */}
        <div className="absolute inset-0 border-[3px] border-white/20 rounded-3xl m-4 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 border-2 border-dashed border-white/40 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col w-full gap-4 sm:flex-row">
        {isCameraActive ? (
          <button
            onClick={capture}
            className="flex-1 py-4 px-6 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            <Camera size={24} />
            <span>Scan Ingredients</span>
          </button>
        ) : (
          <label className="flex-1 py-4 px-6 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] cursor-pointer">
            <Upload size={24} />
            <span>Choose Image</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
        )}
        
        <button
          onClick={() => setIsCameraActive(!isCameraActive)}
          className="p-4 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white rounded-2xl border border-white/10 transition-colors"
          title={isCameraActive ? "Switch to Upload" : "Switch to Camera"}
        >
          {isCameraActive ? <Upload size={24} /> : <Camera size={24} />}
        </button>
      </div>
    </div>
  );
}

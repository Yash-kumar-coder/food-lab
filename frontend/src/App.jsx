import { useState } from 'react';
import CameraScanner from './components/CameraScanner';
import ResultCard from './components/ResultCard';
import { ScanSearch, Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [status, setStatus] = useState('scanning'); // 'scanning', 'loading', 'result', 'error'
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCapture = async (base64Image) => {
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const response = await fetch('https://food-lab-backend.onrender.com/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the image');
      }

      const data = await response.json();
      setResult(data);
      setStatus('result');
    } catch (error) {
      console.error("Error analyzing:", error);
      setErrorMsg('Could not analyze the image. Please try again or check if the backend is running.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setResult(null);
    setStatus('scanning');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-2xl mx-auto space-y-8 text-center">
        
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 shadow-lg bg-blue-500/10 rounded-2xl shadow-blue-500/20 text-blue-400">
              <ScanSearch size={32} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              BiteScan
            </h1>
          </div>
          <p className="text-lg text-white/60">
            Snap a photo of the ingredient list to check if it's safe to eat.
          </p>
        </header>

        {/* Main Content Area */}
        <main className="w-full mt-10 transition-all duration-500 ease-in-out">
          
          {status === 'scanning' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CameraScanner onCapture={handleCapture} />
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
                <Loader2 size={64} className="text-blue-500 animate-spin relative z-10" />
              </div>
              <p className="text-xl font-medium text-white/80 animate-pulse">Analyzing ingredients...</p>
            </div>
          )}

          {status === 'result' && result && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <ResultCard result={result} onReset={handleReset} />
            </div>
          )}

          {status === 'error' && (
            <div className="w-full max-w-md mx-auto p-6 bg-red-950/40 border border-red-500/30 rounded-3xl animate-in fade-in zoom-in-95">
              <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
              <h2 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h2>
              <p className="text-red-200/70 mb-6">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import CameraScanner from './components/CameraScanner';
import ResultCard from './components/ResultCard';
import { ScanSearch, AlertCircle } from 'lucide-react';

function App() {
  const [status, setStatus] = useState('scanning'); // 'scanning', 'loading', 'result', 'error'
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingText, setLoadingText] = useState('Scanning ingredients...');

  // Effect to cycle loading text for a dynamic feel
  useEffect(() => {
    if (status !== 'loading') return;
    
    const texts = [
      'Scanning ingredients...',
      'Analyzing health data...',
      'Checking for allergens...',
      'Finalizing report...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2000);

    return () => clearInterval(interval);
  }, [status]);

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
      setErrorMsg('Could not analyze the image. Please try again or check your connection.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setResult(null);
    setStatus('scanning');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center relative overflow-hidden font-sans selection:bg-blue-100">
      
      {/* Subtle ambient light effects (optional, very light) */}
      <div className="fixed top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-white to-transparent pointer-events-none z-0" />

      {/* Main Container - Removing padding so full-screen components can touch edges */}
      <div className="z-10 w-full max-w-lg mx-auto flex flex-col min-h-[100vh]">
        
        {/* Header - Hide when showing the result report so it acts as a standalone screen */}
        {status !== 'result' && (
          <header className="pt-10 pb-8 px-6 space-y-2 text-center shrink-0">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ScanSearch className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                BiteScan
              </h1>
            </div>
            <p className="text-base text-gray-500 font-medium">
              Know what's in your food.
            </p>
          </header>
        )}

        {/* Main Content Area */}
        <main className={`w-full flex-1 flex flex-col justify-center transition-all duration-500 ease-in-out ${status !== 'result' ? 'px-4 sm:px-8' : ''}`}>
          
          {status === 'scanning' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
              <CameraScanner onCapture={handleCapture} />
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-10 animate-in fade-in zoom-in-95 duration-500">
              {/* Sleek Skeleton / Scanner Animation */}
              <div className="relative w-48 h-64 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Simulated text lines */}
                <div className="absolute inset-x-6 top-8 space-y-4 opacity-30">
                  <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                </div>
                {/* Scanning Laser Line */}
                <div className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
              
              <div className="h-6">
                <p className="text-lg font-medium text-gray-500 animate-pulse tracking-tight transition-opacity duration-300">
                  {loadingText}
                </p>
              </div>
            </div>
          )}

          {status === 'result' && result && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full h-full flex flex-col">
              <ResultCard result={result} onReset={handleReset} />
            </div>
          )}

          {status === 'error' && (
            <div className="w-full mx-auto p-8 bg-red-50 border border-red-100 rounded-3xl shadow-sm animate-in fade-in zoom-in-95 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-red-800 mb-3">Analysis Failed</h2>
              <p className="text-red-600/80 mb-8 leading-relaxed">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all shadow-md active:scale-[0.98]"
              >
                Try Again
              </button>
            </div>
          )}
          
        </main>
      </div>

      {/* Global styles for animations that are not built into Tailwind directly */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 90%; opacity: 1; }
          90% { opacity: 1; }
        }
      `}} />
    </div>
  );
}

export default App;

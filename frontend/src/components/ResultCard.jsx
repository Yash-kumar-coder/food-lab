import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Share, Fingerprint, ChevronDown, ChevronUp, 
  AlertTriangle, CheckCircle, ShieldAlert, Languages, Loader2
} from 'lucide-react';

// Custom Radial Gauge Component
const RadialGauge = ({ score, theme }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Animate the progress bar
    const timer = setTimeout(() => setProgress(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
        {/* Background Circle */}
        <circle
          cx="70" cy="70" r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-100"
        />
        {/* Progress Circle */}
        <circle
          cx="70" cy="70" r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-out ${theme.stroke}`}
        />
      </svg>
      {/* Score Text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline">
          <span className={`text-6xl font-black tracking-tighter ${theme.text}`}>
            {progress}
          </span>
        </div>
        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mt-1">
          Danger Score
        </span>
      </div>
    </div>
  );
};

export default function ResultCard({ result, onReset }) {
  const { dangerScore, verdict, harmfulIngredients, safeIngredients } = result;

  // Accordion State
  const [expanded, setExpanded] = useState({
    danger: true,
    safe: false
  });

  // Translation State
  const [translated, setTranslated] = useState(false);
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getColorTheme = () => {
    if (dangerScore <= 30) {
      return { 
        bg: 'bg-[#DCF7E3]', text: 'text-[#166534]', stroke: 'text-[#166534]',
        badgeBg: 'bg-green-100', badgeText: 'text-green-800'
      };
    }
    if (dangerScore <= 69) {
      return { 
        bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', stroke: 'text-[#92400E]',
        badgeBg: 'bg-amber-100', badgeText: 'text-amber-800'
      };
    }
    return { 
      bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', stroke: 'text-[#991B1B]',
      badgeBg: 'bg-red-100', badgeText: 'text-red-800'
    };
  };

  const theme = getColorTheme();

  // Mock Data
  const highLevelAlerts = dangerScore > 30 
    ? [{ text: 'Contains Allergens', color: 'bg-red-100 text-red-800' }, { text: 'High in Sugar', color: 'bg-amber-100 text-amber-800' }]
    : [{ text: 'Fits Vegan Diet', color: 'bg-green-100 text-green-800' }, { text: 'Low Sugar', color: 'bg-green-100 text-green-800' }];

  const audienceRecommendations = dangerScore > 30 
    ? {
        safeFor: "Adults without pre-existing conditions.",
        notRecommended: "Children under 12, Pregnant women, Diabetics, and individuals with cardiovascular issues."
      }
    : {
        safeFor: "All age groups including children and teens. Suitable for most general diets.",
        notRecommended: "Individuals with specific rare allergies to the listed ingredients."
      };

  const handleShare = async () => {
    const shareData = {
      title: 'BiteScan Analysis Report',
      text: `BiteScan Danger Score: ${dangerScore}/100.\nVerdict: ${verdict}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        alert('Analysis summary copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const translateText = async (text) => {
    if (!text) return text;
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      return data[0].map(x => x[0]).join('');
    } catch (e) {
      console.error(e);
      return text;
    }
  };

  const handleTranslate = async () => {
    if (translated) {
      setTranslated(false);
      return;
    }
    
    setIsTranslating(true);
    try {
      const hiVerdict = await translateText(verdict);
      const hiSafeFor = await translateText(audienceRecommendations.safeFor);
      const hiNotRecommended = await translateText(audienceRecommendations.notRecommended);
      
      const hiHarmful = await Promise.all((harmfulIngredients || []).map(async (item) => ({
        name: await translateText(item.name),
        reason: await translateText(item.reason || "This ingredient has been linked to potential health risks based on your profile.")
      })));
      
      const hiSafe = await Promise.all((safeIngredients || []).map(item => translateText(item)));
  
      const hiAlerts = await Promise.all(highLevelAlerts.map(async (alert) => ({
        text: await translateText(alert.text),
        color: alert.color
      })));
  
      setTranslations({
        verdict: hiVerdict,
        safeFor: hiSafeFor,
        notRecommended: hiNotRecommended,
        harmfulIngredients: hiHarmful,
        safeIngredients: hiSafe,
        highLevelAlerts: hiAlerts
      });
      setTranslated(true);
    } catch (e) {
      console.error("Translation failed", e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Helper to get current text based on language
  const t_verdict = translated ? translations.verdict : verdict;
  const t_safeFor = translated ? translations.safeFor : audienceRecommendations.safeFor;
  const t_notRecommended = translated ? translations.notRecommended : audienceRecommendations.notRecommended;
  const t_highLevelAlerts = translated ? translations.highLevelAlerts : highLevelAlerts;
  const t_harmfulIngredients = translated ? translations.harmfulIngredients : harmfulIngredients;
  const t_safeIngredients = translated ? translations.safeIngredients : safeIngredients;

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] flex flex-col relative pb-32 animate-in slide-in-from-bottom-8 duration-700">
      
      {/* 1. Elegant Header (Sticky) */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={onReset} className="p-2 -ml-2 text-gray-900 transition-transform active:scale-90">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Analysis Report</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleTranslate} disabled={isTranslating} className="p-2 text-gray-900 transition-transform active:scale-90 disabled:opacity-50 relative group">
            {isTranslating ? <Loader2 size={22} className="animate-spin text-blue-600" /> : <Languages size={22} className={translated ? 'text-blue-600' : ''} />}
            {/* Tooltip hint */}
            {!translated && !isTranslating && (
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-max px-2 py-1 text-xs font-bold text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                Translate to Hindi
              </span>
            )}
          </button>
          <button onClick={handleShare} className="p-2 -mr-2 text-gray-900 transition-transform active:scale-90">
            <Share size={22} />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 sm:px-6 py-6 space-y-8 max-w-lg mx-auto w-full">
        
        {/* 2. "Hero" Scoring Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100/50 p-6 flex flex-col items-center text-center">
          <RadialGauge score={dangerScore} theme={theme} />
          <div className={`mt-6 p-4 rounded-2xl ${theme.bg}`}>
            <p className={`text-base sm:text-lg font-medium leading-snug ${theme.text}`}>
              {t_verdict}
            </p>
          </div>
        </section>

        {/* 3. High-Level Alerts */}
        <section className="flex flex-wrap gap-2">
          {t_highLevelAlerts.map((alert, i) => (
            <span key={i} className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide ${alert.color}`}>
              {alert.text}
            </span>
          ))}
        </section>

        {/* 4. Target Audience (Who should use this?) */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight uppercase">{translated ? 'जनसांख्यिकी (Demographics)' : 'Suitability & Demographics'}</h2>
          </div>
          <div className="p-5 space-y-4">
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-xl shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm mb-0.5">{translated ? 'सुरक्षित (Generally Safe For)' : 'Generally Safe For'}</span>
                <span className="text-sm text-gray-500 leading-relaxed">{t_safeFor}</span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100"></div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-xl shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm mb-0.5">{translated ? 'अनुशंसित नहीं (Not Recommended For)' : 'Not Recommended For'}</span>
                <span className="text-sm text-gray-500 leading-relaxed">{t_notRecommended}</span>
              </div>
            </div>

          </div>
        </section>

        {/* 5. Ingredient Breakdown (Accordion) */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4 px-2">{translated ? 'सामग्री विवरण (Ingredient Breakdown)' : 'Ingredient Breakdown'}</h2>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            
            {/* Danger / Flagged Section */}
            {t_harmfulIngredients && t_harmfulIngredients.length > 0 && (
              <div>
                <button 
                  onClick={() => toggleSection('danger')}
                  className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-gray-900">{translated ? 'खतरे (Flagged Risks)' : 'Flagged Risks'}</span>
                    <span className="bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-xs font-bold">{t_harmfulIngredients.length}</span>
                  </div>
                  {expanded.danger ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${expanded.danger ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <ul className="px-5 pb-5 space-y-4">
                    {t_harmfulIngredients.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-gray-900">{item.name}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-1 rounded-md">{translated ? 'खतरा (Danger)' : 'Danger'}</span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{item.reason}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Safe Section */}
            {t_safeIngredients && t_safeIngredients.length > 0 && (
              <div>
                <button 
                  onClick={() => toggleSection('safe')}
                  className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-gray-900">{translated ? 'सुरक्षित (Safe Ingredients)' : 'Safe Ingredients'}</span>
                    <span className="bg-green-100 text-green-700 py-0.5 px-2 rounded-full text-xs font-bold">{t_safeIngredients.length}</span>
                  </div>
                  {expanded.safe ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${expanded.safe ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <ul className="px-5 pb-5 space-y-4">
                    {t_safeIngredients.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-gray-900">{item}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded-md">{translated ? 'सुरक्षित (Safe)' : 'Safe'}</span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{translated ? 'आपकी निर्दिष्ट आहार सीमाओं के भीतर उपभोग के लिए आम तौर पर सुरक्षित माना जाता है।' : 'Considered generally safe for consumption within your specified dietary bounds.'}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        </section>

      </div>

      {/* 7. Sticky Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-4 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform active:scale-95 text-lg"
          >
            Scan New Item
          </button>
        </div>
      </div>

    </div>
  );
}

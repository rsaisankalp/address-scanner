import React, { useState } from 'react';
import { Camera } from './components/Camera';
import { ResultCard } from './components/ResultCard';
import { Button } from './components/Button';
import { analyzeIDCard } from './services/geminiService';
import { AppState, IDAnalysisResult } from './types';
import { ScanLine, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<IDAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setAppState(AppState.ANALYZING);
    
    try {
      const data = await analyzeIDCard(imageSrc);
      setResult(data);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze the image. Please try again.");
      setAppState(AppState.IDLE);
    }
  };

  const handleSendToAPI = async () => {
    if (!result || !result.extractedAddress) return;

    setIsSending(true);
    setAppState(AppState.SENDING);

    // Simulate API Call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Sending payload:", {
        idType: result.idType,
        address: result.extractedAddress,
        timestamp: new Date().toISOString()
      });
      setAppState(AppState.SUCCESS);
    } catch (e) {
      alert("Failed to send data");
      setAppState(AppState.RESULT);
    } finally {
      setIsSending(false);
    }
  };

  const resetFlow = () => {
    setAppState(AppState.IDLE);
    setCapturedImage(null);
    setResult(null);
    setErrorMsg(null);
  };

  // ----------------------------------------------------------------------
  // RENDER STATES
  // ----------------------------------------------------------------------

  if (appState === AppState.CAMERA) {
    return <Camera onCapture={handleCapture} onCancel={() => setAppState(AppState.IDLE)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
      
      {/* App Header */}
      <header className="w-full max-w-md flex flex-col items-center mb-8 pt-8">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 mb-4">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 text-center">ID Address Extractor</h1>
        <p className="text-slate-500 text-center mt-2 text-sm max-w-xs">
          Scan Indian IDs to extract and verify addresses automatically.
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md flex-1 flex flex-col items-center gap-6">

        {/* IDLE STATE */}
        {appState === AppState.IDLE && (
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center">
            {errorMsg && (
               <div className="w-full bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
                 {errorMsg}
               </div>
            )}
            
            <div className="w-64 h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-200/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ScanLine className="w-10 h-10 text-slate-400 mb-2" />
              <span className="text-xs text-slate-400 font-medium">Ready to Scan</span>
            </div>

            <div className="space-y-4 w-full">
              <h3 className="font-semibold text-slate-900">Supported Documents</h3>
              <ul className="text-sm text-slate-600 text-left space-y-2 bg-slate-50 p-4 rounded-lg">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Aadhaar Card (Back side)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Voter ID (Back side)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Driving License
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Passport (Address page)
                </li>
              </ul>

              <Button onClick={() => setAppState(AppState.CAMERA)} className="w-full mt-4">
                Start Scanning
              </Button>
            </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {appState === AppState.ANALYZING && (
          <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-10 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanLine className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="mt-8 font-bold text-lg text-slate-800">Processing ID...</h3>
            <p className="text-slate-500 text-sm mt-2 text-center">
              Identifying document type and extracting address details.
            </p>
            {capturedImage && (
              <div className="mt-8 w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm opacity-50">
                <img src={capturedImage} alt="Preview" className="w-full h-full object-cover grayscale" />
              </div>
            )}
          </div>
        )}

        {/* RESULT STATE */}
        {appState === AppState.RESULT && result && (
          <>
            <div className="w-full flex justify-center mb-4">
               {capturedImage && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-md border border-slate-200 bg-black">
                     <img src={capturedImage} alt="Scanned ID" className="w-full h-full object-contain" />
                  </div>
               )}
            </div>
            <ResultCard 
              result={result} 
              onRetake={() => setAppState(AppState.CAMERA)} 
              onSend={handleSendToAPI}
              isSending={false} 
            />
          </>
        )}

        {/* SENDING STATE */}
        {appState === AppState.SENDING && (
          <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-10 flex flex-col items-center justify-center min-h-[300px]">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
             </div>
             <h3 className="font-bold text-lg text-slate-800">Syncing Data</h3>
             <p className="text-slate-500 text-sm mt-2">Sending verified address to application...</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {appState === AppState.SUCCESS && (
          <div className="w-full bg-white rounded-2xl shadow-lg border border-green-100 p-10 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                <ShieldCheck className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">Success!</h2>
             <p className="text-slate-600 mb-8">
               The address has been successfully extracted and synced with the external application.
             </p>
             <Button onClick={resetFlow} variant="outline" className="w-full">
               Scan Another ID
             </Button>
          </div>
        )}

      </main>

      <footer className="w-full text-center py-6 text-xs text-slate-400">
        <p>AI-Powered ID Verification System</p>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { IDAnalysisResult } from '../types';
import { Button } from './Button';
import { CheckCircle, AlertTriangle, RefreshCw, Send, XCircle } from 'lucide-react';

interface ResultCardProps {
  result: IDAnalysisResult;
  onRetake: () => void;
  onSend: () => void;
  isSending: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onRetake, onSend, isSending }) => {
  const isSuccess = result.isIndianID && result.addressVisible && result.issueDetected === 'none';

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      {/* Header Status */}
      <div className={`p-6 ${isSuccess ? 'bg-green-50' : 'bg-amber-50'} border-b border-slate-100`}>
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
          <div>
            <h2 className="font-bold text-lg text-slate-800">
              {isSuccess ? 'Address Extracted' : 'Attention Needed'}
            </h2>
            <p className="text-sm text-slate-500">{result.idType || 'Unknown ID'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Issue Alert if any */}
        {!isSuccess && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-1">Issue Detected</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {result.userInstruction}
            </p>
          </div>
        )}

        {/* Address Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Extracted Address
          </label>
          <div className={`p-4 rounded-lg border ${result.extractedAddress ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100 text-red-500 italic'}`}>
            {result.extractedAddress || "Address not found."}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {isSuccess ? (
            <Button 
              onClick={onSend} 
              isLoading={isSending} 
              className="w-full"
            >
              <Send className="w-4 h-4" />
              Send to Application
            </Button>
          ) : (
             <Button 
             variant="primary"
             onClick={onRetake}
             className="w-full bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
           >
             <RefreshCw className="w-4 h-4" />
             Retake Photo
           </Button>
          )}

          {isSuccess && (
             <Button 
             variant="outline"
             onClick={onRetake}
             className="w-full"
           >
             <RefreshCw className="w-4 h-4" />
             Scan Another
           </Button>
          )}
        </div>
      </div>
    </div>
  );
};

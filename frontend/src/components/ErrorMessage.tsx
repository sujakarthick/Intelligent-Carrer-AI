import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 text-rose-900 shadow-sm">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-950">Error Occurred</h4>
          <p className="mt-1 text-sm text-rose-800 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg shadow-xs hover:bg-rose-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

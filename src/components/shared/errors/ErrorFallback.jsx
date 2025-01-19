import React from 'react';
import PrimaryButton from '../buttons/variants/PrimaryButton';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <div className="text-sm text-gray-600 mb-6">
            <p className="mb-2">We're sorry, but an error occurred:</p>
            <pre className="p-3 bg-gray-100 rounded-lg overflow-auto text-left">
              {error.message}
            </pre>
          </div>
          <PrimaryButton onClick={resetErrorBoundary}>
            Try again
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
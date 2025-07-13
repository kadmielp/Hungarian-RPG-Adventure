
import React from 'react';

interface SceneImageProps {
  imageUrl: string;
  prompt: string;
  loading: boolean;
}

const SceneImage: React.FC<SceneImageProps> = ({ imageUrl, prompt, loading }) => {
  return (
    <div className="aspect-video w-full bg-slate-800 rounded-lg shadow-lg overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
          <div className="text-center text-slate-400">
            <svg className="animate-spin h-8 w-8 text-amber-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm">Illustrating the scene...</p>
          </div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={prompt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default SceneImage;

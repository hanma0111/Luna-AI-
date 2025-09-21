import React from 'react';

interface AdvancedFeaturesBannerProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const AdvancedFeaturesBanner: React.FC<AdvancedFeaturesBannerProps> = ({ onLoginClick, onSignupClick }) => {
  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-gray-800 rounded-2xl">
      <h2 className="text-xl font-bold text-white mb-2">Try advanced features for free</h2>
      <p className="text-gray-300 text-sm mb-6">
        Get smarter responses, upload files, create images, and more by logging in.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={onLoginClick}
          className="flex-1 bg-white hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Log in
        </button>
        <button
          onClick={onSignupClick}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Sign up for free
        </button>
      </div>
    </div>
  );
};

export default AdvancedFeaturesBanner;

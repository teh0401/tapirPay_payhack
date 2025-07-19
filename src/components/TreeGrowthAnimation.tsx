import React, { useEffect, useState } from 'react';
import { Sprout, TreePine } from 'lucide-react';

interface TreeGrowthAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  autoPlay?: boolean;
}

export const TreeGrowthAnimation: React.FC<TreeGrowthAnimationProps> = ({ 
  size = 'md', 
  autoPlay = true 
}) => {
  const [stage, setStage] = useState(0);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  useEffect(() => {
    if (!autoPlay) return;
    
    const stages = [0, 1, 2, 3, 4];
    let currentStage = 0;
    
    const interval = setInterval(() => {
      currentStage = (currentStage + 1) % stages.length;
      setStage(currentStage);
    }, 800);

    return () => clearInterval(interval);
  }, [autoPlay]);

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {/* Soil base */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-3 bg-gradient-to-t from-amber-800 to-amber-600 rounded-full opacity-80"></div>
      
      {/* Stage 0: Seed */}
      <div 
        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
          stage === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      >
        <div className="w-2 h-2 bg-amber-700 rounded-full animate-pulse"></div>
      </div>

      {/* Stage 1: Sprout */}
      <div 
        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
          stage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      >
        <Sprout className="w-4 h-4 text-green-400" />
      </div>

      {/* Stage 2: Small plant */}
      <div 
        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
          stage === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <div className="relative">
          {/* Stem */}
          <div className="w-1 h-6 bg-green-600 mx-auto"></div>
          {/* Leaves */}
          <div className="absolute -top-1 -left-1 w-3 h-2 bg-green-400 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-3 h-2 bg-green-400 rounded-full"></div>
        </div>
      </div>

      {/* Stage 3: Growing tree */}
      <div 
        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
          stage === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <div className="relative">
          {/* Trunk */}
          <div className="w-2 h-8 bg-amber-700 mx-auto rounded-t-sm"></div>
          {/* Crown */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full"></div>
          {/* Side branches */}
          <div className="absolute top-1 -left-1 w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="absolute top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </div>

      {/* Stage 4: Full tree */}
      <div 
        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
          stage === 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="relative">
          {/* Trunk */}
          <div className="w-3 h-12 bg-gradient-to-t from-amber-800 to-amber-600 mx-auto rounded-t-sm"></div>
          {/* Main crown */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
          {/* Side foliage */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full opacity-80"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full opacity-80"></div>
          <div className="absolute top-2 -left-3 w-4 h-4 bg-green-400 rounded-full opacity-60"></div>
          <div className="absolute top-2 -right-3 w-4 h-4 bg-green-400 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Sparkles effect for growth */}
      {stage > 0 && (
        <>
          <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-4 right-3 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-300 opacity-75"></div>
          <div className="absolute top-6 left-4 w-1 h-1 bg-yellow-200 rounded-full animate-ping delay-700 opacity-75"></div>
        </>
      )}

      {/* Final celebration sparkles */}
      {stage === 4 && (
        <>
          <div className="absolute -top-2 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute -top-1 right-0 w-1 h-1 bg-green-300 rounded-full animate-bounce delay-200"></div>
          <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-500 rounded-full animate-bounce delay-500"></div>
        </>
      )}
    </div>
  );
};
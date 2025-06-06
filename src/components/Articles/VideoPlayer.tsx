import React from 'react';
import { Play, Volume2, Maximize, Film, Clock } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent } from '@/components/ui/card';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  showTitlePanel?: boolean;
  duration?: string;
  aspectRatio?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title, 
  showTitlePanel = true,
  duration,
  aspectRatio = 16/9
}) => {
  // Determine if it's a YouTube video
  const isYoutubeVideo = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  // For vertical videos (e.g., 9:16), add max-width to keep it contained
  const isVerticalVideo = aspectRatio < 1;
  
  return (
    <Card className="overflow-hidden shadow-md bg-white">
      <CardContent className="p-0">
        <div className="relative flex justify-center bg-black">
          <AspectRatio 
            ratio={aspectRatio} 
            className={isVerticalVideo ? 'w-full max-w-[400px] mx-auto' : 'w-full'}
          >
            {isYoutubeVideo ? (
              <iframe 
                src={videoUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video 
                controls
                className="w-full h-full object-contain"
                poster={videoUrl.endsWith('.mp4') ? undefined : videoUrl}
              >
                {videoUrl.endsWith('.mp4') && <source src={videoUrl} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>
            )}
          </AspectRatio>
          
          {!isYoutubeVideo && !videoUrl.endsWith('.mp4') && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 rounded-full bg-flyingbus-yellow bg-opacity-80 flex items-center justify-center">
                <Film size={40} className="text-black" />
              </div>
              <p className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                Video preview unavailable
              </p>
            </div>
          )}
        </div>
        
        {showTitlePanel && (
          <div className="p-3 bg-gradient-to-r from-white to-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-flyingbus-purple bg-opacity-10 p-1.5 rounded-full mr-3">
                <Play size={16} className="text-flyingbus-purple" />
              </span>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
                {duration && (
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    <Clock size={12} className="mr-1" />
                    {duration}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <Volume2 size={16} className="text-gray-600" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <Maximize size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;

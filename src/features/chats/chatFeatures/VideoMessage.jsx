import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import DOMPurify from "dompurify";
import MessageBubble from "./MessageBubble";
import { parseWhatsAppFormatting } from "./messageUtils";

const formatTime = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const VideoMessage = ({ msg, sent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status} noPadding maxWidth="65%">
      <div className="relative overflow-hidden rounded-lg">
        <video
          ref={videoRef}
          src={msg.media_url}
          className="w-full max-h-[300px] object-cover"
          playsInline
          preload="metadata"
          onClick={handleTogglePlay}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={handleTogglePlay}
          >
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="text-gray-800 ml-1" size={32} fill="currentColor" />
            </div>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </div>

        {msg.content && (
          <div className="px-3 py-2">
            <div
              className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words text-gray-900"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(parseWhatsAppFormatting(msg.content))
              }}
            />
          </div>
        )}
      </div>
    </MessageBubble>
  );
};

export default VideoMessage;

import { useState, useRef } from "react";
import { Play, Pause, Mic } from "lucide-react";
import MessageBubble from "./MessageBubble";

const formatTime = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioMessage = ({ msg, sent }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status} maxWidth="65%">
      <audio
        ref={audioRef}
        src={msg.media_url}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#00a5f4] text-white flex-shrink-0 hover:bg-[#0092d9] transition-colors"
        >
          {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
        </button>

        {/* Waveform/Progress */}
        <div className="flex-1 flex items-center gap-2">
          <Mic size={16} className="text-gray-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="w-full bg-gray-300 h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#00a5f4] h-1 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-[13px] text-gray-600 flex-shrink-0 min-w-[35px]">
            {formatTime(isPlaying ? currentTime : duration)}
          </span>
        </div>
      </div>
    </MessageBubble>
  );
};

export default AudioMessage;

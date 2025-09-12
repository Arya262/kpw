import { useState, useRef } from "react";
import { Check, CheckCheck, Play, Pause } from "lucide-react";

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
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`flex flex-col ${sent ? "bg-[#E1FFC7]" : "bg-white"} 
          rounded-2xl px-3 py-2 shadow-md max-w-[75%]`}
      >
        {/* Audio hidden element */}
        <audio
          ref={audioRef}
          src={msg.media_url}
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {/* Custom Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <div className="flex-1">
            {/* Progress bar */}
            <div className="w-full bg-gray-300 h-1 rounded-full">
              <div
                className="bg-green-500 h-1 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time info */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Time + Status */}
        <div className="flex justify-end items-center gap-1 text-gray-500 text-[10px] mt-1">
          <span>{msg.sent_at}</span>
          {sent && (
            <span className="text-blue-500">
              {msg.status === "read" ? <CheckCheck size={12} /> : <Check size={12} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;

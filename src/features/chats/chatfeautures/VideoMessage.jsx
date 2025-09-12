import { useState, useRef } from "react";
import { Check, CheckCheck, Play, Pause } from "lucide-react";

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
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className={`relative flex px-2 ${sent ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative bg-white rounded-2xl shadow-md overflow-hidden w-[90%] sm:w-[70%] md:w-[60%] lg:w-[40%] ${
          sent ? "rounded-br-none" : "rounded-bl-none"
        }`}
      >
        <div className="relative">
          <video
            ref={videoRef}
            src={msg.media_url}
            className="w-full h-auto object-cover"
            playsInline
            preload="metadata"
            onClick={handleTogglePlay}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />

          {/* Overlay controls */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={handleTogglePlay}
            >
              <Play className="text-white" size={40} />
            </div>
          )}

          {isPlaying && (
            <div
              className="absolute top-2 right-2 bg-black/50 rounded-full p-1 cursor-pointer"
              onClick={handleTogglePlay}
            >
              <Pause className="text-white" size={20} />
            </div>
          )}

          {/* Duration & progress */}
          <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">
            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
          </div>
        </div>

        {/* Time + Status */}
        <div className="flex justify-end items-center gap-1 text-gray-500 text-[10px] px-2 py-1">
          <span>{msg.sent_at}</span>
          {sent && (
            <span className="text-blue-500">
              {msg.status === "read" ? <CheckCheck size={12} /> : <Check size={12} />}
            </span>
          )}
        </div>

        {/* Bubble Tail */}
        <div
          className={`absolute bottom-0 ${
            sent ? "right-[-6px]" : "left-[-6px]"
          } w-0 h-0 border-t-[10px] border-t-white border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent`}
        />
      </div>
    </div>
  );
};

export default VideoMessage;

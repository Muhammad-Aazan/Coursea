import React, { useState } from "react";
import { PlayCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";

export default function VideoPlayer({ url, title, isPreview = false }) {
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  if (!url) {
    return (
      <div className="aspect-video w-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center border border-slate-800">
        <PlayCircle className="w-16 h-16 text-slate-600 mb-3 animate-pulse" />
        <h4 className="text-base font-semibold text-white">{title || "No video available"}</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {isPreview
            ? "This preview lesson currently has no video source uploaded."
            : "Video stream will be available soon."}
        </p>
      </div>
    );
  }

  // Normalize relative backend upload paths
  let videoSrc = url;
  if (videoSrc.startsWith("/uploads")) {
    videoSrc = `http://localhost:5000${videoSrc}`;
  }

  // YouTube match: regular watch, share youtu.be, embed, shorts
  const youtubeMatch = videoSrc.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 relative">
        <iframe
          key={`${videoId}-${retryKey}`}
          src={embedUrl}
          title={title || "Lesson Video"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo match
  const vimeoMatch = videoSrc.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) {
    const vimeoId = vimeoMatch[1];
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 relative">
        <iframe
          key={`${vimeoId}-${retryKey}`}
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          title={title || "Lesson Video"}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // HTML5 Native Video Player
  if (hasError) {
    return (
      <div className="aspect-video w-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-slate-300 p-8 text-center border border-slate-800">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h4 className="text-base font-bold text-white">Video stream failed to load</h4>
        <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm">
          The video server or network connection could not deliver the stream.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setHasError(false);
              setRetryKey((prev) => prev + 1);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Playing</span>
          </button>
          <a
            href={videoSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 relative group">
      <video
        key={`${videoSrc}-${retryKey}`}
        src={videoSrc}
        controls
        autoPlay
        controlsList="nodownload"
        className="w-full h-full object-contain"
        preload="auto"
        onError={() => setHasError(true)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

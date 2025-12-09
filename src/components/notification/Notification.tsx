"use client";

import React, { useState, useEffect, useRef } from "react";
import NotificationLayouts from "./NotificationLayouts";

type Stage = "hidden" | "circle-visible" | "expanded" | "closing";

interface NotificationData {
  type: "LIKE" | "COMMENT" | "MESSAGE";
  senderUsername: string;
  senderImage: string;
  postPreview?: string;
  comment?: string;
}

interface NotificationProps {
  data: NotificationData | null;
}

const Notification: React.FC<NotificationProps> = ({ data }) => {
  const [stage, setStage] = useState<Stage>("hidden");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data) return;

    setStage("hidden");

    const t1 = setTimeout(() => setStage("circle-visible"), 50);
    const t2 = setTimeout(() => setStage("expanded"), 600);
    const t3 = setTimeout(() => handleClose(), 5600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [data]);

  /** CLOSE ANIMATION */
  const handleClose = () => {
    setStage("closing");
    setTimeout(() => {
      setStage("hidden");
    }, 300);
  };

  /** TOUCH HANDLERS */
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (stage === "expanded") {
      setTouchStart(e.touches[0].clientY);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart !== null && isDragging) {
      const diff = touchStart - e.touches[0].clientY;
      if (diff > 0) setTouchOffset(Math.min(diff, 100));
    }
  };

  const handleTouchEnd = () => {
    if (touchOffset > 50) handleClose();
    setTouchStart(null);
    setTouchOffset(0);
    setIsDragging(false);
  };

  if (!data && stage === "hidden") return null;

  const isExpanded = stage === "expanded";
  const isVisible = stage !== "hidden";

  return (
    <div
      ref={notificationRef}
      className={`
        fixed left-1/2 -translate-x-1/2 z-9999
        ${isExpanded ? "w-72 sm:w-80" : "w-14"}
        h-14 
        rounded-full
        bg-linear-to-r from-blue-500 to-purple-600
        shadow-lg flex items-center justify-center
        overflow-hidden
        transition-all duration-500 ease-out
        ${isDragging ? "transition-none" : ""}
      `}
      style={{
        top: isVisible
          ? `${16 - touchOffset}px`
          : "-80px",
        opacity: stage === "closing" ? 0 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`text-white text-sm px-4 flex-1 transition-opacity duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        {data && NotificationLayouts(data)}
      </div>

      {isExpanded && (
        <button
          onClick={handleClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 
          w-8 h-8 flex items-center justify-center 
          rounded-full hover:bg-white/20 transition"
        >
          <svg className="w-4 h-4 text-white" strokeWidth="2" fill="none" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {!isExpanded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
};

export default Notification;

"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface SwipeItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  threshold?: number;
}

const SwipeItem = ({ children, onDelete, threshold = 0.4 }: SwipeItemProps) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleStart = (clientX: number) => {
    startXRef.current = clientX;
    isDraggingRef.current = true;
    setIsSwiping(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    
    currentXRef.current = clientX;
    const diff = startXRef.current - clientX;
    
    // Only allow swipe to the left (negative values)
    if (diff > 0) {
      // Limit the swipe distance to 80% of the item width
      const maxSwipe = itemRef.current ? itemRef.current.offsetWidth * 0.8 : 200;
      const clampedDiff = Math.min(diff, maxSwipe);
      setTranslateX(-clampedDiff);
    }
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    const itemWidth = itemRef.current?.offsetWidth || 300;
    const swipeThreshold = itemWidth * threshold;
    
    // If swiped past threshold, show delete confirmation
    if (translateX > swipeThreshold) {
      setShowDeleteConfirm(true);
      onDelete();
    }
    
    // Reset position
    setTimeout(() => {
      setTranslateX(0);
      setIsSwiping(false);
    }, 100);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      handleEnd();
    }
  };

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        handleEnd();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [translateX]);

  return (
    <div 
      ref={itemRef}
      className="relative overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      {/* Background with delete button - visible when swiping */}
      <div 
        className="absolute inset-0 bg-red-500/90 flex items-center justify-end pr-4 transition-opacity duration-200"
        style={{ 
          opacity: isSwiping ? Math.min(1, translateX / 100) : 0,
        }}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      {/* Swipeable content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeItem;
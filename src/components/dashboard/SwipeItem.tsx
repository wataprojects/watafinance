"use client";

import React, { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface SwipeItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  threshold?: number;
  className?: string;
}

const SwipeItem: React.FC<SwipeItemProps> = ({
  children,
  onDelete,
  threshold = 0.4,
  className = "",
}) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent | MouseEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      startXRef.current = clientX;
      currentXRef.current = clientX;
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent | MouseEvent) => {
      if (!isSwiping) return;
      
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      currentXRef.current = clientX;
      
      const diff = startXRef.current - clientX;
      
      // Only allow swipe from right to left (positive diff)
      if (diff > 0) {
        const maxTranslate = container.offsetWidth;
        const newTranslate = Math.min(diff, maxTranslate * 0.8);
        setTranslateX(newTranslate);
        
        // Show delete button when threshold is reached
        const containerWidth = container.offsetWidth;
        const swipePercentage = diff / containerWidth;
        setShowDelete(swipePercentage >= threshold);
      }
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;
      
      const containerWidth = container.offsetWidth;
      const swipePercentage = translateX / containerWidth;
      
      if (swipePercentage >= threshold) {
        // Trigger delete
        onDelete();
      }
      
      // Reset
      setIsSwiping(false);
      setTranslateX(0);
      setShowDelete(false);
      startXRef.current = 0;
      currentXRef.current = 0;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("mousedown", handleTouchStart);
    document.addEventListener("mousemove", handleTouchMove);
    document.addEventListener("mouseup", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("mousedown", handleTouchStart);
      document.removeEventListener("mousemove", handleTouchMove);
      document.removeEventListener("mouseup", handleTouchEnd);
    };
  }, [isSwiping, translateX, threshold, onDelete]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background with delete button */}
      <div 
        className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-red-500 transition-opacity duration-200 ${
          showDelete || translateX > 20 ? "opacity-100" : "opacity-0"
        }`}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>
      
      {/* Swipeable content */}
      <div
        ref={containerRef}
        className="transition-transform duration-100"
        style={{
          transform: `translateX(-${translateX}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeItem;
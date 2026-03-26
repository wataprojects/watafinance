"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface CelebrateAnimationProps {
  amount: number;
  onClose: () => void;
  isOpen: boolean;
}

const CelebrateAnimation = ({ amount, onClose, isOpen }: CelebrateAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);
  const [showCheck, setShowCheck] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const colors = [
        "bg-green-400",
        "bg-emerald-400",
        "bg-yellow-400",
        "bg-amber-400",
        "bg-green-500",
        "bg-emerald-500",
      ];
      
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      
      setParticles(newParticles);
      
      // Animation sequence
      setTimeout(() => setShowCheck(true), 100);
      setTimeout(() => setShowText(true), 600);
    } else {
      setShowCheck(false);
      setShowText(false);
      setParticles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Confetti particles */}
        <div className="absolute inset-0 overflow-visible">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={`absolute w-2 h-2 rounded-full ${particle.color} animate-confetti`}
              style={{
                left: `${particle.x}%`,
                top: "-10px",
                animationDelay: `${particle.delay}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        {/* Check mark */}
        <div
          className={`relative z-10 w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 transition-all duration-500 ${
            showCheck
              ? "scale-100 opacity-100 animate-bounce-in"
              : "scale-0 opacity-0"
          }`}
        >
          <Check className="w-12 h-12 text-white animate-check-draw" strokeWidth={4} />
        </div>

        {/* Text */}
        <div
          className={`text-center transition-all duration-500 ${
            showText
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <p className="text-2xl font-bold text-white mb-2">
            ¡Ahorrarás {formatCurrency(amount)}/mes! 💪
          </p>
          <p className="text-green-400 text-sm mb-6">
            Esto te ayudará a mejorar tu salud financiera
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition-all duration-200 hover:scale-105"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrateAnimation;
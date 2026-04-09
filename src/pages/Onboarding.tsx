"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import IncomeSourceStep from "@/components/onboarding/IncomeSourceStep";
import CategoriesStep from "@/components/onboarding/CategoriesStep";
import OnboardingDashboard from "@/components/onboarding/OnboardingDashboard";

type Step = 1 | 2 | 3;

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    // Check if onboarding is already completed
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", session.user.id)
      .single();

    if (profile?.onboarding_completed) {
      navigate("/dashboard");
      return;
    }

    setLoading(false);
  };

  const handleIncomeSourceNext = () => {
    setCurrentStep(2);
  };

  const handleCategoriesNext = () => {
    setCurrentStep(3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-bold text-white">Monyro</span>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? "bg-green-500 text-black"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-1 ${
                    step < currentStep ? "bg-green-500" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto">
          {currentStep === 1 && <IncomeSourceStep onNext={handleIncomeSourceNext} />}
          {currentStep === 2 && <CategoriesStep onNext={handleCategoriesNext} />}
          {currentStep === 3 && <OnboardingDashboard />}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
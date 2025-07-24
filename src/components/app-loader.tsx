"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppLoader() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState("Initializing...");

  useEffect(() => {
    const initializeApp = async () => {
      const phases = [
        { message: "Initializing AFSA system...", duration: 800 },
        { message: "Loading membership data...", duration: 1200 },
        { message: "Configuring user preferences...", duration: 1000 },
        { message: "Finalizing setup...", duration: 1000 },
      ];

      let currentProgress = 0;

      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        setLoadingPhase(phase.message);

        // Smooth progress animation for this phase
        const phaseProgress = ((i + 1) / phases.length) * 100;
        const progressIncrement =
          (phaseProgress - currentProgress) / (phase.duration / 50);

        const phaseInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + progressIncrement;
            if (newProgress >= phaseProgress) {
              clearInterval(phaseInterval);
              return phaseProgress;
            }
            return newProgress;
          });
        }, 50);

        await new Promise((resolve) => setTimeout(resolve, phase.duration));
        currentProgress = phaseProgress;
      }

      // Ensure we hit 100%
      setProgress(100);
      setLoadingPhase("Ready! Redirecting...");

      // Brief pause before redirect
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/login");
    };

    initializeApp();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-36 h-12 bg-[#00B5A5] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">AFSA</span>
            </div>
          </div>
        </div>

        {/* Main Loading Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-[#00B5A5]"></div>

            {/* Middle ring */}
            <div
              className="absolute top-2 left-2 w-16 h-16 border-2 border-gray-300 dark:border-gray-600 rounded-full animate-spin border-b-[#00B5A5]"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>

            {/* Inner pulsing core */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-[#00B5A5] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          AFSA - Membership Acquisition
        </h1>

        {/* Loading Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-8">{loadingPhase}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-[#00B5A5] h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.round(progress)}%` }}
          ></div>
        </div>

        {/* Progress Text */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress)}% Complete
        </p>

        {/* Animated dots */}
        <div className="flex justify-center mt-6 space-x-1">
          <div
            className="w-2 h-2 bg-[#00B5A5] rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-[#00B5A5] rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-[#00B5A5] rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

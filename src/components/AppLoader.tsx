"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      const totalDuration = phases.reduce(
        (sum, phase) => sum + phase.duration,
        0
      );

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Image
              className="dark:invert drop-shadow-lg"
              src="/Logo.png"
              alt="AFSA Logo"
              width={140}
              height={35}
              priority
            />
          </div>
        </div>

        {/* Main Loading Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>

            {/* Middle ring */}
            <div
              className="absolute top-2 left-2 w-16 h-16 border-2 border-indigo-300 dark:border-indigo-700 rounded-full animate-spin border-b-indigo-500 dark:border-b-indigo-400"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>

            {/* Inner pulsing core */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-full animate-pulse"></div>
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
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
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
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

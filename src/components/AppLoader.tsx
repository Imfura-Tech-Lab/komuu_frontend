"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AppLoader() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 600);

      // Wait for initialization to complete
      await new Promise((resolve) => setTimeout(resolve, 60000));

      // Clear interval and redirect
      clearInterval(progressInterval);
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
              alt="Logo"
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
          Kigali Car Rental
        </h1>

        {/* Loading Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Initializing your experience...
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Text */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {progress}% Complete
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

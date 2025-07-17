import React from "react";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface MembershipLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  steps: Step[];
  currentStepTitle?: string;
  currentStepDescription?: string;
}

const MembershipLayout: React.FC<MembershipLayoutProps> = ({
  children,
  currentStep,
  steps = [], // Default to empty array
  currentStepTitle = "",
  currentStepDescription = "",
}) => {
  // Sidebar component for progress steps
  const renderSidebar = () => (
    <div className="w-80 bg-gradient-to-b from-[#00B5A5] to-[#008A7C] text-white p-6 flex flex-col">
      <div className="mb-8">
        <div className="w-40 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg mb-4">
          <span className="text-white font-bold text-2xl">AFSA</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">AFSA Membership</h1>
        <p className="text-white/90 text-sm">
          Join the African Forensic Science Association
        </p>
      </div>

      <div className="flex-1">
        <div className="space-y-4">
          {steps && steps.length > 0 ? (
            steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative flex items-start p-4 rounded-lg transition-all duration-300 ${
                  currentStep === step.id
                    ? "bg-white bg-opacity-20 border-l-4 border-white"
                    : currentStep > step.id
                    ? "bg-white bg-opacity-10"
                    : "bg-transparent"
                }`}
              >
                <div className="flex-shrink-0 mr-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-white text-[#00B5A5]"
                        : "bg-[#00B5A5] bg-opacity-50 text-white/70"
                    }`}
                  >
                    {currentStep > step.id ? <Check size={20} /> : step.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold ${
                      currentStep >= step.id ? "text-white" : "text-white/70"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      currentStep >= step.id ? "text-white/90" : "text-white/60"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Progress line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-9 top-14 w-0.5 h-8 transition-all duration-300 ${
                      currentStep > step.id ? "bg-green-400" : "bg-white/30"
                    }`}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70">Loading steps...</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator at bottom */}
      <div className="mt-8 pt-6 border-t border-white/30">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/90">Progress</span>
          <span className="text-white font-semibold">
            {currentStep}/{steps?.length || 0}
          </span>
        </div>
        <div className="mt-2 bg-white/30 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${(currentStep / (steps?.length || 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-8 py-6">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStepTitle}
            </h2>
            <p className="text-gray-600 mt-1">{currentStepDescription}</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipLayout;

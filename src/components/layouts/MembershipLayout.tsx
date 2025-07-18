import React, { useState } from "react";
import { Check, Menu, X } from "lucide-react";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar component for progress steps
  const renderSidebar = () => (
    <div
      className={`
      fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white  border-r border-gray-200 p-4 sm:p-6 flex flex-col transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}
    >
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end mb-4">
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X size={24} />
        </button>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="w-32 sm:w-40 h-12 sm:h-14 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] rounded-lg flex items-center justify-center  mb-4">
          <span className="text-white font-bold text-xl sm:text-2xl">AFSA</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
          AFSA Membership
        </h1>
        <p className="text-gray-600 text-sm">
          Join the African Forensic Science Association
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {steps && steps.length > 0 ? (
            steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                  currentStep === step.id
                    ? "bg-gradient-to-r from-[#00B5A5] to-[#008A7C] text-white  transform scale-105"
                    : currentStep > step.id
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex-shrink-0 mr-3 sm:mr-4">
                  <div
                    className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center text-lg transition-all duration-300  ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-white text-[#00B5A5] ring-2 ring-white/30"
                        : "bg-white text-gray-400 border-2 border-gray-300"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check size={20} />
                    ) : (
                      <span className="font-bold text-sm sm:text-base">
                        {step.id}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-bold mb-1 ${
                      currentStep === step.id
                        ? "text-white"
                        : currentStep > step.id
                        ? "text-green-800"
                        : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      currentStep === step.id
                        ? "text-white/90"
                        : currentStep > step.id
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Current step indicator */}
                  {currentStep === step.id && (
                    <div className="mt-2 flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs font-medium text-white/90">
                        Current Step
                      </span>
                    </div>
                  )}

                  {/* Completed indicator */}
                  {currentStep > step.id && (
                    <div className="mt-2 flex items-center">
                      <Check size={14} className="text-green-600 mr-2" />
                      <span className="text-xs font-medium text-green-600">
                        Completed
                      </span>
                    </div>
                  )}
                </div>

                {/* Enhanced progress line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-8 sm:left-10 top-12 sm:top-16 w-1 h-4 sm:h-6 rounded-full transition-all duration-500 ${
                      currentStep > step.id ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading steps...</p>
            </div>
          )}
        </div>
      </div>

      {/* Motivational footer */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] rounded-lg">
        <p className="text-white text-sm text-center font-medium">
          🎉 You're doing great! Keep going!
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden bg-white  border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-2">Step</span>
            <span className="text-sm font-bold text-gray-900">
              {currentStep}/{steps?.length || 0}
            </span>
          </div>
        </div>

        {/* Header with Progress and Step Info */}
        <div className="bg-white  border-b px-4 sm:px-8 py-4 sm:py-6">
          <div className="max-w-4xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
            {/* Step title and description column */}
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {currentStepTitle}
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {currentStepDescription}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="lg:ml-8 lg:min-w-[200px] w-full lg:w-auto">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-semibold">
                  Step {currentStep} of {steps?.length || 0}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#00B5A5] rounded-full h-2 transition-all duration-300"
                  style={{
                    width: `${(currentStep / (steps?.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
            <div className="bg-white rounded-xl  border p-4 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipLayout;

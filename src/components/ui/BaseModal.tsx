"use client";

import { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconColor?: "teal" | "red" | "orange" | "yellow" | "blue" | "green" | "gray";
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  variant?: "sheet" | "centered";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl",
};

const iconColorClasses = {
  teal: "bg-[#00B5A5]/10 text-[#00B5A5]",
  red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconColor = "teal",
  children,
  footer,
  size = "full",
  variant = "sheet",
}: BaseModalProps) {
  if (variant === "centered") {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          {/* Centered Modal */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl transition-all`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {icon && (
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColorClasses[iconColor]}`}
                          >
                            {icon}
                          </div>
                        )}
                        <div>
                          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                          </Dialog.Title>
                          {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div>{children}</div>

                    {/* Footer */}
                    {footer && <div className="mt-6">{footer}</div>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  // Sheet variant (slides from right)
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Sheet Container */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel
                  className={`pointer-events-auto w-screen ${sizeClasses[size]}`}
                >
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        {icon && (
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColorClasses[iconColor]}`}
                          >
                            {icon}
                          </div>
                        )}
                        <div>
                          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                            {title}
                          </Dialog.Title>
                          {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">{children}</div>

                    {/* Footer */}
                    {footer && (
                      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                        {footer}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default BaseModal;

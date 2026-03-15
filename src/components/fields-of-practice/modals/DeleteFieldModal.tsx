import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { FieldOfPractice } from "../hooks/useFieldsOfPractice";

interface DeleteFieldModalProps {
  isOpen: boolean;
  field: FieldOfPractice | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<boolean>;
}

export function DeleteFieldModal({
  isOpen,
  field,
  onClose,
  onConfirm,
}: DeleteFieldModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!field) return;
    setLoading(true);
    const success = await onConfirm(field.id);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  if (!field) return null;

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

        {/* Centered Modal - kept centered for delete confirmations */}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <Dialog.Title className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
                    Delete Field of Practice
                  </Dialog.Title>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
                    Are you sure you want to delete this field of practice?
                  </p>

                  {/* Field Details */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                        {field.field}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Code:
                      </span>
                      <span className="text-sm font-mono bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-900 dark:text-white">
                        {field.code}
                      </span>
                    </div>
                  </div>

                  <p className="text-center text-red-600 dark:text-red-400 text-sm mt-4 font-medium">
                    This action cannot be undone.
                  </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex flex-col sm:flex-row-reverse gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        Yes, Delete
                      </>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

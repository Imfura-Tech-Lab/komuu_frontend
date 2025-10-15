"use client";

export default function ResourcesClient() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Resources Library
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Coming Soon
            </p>
            <p className="text-gray-500 dark:text-gray-300 mb-8 max-w-md mx-auto">
              We're building a comprehensive resource library to store and organize all your organization's documents and files.
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                <strong>Planned Features:</strong> Document upload, categorization, search, version control, and access permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
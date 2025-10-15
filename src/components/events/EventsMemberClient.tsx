"use client";

export default function EventsMemberClient() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Events Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Coming Soon
            </p>
            <p className="text-gray-500 dark:text-gray-300 mb-8 max-w-md mx-auto">
              We're working on an amazing events management system to help you organize and manage all your organization's events in one place.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Planned Features:</strong> Event creation, calendar view, registration management, attendee tracking, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
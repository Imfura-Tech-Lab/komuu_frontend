import React, { RefObject, useState } from "react";
import { UserData, UserRole } from "@/types";
import Image from "next/image";

interface HeaderProps {
  userData: UserData;
  roleColor: string;
  getRoleDescription: (role: UserRole) => string;
  getUserInitials: (name: string) => string;
  handleLogout: (showMessage?: boolean) => Promise<void>;
  isLoggingOut: boolean;
  profileDropdownOpen: boolean;
  setProfileDropdownOpen: (open: boolean) => void;
  handleProfileClick: () => void;
  handleSettingsClick: () => void;
  setSidebarOpen: (open: boolean) => void;
  dropdownRef: RefObject<HTMLDivElement>;
}

export function Header({
  userData,
  roleColor,
  getRoleDescription,
  getUserInitials,
  handleLogout,
  isLoggingOut,
  profileDropdownOpen,
  setProfileDropdownOpen,
  handleProfileClick,
  handleSettingsClick,
  setSidebarOpen,
  dropdownRef,
}: HeaderProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLogoutClick = () => {
    setProfileDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await handleLogout(true);
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const hasProfileImage = userData.public_profile && !imageError;

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00B5A5] md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Portal
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] hover:bg-gray-50 dark:hover:bg-gray-700 p-2 transition-colors duration-200"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  {hasProfileImage ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-[#00B5A5]/20">
                      <Image
                        src={userData.public_profile}
                        alt={userData.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#00B5A5] flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {getUserInitials(userData.name)}
                      </span>
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userData.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userData.email}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none z-50">
                    <div className="px-4 py-3">
                      {/* Profile Image and Name */}
                      <div className="flex items-center space-x-3 mb-3">
                        {hasProfileImage ? (
                          <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-[#00B5A5]/20 flex-shrink-0">
                            <Image
                              src={userData.public_profile}
                              alt={userData.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                              onError={() => setImageError(true)}
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-[#00B5A5] flex items-center justify-center flex-shrink-0">
                            <span className="text-base font-medium text-white">
                              {getUserInitials(userData.name)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                              {userData.name}
                            </p>
                            {userData.role !== "Pending" && (
                              <div className="relative group ml-2 flex-shrink-0">
                                <button
                                  type="button"
                                  className="flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                                  aria-label="Member information"
                                >
                                  <svg
                                    className="h-3 w-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block group-focus-within:block z-50">
                                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 shadow-lg min-w-48 w-auto">
                                    <div className="font-medium">
                                      {userData.role}
                                    </div>
                                    <div className="text-gray-200 mt-1">
                                      {getRoleDescription(userData.role)}
                                    </div>
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {userData.email}
                            </p>
                            {userData.role !== "Pending" && userData.verified && (
                              <span className="ml-1.5 flex-shrink-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-green-100 dark:bg-green-900/30">
                                <svg
                                  className="h-3 w-3 text-green-600 dark:text-green-400"
                                  fill="currentColor"
                                  viewBox="0 0 12 12"
                                >
                                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Role badge */}
                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}
                        >
                          {userData.role}
                        </span>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {getRoleDescription(userData.role)}
                        </p>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <svg
                          className="mr-3 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Your Profile
                      </button>
                      {userData.role !== "Pending" && (
                        <button
                          onClick={handleSettingsClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <svg
                            className="mr-3 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </button>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <svg
                          className="mr-3 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={cancelLogout}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform transition-all">
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
                  Sign Out
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-300">
                  Are you sure you want to sign out of your account?
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-col sm:flex-row-reverse gap-3">
                <button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Yes, Sign Out
                    </>
                  )}
                </button>
                <button
                  onClick={cancelLogout}
                  disabled={isLoggingOut}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
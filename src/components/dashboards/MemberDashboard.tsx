export function MemberDashboard() {
  const memberStats = [
    {
      name: "Membership Status",
      value: "Active",
      change: "Since 2023",
      changeType: "positive",
    },
    {
      name: "Events Attended",
      value: "12",
      change: "This Year",
      changeType: "neutral",
    },
    {
      name: "Community Points",
      value: "2,847",
      change: "+150",
      changeType: "positive",
    },
    {
      name: "Resources Downloaded",
      value: "23",
      change: "This Month",
      changeType: "neutral",
    },
  ];

  const upcomingEvents = [
    {
      title: "Monthly Networking",
      date: "2025-08-18",
      time: "6:00 PM",
      location: "Conference Room A",
    },
    {
      title: "Skills Workshop",
      date: "2025-08-22",
      time: "2:00 PM",
      location: "Online",
    },
    {
      title: "Community Service",
      date: "2025-08-28",
      time: "9:00 AM",
      location: "Local Community Center",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Member Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your membership overview and upcoming activities
          </p>
        </div>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {memberStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </dd>
                </div>
                <div
                  className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Upcoming Events
          </h3>
          <div className="mt-5">
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {event.location}
                    </p>
                  </div>
                  <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-[#00B5A5] bg-[#00B5A5]/10 hover:bg-[#00B5A5]/20">
                    Register
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Quick Actions
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#00B5A5] hover:bg-[#008F82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5]">
              Update Profile
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5]">
              Download Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

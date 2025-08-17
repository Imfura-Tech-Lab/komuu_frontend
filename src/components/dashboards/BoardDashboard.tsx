export function BoardDashboard() {
  const boardMetrics = [
    {
      name: "Pending Decisions",
      value: "7",
      change: "3 Urgent",
      changeType: "negative",
    },
    {
      name: "Monthly Budget",
      value: "$125K",
      change: "94% Used",
      changeType: "neutral",
    },
    {
      name: "Member Satisfaction",
      value: "4.2/5",
      change: "+0.3",
      changeType: "positive",
    },
    {
      name: "Policy Updates",
      value: "4",
      change: "This Quarter",
      changeType: "neutral",
    },
  ];

  const upcomingMeetings = [
    {
      title: "Budget Review",
      date: "2025-08-20",
      time: "2:00 PM",
      type: "Finance",
    },
    {
      title: "Policy Committee",
      date: "2025-08-25",
      time: "10:00 AM",
      type: "Governance",
    },
    {
      title: "Strategic Planning",
      date: "2025-08-30",
      time: "9:00 AM",
      type: "Strategy",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Board Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Governance oversight and decision tracking
          </p>
        </div>
      </div>

      {/* Board Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {boardMetrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {metric.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {metric.value}
                  </dd>
                </div>
                <div
                  className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    metric.changeType === "positive"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : metric.changeType === "negative"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {metric.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Upcoming Board Meetings
          </h3>
          <div className="mt-5">
            <div className="space-y-3">
              {upcomingMeetings.map((meeting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {meeting.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {meeting.date} at {meeting.time}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {meeting.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

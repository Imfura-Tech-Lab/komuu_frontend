export function PresidentDashboard() {
  const executiveMetrics = [
    {
      name: "Total Revenue",
      value: "$2.4M",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      name: "Member Growth",
      value: "18%",
      change: "+2.3%",
      changeType: "positive",
    },
    {
      name: "Strategic Goals",
      value: "8/12",
      change: "On Track",
      changeType: "neutral",
    },
    {
      name: "Board Meetings",
      value: "3",
      change: "This Month",
      changeType: "neutral",
    },
  ];

  const strategicInitiatives = [
    { title: "Digital Transformation", progress: 75, status: "On Track" },
    { title: "Member Engagement Program", progress: 60, status: "At Risk" },
    { title: "Financial Sustainability", progress: 90, status: "Ahead" },
    { title: "Community Outreach", progress: 45, status: "Behind" },
  ];

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Executive Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Strategic overview and key performance indicators
          </p>
        </div>
      </div>

      {/* Executive Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {executiveMetrics.map((metric) => (
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

      {/* Strategic Initiatives */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Strategic Initiatives
          </h3>
          <div className="mt-5 space-y-4">
            {strategicInitiatives.map((initiative) => (
              <div
                key={initiative.title}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {initiative.title}
                  </p>
                  <div className="mt-1 flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                      <div
                        className="bg-[#00B5A5] h-2 rounded-full"
                        style={{ width: `${initiative.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {initiative.progress}%
                    </span>
                  </div>
                </div>
                <span
                  className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    initiative.status === "On Track"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : initiative.status === "Ahead"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : initiative.status === "At Risk"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {initiative.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

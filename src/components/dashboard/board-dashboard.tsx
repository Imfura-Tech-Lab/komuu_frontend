"use client";

import { BoardDashboardData } from "@/types/dashboard";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  Line,
  //@ts-ignore
} from "react-simple-maps";
import { useState, useMemo } from "react";

// World map topology URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface BoardDashboardProps {
  data: BoardDashboardData;
  message: string;
  refetch: () => void;
}

const COLORS = ["#00B5A5", "#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF"];
const MAP_COLORS = {
  default: "#E6E6E6",
  hover: "#00B5A5",
  pressed: "#008080",
  member: "#00B5A5",
  highlight: "#FF6B6B",
};

type DashboardTab =
  | "overview"
  | "members"
  | "applications"
  | "geography"
  | "analytics";

// Interactive Map Component
function InteractiveMap({
  countriesWithMembers,
  countryDataMap,
  onCountryClick,
}: {
  countriesWithMembers: any[];
  countryDataMap: Map<string, number>;
  onCountryClick?: (country: string, count: number) => void;
}) {
  const [tooltip, setTooltip] = useState<{
    content: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [position, setPosition] = useState({
    coordinates: [0, 20] as [number, number],
    zoom: 1,
  });

  // Enhanced country coordinates
  const countryCoordinates = useMemo(
    () =>
      new Map([
        ["united states", [-100, 40]],
        ["united kingdom", [-2, 54]],
        ["canada", [-100, 60]],
        ["australia", [135, -25]],
        ["germany", [10, 51]],
        ["france", [2, 46]],
        ["japan", [138, 36]],
        ["brazil", [-55, -10]],
        ["india", [78, 22]],
        ["south africa", [24, -29]],
        ["china", [105, 35]],
        ["russia", [100, 60]],
        ["mexico", [-102, 23]],
        ["spain", [-3, 40]],
        ["italy", [12, 42]],
        ["netherlands", [5, 52]],
        ["sweden", [15, 62]],
        ["norway", [10, 62]],
        ["denmark", [10, 56]],
        ["finland", [26, 64]],
        ["belgium", [4, 50]],
        ["switzerland", [8, 47]],
        ["austria", [13, 47]],
        ["poland", [19, 52]],
        ["portugal", [-8, 39]],
        ["greece", [22, 39]],
        ["turkey", [35, 39]],
        ["egypt", [30, 26]],
        ["nigeria", [8, 10]],
        ["kenya", [38, 1]],
        ["ghana", [-1, 8]],
        ["argentina", [-64, -34]],
        ["chile", [-71, -30]],
        ["colombia", [-74, 4]],
        ["peru", [-76, -10]],
        ["new zealand", [174, -41]],
        ["singapore", [104, 1]],
        ["south korea", [128, 36]],
        ["thailand", [100, 15]],
        ["vietnam", [106, 16]],
        ["malaysia", [112, 4]],
        ["indonesia", [120, -5]],
        ["philippines", [122, 13]],
        ["pakistan", [70, 30]],
        ["bangladesh", [90, 24]],
        ["saudi arabia", [45, 25]],
        ["uae", [54, 24]],
        ["qatar", [51, 25]],
        ["israel", [35, 31]],
        ["ukraine", [31, 49]],
      ]),
    []
  );

  // Get top 10 countries for highlighting
  const topCountries = useMemo(
    () => countriesWithMembers.sort((a, b) => b.count - a.count).slice(0, 10),
    [countriesWithMembers]
  );

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  const handleCountryClick = (geo: any) => {
    const countryName = geo.properties.name;
    const memberCount = countryDataMap.get(countryName.toLowerCase()) || 0;

    setSelectedCountry(countryName);
    onCountryClick?.(countryName, memberCount);
  };

  const handleCountryHover = (geo: any, event: any) => {
    const countryName = geo.properties.name;
    const memberCount = countryDataMap.get(countryName.toLowerCase()) || 0;

    setTooltip({
      content: `${countryName}: ${memberCount} member${
        memberCount !== 1 ? "s" : ""
      }`,
      x: event.clientX,
      y: event.clientY - 10,
    });
  };

  const calculateMarkerSize = (count: number) => {
    const maxCount = Math.max(...countriesWithMembers.map((c) => c.count));
    return Math.max(3, (count / maxCount) * 15);
  };

  const getCountryColor = (countryName: string, memberCount: number) => {
    if (selectedCountry === countryName) return "#FF6B6B";
    if (
      topCountries.some(
        (c) => c.country.toLowerCase() === countryName.toLowerCase()
      )
    )
      return "#00D4C7";
    if (memberCount > 0) return "#00B5A5";
    return "#E6E6E6";
  };

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Reset View"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold mb-2">
            Zoom: {position.zoom.toFixed(1)}x
          </div>
          <div className="flex gap-1">
            <button
              onClick={() =>
                setPosition((prev) => ({
                  ...prev,
                  zoom: Math.min(prev.zoom * 1.5, 8),
                }))
              }
              className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              +
            </button>
            <button
              onClick={() =>
                setPosition((prev) => ({
                  ...prev,
                  zoom: Math.max(prev.zoom / 1.5, 1),
                }))
              }
              className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div
        className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        onMouseLeave={() => setTooltip(null)}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [0, 20],
          }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={geoUrl}>
              {({ 
                // @ts-ignore
                geographies 
              }) =>
                geographies.map(
                  // @ts-ignore
                  (geo) => {
                  const countryName = geo.properties.name;
                  const memberCount =
                    countryDataMap.get(countryName.toLowerCase()) || 0;
                  const fillColor = getCountryColor(countryName, memberCount);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#FFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", cursor: "pointer" },
                        hover: {
                          fill:
                            selectedCountry === countryName
                              ? "#FF6B6B"
                              : "#00D4C7",
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#008080",
                          outline: "none",
                        },
                      }}
                      onClick={() => handleCountryClick(geo)}
                      onMouseEnter={
                        // @ts-ignore
                        (event) => handleCountryHover(geo, event)
                      }
                      onMouseMove={
                        // @ts-ignore
                        (event) => handleCountryHover(geo, event)
                      }
                    />
                  );
                })
              }
            </Geographies>

            {/* Animated Markers for countries with members */}
            {countriesWithMembers.map((country) => {
              const coordinates = countryCoordinates.get(
                country.country.toLowerCase()
              );
              if (!coordinates) return null;

              return (
                <Marker key={country.country} coordinates={coordinates}>
                  <g>
                    <circle
                      r={calculateMarkerSize(country.count)}
                      fill="#FF6B6B"
                      stroke="#FFF"
                      strokeWidth={1.5}
                      className="hover:r-4 transition-all duration-200"
                    />
                    <text
                      textAnchor="middle"
                      y={-calculateMarkerSize(country.count) - 5}
                      style={{
                        fontFamily: "system-ui",
                        fill: "#374151",
                        fontSize: "10px",
                        fontWeight: "bold",
                        pointerEvents: "none",
                      }}
                    >
                      {country.count}
                    </text>
                  </g>
                </Marker>
              );
            })}

            {/* Highlight lines for top countries */}
            {selectedCountry &&
              topCountries.some(
                (c) => c.country.toLowerCase() === selectedCountry.toLowerCase()
              ) && (
                <Line
                  from={[0, 20]}
                  to={
                    countryCoordinates.get(selectedCountry.toLowerCase()) || [
                      0, 0,
                    ]
                  }
                  stroke="#FF6B6B"
                  strokeWidth={1}
                  strokeDasharray="5,5"
                />
              )}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Enhanced Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip.content}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}

      {/* Selected Country Info */}
      {selectedCountry && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📍 {selectedCountry}
          </h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Members: {countryDataMap.get(selectedCountry.toLowerCase()) || 0}
            {topCountries.some(
              (c) => c.country.toLowerCase() === selectedCountry.toLowerCase()
            ) && " 🏆 (Top 10 Country)"}
          </p>
        </div>
      )}

      {/* Enhanced Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#00B5A5]"></div>
          <span>With Members</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#00D4C7]"></div>
          <span>Top 10 Country</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FF6B6B]"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#E6E6E6] border border-gray-300"></div>
          <span>No Members</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
          <span>Member Count</span>
        </div>
      </div>
    </div>
  );
}

export default function BoardDashboard({
  data,
  message,
  refetch,
}: BoardDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const {
    total_registration,
    current_members,
    inactive_members,
    countries_of_our_members,
    stats_applications,
    membership_types,
    fields_of_pratice,
    countries_of_operations,
    application_per_region,
  } = data;

  // Prepare map data
  const countryDataMap = new Map(
    countries_of_operations.map((country) => [
      country.country.toLowerCase(),
      country.count,
    ])
  );

  const countriesWithMembers = countries_of_operations.filter(
    (country) => country.count >= 1
  );

  const tabs: { id: DashboardTab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "members", label: "Members", count: current_members },
    { id: "applications", label: "Applications", count: total_registration },
    { id: "geography", label: "Geography", count: countries_of_our_members },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-gradient-to-r from-[#00B5A5] to-[#00D4C7] rounded-lg p-6 text-white shadow-lg flex-1 mr-4">
            <h2 className="text-2xl font-bold mb-2">Board Dashboard</h2>
            <p className="text-[#E6FFFD]">{message}</p>
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#00B5A5] text-[#00B5A5] dark:text-[#00D4C7]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                      {tab.count.toLocaleString()}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === "overview" && (
            <OverviewTab
              data={data}
              countriesWithMembers={countriesWithMembers}
              countryDataMap={countryDataMap}
            />
          )}
          {activeTab === "members" && <MembersTab data={data} />}
          {activeTab === "applications" && <ApplicationsTab data={data} />}
          {activeTab === "geography" && (
            <GeographyTab
              data={data}
              countriesWithMembers={countriesWithMembers}
              countryDataMap={countryDataMap}
            />
          )}
          {activeTab === "analytics" && <AnalyticsTab data={data} />}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  data,
  countriesWithMembers,
  countryDataMap,
}: {
  data: BoardDashboardData;
  countriesWithMembers: any[];
  countryDataMap: Map<string, number>;
}) {
  const {
    total_registration,
    current_members,
    inactive_members,
    countries_of_our_members,
    stats_applications,
    membership_types,
  } = data;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Registrations"
          value={total_registration}
          icon={<UsersIcon />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Members"
          value={current_members}
          icon={<CheckCircleIcon />}
          color="bg-green-500"
        />
        <StatCard
          title="Inactive Members"
          value={inactive_members}
          icon={<XCircleIcon />}
          color="bg-red-500"
        />
        <StatCard
          title="Countries Represented"
          value={countries_of_our_members}
          icon={<GlobeIcon />}
          color="bg-purple-500"
        />
      </div>

      {/* Quick Map Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Global Overview
        </h3>
        <div className="h-64">
          <InteractiveMap
            countriesWithMembers={countriesWithMembers}
            countryDataMap={countryDataMap}
          />
        </div>
      </div>

      {/* Key Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Application Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats_applications}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {stats_applications.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Membership Types">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={membership_types}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00B5A5" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// Members Tab Component
function MembersTab({ data }: { data: BoardDashboardData }) {
  const {
    membership_types,
    fields_of_pratice,
    current_members,
    inactive_members,
  } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Membership Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Active Members", value: current_members },
                  { name: "Inactive Members", value: inactive_members },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                <Cell fill="#00B5A5" />
                <Cell fill="#FF6B6B" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Membership Types">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={membership_types}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4ECDC4" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Fields of Practice">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={fields_of_pratice} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="field_of_practice" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="count" fill="#00B5A5" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// Applications Tab Component
function ApplicationsTab({ data }: { data: BoardDashboardData }) {
  const { stats_applications, application_per_region, total_registration } =
    data;

  const approvedCount =
    stats_applications.find((a) => a.status === "Approved")?.count || 0;
  const pendingCount =
    stats_applications.find((a) => a.status === "Pending")?.count || 0;
  const rejectionCount =
    stats_applications.find((a) => a.status === "Rejected")?.count || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {total_registration}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total Applications
          </div>
        </div>
        <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {approvedCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Approved
          </div>
        </div>
        <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Pending Review
          </div>
        </div>
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {rejectionCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Rejected
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Application Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats_applications}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats_applications.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Applications by Region">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={application_per_region}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="region"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FFE66D" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// Geography Tab Component
function GeographyTab({
  data,
  countriesWithMembers,
  countryDataMap,
}: {
  data: BoardDashboardData;
  countriesWithMembers: any[];
  countryDataMap: Map<string, number>;
}) {
  const { countries_of_operations } = data;
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleCountryClick = (country: string, count: number) => {
    setSelectedCountry(country);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Interactive Global Member Distribution
        </h3>

        <InteractiveMap
          countriesWithMembers={countriesWithMembers}
          countryDataMap={countryDataMap}
          onCountryClick={handleCountryClick}
        />
      </div>

      {/* Countries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Countries of Operations ({countries_of_operations.length} total)
          </h3>
          {selectedCountry && (
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Selected: <strong>{selectedCountry}</strong>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {countries_of_operations
                .sort((a, b) => b.count - a.count)
                .map((country, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedCountry === country.country
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {country.country}
                      {selectedCountry === country.country && (
                        <span className="ml-2 text-blue-600">📍</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {country.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          country.count > 50
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : country.count > 10
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {country.count > 50
                          ? "High"
                          : country.count > 10
                          ? "Medium"
                          : "Low"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      #{idx + 1}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ data }: { data: BoardDashboardData }) {
  const {
    fields_of_pratice,
    application_per_region,
    membership_types,
    stats_applications,
  } = data;

  const totalMembers = membership_types.reduce(
    (sum, type) => sum + type.count,
    0
  );
  const approvalRate =
    ((stats_applications.find((a) => a.status === "Approved")?.count || 0) /
      (stats_applications.reduce((sum, app) => sum + app.count, 0) || 1)) *
    100;

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Total Membership
          </h4>
          <div className="text-3xl font-bold text-[#00B5A5]">
            {totalMembers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Across all types
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Approval Rate
          </h4>
          <div className="text-3xl font-bold text-green-600">
            {approvalRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Application success rate
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Top Field
          </h4>
          <div className="text-xl font-bold text-purple-600">
            {fields_of_pratice[0]?.field_of_practice || "N/A"}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {fields_of_pratice[0]?.count || 0} members
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Fields of Practice Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fields_of_pratice} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="field_of_practice" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#00B5A5" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Regional Application Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={application_per_region}
                dataKey="count"
                nameKey="region"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {application_per_region.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="font-semibold mb-4">Membership Type Analysis</h4>
          <div className="space-y-3">
            {membership_types.map((type, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {type.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{type.count}</span>
                  <span className="text-xs text-gray-500">
                    ({((type.count / totalMembers) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="font-semibold mb-4">Top Fields of Practice</h4>
          <div className="space-y-3">
            {fields_of_pratice.slice(0, 5).map((field, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {field.field_of_practice}
                </span>
                <span className="font-semibold">{field.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="font-semibold mb-4">Regional Performance</h4>
          <div className="space-y-3">
            {application_per_region.map((region, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {region.region}
                </span>
                <span className="font-semibold">{region.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color} rounded-full p-3`}>{icon}</div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

// Icon Components
function UsersIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

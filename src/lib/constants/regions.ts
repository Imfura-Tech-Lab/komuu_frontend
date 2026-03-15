// ============================================================================
// African Countries and Timezones
// ============================================================================

export interface CountryData {
  code: string;
  name: string;
  dialCode: string;
  timezone: string;
  flag: string;
}

// African countries commonly used in the platform
export const AFRICAN_COUNTRIES: CountryData[] = [
  { code: "ZA", name: "South Africa", dialCode: "+27", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  { code: "RW", name: "Rwanda", dialCode: "+250", timezone: "Africa/Kigali", flag: "🇷🇼" },
  { code: "KE", name: "Kenya", dialCode: "+254", timezone: "Africa/Nairobi", flag: "🇰🇪" },
  { code: "NG", name: "Nigeria", dialCode: "+234", timezone: "Africa/Lagos", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", dialCode: "+233", timezone: "Africa/Accra", flag: "🇬🇭" },
  { code: "EG", name: "Egypt", dialCode: "+20", timezone: "Africa/Cairo", flag: "🇪🇬" },
  { code: "ET", name: "Ethiopia", dialCode: "+251", timezone: "Africa/Addis_Ababa", flag: "🇪🇹" },
  { code: "TZ", name: "Tanzania", dialCode: "+255", timezone: "Africa/Dar_es_Salaam", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", dialCode: "+256", timezone: "Africa/Kampala", flag: "🇺🇬" },
  { code: "MA", name: "Morocco", dialCode: "+212", timezone: "Africa/Casablanca", flag: "🇲🇦" },
  { code: "DZ", name: "Algeria", dialCode: "+213", timezone: "Africa/Algiers", flag: "🇩🇿" },
  { code: "TN", name: "Tunisia", dialCode: "+216", timezone: "Africa/Tunis", flag: "🇹🇳" },
  { code: "SN", name: "Senegal", dialCode: "+221", timezone: "Africa/Dakar", flag: "🇸🇳" },
  { code: "CI", name: "Ivory Coast", dialCode: "+225", timezone: "Africa/Abidjan", flag: "🇨🇮" },
  { code: "CM", name: "Cameroon", dialCode: "+237", timezone: "Africa/Douala", flag: "🇨🇲" },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", timezone: "Africa/Harare", flag: "🇿🇼" },
  { code: "ZM", name: "Zambia", dialCode: "+260", timezone: "Africa/Lusaka", flag: "🇿🇲" },
  { code: "BW", name: "Botswana", dialCode: "+267", timezone: "Africa/Gaborone", flag: "🇧🇼" },
  { code: "NA", name: "Namibia", dialCode: "+264", timezone: "Africa/Windhoek", flag: "🇳🇦" },
  { code: "MZ", name: "Mozambique", dialCode: "+258", timezone: "Africa/Maputo", flag: "🇲🇿" },
  { code: "AO", name: "Angola", dialCode: "+244", timezone: "Africa/Luanda", flag: "🇦🇴" },
  { code: "CD", name: "DR Congo", dialCode: "+243", timezone: "Africa/Kinshasa", flag: "🇨🇩" },
  { code: "SD", name: "Sudan", dialCode: "+249", timezone: "Africa/Khartoum", flag: "🇸🇩" },
  { code: "LY", name: "Libya", dialCode: "+218", timezone: "Africa/Tripoli", flag: "🇱🇾" },
  { code: "MW", name: "Malawi", dialCode: "+265", timezone: "Africa/Blantyre", flag: "🇲🇼" },
  { code: "MG", name: "Madagascar", dialCode: "+261", timezone: "Indian/Antananarivo", flag: "🇲🇬" },
  { code: "MU", name: "Mauritius", dialCode: "+230", timezone: "Indian/Mauritius", flag: "🇲🇺" },
  { code: "SC", name: "Seychelles", dialCode: "+248", timezone: "Indian/Mahe", flag: "🇸🇨" },
  { code: "SZ", name: "Eswatini", dialCode: "+268", timezone: "Africa/Mbabane", flag: "🇸🇿" },
  { code: "LS", name: "Lesotho", dialCode: "+266", timezone: "Africa/Maseru", flag: "🇱🇸" },
];

// Priority countries shown at top of phone input
export const PRIORITY_COUNTRIES = ["ZA", "RW", "KE", "NG", "GH", "EG", "ET", "TZ", "UG"];

// ============================================================================
// Timezone Utilities
// ============================================================================

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  region: string;
}

// Common African timezones with UTC offsets
export const AFRICAN_TIMEZONES: TimezoneOption[] = [
  { value: "Africa/Johannesburg", label: "South Africa (SAST)", offset: "UTC+2", region: "Southern Africa" },
  { value: "Africa/Kigali", label: "Rwanda (CAT)", offset: "UTC+2", region: "Central Africa" },
  { value: "Africa/Nairobi", label: "Kenya (EAT)", offset: "UTC+3", region: "East Africa" },
  { value: "Africa/Lagos", label: "Nigeria (WAT)", offset: "UTC+1", region: "West Africa" },
  { value: "Africa/Accra", label: "Ghana (GMT)", offset: "UTC+0", region: "West Africa" },
  { value: "Africa/Cairo", label: "Egypt (EET)", offset: "UTC+2", region: "North Africa" },
  { value: "Africa/Addis_Ababa", label: "Ethiopia (EAT)", offset: "UTC+3", region: "East Africa" },
  { value: "Africa/Dar_es_Salaam", label: "Tanzania (EAT)", offset: "UTC+3", region: "East Africa" },
  { value: "Africa/Kampala", label: "Uganda (EAT)", offset: "UTC+3", region: "East Africa" },
  { value: "Africa/Casablanca", label: "Morocco (WET)", offset: "UTC+0/+1", region: "North Africa" },
  { value: "Africa/Algiers", label: "Algeria (CET)", offset: "UTC+1", region: "North Africa" },
  { value: "Africa/Tunis", label: "Tunisia (CET)", offset: "UTC+1", region: "North Africa" },
  { value: "Africa/Dakar", label: "Senegal (GMT)", offset: "UTC+0", region: "West Africa" },
  { value: "Africa/Abidjan", label: "Ivory Coast (GMT)", offset: "UTC+0", region: "West Africa" },
  { value: "Africa/Douala", label: "Cameroon (WAT)", offset: "UTC+1", region: "Central Africa" },
  { value: "Africa/Harare", label: "Zimbabwe (CAT)", offset: "UTC+2", region: "Southern Africa" },
  { value: "Africa/Lusaka", label: "Zambia (CAT)", offset: "UTC+2", region: "Southern Africa" },
  { value: "Africa/Gaborone", label: "Botswana (CAT)", offset: "UTC+2", region: "Southern Africa" },
  { value: "Africa/Windhoek", label: "Namibia (CAT)", offset: "UTC+2", region: "Southern Africa" },
  { value: "Africa/Maputo", label: "Mozambique (CAT)", offset: "UTC+2", region: "Southern Africa" },
  { value: "Africa/Luanda", label: "Angola (WAT)", offset: "UTC+1", region: "Central Africa" },
  { value: "Africa/Kinshasa", label: "DR Congo West (WAT)", offset: "UTC+1", region: "Central Africa" },
  { value: "Africa/Lubumbashi", label: "DR Congo East (CAT)", offset: "UTC+2", region: "Central Africa" },
  { value: "Africa/Khartoum", label: "Sudan (CAT)", offset: "UTC+2", region: "North Africa" },
  { value: "Africa/Tripoli", label: "Libya (EET)", offset: "UTC+2", region: "North Africa" },
];

// Other common timezones (for international members)
export const OTHER_TIMEZONES: TimezoneOption[] = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: "UTC+0", region: "Universal" },
  { value: "Europe/London", label: "London (GMT/BST)", offset: "UTC+0/+1", region: "Europe" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", offset: "UTC+1/+2", region: "Europe" },
  { value: "America/New_York", label: "New York (EST/EDT)", offset: "UTC-5/-4", region: "Americas" },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4", region: "Middle East" },
];

// All timezones combined
export const ALL_TIMEZONES = [...AFRICAN_TIMEZONES, ...OTHER_TIMEZONES];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get timezone by country code
 */
export function getTimezoneByCountry(countryCode: string): string {
  const country = AFRICAN_COUNTRIES.find((c) => c.code === countryCode);
  return country?.timezone || "UTC";
}

/**
 * Get country by timezone
 */
export function getCountryByTimezone(timezone: string): CountryData | undefined {
  return AFRICAN_COUNTRIES.find((c) => c.timezone === timezone);
}

/**
 * Get timezone display label
 */
export function getTimezoneLabel(timezone: string): string {
  const tz = ALL_TIMEZONES.find((t) => t.value === timezone);
  return tz ? `${tz.label} (${tz.offset})` : timezone;
}

/**
 * Get current offset for a timezone (handles DST)
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Get country data by code
 */
export function getCountryByCode(code: string): CountryData | undefined {
  return AFRICAN_COUNTRIES.find((c) => c.code === code);
}

/**
 * Format phone number with country code
 */
export function formatPhoneWithCountry(phone: string, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  if (!country) return phone;

  // Remove any existing country code
  const cleanPhone = phone.replace(/^\+\d+/, "").replace(/\D/g, "");
  return `${country.dialCode}${cleanPhone}`;
}

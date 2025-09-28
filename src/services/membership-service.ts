import { apiClient } from "@/lib/api-client";

export interface Country {
  id: number;
  country: string;
}

export interface Title {
  name: string;
}

export interface ApplicationType {
  name: string;
  price?: number;
  fee?: number;
  description?: string;
}

export interface FieldOfPractice {
  name: string;
  description?: string;
}

export interface AssociateCategory {
  name: string;
}

// API Response interfaces
interface CountriesApiResponse {
  status: string;
  message: string;
  countries: Country[];
}

interface TypesApiResponse {
  status: string;
  message: string;
  types: string[];
}

export const membershipService = {
  getCountries: async () => {
    const response = await apiClient.get<CountriesApiResponse>("/countries");
    return {
      ...response,
      data: response.data.countries.map((country) => ({
        id: country.id.toString(),
        name: country.country,
      })),
    };
  },

  getTitles: async () => {
    const response = await apiClient.get<TypesApiResponse>("/titles");
    return {
      ...response,
      data: response.data.types.map((title) => ({
        id: title,
        name: title,
      })),
    };
  },

  getApplicationTypes: async () => {
    const response = await apiClient.get<TypesApiResponse>(
      "/application-types"
    );
    return {
      ...response,
      data: response.data.types.map((type) => ({
        id: type,
        name: type,
        // Add default pricing based on membership type
        price: getMembershipPrice(type),
      })),
    };
  },

  getFieldsOfPractice: async () => {
    const response = await apiClient.get("/get-fields-of-practices");
    const fieldsData = response.data.data?.data || [];

    return {
      ...response,
      data: fieldsData.map((field: any) => ({
        id: field.id || field.name || field,
        name: field.name || field,
      })),
    };
  },

  getAssociateMembershipCategories: async () => {
    const response = await apiClient.get<TypesApiResponse>(
      "/associate-membership-categories"
    );
    return {
      ...response,
      data: response.data.types.map((category) => ({
        id: category,
        name: category,
      })),
    };
  },

  // Method to fetch all master data at once
  getAllMasterData: async () => {
    const [
      countriesRes,
      titlesRes,
      applicationTypesRes,
      fieldsRes,
      categoriesRes,
    ] = await Promise.all([
      membershipService.getCountries(),
      membershipService.getTitles(),
      membershipService.getApplicationTypes(),
      membershipService.getFieldsOfPractice(),
      membershipService.getAssociateMembershipCategories(),
    ]);

    return {
      countries: countriesRes.data,
      titles: titlesRes.data,
      membershipTypes: applicationTypesRes.data,
      fieldsOfPractice: fieldsRes.data,
      associateCategories: categoriesRes.data,
    };
  },
};

// Helper function to get membership pricing
function getMembershipPrice(membershipType: string): number {
  switch (membershipType) {
    case "Full Member":
      return 100;
    case "Associate Member":
      return 75;
    case "Student Member":
      return 25;
    case "Affiliate Member":
      return 50;
    default:
      return 0;
  }
}

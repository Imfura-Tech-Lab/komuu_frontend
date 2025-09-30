import { apiClient } from "@/lib/api-client";

export interface Country {
  id: number;
  name: string;
}

export interface Organization {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
}

export interface ApplicationType {
  id: number;
  category: string;
  price: number;
  frequency: string;
  currency: string;
  can_be_applied: boolean;
}

export interface FieldOfPractice {
  id: number;
  name: string;
  code: string;
}

export interface Title {
  id: string;
  name: string;
}

interface CountriesApiResponse {
  status: string;
  message: string;
  countries: Array<{ id: number; country: string }>;
}

interface OrganizationsApiResponse {
  status: string;
  message: string;
  types: Array<{
    id: string;
    company_name: string;
    company_abbreviation: string;
    company_logo: string;
  }>;
}

interface ApplicationTypesApiResponse {
  status: string;
  message: string;
  types: Array<{
    id: number;
    category: string;
    price: string;
    frequency: string;
    currency: string;
    can_be_applied: boolean;
  }>;
}

interface TitlesApiResponse {
  status: string;
  message: string;
  types: string[];
}

interface FieldsOfPracticeApiResponse {
  status: string;
  message: string;
  data: {
    data: Array<{
      id: number;
      field: string;
      code: string;
      sub_fields: any[];
    }>;
  };
}

export const membershipService = {
  getOrganizations: async () => {
    const response = await apiClient.get<OrganizationsApiResponse>(
      "/organizations"
    );
    return {
      ...response,
      data: response.data.types.map((org) => ({
        id: org.id,
        name: org.company_name,
        abbreviation: org.company_abbreviation,
        logo: org.company_logo,
      })),
    };
  },

  getCountries: async () => {
    const response = await apiClient.get<CountriesApiResponse>("/countries");
    return {
      ...response,
      data: response.data.countries.map((country) => ({
        id: country.id,
        name: country.country,
      })),
    };
  },

  getTitles: async () => {
    const response = await apiClient.get<TitlesApiResponse>("/titles");
    return {
      ...response,
      data: response.data.types.map((title) => ({
        id: title,
        name: title,
      })),
    };
  },

  getApplicationTypes: async (organizationId: string) => {
    const response = await apiClient.get<ApplicationTypesApiResponse>(
      `/${organizationId}/application-types`
    );
    return {
      ...response,
      data: response.data.types.map((type) => ({
        id: type.id,
        category: type.category,
        price: parseFloat(type.price),
        frequency: type.frequency,
        currency: type.currency,
        can_be_applied: type.can_be_applied,
      })),
    };
  },

  getFieldsOfPractice: async (organizationId: string) => {
    const response = await apiClient.get<FieldsOfPracticeApiResponse>(
      `/${organizationId}/get-fields-of-practices`
    );
    const fieldsData = response.data.data?.data || [];

    return {
      ...response,
      data: fieldsData.map((field) => ({
        id: field.id,
        name: field.field,
        code: field.code,
      })),
    };
  },

  getAllMasterData: async (organizationId: string) => {
    const [countriesRes, titlesRes, applicationTypesRes, fieldsRes] =
      await Promise.all([
        membershipService.getCountries(),
        membershipService.getTitles(),
        membershipService.getApplicationTypes(organizationId),
        membershipService.getFieldsOfPractice(organizationId),
      ]);

    return {
      countries: countriesRes.data,
      titles: titlesRes.data,
      membershipTypes: applicationTypesRes.data,
      fieldsOfPractice: fieldsRes.data,
    };
  },
};

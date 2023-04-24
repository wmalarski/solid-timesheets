export type CustomField = {
  id: number;
  name: string;
  value: string;
};

export type User = {
  api_key: string;
  created_on: string;
  custom_fields: CustomField[];
  firstname: string;
  id: number;
  last_login_on: string;
  lastname: string;
  login: string;
};

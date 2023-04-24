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

export type Project = {
  id: number;
  name: string;
};

export type Issue = {
  id: number;
};

export type TimeEntryUser = {
  id: number;
  name: string;
};

export type Activity = {
  id: number;
  name: string;
};

export type TimeEntry = {
  activity: Activity;
  comments: string;
  created_on: string;
  custom_fields: CustomField[];
  hours: number;
  id: number;
  issue: Issue;
  project: Project;
  spent_on: string;
  updated_on: string;
  user: TimeEntryUser;
};

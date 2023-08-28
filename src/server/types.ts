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

export type TimeEntryIssue = {
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
  issue: TimeEntryIssue;
  project: Project;
  spent_on: string;
  updated_on: string;
  user: TimeEntryUser;
};

export type Tracker = {
  id: number;
  name: string;
};

export type Status = {
  id: number;
  name: string;
};

export type Priority = {
  id: number;
  name: string;
};

export type Author = {
  id: number;
  name: string;
};

export type AssignedTo = {
  id: number;
  name: string;
};

export type FixedVersion = {
  id: number;
  name: string;
};

export type Issue = {
  id: number;
  project: Project;
  tracker: Tracker;
  status: Status;
  priority: Priority;
  author: Author;
  assigned_to: AssignedTo;
  subject: string;
  description?: string;
  start_date?: string;
  done_ratio: number;
  custom_fields: CustomField[];
  created_on: string;
  updated_on: string;
  fixed_version?: FixedVersion;
};

export type IssueEssentials = Pick<Issue, "id" | "subject" | "project">;

export type SearchResult = {
  id: number;
  title: string;
  type: string;
  url: string;
  description: string;
  datetime: string;
};

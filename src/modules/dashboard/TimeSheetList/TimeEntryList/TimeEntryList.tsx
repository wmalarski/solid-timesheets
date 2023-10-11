import { createQuery } from "@tanstack/solid-query";
import { For, type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Card, CardBody } from "~/components/Card";
import { twCx } from "~/components/utils/twCva";
import { useI18n } from "~/contexts/I18nContext";
import { useDashboardConfig } from "~/modules/dashboard/DashboardConfig";
import { getIssueKey, getIssueServerQuery, issueHref } from "~/server/issues";
import type { TimeEntry } from "~/server/types";

type IssueDetailsProps = {
  issueId: number;
  class?: string;
};

const IssueDetails: Component<IssueDetailsProps> = (props) => {
  const issueQuery = createQuery(() => ({
    queryFn: (context) => getIssueServerQuery(context.queryKey),
    queryKey: getIssueKey({ id: props.issueId }),
  }));

  return (
    <div class={twCx("flex flex-col items-start gap-2", props.class)}>
      <span class="text-xs font-semibold uppercase">
        {issueQuery.data?.issue.project.name}
      </span>
      <span class="text-base">{issueQuery.data?.issue.subject}</span>
    </div>
  );
};

type TimeEntryListItemProps = {
  entry: TimeEntry;
};

const TimeEntryListItem: Component<TimeEntryListItemProps> = (props) => {
  const { t } = useI18n();

  const config = useDashboardConfig();

  return (
    <Card color="disabled" size="compact" variant="bordered">
      <CardBody>
        <header class="flex items-center gap-2">
          <a
            class="grow"
            href={issueHref({
              issueId: props.entry.issue.id,
              rmBaseUrl: config().rmBaseUrl,
            })}
          >
            <Badge class="hover:underline" variant="outline">
              {props.entry.issue.id}
            </Badge>
          </a>
        </header>
        <IssueDetails issueId={props.entry.issue.id} />
        <div class="flex flex-col gap-2">
          <div class="flex flex-col">
            <span class="select-none px-1 py-2">
              {t("dashboard.timeEntry.hours.label")}
            </span>
            <span class="px-2 py-1 text-xs font-bold">{props.entry.hours}</span>
            <span class="select-none px-1 py-2">
              {t("dashboard.timeEntry.comments.label")}
            </span>
            <span class="px-2 py-1 text-xs font-bold">
              {props.entry.comments}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const TimeEntryEmptyList: Component = () => {
  return <div class="flex h-full flex-col overflow-scroll" />;
};

export const TimeEntryErroredList: Component = () => {
  return <div class="flex h-full flex-col overflow-scroll" />;
};

export const TimeEntryLoadingList: Component = () => {
  return <div class="flex h-full flex-col overflow-scroll" />;
};

type TimeEntryListProps = {
  timeEntries: TimeEntry[];
};

export const TimeEntryList: Component<TimeEntryListProps> = (props) => {
  return (
    <div class="flex h-full flex-col overflow-scroll">
      <For each={props.timeEntries} fallback={<TimeEntryEmptyList />}>
        {(entry) => <TimeEntryListItem entry={entry} />}
      </For>
    </div>
  );
};

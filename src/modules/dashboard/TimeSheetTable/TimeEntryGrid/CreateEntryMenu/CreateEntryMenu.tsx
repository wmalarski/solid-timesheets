import { createQuery } from "@tanstack/solid-query";
import { IoAddSharp } from "solid-icons/io";
import { For, type Component } from "solid-js";
import { isServer } from "solid-js/web";
import {
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "~/components/DropdownMenu";
import { useI18n } from "~/contexts/I18nContext";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import type { Issue } from "~/server/types";
import { createSheetEntryArgs, useTimeSheetContext } from "../../EntriesStore";

type Props = {
  date: Date;
};

export const CreateEntryMenu: Component<Props> = (props) => {
  const { t } = useI18n();

  const issuesQuery = createQuery(() => ({
    enabled: !isServer,
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
  }));

  const { setState } = useTimeSheetContext();

  const onCreateClick = (issue: Issue) => {
    createSheetEntryArgs({
      args: {
        comments: "",
        hours: 0,
        issueId: issue.id,
        spentOn: props.date,
      },
      setState,
    });
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger
        aria-label={t("dashboard.createDialog.title")}
        shape="square"
        size="sm"
        variant="ghost"
      >
        <DropdownMenuIcon rotation={90}>
          <IoAddSharp />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent class="max-h-96 overflow-y-scroll">
          <For each={issuesQuery.data?.issues}>
            {(issue) => (
              <DropdownMenuItem
                onClick={() => onCreateClick(issue)}
                class="flex h-12 flex-col items-start justify-center"
              >
                <DropdownMenuItemDescription>
                  {issue.project.name}
                </DropdownMenuItemDescription>
                <DropdownMenuItemLabel>{issue.subject}</DropdownMenuItemLabel>
              </DropdownMenuItem>
            )}
          </For>
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

import { useI18n } from "@solid-primitives/i18n";
import { IoChevronDownSharp } from "solid-icons/io";
import { For, type Component } from "solid-js";
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
import type { Issue } from "~/server/types";
import {
  createSheetEntryArgs,
  useTimeSheetContext,
} from "../../TimeSheetTable.utils";

type Props = {
  issues: Issue[];
  date: Date;
};

export const CreateEntryMenu: Component<Props> = (props) => {
  const [t] = useI18n();

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
      <DropdownMenuTrigger shape="circle" size="xs" variant="outline">
        <span>{t("dashboard.create")}</span>
        <DropdownMenuIcon>
          <IoChevronDownSharp />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent class="max-h-96 overflow-y-scroll">
          <For each={props.issues}>
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

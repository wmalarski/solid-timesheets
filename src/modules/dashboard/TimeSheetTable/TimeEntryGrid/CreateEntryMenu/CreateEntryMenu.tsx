import { useI18n } from "@solid-primitives/i18n";
import type { Component } from "solid-js";
import {
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "~/components/DropdownMenu";
import { ChevronDownIcon } from "~/components/Icons/ChevronDownIcon";
import type { Issue } from "~/server/types";
import { useTimeSheetContext } from "../../TimeSheetTable.utils";

type Props = {
  issues: Issue[];
};

export const CreateEntryMenu: Component<Props> = () => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onCreateClick = () => {
    // createSheetEntryArgs({
    //   args: {
    //     comments: "",
    //     hours: 0,
    //     issueId: props.issue.id,
    //     spentOn: props.date,
    //   },
    //   setState,
    // });
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger size="xs" variant="outline">
        <span>{t("dashboard.create")}</span>
        <DropdownMenuIcon>
          <ChevronDownIcon />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuItem>Commit</DropdownMenuItem>
          <DropdownMenuItem>Push</DropdownMenuItem>
          <DropdownMenuItem disabled>Update Project</DropdownMenuItem>
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

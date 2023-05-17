import { useI18n } from "@solid-primitives/i18n";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { type Component } from "solid-js";
import {
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "~/components/DropdownMenu";
import { ChevronDownIcon } from "~/components/Icons/ChevronDownIcon";
import {
  deleteTimeEntryServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import type { Issue } from "~/server/types";
import {
  copyCreatedToEndOfMonth,
  copyCreatedToNextDay,
  copyUpdatedToEndOfMonth,
  copyUpdatedToNextDay,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";

type DeleteItemProps = {
  isDisabled: boolean;
  onClick: () => void;
};

const DeleteItem: Component<DeleteItemProps> = (props) => {
  const [t] = useI18n();

  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        ❌ {t("dashboard.timeEntry.delete")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type DeleteCreatedItemProps = {
  id: number;
  isDisabled: boolean;
  key: string;
};

const DeleteCreatedItem: Component<DeleteCreatedItemProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onClick = () => {
    setState("dateMap", props.key, props.id, undefined);
  };

  return <DeleteItem isDisabled={props.isDisabled} onClick={onClick} />;
};

type DeleteUpdatedItemProps = {
  id: number;
  isDisabled: boolean;
};

const DeleteUpdatedItem: Component<DeleteUpdatedItemProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: deleteTimeEntryServerMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setState("updateMap", props.id, undefined);
    },
  }));

  const onClick = () => {
    mutation.mutate({ id: props.id });
  };

  return <DeleteItem isDisabled={props.isDisabled} onClick={onClick} />;
};

type CopyMonthItemProps = {
  isDisabled: boolean;
  onClick: () => void;
};

const CopyMonthItem: Component<CopyMonthItemProps> = (props) => {
  const [t] = useI18n();

  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        ⏭️ {t("dashboard.timeEntry.copyMonthEnd")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type CopyCreatedMonthItemProps = {
  id: number;
  isDisabled: boolean;
  key: string;
};

const CopyCreatedMonthItem: Component<CopyCreatedMonthItemProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onClick = () => {
    copyCreatedToEndOfMonth({ id: props.id, key: props.key, setState });
  };

  return <CopyMonthItem isDisabled={props.isDisabled} onClick={onClick} />;
};

type CopyUpdatedMonthItemProps = {
  id: number;
  isDisabled: boolean;
};

const CopyUpdatedMonthItem: Component<CopyUpdatedMonthItemProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onClick = () => {
    copyUpdatedToEndOfMonth({ id: props.id, setState });
  };

  return <CopyMonthItem isDisabled={props.isDisabled} onClick={onClick} />;
};

type CopyNextDayItemProps = {
  isDisabled: boolean;
  onClick: () => void;
};

const CopyNextDayItem: Component<CopyNextDayItemProps> = (props) => {
  const [t] = useI18n();

  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        1️⃣ {t("dashboard.timeEntry.copyNextDay")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type CopyCreatedNextDayItemProps = {
  id: number;
  isDisabled: boolean;
  key: string;
};

const CopyCreatedNextDayItem: Component<CopyCreatedNextDayItemProps> = (
  props
) => {
  const { setState } = useTimeSheetContext();

  const onClick = () => {
    copyCreatedToNextDay({ id: props.id, key: props.key, setState });
  };

  return <CopyNextDayItem isDisabled={props.isDisabled} onClick={onClick} />;
};

type CopyUpdatedNextDayItemProps = {
  id: number;
  isDisabled: boolean;
  key: string;
};

const CopyUpdatedNextDayItem: Component<CopyUpdatedNextDayItemProps> = (
  props
) => {
  const { setState } = useTimeSheetContext();

  const onClick = () => {
    copyUpdatedToNextDay({ id: props.id, setState });
  };

  return <CopyNextDayItem isDisabled={props.isDisabled} onClick={onClick} />;
};

type Props = {
  issues: Issue[];
  date: Date;
};

export const CardMenu: Component<Props> = (props) => {
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
      <DropdownMenuTrigger size="xs" variant="outline">
        <span>{t("dashboard.create")}</span>
        <DropdownMenuIcon>
          <ChevronDownIcon />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent class="max-h-96 overflow-y-scroll">
          <DeleteCreatedItem />
          <CopyCreatedMonthItem />
          <CopyCreatedNextDayItem />
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
type Props = {
  issues: Issue[];
  date: Date;
};

export const CardMenu: Component<Props> = (props) => {
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
      <DropdownMenuTrigger size="xs" variant="outline">
        <span>{t("dashboard.create")}</span>
        <DropdownMenuIcon>
          <ChevronDownIcon />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent class="max-h-96 overflow-y-scroll">
          <DeleteUpdatedItem />
          <CopyUpdatedMonthItem />
          <CopyUpdatedNextDayItem />
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

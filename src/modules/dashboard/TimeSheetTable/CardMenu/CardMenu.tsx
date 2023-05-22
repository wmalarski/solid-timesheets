import { useI18n } from "@solid-primitives/i18n";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import {
  IoDuplicateSharp,
  IoEllipsisHorizontalSharp,
  IoTrashSharp,
} from "solid-icons/io";
import { type Component } from "solid-js";
import {
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/DropdownMenu";
import { showToast } from "~/components/Toast";
import {
  deleteTimeEntryServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import {
  copyCreatedToCurrentDay,
  copyCreatedToEndOfMonth,
  copyCreatedToEndOfWeek,
  copyCreatedToNextDay,
  copyUpdatedToCurrentDay,
  copyUpdatedToEndOfMonth,
  copyUpdatedToEndOfWeek,
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
        <IoTrashSharp />
        {t("dashboard.timeEntry.delete")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type DeleteUpdatedItemProps = {
  id: number;
  isDisabled: boolean;
};

const DeleteUpdatedItem: Component<DeleteUpdatedItemProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: deleteTimeEntryServerMutation,
    onError: () => {
      showToast({
        description: t("dashboard.toasts.wrong"),
        title: t("dashboard.toasts.error"),
        variant: "error",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setState("updateMap", props.id, undefined);
      showToast({
        description: t("dashboard.toasts.remove"),
        title: t("dashboard.toasts.success"),
        variant: "success",
      });
    },
  }));

  const onClick = () => {
    mutation.mutate({ id: props.id });
  };

  return <DeleteItem isDisabled={props.isDisabled} onClick={onClick} />;
};

type CopyWeekItemProps = {
  isDisabled: boolean;
  onClick: () => void;
};

const CopyWeekItem: Component<CopyWeekItemProps> = (props) => {
  const [t] = useI18n();

  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        <IoDuplicateSharp />
        {t("dashboard.timeEntry.copyWeekEnd")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
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
        <IoDuplicateSharp />
        {t("dashboard.timeEntry.copyMonthEnd")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
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
        <IoDuplicateSharp />
        {t("dashboard.timeEntry.copyNextDay")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type CopyCurrentDayItemProps = {
  isDisabled: boolean;
  onClick: () => void;
};

const CopyCurrentDayItem: Component<CopyCurrentDayItemProps> = (props) => {
  const [t] = useI18n();

  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        <IoDuplicateSharp />
        {t("dashboard.timeEntry.copyCurrentDay")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type CreatedCardMenuProps = {
  id: number;
  isDisabled: boolean;
  key: string;
};

export const CreatedCardMenu: Component<CreatedCardMenuProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onDeleteClick = () => {
    setState("dateMap", props.key, props.id, undefined);
  };

  const onCopyCurrentDayClick = () => {
    copyCreatedToCurrentDay({ id: props.id, key: props.key, setState });
  };

  const onCopyNextDayClick = () => {
    copyCreatedToNextDay({ id: props.id, key: props.key, setState });
  };

  const onCopyWeekClick = () => {
    copyCreatedToEndOfWeek({ id: props.id, key: props.key, setState });
  };

  const onCopyMonthClick = () => {
    copyCreatedToEndOfMonth({ id: props.id, key: props.key, setState });
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger
        aria-label={t("dashboard.timeEntry.more")}
        shape="square"
        size="sm"
        variant="ghost"
      >
        <DropdownMenuIcon rotation={90}>
          <IoEllipsisHorizontalSharp />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <CopyCurrentDayItem
            isDisabled={props.isDisabled}
            onClick={onCopyCurrentDayClick}
          />
          <CopyNextDayItem
            isDisabled={props.isDisabled}
            onClick={onCopyNextDayClick}
          />
          <CopyWeekItem
            isDisabled={props.isDisabled}
            onClick={onCopyWeekClick}
          />
          <CopyMonthItem
            isDisabled={props.isDisabled}
            onClick={onCopyMonthClick}
          />
          <DropdownMenuSeparator />
          <DeleteItem isDisabled={props.isDisabled} onClick={onDeleteClick} />
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
type Props = {
  id: number;
  isDisabled: boolean;
};

export const UpdatedCardMenu: Component<Props> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onCopyCurrentDayClick = () => {
    copyUpdatedToCurrentDay({ id: props.id, setState });
  };

  const onCopyWeekClick = () => {
    copyUpdatedToEndOfWeek({ id: props.id, setState });
  };

  const onCopyMonthClick = () => {
    copyUpdatedToEndOfMonth({ id: props.id, setState });
  };

  const onCopyNextDayClick = () => {
    copyUpdatedToNextDay({ id: props.id, setState });
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger
        aria-label={t("dashboard.timeEntry.more")}
        shape="square"
        size="sm"
        variant="ghost"
      >
        <DropdownMenuIcon rotation={90}>
          <IoEllipsisHorizontalSharp />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <CopyCurrentDayItem
            isDisabled={props.isDisabled}
            onClick={onCopyCurrentDayClick}
          />
          <CopyNextDayItem
            isDisabled={props.isDisabled}
            onClick={onCopyNextDayClick}
          />
          <CopyWeekItem
            isDisabled={props.isDisabled}
            onClick={onCopyWeekClick}
          />
          <CopyMonthItem
            isDisabled={props.isDisabled}
            onClick={onCopyMonthClick}
          />
          <DropdownMenuSeparator />
          <DeleteUpdatedItem id={props.id} isDisabled={props.isDisabled} />
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

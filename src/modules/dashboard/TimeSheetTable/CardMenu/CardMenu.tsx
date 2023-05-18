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
import { showToast } from "~/components/Toast";
import {
  deleteTimeEntryServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import {
  copyCreatedToCurrentDay,
  copyCreatedToEndOfMonth,
  copyCreatedToNextDay,
  copyUpdatedToCurrentDay,
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

type CopyCurrentDayItemProps = {
  isDisabled: boolean;
  onClick: () => void;
};

const CopyCurrentDayItem: Component<CopyCurrentDayItemProps> = (props) => {
  const [t] = useI18n();

  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        1️⃣ {t("dashboard.timeEntry.copyCurrentDay")}
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

  const onCopyMonthClick = () => {
    copyCreatedToEndOfMonth({ id: props.id, key: props.key, setState });
  };

  const onCopyNextDayClick = () => {
    copyCreatedToNextDay({ id: props.id, key: props.key, setState });
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger
        aria-label={t("dashboard.timeEntry.more")}
        size="xs"
        variant="outline"
      >
        <DropdownMenuIcon>
          <ChevronDownIcon />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DeleteItem isDisabled={props.isDisabled} onClick={onDeleteClick} />
          <CopyCurrentDayItem
            isDisabled={props.isDisabled}
            onClick={onCopyCurrentDayClick}
          />
          <CopyNextDayItem
            isDisabled={props.isDisabled}
            onClick={onCopyNextDayClick}
          />
          <CopyMonthItem
            isDisabled={props.isDisabled}
            onClick={onCopyMonthClick}
          />
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
        size="xs"
        variant="outline"
      >
        <DropdownMenuIcon>
          <ChevronDownIcon />
        </DropdownMenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DeleteUpdatedItem id={props.id} isDisabled={props.isDisabled} />
          <CopyCurrentDayItem
            isDisabled={props.isDisabled}
            onClick={onCopyCurrentDayClick}
          />
          <CopyMonthItem
            isDisabled={props.isDisabled}
            onClick={onCopyMonthClick}
          />
          <CopyNextDayItem
            isDisabled={props.isDisabled}
            onClick={onCopyNextDayClick}
          />
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

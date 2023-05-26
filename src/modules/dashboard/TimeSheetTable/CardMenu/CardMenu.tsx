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
  type CreateTimeEntryArgs,
} from "~/server/timeEntries";
import {
  copyToCurrentDay,
  copyToEndOfMonth,
  copyToEndOfWeek,
  copyToNextDay,
  copyToNextWorkingDay,
  useTimeSheetContext,
} from "../EntriesStore";

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

type CopyItemProps = {
  isDisabled: boolean;
  label: string;
  onClick: () => void;
};

const CopyItem: Component<CopyItemProps> = (props) => {
  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        <IoDuplicateSharp />
        {props.label}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type CopyItemsProps = {
  args?: CreateTimeEntryArgs;
  isDisabled: boolean;
};

export const CopyItems: Component<CopyItemsProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  return (
    <>
      <CopyItem
        isDisabled={props.isDisabled}
        label={t("dashboard.timeEntry.copyCurrentDay")}
        onClick={() => copyToCurrentDay({ args: props.args, setState })}
      />
      <CopyItem
        isDisabled={props.isDisabled}
        onClick={() => copyToNextDay({ args: props.args, setState })}
        label={t("dashboard.timeEntry.copyNextDay")}
      />
      <CopyItem
        isDisabled={props.isDisabled}
        label={t("dashboard.timeEntry.copyNextWorkingDay")}
        onClick={() => copyToNextWorkingDay({ args: props.args, setState })}
      />
      <CopyItem
        isDisabled={props.isDisabled}
        label={t("dashboard.timeEntry.copyWeekEnd")}
        onClick={() => copyToEndOfWeek({ args: props.args, setState })}
      />
      <CopyItem
        isDisabled={props.isDisabled}
        label={t("dashboard.timeEntry.copyMonthEnd")}
        onClick={() => copyToEndOfMonth({ args: props.args, setState })}
      />
    </>
  );
};

type CreatedCardMenuProps = {
  id: number;
  isDisabled: boolean;
  key: string;
};

export const CreatedCardMenu: Component<CreatedCardMenuProps> = (props) => {
  const [t] = useI18n();

  const { state, setState } = useTimeSheetContext();

  const args = () => {
    return state.dateMap[props.key]?.[props.id]?.args;
  };

  const onDeleteClick = () => {
    setState("dateMap", props.key, props.id, undefined);
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
          <CopyItems isDisabled={props.isDisabled} args={args()} />
          <DropdownMenuSeparator />
          <DeleteItem isDisabled={props.isDisabled} onClick={onDeleteClick} />
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
type UpdatedCardMenuProps = {
  id: number;
  isDisabled: boolean;
};

export const UpdatedCardMenu: Component<UpdatedCardMenuProps> = (props) => {
  const [t] = useI18n();

  const { state } = useTimeSheetContext();

  const args = () => {
    return state.timeEntryMap.get(props.id);
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
          <CopyItems isDisabled={props.isDisabled} args={args()} />
          <DropdownMenuSeparator />
          <DeleteUpdatedItem id={props.id} isDisabled={props.isDisabled} />
          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

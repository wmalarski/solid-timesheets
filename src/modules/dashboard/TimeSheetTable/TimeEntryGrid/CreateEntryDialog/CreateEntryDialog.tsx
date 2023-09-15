import { createWritableMemo } from "@solid-primitives/memo";
import { IoAddSharp, IoCloseSharp } from "solid-icons/io";
import { createSignal, type Component, type JSX } from "solid-js";
import { Button } from "~/components/Button";
import {
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "~/components/Dialog";
import { useI18n } from "~/contexts/I18nContext";
import type { Issue } from "~/server/types";
import { createSheetEntryArgs, useTimeSheetContext } from "../../EntriesStore";
import { TimeEntryFields } from "../../TimeEntryFields";

type CreateEntryFormProps = {
  date: Date;
  initialIssueId: number;
  onCancelClick: VoidFunction;
};

const CreateEntryForm: Component<CreateEntryFormProps> = (props) => {
  const { t } = useI18n();

  const { setState } = useTimeSheetContext();

  const [comments, setComments] = createSignal("");
  const [hours, setHours] = createSignal(0);

  const [issueId] = createWritableMemo(() => props.initialIssueId);

  const onSubmit: JSX.IntrinsicElements["form"]["onSubmit"] = (event) => {
    event.preventDefault();

    createSheetEntryArgs({
      args: {
        comments: comments(),
        hours: hours(),
        issueId: issueId(),
        spentOn: props.date,
      },
      setState,
    });
  };

  return (
    <form class="flex flex-col gap-4" onSubmit={onSubmit}>
      <TimeEntryFields
        comments={comments()}
        hours={hours()}
        onCommentsChange={setComments}
        onHoursChange={setHours}
      />
      <div class="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onCancelClick}
          type="button"
        >
          {t("dashboard.createDialog.cancel")}
        </Button>
        <Button type="submit" variant="outline" size="sm">
          {t("dashboard.createDialog.submit")}
        </Button>
      </div>
    </form>
  );
};

type CreateEntryDialogProps = {
  date: Date;
  issues: Issue[];
};

export const CreateEntryDialog: Component<CreateEntryDialogProps> = (props) => {
  const { t } = useI18n();

  const [isOpen, setIsOpen] = createSignal(false);

  const onCancelClick = () => {
    setIsOpen(false);
  };

  return (
    <DialogRoot open={isOpen()} onOpenChange={setIsOpen}>
      <DialogTrigger
        aria-label={t("dashboard.createDialog.title")}
        shape="square"
        size="sm"
        variant="ghost"
      >
        <IoAddSharp />
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dashboard.createDialog.title")}</DialogTitle>
              <DialogCloseButton size="sm" variant="ghost" shape="square">
                <IoCloseSharp />
              </DialogCloseButton>
            </DialogHeader>
            <CreateEntryForm
              date={props.date}
              initialIssueId={props.issues[0].id}
              onCancelClick={onCancelClick}
            />
          </DialogContent>
        </DialogPositioner>
      </DialogPortal>
    </DialogRoot>
  );
};

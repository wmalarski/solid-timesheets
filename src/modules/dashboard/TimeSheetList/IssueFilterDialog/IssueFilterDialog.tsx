import { IoPencilSharp } from "solid-icons/io";
import { Show, createSignal, type Component } from "solid-js";
import { DialogRoot, DialogTrigger } from "~/components/Dialog";
import { useI18n } from "~/contexts/I18nContext";
import { IssueSearchDialog } from "../../IssueSearchDialog";
import { IssueDetails } from "../../TimeSheetTable/IssueDetails";

type IssueFilterDialogProps = {
  issueId?: number;
  onIssueChange: (issueId: number) => void;
};

export const IssueFilterDialog: Component<IssueFilterDialogProps> = (props) => {
  const { t } = useI18n();

  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <DialogRoot open={isOpen()} onOpenChange={setIsOpen}>
      <div class="flex justify-between gap-1">
        <Show when={props.issueId}>
          {(issueId) => <IssueDetails issueId={issueId()} />}
        </Show>
        <DialogTrigger
          aria-label={t("dashboard.timeEntry.issue.title")}
          shape="square"
          size="sm"
        >
          <IoPencilSharp />
        </DialogTrigger>
      </div>
      <IssueSearchDialog
        issueId={props.issueId}
        onIsOpenChange={setIsOpen}
        onIssueChange={props.onIssueChange}
        title={t("dashboard.timeEntry.issue.title")}
      />
    </DialogRoot>
  );
};

import { createQuery, useQueryClient } from "@tanstack/solid-query";
import {
  IoAddSharp,
  IoCaretDown,
  IoCheckmark,
  IoCloseSharp,
} from "solid-icons/io";
import { Suspense, createMemo, createSignal, type Component } from "solid-js";
import { Button } from "~/components/Button";
import {
  ComboboxContent,
  ComboboxControl,
  ComboboxIcon,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemLabel,
  ComboboxListbox,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
} from "~/components/Combobox";
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
import {
  getIssueKey,
  getIssueServerQuery,
  getIssuesKey,
  getIssuesServerQuery,
} from "~/server/issues";
import { getSearchKey, getSearchServerQuery } from "~/server/search";

type Option = {
  id: number;
  title: string;
  project?: string;
};

type ViewProps = {
  onOptionChange: (option: Option) => void;
  onQueryChange: (query: string) => void;
  options: Option[];
  value: Option;
};

const View: Component<ViewProps> = (props) => {
  return (
    <ComboboxRoot
      options={props.options}
      value={props.value}
      onChange={props.onOptionChange}
      optionValue="id"
      optionTextValue="title"
      optionLabel="title"
      placeholder="Search a fruit…"
      required
      onInputChange={props.onQueryChange}
      itemComponent={(props) => (
        <ComboboxItem item={props.item} class="h-12">
          <ComboboxItemLabel class="flex flex-col items-start">
            <span class="text-ellipsis text-xs font-semibold uppercase">
              {props.item.rawValue.project}
            </span>
            <span class="text-ellipsis text-sm">
              {props.item.rawValue.title}
            </span>
          </ComboboxItemLabel>
          <ComboboxItemIndicator>
            <IoCheckmark />
          </ComboboxItemIndicator>
        </ComboboxItem>
      )}
    >
      <ComboboxControl aria-label="Fruit">
        <ComboboxInput />
        <ComboboxTrigger>
          <ComboboxIcon>
            <IoCaretDown />
          </ComboboxIcon>
        </ComboboxTrigger>
      </ComboboxControl>
      <ComboboxPortal>
        <ComboboxContent>
          <ComboboxListbox />
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  );
};

type IssueSelectorProps = {
  issueId: number;
  onCancelClick: VoidFunction;
  onIssueChange: (issueId: number) => void;
};

const IssueSelector: Component<IssueSelectorProps> = (props) => {
  const { t } = useI18n();

  const [query, setQuery] = createSignal("");

  const issuesQuery = createQuery(() => ({
    enabled: query().length < 1,
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
    select: (data) =>
      data.issues.map((issue) => ({
        id: issue.id,
        project: issue.project.name,
        title: issue.subject,
      })),
  }));

  const searchQuery = createQuery(() => ({
    enabled: query().length > 0,
    queryFn: (context) => getSearchServerQuery(context.queryKey),
    queryKey: getSearchKey({ limit: 5, query: query() }),
    select: (data) =>
      data.results.map((result) => ({
        id: result.id,
        title: result.title,
      })),
  }));

  const queryClient = useQueryClient();

  const issueQuery = createQuery(() => ({
    queryFn: (context) => getIssueServerQuery(context.queryKey),
    queryKey: getIssueKey({ id: props.issueId }),
    select: (data) => ({ id: data.issue.id, title: data.issue.subject }),
  }));

  const options = createMemo(() => {
    const issues = issuesQuery.data || [];
    const searchResults = searchQuery.data || [];
    return [...issues, ...searchResults];
  });

  const onOptionChange = async (option: Option) => {
    await queryClient.prefetchQuery({
      queryFn: (context) => getIssueServerQuery(context.queryKey),
      queryKey: getIssueKey({ id: option.id }),
    });
    props.onIssueChange(option.id);
  };

  const onQueryChange = (query: string) => {
    setQuery(query);
  };

  return (
    <form class="flex flex-col gap-4" onSubmit={onSubmit}>
      <Suspense>
        <IssueCombobox issues={props.issues} />
      </Suspense>
      <View
        comments={comments()}
        hours={hours()}
        issueId={props.issues[0].id}
        onCommentsChange={setComments}
        onHoursChange={setHours}
        onIssueChange={() => void 0}
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

type IssuesProps = {
  issueId: number;
  onIssueChange: (issueId: number) => void;
};

export const IssuesDialog: Component<IssuesProps> = (props) => {
  const { t } = useI18n();

  const [isOpen, setIsOpen] = createSignal(false);

  const onCancelClick = () => {
    setIsOpen(false);
  };

  const onIssueChange = (issueId: number) => {
    props.onIssueChange(issueId);
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
            <IssueSelector
              onCancelClick={onCancelClick}
              issueId={props.issueId}
              onIssueChange={onIssueChange}
            />
          </DialogContent>
        </DialogPositioner>
      </DialogPortal>
    </DialogRoot>
  );
};

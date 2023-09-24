import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { IoCloseSharp, IoPencilSharp } from "solid-icons/io";
import {
  For,
  Show,
  createMemo,
  createSignal,
  type Component,
  type JSX,
} from "solid-js";
import { coerce, number, safeParseAsync } from "valibot";
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
import {
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemDescription,
  RadioGroupItemIndicator,
  RadioGroupItemInput,
  RadioGroupItemLabel,
  RadioGroupLabel,
  RadioGroupRoot,
} from "~/components/RadioGroup";
import { useI18n } from "~/contexts/I18nContext";
import {
  getIssueKey,
  getIssueServerQuery,
  getIssuesKey,
  getIssuesServerQuery,
} from "~/server/issues";
import { getSearchKey, getSearchServerQuery } from "~/server/search";
import { IssueDetails } from "../../IssueDetails";

type Option = {
  id: number;
  title: string;
  project?: string;
};

type RadioGroupProps = {
  defaultIssueId: number;
  onQueryChange: (query: string) => void;
  options: Option[];
  query: string;
};

const RadioGroup: Component<RadioGroupProps> = (props) => {
  const { t } = useI18n();

  return (
    <RadioGroupRoot name="issueId" defaultValue={String(props.defaultIssueId)}>
      <RadioGroupLabel>{t("dashboard.timeEntry.issue.label")}</RadioGroupLabel>
      <div class="flex flex-col gap-2">
        <For each={props.options}>
          {(option) => (
            <RadioGroupItem value={String(option.id)}>
              <RadioGroupItemInput />
              <RadioGroupItemControl>
                <RadioGroupItemIndicator />
              </RadioGroupItemControl>
              <div class="flex flex-col items-start justify-center">
                <Show when={option.project}>
                  <RadioGroupItemDescription>
                    {option.project}
                  </RadioGroupItemDescription>
                </Show>
                <RadioGroupItemLabel>{option.title}</RadioGroupItemLabel>
              </div>
            </RadioGroupItem>
          )}
        </For>
      </div>
    </RadioGroupRoot>
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

  const options = createMemo(() => {
    const issues = issuesQuery.data || [];
    const searchResults = searchQuery.data || [];
    return [...issues, ...searchResults];
  });

  const queryClient = useQueryClient();

  const onSubmit: JSX.IntrinsicElements["form"]["onSubmit"] = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawIssueId = formData.get("issueId");
    const result = await safeParseAsync(coerce(number(), Number), rawIssueId);

    if (!result.success) {
      return;
    }

    await queryClient.prefetchQuery({
      queryFn: (context) => getIssueServerQuery(context.queryKey),
      queryKey: getIssueKey({ id: result.output }),
    });

    props.onIssueChange(result.output);
  };

  const onQueryChange = (query: string) => {
    setQuery(query);
  };

  return (
    <form class="flex flex-col gap-4" onSubmit={onSubmit}>
      <RadioGroup
        defaultIssueId={props.issueId}
        onQueryChange={onQueryChange}
        options={options()}
        query={query()}
      />
      <div class="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onCancelClick}
          type="button"
        >
          {t("dashboard.timeEntry.issue.cancel")}
        </Button>
        <Button type="submit" variant="outline" size="sm">
          {t("dashboard.timeEntry.issue.submit")}
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
      <div class="flex justify-between gap-1">
        <IssueDetails issueId={props.issueId} />
        <DialogTrigger
          aria-label={t("dashboard.timeEntry.issue.title")}
          shape="square"
          size="sm"
        >
          <IoPencilSharp />
        </DialogTrigger>
      </div>
      <DialogPortal>
        <DialogOverlay />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dashboard.timeEntry.issue.title")}</DialogTitle>
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

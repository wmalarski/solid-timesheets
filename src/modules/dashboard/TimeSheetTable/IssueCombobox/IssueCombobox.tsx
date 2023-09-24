import { createQuery } from "@tanstack/solid-query";
import { IoCaretDown, IoCheckmark } from "solid-icons/io";
import { Show, createMemo, createSignal, type Component } from "solid-js";
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

type IssueComboboxProps = {
  issueId: number;
  onIssueChange: (issueId: number) => void;
};

export const IssueCombobox: Component<IssueComboboxProps> = (props) => {
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

  const onOptionChange = (option: Option) => {
    props.onIssueChange(option.id);
  };

  const onQueryChange = (query: string) => {
    setQuery(query);
  };

  return (
    <Show when={issueQuery.data}>
      {(value) => (
        <View
          onOptionChange={onOptionChange}
          onQueryChange={onQueryChange}
          options={options()}
          value={value()}
        />
      )}
    </Show>
  );
};

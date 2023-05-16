import { DropdownMenu as KobalteDropdownMenu } from "@kobalte/core";
import type { Component } from "solid-js";
import { twCva, twCx } from "../utils/twCva";
import styles from "./DropdownMenu.module.css";

export const DropdownMenuRoot = KobalteDropdownMenu.Root;

export const DropdownMenuTrigger: Component<
  KobalteDropdownMenu.DropdownMenuTriggerProps
> = (props) => {
  /*
.dropdown-menu__trigger {
  appearance: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: auto;
  outline: none;
  border-radius: 6px;
  padding: 0 16px;
  background-color: hsl(200 98% 39%);
  color: white;
  font-size: 16px;
  gap: 8px;
  line-height: 0;
  transition: 250ms background-color;
}
.dropdown-menu__trigger:hover {
  background-color: hsl(201 96% 32%);
}
.dropdown-menu__trigger:focus-visible {
  outline: 2px solid hsl(200 98% 39%);
  outline-offset: 2px;
}
.dropdown-menu__trigger:active {
  background-color: hsl(201 90% 27%);
}
  */
  return (
    <KobalteDropdownMenu.Trigger {...props} class={twCx("btn", props.class)} />
  );
};

export const DropdownMenuIcon: Component<
  KobalteDropdownMenu.DropdownMenuIconProps
> = (props) => {
  return (
    <KobalteDropdownMenu.Icon
      {...props}
      class={twCx(
        "h-5 w-5 flex-[0_0_20px] rotate-0",
        "ui-expanded:rotate-180",
        props.class
      )}
    />
  );
};

export const DropdownMenuPortal = KobalteDropdownMenu.Portal;

export const dropdownMenuContentClass = twCva([
  "min-w-[220px] p-2 bg-white rounded-md border-[1px] border-base-300 outline-none",
  styles.content,
]);

export const DropdownMenuContent: Component<
  KobalteDropdownMenu.DropdownMenuContentProps
> = (props) => {
  return (
    <KobalteDropdownMenu.Content
      {...props}
      class={dropdownMenuContentClass({ class: props.class })}
    />
  );
};

export const DropdownMenuArrow: Component<
  KobalteDropdownMenu.DropdownMenuArrowProps
> = (props) => {
  return <KobalteDropdownMenu.Arrow {...props} class={twCx("", props.class)} />;
};

export const DropdownMenuSeparator: Component<
  KobalteDropdownMenu.DropdownMenuSeparatorProps
> = (props) => {
  return (
    <KobalteDropdownMenu.Separator
      {...props}
      class={twCx("h-px m-1.5 border-[1px] border-base-300", props.class)}
    />
  );
};

export const DropdownMenuGroup: Component<
  KobalteDropdownMenu.DropdownMenuGroupProps
> = (props) => {
  return <KobalteDropdownMenu.Group {...props} class={twCx("", props.class)} />;
};

export const DropdownMenuGroupLabel: Component<
  KobalteDropdownMenu.DropdownMenuGroupLabelProps
> = (props) => {
  return (
    <KobalteDropdownMenu.GroupLabel
      {...props}
      class={twCx("px-6 text-sm leading-[32px] text-base-200", props.class)}
    />
  );
};

export const DropdownMenuSub = KobalteDropdownMenu.Sub;

export const dropdownMenuItemClass = twCva([
  "relative flex h-8 select-none items-center rounded pl-2 pr-6 text-base leading-none outline-none",
  "ui-disabled:opacity-50 ui-disabled:pointer-events-none",
  "ui-highlighted:outline-none ui-highlighted:bg-accent ui-highlighted:text-white",
]);

export const dropdownMenuSubTriggerClass = twCva([
  dropdownMenuItemClass,
  "ui-expanded:bg-white ui-expanded:text-accent-content",
]);

export const DropdownMenuSubTrigger: Component<
  KobalteDropdownMenu.DropdownMenuSubTriggerProps
> = (props) => {
  return (
    <KobalteDropdownMenu.SubTrigger
      {...props}
      class={dropdownMenuSubTriggerClass({ class: props.class })}
    />
  );
};

export const DropdownMenuSubContent: Component<
  KobalteDropdownMenu.DropdownMenuSubContentProps
> = (props) => {
  return (
    <KobalteDropdownMenu.SubContent
      {...props}
      class={dropdownMenuContentClass({ class: props.class })}
    />
  );
};

export const DropdownMenuItem: Component<
  KobalteDropdownMenu.DropdownMenuItemProps
> = (props) => {
  return (
    <KobalteDropdownMenu.Item
      {...props}
      class={dropdownMenuItemClass({ class: props.class })}
    />
  );
};

export const DropdownMenuItemLabel: Component<
  KobalteDropdownMenu.DropdownMenuItemLabelProps
> = (props) => {
  return (
    <KobalteDropdownMenu.ItemLabel {...props} class={twCx("", props.class)} />
  );
};

export const DropdownMenuItemDescription: Component<
  KobalteDropdownMenu.DropdownMenuItemDescriptionProps
> = (props) => {
  return (
    <KobalteDropdownMenu.ItemDescription
      {...props}
      class={twCx("", props.class)}
    />
  );
};

export const DropdownMenuItemIndicator: Component<
  KobalteDropdownMenu.DropdownMenuItemIndicatorProps
> = (props) => {
  return (
    <KobalteDropdownMenu.ItemIndicator
      {...props}
      class={twCx(
        "absolute left-0 h-5 w-5 inline-flex items-center justify-center",
        props.class
      )}
    />
  );
};

export const DropdownMenuRadioGroup = KobalteDropdownMenu.RadioGroup;

export const DropdownMenuRadioItem: Component<
  KobalteDropdownMenu.DropdownMenuRadioItemProps
> = (props) => {
  return (
    <KobalteDropdownMenu.RadioItem
      {...props}
      class={dropdownMenuItemClass({ class: props.class })}
    />
  );
};

export const DropdownMenuCheckboxItem: Component<
  KobalteDropdownMenu.DropdownMenuCheckboxItemProps
> = (props) => {
  return (
    <KobalteDropdownMenu.CheckboxItem
      {...props}
      class={dropdownMenuItemClass({ class: props.class })}
    />
  );
};

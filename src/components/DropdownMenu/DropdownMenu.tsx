import { DropdownMenu as KobalteDropdownMenu } from "@kobalte/core";
import type { Component } from "solid-js";
import { twCx } from "../utils/twCva";

/*

@keyframes contentShow {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes contentHide {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}

*/

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
    <KobalteDropdownMenu.Trigger {...props} class={twCx("", props.class)} />
  );
};

export const DropdownMenuIcon: Component<
  KobalteDropdownMenu.DropdownMenuIconProps
> = (props) => {
  /*
.dropdown-menu__trigger-icon {
  height: 20px;
  width: 20px;
  flex: 0 0 20px;
  transition: transform 250ms;
}
.dropdown-menu__trigger-icon[data-expanded] {
  transform: rotate(180deg);
}
  */
  return <KobalteDropdownMenu.Icon {...props} class={twCx("", props.class)} />;
};

export const DropdownMenuPortal = KobalteDropdownMenu.Portal;

export const DropdownMenuContent: Component<
  KobalteDropdownMenu.DropdownMenuContentProps
> = (props) => {
  /*
.dropdown-menu__content,
.dropdown-menu__sub-content {
  min-width: 220px;
  padding: 8px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid hsl(240 6% 90%);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  outline: none;
  transform-origin: var(--kb-menu-content-transform-origin);
  animation: contentHide 250ms ease-in forwards;
}
.dropdown-menu__content[data-expanded],
.dropdown-menu__sub-content[data-expanded] {
  animation: contentShow 250ms ease-out;
}
  */
  return (
    <KobalteDropdownMenu.Content {...props} class={twCx("", props.class)} />
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
  /*
.dropdown-menu__separator {
  height: 1px;
  border-top: 1px solid hsl(240 6% 90%);
  margin: 6px;
}
  */
  return (
    <KobalteDropdownMenu.Separator {...props} class={twCx("", props.class)} />
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
  /*
.dropdown-menu__group-label {
  padding: 0 24px;
  font-size: 14px;
  line-height: 32px;
  color: hsl(240 4% 46%);
}
  */
  return (
    <KobalteDropdownMenu.GroupLabel {...props} class={twCx("", props.class)} />
  );
};

export const DropdownMenuSub = KobalteDropdownMenu.Sub;

export const DropdownMenuSubTrigger: Component<
  KobalteDropdownMenu.DropdownMenuSubTriggerProps
> = (props) => {
  /*
.dropdown-menu__item,
.dropdown-menu__checkbox-item,
.dropdown-menu__radio-item,
.dropdown-menu__sub-trigger {
  font-size: 16px;
  line-height: 1;
  color: hsl(240 4% 16%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px 0 24px;
  position: relative;
  user-select: none;
  outline: none;
}
.dropdown-menu__sub-trigger[data-expanded] {
  background-color: hsl(204 94% 94%);
  color: hsl(201 96% 32%);
}
.dropdown-menu__item[data-disabled],
.dropdown-menu__checkbox-item[data-disabled],
.dropdown-menu__radio-item[data-disabled],
.dropdown-menu__sub-trigger[data-disabled] {
  color: hsl(240 5% 65%);
  opacity: 0.5;
  pointer-events: none;
}
.dropdown-menu__item[data-highlighted],
.dropdown-menu__checkbox-item[data-highlighted],
.dropdown-menu__radio-item[data-highlighted],
.dropdown-menu__sub-trigger[data-highlighted] {
  outline: none;
  background-color: hsl(200 98% 39%);
  color: white;
}
  */
  return (
    <KobalteDropdownMenu.SubTrigger {...props} class={twCx("", props.class)} />
  );
};

export const DropdownMenuSubContent: Component<
  KobalteDropdownMenu.DropdownMenuSubContentProps
> = (props) => {
  /*
.dropdown-menu__content,
.dropdown-menu__sub-content {
  min-width: 220px;
  padding: 8px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid hsl(240 6% 90%);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  outline: none;
  transform-origin: var(--kb-menu-content-transform-origin);
  animation: contentHide 250ms ease-in forwards;
}
.dropdown-menu__content[data-expanded],
.dropdown-menu__sub-content[data-expanded] {
  animation: contentShow 250ms ease-out;
}
  */
  return (
    <KobalteDropdownMenu.SubContent {...props} class={twCx("", props.class)} />
  );
};

export const DropdownMenuItem: Component<
  KobalteDropdownMenu.DropdownMenuItemProps
> = (props) => {
  /*
.dropdown-menu__item,
.dropdown-menu__checkbox-item,
.dropdown-menu__radio-item,
.dropdown-menu__sub-trigger {
  font-size: 16px;
  line-height: 1;
  color: hsl(240 4% 16%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px 0 24px;
  position: relative;
  user-select: none;
  outline: none;
}
.dropdown-menu__item[data-disabled],
.dropdown-menu__checkbox-item[data-disabled],
.dropdown-menu__radio-item[data-disabled],
.dropdown-menu__sub-trigger[data-disabled] {
  color: hsl(240 5% 65%);
  opacity: 0.5;
  pointer-events: none;
}
.dropdown-menu__item[data-highlighted],
.dropdown-menu__checkbox-item[data-highlighted],
.dropdown-menu__radio-item[data-highlighted],
.dropdown-menu__sub-trigger[data-highlighted] {
  outline: none;
  background-color: hsl(200 98% 39%);
  color: white;
}
  */
  return <KobalteDropdownMenu.Item {...props} class={twCx("", props.class)} />;
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
  /*
.dropdown-menu__item-indicator {
  position: absolute;
  left: 0;
  height: 20px;
  width: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
  */
  return (
    <KobalteDropdownMenu.ItemIndicator
      {...props}
      class={twCx("", props.class)}
    />
  );
};

export const DropdownMenuRadioGroup: Component<
  KobalteDropdownMenu.DropdownMenuRadioGroupProps
> = (props) => {
  return (
    <KobalteDropdownMenu.RadioGroup {...props} class={twCx("", props.class)} />
  );
};

export const DropdownMenuRadioItem: Component<
  KobalteDropdownMenu.DropdownMenuRadioItemProps
> = (props) => {
  /*
.dropdown-menu__item,
.dropdown-menu__checkbox-item,
.dropdown-menu__radio-item,
.dropdown-menu__sub-trigger {
  font-size: 16px;
  line-height: 1;
  color: hsl(240 4% 16%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px 0 24px;
  position: relative;
  user-select: none;
  outline: none;
}
.dropdown-menu__item[data-disabled],
.dropdown-menu__checkbox-item[data-disabled],
.dropdown-menu__radio-item[data-disabled],
.dropdown-menu__sub-trigger[data-disabled] {
  color: hsl(240 5% 65%);
  opacity: 0.5;
  pointer-events: none;
}
.dropdown-menu__item[data-highlighted],
.dropdown-menu__checkbox-item[data-highlighted],
.dropdown-menu__radio-item[data-highlighted],
.dropdown-menu__sub-trigger[data-highlighted] {
  outline: none;
  background-color: hsl(200 98% 39%);
  color: white;
}
*/
  return (
    <KobalteDropdownMenu.RadioItem {...props} class={twCx("", props.class)} />
  );
};

export const DropdownMenuCheckboxItem: Component<
  KobalteDropdownMenu.DropdownMenuCheckboxItemProps
> = (props) => {
  /*
.dropdown-menu__item,
.dropdown-menu__checkbox-item,
.dropdown-menu__radio-item,
.dropdown-menu__sub-trigger {
  font-size: 16px;
  line-height: 1;
  color: hsl(240 4% 16%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px 0 24px;
  position: relative;
  user-select: none;
  outline: none;
}
.dropdown-menu__item[data-disabled],
.dropdown-menu__checkbox-item[data-disabled],
.dropdown-menu__radio-item[data-disabled],
.dropdown-menu__sub-trigger[data-disabled] {
  color: hsl(240 5% 65%);
  opacity: 0.5;
  pointer-events: none;
}
.dropdown-menu__item[data-highlighted],
.dropdown-menu__checkbox-item[data-highlighted],
.dropdown-menu__radio-item[data-highlighted],
.dropdown-menu__sub-trigger[data-highlighted] {
  outline: none;
  background-color: hsl(200 98% 39%);
  color: white;
}
  */
  return (
    <KobalteDropdownMenu.CheckboxItem
      {...props}
      class={twCx("", props.class)}
    />
  );
};

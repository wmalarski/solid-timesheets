import { IoTimerSharp } from "solid-icons/io";
import type { Component } from "solid-js";
import { useI18n } from "~/contexts/I18nContext";
import { paths } from "~/utils/paths";

export const Footer: Component = () => {
  const { t } = useI18n();

  return (
    <div class="p-4">
      <a class="link text-xs" href={paths.repository}>
        {t("footer.madeBy")}
      </a>
    </div>
  );
};

export const Title: Component = () => {
  const { t } = useI18n();

  return (
    <h1 class="max-6-xs my-16 flex items-center text-center text-4xl font-thin uppercase sm:text-6xl">
      <IoTimerSharp />
      {t("home.title")}
    </h1>
  );
};

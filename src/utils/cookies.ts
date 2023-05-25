import { isServer } from "solid-js/web";
import { parseCookie, useServerContext } from "solid-start";

const getExpires = (days?: number) => {
  if (!days && days !== 0) {
    return "";
  }
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  return `; expires=${date.toUTCString()}`;
};

type SetCookieArgs = {
  name: string;
  value: unknown;
  days?: number;
};

export const setCookie = ({ days, name, value }: SetCookieArgs) => {
  const expires = getExpires(days);
  document.cookie = `${name}=${JSON.stringify(value) || ""}${expires}; path=/`;
};

export const getCookies = () => {
  const event = useServerContext();

  const cookies = parseCookie(
    isServer ? event.request.headers.get("cookie") ?? "" : document.cookie
  );

  return cookies;
};

export const eraseCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

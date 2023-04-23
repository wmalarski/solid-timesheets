import { SignOut } from "~/modules/auth/SignOut";

export default function TimeSheet() {
  return (
    <main class="mx-auto p-4 text-center text-gray-700">
      <h1 class="max-6-xs my-16 text-6xl font-thin uppercase text-sky-700">
        TimeSheets
      </h1>
      <SignOut />
    </main>
  );
}

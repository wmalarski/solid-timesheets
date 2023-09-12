import {
  StartServer,
  createHandler,
  renderAsync,
} from "solid-start/entry-server";
import { sessionMiddleware } from "./server/session";

export default createHandler(
  sessionMiddleware,
  renderAsync((event) => <StartServer event={event} />)
);

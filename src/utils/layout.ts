import { literal, union } from "superstruct";

export type Layout = "vertical" | "horizontal" | "default";

export const layoutStruct = union([
  literal("horizontal"),
  literal("vertical"),
  literal("default"),
]);

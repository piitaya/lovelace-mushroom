import { literal, union } from "superstruct";

export const LAYOUTS = ["default", "horizontal", "vertical"] as const;

export type Layout = (typeof LAYOUTS)[number];

export const layoutStruct = union([
  literal("horizontal"),
  literal("vertical"),
  literal("default"),
]);

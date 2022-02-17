import { literal, union } from "superstruct";

export type Layout = "vertical" | "horizontal";

export const layoutStruct = union([literal("horizontal"), literal("vertical")]);

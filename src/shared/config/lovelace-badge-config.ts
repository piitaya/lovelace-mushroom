import { any, object, string } from "superstruct";

export const lovelaceBadgeConfigStruct = object({
  type: string(),
  visibility: any(),
});

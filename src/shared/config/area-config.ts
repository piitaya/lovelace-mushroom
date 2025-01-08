import { Infer, object, optional, string } from "superstruct";

export const areaSharedConfigStruct = object({
  area: optional(string()),
  name: optional(string()),
  icon: optional(string()),
});

export type AreaSharedConfig = Infer<typeof areaSharedConfigStruct>;

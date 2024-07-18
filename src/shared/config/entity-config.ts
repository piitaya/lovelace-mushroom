import { Infer, object, optional, string } from "superstruct";

export const entitySharedConfigStruct = object({
  entity: optional(string()),
  name: optional(string()),
  icon: optional(string()),
});

export type EntitySharedConfig = Infer<typeof entitySharedConfigStruct>;

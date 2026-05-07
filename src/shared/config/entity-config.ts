import {
  array,
  enums,
  Infer,
  literal,
  object,
  optional,
  string,
  union,
} from "superstruct";
import { EntityNameItem } from "../../ha";

const entityNameItemStruct = union([
  object({ type: enums(["entity", "device", "area", "floor"]) }),
  object({ type: literal("text"), text: string() }),
]);

export const entityNameStruct = union([
  string(),
  entityNameItemStruct,
  array(entityNameItemStruct),
]);

export const entitySharedConfigStruct = object({
  entity: optional(string()),
  name: optional(entityNameStruct),
  icon: optional(string()),
});

export type EntitySharedConfig = Omit<
  Infer<typeof entitySharedConfigStruct>,
  "name"
> & {
  name?: string | EntityNameItem | EntityNameItem[];
};

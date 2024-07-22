import { array, assign, object, optional, string, union } from "superstruct";
import { LovelaceBadgeConfig } from "../../ha";
import {
  ActionsSharedConfig,
  actionsSharedConfigStruct,
} from "../../shared/config/actions-config";
import { lovelaceBadgeConfigStruct } from "../../shared/config/lovelace-badge-config";

export type TemplateBadgeConfig = LovelaceBadgeConfig &
  ActionsSharedConfig & {
    entity?: string;
    icon?: string;
    color?: string;
    label?: string;
    content?: string;
    picture?: string;
    entity_id?: string | string[];
  };

export const templateBadgeConfigStruct = assign(
  lovelaceBadgeConfigStruct,
  actionsSharedConfigStruct,
  object({
    entity: optional(string()),
    icon: optional(string()),
    color: optional(string()),
    label: optional(string()),
    content: optional(string()),
    picture: optional(string()),
    entity_id: optional(union([string(), array(string())])),
  })
);

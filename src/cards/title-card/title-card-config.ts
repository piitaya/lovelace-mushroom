import { assign, object, optional, string } from "superstruct";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import { LovelaceCardConfig } from "../../ha";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type TitleCardConfig = LovelaceCardConfig &
    ActionsSharedConfig & {
        title?: string;
        subtitle?: string;
        alignment?: string;
    };

export const titleCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    actionsSharedConfigStruct,
    object({
        title: optional(string()),
        subtitle: optional(string()),
        alignment: optional(string()),
    })
);

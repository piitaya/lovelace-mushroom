import { LovelaceCardConfig } from "custom-card-helpers";
import { array, assign, boolean, object, optional } from "superstruct";
import { actionsSharedConfigStruct, ActionsSharedConfig } from "../../shared/config/actions-config";
import { layoutSharedConfigStruct, LayoutSharedConfig } from "../../shared/config/layout-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type AlarmControlPanelCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    LayoutSharedConfig &
    ActionsSharedConfig & {
        states?: string[];
        show_keypad?: boolean;
        hide_state?: boolean;
    };

export const alarmControlPanelCardCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, layoutSharedConfigStruct, actionsSharedConfigStruct),
    object({
        states: optional(array()),
        show_keypad: optional(boolean()),
        hide_state: optional(boolean()),
    })
);

import { assign, boolean, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { LayoutSharedConfig, layoutSharedConfigStruct } from "../../shared/config/layout-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type UpdateCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    LayoutSharedConfig &
    ActionsSharedConfig & {
        use_entity_picture?: boolean;
        show_buttons_control?: boolean;
        collapsible_controls?: boolean;
    };

export const updateCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, layoutSharedConfigStruct, actionsSharedConfigStruct),
    object({
        use_entity_picture: optional(boolean()),
        show_buttons_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
    })
);

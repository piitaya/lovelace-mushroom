import { array, assign, boolean, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
    AppearanceSharedConfig,
    appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export const VACUUM_COMMANDS = [
    "start_pause",
    "stop",
    "locate",
    "clean_spot",
    "return_home",
] as const;

export type VacuumCommand = typeof VACUUM_COMMANDS[number];

export type VacuumCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        commands?: VacuumCommand[];
        show_battery_charge?: false;
    };

export const vacuumCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        commands: optional(array(string())),
    })
);

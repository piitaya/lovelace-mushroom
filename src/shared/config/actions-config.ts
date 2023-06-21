import { object, optional } from "superstruct";
import { ActionConfig, actionConfigStruct, atLeastHaVersion } from "../../ha";
import { HaFormSchema } from "../../utils/form/ha-form";
import { UiAction } from "../../utils/form/ha-selector";

export const actionsSharedConfigStruct = object({
    tap_action: optional(actionConfigStruct),
    hold_action: optional(actionConfigStruct),
    double_tap_action: optional(actionConfigStruct),
});

export type ActionsSharedConfig = {
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
};

export const computeActionsFormSchema = (
    actions?: UiAction[],
    haVersion?: string
): HaFormSchema[] => {
    let compatibleActions = actions ? [...actions] : undefined;
    if (compatibleActions && haVersion) {
        // Assist action needs at least 2023.7 version
        if (!atLeastHaVersion(haVersion, 2023, 7)) {
            compatibleActions = compatibleActions.filter((a) => a !== "assist");
        }
    }

    return [
        {
            name: "tap_action",
            selector: { "ui-action": { actions: compatibleActions } },
        },
        {
            name: "hold_action",
            selector: { "ui-action": { actions: compatibleActions } },
        },
        {
            name: "double_tap_action",
            selector: { "ui-action": { actions: compatibleActions } },
        },
    ];
};

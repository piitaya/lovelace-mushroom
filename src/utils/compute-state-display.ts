import {
    computeDomain,
    FrontendLocaleData,
    LocalizeFunc,
    computeStateDisplay as customCardHelpersComputeStateDisplay,
} from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import {
    UpdateEntity,
    updateIsInstalling,
    UPDATE_SUPPORT_PROGRESS,
} from "../cards/update-card/utils";
import { supportsFeature } from "./entity";

export const computeStateDisplay = (
    localize: LocalizeFunc,
    stateObj: HassEntity,
    locale: FrontendLocaleData,
    state?: string
) => {
    const domain = computeDomain(stateObj.entity_id);
    if (domain === "update") {
        return computeUpdateStateDisplay(localize, stateObj, state);
    }
    return customCardHelpersComputeStateDisplay(localize, stateObj, locale, state);
};

const computeUpdateStateDisplay = (
    localize: LocalizeFunc,
    stateObj: HassEntity,
    state?: string | undefined
): string => {
    const compareState = state !== undefined ? state : stateObj.state;
    return compareState === "on"
        ? updateIsInstalling(stateObj as UpdateEntity)
            ? supportsFeature(stateObj, UPDATE_SUPPORT_PROGRESS)
                ? localize("ui.card.update.installing_with_progress", {
                      progress: stateObj.attributes.in_progress,
                  })
                : localize("ui.card.update.installing")
            : stateObj.attributes.latest_version
        : stateObj.attributes.skipped_version === stateObj.attributes.latest_version
        ? stateObj.attributes.latest_version ?? localize("state.default.unavailable")
        : localize("ui.card.update.up_to_date");
};

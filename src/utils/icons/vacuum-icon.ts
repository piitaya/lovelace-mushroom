import { STATE_CLEANING } from "../../cards/vacuum-card/const";

export const computeStartStopIcon = (state?: string): string => {
    
    if (state?.toLocaleLowerCase() === STATE_CLEANING) {
        return "mdi:stop";
    }

    return "mdi:play";
};
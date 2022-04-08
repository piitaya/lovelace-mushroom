import { STATE_CLEANING, STATE_ON } from "../../cards/vacuum-card/const";

export const computeStartStopIcon = (state?: string): string => {
    switch (state) {
        case STATE_CLEANING:
        case STATE_ON:
            return "mdi:stop";    
        default:
            return "mdi:play"
    }
};
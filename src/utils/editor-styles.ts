import { css } from "lit";
import { any, object, string } from "superstruct";
import { colorCss } from "./colors";

export const configElementStyle = css`
    :host {
        ${colorCss}
    }
    ha-switch {
        padding: 16px 6px;
    }
    .side-by-side {
        display: flex;
        align-items: flex-end;
    }
    .side-by-side > * {
        flex: 1;
        padding-right: 8px;
    }
    .side-by-side > *:last-child {
        flex: 1;
        padding-right: 0;
    }
    .suffix {
        margin: 0 8px;
    }
`;

export const baseLovelaceCardConfig = object({
    type: string(),
    view_layout: any(),
});

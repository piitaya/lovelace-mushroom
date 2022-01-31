import { css } from "lit";
import { colorCss } from "./colors";

export const cardStyle = css`
    :host {
        ${colorCss}
    }
    ha-card {
        height: 100%;
        box-sizing: border-box;
    }
    .container {
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        display: flex;
        flex-direction: column;
        padding: 12px;
    }
    .container > *:not(:last-child) {
        margin-bottom: 12px;
    }
    .actions {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        overflow-y: auto;
    }
    .actions *:not(:last-child) {
        margin-right: 12px;
    }
    .unavailable {
        --main-color: var(--warning-color);
    }
`;

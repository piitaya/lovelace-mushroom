import { css } from "lit";
import { colorCss } from "./colors";

export const cardStyle = css`
    :host {
        ${colorCss}
        --spacing: var(--mush-spacing, 12px)
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
        padding: var(--spacing);
    }
    .container > *:not(:last-child) {
        margin-bottom: var(--spacing);
    }
    .actions {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        overflow-y: auto;
    }
    .actions *:not(:last-child) {
        margin-right: var(--spacing);
    }
    .unavailable {
        --main-color: var(--warning-color);
    }
`;

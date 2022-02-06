import { css } from "lit";
import { colorCss } from "./colors";

export const cardStyle = css`
    :host {
        ${colorCss}
        --spacing: var(--mush-spacing, 12px);
        --title-padding: var(--mush-title-padding, 12px);
        --title-spacing: var(--mush-title-spacing, 12px);
        --title-font-size: var(--mush-title-font-size, 24px);
        --title-font-weight: var(--mush-title-font-size, normal);
        --title-line-height: var(---mush-title-line-height, 1.2);
        --subtitle-font-size: var(--mush-subtitle-font-size, 16px);
        --subtitle-font-weight: var(--mush-subtitle-font-weight, normal);
        --subtitle-line-height: var(---mush-subtitle-line-height, 1.2);
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

import { css } from "lit";
import { colorCss } from "./colors";

export const cardStyle = css`
    :host {
        ${colorCss}
        --spacing: var(--mush-spacing, 12px);
        /* Title */
        --title-padding: var(--mush-title-padding, 24px 12px 16px);
        --title-spacing: var(--mush-title-spacing, 12px);
        --title-font-size: var(--mush-title-font-size, 24px);
        --title-font-weight: var(--mush-title-font-weight, normal);
        --title-line-height: var(--mush-title-line-height, 1.2);
        --subtitle-font-size: var(--mush-subtitle-font-size, 16px);
        --subtitle-font-weight: var(--mush-subtitle-font-weight, normal);
        --subtitle-line-height: var(--mush-subtitle-line-height, 1.2);
        /* Card */
        --icon-border-radius: var(--mush-icon-border-radius, 50%);
        --control-border-radius: var(--mush-control-border-radius, 12px);
        /* Chips */
        --chip-spacing: var(--mush-chip-spacing, 8px);
        --chip-padding: var(--mush-chip-padding, 0 10px);
        --chip-height: var(--mush-chip-height, 36px);
        --chip-border-radius: var(--mush-chip-border-radius, 18px);
    }
    .actions {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-end;
        overflow-y: auto;
    }
    .actions *:not(:last-child) {
        margin-right: var(--spacing);
    }
    .unavailable {
        --main-color: var(--warning-color);
    }
`;

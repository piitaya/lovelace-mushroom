import { css } from "lit";

export const themeVariables = css`
    --spacing: var(--muto-spacing, 16px);

    /* Title */
    --title-padding: var(--muto-title-padding, 24px 12px 16px);
    --title-spacing: var(--muto-title-spacing, 12px);
    --title-font-size: var(--muto-title-font-size, 24px);
    --title-font-weight: var(--muto-title-font-weight, normal);
    --title-line-height: var(--muto-title-line-height, 1.2);
    --subtitle-font-size: var(--muto-subtitle-font-size, 16px);
    --subtitle-font-weight: var(--muto-subtitle-font-weight, normal);
    --subtitle-line-height: var(--muto-subtitle-line-height, 1.2);

    /* Card */
    --card-primary-font-size: var(--muto-card-primary-font-size, 14px);
    --card-secondary-font-size: var(--muto-card-secondary-font-size, 12px);
    --card-primary-font-weight: var(--muto-card-primary-font-weight, bold);
    --card-secondary-font-weight: var(--muto-card-secondary-font-weight, bolder);
    --card-primary-line-height: var(--muto-card-primary-line-height, 1.5);
    --card-secondary-line-height: var(--muto-card-secondary-line-height, 1.5);

    /* Chips */
    --chip-spacing: var(--muto-chip-spacing, 8px);
    --chip-padding: var(--muto-chip-padding, 0 0.25em);
    --chip-height: var(--muto-chip-height, 36px);
    --chip-border-radius: var(--muto-chip-border-radius, 18px);
    --chip-font-size: var(--muto-chip-font-size, 0.3em);
    --chip-font-weight: var(--muto-chip-font-weight, bold);
    --chip-icon-size: var(--muto-chip-icon-size, 0.5em);
    --chip-avatar-padding: var(--muto-chip-avatar-padding, 0.1em);
    --chip-avatar-border-radius: var(--muto-chip-avatar-border-radius, 50%);
    --chip-box-shadow: var(
        --muto-chip-box-shadow,
        var(
            --ha-card-box-shadow,
            0px 2px 1px -1px rgba(0, 0, 0, 0.2),
            0px 1px 1px 0px rgba(0, 0, 0, 0.14),
            0px 1px 3px 0px rgba(0, 0, 0, 0.12)
        )
    );
    --chip-background: var(
        --muto-chip-background,
        var(--ha-card-background, var(--card-background-color, white))
    );
    /* Controls */
    --control-border-radius: var(--muto-control-border-radius, 12px);
    --control-height: var(--muto-control-height, 42px);
    --control-button-ratio: var(--muto-control-button-ratio, 1);
    --control-icon-size: var(--muto-control-icon-size, 0.5em);

    /* Slider */
    --slider-threshold: var(--muto-slider-threshold);

    /* Layout */
    --layout-align: var(--muto-layout-align, center);

    /* Badge */
    --badge-size: var(--muto-badge-size, 16px);
    --badge-icon-size: var(--muto-badge-icon-size, 0.75em);
    --badge-border-radius: var(--muto-badge-border-radius, 50%);

    /* Icon */
    --icon-border-radius: var(--muto-icon-border-radius, 50%);
    --icon-size: var(--muto-icon-size, 42px);
    --icon-symbol-size: var(--muto-icon-symbol-size, 0.5em);
`;

export const themeColorCss = css`
    /* RGB */
    /* Standard colors */
    --rgb-red: var(--muto-rgb-red, var(--default-red));
    --rgb-pink: var(--muto-rgb-pink, var(--default-pink));
    --rgb-purple: var(--muto-rgb-purple, var(--default-purple));
    --rgb-deep-purple: var(--muto-rgb-deep-purple, var(--default-deep-purple));
    --rgb-indigo: var(--muto-rgb-indigo, var(--default-indigo));
    --rgb-blue: var(--muto-rgb-blue, var(--default-blue));
    --rgb-light-blue: var(--muto-rgb-light-blue, var(--default-light-blue));
    --rgb-cyan: var(--muto-rgb-cyan, var(--default-cyan));
    --rgb-teal: var(--muto-rgb-teal, var(--default-teal));
    --rgb-green: var(--muto-rgb-green, var(--default-green));
    --rgb-light-green: var(--muto-rgb-light-green, var(--default-light-green));
    --rgb-lime: var(--muto-rgb-lime, var(--default-lime));
    --rgb-yellow: var(--muto-rgb-yellow, var(--default-yellow));
    --rgb-amber: var(--muto-rgb-amber, var(--default-amber));
    --rgb-orange: var(--muto-rgb-orange, var(--default-orange));
    --rgb-deep-orange: var(--muto-rgb-deep-orange, var(--default-deep-orange));
    --rgb-brown: var(--muto-rgb-brown, var(--default-brown));
    --rgb-grey: var(--muto-rgb-grey, var(--default-grey));
    --rgb-blue-grey: var(--muto-rgb-blue-grey, var(--default-blue-grey));
    --rgb-black: var(--muto-rgb-black, var(--default-black));
    --rgb-white: var(--muto-rgb-white, var(--default-white));
    --rgb-disabled: var(--muto-rgb-disabled, var(--default-disabled));

    /* Action colors */
    --rgb-info: var(--muto-rgb-info, var(--rgb-blue));
    --rgb-success: var(--muto-rgb-success, var(--rgb-green));
    --rgb-warning: var(--muto-rgb-warning, var(--rgb-orange));
    --rgb-danger: var(--muto-rgb-danger, var(--rgb-red));

    /* State colors */
    --rgb-state-vacuum: var(--muto-rgb-state-vacuum, var(--rgb-teal));
    --rgb-state-fan: var(--muto-rgb-state-fan, var(--rgb-green));
    --rgb-state-light: var(--muto-rgb-state-light, var(--rgb-orange));
    --rgb-state-entity: var(--muto-rgb-state-entity, var(--rgb-blue));
    --rgb-state-media-player: var(--muto-rgb-state-media-player, var(--rgb-indigo));
    --rgb-state-lock: var(--muto-rgb-state-lock, var(--rgb-blue));
    --rgb-state-humidifier: var(--muto-rgb-state-humidifier, var(--rgb-purple));

    /* State alarm colors */
    --rgb-state-alarm-disarmed: var(--muto-rgb-state-alarm-disarmed, var(--rgb-info));
    --rgb-state-alarm-armed: var(--muto-rgb-state-alarm-armed, var(--rgb-success));
    --rgb-state-alarm-triggered: var(--muto-rgb-state-alarm-triggered, var(--rgb-danger));

    /* State person colors */
    --rgb-state-person-home: var(--muto-rgb-state-person-home, var(--rgb-success));
    --rgb-state-person-not-home: var(--muto-rgb-state-person-not-home, var(--rgb-danger));
    --rgb-state-person-zone: var(--muto-rgb-state-person-zone, var(--rgb-info));
    --rgb-state-person-unknown: var(--muto-rgb-state-person-unknown, var(--rgb-grey));

    /* State update colors */
    --rgb-state-update-on: var(--muto-rgb-state-update-on, var(--rgb-orange));
    --rgb-state-update-off: var(--muto-rgb-update-off, var(--rgb-green));
    --rgb-state-update-installing: var(--muto-rgb-update-installing, var(--rgb-blue));

    /* State lock colors */
    --rgb-state-lock-locked: var(--muto-rgb-state-lock-locked, var(--rgb-green));
    --rgb-state-lock-unlocked: var(--muto-rgb-state-lock-unlocked, var(--rgb-red));
    --rgb-state-lock-pending: var(--muto-rgb-state-lock-pending, var(--rgb-orange));

    /* State cover colors */
    --rgb-state-cover-open: var(--muto-rgb-state-cover-open, var(--rgb-blue));
    --rgb-state-cover-closed: var(--muto-rgb-state-cover-closed, var(--rgb-disabled));
`;
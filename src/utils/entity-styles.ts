import { css, unsafeCSS } from "lit";

const strAnimations = {
    pulse: `@keyframes pulse {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }`,
    spin: `@keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }`,
    cleaning: `@keyframes cleaning {
        0% {
            transform: rotate(0);
        }
        25% {
            transform: rotate(20deg);
        }
        50% {
            transform: rotate(0);
        }
        75% {
            transform: rotate(-20deg);
        }
        100% {
            transform: rotate(0);
        }
    }`,
};

export const animation = {
    pulse: css`
        ${unsafeCSS(strAnimations.pulse)}
    `,
    spin: css`
        ${unsafeCSS(strAnimations.spin)}
    `,
    cleaning: css`
        ${unsafeCSS(strAnimations.cleaning)}
    `,
};
export const animations = css`
    ${unsafeCSS(Object.values(strAnimations).join("\n"))}
`;

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
};

export const animation = {
    pulse: css`
        ${unsafeCSS(strAnimations.pulse)}
    `,
    spin: css`
        ${unsafeCSS(strAnimations.spin)}
    `,
};
export const animations = css`
    ${unsafeCSS(Object.values(strAnimations).join("\n"))}
`;

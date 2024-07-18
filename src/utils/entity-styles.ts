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
            transform: rotate(0) translate(0);
        }
        5% {
            transform: rotate(0) translate(0, -3px);
        }
        10% {
            transform: rotate(0) translate(0, 1px);
        }
        15% {
            transform: rotate(0) translate(0);
        }

        20% {
            transform: rotate(30deg) translate(0);
        }
        25% {
            transform: rotate(30deg) translate(0, -3px);
        }
        30% {
            transform: rotate(30deg) translate(0, 1px);
        }
        35% {
            transform: rotate(30deg) translate(0);
        }
        40% {
            transform: rotate(0) translate(0);
        }

        45% {
            transform: rotate(-30deg) translate(0);
        }
        50% {
            transform: rotate(-30deg) translate(0, -3px);
        }
        55% {
            transform: rotate(-30deg) translate(0, 1px);
        }
        60% {
            transform: rotate(-30deg) translate(0);
        }
        70% {
            transform: rotate(0deg) translate(0);
        }
        100% {
            transform: rotate(0deg);
        }
    }`,
  returning: `@keyframes returning {
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
  returning: css`
    ${unsafeCSS(strAnimations.returning)}
  `,
};
export const animations = css`
  ${unsafeCSS(Object.values(strAnimations).join("\n"))}
`;

import { noChange } from "lit";
import { AttributePart, directive, Directive, DirectiveParameters } from "lit/directive.js";
import { customElement } from "lit/decorators.js";
import { fireEvent } from "../../../../common/dom/fire_event";
import { deepEqual } from "../../../../common/util/deep-equal";
import { ActionHandlerDetail, ActionHandlerOptions } from "../../../../data/lovelace";

const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0;

interface ActionHandler extends HTMLElement {
    holdTime: number;
    bind(element: Element, options?: ActionHandlerOptions): void;
}
interface ActionHandlerElement extends HTMLElement {
    actionHandler?: {
        options: ActionHandlerOptions;
        start?: (ev: Event) => void;
        end?: (ev: Event) => void;
        handleEnter?: (ev: KeyboardEvent) => void;
    };
}

declare global {
    interface HTMLElementTagNameMap {
        "action-handler": ActionHandler;
    }
    interface HASSDomEvents {
        action: ActionHandlerDetail;
    }
}

const voidMethod = () => {};

@customElement("mush-action-handler")
export class MushActionHandler extends HTMLElement implements ActionHandler {
    public holdTime = 400;

    protected timer?: number;

    protected held = false;

    private cancelled = false;

    private dblClickTimeout?: number;

    private unscale = voidMethod;

    private cleanup() {
        this.unscale();
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }

    public connectedCallback() {
        Object.assign(this.style, {
            position: "absolute",
            width: isTouch ? "100px" : "50px",
            height: isTouch ? "100px" : "50px",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: "999",
        });

        [
            "touchcancel",
            "mouseout",
            "mouseup",
            "touchmove",
            "mousewheel",
            "wheel",
            "scroll",
        ].forEach((ev) => {
            document.addEventListener(
                ev,
                () => {
                    this.cancelled = true;
                    this.cleanup();
                },
                { passive: true }
            );
        });
    }

    public bind(element: ActionHandlerElement, options: ActionHandlerOptions = {}) {
        if (element.actionHandler && deepEqual(options, element.actionHandler.options)) {
            return;
        }

        if (element.actionHandler) {
            element.removeEventListener("touchstart", element.actionHandler.start!);
            element.removeEventListener("touchend", element.actionHandler.end!);
            element.removeEventListener("touchcancel", element.actionHandler.end!);

            element.removeEventListener("mousedown", element.actionHandler.start!);
            element.removeEventListener("click", element.actionHandler.end!);

            element.removeEventListener("keyup", element.actionHandler.handleEnter!);
        } else {
            element.addEventListener("contextmenu", (ev: Event) => {
                const e = ev || window.event;
                if (e.preventDefault) {
                    e.preventDefault();
                }
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.cancelBubble = true;
                e.returnValue = false;
                return false;
            });
        }

        element.actionHandler = { options };

        if (options.disabled) {
            return;
        }

        element.actionHandler.start = () => {
            this.unscale();
            this.cancelled = false;
            const haCard = findHaCard(element);
            if (haCard) {
                const currentStyle = window.getComputedStyle(haCard);

                if (currentStyle.transition.indexOf("transform") === -1) {
                    const transform = `transform ${this.holdTime}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
                    haCard.style.transition = concatStyle(transform, currentStyle.transition);
                }
                const currentTransform = currentStyle.transform;
                haCard.style.transform = concatStyle(
                    "scale(0.9)",
                    currentTransform !== "none" ? currentTransform : ""
                );
                this.unscale = () => {
                    // Use closure which makes bookkeeping a lot easier
                    haCard.style.transform = currentTransform;
                    // Remove unscale
                    this.unscale = voidMethod;
                };
                if (options.hasHold) {
                    this.held = false;
                    this.timer = window.setTimeout(() => {
                        this.held = true;
                        // Give haptic feeback on devices that support it
                        if (navigator.vibrate) {
                            navigator.vibrate(200);
                        }
                    }, this.holdTime);
                }
            }
        };

        element.actionHandler.end = (ev: Event) => {
            // Don't respond when moved or scrolled while touch
            if (["touchend", "touchcancel"].includes(ev.type) && this.cancelled) {
                return;
            }
            const target = ev.target as HTMLElement;
            // Prevent mouse event if touch event
            if (ev.cancelable) {
                ev.preventDefault();
            }

            this.cleanup();

            if (options.hasHold && this.held) {
                fireEvent(target, "action", { action: "hold" });
            } else if (options.hasDoubleClick) {
                if (
                    (ev.type === "click" && (ev as MouseEvent).detail < 2) ||
                    !this.dblClickTimeout
                ) {
                    this.dblClickTimeout = window.setTimeout(() => {
                        this.dblClickTimeout = undefined;
                        fireEvent(target, "action", { action: "tap" });
                    }, 250);
                } else {
                    clearTimeout(this.dblClickTimeout);
                    this.dblClickTimeout = undefined;
                    fireEvent(target, "action", { action: "double_tap" });
                }
            } else {
                fireEvent(target, "action", { action: "tap" });
            }
        };

        element.actionHandler.handleEnter = (ev: KeyboardEvent) => {
            if (ev.keyCode !== 13) {
                return;
            }
            (ev.currentTarget as ActionHandlerElement).actionHandler!.end!(ev);
        };

        element.addEventListener("touchstart", element.actionHandler.start, {
            passive: true,
        });
        element.addEventListener("touchend", element.actionHandler.end);
        element.addEventListener("touchcancel", element.actionHandler.end);

        element.addEventListener("mousedown", element.actionHandler.start, {
            passive: true,
        });
        element.addEventListener("click", element.actionHandler.end);

        element.addEventListener("keyup", element.actionHandler.handleEnter);
    }
}

const getActionHandler = (): ActionHandler => {
    const body = document.body;
    if (body.querySelector("mush-action-handler")) {
        return body.querySelector("mush-action-handler") as ActionHandler;
    }

    const actionhandler = document.createElement("mush-action-handler");
    body.appendChild(actionhandler);

    return actionhandler as ActionHandler;
};

export const actionHandlerBind = (
    element: ActionHandlerElement,
    options?: ActionHandlerOptions
) => {
    const actionhandler: ActionHandler = getActionHandler();
    if (!actionhandler) {
        return;
    }
    actionhandler.bind(element, options);
};

export const actionHandler = directive(
    class extends Directive {
        update(part: AttributePart, [options]: DirectiveParameters<this>) {
            actionHandlerBind(part.element as ActionHandlerElement, options);
            return noChange;
        }

        render(_options?: ActionHandlerOptions) {}
    }
);

const findHaCard = (element: HTMLElement) => {
    let parent: HTMLElement | null = element;
    while (parent && parent !== document.body && parent.tagName !== "HA-CARD") {
        parent = parent.parentElement;
    }
    if (parent === document.body) {
        return null;
    }
    return parent;
};

const concatStyle = (left: string, right: string) => {
    if (left && right) {
        return `${left}, ${right}`;
    }
    return left || right;
};

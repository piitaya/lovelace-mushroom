import { fireEvent } from "./dom/fire_event";
import { mainWindow } from "./dom/get_main_window";

declare global {
    interface HASSDomEvents {
        "location-changed": NavigateOptions;
    }
}

export interface NavigateOptions {
    replace?: boolean;
}

export const navigate = (path: string, options?: NavigateOptions) => {
    const replace = options?.replace || false;

    if (replace) {
        mainWindow.history.replaceState(
            mainWindow.history.state?.root ? { root: true } : null,
            "",
            path
        );
    } else {
        mainWindow.history.pushState(null, "", path);
    }
    fireEvent(mainWindow, "location-changed", {
        replace,
    });
};

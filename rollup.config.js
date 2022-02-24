import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";
import ignore from "./rollup-plugins/rollup-ignore-plugin.js";

const dev = process.env.ROLLUP_WATCH;

const serveOptions = {
    contentBase: ["./dist"],
    host: "0.0.0.0",
    port: 5000,
    allowCrossOrigin: true,
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
};

const plugins = [
    ignore({
        files: [
            require.resolve("@material/mwc-notched-outline/mwc-notched-outline.js"),
            require.resolve("@material/mwc-ripple/mwc-ripple.js"),
            require.resolve("@material/mwc-list/mwc-list.js"),
            require.resolve("@material/mwc-list/mwc-list-item.js"),
            require.resolve("@material/mwc-menu/mwc-menu.js"),
            require.resolve("@material/mwc-menu/mwc-menu-surface.js"),
            require.resolve("@material/mwc-icon/mwc-icon.js"),
        ],
    }),
    typescript({
        declaration: false,
    }),
    nodeResolve(),
    commonjs(),
    json(),
    babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
    }),
    ...(dev ? [serve(serveOptions)] : [terser()]),
];

export default [
    {
        input: "src/index.ts",
        output: {
            file: "dist/mushroom.js",
            format: "es",
        },
        plugins,
        inlineDynamicImports: true,
        moduleContext: (id) => {
            const thisAsWindowForModules = [
                "node_modules/@formatjs/intl-utils/lib/src/diff.js",
                "node_modules/@formatjs/intl-utils/lib/src/resolve-locale.js",
            ];
            if (thisAsWindowForModules.some((id_) => id.trimRight().endsWith(id_))) {
                return "window";
            }
        },
    },
];

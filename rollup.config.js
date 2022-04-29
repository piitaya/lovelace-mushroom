import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";
import ignore from "./rollup-plugins/rollup-ignore-plugin.js";

const IGNORED_FILES = [
    "@material/mwc-notched-outline/mwc-notched-outline.js",
    "@material/mwc-ripple/mwc-ripple.js",
    "@material/mwc-list/mwc-list.js",
    "@material/mwc-list/mwc-list-item.js",
    "@material/mwc-menu/mwc-menu.js",
    "@material/mwc-menu/mwc-menu-surface.js",
    "@material/mwc-icon/mwc-icon.js",
];

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
        files: IGNORED_FILES.map(file => require.resolve(file))
    }),
    typescript({
        declaration: false,
    }),
    nodeResolve(),
    json(),
    commonjs(),
    babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
    }),
    ...(dev ? [serve(serveOptions)] : [terser()]),
];

export default [
    {
        input: "src/mushroom.ts",
        output: {
            dir: "dist",
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

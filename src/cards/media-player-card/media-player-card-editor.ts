import { fireEvent, HomeAssistant, LocalizeFunc, LovelaceCardEditor } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { configElementStyle } from "../../utils/editor-styles";
import { GENERIC_FIELDS } from "../../utils/form/fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { stateIcon } from "../../utils/icons/state-icon";
import { MEDIA_PLAYER_CARD_EDITOR_NAME, MEDIA_PLAYER_ENTITY_DOMAINS } from "./const";
import {
    MediaPlayerCardConfig,
    mediaPlayerCardConfigStruct,
    MEDIA_LAYER_MEDIA_CONTROLS,
    MEDIA_PLAYER_VOLUME_CONTROLS,
} from "./media-player-card-config";

export const MEDIA_FIELDS = [
    "use_media_info",
    "use_media_artwork",
    "media_controls",
    "volume_controls",
];

const computeSchema = memoizeOne((localize: LocalizeFunc, icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: MEDIA_PLAYER_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    {
        type: "grid",
        name: "",
        schema: [{ name: "icon", selector: { icon: { placeholder: icon } } }],
    },
    {
        type: "grid",
        name: "",
        schema: [{ name: "layout", selector: { "mush-layout": {} } }],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "use_media_info", selector: { boolean: {} } },
            { name: "use_media_artwork", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            {
                name: "volume_controls",
                selector: {
                    select: {
                        options: MEDIA_PLAYER_VOLUME_CONTROLS.map((control) => ({
                            value: control,
                            label: localize(
                                `editor.card.media-player.volume_controls_list.${control}`
                            ),
                        })),
                        mode: "list",
                        multiple: true,
                    },
                },
            },
            {
                name: "media_controls",
                selector: {
                    select: {
                        options: MEDIA_LAYER_MEDIA_CONTROLS.map((control) => ({
                            value: control,
                            label: localize(
                                `editor.card.media-player.media_controls_list.${control}`
                            ),
                        })),
                        mode: "list",
                        multiple: true,
                    },
                },
            },
        ],
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
]);

@customElement(MEDIA_PLAYER_CARD_EDITOR_NAME)
export class MediaCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: MediaPlayerCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: MediaPlayerCardConfig): void {
        assert(config, mediaPlayerCardConfigStruct);
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (MEDIA_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.media-player.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entityState = this._config.entity ? this.hass.states[this._config.entity] : undefined;
        const entityIcon = entityState ? stateIcon(entityState) : undefined;
        const icon = this._config.icon || entityIcon;

        const customLocalize = setupCustomlocalize(this.hass!);
        const schema = computeSchema(customLocalize, icon);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    static get styles(): CSSResultGroup {
        return [configElementStyle];
    }
}

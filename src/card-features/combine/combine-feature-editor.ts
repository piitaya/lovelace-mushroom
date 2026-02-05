import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  fireEvent,
  HomeAssistant,
  LovelaceCardFeatureConfig,
  LovelaceCardFeatureContext,
} from "../../ha";
import setupCustomlocalize from "../../localize";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { CombineFeatureConfig } from "./combine-feature-config";

interface ItemMovedEvent extends Event {
  detail: {
    oldIndex: number;
    newIndex: number;
  };
}

const SCHEMA: HaFormSchema[] = [
  {
    name: "layout",
    selector: {
      select: {
        options: [
          { value: "compact", label: "Compact" },
          { value: "inline", label: "Inline" },
        ],
        mode: "dropdown",
      },
    },
  },
];

interface FeatureEditorEntry {
  element: HTMLElement | null;
  handler: ((ev: Event) => void) | null;
  loading?: boolean;
}

@customElement("mushroom-combine-card-feature-editor")
export class MushroomCombineFeatureEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @state() private _config?: CombineFeatureConfig;

  private _featureEditors: Map<number, FeatureEditorEntry> = new Map();

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up event listeners
    this._featureEditors.forEach((entry) => {
      if (entry.element && entry.handler) {
        entry.element.removeEventListener("config-changed", entry.handler);
      }
    });
  }

  public setConfig(config: CombineFeatureConfig): void {
    this._config = config;
  }

  private _featureMoved(ev: ItemMovedEvent): void {
    ev.stopPropagation();
    const { oldIndex, newIndex } = ev.detail;

    const newFeatures = [...(this._config!.features || [])];
    newFeatures.splice(newIndex, 0, newFeatures.splice(oldIndex, 1)[0]);

    // Clear editor cache since indices changed
    this._featureEditors.clear();

    fireEvent(this, "config-changed", {
      config: { ...this._config!, features: newFeatures },
    });
  }

  private _handleAction(ev: CustomEvent, index: number): void {
    const action = ev.detail.item?.value;
    if (action === "delete") {
      this._removeFeature(index);
    }
  }

  private _removeFeature(index: number): void {
    const newFeatures = [...(this._config!.features || [])];
    newFeatures.splice(index, 1);

    // Clean up editor for removed index
    const entry = this._featureEditors.get(index);
    if (entry?.element && entry?.handler) {
      entry.element.removeEventListener("config-changed", entry.handler);
    }
    this._featureEditors.delete(index);

    fireEvent(this, "config-changed", {
      config: { ...this._config!, features: newFeatures },
    });
  }

  private _updateFeature(
    index: number,
    featureConfig: LovelaceCardFeatureConfig
  ): void {
    const newFeatures = [...(this._config!.features || [])];
    newFeatures[index] = featureConfig;
    fireEvent(this, "config-changed", {
      config: { ...this._config!, features: newFeatures },
    });
  }

  private _featuresAdded(ev: CustomEvent): void {
    ev.stopPropagation();
    const newFeatures = ev.detail.features as LovelaceCardFeatureConfig[];
    const existingFeatures = this._config?.features || [];
    fireEvent(this, "config-changed", {
      config: {
        ...this._config!,
        features: [...existingFeatures, ...newFeatures],
      },
    });
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);
    if (schema.name === "layout") {
      return customLocalize("editor.card_feature.combine.layout");
    }
    return schema.name;
  };

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    fireEvent(this, "config-changed", {
      config: { ...this._config!, ...ev.detail.value },
    });
  }

  private _getFeatureTypeLabel(type: string): string {
    if (type.startsWith("custom:")) {
      const customType = type.slice(7);
      const customFeatures = (window as any).customCardFeatures || [];
      const feature = customFeatures.find((f: any) => f.type === customType);
      if (feature?.name) {
        return feature.name;
      }
      return customType.replace(/-card-feature$/, "").replace(/-/g, " ");
    }
    return (
      this.hass!.localize(
        `ui.panel.lovelace.editor.features.types.${type}.label`
      ) || type.replace(/-/g, " ")
    );
  }

  private async _loadFeatureEditor(
    index: number,
    featureConfig: LovelaceCardFeatureConfig
  ): Promise<void> {
    if (this._featureEditors.has(index)) {
      return;
    }

    // Mark as loading immediately to prevent duplicate calls
    this._featureEditors.set(index, { element: null, handler: null, loading: true });

    const type = featureConfig.type;

    let tag: string;
    if (type.startsWith("custom:")) {
      tag = type.slice(7);
    } else {
      tag = `hui-${type}-card-feature`;
    }

    // Wait for element to be defined
    try {
      await customElements.whenDefined(tag);
    } catch {
      this.requestUpdate();
      return;
    }

    const featureClass = customElements.get(tag) as any;
    if (!featureClass || !featureClass.getConfigElement) {
      this._featureEditors.set(index, { element: null, handler: null, loading: false });
      this.requestUpdate();
      return;
    }

    try {
      const element = await featureClass.getConfigElement();

      const handler = (ev: Event) => {
        ev.stopPropagation();
        const customEv = ev as CustomEvent;
        this._updateFeature(index, customEv.detail.config);
      };

      element.addEventListener("config-changed", handler);

      this._featureEditors.set(index, { element, handler, loading: false });
      this.requestUpdate();
    } catch {
      this._featureEditors.set(index, { element: null, handler: null, loading: false });
      this.requestUpdate();
    }
  }

  private _renderFeatureEditor(
    index: number,
    featureConfig: LovelaceCardFeatureConfig
  ) {
    const entry = this._featureEditors.get(index);

    if (!entry) {
      this._loadFeatureEditor(index, featureConfig);
      return html`<p class="loading">Loading...</p>`;
    }

    if (entry.loading) {
      return html`<p class="loading">Loading...</p>`;
    }

    const element = entry.element;
    if (!element) {
      return html`<p class="no-editor">No configuration options</p>`;
    }

    (element as any).hass = this.hass;
    (element as any).context = this.context;

    try {
      (element as any).setConfig(featureConfig);
    } catch {
      // Ignore setConfig errors
    }

    return element;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const customLocalize = setupCustomlocalize(this.hass);
    const features = this._config.features || [];

    const data = {
      layout: this._config.layout || "compact",
    };

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>

      <h3>${customLocalize("editor.card_feature.combine.features")}</h3>
      <ha-sortable
        handle-selector=".handle"
        @item-moved=${this._featureMoved}
      >
        <div class="features">
          ${features.map(
            (featureConfig, index) => html`
              <ha-expansion-panel outlined left-chevron>
                <h3 slot="header">
                  ${this._getFeatureTypeLabel(featureConfig.type)}
                </h3>
                <div class="handle" slot="icons">
                  <ha-icon icon="mdi:drag"></ha-icon>
                </div>
                <ha-dropdown
                  slot="icons"
                  @wa-select=${(e: CustomEvent) => this._handleAction(e, index)}
                  @click=${(e: Event) => e.stopPropagation()}
                  placement="bottom-end"
                >
                  <ha-icon-button slot="trigger">
                    <ha-icon icon="mdi:dots-vertical"></ha-icon>
                  </ha-icon-button>
                  <ha-dropdown-item value="delete" variant="danger">
                    ${customLocalize("editor.card_feature.combine.remove")}
                    <ha-icon slot="icon" icon="mdi:delete"></ha-icon>
                  </ha-dropdown-item>
                </ha-dropdown>
                <div class="content">
                  ${this._renderFeatureEditor(index, featureConfig)}
                </div>
              </ha-expansion-panel>
            `
          )}
        </div>
      </ha-sortable>
      <hui-card-features-editor
        .hass=${this.hass}
        .context=${this.context}
        .features=${[]}
        @features-changed=${this._featuresAdded}
      ></hui-card-features-editor>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      h3 {
        margin: 16px 0 8px 0;
        font-size: inherit;
        font-weight: 500;
      }
      ha-expansion-panel h3 {
        margin: 0;
        display: flex;
        align-items: center;
        font-weight: inherit;
      }
      .features {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 8px;
      }
      ha-expansion-panel {
        --expansion-panel-summary-padding: 0 0 0 8px;
        --expansion-panel-content-padding: 0;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .handle {
        cursor: grab;
        padding: 4px;
        display: flex;
      }
      .handle ha-svg-icon {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
      }
      .content {
        padding: 12px;
      }
      .no-editor,
      .loading {
        color: var(--secondary-text-color);
        font-style: italic;
        margin: 0;
      }
      ha-icon-button {
        color: var(--secondary-text-color);
      }
      ha-icon {
        display: flex;
      }
    `;
  }
}

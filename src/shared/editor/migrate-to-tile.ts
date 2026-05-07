import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  fireEvent,
  type HomeAssistant,
  type LovelaceCardConfig,
} from "../../ha";
import setupCustomlocalize from "../../localize";
import { loadHaComponents } from "../../utils/loader";
import { migrateCardToTile } from "../../utils/tile-migration";

@customElement("mushroom-migrate-to-tile")
export class MigrateToTile extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public config?: LovelaceCardConfig;

  @state() private _confirming = false;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  private _confirm() {
    this._confirming = true;
  }

  private _cancel() {
    this._confirming = false;
  }

  private _migrate() {
    if (!this.config) return;
    const newConfig = migrateCardToTile(this.config);
    fireEvent(this, "config-changed", { config: newConfig });
  }

  protected render() {
    if (!this.hass || !this.config) {
      return nothing;
    }

    const customLocalize = setupCustomlocalize(this.hass);

    if (this._confirming) {
      return html`
        <ha-alert
          alert-type="warning"
          .title=${customLocalize("tile_migration.confirm_title")}
        >
          <div>${customLocalize("tile_migration.confirm_text")}</div>
          <div class="actions">
            <ha-button size="small" @click=${this._cancel}>
              ${customLocalize("tile_migration.cancel")}
            </ha-button>
            <ha-button
              size="small"
              variant="danger"
              @click=${this._migrate}
            >
              ${customLocalize("tile_migration.confirm")}
            </ha-button>
          </div>
        </ha-alert>
      `;
    }

    return html`
      <ha-alert
        alert-type="info"
        .title=${customLocalize("tile_migration.title")}
      >
        <div>${customLocalize("tile_migration.description")}</div>
        <div class="actions">
          <ha-button size="small" @click=${this._confirm}>
            ${customLocalize("tile_migration.migrate")}
          </ha-button>
        </div>
      </ha-alert>
    `;
  }

  static styles = css`
    ha-alert {
      margin-bottom: 16px;
      display: block;
    }
    .actions {
      display: flex;
      width: 100%;
      flex: 1;
      align-items: flex-end;
      flex-direction: row;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "mushroom-migrate-to-tile": MigrateToTile;
  }
}

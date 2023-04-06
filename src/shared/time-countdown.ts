import { LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../ha";

@customElement("mushroom-time-countdown")
export class CountDownComponent extends LitElement {

    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public datetime?: string | Date;

    @property({ attribute: false }) public timeup_message?: string;
    
    private _timeout?: number;

    public disconnectedCallback(): void {
      super.disconnectedCallback();
      this._clearTimeout();
    }
  
    public connectedCallback(): void {
      super.connectedCallback();
      if (this.datetime) {
        this._updateRelative();
      }
    }
  
    protected createRenderRoot() {
      return this;
    }
  
    protected firstUpdated(changedProps: PropertyValues) {
      super.firstUpdated(changedProps);
      this._updateRelative();
    }
  
    protected update(changedProps: PropertyValues) {
      super.update(changedProps);
      this._updateRelative();
    }
  
    private _clearTimeout(): void {
      if (this._timeout) {
        window.clearInterval(this._timeout);
        this._timeout = undefined;
      }
    }
  
    private _updateRelative(): void {
      if (!this.datetime) {
        this.innerHTML = this.hass.localize("ui.components.relative_time.never");
      } else {
        this.innerHTML = this._GetLabel(new Date(this.datetime));
        this._timeout = setTimeout(()=>this._updateRelative(), 1000);
      }
    }

    _GetLabel(targetDateTime?: Date) {
    
        if(!targetDateTime) {
          return this.hass.localize("ui.components.relative_time.never");
        }
    
        try {
          const distance = targetDateTime.getTime() - new Date().getTime();
          if(distance <= 0) {
            this._clearTimeout();
            return this.timeup_message || "Time's Up!"
          }
        
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
          return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2, "0")}`.replace(/00:/g, '')
        } catch(err) {
          return "";
        }
    }

}
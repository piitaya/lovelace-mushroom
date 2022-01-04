import { ActionConfig } from "custom-card-helpers";
import { css } from "lit";
import { any, object, string } from "superstruct";

export const configElementStyle = css`
  ha-switch {
    padding: 16px 6px;
  }
  .side-by-side {
    display: flex;
    align-items: flex-end;
  }
  .side-by-side > * {
    flex: 1;
    padding-right: 8px;
  }
  .side-by-side > *:last-child {
    flex: 1;
    padding-right: 0;
  }
  .suffix {
    margin: 0 8px;
  }
`;

export const baseLovelaceCardConfig = object({
  type: string(),
  view_layout: any(),
});

export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
  type?: HTMLInputElement["type"];
  config: ActionConfig;
}

type RegisterCardParams = {
  type: string;
  name: string;
  description: string;
};
export function registerCard(params: RegisterCardParams) {
  const windowWithCards = window as unknown as Window & {
    customCards: unknown[];
  };
  windowWithCards.customCards = windowWithCards.customCards || [];
  windowWithCards.customCards.push({
    ...params,
    preview: true,
  });
}

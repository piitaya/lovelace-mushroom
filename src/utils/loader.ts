// Hack to load ha-components needed for editor
export const loadHaComponents = () => {
  if (!customElements.get("ha-form")) {
    (customElements.get("hui-button-card") as any)?.getConfigElement();
  }
  if (!customElements.get("ha-entity-picker")) {
    (customElements.get("hui-entities-card") as any)?.getConfigElement();
  }
  if (!customElements.get("ha-card-conditions-editor")) {
    (customElements.get("hui-conditional-card") as any)?.getConfigElement();
  }
};

export const loadCustomElement = async <T = any>(name: string) => {
  let Component = customElements.get(name) as T;
  if (Component) {
    return Component;
  }
  await customElements.whenDefined(name);
  return customElements.get(name) as T;
};

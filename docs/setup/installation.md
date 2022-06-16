---
title: Installation
hide:
  - toc
---

### HACS

Mushroom is available in [HACS](https://hacs.xyz/) (Home Assistant Community Store).

1. Open HACS
2. Go to "Frontend" section
3. Click button with "+" icon
4. Search for "Mushroom"

### Manual

1. Download `mushroom.js` file from the [latest release](https://github.com/piitaya/lovelace-mushroom/releases/latest/download/mushroom.js).
2. Put `mushroom.js` file into your `config/www` folder.
3. Add reference to `mushroom.js` in Lovelace. There's two way to do that:
    - **Using UI:** _Configuration_ → _Lovelace Dashboards_ → _Resources Tab_ → Click Plus button → Set _Url_ as `/local/mushroom.js` → Set _Resource type_ as `JavaScript Module`.
      **Note:** If you do not see the Resources Tab, you will need to enable _Advanced Mode_ in your _User Profile_
    - **Using YAML:** Add following code to `lovelace` section.
        ```yaml
        resources:
            - url: /local/mushroom.js
              type: module
        ```
# 🍄 Mushroom

[![hacs][hacs-image]][hacs-url]

> Mushroom is currently in `beta` and not released yet. There can be some breaking changes.

![Overview](https://user-images.githubusercontent.com/5878303/152330296-87ac466a-ce48-4683-99ce-af06cd0911ea.png)

## What is mushroom ?

Mushroom is a collection of cards for [Home Assistant][home-assistant] Lovelace UI.

Mushroom mission is to propose easy to use components to build your [Home Assistant][home-assistant] dashboard.

### Features

-   ⚙️ Card editor for **all cards** and and **all options**
-   🎨 No theme needed
-   🚀 0 dependencies : no need to install another card.
-   📝 No `yaml` edition needed
-   🌈 Based on Material UI colors
-   🌓 Light and dark theme support

The goal of Mushroom is not to provide custom card for deep customization. You can use the excellent [UI-Lovelace-Minimalist][ui-lovelace-minimalist] and [Button-card][button-card] plugins for this.

## Installation

### HACS

Mushroom is not available yet in [HACS][hacs] (Home Assistant Community Store) but you can add it as a custom repository.

1. Go to any of the sections (integrations, frontend, automation).
2. Click on the 3 dots in the top right corner.
3. Select "Custom repositories"
4. Add the URL to the repository https://github.com/piitaya/lovelace-mushroom
5. Select the `Lovelace` category.
6. Click the `ADD` button.

### Manual

1. Download `mushroom.js` file from the [latest-release].
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

## Usage

All the Mushroom cards can be configured using Lovelace UI editor.

1. In Lovelace UI, click 3 dots in top left corner.
2. Click _Configure UI_.
3. Click Plus button to add a new card.
4. Find one of the _Custom: Mushroom_ card in the list.

### Cards

Different cards are available for differents entities :

-   🚨 [Alarm card](docs/cards/alarm.md)
-   🪟 [Cover card](docs/cards/cover.md)
-   💨 [Fan card](docs/cards/fan.md)
-   💡 [Light card](docs/cards/light.md)
-   🙋 [Person card](docs/cards/person.md)
-   📏 [Sensor card](docs/cards/sensor.md)
-   🛠 [Template card](docs/cards/template.md)
-   🔔 [Chips card](docs/cards/chips.md)

Some cards are on the todo list :

-   🌡 Climate card
-   📺 Media card
-   🧹 Vacuum card

### Theme customization

Mushroom works without theme but you can add a theme for better experience by copiing the theme file [themes/mushroom.yaml](themes/mushroom.yaml) in your theme folder.
If you want more information about themes, check out the official [Home Assistant documentation about themes][home-assitant-theme-docs].

```yaml
Mushroom:
    # HA variables
    ha-card-box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.16)
    ha-card-border-radius: 12px
    # Mushroom custom variables
    mush-spacing: 12px
    mush-rgb-red: 244, 67, 54
    mush-rgb-pink: 233, 30, 99
    mush-rgb-purple: 156, 39, 176
    mush-rgb-deep-purple: 103, 58, 183
    mush-rgb-indigo: 63, 81, 181
    mush-rgb-blue: 33, 150, 243
    mush-rgb-light-blue: 3, 169, 244
    mush-rgb-cyan: 0, 188, 212
    mush-rgb-teal: 0, 150, 136
    mush-rgb-green: 76, 175, 80
    mush-rgb-light-green: 139, 195, 74
    mush-rgb-lime: 205, 220, 57
    mush-rgb-yellow: 255, 235, 59
    mush-rgb-amber: 255, 193, 7
    mush-rgb-orange: 255, 152, 0
    mush-rgb-deep-orange: 255, 87, 34
    mush-rgb-brown: 121, 85, 72
    mush-rgb-grey: 158, 158, 158
    mush-rgb-blue-grey: 96, 125, 139
    mush-rgb-black: 0, 0, 0
    mush-rgb-white: 255, 255, 255
    # You must keep this to support light/dark theme
    modes:
        light: {}
        dark: {}
```

## Development server

### Home assistant demo

You can run a demo instance of Home Assistant with docker by running:

```sh
npm run start:hass
```

Once it's done, go to home assitant instance [http://localhost:8123](http://localhost:8123) and start configuration.

### Development

In another terminal, install dependencies and run development server:

```sh
npm install
npm start
```

Server will start on port `5000`.

### Home assistant configuration

Once both Home Assistant and mushroom are running, you have to add a resource to Home Assistant UI:

-   Go on your profile
-   Enable `Advanced mode`
-   Then go to Lovelace resources
-   Add the ressource `http://localhost:5000/mushroom.js`:

    _Configuration_ → _Lovelace Dashboards_ → _Resources Tab_ → Click Plus button → Set _Url_ as `http://localhost:5000/mushroom.js` → Set _Resource type_ as `JavaScript Module`.

### Build

You can build the `mushroom.js` file in `dist` folder by running the build command.

```sh
npm run build
```

<!-- Badges -->

[hacs-url]: https://github.com/custom-components/hacs
[hacs-image]: https://img.shields.io/badge/hacs-custom-orange.svg?style=flat-square

<!-- References -->

[home-assistant]: https://www.home-assistant.io/
[home-assitant-theme-docs]: https://www.home-assistant.io/integrations/frontend/#defining-themes
[hacs]: https://hacs.xyz
[ui-lovelace-minimalist]: https://ui-lovelace-minimalist.github.io/UI/
[button-card]: https://github.com/custom-cards/button-card

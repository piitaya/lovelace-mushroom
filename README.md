# 🍄 Mushroom

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
![downloads][downloads-badge]
![build][build-badge]

<a href="https://www.buymeacoffee.com/piitaya" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

![Overview](https://user-images.githubusercontent.com/5878303/152332130-760cf616-5c40-4825-a482-bb8f1f0f5251.png)

## What is mushroom ?

Mushroom is a collection of cards for [Home Assistant][home-assistant] Lovelace UI.

Mushroom mission is to propose easy to use components to build your [Home Assistant][home-assistant] dashboard.

### Features

-   🛠 Editor for **all cards** and and **all options** (no need to edit `yaml`)
-   😍 Icon picker
-   🖌 Color picker
-   🚀 0 dependencies : no need to install another card.
-   🌈 Based on Material UI colors
-   🌓 Light and dark theme support
-   🎨 Optional theme customization
-   🌎 Internationalization

The goal of Mushroom is not to provide custom card for deep customization. You can use the excellent [UI Lovelace Minimalist][ui-lovelace-minimalist] and [Button card][button-card] plugins for this.

## Installation

### HACS

Mushroom is available in [HACS][hacs] (Home Assistant Community Store).

1. Open HACS
2. Go to "Frontend" section
3. Click button with "+" icon
4. Search for "Mushroom"

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
-   🪄 [Entity card](docs/cards/entity.md)
-   💨 [Fan card](docs/cards/fan.md)
-   💡 [Light card](docs/cards/light.md)
-   🙋 [Person card](docs/cards/person.md)
-   🛠 [Template card](docs/cards/template.md)
-   🔔 [Chips card](docs/cards/chips.md)
-   ✏️ [Title card](docs/cards/title.md)
-   📦 [Update card](docs/cards/update.md)
-   🧹 [Vacuum card](docs/cards/vacuum.md)
-   📺 [Media card](docs/cards/media-player.md)
-   🔒 [Lock card](docs/cards/lock.md)

Cards on the todo list :

-   🌡 Climate card

### Theme customization

Mushroom works without theme but you can add a theme for better experience by installing the [Mushroom Themes](https://github.com/piitaya/lovelace-mushroom-themes). If you want more information about themes, check out the official [Home Assistant documentation about themes][home-assitant-theme-docs].

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

### Maintainer steps to add a new language

1. To be compatible with Home Assistant, language tags have to follow [BCP 47](https://www.rfc-editor.org/info/bcp47). A list of most language tags can be found here: [IANA subtag registry](http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry). Examples: `fr`, `fr-CA`, `zh-Hans`.
2. Create a new file `{language_code}.json` with your language code in the [translation folder](https://github.com/piitaya/lovelace-mushroom/tree/main/src/translations). Examples: `fr.json`.
3. Import your file into the [`localize.ts file`](https://github.com/piitaya/lovelace-mushroom/blob/main/src/localize.ts) and add your language in the `languages` record.
4. Don't forget to test locally with the development server by choosing the language with the Home Assistant UI in your profile.

### Credits

The design is inspired by [7ahang’s work][7ahang] on Behance and [Ui Lovelace Minimalist][ui-lovelace-minimalist].

<!-- Badges -->

[hacs-url]: https://github.com/custom-components/hacs
[hacs-badge]: https://img.shields.io/badge/hacs-default-orange.svg?style=flat-square
[release-badge]: https://img.shields.io/github/v/release/piitaya/lovelace-mushroom?style=flat-square
[downloads-badge]: https://img.shields.io/github/downloads/piitaya/lovelace-mushroom/total?style=flat-square
[build-badge]: https://img.shields.io/github/workflow/status/piitaya/lovelace-mushroom/Build?style=flat-square

<!-- References -->

[home-assistant]: https://www.home-assistant.io/
[home-assitant-theme-docs]: https://www.home-assistant.io/integrations/frontend/#defining-themes
[hacs]: https://hacs.xyz
[ui-lovelace-minimalist]: https://ui-lovelace-minimalist.github.io/UI/
[button-card]: https://github.com/custom-cards/button-card
[7ahang]: https://www.behance.net/gallery/88433905/Redesign-Smart-Home
[release-url]: https://github.com/piitaya/lovelace-mushroom/releases

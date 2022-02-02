# 🍄 Mushroom

[![hacs][hacs-image]][hacs-url]

Mushroom is a collection of cards for [Home Assistant][home-assistant] Lovelace UI

> Mushroom is currently in `beta` and not released yet. There can be some breaking changes.

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

### Available cards

Different cards are available for differents entities :

-   [Alarm card](docs/cards/alarm.md)
-   [Cover card](docs/cards/cover.md)
-   [Fan card](docs/cards/fan.md)
-   [Light card](docs/cards/light.md)
-   [Person card](docs/cards/person.md)
-   [Sensor card](docs/cards/sensor.md)
-   [Template card](docs/cards/template.md)

Some card are on the todo list :

-   Climate card
-   Media card
-   Vacuum card

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
[hacs]: https://hacs.xyz

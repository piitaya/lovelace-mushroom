# Template card

![Template light](../images/template-light.png)
![Template dark](../images/template-dark.png)

## Description

A template card allows you to build a custom card. You can use `entity` as a variable for the entity set on the card e.g. `{{ states(entity) }}`.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                     | Type            | Default  | Description                                                                                                                                                      |
| :----------------------- | :-------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entity`                 | string          | Optional | Entity for template, actions and card features                                                                                                                   |
| `area`                   | string          | Optional | Entity for template and card features                                                                                                                            |
| `icon`                   | string          | Optional | Icon to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/) \*.                                                        |
| `color`                  | string          | Optional | Color to render. Used for icon, background effect and some card features. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/). |
| `picture`                | string          | Optional | Picture to render. It will replace the icon. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                              |
| `primary`                | string          | Optional | Primary info displayed in the. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                                            |
| `secondary`              | string          | Optional | Secondary info to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                                                 |
| `badge_icon`             | string          | Optional | Badge icon to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                                                     |
| `badge_text`             | string          | Optional | Badge text to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                                                     |
| `badge_color`            | string          | Optional | Badge color to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                                                    |
| `multiline_secondary`    | boolean         | `false`  | Enables support for multiline text for the secondary info.                                                                                                       |
| `vertical`               | boolean         | Optional | Displayed the icon and the content verticaly or not                                                                                                              |
| `tap_action`             | action          | `none`   | Home assistant action to perform on tap                                                                                                                          |
| `hold_action`            | action          | `none`   | Home assistant action to perform on hold                                                                                                                         |
| `double_tap_action`      | action          | `none`   | Home assistant action to perform on double_tap                                                                                                                   |
| `icon_tap_action`        | action          | `none`   | Home assistant action to perform on icon tap                                                                                                                     |
| `icon_hold_action`       | action          | `none`   | Home assistant action to perform on icon hold                                                                                                                    |
| `icon_double_tap_action` | action          | `none`   | Home assistant action to perform on icon double_tap                                                                                                              |
| `features`               | action          | `none`   | Card features to displayed on the card                                                                                                                           |
| `features_position`      | string          | `bottom` | Where the card features should be displayed. I can be either `bottom` or `inline`. When using inline, only the first feature is displayed.                       |
| `entity_id`              | `string` `list` | Optional | Only reacts to the state changes of these entities. This can be used if the automatic analysis fails to find all relevant entities.                              |

### Available colors

Color tokens are available by you can also use regular hexadecimal color.

- primary
- accent
- disabled
- primary-text
- secondary-text
- disabled-text
- red
- pink
- purple
- deep-purple
- indigo
- blue
- light-blue
- cyan
- teal
- green
- light-green
- lime
- yellow
- amber
- orange
- deep-orange
- brown
- light-grey
- grey
- dark-grey
- blue-grey
- black
- white

#### Notes

You can render weather svg icons using [weather state](https://developers.home-assistant.io/docs/core/entity/weather/#recommended-values-for-state-and-condition) as icon :

- weather-clear-night
- weather-cloudy
- weather-fog
- weather-lightning
- weather-lightning-rainy
- weather-partlycloudy
- weather-pouring
- weather-rainy
- weather-hail
- weather-snowy
- weather-snowy-rainy
- weather-sunny
- weather-windy
- weather-windy-variant

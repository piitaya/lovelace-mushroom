# Template Card

![Template light](../images/template-light.png)  
![Template dark](../images/template-dark.png)

## Description

The **Template Card** allows you to build fully customizable cards for your dashboard.  
You can use [templating](https://www.home-assistant.io/docs/configuration/templating/) in most fields.  

When defining an `entity` or an `area`, you can reference them inside templates with the `entity` and `area` variables. For example:  

```yaml
primary: "{{ states(entity) }}"
secondary: "Area: {{ area_name(area) }}"
````

---

## Configuration

All options are available in the **Lovelace editor**, but you can also configure the card directly in **YAML**.

| Name                     | Type          | Default  | Description                                                                                                                                        |
| :----------------------- | :------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entity`                 | string        | Optional | Entity used for templating, actions, and card features.                                                                                            |
| `area`                   | string        | Optional | Area used for templating and card features.                                                                                                        |
| `icon`                   | string        | Optional | Icon to display. Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                                              |
| `color`                  | string        | Optional | Color applied to the icon, background effects, and card features. Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                       |
| `picture`                | string        | Optional | Image to display instead of an icon. Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                                                                                          |
| `primary`                | string        | Optional | Primary text (main label). Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                                                                                               |
| `secondary`              | string        | Optional | Secondary text (subtitle or status). Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                                                                                         |
| `border_color`           | string        | Optional | Color applied to the card border, e.g. to highlight an alert. The default border is kept when empty. Supports [templating](https://www.home-assistant.io/docs/configuration/templating/). |
| `border_width`           | number        | Optional | Width of the card border, in pixels. The theme width is used when not set.                                                                         |
| `border_rules`           | list          | Optional | Rules to change the border (color, width and animation) when a condition is true. See [Border rules](#border-rules).                              |
| `badge_icon`             | string        | Optional | Icon displayed as a badge. Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                                                                                                 |
| `badge_text`             | string        | Optional | Text displayed inside the badge. Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                                                                                             |
| `badge_color`            | string        | Optional | Color applied to the badge. Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                                                                                                  |
| `multiline_secondary`    | boolean       | `false`  | If `true`, secondary text can span multiple lines.                                                                                                 |
| `vertical`               | boolean       | `false` | If `true`, displays the icon above the text (vertical layout).                                                                                     |
| `tap_action`             | action        | `none`   | Action performed when the card is tapped.                                                                                                          |
| `hold_action`            | action        | `none`   | Action performed when the card is long-pressed.                                                                                                    |
| `double_tap_action`      | action        | `none`   | Action performed when the card is double-tapped.                                                                                                   |
| `icon_tap_action`        | action        | `none`   | Action performed when the icon is tapped.                                                                                                          |
| `icon_hold_action`       | action        | `none`   | Action performed when the icon is long-pressed.                                                                                                    |
| `icon_double_tap_action` | action        | `none`   | Action performed when the icon is double-tapped.                                                                                                   |
| `features`               | list          | `none`   | Card features to display (e.g., controls or extra info).                                                                                           |
| `features_position`      | string        | `bottom` | Where features are displayed: `bottom` (below the card) or `inline` (next to content). Note: when using `inline`, only the first feature is shown. |
| `entity_id`              | string / list | Optional | Restricts template updates to these entities. Useful if automatic detection misses dependencies.                                                            |

---

## Theming

This card is not compatible with Mushroom themes because it based on the official [Tile card](https://www.home-assistant.io/dashboards/tile/). If you want a theme compatible card, use the [Legacy Template Card](./legacy-template.md).

## Available Colors

You can use **color tokens** (theme-aware) or regular **hexadecimal colors**.

### Theme color tokens

* `primary`
* `accent`
* `disabled`
* `primary-text`
* `secondary-text`
* `disabled-text`
* `red`
* `pink`
* `purple`
* `deep-purple`
* `indigo`
* `blue`
* `light-blue`
* `cyan`
* `teal`
* `green`
* `light-green`
* `lime`
* `yellow`
* `amber`
* `orange`
* `deep-orange`
* `brown`
* `light-grey`
* `grey`
* `dark-grey`
* `blue-grey`
* `black`
* `white`

---

## Notes

* You can render **weather SVG icons** by using the [standard weather entity states](https://developers.home-assistant.io/docs/core/entity/weather/#recommended-values-for-state-and-condition) as icon values:

  ```
  weather-clear-night
  weather-cloudy
  weather-fog
  weather-lightning
  weather-lightning-rainy
  weather-partlycloudy
  weather-pouring
  weather-rainy
  weather-hail
  weather-snowy
  weather-snowy-rainy
  weather-sunny
  weather-windy
  weather-windy-variant
  ```

---

## Example YAML

```yaml
type: custom:mushroom-template-card
entity: light.living_room_floor_lamp
area: living_room
icon: mdi:lightbulb
color: |
  {% if is_state(entity, 'on') %}
    amber
  {% else %}
    disabled
  {% endif %}
primary: "{{ state_attr(entity, 'friendly_name') }}"
secondary: Located in {{ area_name(area) }}
tap_action:
  action: more-info
icon_tap_action:
  action: toggle

```

This configuration:

* Displays a light bulb icon that changes color depending on the state.
* Shows the entity’s friendly name as the primary text.
* Displays the area name as secondary text.
* Toggles the light when tapped on the icon.
* Display more info dialog when tapped on the card

### Border color

The `border_color` option can highlight the card when a condition is met, on any entity. The default border is kept when the template renders empty.

```yaml
type: custom:mushroom-template-card
primary: Kitchen
icon: mdi:stove
border_width: 2
border_color: >
  {% if is_state('binary_sensor.kitchen_water_leak', 'on') %}
    red
  {% elif is_state('binary_sensor.kitchen_window', 'on') and is_state('climate.kitchen', 'heat') %}
    orange
  {% endif %}
```

Note: the border is not visible if your theme sets `ha-card-border-width` to `0`, unless `border_width` is set.

### Border rules

Border rules change the border when a condition is true, for example to make it blink when the alarm is triggered. The first rule whose condition is true is applied. When no rule applies, `border_color` and `border_width` are used.

Each item of the `border_rules` list supports the following options:

| Name        | Type   | Default            | Description                                                                                                                                                                 |
| :---------- | :----- | :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `condition` | string | Optional           | The rule is applied when the [template](https://www.home-assistant.io/docs/configuration/templating/) renders `true`, `yes`, `on` or a number other than `0`. A rule without condition is always applied. |
| `color`     | string | `border_color`     | Border color. Supports [templating](https://www.home-assistant.io/docs/configuration/templating/).                                                                          |
| `width`     | number | `border_width`     | Border width, in pixels.                                                                                                                                                    |
| `animation` | string | Optional           | Border animation: `pulse` (a glow around the card), `breathe` (the border slowly fades in and out), `blink` or `spin` (a light running along the border).                  |
| `speed`     | string | `normal`           | Animation speed: `slow`, `normal` or `fast`.                                                                                                                                |

Animations are only displayed when a border color is set, and are disabled when the system setting to reduce motion is enabled. A width of at least `2` is recommended for the `spin` animation.

```yaml
type: custom:mushroom-template-card
primary: Kitchen
icon: mdi:stove
border_rules:
  - condition: "{{ is_state('alarm_control_panel.home', 'triggered') }}"
    color: red
    width: 3
    animation: blink
    speed: fast
  - condition: "{{ is_state('binary_sensor.kitchen_water_leak', 'on') }}"
    color: blue
    width: 3
    animation: spin
  - condition: "{{ is_state('binary_sensor.kitchen_window', 'on') }}"
    color: orange
```


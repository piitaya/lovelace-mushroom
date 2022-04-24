"""Support for monitoring plants."""
from collections import deque
from datetime import datetime, timedelta
import logging

import voluptuous as vol

from homeassistant.components.recorder.models import States
from homeassistant.components.recorder.util import execute, session_scope
from homeassistant.const import (
    ATTR_TEMPERATURE,
    ATTR_UNIT_OF_MEASUREMENT,
    ATTR_NAME,
    CONDUCTIVITY,
    CONF_SENSORS,
    CONF_NAME,
    PERCENTAGE,
    STATE_OK,
    STATE_PROBLEM,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
    TEMP_CELSIUS,
)
from homeassistant.core import callback
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.entity_component import EntityComponent
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.aiohttp_client import async_get_clientsession


_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = "plant"

READING_BATTERY = "battery"
READING_TEMPERATURE = ATTR_TEMPERATURE
READING_MOISTURE = "moisture"
READING_CONDUCTIVITY = "conductivity"
READING_BRIGHTNESS = "brightness"

ATTR_PROBLEM = "problem"
ATTR_SENSORS = "sensors"
PROBLEM_NONE = "none"
ATTR_MAX_BRIGHTNESS_HISTORY = "max_brightness"
ATTR_SPECIES = "species"
ATTR_LIMITS = "limits"
ATTR_IMAGE = "image"

# we're not returning only one value, we're returning a dict here. So we need
# to have a separate literal for it to avoid confusion.
ATTR_DICT_OF_UNITS_OF_MEASUREMENT = "unit_of_measurement_dict"

CONF_MIN_BATTERY_LEVEL = f"min_{READING_BATTERY}"
CONF_MIN_TEMPERATURE = f"min_{READING_TEMPERATURE}"
CONF_MAX_TEMPERATURE = f"max_{READING_TEMPERATURE}"
CONF_MIN_MOISTURE = f"min_{READING_MOISTURE}"
CONF_MAX_MOISTURE = f"max_{READING_MOISTURE}"
CONF_MIN_CONDUCTIVITY = f"min_{READING_CONDUCTIVITY}"
CONF_MAX_CONDUCTIVITY = f"max_{READING_CONDUCTIVITY}"
CONF_MIN_BRIGHTNESS = f"min_{READING_BRIGHTNESS}"
CONF_MAX_BRIGHTNESS = f"max_{READING_BRIGHTNESS}"
CONF_CHECK_DAYS = "check_days"
CONF_SPECIES = "species"
CONF_IMAGE = "image"

CONF_PLANTBOOK = "openplantbook"
CONF_PLANTBOOK_CLIENT = "client_id"
CONF_PLANTBOOK_SECRET = "secret"



CONF_SENSOR_BATTERY_LEVEL = READING_BATTERY
CONF_SENSOR_MOISTURE = READING_MOISTURE
CONF_SENSOR_CONDUCTIVITY = READING_CONDUCTIVITY
CONF_SENSOR_TEMPERATURE = READING_TEMPERATURE
CONF_SENSOR_BRIGHTNESS = READING_BRIGHTNESS

CONF_WARN_BRIGHTNESS = "warn_low_brightness"

DEFAULT_MIN_BATTERY_LEVEL = 20
DEFAULT_MIN_TEMPERATURE = 10
DEFAULT_MAX_TEMPERATURE = 40
DEFAULT_MIN_MOISTURE = 20
DEFAULT_MAX_MOISTURE = 60
DEFAULT_MIN_CONDUCTIVITY = 500
DEFAULT_MAX_CONDUCTIVITY = 3000
DEFAULT_MIN_BRIGHTNESS = 0
DEFAULT_MAX_BRIGHTNESS = 100000
DEFAULT_CHECK_DAYS = 3

SCHEMA_SENSORS = vol.Schema(
    {
        vol.Optional(CONF_SENSOR_BATTERY_LEVEL): cv.entity_id,
        vol.Optional(CONF_SENSOR_MOISTURE): cv.entity_id,
        vol.Optional(CONF_SENSOR_CONDUCTIVITY): cv.entity_id,
        vol.Optional(CONF_SENSOR_TEMPERATURE): cv.entity_id,
        vol.Optional(CONF_SENSOR_BRIGHTNESS): cv.entity_id,
    }
)

PLANT_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_SENSORS): vol.Schema(SCHEMA_SENSORS),
        vol.Optional(
            CONF_MIN_BATTERY_LEVEL, default=DEFAULT_MIN_BATTERY_LEVEL
        ): cv.positive_int,
        vol.Optional(CONF_MIN_TEMPERATURE, default=DEFAULT_MIN_TEMPERATURE): vol.Coerce(float),
        vol.Optional(CONF_MAX_TEMPERATURE, default=DEFAULT_MAX_TEMPERATURE): vol.Coerce(float),
        vol.Optional(CONF_MIN_MOISTURE, default=DEFAULT_MIN_MOISTURE): cv.positive_int,
        vol.Optional(CONF_MAX_MOISTURE, default=DEFAULT_MAX_MOISTURE): cv.positive_int,
        vol.Optional(
            CONF_MIN_CONDUCTIVITY, default=DEFAULT_MIN_CONDUCTIVITY
        ): cv.positive_int,
        vol.Optional(
            CONF_MAX_CONDUCTIVITY, default=DEFAULT_MAX_CONDUCTIVITY
        ): cv.positive_int,
        vol.Optional(CONF_MIN_BRIGHTNESS, default=DEFAULT_MIN_BRIGHTNESS): cv.positive_int,
        vol.Optional(CONF_MAX_BRIGHTNESS, default=DEFAULT_MAX_BRIGHTNESS): cv.positive_int,
        vol.Optional(CONF_CHECK_DAYS, default=DEFAULT_CHECK_DAYS): cv.positive_int,
        vol.Optional(CONF_NAME): cv.string,
        vol.Optional(CONF_SPECIES): cv.string,
        vol.Optional(CONF_IMAGE): cv.string,
        vol.Optional(CONF_WARN_BRIGHTNESS, default=True): cv.boolean,
    }
)
PLANTBOOK_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_PLANTBOOK_CLIENT): cv.string,
        vol.Required(CONF_PLANTBOOK_SECRET): cv.string,
    }
)

DOMAIN = "plant"

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: {cv.string:(
            vol.Any(PLANT_SCHEMA, PLANTBOOK_SCHEMA)
        )}
    },
    extra=vol.ALLOW_EXTRA,
)


# Flag for enabling/disabling the loading of the history from the database.
# This feature is turned off right now as its tests are not 100% stable.
ENABLE_LOAD_HISTORY = False

PLANTBOOK_TOKEN = None

async def async_setup(hass, config):
    """Set up the Plant component."""
    component = EntityComponent(_LOGGER, DOMAIN, hass)
    if CONF_PLANTBOOK in config[DOMAIN]:
        plantbook_config = config[DOMAIN][CONF_PLANTBOOK]
        await _get_plantbook_token(hass=hass, client_id=plantbook_config.get(CONF_PLANTBOOK_CLIENT), secret=plantbook_config.get(CONF_PLANTBOOK_SECRET))

    entities = []
    for plant_name, plant_config in config[DOMAIN].items():
        if plant_name != CONF_PLANTBOOK:
            _LOGGER.info("Added plant %s", plant_name)
            entity = Plant(plant_name, plant_config)
            entities.append(entity)

    await component.async_add_entities(entities)
    return True

async def _get_plantbook_token(hass, client_id=None, secret=None):
    if not client_id or not secret:
        return None
    global PLANTBOOK_TOKEN
    """ Gets the token from the openplantbook API """
    url =  'https://open.plantbook.io/api/v1/token/'
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': secret
    }
    try:
        session = async_get_clientsession(hass)
        async with session.post(url, data=data) as result:
            token = await result.json()
            _LOGGER.debug("Got token {} from {}".format(token['access_token'], url))
            PLANTBOOK_TOKEN = token['access_token']
    except Exception as e:
        _LOGGER.error("Unable to get token from plantbook API: {}".format(e))



class Plant(Entity):
    """Plant monitors the well-being of a plant.

    It also checks the measurements against
    configurable min and max values.
    """

    READINGS = {
        READING_BATTERY: {
            ATTR_UNIT_OF_MEASUREMENT: PERCENTAGE,
            "min": CONF_MIN_BATTERY_LEVEL,
        },
        READING_TEMPERATURE: {
            ATTR_UNIT_OF_MEASUREMENT: TEMP_CELSIUS,
            "min": CONF_MIN_TEMPERATURE,
            "max": CONF_MAX_TEMPERATURE,
        },
        READING_MOISTURE: {
            ATTR_UNIT_OF_MEASUREMENT: PERCENTAGE,
            "min": CONF_MIN_MOISTURE,
            "max": CONF_MAX_MOISTURE,
        },
        READING_CONDUCTIVITY: {
            ATTR_UNIT_OF_MEASUREMENT: CONDUCTIVITY,
            "min": CONF_MIN_CONDUCTIVITY,
            "max": CONF_MAX_CONDUCTIVITY,
        },
        READING_BRIGHTNESS: {
            ATTR_UNIT_OF_MEASUREMENT: "lux",
            "min": CONF_MIN_BRIGHTNESS,
            "max": CONF_MAX_BRIGHTNESS,
        },
    }

    def __init__(self, name, config):
        """Initialize the Plant component."""
        self._config = config
        self._sensormap = {}
        self._readingmap = {}
        self._unit_of_measurement = {}
        for reading, entity_id in config["sensors"].items():
            self._sensormap[entity_id] = reading
            self._readingmap[reading] = entity_id
        self._state = None
        self._name = name
        self._plant_name = self._config.get(CONF_NAME)
        self._battery = None
        self._moisture = None
        self._conductivity = None
        self._temperature = None
        self._brightness = None
        self._problems = PROBLEM_NONE
        self._species = None
        if self._config.get(CONF_SPECIES):
            self._species = self._config.get(CONF_SPECIES).lower().replace("_", " ")
        self._image = self._config.get(CONF_IMAGE)
        if not self._image and self._species:
            self._image = '/local/images/plants/{}.jpg'.format(self._species)
        _LOGGER.debug("Adding plant {} Token {}".format(name, PLANTBOOK_TOKEN))

        self._conf_check_days = 3  # default check interval: 3 days
        if CONF_CHECK_DAYS in self._config:
            self._conf_check_days = self._config[CONF_CHECK_DAYS]
        self._brightness_history = DailyHistory(self._conf_check_days)

    @callback
    def _state_changed_event(self, event):
        """Sensor state change event."""
        self.state_changed(event.data.get("entity_id"), event.data.get("new_state"))

    @callback
    def state_changed(self, entity_id, new_state):
        """Update the sensor status."""
        if new_state is None:
            return
        value = new_state.state
        _LOGGER.debug("Received callback from %s with value %s", entity_id, value)
        if value == STATE_UNKNOWN:
            return

        reading = self._sensormap[entity_id]
        if reading == READING_MOISTURE:
            if value != STATE_UNAVAILABLE:
                value = int(float(value))
            self._moisture = value
        elif reading == READING_BATTERY:
            if value != STATE_UNAVAILABLE:
                value = int(float(value))
            self._battery = value
        elif reading == READING_TEMPERATURE:
            if value != STATE_UNAVAILABLE:
                value = float(value)
            self._temperature = value
        elif reading == READING_CONDUCTIVITY:
            if value != STATE_UNAVAILABLE:
                value = int(float(value))
            self._conductivity = value
        elif reading == READING_BRIGHTNESS:
            if value != STATE_UNAVAILABLE:
                value = int(float(value))
            self._brightness = value
            self._brightness_history.add_measurement(
                self._brightness, new_state.last_updated
            )
        else:
            raise HomeAssistantError(
                f"Unknown reading from sensor {entity_id}: {value}"
            )
        if ATTR_UNIT_OF_MEASUREMENT in new_state.attributes:
            self._unit_of_measurement[reading] = new_state.attributes.get(
                ATTR_UNIT_OF_MEASUREMENT
            )
        self._update_state()

    def _update_state(self):
        """Update the state of the class based sensor data."""
        result = []
        for sensor_name in self._sensormap.values():
            params = self.READINGS[sensor_name]
            value = getattr(self, f"_{sensor_name}")
            if value is not None:
                if value == STATE_UNAVAILABLE:
                    result.append(f"{sensor_name} unavailable")
                else:
                    if sensor_name == READING_BRIGHTNESS:
                        if self._config.get(CONF_WARN_BRIGHTNESS):
                            result.append(
                                self._check_min(
                                    sensor_name, self._brightness_history.max, params
                                )
                            )
                    else:
                        result.append(self._check_min(sensor_name, value, params))
                    result.append(self._check_max(sensor_name, value, params))

        result = [r for r in result if r is not None]

        if result:
            self._state = STATE_PROBLEM
            self._problems = ", ".join(result)
        else:
            self._state = STATE_OK
            self._problems = PROBLEM_NONE
        _LOGGER.debug("New data processed")
        self.async_write_ha_state()

    def _check_min(self, sensor_name, value, params):
        """If configured, check the value against the defined minimum value."""
        if "min" in params and params["min"] in self._config:
            min_value = self._config[params["min"]]
            if value < min_value:
                return f"{sensor_name} low"

    def _check_max(self, sensor_name, value, params):
        """If configured, check the value against the defined maximum value."""
        if "max" in params and params["max"] in self._config:
            max_value = self._config[params["max"]]
            if value > max_value:
                return f"{sensor_name} high"
        return None

    async def async_added_to_hass(self):
        """After being added to hass, load from history."""
        if PLANTBOOK_TOKEN and self._species:
            _LOGGER.debug("Getting plantbook-data for {} {}".format(self.name, self._species))
            self.hass.async_add_job(self._get_plantbook_data)
        if ENABLE_LOAD_HISTORY and "recorder" in self.hass.config.components:
            # only use the database if it's configured
            self.hass.async_add_job(self._load_history_from_db)

        async_track_state_change_event(
            self.hass, list(self._sensormap), self._state_changed_event
        )

        for entity_id in self._sensormap:
            state = self.hass.states.get(entity_id)
            if state is not None:
                self.state_changed(entity_id, state)

    async def _load_history_from_db(self):
        """Load the history of the brightness values from the database.

        This only needs to be done once during startup.
        """

        start_date = datetime.now() - timedelta(days=self._conf_check_days)
        entity_id = self._readingmap.get(READING_BRIGHTNESS)
        if entity_id is None:
            _LOGGER.debug(
                "Not reading the history from the database as "
                "there is no brightness sensor configured"
            )
            return

        _LOGGER.debug("Initializing values for %s from the database", self._name)
        with session_scope(hass=self.hass) as session:
            query = (
                session.query(States)
                .filter(
                    (States.entity_id == entity_id.lower())
                    and (States.last_updated > start_date)
                )
                .order_by(States.last_updated.asc())
            )
            states = execute(query, to_native=True, validate_entity_ids=False)

            for state in states:
                # filter out all None, NaN and "unknown" states
                # only keep real values
                try:
                    self._brightness_history.add_measurement(
                        int(state.state), state.last_updated
                    )
                except ValueError:
                    pass
        _LOGGER.debug("Initializing from database completed")
        self.async_write_ha_state()

    async def _get_plantbook_data(self):
        """ Gets information about the plant from the openplantbook API """
        if not PLANTBOOK_TOKEN:
            _LOGGER.debug("No plantbook token for {}".format(self.name))
            return
        url = "https://open.plantbook.io/api/v1/plant/detail/{}".format(self._species)
        headers = {"Authorization": "Bearer {}".format(PLANTBOOK_TOKEN)}
        _LOGGER.debug("Getting URL {}".format(url))
        try:
            session = async_get_clientsession(self.hass)
            async with session.get(url, headers=headers) as result:
                _LOGGER.debug("Fetched data from {}:".format(url))
                res = await result.json()
                _LOGGER.debug(res)

                self._set_conf_value(CONF_NAME, res['display_pid'])
                self._set_conf_value(CONF_MIN_TEMPERATURE, res['min_temp'])
                self._set_conf_value(CONF_MAX_TEMPERATURE, res['max_temp'])
                self._set_conf_value(CONF_MIN_MOISTURE, res['min_soil_moist'])
                self._set_conf_value(CONF_MAX_MOISTURE, res['max_soil_moist'])
                self._set_conf_value(CONF_MIN_CONDUCTIVITY, res['min_soil_ec'])
                self._set_conf_value(CONF_MAX_CONDUCTIVITY, res['max_soil_ec'])
                self._set_conf_value(CONF_MIN_BRIGHTNESS, res['min_light_lux'])
                self._set_conf_value(CONF_MAX_BRIGHTNESS, res['max_light_lux'])
                self._set_conf_value(CONF_IMAGE, res['image_url'])
        except Exception as e:
            _LOGGER.error("Unable to get plant data from plantbook API: {}".format(e))

    def _set_conf_value(self, var, val):
        """ Ensures that values explicitly set in the config is not overwritten """
        _LOGGER.debug("Plant: {} Var: {} Config: {} Value: {}".format(self.name, var, self._config.get(var), val))
        if var.startswith("min_") or var.startswith("max_"):
            default = globals()[f"DEFAULT_{var.upper()}"]
            if var not in self._config or self._config[var] == default:
                self._config[var] = val
        if var == 'name' and self._plant_name is None:
            self._plant_name = val
        if var == 'image' and self._image == 'openplantbook':
            self._image = val

    @property
    def should_poll(self):
        """No polling needed."""
        return False

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def state(self):
        """Return the state of the entity."""
        return self._state

    @property
    def state_attributes(self):
        """Return the attributes of the entity.

        Provide the individual measurements from the
        sensor in the attributes of the device.
        """
        attrib = {
            ATTR_PROBLEM: self._problems,
            ATTR_SENSORS: self._readingmap,
            ATTR_LIMITS: {},
            ATTR_DICT_OF_UNITS_OF_MEASUREMENT: self._unit_of_measurement,
            ATTR_SPECIES: self._config.get(CONF_SPECIES),
            ATTR_NAME: self._plant_name,
            ATTR_IMAGE: self._image,
        }

        for reading in self._sensormap.values():
            attrib[reading] = getattr(self, f"_{reading}")

        if self._brightness_history.max is not None:
            attrib[ATTR_MAX_BRIGHTNESS_HISTORY] = self._brightness_history.max

        for var in [
                CONF_MIN_TEMPERATURE,
                CONF_MAX_TEMPERATURE,
                CONF_MIN_MOISTURE,
                CONF_MAX_MOISTURE,
                CONF_MIN_CONDUCTIVITY,
                CONF_MAX_CONDUCTIVITY,
                CONF_MIN_BRIGHTNESS,
                CONF_MAX_BRIGHTNESS,
            ]:
            attrib[ATTR_LIMITS][var] = self._config[var]

        return attrib


class DailyHistory:
    """Stores one measurement per day for a maximum number of days.

    At the moment only the maximum value per day is kept.
    """

    def __init__(self, max_length):
        """Create new DailyHistory with a maximum length of the history."""
        self.max_length = max_length
        self._days = None
        self._max_dict = {}
        self.max = None

    def add_measurement(self, value, timestamp=None):
        """Add a new measurement for a certain day."""
        day = (timestamp or datetime.now()).date()
        if not isinstance(value, (int, float)):
            return
        if self._days is None:
            self._days = deque()
            self._add_day(day, value)
        else:
            current_day = self._days[-1]
            if day == current_day:
                self._max_dict[day] = max(value, self._max_dict[day])
            elif day > current_day:
                self._add_day(day, value)
            else:
                _LOGGER.warning("Received old measurement, not storing it")

        self.max = max(self._max_dict.values())

    def _add_day(self, day, value):
        """Add a new day to the history.

        Deletes the oldest day, if the queue becomes too long.
        """
        if len(self._days) == self.max_length:
            oldest = self._days.popleft()
            del self._max_dict[oldest]
        self._days.append(day)
        if not isinstance(value, (int, float)):
            return
        self._max_dict[day] = value

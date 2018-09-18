/* jshint -W097 */
/* jshint -W030 */
/* jshint strict: false */
/* jslint node: true */
/* jslint esversion: 6 */

// https://developer.amazon.com/de/docs/smarthome/smart-home-skill-api-message-reference.html
// https://developer.amazon.com/de/docs/smarthome/smart-home-skill-migration-guide.html
const capabilityObjects = {
    'Alexa.PowerController': {
        'powerState' : [
            // state: powerState
            // actions: turnOn, turnOff
            // values: ON, OFF
            {
                common: {
                    name: 'powerState',
                    type: 'boolean',
                    read: true,
                    write: true,
                    role: 'switch'
                },
                native: {
                    valueTrue: 'ON',
                    valueFalse: 'OFF',
                    actionTrue: 'turnOn',
                    actionFalse: 'turnOff',
                    supportedActions: ['turnOn', 'turnOff']
                }
            }
        ]
    },
    'Alexa.PowerLevelController': {
        'powerLevel': [
            // state: powerLevel
            // actions: setPowerLevel
            // values: 0..100
            {
                common: {
                    name: 'powerLevel',
                    type: 'mixed',
                    read: true,
                    write: true,
                    role: 'value'
                },
                native: {
                    valueSubKey: 'value',
                    action: 'setPowerLevel',
                    factor: 0.01,
                    supportedActions: ['setPowerLevel']
                },
                experimental: true
            },
            {
                common: {
                    name: 'powerLevelType',
                    type: 'string',
                    read: true,
                    write: true,
                    role: 'value'
                },
                native: {
                    valueSubKey: '@type',
                    action: 'setPowerLevel'
                },
                experimental: true
            }
        ]
    },
    'Alexa.LockController': {
        'lockState': [
            // state: lockState
            // actions: lock, unlock ??
            // values: 'LOCKED', 'UNLOCKED', 'JAMMED' (??)
            {
                common: {
                    name: 'lockState',
                    type: 'boolean',
                    read: true,
                    write: true,
                    role: 'switch.lock'
                },
                native: {
                    valueTrue: 'LOCKED',
                    valueFalse: 'UNLOCKED',
                    action: 'setLockState',
                    supportedActions: ['setLockState', 'getLockState', 'lockAction']
                },
                experimental: true
            }
        ]
    },
    'Alexa.ThermostatController': {
        // state: targetSetpoint
        // actions: setTargetTemperature ??
        // values: value=number, 'scale': 'CELSIUS'/'FAHRENHEIT'
        'targetSetpoint': [
            {
                common: {
                    name: 'targetSetpoint',
                    type: 'number',
                    read: true,
                    write: true,
                    role: 'level.temperature'
                },
                native: {
                    valueSubKey: 'value',
                    action: 'setTargetTemperature',
                    supportedActions: ['setTargetTemperature', 'getTargetTemperature', 'incrementTargetTemperature', 'decrementTargetTemperature']
                }
            },
            {
                common: {
                    name: 'targetSetpoint-scale',
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'text',
                    def: 'CELSIUS'
                },
                native: {
                    valueSubKey: 'scale',
                    action: 'setTargetTemperature',
                    paramName: 'targetSetpoint.scale',
                    defaultValue: 'CELSIUS'
                }
            }
        ],
        // state: lowerSetpoint
        // actions: setTargetTemperature ??
        // values: value=number, 'scale': 'CELSIUS'/'FAHRENHEIT' ??
        'lowerSetpoint': [
            {
                common: {
                    name: 'lowerSetpoint',
                    type: 'number',
                    read: true,
                    write: true,
                    role: 'level.temperature'
                },
                native: {
                    action: 'setTargetTemperature',
                    supportedActions: ['setTargetTemperature', 'getTargetTemperature', 'incrementTargetTemperature', 'decrementTargetTemperature']
                },
                experimental: true
            },
            {
                common: {
                    name: 'lowerSetpoint-scale',
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'text',
                    def: 'CELSIUS'
                },
                native: {
                    valueSubKey: 'scale',
                    action: 'setTargetTemperature',
                    paramName: 'lowerSetpoint.scale',
                    defaultValue: 'CELSIUS'
                },
                experimental: true
            }
        ],
        // state: thermostatMode
        // actions: setThermostatMode ??
        // values: e.g. 'AUTO', 'COOL', 'ECO', 'HEAT' and 'OFF'
        'upperSetpoint': [
            {
                common: {
                    name: 'upperSetpoint',
                    type: 'number',
                    read: true,
                    write: true,
                    role: 'level.temperature'
                },
                native: {
                    action: 'setTargetTemperature',
                    supportedActions: ['setTargetTemperature', 'getTargetTemperature', 'incrementTargetTemperature', 'decrementTargetTemperature']
                },
                experimental: true
            },
            {
                common: {
                    name: 'upperSetpoint-scale',
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'text',
                    def: 'CELSIUS'
                },
                native: {
                    valueSubKey: 'scale',
                    action: 'setTargetTemperature',
                    paramName: 'upperSetpoint.scale',
                    defaultValue: 'CELSIUS'
                },
                experimental: true
            }
        ],
        'thermostatMode': [
            // state: thermostatMode
            // actions: setThermostatMode ??
            // values: e.g. 'AUTO', 'COOL', 'ECO', 'HEAT' and 'OFF'
            {
                common: {
                    name: 'thermostatMode',
                    type: 'string',
                    read: true,
                    write: true,
                    role: 'text'
                },
                native: {
                    action: 'setTargetTemperature',
                    supportedActions: ['setTargetTemperature', 'getTargetTemperature', 'incrementTargetTemperature', 'decrementTargetTemperature']
                },
                experimental: true
            }
        ]
    },
    'Alexa.TemperatureSensor': {
        'temperature': [
            // state: temperature
            // actions: -
            // values: value=number, 'scale': 'CELSIUS'/'FAHRENHEIT' ??
            {
                common: {
                    name: 'temperature',
                    type: 'number',
                    read: true,
                    write: false,
                    role: 'level.temperature'
                },
                native: {
                    supportedActions: ['getTemperatureReading']
                }
            },
            {
                common: {
                    name: 'temperature-scale',
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'text',
                    def: 'CELSIUS' // "CELSIUS", "FAHRENHEIT" or "KELVIN"
                },
                native: {
                    valueSubKey: 'scale',
                }
            }
        ]
    },
    'Alexa.ContactSensor': {
        'detectionState': [
            {
                common: {
                    name: 'detectionState',
                    type: 'boolean',
                    read: true,
                    write: false,
                    role: 'sensor.window'
                },
                native: {
                    supportedActions: [],
                    valueTrue: 'DETECTED',
                    valueFalse: 'NOT_DETECTED'
                },
                experimental: true
            }
        ]
    },
    'Alexa.MotionSensor': {
        'detectionState': [
            {
                common: {
                    name: 'detectionState',
                    type: 'boolean',
                    read: true,
                    write: false,
                    role: 'sensor.motion'
                },
                native: {
                    supportedActions: [],
                    valueTrue: 'DETECTED',
                    valueFalse: 'NOT_DETECTED'
                },
                experimental: true
            }
        ]
    },
    'Alexa.PercentageController': {
        'percentage': [
            // state: percentage
            // actions: setPercentage
            // values: 0..100
            {
                common: {
                    name: 'percentage',
                    type: 'number',
                    read: true,
                    write: true,
                    role: 'level',
                    min: 0,
                    max: 100
                },
                native: {
                    action: 'setPercentage',
                    factor: 0.01,
                    supportedActions: ['setPercentage', 'decrementPercentage', 'incrementPercentage']
                }
            }
        ]
    },
    'Alexa.BrightnessController': {
        'brightness': [
            // state: brightness
            // actions: setBrightness
            // values: 0..100
            {
                common: {
                    name: 'brightness',
                    type: 'number',
                    read: true,
                    write: true,
                    role: 'level.dimmer',
                    min: 0,
                    max: 100
                },
                native: {
                    action: 'setBrightness',
                    factor: 0.01,
                    supportedActions: ['setBrightness']
                }
            }
        ]
    },
    'Alexa.ColorController': {
        'color': [
            // state: 'color': {
            //    'hue': 350.5, // 0.0 to 360.0
            //    'saturation': 0.7138, // 0.0 to 1.0
            //    'brightness': 0.6524 // 0.0 to 1.0
            // }
            // actions: setColor
            // values: see above
            {
                common: {
                    name: 'colorName',
                    type: 'number',
                    read: true,
                    write: true,
                    role: 'state',
                    states: {}
                },
                native: {
                    action: 'setColor',
                    valueSubKey: 'name', // ColorPropertiesController!!
                    valueMap: {},
                    supportedActions: ['setColor']
                }
            },
            {
                common: {
                    name: 'color-hue',
                    type: 'number',
                    read: true,
                    write: false,
                    min: 0,
                    max: 360,
                    unit: '°',
                    role: 'level.color.hue'
                },
                native: {
                    donotsend: true,
                    valueSubKey: 'hue',
                    //action: 'setColor',
                    //paramName: 'color.hue'
                }
            },
            {
                common: {
                    name: 'color-saturation',
                    type: 'number',
                    read: true,
                    write: false,
                    min: 0,
                    max: 1,
                    role: 'level.color.saturation'
                },
                native: {
                    donotsend: true,
                    valueSubKey: 'saturation',
                    //action: 'setColor',
                    //paramName: 'color.saturation'
                }
            },
            {
                common: {
                    name: 'color-brightness',
                    type: 'number',
                    read: true,
                    write: false,
                    min: 0,
                    max: 1,
                    role: 'level.dimmer'
                },
                native: {
                    donotsend: true,
                    valueSubKey: 'brightness',
                    //action: 'setColor',
                    //paramName: 'color.brightness',
                    //factor: 0.01
                }
            },
            {
                common: {
                    name: 'colorRgb',
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'level.color.rgb'
                },
                native: {
                    donotsend: true,
                    valueSubKey: 'rgb' // not existing
                }
            }
        ]
    },
    'Alexa.ColorTemperatureController': {
        'colorTemperatureInKelvin': [
            // state: 'colorTemperatureInKelvin'
            // actions: setColorTemperature
            // values: 1000 to 10000
            {
                common: {
                    name: 'colorTemperatureName',
                    type: 'number',
                    read: true,
                    write: true,
                    role: 'state',
                    states: {}
                },
                native: {
                    action: 'setColorTemperature',
                    valueSubKey: 'name', // ColorPropertiesController!!
                    valueMap: {},
                    paramName: 'colorTemperatureName',
                    supportedActions: ['setColorTemperature', 'incrementColorTemperature', 'decrementColorTemperature']
                }
            },
            {
                common: {
                    name: 'colorTemperatureInKelvin',
                    type: 'number',
                    read: true,
                    write: false,
                    role: 'level.color.temperature',
                    min: 1000,
                    max: 10000
                },
                native: {
                    donotsend: true
                }
            }
        ]
    },
    'Alexa.ColorPropertiesController': {
        'colorProperties': [ // Redirect!!
            'colorName',
            'colorTemperatureName'
        ]
    },
/*    'Alexa.ChannelController': {
        'channel': {
            // state: channel {
            //      'number': '1234',
            //      'callSign': 'KSTATION1',
            //      'affiliateCallSign': 'KSTATION2',
            //      'uri': 'someUrl'
            // }
            // actions: changeChannel
            // values: 0..100
            common: {
                name: 'channel',
                type: 'number',
                read: true,
                write: true,
                role: 'level',
                min: 0,
                max: 100
            },
            native: {
                action: 'changeChannel',
                factor: 0.01
            },
            experimental: true
            // skipChannels -> 'channelCount' : 5 ??
        }
    },*/
    'Alexa.InputController': {
        'input': [
            // state: 'input'
            // actions: selectInput
            // values: string
            {
                common: {
                    name: 'input',
                    type: 'string',
                    read: true,
                    write: true,
                    role: 'media.input'
                },
                native: {
                    action: 'selectInput',
                    supportedActions: ['selectInput']
                },
                experimental: true
            }
        ]
    },
/*    'Alexa.PlaybackController': {
        'xxx': {
            // state: ??
            // actions: ??
            // 'supportedOperations' : ['Play', 'Pause', 'Stop', 'StartOver', 'Previous', 'Next', 'Rewind', 'FastForward'...]
            common: {
                name: 'xxx',
                type: 'boolean',
                read: true,
                write: true,
                role: 'switch.lock'
            },
            native: {
                valueTrue: 'LOCKED',
                valueFalse: 'UNLOCKED',
                action: 'setLockState'
            },
            experimental: true
        }
    },*/
/*    'Alexa.StepSpeaker': {
        'volumeSteps': {
            // state: 'volumeSteps'
            // actions: adjustVolume ??
            // values: number -100..100
            common: {
                name: 'volumeSteps',
                type: 'number',
                read: true,
                write: true,
                role: 'level.color.temperature'
            },
            native: {
                action: 'setColorTemperature'
            },
            experimental: true
        }
    },*/
/*    'Alexa.Speaker': {
        'volume': {
            // state: 'volume'
            // actions: setVolume ??
            // values: number 0..100

            // state: 'volume'
            // actions: adjustVolume ??
            // values: 'volume': number -100..100, 'volumeDefault': false

            // state: 'mute'
            // actions: setMute ??
            // values: boolean
            common: {
                name: 'volume',
                type: 'number',
                read: true,
                write: true,
                role: 'level.color.temperature'
            },
            native: {
                action: 'setColorTemperature'
            },
            experimental: true
        }
    },*/
    'Alexa.SceneController': {
        'active' : [ // Do not really exist
            {
                common: {
                    name: 'active',
                    type: 'boolean',
                    read: true,
                    write: true,
                    role: 'switch'
                },
                native: {
                    valueTrue: 'ACTIVE',
                    valueFalse: 'INACTIVE',
                    actionTrue: 'sceneActivate',
                    actionFalse: 'sceneDeactivate',
                    supportedActions: ['sceneActivate', 'sceneDeactivate']
                }
            }
        ]
    },
    'Alexa.EndpointHealth': {
        'connectivity': [
            {
                common: {
                    name: 'connectivity',
                    type: 'boolean',
                    read: true,
                    write: false,
                    role: 'indicator.connected'
                },
                native: {
                    valueTrue: 'OK',
                    hideInGroups: true
                }
            }
        ]
    }
    // Alexa.CameraStreamController
    // Alexa.Cooking und Alexa.Cooking.*
    // Alexa.TimeHoldController
    // Alexa.EqualizerController https://developer.amazon.com/de/docs/device-apis/alexa-equalizercontroller.html
};

// https://developer.amazon.com/de/docs/archive/shv2-smart-home-skill-api-reference.html
const actionObjects =  {
    'decrementColorTemperature': [],
    'decrementPercentage': [],
    'decrementTargetTemperature': [],
    'getLockState': [],
    'getTargetTemperature': [],
    'getTemperatureReading':
        capabilityObjects['Alexa.TemperatureSensor'].temperature,
    'incrementColorTemperature': [],
    'incrementPercentage': [],
    'incrementTargetTemperature': [],
    'retrieveCameraStreamUri': [],
    'setColor':
        capabilityObjects['Alexa.ColorController'].color,
    'setColorTemperature':
        capabilityObjects['Alexa.ColorTemperatureController'].colorTemperatureInKelvin,
    'setLockState': [
        // state: lockState
        // actions: lock, unlock ??
        // values: 'LOCKED', 'UNLOCKED', 'JAMMED' (??)
        {
            common: {
                name: 'lockState',
                type: 'boolean',
                read: true,
                write: true,
                role: 'switch.lock'
            },
            native: {
                valueTrue: 'LOCKED',
                valueFalse: 'UNLOCKED',
                action: 'lockAction',
                paramName: 'targetLockState.value',
                supportedActions: ['setLockState', 'getLockState', 'lockAction']
            }
        }
    ],
    'lockAction': [
        // state: lockState
        // actions: lock, unlock ??
        // values: 'LOCKED', 'UNLOCKED', 'JAMMED' (??)
        {
            common: {
                name: 'lockState',
                type: 'boolean',
                read: true,
                write: true,
                role: 'switch.lock'
            },
            native: {
                valueTrue: 'LOCKED',
                valueFalse: 'UNLOCKED',
                action: 'lockAction',
                paramName: 'targetLockState.value',
                supportedActions: ['setLockState', 'getLockState', 'lockAction']
            }
        }
    ],
    'setPercentage':
        capabilityObjects['Alexa.PercentageController'].percentage, //verified!
    'setBrightness':
        capabilityObjects['Alexa.BrightnessController'].brightness, //verified!
    'setTargetTemperature': [
        {
            common: {
                name: 'targetSetpoint',
                type: 'number',
                read: true,
                write: true,
                role: 'level.temperature'
            },
            native: {
                action: 'setTargetTemperature',
                paramName: 'targetTemperature.value',
                supportedActions: ['setTargetTemperature', 'getTargetTemperature', 'incrementTargetTemperature', 'decrementTargetTemperature']
            }
        },
        {
            common: {
                name: 'targetSetpoint-scale',
                type: 'string',
                read: true,
                write: false,
                role: 'text'
            },
            native: {
                valueSubKey: 'scale',
                action: 'setTargetTemperature',
                paramName: 'targetTemperature.scale',
                defaultValue: 'CELSIUS'
            }
        }
    ],
    'turnOn':
        capabilityObjects['Alexa.PowerController'].powerState,
    'turnOff':
        capabilityObjects['Alexa.PowerController'].powerState,
    'turnOnOff':
        capabilityObjects['Alexa.PowerController'].powerState,
    'sceneActivate':
        capabilityObjects['Alexa.SceneController'].active,
    'sceneDeactivate':
        capabilityObjects['Alexa.SceneController'].active
};

const knownColorValues = {
    'colorTemperatureName': {
        'incandescent': 2700,
        'daytime': 5500,
        'soft': 2700,
        'warm_white': 2200,
        'cool_white': 7000,
        'reading_white': 2700,
        'white': 4000,
        'daytime_white': 5500,
        'daylight': 5500,
        'sunset': 2200,
        'daylight_white': 5500,
        'warm': 2200,
        'soft_white':2700,
        'candlelight': 2200,
        'cool': 7000,
        'evening': 2200,
        'bright_white': 7000,
        'relax': 2200,
        'reading': 2700,
    },
    'colorName': {
        'medium_sea_green': '#57ffa0',
        'dark_turquoise': '#01fbff',
        'sky_blue': '#93e0ff',
        'old_lace': '#fff7e8',
        'light_salmon': '#ffa07a',
        'ghost_white': '#f7f7ff',
        'orange_red': '#ff4400',
        'lime_green': '#40ff40',
        'deep_pink': '#ff1491',
        'hot_pink': '#ff68b6',
        'sea_green': '#52ff9d',
        'dodger_blue': '#1e8fff',
        'goldenrod': '#ffc227',
        'red': '#ff0000',
        'blue': '#4100ff',
        'fuchsia': '#ff00ff',
        'green_yellow': '#afff2d',
        'pale_goldenrod': '#fffab7',
        'light_green': '#99ff99',
        'light_sea_green': '#2ffff5',
        'saddle_brown': '#ff7c1f',
        'cornsilk': '#fff7db',
        'dark_slate_gray': '#91ffff',
        'gainsboro': '#ffffff',
        'cadet_blue': '#96fbff',
        'medium_blue': '#0000ff',
        'wheat': '#ffe7ba',
        'indian_red': '#ff7272',
        'antique_white': '#fff0db',
        'plum': '#ffb9ff',
        'papaya_whip': '#ffefd6',
        'web_maroon': '#ff0000',
        'lavender_blush': '#ffeff4',
        'cyan': '#00ffff',
        'burlywood': '#ffd29c',
        'floral_white': '#fff9ef',
        'navajo_white': '#ffddad',
        'medium_turquoise': '#57fff9',
        'royal_blue': '#4876ff',
        'light_goldenrod': '#ffffd6',
        'navy_blue': '#0000ff',
        'light_sky_blue': '#8ad2ff',
        'medium_aquamarine': '#7fffd5',
        'orchid': '#ff84fd',
        'seashell': '#fff4ed',
        'pale_turquoise': '#bcffff',
        'yellow_green': '#bfff46',
        'brown': '#ff3d3e',
        'dark_khaki': '#fff891',
        'spring_green': '#00ff7f',
        'dark_violet': '#b300ff',
        'purple': '#ab24ff',
        'turquoise': '#48ffed',
        'dim_gray': '#ffffff',
        'dark_cyan': '#00ffff',
        'tan': '#ffddab',
        'pink': '#ffbfcc',
        'dark_blue': '#0000ff',
        'light_steel_blue': '#cae2ff',
        'rebecca_purple': '#aa55ff',
        'light_yellow': '#ffffe0',
        'aqua': '#34feff',
        'yellow': '#ffff00',
        'dark_orchid': '#bf40ff',
        'light_cyan': '#e0ffff',
        'blue_violet': '#9b30ff',
        'dark_salmon': '#ffa486',
        'web_green': '#00ff3d',
        'moccasin': '#ffe1b5',
        'forest_green': '#3cff3c',
        'gold': '#ffd400',
        'lime': '#c7ff1e',
        'olive': '#fffc4b',
        'medium_orchid': '#e066ff',
        'slate_blue': '#856fff',
        'dark_green': '#00ff00',
        'bisque': '#ffe2c4',
        'coral': '#ff7e4f',
        'salmon': '#ffa07a',
        'powder_blue': '#c3f9ff',
        'steel_blue': '#60b7ff',
        'lawn_green': '#79ff41',
        'firebrick': '#ff2f2f',
        'olive_drab': '#bfff3f',
        'white_smoke': '#ffffff',
        'linen': '#fff5eb',
        'alice_blue': '#eff7ff',
        'medium_spring_green': '#1aff9d',
        'violet': '#ff8bff',
        'light_pink': '#ffb5c1',
        'dark_magenta': '#ff00ff',
        'web_gray': '#ffffff',
        'maroon': '#ff468d',
        'medium_violet_red': '#ff1aab',
        'crimson': '#ff2545',
        'tomato': '#ff6347',
        'pale_green': '#9dff9d',
        'white': '#ffffff',
        'lavender': '#9f7fff',
        'light_blue': '#c1f0ff',
        'mint_cream': '#f4fff9',
        'chocolate': '#ff8025',
        'dark_red': '#ff0000',
        'medium_slate_blue': '#8370ff',
        'light_slate_gray': '#c6e1ff',
        'magenta': '#ff00ff',
        'dark_olive_green': '#a1ff6e',
        'medium_purple': '#ac82ff',
        'gray': '#ffffff',
        'silver': '#ffffff',
        'green': '#00ff00',
        'chartreuse': '#7fff00',
        'sienna': '#ff8248',
        'peach_puff': '#ffd8ba',
        'midnight_blue': '#3939ff',
        'thistle': '#ffe2ff',
        'indigo': '#9000ff',
        'light_coral': '#ff8888',
        'blanched_almond': '#ffeacc',
        'web_purple': '#ff00ff',
        'slate_gray': '#c9e4ff',
        'rosy_brown': '#ffc1c1',
        'sandy_brown': '#ffaa64',
        'teal': '#34feff',
        'misty_rose': '#ffe2e0',
        'pale_violet_red': '#ff82ac',
        'beige': '#ffffe5',
        'dark_orange': '#ff8a25',
        'dark_gray': '#ffffff',
        'peru': '#ffa44f',
        'deep_sky_blue': '#38bdff',
        'dark_goldenrod': '#ffbb0e',
        'ivory': '#ffffef',
        'honeydew': '#efffef',
        'dark_slate_blue': '#826fff',
        'dark_sea_green': '#c1ffc1',
        'light_gray': '#ffffff',
        'cornflower': '#6b9eff',
        'orange': '#ffa600',
        'lemon_chiffon': '#fff9cc',
        'azure': '#efffff',
        'snow': '#fff9f9',
        'aquamarine': '#7fffd2',
        'khaki': '#fff495',
        'black': '#ffffff'
    }
};

var nearestColor = require('nearest-color').from(knownColorValues.colorName);

function patchProperties(props) {
    for (let prop of props) {
        switch(prop.id) {
            case 'setColor':
                if (prop.parameters) {
                    for (let param of prop.parameters) {
                        if (param.name === 'colorName' && param.constraint && param.constraint.options) {
                            let displayValues = {};
                            let sendValues =  [];
                            for (let i = 0; i < param.constraint.options.length; i++) {
                                let displayName = param.constraint.options[i].displayName;
                                if (knownColorValues.colorName[param.constraint.options[i].data]) {
                                    displayName += ' (' + knownColorValues.colorName[param.constraint.options[i].data] + ')';
                                }
                                displayValues[i] = displayName;
                                sendValues[i] = param.constraint.options[i].data;
                            }
                            capabilityObjects['Alexa.ColorController'].color[0].common.states = displayValues;
                            capabilityObjects['Alexa.ColorController'].color[0].native.valueMap = sendValues;
                        }
                    }
                }
                break;
            case 'setColorTemperature':
                if (prop.parameters) {
                    for (let param of prop.parameters) {
                        if (param.name === 'colorTemperatureName' && param.constraint && param.constraint.options) {
                            let displayValues = {};
                            let sendValues =  [];
                            for (let i = 0; i < param.constraint.options.length; i++) {
                                let displayName = param.constraint.options[i].displayName;
                                if (knownColorValues.colorTemperatureName[param.constraint.options[i].data]) {
                                    displayName += ' (' + knownColorValues.colorTemperatureName[param.constraint.options[i].data] + 'K)';
                                }
                                displayValues[i] = displayName;
                                sendValues[i] = param.constraint.options[i].data;
                            }
                            capabilityObjects['Alexa.ColorTemperatureController'].colorTemperatureInKelvin[0].common.states = displayValues;
                            capabilityObjects['Alexa.ColorTemperatureController'].colorTemperatureInKelvin[0].native.valueMap = sendValues;
                        }
                    }
                }
                break;
        }
    }
}

module.exports = {
    capabilityObjects: capabilityObjects,
    actionObjects: actionObjects,
    patchProperties: patchProperties,
    nearestColor: nearestColor
};

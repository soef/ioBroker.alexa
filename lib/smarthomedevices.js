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
                    paramName: 'targetSetpoint.scale'
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
                    paramName: 'lowerSetpoint.scale'
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
                    paramName: 'upperSetpoint.scale'
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
                paramName: 'targetTemperature.scale'
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
        'medium_sea_green': '#1b4d31',
        'dark_turquoise': '#004c4d',
        'sky_blue': '#2d444d',
        'old_lace': '#4d4b46',
        'light_salmon': '#1d384d',
        'ghost_white': '#4b4b4d',
        'orange_red': '#4d1500',
        'lime_green': '#134d13',
        'deep_pink': '#4d062c',
        'hot_pink': '#4d2037',
        'sea_green': '#194d30',
        'dodger_blue': '#092b4d',
        'goldenrod': '#4d3b0c',
        'red': '#4d0000',
        'blue': '#00004d',
        'fuchsia': '#4d004d',
        'green_yellow': '#354d0e',
        'pale_goldenrod': '#4d4c37',
        'light_green': '#2e4d2e',
        'light_sea_green': '#0e4d4a',
        'saddle_brown': '#4d2609',
        'cornsilk': '#4d4b42',
        'dark_slate_gray': '#2c4d4d',
        'gainsboro': '#4d4d4d',
        'cadet_blue': '#2d4c4d',
        'medium_blue': '#00004d',
        'wheat': '#4d4638',
        'indian_red': '#4d2222',
        'antique_white': '#4d4942',
        'plum': '#4d384d',
        'papaya_whip': '#4d4941',
        'web_maroon': '#4d0000',
        'lavender_blush': '#4d484a',
        'cyan': '#004d4d',
        'burlywood': '#4d402f',
        'floral_white': '#4d4c48',
        'navajo_white': '#4d4334',
        'medium_turquoise': '#1a4d4c',
        'royal_blue': '#16244d',
        'light_goldenrod': '#4d4d41',
        'navy_blue': '#00004d',
        'light_sky_blue': '#2a404d',
        'medium_aquamarine': '#274d40',
        'orchid': '#4d284d',
        'seashell': '#4d4a48',
        'pale_turquoise': '#394d4d',
        'yellow_green': '#3a4d13',
        'brown': '#4d1313',
        'dark_khaki': '#4d4b2c',
        'spring_green': '#004d27',
        'dark_violet': '#36004d',
        'purple': '#340b4d',
        'turquoise': '#164d48',
        'dim_gray': '#4d4d4d',
        'dark_cyan': '#004d4d',
        'tan': '#4d4334',
        'pink': '#4d3a3e',
        'dark_blue': '#00004d',
        'light_steel_blue': '#3d444d',
        'rebecca_purple': '#341a4d',
        'light_yellow': '#4d4d44',
        'aqua': '#004d4d',
        'yellow': '#4d4c17',
        'dark_orchid': '#3a134d',
        'light_cyan': '#444d4d',
        'blue_violet': '#2f0f4d',
        'dark_salmon': '#4d3229',
        'web_green': '#004d00',
        'moccasin': '#4d4437',
        'forest_green': '#124d12',
        'gold': '#4d4000',
        'lime': '#3c4d09',
        'olive': '#4d4c17',
        'medium_orchid': '#441f4d',
        'slate_blue': '#28224d',
        'dark_green': '#004d00',
        'bisque': '#4d453b',
        'coral': '#4d2618',
        'salmon': '#4d3025',
        'powder_blue': '#3b4b4d',
        'steel_blue': '#1d384d',
        'lawn_green': '#274d00',
        'firebrick': '#4d0e0e',
        'olive_drab': '#3a4d13',
        'white_smoke': '#4d4d4d',
        'linen': '#4d4a47',
        'alice_blue': '#484b4d',
        'medium_spring_green': '#004d30',
        'violet': '#4d2a4d',
        'light_pink': '#4d373b',
        'dark_magenta': '#4d004d',
        'web_gray': '#4d4d4d',
        'maroon': '#4d152b',
        'medium_violet_red': '#4d0834',
        'crimson': '#4d0715',
        'tomato': '#4d1e16',
        'pale_green': '#304d2f',
        'white': '#4d4d4d',
        'lavender': '#30274d',
        'light_blue': '#3a494d',
        'mint_cream': '#4a4d4b',
        'chocolate': '#4d270b',
        'dark_red': '#4d0000',
        'medium_slate_blue': '#28224d',
        'light_slate_gray': '#3c444d',
        'magenta': '#4d004d',
        'dark_olive_green': '#3d4d21',
        'medium_purple': '#34284d',
        'gray': '#4d4d4d',
        'silver': '#4d4d4d',
        'green': '#004d00',
        'chartreuse': '#274d00',
        'sienna': '#4d2716',
        'peach_puff': '#4d4138',
        'midnight_blue': '#11114d',
        'thistle': '#4d444d',
        'indigo': '#2c004d',
        'light_coral': '#4d2929',
        'blanched_almond': '#4d473e',
        'web_purple': '#4d004d',
        'slate_gray': '#3d454d',
        'rosy_brown': '#4d3a3a',
        'sandy_brown': '#4d341e',
        'teal': '#004d4d',
        'misty_rose': '#4d4544',
        'pale_violet_red': '#4d2834',
        'beige': '#4d4d45',
        'dark_orange': '#4d2b00',
        'dark_gray': '#4d4d4d',
        'peru': '#4d3218',
        'deep_sky_blue': '#003a4d',
        'dark_goldenrod': '#4d3904',
        'ivory': '#4d4d48',
        'honeydew': '#484d48',
        'dark_slate_blue': '#28224d',
        'dark_sea_green': '#3a4d3a',
        'light_gray': '#4d4d4d',
        'cornflower': '#20304d',
        'orange': '#4d320e',
        'lemon_chiffon': '#4d4c3e',
        'azure': '#484d4d',
        'snow': '#4d4b4b',
        'aquamarine': '#264d40',
        'khaki': '#4d4a2d',
        'black': '#4d4d4d'
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

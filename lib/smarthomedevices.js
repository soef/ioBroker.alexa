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
                    actionFalse: 'turnOff'
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
                    type: 'number',
                    read: true,
                    write: true,
                    role: 'level.dimmer',
                    min: 0,
                    max: 100
                },
                native: {
                    action: 'setPowerLevel', // ??TODO verify
                    factor: 0.01
                },
                experimental: true
            }
        ]
    },
    'Alexa.LockController': {
        'lockState': [
            // state: lockState
            // actions: lock, unlock ??
            // values: "LOCKED", "UNLOCKED", "JAMMED" (??)
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
                    action: 'setLockState'
                },
                experimental: true
            }
        ]
    },
    'Alexa.ThermostatController': {
        // state: targetSetpoint
        // actions: setTargetTemperature ??
        // values: value=number, "scale": "CELSIUS"/"FAHRENHEIT"
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
                    action: 'setTargetTemperature'
                },
                experimental: true
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
                    paramName: 'targetSetpoint.scale'
                },
                experimental: true
            }
        ],
        // state: lowerSetpoint
        // actions: setTargetTemperature ??
        // values: value=number, "scale": "CELSIUS"/"FAHRENHEIT" ??
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
                    action: 'setTargetTemperature'
                },
                experimental: true
            },
            {
                common: {
                    name: 'lowerSetpoint-scale',
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'text'
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
        // values: e.g. "AUTO", "COOL", "ECO", "HEAT" and "OFF"
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
                    action: 'setTargetTemperature'
                },
                experimental: true
            },
            {
                common: {
                    name: 'upperSetpoint-scale',
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'text'
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
            // values: e.g. "AUTO", "COOL", "ECO", "HEAT" and "OFF"
            {
                common: {
                    name: 'thermostatMode',
                    type: 'string',
                    read: true,
                    write: true,
                    role: 'text'
                },
                native: {
                    action: 'setTargetTemperature'
                },
                experimental: true
            }
        ]
    },
    'Alexa.TemperatureSensor': {
        'temperature': [
            // state: temperature
            // actions: -
            // values: value=number, "scale": "CELSIUS"/"FAHRENHEIT" ??
            {
                common: {
                    name: 'temperature',
                    type: 'number',
                    read: true,
                    write: false,
                    role: 'level.temperature'
                },
                native: {
                }
            },
            {
                common: {
                    name: 'temperature-scale',
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'text'
                },
                native: {
                    valueSubKey: 'scale',
                }
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
                    factor: 0.01
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
                    factor: 0.01
                }
            }
        ]
    },
    'Alexa.ColorController': {
        'color': [
            // state: "color": {
            //    "hue": 350.5, // 0.0 to 360.0
            //    "saturation": 0.7138, // 0.0 to 1.0
            //    "brightness": 0.6524 // 0.0 to 1.0
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
                    valueMap: {}
                },
                experimental: true
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
            // state: "colorTemperatureInKelvin"
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
                    paramName: 'colorTemperatureName'
                },
                experimental: true
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
        'colorProperties': 'colorName' // Redirect!!
    },
/*    'Alexa.ChannelController': {
        'channel': {
            // state: channel {
            //      "number": "1234",
            //      "callSign": "KSTATION1",
            //      "affiliateCallSign": "KSTATION2",
            //      "uri": "someUrl"
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
            // skipChannels -> "channelCount" : 5 ??
        }
    },*/
    'Alexa.InputController': {
        'input': [
            // state: "input"
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
                    action: 'selectInput'
                },
                experimental: true
            }
        ]
    },
/*    'Alexa.PlaybackController': {
        'xxx': {
            // state: ??
            // actions: ??
            // "supportedOperations" : ["Play", "Pause", "Stop", "StartOver", "Previous", "Next", "Rewind", "FastForward"...]
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
            // state: "volumeSteps"
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
            // state: "volume"
            // actions: setVolume ??
            // values: number 0..100

            // state: "volume"
            // actions: adjustVolume ??
            // values: "volume": number -100..100, "volumeDefault": false

            // state: "mute"
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
                    actionFalse: 'sceneDeactivate'
                },
                experimental: true
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
        // values: "LOCKED", "UNLOCKED", "JAMMED" (??)
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
            }
        }
    ],
    'setPercentage':
        capabilityObjects['Alexa.PercentageController'].percentage, //verified!
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
                paramName: 'targetTemperature.value'
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

    }
};
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
                                    displayName += ' ' + knownColorValues.colorTemperatureName[param.constraint.options[i].data] + '(K)';
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
    patchProperties: patchProperties
};

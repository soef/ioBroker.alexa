
"use strict";

const
    soef = require('soef'),
    Alexa = require('alexa-remote')
;

let alexa;

let adapter = soef.Adapter(
    main,
    onStateChange,
    //onObjectChange,
    onUnload,
    'alexa'
);

function onUnload(callback) {
    callback && callback();
}

function onStateChange(id, state) {
    let ar, [a, inst, device, channel, subChannel] = ar = id.split('.');

    let func = devices.get(id.substr(8)).func;

    switch(channel) {
        case 'Bluetooth':
            //alexa.serialNumbers[device].pairedDeviceList[subChannel].connect(ar[5] === 'connect');
            if (typeof func === 'function') func(ar[5] === 'connect');
            break;
        default:
            if (typeof func === 'function') func(state.val);
            break;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function onObjectChange(id, object) {
// }

function normalizeConfig(config) {
}

const
    commands = {
        play: { val: false, common: { role: 'button'}},
        pause:{ val: false, common: { role: 'button'}},
        next: { val: false, common: { role: 'button'}},
        previous: { val: false, common: { role: 'button'}},
        forward: { val: false, common: { role: 'button'}},
        rewind: { val: false, common: { role: 'button'}},
        volume: { val: 0, common: { role: 'volume'}},
        shuffle: { val: false, common: { role: 'button'}},
        repeat: { val: false, common: {role: 'button'}},
    };

Alexa.prototype.createDevices = function (callback) {

    Object.keys (this.serialNumbers).forEach ((n) => {
        let device = this.serialNumbers[n];
        let dev = new devices.CDevice(device.serialNumber, device._name);
        dev.setChannel('properties');
        dev.set('capabilities', device.capabilities.join(','));
        if (device.bluetoothState) {
            //dev.setChannel('Bluetooth');
            device.bluetoothState.pairedDeviceList.forEach((bt) => {
                dev.setChannel('Bluetooth.' + bt.address, bt.friendlyName);
                let st = dev.oset('connect', { val: false, common: { role: 'button'}});
                if (st) st.func = bt.connect;
                st = dev.oset('disconnect', { val: false, common: { role: 'button'}});
                if (st) st.func = bt.connect;
            });
        }
        dev.setChannel('ToDos');

        dev.setChannel('Commands');
        for (let n in commands) {
            let st = dev.oset(n, JSON.parse(JSON.stringify(commands[n])));
            if (st) st.func = alexa.sendCommand.bind(alexa, device, n);
        }

        if (device.capabilities.includes('TUNE_IN')) {
            dev.set ('TuneIn', "");
        }
    });
    devices.update();
};



function main() {

    normalizeConfig(adapter.config);

    alexa = new Alexa();
    alexa.init({
            cookie: adapter.config.cookie,
            bluetooth: true
        },
        function () {
            alexa.createDevices();

            adapter.subscribeStates('*');
            adapter.subscribeForeignObjects('script.js.*');
        }
    )
}

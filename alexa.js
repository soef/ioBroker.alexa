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
    let ar, [a, inst, deviceId, channel, subChannel] = ar = id.split('.');

    let func = devices.get(id.substr(8)).func;
    let device = alexa.serialNumbers[deviceId];

    switch(channel) {
        case 'Bluetooth':
            //alexa.serialNumbers[device].pairedDeviceList[subChannel].connect(ar[5] === 'connect');
            if (typeof func === 'function') func(ar[5] === 'connect');
            break;
        default:
            if (typeof func === 'function') func(state.val, device, id);
            break;
    }
}

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


function setRequestResult(err, res) {
    if (!err) return;
    devices.root.setAndUpdate('requestResult', err);
}

Alexa.prototype.updateDevices = function (callback) {
    Object.keys (this.serialNumbers).forEach ((n) => {
        let st;
        let device = this.serialNumbers[n];
        let dev = new devices.CDevice (device.serialNumber, device._name);
        dev.set ('', device.online ? 'Online' : 'offline');
    });
    devices.update(callback);
};

Alexa.prototype.createDevices = function (callback) {

    Object.keys (this.serialNumbers).forEach ((n) => {
        let st;
        let device = this.serialNumbers[n];
        let dev = new devices.CDevice(device.serialNumber, device._name);
        dev.set('', device.online ? 'Online' : 'offline');
        dev.set('.requestResult', { val: '', common: { name: 'Request Result', write: false }});
        dev.setChannel('states');
        dev.set('capabilities', device.capabilities.join(','));
        if (device.bluetoothState) {
            //dev.setChannel('Bluetooth');
            device.bluetoothState.pairedDeviceList.forEach((bt) => {
                dev.setChannel('Bluetooth.' + bt.address, bt.friendlyName);
                st = dev.oset('connect', { val: false, common: { role: 'button'}});
                if (st) st.func = bt.connect;
                st = dev.oset('disconnect', { val: false, common: { role: 'button'}});
                if (st) st.func = bt.connect;
            });
        }
        //dev.setChannel('ToDos');

        dev.setChannel('Commands');
        for (let n in commands) {
            let st = dev.oset(n, JSON.parse(JSON.stringify(commands[n])));
            if (st) st.func = alexa.sendCommand.bind(alexa, device, n);
        }

        if (device.capabilities.includes('TUNE_IN')) {
            st = dev.oset ('TuneIn', "");
            if (st) st.func = function (query, device, id) {
                if (!device) return;
                alexa.tuneinSearch(query, function(err, res) {
                    setRequestResult(err, res);
                     if (err || !res || !Array.isArray(res.browseList)) return;
                     let station = res.browseList[0];
                     device.setTunein(station.id, station.contentType);
                     devices.root.setAndUpdate(id, { val: station.name, ack: true });
                })

            }
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

            // alexa.getPlayerInfo('Wohnzimmer', function(err, res) {
            //     res = res;
            //     if (res.playerInfo.volume) {
            //         let vol = res.playerInfo.volume.volume;
            //         let muted = res.playerInfo.volume.muted;
            //     }
            //     let state = res.playerInfo.state; // PAUSED
            // })


            alexa.createDevices();

            adapter.subscribeStates('*');
            adapter.subscribeForeignObjects('script.js.*');
        }
    )
}


//api/tts/audio/data



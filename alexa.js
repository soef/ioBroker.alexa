"use strict";

const
    soef = require('soef'),
    Alexa = require('alexa-remote')
;

let alexa;
const
    SMART_HOME_DEVICES = 'smart-home-devices',
    DOT_DEVICES = 'dot-devices'
;


let adapter = soef.Adapter(
    main,
    onStateChange,
    onObjectChange,
    onUnload,
    'alexa'
);

function onUnload(callback) {
    callback && callback();
}

function onStateChange(id, state) {
    let ar, [a, inst, dummy, deviceId, channel, subChannel] = ar = id.split('.');

    let func = devices.get(id.substr(8)).func;
    //let device = alexa.serialNumbers[deviceId];

    switch(channel) {
        case 'Bluetooth':
            if (typeof func === 'function') func(ar[6] === 'connect');
            break;
        default:
            if (typeof func === 'function') func(state.val);
            break;
    }
}

function onObjectChange(id, object) {
    let ar = id.split('.');
    if (ar[2] === DOT_DEVICES) {
        let device = alexa.serialNumbers[ar[3]];
        if (object && object.common && object.common.name) {
            device.rename (object.common.name);
        }
    }
}

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


Alexa.prototype.updateStates = function (callback) {
    let self = this, i = 0;
    let dev = new devices.CDevice ('', '');

    (function doIt() {
        if (i >= self.devices.length) {
            devices.update(callback);
            return;
        }
        let device = self.devices[i++];
        dev.setDeviceEx(DOT_DEVICES + '\\.'+device.serialNumber, device.accountName);
        dev.set ('', device.online ? 'Online' : 'Offline');
        dev.setName(device.accountName);

        self.getPlayerInfo(device, function(err, res) {
            if (err || !res || !res.playerInfo) return doIt();
            dev.setChannel('Commands');
            if (res.playerInfo.volume) {
                dev.set('volume', { val: ~~res.playerInfo.volume.volume, ack: true });
                //let muted = res.playerInfo.volume.muted;
            }
            dev.set('pause', { val: res.playerInfo.state === 'PAUSED', ack: true });
            dev.setChannel('States');
            if (res.playerInfo.state !== null) dev.set('state', { val: res.playerInfo.state, ack: true });
            if (device) doIt();
        })
    })();
};



Alexa.prototype.createSmarthomeStates = function (callback) {
    this.getSmarthomeDevices(function(err, res) {
        if (err || !res) return callback(err);
        let dev = new devices.CDevice(SMART_HOME_DEVICES, 'Smart Home Devices');

        let all = res.locationDetails.Default_Location.amazonBridgeDetails.amazonBridgeDetails;
        let k = Object.keys(all);
        for (let i of k) {
            for (let n of Object.keys(all[i].applianceDetails.applianceDetails)) {
                let skill = all[i].applianceDetails.applianceDetails[n];
                dev.setChannel(skill.entityId, {
                    common: {
                        name: skill.modelName
                    },
                    native: {
                        friendlyDescription: skill.friendlyDescription,
                        friendlyName: skill.friendlyName,
                        ids:  skill.additionalApplianceDetails.additionalApplianceDetails.ids,
                        object: n,
                        manufacturerName: skill.manufacturerName,
                    }
                });
                dev.set('', skill.isEnabled);
                dev.set('isEnabled', skill.isEnabled);
            }
        }
        devices.update(callback);

    })

};

Alexa.prototype.createStates = function (callback) {

    Object.keys (this.serialNumbers).forEach ((n) => {
        let device = this.serialNumbers[n];
        let dev = new devices.CDevice('');
        dev.setDeviceEx(DOT_DEVICES + '\\.'+device.serialNumber, device._name);
        function devset(name, obj, func) {
            let st = dev.oset(name, obj);
            if (st) st.func = func;
        }

        dev.set('', device.online ? 'Online' : 'offline');
        dev.set('.requestResult', { val: '', common: { name: 'Request Result', write: false }});

        dev.setChannel('States');
        dev.set('capabilities', device.capabilities.join(','));

        if (device.bluetoothState) {
            device.bluetoothState.pairedDeviceList.forEach((bt) => {
                dev.setChannel('Bluetooth.' + bt.address, bt.friendlyName);
                devset('connect', { val: false, common: { role: 'button'}}, bt.connect);
                devset('disconnect', { val: false, common: { role: 'button'}}, bt.connect);
            });
        }

        if (device.notifications) {
            dev.setChannel('Notifications');
            for (let noti of device.notifications) {
                if (noti.originalTime)  {
                    let ar = noti.originalTime.split(':');
                    ar.length = 2;
                    let s = ar.join(':');
                    devset(s, { val: noti.status === 'ON', common: { name: `Type=${noti.type}`}}, noti.set);
                }
            }
        }

        dev.setChannel('Commands');
        for (let n in commands) {
            devset(n, JSON.parse(JSON.stringify(commands[n])), alexa.sendCommand.bind(alexa, device, n));
        }
        devset('doNotDisturb', false, device.setDoNotDisturb);

        if (device.capabilities.includes('TUNE_IN')) {
            //devset('TuneIn', "");
            // if (st) st.func = function (query, device, id) {
            //     if (!device) return;
            //     alexa.tuneinSearch(query, function(err, res) {
            //         setRequestResult(err, res);
            //          if (err || !res || !Array.isArray(res.browseList)) return;
            //          let station = res.browseList[0];
            //          device.setTunein(station.id, station.contentType);
            //          devices.root.setAndUpdate(id, { val: station.name, ack: true });
            //     })
            //
            // }

            devset('TuneIn', "", function (query) {
                let id = dev.getFullId('TuneIn');
                alexa.tuneinSearch(query, function(err, res) {
                    setRequestResult(err, res);
                    if (err || !res || !Array.isArray(res.browseList)) return;
                    let station = res.browseList[0];
                    try {
                        device.setTunein (station.id, station.contentType);
                        devices.root.setAndUpdate (id, {val: station.name, ack: true});
                    } catch(e) {
                    }
                })
            })
        }
    });
    devices.update();
    this.updateStates(callback);
};

Alexa.prototype.test = function (callback) {
    let o = {
        accountName: oo.accountName += '1',
    };
    let flags = {
        method: 'PUT',
        data: JSON.stringify (o),
    };

    this.httpsGet ('https://alexa.amazon.de/api/devices-v2/device',
        function (err, res) {
            res = res;
        },
        flags
    );
};


function main() {

    normalizeConfig(adapter.config);

    alexa = new Alexa();
    alexa.init({
            cookie: adapter.config.cookie,
            bluetooth: true,
            notifications: true

        },
        function () {

            if (0) alexa.test(function (err, res) {
                    res = res;
                }
            );

            alexa.createStates(function () {
                alexa.createSmarthomeStates(function () {
                    adapter.subscribeStates ('*');
                    adapter.subscribeObjects ('*');
                });
            });
        }
    )
}


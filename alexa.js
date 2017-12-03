"use strict";

const
    soef = require('soef'),
    Alexa = require('alexa-remote')
;

let alexa;
const
    SMART_HOME_DEVICES = 'smart-home-devices',
    ECHO_DEVICES = 'echo-devices',

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
    }
;

let adapter = soef.Adapter(
    main,
    onStateChange,
    onObjectChange,
    onUnload,
    onUpdate,
    'alexa'
);

function onUnload(callback) {
    callback && callback();
}

function onUpdate(prevVersion ,aktVersion, callback) {
    if (prevVersion < 23) {
        return removeAllObjects(adapter, callback);
    }
    callback();
}

function onStateChange(id, state) {
    let ar, [a, inst, dummy, deviceId, channel, subChannel] = ar = id.split('.');
    let func = devices.get(id.substr(8)).func;

    if (typeof func === 'function') func(state.val);

    // switch(channel) {
    //     case 'Bluetooth':
    //         if (typeof func === 'function') func(ar[6] === 'connect');
    //         break;
    //     default:
    //         if (typeof func === 'function') func(state.val);
    //         break;
    // }
}

function onObjectChange(id, object) {
    let ar = id.split('.');
    if (ar[2] === ECHO_DEVICES) {
        let device = alexa.serialNumbers[ar[3]];
        if (object && object.common && object.common.name) {
            device.rename (object.common.name);
        }
        return;
    }
    if (ar[2] === SMART_HOME_DEVICES) {
    }
}

function normalizeConfig(config) {
}

function setRequestResult(err, res) {
    if (!err) return;
    devices.root.setAndUpdate('requestResult', err);
}


Alexa.prototype.updateStates = function (callback) {
    let self = this, i = 0;
    let dev = new devices.CDevice ('', '');

    (function doIt() {
        if (i >= self.devices.length) {
            return devices.update( () => {
                self.updateHistory(callback);
            });
        }
        let device = self.devices[i++];
        dev.setDeviceEx(ECHO_DEVICES + '\\.'+device.serialNumber, device.accountName);
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

Alexa.prototype.delayedCreateSmarthomeStates = function (delay, callback) {
    setTimeout(this.createSmarthomeStates.bind(this, callback), delay);
};

Alexa.prototype.createSmarthomeStates = function (callback) {
    this.getSmarthomeDevices((err, res) => {
        if (err || !res) return callback(err);
        let dev = new devices.CDevice(SMART_HOME_DEVICES, { type: 'device', common: { name: 'Smart Home Devices', role: 'device' }});

        dev.setf('deleteAll', { val: false, common: { role: 'button'}}, (val) => {
            this.deleteAllSmarthomeDevices((err, res) => {
                adapter.deleteDevice(SMART_HOME_DEVICES, () => {
                    this.delayedCreateSmarthomeStates(1000);
                });
            });
        });
        dev.setf('discoverDevices', { val: false, common: { name: 'Let Alexa search for devices', role: 'button'}}, (val) => {
            this.discoverSmarthomeDevice((err, res) => {
                this.delayedCreateSmarthomeStates();
            });
        });

        let all = soef.getProp (res, 'locationDetails.Default_Location.amazonBridgeDetails.amazonBridgeDetails') || [];
        let k = Object.keys(all);
        for (let i of k) {
            for (let n of Object.keys(all[i].applianceDetails.applianceDetails)) {
                let skill = all[i].applianceDetails.applianceDetails[n];
                dev.setChannel(skill.entityId, {
                    type: 'channel',
                    common: {
                        name: skill.modelName,
                        role: 'channel'
                    },
                    native: {
                        friendlyDescription: skill.friendlyDescription,
                        friendlyName: skill.friendlyName,
                        ids:  skill.additionalApplianceDetails.additionalApplianceDetails.ids,
                        object: n,
                        manufacturerName: skill.manufacturerName,
                    }
                });
                dev.set('', { val: skill.isEnabled, type: 'channel' });
                dev.set('isEnabled', skill.isEnabled);
                dev.setf('delete', { val: false, common: { role: 'button'}}, function (id, val) {
                    this.deleteSmarthomeDevice(n);
                    adapter.deleteChannel(SMART_HOME_DEVICES, id);
                }.bind(this, skill.entityId));
            }
        }
        devices.update(callback);
    })
};

Alexa.prototype.updateHistory = function (callback) {
    this.getHistory( { size: 3, filter: true }, function (err, res) {
        if (err || !res) return callback && callback();
        let dev = new devices.CDevice('history');
        dev.force = true;
        let i = res.length - 1;

        (function doIt() {
            if (i < 0) return callback && callback();

            let o = res[i--];
            let last = dev.get ('creationTime');
            if (last && last.val >= o.data.creationTimestamp) return doIt();

            dev.set ('name', o.name);
            dev.set ('creationTime', o.data.creationTimestamp);
            dev.set ('serialNumber', o.serialNumber);
            dev.set ('summary', o.description.summary);
            //dev.set ('json', { name: o.name, serialNumber: o.serialNumber, summary: o.description.summary});
            devices.update (doIt);
        })()
    })
};


Alexa.prototype.createStates = function (callback) {

    let dev = new devices.CDevice(ECHO_DEVICES, 'Echo devices');

    let devset = dev.setf.bind(dev);
    // function devset(name, obj, func) {
    //     let st = dev.oset(name, obj);
    //     if (st) st.func = func;
    // }

    Object.keys (this.serialNumbers).forEach ((n) => {
        let device = this.serialNumbers[n];
        dev.setDeviceEx(ECHO_DEVICES + '\\.'+device.serialNumber, device._name);

        dev.set('', device.online ? 'Online' : 'offline');
        dev.set('.requestResult', { val: '', common: { name: 'Request Result', write: false }});

        dev.setChannel('States');
        dev.set('capabilities', device.capabilities.join(','));

        if (device.bluetoothState) {
            device.bluetoothState.pairedDeviceList.forEach((bt) => {
                dev.setChannel('Bluetooth.' + bt.address, bt.friendlyName);
                devset('connected', false, bt.connect);
                devset('unpaire', { val: false, common: { role: 'button' }}, bt.unpaire);
                //devset('connect', { val: false, common: { role: 'button'}}, bt.connect);
                //devset('disconnect', { val: false, common: { role: 'button'}}, bt.connect);
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

    dev.setDevice('history', { common: { name: 'Last detected commands and devices'}});
    devset('#trigger', { val: false, common: { role: 'button', name: 'Trigger/Rescan', desc: 'Set to true, to start a request'}}, function(val) {
         this.updateHistory();
    }.bind(this));
    dev.set('name', { val: '', common: { write: false, name: 'Echo Device name', desc: 'Device name of the last detected command'}});
    //dev.createNew('creationTime', alexa.now());
    dev.set('creationTime', alexa.now());
    dev.set('serialNumber', { val: '', common: { write: false}});
    //dev.set('json', { val: {}, common: { write: false}});
    dev.set('summary', { val: '', common: { write: false}});

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

    devices.CDevice.prototype.setf = function (name, obj, func) {
        let st = this.oset(name, obj);
        if (st) st.func = func;
        return st;
    };

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


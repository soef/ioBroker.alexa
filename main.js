/* jshint -W097 */
/* jshint -W030 */
/* jshint strict: false */
/* jslint node: true */
/* jslint esversion: 6 */
"use strict";

const Alexa = require('alexa-remote2');
const path = require('path');
const utils = require(path.join(__dirname, 'lib', 'utils')); // Get common adapter utils

let alexa;

const playerControls = {
    play: { val: false, common: { role: 'button.play'}},
    pause:{ val: false, common: { role: 'button.pause'}},
    volume: { val: 0, common: { role: 'level.volume', min: 0, max: 100}}
};
const musicControls = {
    next: { val: false, common: { role: 'button.next'}},
    previous: { val: false, common: { role: 'button.prev'}},
    forward: { val: false, common: { role: 'button.forward'}},
    rewind: { val: false, common: { role: 'button.reverse'}},
    shuffle: { val: false, common: { role: 'media.mode.shuffle'}},
    repeat: { val: false, common: { role: 'media.mode.repeat'}},
};

const commands = {
    weather: { val: false, common: { role: 'button'}},
    traffic: { val: false, common: { role: 'button'}},
    flashbriefing: { val: false, common: { role: 'button'}},
    goodmorning: { val: false, common: { role: 'button'}},
    singasong: { val: false, common: { role: 'button'}},
    tellstory: { val: false, common: { role: 'button'}},
    speak: { val: '', common: { role: 'media.tts'}}
};

let updateStateTimer;
let updateHistoryTimer;

const stateChangeTrigger = {};
const objectQueue = [];
const lastPlayerState = {};

function setOrUpdateObject(id, obj, value, stateChangeCallback, createNow) {
    let callback = null;
    if (typeof value === 'function') {
        createNow = stateChangeCallback;
        stateChangeCallback = value;
        value = null;
    }
    if (typeof createNow === 'function') {
        callback = createNow;
        createNow = true;
    }

    if (! obj.type) {
        obj.type = 'state';
    }
    if (! obj.common) {
        obj.common = {};
    }
    if (! obj.native) {
        obj.native = {};
    }
    if (obj.common && obj.common.type === undefined) {
        if (value !== null && value !== undefined) {
            obj.common.type = typeof value;
        }
        else if (obj.common.def !== undefined) {
            obj.common.type = typeof obj.common.def;
        }
        else {
            obj.common.type = 'mixed';
        }
    }
    if (obj.common && obj.common.read === undefined) {
        obj.common.read = !(obj.common.type === 'boolean' && !!stateChangeCallback);
    }
    if (obj.common && obj.common.write === undefined) {
        obj.common.write = !!stateChangeCallback;
    }
    if (obj.common && obj.common.def === undefined && value !== null && value !== undefined) {
        obj.common.def = value;
    }
    if (obj.common && obj.common.name === undefined) {
        obj.common.name = id.split('.').pop();
    }

    objectQueue.push({
        id: id,
        value: value,
        obj: obj,
        stateChangeCallback: stateChangeCallback
    });

    if (createNow) {
        processObjectQueue(callback);
    }
}

function processObjectQueue(callback) {
    if (!objectQueue.length) {
        callback && callback();
        return;
    }

    function handleObject(queueEntry, callback) {
        if (!queueEntry.obj) {
            handleValue(queueEntry, () => {
                return callback && callback();
            });
        }
        adapter.getObject(queueEntry.id, (err, obj) => {
            if (!err && obj) {
                adapter.extendObject(queueEntry.id, queueEntry.obj, () => {
                    handleValue(queueEntry, () => {
                        return callback && callback();
                    });
                });
            }
            else {
                adapter.setObject(queueEntry.id, queueEntry.obj, () => {
                    stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
                    return callback && callback();
                });
            }
        });
    }

    function handleValue(queueEntry, callback) {
        if (queueEntry.value === null || queueEntry.value === undefined) {
            stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
            return callback && callback();
        }
        adapter.setState(queueEntry.id, queueEntry.value, true, () => {
            stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
            return callback && callback();
        });
    }

    const queueEntry = objectQueue.shift();
    handleObject(queueEntry, () => {
        return processObjectQueue(callback);
    });
}

const adapter = utils.Adapter('alexa2');

adapter.on('unload', (callback) => {
    callback && callback();
});

adapter.on('stateChange', (id, state) => {
    adapter.log.debug('State changed ' + id + ': ' + JSON.stringify(state));
    if (!state || state.ack) return;
    id = id.substr(adapter.namespace.length + 1);

    if (typeof stateChangeTrigger[id] === 'function') stateChangeTrigger[id](state.val);

    scheduleStatesUpdate(3000);
});

adapter.on('objectChange', (id, object) => {
    adapter.log.debug('Object changed ' + id + ': ' + JSON.stringify(object));
    let ar = id.split('.');
    if (ar[2] === 'echo-devices') {
        if (object === null) {
            //deleted, do nothing
            return;
        }
        let device = alexa.serialNumbers[ar[3]];
        if (object && object.common && object.common.name) {
            if (typeof device.rename === 'function') device.rename(object.common.name);
        }
        return;
    }
    if (ar[2] === 'smart-home-devices') {
    }
});

adapter.on('ready', function (obj) {
    adapter.getForeignObject('system.config', (err, obj) => {
        if (obj && obj.native && obj.native.secret) {
            //noinspection JSUnresolvedVariable
            adapter.config.email = decrypt(obj.native.secret, adapter.config.email);
            adapter.config.password = decrypt(obj.native.secret, adapter.config.password);
        } else {
            //noinspection JSUnresolvedVariable
            adapter.config.email = decrypt('Zgfr56gFe87jJOM', adapter.config.email);
            adapter.config.password = decrypt('Zgfr56gFe87jJOM', adapter.config.password);
        }
        main();
    });
});

process.on('SIGINT', () => {
});

process.on('SIGTERM', () => {
});

process.on('uncaughtException', err => {
    if (adapter && adapter.log) {
        adapter.log.warn('Exception: ' + err);
    }
});


function decrypt(key, value) {
    let result = '';
    for (let i = 0; i < value.length; ++i) {
        result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
    }
    return result;
}

function setRequestResult(err, res) {
    if (!err) return;
    adapter.setState('requestResult', err.message ? err.message : err, true);
}

/**
 * Konvertiert eine Sekundenzahl in einen String im Format (HH:)MM:SS
 *
 * @param integer sek
 * @return string
 */
function sec2HMS(sec) {
	if (sec  === 0) {
        return '0';
    }

    const sec_num = parseInt(sec, 10);
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (minutes < 10) {minutes = "0" + minutes;}
    if (seconds < 10) {seconds = "0" + seconds;}
    if (hours === 0) {
        return minutes + ':' + seconds;
    }

    if (hours < 10) {hours = "0" + hours;}
    return hours + ':' + minutes + ':' + seconds;
}

function scheduleStatesUpdate(delay) {
    if (delay === undefined) delay = adapter.config.updateStateInterval * 1000;
    if (updateStateTimer) {
        clearTimeout(updateStateTimer);
    }
    updateStateTimer = setTimeout(() => {
        updateStateTimer = null;
        alexa.updateStates();
    }, delay);
}

Alexa.prototype.updateStates = function (callback) {
    if (!this.devices || !this.devices.length) return callback && callback();
    let self = this;
    let i = 0;

    if (updateStateTimer) {
        clearTimeout(updateStateTimer);
        updateStateTimer = null;
    }

    (function doIt() {
        if (i >= self.devices.length) {
            if (adapter.config.updateStateInterval > 0) {
                scheduleStatesUpdate();
            }
            return callback && callback();
        }
        let device = self.devices[i++];
        if (!device.isControllable) return doIt();

        self.getPlayerInfo(device , function(err, resPlayer) {
            if (err || !resPlayer || !resPlayer.playerInfo) return doIt();
            self.getMedia(device, function(err, resMedia) {
                if (err || !resMedia) return doIt();
                let devId = 'echo-devices.' + device.serialNumber;
                if (lastPlayerState[device.serialNumber] && lastPlayerState[device.serialNumber].timeout) {
                    clearTimeout(lastPlayerState[device.serialNumber].timeout);
                }
                lastPlayerState[device.serialNumber] = {resPlayer: resPlayer, ts: Date.now(), devId: devId, timeout: null};
                if (resPlayer.playerInfo.volume) {
                    adapter.setState(devId + '.Player-Controls.volume', ~~resPlayer.playerInfo.volume.volume, true);
                    if (resMedia.shuffling !== undefined) adapter.setState(devId + '.Player-Controls.shuffle', resMedia.shuffling, true);
                    if (resMedia.looping !== undefined) adapter.setState(devId + '.Player-Controls.repeat', resMedia.looping, true);
                    //let muted = res.playerInfo.volume.muted;
                }
                adapter.setState(devId + '.Player-Controls.pause', (resPlayer.playerInfo.state === 'PAUSED'), true);
                adapter.setState(devId + '.Player-Controls.play', (resPlayer.playerInfo.state === 'PLAYING'), true);

                //if (resPlayer.playerInfo.state !== null) adapter.setState(devId + '.Player-Info.status', resPlayer.playerInfo.state, true);
                adapter.setState(devId + '.Player-Info.contentType', resMedia.contentType || '', true);	// 'LIVE_STATION' | 'TRACKS' | 'CUSTOM_STATION'
    			adapter.setState(devId + '.Player-Info.currentState', resPlayer.playerInfo.state || '', true);	// 'PAUSED' | 'PLAYING'
    			adapter.setState(devId + '.Player-Info.imageURL', resMedia.imageURL || '', true);
    			adapter.setState(devId + '.Player-Info.muted', !!resMedia.muted || '', true);
    			adapter.setState(devId + '.Player-Info.providerId', resMedia.providerId || '', true); // 'TUNE_IN' | 'CLOUD_PLAYER' | 'ROBIN'
    			adapter.setState(devId + '.Player-Info.radioStationId', resMedia.radioStationId || '', true); // 's24885' | null
    			adapter.setState(devId + '.Player-Info.service', resMedia.service || '', true); // 'TUNE_IN' | 'CLOUD_PLAYER' | 'PRIME_STATION'

    			let providerName = '';
    			if (resPlayer.playerInfo !== undefined && 'provider' in resPlayer.playerInfo && resPlayer.playerInfo.provider !== null) {
    				providerName = resPlayer.playerInfo.provider.providerName;
    			}
    			adapter.setState(devId + '.Player-Info.providerName', providerName || '',	true); // 'Amazon Music' | 'TuneIn Live-Radio'

    			let title = '';
    			let artist = '';
    			let album = '';
    			if (resPlayer.playerInfo !== undefined && 'infoText' in resPlayer.playerInfo && resPlayer.playerInfo.infoText !== null) {
    				title = resPlayer.playerInfo.infoText.title;
    				artist = resPlayer.playerInfo.infoText.subText1;
    				album = resPlayer.playerInfo.infoText.subText2;
    			}
    			adapter.setState(devId + '.Player-Info.currentTitle', title || '', true);
    			adapter.setState(devId + '.Player-Info.currentArtist', artist || '', true);
    			adapter.setState(devId + '.Player-Info.currentAlbum', album || '', true);

    			let mainArtUrl = '';
    			if (resPlayer.playerInfo !== undefined && 'mainArt' in resPlayer.playerInfo && resPlayer.playerInfo.mainArt !== null) {
    				mainArtUrl = resPlayer.playerInfo.mainArt.url;
    			}
    			adapter.setState(devId + '.Player-Info.mainArtUrl', mainArtUrl || '', true);

    			let miniArtUrl = '';
    			if (resPlayer.playerInfo !== undefined && 'miniArt' in resPlayer.playerInfo && resPlayer.playerInfo.miniArt !== null) {
    				miniArtUrl = resPlayer.playerInfo.miniArt.url;
    			}
    			adapter.setState(devId + '.Player-Info.miniArtUrl', miniArtUrl || '', true);

    			let mediaLength = 0;
    			let mediaProgress = 0;
    			let mediaProgressPercent = 0;
    			if (resPlayer.playerInfo !== undefined && 'progress' in resPlayer.playerInfo && resPlayer.playerInfo.progress !== null) {
    				mediaLength = parseInt(resPlayer.playerInfo.progress.mediaLength, 10);
    				mediaProgress = parseInt(resPlayer.playerInfo.progress.mediaProgress, 10);
    				if (mediaLength > 0) {
    					mediaProgressPercent = Math.round(((mediaProgress * 100) / mediaLength));
    				}
    			}
    			adapter.setState(devId + '.Player-Info.mediaLength', mediaLength || '', true);
    			adapter.setState(devId + '.Player-Info.mediaLengthStr',	sec2HMS(mediaLength) || '', true);
    			adapter.setState(devId + '.Player-Info.mediaProgress', mediaProgress || 0, true);
    			adapter.setState(devId + '.Player-Info.mediaProgressStr', sec2HMS(mediaProgress) || 0, true);
    			adapter.setState(devId + '.Player-Info.mediaProgressPercent', mediaProgressPercent || 0, true);

                if (resPlayer.playerInfo.state === 'PLAYING') {
                    lastPlayerState[device.serialNumber].timeout = setTimeout( () => {
                        lastPlayerState[device.serialNumber].timeout = null;
                        updateMediaProgress(device.serialNumber);
                    }, 2000);
                }
                doIt();
            });
        });
    })();
};

/**
 * Inkrementiert "mediaProgress" alle 2 Sekunden um 2. So wird ein permanentes https-get überflüssig
 * ruft sich nach 2 Sekunden erneut selbst auf, wenn "currentState" noch auf "PLAYING" steht.
 * ist "mediaProgress" größer als "mediaLength", so ist der Song zu Ende und "updateDevice" wird aufgerufen.
 *
 * @param string deviceDpName
 */
function updateMediaProgress(serialNumber) {
    if (!lastPlayerState[serialNumber] || !lastPlayerState[serialNumber].resPlayer) return;

    if (lastPlayerState[serialNumber].timeout) {
        clearTimeout(lastPlayerState[serialNumber].timeout);
        lastPlayerState[serialNumber].timeout = null;
    }

    let resPlayer = lastPlayerState[serialNumber].resPlayer;
    let devId = lastPlayerState[serialNumber].devId;
    let lastTimestamp = lastPlayerState[serialNumber].ts;

	let currentState = resPlayer.playerInfo.state;
	let mediaProgress = parseInt(resPlayer.playerInfo.progress.mediaProgress, 10);
	let mediaLength = parseInt(resPlayer.playerInfo.progress.mediaLength, 10);

	if (currentState == 'PLAYING') {
        let timeframe = ~~((Date.now() - lastTimestamp) / 1000); // calculae time since last data
		let mediaProgressNew = mediaProgress + timeframe; // add this to the progress

		// Am Ende des Titels soll neu geladen werden. Ist es Radio (länge = 0) dann alle 200 sekunden
		if (mediaProgressNew > mediaLength && (mediaLength > 0 || mediaProgressNew % 200 < 2)) {
			scheduleStatesUpdate(2000);
            return;
		}

		// Nun mediaProgress und mediaProgressPercent neu berechnen
        let mediaProgressPercent = 0;
        if (mediaLength > 0) {
			mediaProgressPercent = Math.round((((mediaProgressNew) * 100) / mediaLength));
		}
		adapter.setState(devId + '.Player-Info.mediaProgressPercent', mediaProgressPercent, true);
		adapter.setState(devId + '.Player-Info.mediaProgress', mediaProgressNew, true);
		adapter.setState(devId + '.Player-Info.mediaProgressStr', sec2HMS(mediaProgressNew), true);

        lastPlayerState[serialNumber].timeout = setTimeout( () => {
            lastPlayerState[serialNumber].timeout = null;
            updateMediaProgress(serialNumber);
        }, 2000);
	}
}


Alexa.prototype.delayedCreateSmarthomeStates = function (delay, callback) {
    setTimeout(this.createSmarthomeStates.bind(this, callback), delay);
};

Alexa.prototype.createSmarthomeStates = function (callback) {
    this.getSmarthomeDevices((err, res) => {
        if (err || !res) return callback(err);
        setOrUpdateObject('smart-home-devices', {type: 'device', common: {name: 'Smart Home Devices'}});

        setOrUpdateObject('smart-home-devices.deleteAll', {common: {role: 'button'}}, false, (val) => {
            this.deleteAllSmarthomeDevices((err, res) => {
                adapter.deleteDevice('smart-home-devices', () => {
                    this.delayedCreateSmarthomeStates(1000);
                });
            });
        });
        setOrUpdateObject('smart-home-devices.discoverDevices', {common: {name: 'Let Alexa search for devices', role: 'button'}}, false, (val) => {
            this.discoverSmarthomeDevice((err, res) => {
                this.delayedCreateSmarthomeStates(0);
            });
        });

        let all = [];
        if (
            res &&
            res.locationDetails &&
            res.locationDetails.Default_Location &&
            res.locationDetails.Default_Location.amazonBridgeDetails &&
            res.locationDetails.Default_Location.amazonBridgeDetails.amazonBridgeDetails
        ) {
            all = res.locationDetails.Default_Location.amazonBridgeDetails.amazonBridgeDetails;
        }
        let k = Object.keys(all);
        for (let i of k) {
            for (let n of Object.keys(all[i].applianceDetails.applianceDetails)) {
                let skill = all[i].applianceDetails.applianceDetails[n];
                setOrUpdateObject('smart-home-devices.' + skill.entityId, {
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
                setOrUpdateObject('smart-home-devices.' + skill.entityId + '.isEnabled', {common: {role: 'indicator', write: false}}, skill.isEnabled);
                setOrUpdateObject('smart-home-devices.' + skill.entityId + '.delete', {common: {role: 'button'}}, false, function (entityId, val) {
                    this.deleteSmarthomeDevice(n);
                    adapter.deleteChannel('smart-home-devices', entityId);
                }.bind(this, skill.entityId));
            }
        }
        processObjectQueue(callback);
    });
};

function scheduleHistoryUpdate(delay) {
    if (delay === undefined) delay = adapter.config.updateHistoryInterval * 1000;
    if (updateHistoryTimer) {
        clearTimeout(updateHistoryTimer);
    }
    updateHistoryTimer = setTimeout(() => {
        updateHistoryTimer = null;
        alexa.updateHistory();
    }, delay);
}

Alexa.prototype.updateHistory = function (callback) {
    if (updateHistoryTimer) {
        clearTimeout(updateHistoryTimer);
        updateHistoryTimer = null;
    }
    this.getHistory({size: 3, filter: true}, function (err, res) {
        if (err || !res) {
            if (adapter.config.updateHistoryInterval > 0) {
                scheduleHistoryUpdate();
            }
            return callback && callback();
        }

        adapter.getState('history.creationTime', (err, state) => {
            if (err || !state) {
                if (adapter.config.updateHistoryInterval > 0) {
                    scheduleHistoryUpdate();
                }
                return callback && callback();
            }

            let last = state.val;
            let i = res.length - 1;
            (function doIt() {
                if (i < 0) {
                    if (adapter.config.updateHistoryInterval > 0) {
                        scheduleHistoryUpdate();
                    }
                    return callback && callback();
                }

                let o = res[i--];
                if (last >= o.data.creationTimestamp) return doIt();

                adapter.setState('history.name', o.name, true);
                adapter.setState('history.creationTime', o.data.creationTimestamp, true);
                adapter.setState('history.serialNumber', o.serialNumber, true);
                adapter.setState('history.summary', o.description.summary, true);
                last = o.data.creationTimestamp;
                doIt();
            })();
        });
    });
};

Alexa.prototype.createStates = function (callback) {

    let self = this;
    setOrUpdateObject('requestResult', {common: {name: 'Request Result', write: false, role: 'text'}}, '');
    setOrUpdateObject('echo-devices', {type: 'device', common: {name: 'Echo devices'}});

    Object.keys (this.serialNumbers).forEach ((n) => {
        let device = this.serialNumbers[n];
        let devId = 'echo-devices.' + device.serialNumber;
        setOrUpdateObject(devId, {type: 'device', common: {name: device._name}});
        //dev.setName(device.accountName); TODO
        setOrUpdateObject(devId + '.online', {common: {role: 'indicator.connected'}}, device.online);
        //setOrUpdateObject(devId + '.delete', {common: {name: 'Delete (Log out of this device)', role: 'button'}}, false); TODO

        setOrUpdateObject(devId + '.Info', {type: 'channel'});
        setOrUpdateObject(devId + '.Info.capabilities', {common: {role: 'text', write: false}}, device.capabilities.join (','));

        if (device.isControllable) {
            setOrUpdateObject(devId + '.Player-Info', {type: 'channel'});
            //setOrUpdateObject(devId + '.Player-Info.status', {common: {role: 'text', write: false, def: ''}});

            setOrUpdateObject(devId + '.Player-Info.contentType', {common: {role: 'text', write: false, def: ''}});	// 'LIVE_STATION' | 'TRACKS' | 'CUSTOM_STATION'
			setOrUpdateObject(devId + '.Player-Info.currentState', {common: {role: 'text', write: false, def: ''}}); // 'PAUSED' | 'PLAYING'
            //TODO SONDERLOGIK!!!! createDeviceControlState
			setOrUpdateObject(devId + '.Player-Info.imageURL', {common: {name: 'Huge image', role: 'media.cover', write: false, def: ''}});
			setOrUpdateObject(devId + '.Player-Info.muted',	{common: {type: 'boolean', role: 'media.mute', write: false, def: false}});
			setOrUpdateObject(devId + '.Player-Info.providerId', {common: {role: 'text', write: false, def: ''}}); // 'TUNE_IN' | 'CLOUD_PLAYER' | 'ROBIN'
			setOrUpdateObject(devId + '.Player-Info.radioStationId', {common: {role: 'text', write: false, def: ''}}); // 's24885' | null
			setOrUpdateObject(devId + '.Player-Info.service', {common: {role: 'text', write: false, def: ''}}); // 'TUNE_IN' | 'CLOUD_PLAYER' | 'PRIME_STATION'
			setOrUpdateObject(devId + '.Player-Info.providerName', {common: {name: 'active provider', role: 'text', write: false, def: ''}}); // 'Amazon Music' | 'TuneIn Live-Radio'

			setOrUpdateObject(devId + '.Player-Info.currentTitle', {common: {name:'current title', type:'string', role:'media.title', def: ''}});
			setOrUpdateObject(devId + '.Player-Info.currentArtist', {common: {name:'current artist', type:'string', role:'media.artist', def: ''}});
			setOrUpdateObject(devId + '.Player-Info.currentAlbum',	{common: {name:'current album', type:'string', role:'media.album', def: ''}});
            setOrUpdateObject(devId + '.Player-Info.mainArtUrl', {common: {name:'current main Art', type:'string', role:'media.cover', def: ''}});
            setOrUpdateObject(devId + '.Player-Info.miniArtUrl', {common: {name:'current mini Art', type:'string', role:'media.cover', def: ''}});

			setOrUpdateObject(devId + '.Player-Info.mediaLength', {common: {name:'active media length', type:'number', role:'media.duration', def: 0}});
			setOrUpdateObject(devId + '.Player-Info.mediaLengthStr', {common: {name:'active media length as (HH:)MM:SS', type:'string', role:'media.duration.text', def: ''}});
			setOrUpdateObject(devId + '.Player-Info.mediaProgress',	 {common: {name:'active media progress', type:'number', role:'media.elapsed', def: 0}});
			setOrUpdateObject(devId + '.Player-Info.mediaProgressStr', {common: {name:'active media progress as (HH:)MM:SS', type:'string', role:'media.elapsed.text', def: ''}});
			setOrUpdateObject(devId + '.Player-Info.mediaProgressPercent', {common: {name:'active media progress as percent', type:'number', role:'media.elapsed.percent', def: 0}});

            setOrUpdateObject(devId + '.Player-Controls', {type: 'channel'});
            for (let c in playerControls) {
                const obj = JSON.parse (JSON.stringify (playerControls[c]));
                setOrUpdateObject(devId + '.Player-Controls.' + c, {common: obj.common}, obj.val, alexa.sendCommand.bind(alexa, device, c));
            }
            if (device.hasMusicPlayer) {
                for (let c in musicControls) {
                    const obj = JSON.parse (JSON.stringify (musicControls[c]));
                    setOrUpdateObject(devId + '.Player-Controls.' + c, {common: obj.common}, obj.val, alexa.sendCommand.bind(alexa, device, c));
                }
            }

            if (device.capabilities.includes ('TUNE_IN')) {
                setOrUpdateObject(devId + '.Player-Controls.TuneIn', {common: {role: 'text'}}, '', function (device, query) {
                    if (query.match(/^s[0-9]{4,6}$/)) {
                        device.setTunein(query, 'station', (err, ret) => {
                            if (!err) adapter.setState(devId + '.Player-Controls.TuneIn', query, true);
                        });
                        return;
                    }
                    else {
                        this.tuneinSearch(query, function (err, res) {
                            setRequestResult(err, res);
                            if (err || !res || !Array.isArray (res.browseList)) return;
                            let station = res.browseList[0];
                            device.setTunein(station.id, station.contentType, (err, ret) => {
                                if (!err) adapter.setState('echo-devices.' + device.serialNumber + '.Player-Controls.TuneIn', station.name, true);
                            });
                        });
                    }
                }.bind(alexa, device));
            }
        }
        if (device.bluetoothState) {
            setOrUpdateObject(devId + '.Bluetooth', {type: 'device'});
            device.bluetoothState.pairedDeviceList.forEach ((bt) => {
                setOrUpdateObject(devId + '.Bluetooth.' + bt.address, {type: 'channel', common: {name: bt.friendlyName}});
                setOrUpdateObject(devId + '.Bluetooth.' + bt.address + '.connected', {common: {role: 'switch'}}, bt.connected, bt.connect);
                setOrUpdateObject(devId + '.Bluetooth.' + bt.address + '.unpaire', {common: {role: 'button'}}, false, bt.unpaire);
            });
        }

        if (device.notifications) {
            setOrUpdateObject(devId + '.Notifications', {type: 'channel'});
            for (let noti of device.notifications) {
                if (noti.originalTime) {
                    let ar = noti.originalTime.split (':');
                    ar.length = 2;
                    let s = ar.join (':');
                    setOrUpdateObject(devId + '.Notifications.' + s, {common: {type: 'mixed', role: 'state', name: `Type=${noti.type}`}}, (noti.status === 'ON'), noti.set);
                }
            }
        }

        setOrUpdateObject(devId + '.Commands', {type: 'channel'});
        for (let c in commands) {
            const obj = JSON.parse (JSON.stringify (commands[c]));
            setOrUpdateObject(devId + '.Commands.' + c, {common: obj.common}, obj.val, alexa.sendSequenceCommand.bind(alexa, device, c));
        }
        setOrUpdateObject(devId + '.Commands.doNotDisturb', {common: {role: 'switch'}}, false, device.setDoNotDisturb);

        if (this.routines) {
            setOrUpdateObject(devId + '.Routines', {type: 'channel'});
            for (let i in this.routines) {
                setOrUpdateObject(devId + '.Routines.' + this.routines[i].friendlyAutomationId, {common: { type: 'boolean', role: 'button', name: this.routines[i].friendlyName}}, false, alexa.executeAutomationRoutine.bind (alexa, device, this.routines[i].automationId));
            }
        }
    });

    setOrUpdateObject('history', {common: {name: 'Last detected commands and devices'}});
    setOrUpdateObject('history.#trigger', {common: {role: 'button', name: 'Trigger/Rescan', desc: 'Set to true, to start a request'}}, false, function(val) {
        this.updateHistory();
    }.bind(this));
    setOrUpdateObject('history.name', {common: {role: 'text', write: false, name: 'Echo Device name', desc: 'Device name of the last detected command'}}, '');
    let now = new Date();
    now = now.getTime() - now.getTimezoneOffset();
    setOrUpdateObject('history.creationTime', {common: {role: 'value.time'}}, now);
    setOrUpdateObject('history.serialNumber', {common: {role: 'text', write: false}}, '');
    setOrUpdateObject('history.summary', {common: {role: 'text', write: false}}, '');

    processObjectQueue(() => {
        self.updateStates(() => {
            self.updateHistory(callback);
        });
    });
};

function main() {

    let options = {
        cookie: adapter.config.cookie, // cookie if there is already one
        email: adapter.config.email, // Amazon email for login
        password: adapter.config.password, // Amazon password for Login
        bluetooth: true, // fetch uetooth devices
        notifications: false, // fetch notifications (false because not works so far)
        userAgent: adapter.config.userAgent, // overwrite userAgent
        acceptLanguage: adapter.config.acceptLanguage, // overwrite acceptLanguage
        amazonPage: adapter.config.cookieLoginUrl, // overwrite amazonPage
        alexaServiceHost: adapter.config.alexaServiceHost, // overwrite alexa Servcie Host
        logger: adapter.log.debug, // Logger with detailed debug only in debug
        setupProxy: true,          // optional: should the library setup a proxy to get cookie when automatic way did not worked? Default false!
        proxyOwnIp: adapter.config.proxyOwnIp, // required if proxy enabled: provide own IP or hostname to later access the proxy. needed to setup all rewriting and proxy stuff internally
        proxyPort: adapter.config.proxyPort,           // optional: use this port for the proxy, default is 0 means random port is selected
        proxyListenBind: adapter.config.proxyListenBind,// optional: set this to bind the proxy to a special IP, default is '0.0.0.0'
        proxyLogLevel: null      // optional: Loglevel of Proxy, default 'warn'
    };
    adapter.config.updateHistoryInterval = parseInt(adapter.config.updateHistoryInterval, 10);
    adapter.config.updateStateInterval = parseInt(adapter.config.updateStateInterval, 10);

    let initDone = false;

    alexa = new Alexa();
    alexa.init(options,
        function (err) {
            if (err) {
                if (err.message === 'no csrf found') {
                    adapter.log.error('Error: no csrf found. Check configuration of email/password or cookie');
                }
                else {
                    adapter.log.error('Error: ' + err.message);
                }
                adapter.setState('info.connection', false, true);
                return;
            }

            adapter.setState('info.connection', true, true);
            adapter.setState('info.cookie', alexa.cookie, true);
            adapter.setState('info.csrf', alexa.csrf, true);

            if (alexa.cookie !== adapter.config.cookie) {
                adapter.log.info('Update cookie in adapter configuration ... restarting ...');
                adapter.extendForeignObject("system.adapter." + adapter.namespace, {native: {cookie: alexa.cookie, csrf: alexa.csrf}});
                return;
            }

            alexa.createStates(function () {
                alexa.createSmarthomeStates(function () {
                    if (!initDone) {
                        adapter.subscribeStates ('*');
                        adapter.subscribeObjects ('*');
                        initDone = true;
                    }
                });
            });
        }
    );
}

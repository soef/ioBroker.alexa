![Logo](admin/alexa.png)

# ioBroker.alexa

<!-- -->
[![NPM version](https://img.shields.io/npm/v/iobroker.alexa.svg)](https://www.npmjs.com/package/iobroker.alexa)
[![Build Status](https://travis-ci.org/soef/ioBroker.alexa.svg?branch=master)](https://travis-ci.org/soef/ioBroker.alexa)
[![Build status](https://ci.appveyor.com/api/projects/status/c92hrxu79mvs1qxo?svg=true)](https://ci.appveyor.com/project/soef/iobroker-alexa)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/soef/iobroker.alexa/blob/master/LICENSE)
<!-- -->

## Early code version!!

This adapter allows you to remote control your Alexa (Amazon Echo) devices.

### States and their meanings:

In the adapter namespace (e.g. alexa.0) some channels are created

### alexa.0

| State name | meaning |
| - | - |
| echo-devices.* | States per Echo device, see below |
| history.* | Infos for command history, see below |
| smart-home-devices.* | States per smart home device and in general, see below |
| requestResult | Error info for TuneIn requests |


#### alexa.0.echo-devices.Serialnumber

| State name | meaning |
| - | - |
| Commands.Bluetooth.MAC.connected | Shows current connection status and allow connection (set to true) or disconnection (set to false) |
| Commands.Bluetooth.MAC.unpair | Button to unpair this device |
| Commands.TuneIn | text field to put in a Station name to play this station on this device |
| Commands.doNotDisturb | Switch to set the Do-Not-Disturb mode for this device |
| Commands.forward | Button to trigger player "forward" command (30s) |
| Commands.next | Button to trigger player "next" command |
| Commands.pause | Button to trigger player "pause" command |
| Commands.play | Button to trigger player "play" command |
| Commands.previous | Button to trigger player "previous" command |
| Commands.rewind | Button to trigger player "rewind" command (30s) |
| Commands.shuffle | Switch to enable or disable Shuffle mode for player |
| Commands.repeat | Switch to enable or disable Repeat mode for player |
| Commands.volume | 0..100 number value to set volume of the device to |
| Notifications.hh:ss | shows true/false if this notification slot is active or not, also allows to switch on/off (set true/false) or change time (set new time as value) |
| States.capabilities | shows the device capabilities as reported by Amazon |
| States.state | Player status --> move!! |
| delete | Button to log out of this device on Amazon side |

#### alexa.0.history

| State name | meaning |
| - | - |
| #trigger | Button to get new History (more current then timestamp in creationTime) |
| creationTime | only history entries are considered after this timestamp, updated with timestamp of selected record on update |
| name | Name of the device that got the request |
| serialNumber | serialnumber of the device that got the request |
| summary | text/summary/action received by the device |

#### alexa.0.smart-home-devices

| State name | meaning |
| - | - |
| UniqueId.delete | Button to delete this smart home device |
| UniqueId.isEnabled | indicator if the smart home device is enabled |
| deleteAll | Button to delete all smart home devices in Amazon |
| discoverDevices | Button to trigger discovering devices |

## Missing features
* also update bluetooth status in intervals AND on connect/disconnect/unpair?
* how to update initial status for volume, shuffle or repeat and doNotDisturb?! Or unneeded?
* also allow station-IDs in the TuneIn field
* add fields to show playing-info like JS version
* self deactivation if cookie/csrf invalid

## Installation
Execute the following command in the iobroker root directory (e.g. in /opt/iobroker)
```
npm install iobroker.alexa
```

## Changelog

### 0.1.x
* (Apollon77) 0.1.4: State changes are logged and only considered when ack=false!
* (Apollon77) 0.1.3: Corrected all roles, delete objects and start again!
* (Apollon77) 0.1.3: bluetooth connection status filled correctly initially
* (Apollon77) 0.1.2: Library fixes and updates
* (Apollon77) 0.1.1: Library fixes and updates

### 0.1.0 (2018-07-10)
* (Apollon77) get Adapter working again, especially getting cookie and optimize refresh

### 0.0.x
* soef versions

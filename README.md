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
| Bluetooth.MAC.connected | Shows current connection status and allow connection (set to true) or disconnection (set to false) |
| Bluetooth.MAC.unpair | Button to unpair this device |
| Player-Controls.TuneIn | text field to put in a Station name to play this station on this device |
| Player-Controls.forward | Button to trigger player "forward" command (30s) |
| Player-Controls.next | Button to trigger player "next" command |
| Player-Controls.pause | Button to trigger player "pause" command |
| Player-Controls.play | Button to trigger player "play" command |
| Player-Controls.previous | Button to trigger player "previous" command |
| Player-Controls.rewind | Button to trigger player "rewind" command (30s) |
| Player-Controls.shuffle | Switch to enable or disable Shuffle mode for player |
| Player-Controls.repeat | Switch to enable or disable Repeat mode for player |
| Player-Controls.volume | 0..100 number value to set volume of the device to |
| Player-Info.status | Player status |
| Info.capabilities | shows the device capabilities as reported by Amazon |
| Commands.doNotDisturb | Switch to set the Do-Not-Disturb mode for this device |
| Notifications.hh:ss | shows true/false if this notification slot is active or not, also allows to switch on/off (set true/false) or change time (set new time as value) |
| delete | Button to log out of this device on Amazon side |
| online | Info if the device is online or not |

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
Use the ioBroker "Install" options from GitHub or
execute the following command in the iobroker root directory (e.g. in /opt/iobroker)
```
npm install iobroker.alexa
iobroker upload alexa
```

Then go into ioBroker Admin and add an Alexa instance.

## Troubleshooting

### Problems with Cookie determination via E-Mail/Password
Sometimes Amazon has weired checks in place when they detect unexpected traffic on Login.
This can result in the problem that a captcha needs to be answered in order to login.
Mostly this captcha needs to be answered once and after this the login works without Captcha.

When you need to answer such a captcha then try to do the following:
* Use a common Browser (e.g. Chrome)
* disable Javascript!
* clear all cookies that may exist for Amazon or use Proivate/Incognito mode of the browser
* call https://alexa.amazon.de
* you should get a login form (normally displayed for older mobile browsers)
* login there with your Amazon credentials where the Echo/Alexa is registered in
* you may need to login twice or solve a Captcha
* At the end you should see "https://alexa.amazon.de/spa/index.html" as URL but without any real content (because JS is still disabled), BUT THIS IS COMPLETELY OK!!!!
* now try to get cookie again
* if it still not works do it again and check the User-Agent and accept-Language from your browser and use those in adapter on next try

Additionally the Accept-Language-Header (defaults to "de-DE") needs to match with your language/the browser language/the language of the amazon page you login.

You can also try to play around with the User-Agent and use one which more matches to the system type you use.
As example using "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" as User-Agent was reported as working better when ioBroker runs on a linux system.

You can override all those parameters in the adapter configuration.

### How to determine Cookie by my own?
If the automatic Cookie determination don't work or you do not trust the Adapter to give the Email/Password then you can determine the cookie by your own. There are several infos on the web how to do it. Here some links:

* https://www.gehrig.info/alexa/Alexa.html
* or use the shellscript from https://blog.loetzimmer.de/2017/10/amazon-alexa-hort-auf-die-shell-echo.html to get it on shell ...

But be aware: The Cookie will time out after several time and then the adapter will stop working and disable itself. You then need to manually get a new cookie!

## Changelog

### 0.1.x
* (Apollon77) 0.1.5: Adapter disables itself on error (no cookie/no csrf in cookie/captcha needed)
* (Apollon77) 0.1.5: Reorganized some states (delete object again please), add playerinfo section for later usage, hopefully fixed unplanned device renaming and other things
* (Apollon77) 0.1.5: Added adapter config options to overwrite used amazon-page, user-agent and accept-language for cookie determination and
* (Apollon77) 0.1.4: State changes are logged and only considered when ack=false!
* (Apollon77) 0.1.3: Corrected all roles, delete objects and start again!
* (Apollon77) 0.1.3: bluetooth connection status filled correctly initially
* (Apollon77) 0.1.2: Library fixes and updates
* (Apollon77) 0.1.1: Library fixes and updates

### 0.1.0 (2018-07-10)
* (Apollon77) get Adapter working again, especially getting cookie and optimize refresh

### 0.0.x
* soef versions

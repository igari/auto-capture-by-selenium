# Shorthand Capabilities

## `_browserName` and `_os` are shorthand capabilities
- `_browserName` and `_os` is special properties for shorthand to setup capabilities easily ([_os and _browserName for shorthands of capabilities](https://github.com/igari/capium/tree/master#os-and-browser)))
- `_browserName` could be specified as chrome/firefox/safari/edge/ie11
- `_os` could be specified as mac/windows/ios/android/ios_emulator/android_emulator
- Specify a combination of them
- If specified both of them, then required other capabilities are specified automatically.
- Except for `_browserName` and `_os` are recognized as native properties.

## Default Capabilities in case of using `_browserName` and `_os`
- [Default Capabilities for BrowserStack](https://github.com/igari/capium/blob/master/scripts/caps-browserstack.js)
- [Default Capabilities for SauceLabs](https://github.com/igari/capium/blob/master/scripts/caps-saucelabs.js)

## Support of `_os` and `_browserName` for BrowserStack and SauceLabs
|              | chrome | firefox | safari | edge | ie11 |
| ------------ | ------ | ------ | ------ | ------ | ------ |
| windows      | &check; | &check; |      | &check;| &check; |
| mac          | &check; | &check; | &check; |      |       |
| android*1      | &check; |       |        |        |       |
| ios*1          | &check; |       | &check; |       |        |
| android_emulator | &check; |       |        |        |       |
| ios_emulator | &check; |       | &check; |       |        |

*1 Only supported in the case of using BrowserStack

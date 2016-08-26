#!/bin/sh

cd `dirname $0`
java -jar ../lib/selenium/selenium-server-standalone-2.53.1.jar -role node -nodeConfig ../node_config.json -Dwebdriver.chrome.driver=../lib/selenium/chromedriver_win32/chromedriver.exe -Dwebdriver.ie.driver=../lib/selenium/IEDriverServer_Win32_2.53.1/IEDriverServer.exe
#!/bin/sh

cd `dirname $0`
java -jar ../lib/selenium/selenium-server-standalone-2.53.1.jar -role node -nodeConfig ../node_config.json -Dwebdriver.chrome.driver=../lib/selenium/chromedriver_mac32/chromedriver
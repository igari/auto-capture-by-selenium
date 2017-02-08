@echo off

reg add "HKEY_LOCAL_MACHINE\Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_HTTP_USERNAME_PASSWORD_DISABLE" /v iexplore.exe /t REG_DWORD /d 0 /f

pause
@echo off

if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)
SET this_path=%~dp0
SET this_file=%~dpf0
echo "mode ADMIN"
echo this_path : %this_path%
echo this_file : %this_file%
%~d0
cd %this_path%
echo cd  : %cd%

certutil -addstore -f "Root" certificate.crt

pause

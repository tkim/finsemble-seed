@echo off
set url=%1

REM //ignore url and extract arguments (after ?)
for /f "tokens=2 delims=?" %%a in (%url%) do (
  set args="%%a"
)

REM //tokenize arguments on & and loop through 
:loop
for /f "tokens=1* delims=^&" %%a in (%args%) do (
  set newArgs=%newArgs%%%a 
  set output=%%b
  set args="%%b"
)
if defined output goto :loop

START /b C:\Users\admin\Documents\code\finsemble-seed\hosted\WindowlessExampleDebug\WindowlessExample.exe %newArgs%
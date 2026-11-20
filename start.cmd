@echo off
setlocal EnableExtensions DisableDelayedExpansion
pushd "%~dp0" || exit /b 1

if not "%~2"=="" goto :usage
if not "%~1"=="" if /i not "%~1"=="--build" goto :usage

set "BLOCKSMITH_JAR=server\target\blocksmith-market.jar"
set "BLOCKSMITH_JAVA=java.exe"
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" set "BLOCKSMITH_JAVA=%JAVA_HOME%\bin\java.exe"
if "%BLOCKSMITH_JAVA%"=="java.exe" (
    where.exe java.exe >nul 2>&1
    if errorlevel 1 (
        echo Java 17 or newer is required. 1>&2
        goto :fail
    )
)

if /i "%~1"=="--build" goto :build
if not exist "%BLOCKSMITH_JAR%" goto :build

powershell.exe -NoLogo -NoProfile -NonInteractive -Command "$ErrorActionPreference = 'Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; $archive = [IO.Compression.ZipFile]::OpenRead((Join-Path (Get-Location).Path $env:BLOCKSMITH_JAR)); try { if ($null -eq $archive.GetEntry('BOOT-INF/classes/static/index.html')) { exit 1 } } finally { $archive.Dispose() }" >nul 2>&1
if not errorlevel 1 goto :run

:build
where.exe npm.cmd >nul 2>&1
if errorlevel 1 (
    echo Node.js with npm is required to build the app. 1>&2
    goto :fail
)
where.exe mvn.cmd >nul 2>&1
if errorlevel 1 (
    echo Apache Maven is required to build the app. Add Maven to PATH and try again. 1>&2
    goto :fail
)
call npm.cmd ci --include=dev
if errorlevel 1 goto :fail
call npm.cmd run build
if errorlevel 1 goto :fail

:run
if not defined PORT echo Open http://127.0.0.1:3001/shop after startup. Press Ctrl+C to stop.
"%BLOCKSMITH_JAVA%" -jar "%BLOCKSMITH_JAR%"
set "BLOCKSMITH_EXIT=%errorlevel%"
popd
exit /b %BLOCKSMITH_EXIT%

:usage
echo Usage: start.cmd [--build] 1>&2

:fail
popd
exit /b 1

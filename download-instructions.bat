@echo off
setlocal enabledelayedexpansion

:: Colors for output
set "RED=[91m"
set "GREEN=[92m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%Pi Network Ludo - Download and Update Script%NC%
echo.

:: Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%Error: Git is not installed.%NC%
    echo Please install Git first from https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

:: Repository URL
set "REPO_URL=https://github.com/hitcaff/Pi-Network-Ludo.git"

:: Check if repository exists
if exist "Pi-Network-Ludo" (
    echo %BLUE%Updating existing repository...%NC%
    cd Pi-Network-Ludo
    git pull origin main
    if !ERRORLEVEL! equ 0 (
        echo %GREEN%Repository successfully updated!%NC%
    ) else (
        echo %RED%Error updating repository. Please check your internet connection and try again.%NC%
        pause
        exit /b 1
    )
) else (
    echo %BLUE%Cloning repository...%NC%
    git clone "%REPO_URL%"
    if !ERRORLEVEL! equ 0 (
        echo %GREEN%Repository successfully cloned!%NC%
    ) else (
        echo %RED%Error cloning repository. Please check your internet connection and try again.%NC%
        pause
        exit /b 1
    )
)

echo.
echo %GREEN%Setup completed!%NC%
echo %BLUE%Next steps:%NC%
echo 1. Navigate to the project directory: cd Pi-Network-Ludo
echo 2. Open index.html in your web browser
echo 3. Make sure to use Pi Browser for full functionality
echo.
echo %BLUE%For updates:%NC%
echo 1. Run this script again to get the latest changes
echo 2. Check updates/README.md for new features and changes
echo.

pause
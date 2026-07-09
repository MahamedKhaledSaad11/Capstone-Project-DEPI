@echo off
setlocal enabledelayedexpansion

:: ===== CONFIG =====
set REPO_URL=https://github.com/Mariam-Amro-2005/Capstone-Project-DEPI.git
set BRANCH=Updates_Project

echo ========================================
echo 🚀 Starting Force Reset and Push...
echo ========================================

:: Initialize git if not already
if not exist ".git" (
    git init
)

:: Set remote (safe replace)
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo 🌿 Switching to branch %BRANCH%...
:: Try to switch to branch, if it doesn't exist, create it
git checkout %BRANCH% 2>nul || git checkout -b %BRANCH%

echo.
echo 🧹 Cleaning tracked ignored files...
git rm -r --cached .venv 2>nul
git rm -r --cached node_modules 2>nul
git rm -r --cached data 2>nul

echo.
echo 📦 Adding clean project...
git add .

echo.
echo 💾 Fresh commit...
git commit -m "chore: reset branch with clean production-ready project"

echo.
echo 🚀 Force pushing clean branch...
echo WARNING: This will overwrite the remote branch %BRANCH% completely!
git push origin %BRANCH% --force

echo.
echo ✅ Done: Branch fully reset and cleaned.
pause

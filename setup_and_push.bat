@echo off
setlocal enabledelayedexpansion

:: ===== CONFIG =====
set REPO_URL=https://github.com/Mahmoudsherif00/Capstone-Project-DEPI.git

echo ========================================
echo 🚀 Starting clean Git setup...
echo ========================================

:: Initialize git if not already
if not exist ".git" (
    git init
)

:: Set remote (safe replace)
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo 🧹 Cleaning tracked ignored files...
:: Remove if already tracked
git rm -r --cached .venv 2>nul
git rm -r --cached node_modules 2>nul
git rm -r --cached data 2>nul

echo.
echo 📦 Adding files...
git add .

echo.
echo 💾 Committing...
git commit -m "chore: initial clean production commit"

echo.
echo 🌿 Setting branch main...
git branch -M main

echo.
echo 🚀 Pushing to GitHub...
git push -u origin main

echo.
echo ✅ Done! Repository pushed successfully.
pause

@echo off
echo [1/4] Initializing Git repository...
git init

echo [2/4] Staging files...
git add .

echo [3/4] Committing changes...
git commit -m "feat: configure static hosting for deployment"

echo [4/4] Setting remote origin and pushing to GitHub...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Saket-4byte/AI_Resume_Parser.git
git push -u origin main --force

echo ===================================================
echo Done! Please check your repository at:
echo https://github.com/Saket-4byte/AI_Resume_Parser
echo ===================================================
pause

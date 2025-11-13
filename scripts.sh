git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/ravi4047/modelia_assignment.git
git push -u origin main

# Git checkout to a new branch
# git checkout -b feature-branch
# git push -u origin feature-branch

git checkout -b feature/frontend_core
git add .
git commit -m "frontend core files with backend routes adjustments"
git push -u origin feature/frontend_core
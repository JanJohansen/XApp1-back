start cmd /c npm run dev:copy
start cmd /c npm run dev:build
start cmd /c npm run dev:run

# // Windows Terminal is tricky - wont run "npm run dev"
# wt new-tab -d . --title "MiXs" "npm run dev:copy"; new-tab --title "TypeScript" "npm run dev:build"
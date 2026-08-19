# Weekly Protocol

A personal weekly planner (classes, tasks, workouts) — originally a Claude artifact,
now a standalone web app deployed for free on GitHub Pages.

## Deploy on GitHub Pages (no local install needed)

1. Create a free GitHub account at github.com if you don't have one.
2. Create a new repository (e.g. `weekly-protocol`).
3. Upload every file/folder in this project to it — use "Add file → Upload files"
   and drag in everything, including the hidden `.github` folder (make sure your
   file browser is set to show hidden files, or re-add it separately if it gets
   skipped — see note below).
4. Go to the repo's **Settings → Pages**, and under "Build and deployment → Source",
   choose **GitHub Actions**.
5. Go to the **Actions** tab and confirm the "Deploy to GitHub Pages" workflow ran
   (it triggers automatically once you push to `main`). It installs dependencies
   and builds the app on GitHub's servers — you don't need Node.js locally.
6. Once it finishes (green checkmark), your site is live at:
   `https://<your-username>.github.io/weekly-protocol/`

### Note on the `.github` folder

Some browsers/upload flows hide dotfiles or skip hidden folders when dragging from
your computer. If `.github/workflows/deploy.yml` doesn't make it into the repo:
- Easiest fix: on GitHub, use "Add file → Create new file", name it
  `.github/workflows/deploy.yml` (GitHub creates the folders for you), and paste
  in the contents of that file from this project.

## Notes

- Your tasks/completion data are stored in the browser's local storage on whichever
  device you use it from — nothing is synced between devices or sent to a server.
- Every time you push a change to `main`, the site rebuilds and redeploys automatically.
- To run it locally instead (if you have Node.js installed): `npm install && npm run dev`.

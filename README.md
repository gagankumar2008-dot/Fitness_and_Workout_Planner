# FitTrack

FitTrack is a responsive weekly workout planner and progress tracker for beginners and students. It is built with React, Vite, Tailwind CSS, Lucide icons, and Recharts. Your information is saved locally in your browser; no account or backend is required.

## Live deployment

**Production:** [https://fittrack-planner-murex.vercel.app](https://fittrack-planner-murex.vercel.app/)

Hosted on Vercel from the public GitHub repository. The production site was verified after deployment.

## Features

- **Exercise library:** 18 exercises across six muscle groups, with suggested sets, reps, and difficulty. Filter, search, and add an exercise to any day.
- **Weekly planner:** Seven editable day cards with add/remove controls and individual completion tracking. On phones, swipe horizontally between day cards or use the day selector.
- **Progress dashboard:** Planned and completed exercise totals, completion percentage, weekly activity, motivation, and a consecutive-day streak.
- **Progress log:** Add dated body-weight and workout-duration entries, view a history, delete records, and explore trends in an interactive chart.
- **BMI calculator:** Adult BMI categories with a screening-measure and teen-suitability disclaimer.
- **Rest timer:** Adjustable 30-second to two-minute countdown with start, pause, and reset controls.
- **Workout templates:** Beginner full-body and intermediate split plans that can be edited after applying.
- **Local-first settings:** Data reset with confirmation and a clear explanation of device/browser-specific storage.
- Responsive desktop sidebar and mobile bottom navigation.

## Screenshots

Screenshots are not included yet. To add them, capture the dashboard and mobile planner, place the images in `docs/screenshots/`, and link them here.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Install and run

From the project folder:

```sh
npm install
npm run dev
```

Vite prints the local development URL (usually `http://localhost:5173`). To verify the production bundle:

```sh
npm run build
npm run preview
```

## Data and privacy

Plans, exercise completions, completion dates, progress logs, BMI inputs, and the rest-timer value are stored in browser `LocalStorage`. The data belongs to this browser on this device; it is not automatically synchronized, backed up, or associated with an account. Clearing browser storage removes it. Use **Settings → Reset data** to remove FitTrack's saved data with confirmation.

Exercise definitions live in [`src/data/exercises.json`](src/data/exercises.json). The app does not require environment variables or external API credentials.

## Publish to GitHub

1. Sign in to GitHub and choose **New repository**. Give it a name such as `fittrack`, select **Public**, and create it without initializing a README (this project already has one).
2. In a terminal opened in this project folder, initialize and push the project. Replace the URL with the HTTPS URL shown on your new repository:

   ```sh
   git init
   git add .
   git commit -m "Build FitTrack workout planner"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/fittrack.git
   git push -u origin main
   ```

3. Confirm the source files appear in the GitHub repository. `.gitignore` excludes dependencies, build output, Vercel metadata, and environment files.

## Deploy to Vercel

1. Sign in to [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Import the public `fittrack` GitHub repository and authorize GitHub access if prompted.
3. Select **Vite** as the framework preset. Use:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Select **Deploy**. Vercel will build the project and display the actual public deployment URL when it succeeds. Connect a custom domain in project settings if desired.
5. Open the deployed URL on a phone and desktop, try the interactions in the checklist below, and refresh the page to confirm LocalStorage persistence. The included `vercel.json` rewrites requests to the Vite entry point.

No GitHub repository or Vercel deployment has been created from this source folder. Those steps require signing in to the user's GitHub and Vercel accounts; do not treat a local build as a published deployment.

## Feature testing checklist

- [ ] Open the exercise library, filter each muscle group, search, and add exercises to different planner days.
- [ ] In the planner, add an exercise, remove it, mark it complete, and confirm the dashboard totals and weekly completion percentage update.
- [ ] Apply both workout templates; confirm replacement asks before overwriting an existing plan and template exercises remain editable.
- [ ] Reload the page and verify the plan, completion status, streak, and preferences remain available.
- [ ] Add a weight-only entry, a duration-only entry, and an entry with both; check chart/history updates and delete an entry.
- [ ] Try invalid progress values and confirm a useful validation message appears.
- [ ] Enter BMI values around 18.5, 25, and 30; verify the category and screening disclaimer.
- [ ] Start, pause, resume, and reset the rest timer; try the available duration presets.
- [ ] Use Settings to reset data, confirm the browser prompt, and verify the planner and log are cleared.
- [ ] Check the mobile bottom navigation, swipeable planner cards, and narrow-screen layouts.
- [ ] If deployed, refresh the Vercel URL and confirm it still loads successfully.

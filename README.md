# AI Systems Insights Lab

![Banner](assets/banner.svg)

**Author:** Riya Jain: AI & Big Data  
**Live demo:** https://<RiyaJ6>.github.io/AI-Systems-Insights-Lab  
**Repo:** https://github.com/<RiyaJ6>/AI-Systems-Insights-Lab
[![Pages](https://img.shields.io/badge/pages-deployed-brightgreen)](https://<RiyaJ6>.github.io/AI-Systems-Insights-Lab)

---

## What is this?
AI Systems Insights Lab is an interactive, browser-first lab that visualizes how language models reason, how dataset slices affect predictions, and how a production ML pipeline flows. It is intentionally zero-install so recruiters and engineers can explore model internals and pipeline trade-offs within seconds.

---

## Quick demo (what to click)
1. Open the Live demo link.  
2. In **Try the Model**, type `The doctor said` → click **Run (simulate)**.  
3. In **Bias Explorer**, pick a pattern → click **Analyze**.  
4. Click nodes in **Pipeline Flow** to read transformation details.

---

## Files
- `index.html` — main site  
- `styles.css` — styling  
- `scripts.js` — client logic (simulated model & UI)  
- `assets/banner.svg` — professional header banner  
- `README.md` — this file  
- `LICENSE` — MIT license

---

## Tech & design decisions
- **Browser-first**: HTML/CSS/vanilla JS so the site is instantly shareable and inspectable.  
- **Simulated internals**: token-prob visualizations are simulated for privacy and to avoid API keys — easy to switch to a proxy-backed real inference.  
- **Observable-ready**: an iframe placeholder is included for interactive charts (Observable embed).

---

## How to deploy (GitHub Pages)
1. Create repo (if not already).  
2. Add the files above to the repository.  
3. Go to **Settings → Pages** → Source = `main` branch → `/ (root)` → Save.  
4. Wait a few minutes and open the provided URL.

---

## How to enable real model inference (optional)
- Deploy a serverless proxy (Netlify / Vercel / Cloudflare Workers) to keep API keys secret.  
- Update `scripts.js` to call that proxy from the browser and parse the returned completions & token probabilities. (I can provide exact proxy code if you want.)

---

## Why this is recruiter-friendly
- **5-second evidence**: In a single click a reviewer sees model outputs and reasoning visualization.  
- **Systems thinking**: Pipeline DAG + node descriptions show you understand production ML.  
- **Reproducible**: Everything runs in-browser — no local setup.

---

## License
This project is licensed under the MIT License.

---



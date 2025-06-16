# Tadus / Jakcodex / Muledump

This is a fork of Jakcodex's [Muledump](https://github.com/jakcodex/muledump).

## Overview
This repository is up-to-date and functional as of 2025.

Muledump is a tool designed to consolidate the contents of all your accounts into a single, user-friendly page. It displays characters, their stats, items, and vault inventory, while also generating a comprehensive summary of all your items.

---

## Installation Guide

### Step 1: Download the Code
1. Download the repository as a ZIP file.
2. Extract the ZIP file to a suitable location. We recommend placing it in your **Documents** folder, e.g., `Documents/muledump`.

### Step 2: Enable CORS
To function properly, Muledump requires Cross-Origin Resource Sharing (CORS) to be enabled. Most browsers block CORS by default.

#### Firefox
- Install the [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) plugin.

#### Chrome
- Chrome plugins cannot bypass CORS restrictions.
- Instead, use the `--disable-web-security` startup argument.

### Step 3: Create a Chrome Shortcut (Optional)
If using Chrome, you can create a shortcut to open Muledump in app mode. This shortcut will bypass CORS restrictions and make Muledump act like a standalone application.

1. Locate your Chrome installation directory (e.g., `C:\Program Files\Google\Chrome\Application\chrome.exe`).
2. Create a shortcut with the following arguments:

```text
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="%appdata%\muledump" --app="file:///%USERPROFILE%/Documents/muledump/muledump.html"
```

### Step 4: Launch Muledump
#### For Firefox
1. Open **`muledump.html`** in Firefox with the CORS Everywhere plugin enabled.

#### For Chrome
1. Use the shortcut you created to open Muledump in app mode. No additional plugins are required.

---

## Updating Muledump
Whenever an update is released:
1. Replace all the files in the directory where you extracted Muledump.

That's it! You're good to go.

---

Enjoy using Muledump to manage your accounts efficiently!

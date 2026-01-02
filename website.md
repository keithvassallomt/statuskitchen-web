# Status Kitchen - Application Documentation

## Overview

**Status Kitchen** is a modern GNOME desktop customization tool designed to bridge the gap between legacy tray applications and the modern GNOME Shell user interface. It acts as a "Tray Indicator Bridge" but with a unique, recipe-based configuration system.

Unlike traditional AppIndicator support extensions which simply shove existing icons into the panel, Status Kitchen allows users to completely reconstruct and customize these menus using "Recipes". It combines a Rust based backend application with a lightweight GNOME Shell Extension.

## Architecture

The system consists of three main components:

1.  **The Rust Backend (`status-kitchen`)**:
    *   Runs as a user application.
    *   Manages "Recipes" (configurations).
    *   Handles the "Cookbook" (online repository of recipes).
    *   Performs D-Bus discovery to find running applications and their menus.
    *   Exposes a D-Bus service (`org.gnome.StatusKitchen`) to communicate with the shell extension.

2.  **The GNOME Shell Extension**:
    *   A lightweight JavaScript extension running in the GNOME Shell process.
    *   Acts purely as a view layer.
    *   Connects to the Rust backend via D-Bus.
    *   Renders the icons and menus in the top bar.
    *   Proxies user clicks back to the Rust backend.

3.  **The Recipe System**:
    *   A declarative way to define how an app should appear in the top bar.
    *   Defined in TOML or packaged in `.skr` (Status Kitchen Recipe) ZIP archives.

## Core Concepts

### 1. Recipes (`.skr`)

A **Recipe** is the fundamental unit of configuration in Status Kitchen. It tells the app: "When you see process X running, put Icon Y in the top bar, and give it Menu Z."

*   **Format**: A recipe is distributed as a `.skr` file, which is just a ZIP archive containing:
    *   `recipe.toml`: The configuration manifest.
    *   `assets/`: Directory containing custom icons (SVG/PNG).
*   **Identification**: Recipes are identified by a UUID (e.g., `nextcloud@statuskitchen.app`).
*   **Structure** (`recipe.toml`):
    *   `[app]`: Metadata (id, name, description).
        *   `dbus_name_pattern`: A glob pattern to match the DBus name of the target app (e.g., `org.telegram.desktop`).
    *   `[top_bar_icon]`: Visual settings.
        *   `icon`: Path to an asset or a system icon name.
        *   `symbolic`: Boolean. If true, forces the icon to be monochrome and adaptive to the system theme (even if the original asset is full color).
        *   `dynamic_menu_items_enabled`: Boolean. If true, it attempts to "steal" the menu items from the target application's DBus interface and inject them into the Status Kitchen menu.
    *   `[[top_bar_icon.menu_items]]`: Static menu items defined by the user (e.g., "Launch App", "Force Quit").

### 2. The Cookbook

The **Cookbook** is the online community repository of recipes.
*   **Function**: Allows users to browse and download recipes for popular apps (Discord, Spotify, Telegram, etc.) directly within the Status Kitchen app.
*   **Submission**: Users can submit their own recipes to the community.

### 3. URL Scheme (`statuskitchen://`)

The app handles the `statuskitchen://` URL scheme to facilitate one-click installations from the website.
*   `statuskitchen://install?url=<URL>`: Downloads and installs a `.skr` recipe from the given URL.
*   `statuskitchen://browse`: Opens the internal Cookbook browser.

## Key Features & Technical Details

### Symbolic Icon Conversion (Shader Magic)
One of the "killer features" is the ability to turn *any* icon into a native-looking GNOME symbolic icon.
*   **Problem**: Legacy tray icons are often colorful, low-res, or don't match the system theme (light/dark mode).
*   **Solution**: The GNOME Shell Extension implements a custom `Clutter.ShaderEffect`.
*   **How it works**: The shader takes the alpha channel of the original icon texture and multiplies it by the system's current foreground text color. This effectively "masks" the icon, turning it into a silhouette that perfectly matches the system theme color dynamically.

### Inter-Process Communication (IPC)
Communication happens over the Session Bus.
*   **Service Name**: `org.gnome.StatusKitchen`
*   **Interface**:
    *   `GetActiveRecipes()` -> Returns list of recipes for currently running apps.
    *   `GetRecipeMenuItems(recipe_id)` -> Returns the menu structure.
    *   `ExecuteCommand(recipe_id, command)` -> Runs a shell command.
    *   `ExecuteDBusAction(...)` -> Triggers a standard D-Bus action on the target application (e.g., "Pause" on Spotify).

### Dynamic Menu Discovery
Status Kitchen isn't just a launcher; it's a proxy.
*   It listens for D-Bus names appearing on the bus.
*   If a name matches a Recipe's `dbus_name_pattern`, the recipe becomes "Active".
*   It can then query standard interfaces like `com.canonical.dbusmenu` or `org.gtk.Actions` to inspect the target application's actual menu structure and mirror it in the GNOME top bar.

## Project Structure for Website Context

*   `src/`: Rust source code.
    *   `recipe/`: Logic for parsing TOML and handling `.skr` archives.
    *   `dbus/`: Service implementation and discovery logic.
    *   `ui/`: GTK4 + Libadwaita user interface.
    *   `cookbook/`: Interface with the online repository.
*   `extension/`: The GNOME Shell Extension (JavaScript + CSS).
*   `recipes/`: Default/Example recipes.

## Desired Website Vibe
(Inferred from application style)
*   **Modern & Clean**: Fits with the GNOME / Libadwaita aesthetic.
*   **User-Centric**: "Take control of your tray".
*   **Technical but Accessible**: Highlights the power of "Recipes" without confusing non-technical users.

## The Cookbook Web Store

The **Status Kitchen Cookbook** is the official web-based store for browsing and installing extension recipes. It serves as the primary hub for the community to share and discover configurations.

### Overview
*   **URL**: `cookbook.statuskitchen.app` (Production)
*   **Purpose**: A centralized repository for recipes, allowing users to "one-click install" configurations directly into the Status Kitchen desktop app.
*   **Interaction**: The website uses the `statuskitchen://` custom protocol to trigger the desktop application.

### Tech Stack
The cookbook is a modern web application built with a focus on performance and aesthetics:
*   **Framework**: [SvelteKit](https://kit.svelte.dev/) (TypeScript)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Skeleton UI v3](https://www.skeleton.dev/) (Theme: "Cerberus")
*   **Infrastructure**: Deployed via [SST](https://sst.dev/) (Serverless Stack) to AWS (CloudFront + Lambda).

### Key Features
*   **Recipe Discovery**: A visual grid layout with robust tag-based filtering (e.g., "Chat", "Music", "Dev Tools").
*   **Hero Carousel**: A dynamic carousel highlighting featured or popular recipes.
*   **Responsive Design**: Fully responsive layout that works on desktop and mobile.
*   **Dark Mode**: Native support for light and dark themes, defaulting to the "Cerberus" theme.

### Integration Points
*   **Data Source**: The website fetches recipe metadata from a central repository (likely the same source the desktop app uses).
*   **Protocol Handlers**:
    *   `statuskitchen://install?url=...`: Triggers the download and installation of a recipe.
    *   `statuskitchen://browse`: Reserved for opening the store from the desktop app.

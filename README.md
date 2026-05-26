# Crypto4 Mining Simulator and Dashboard

An interactive client-side simulation dashboard for the decentralized Crypto4 (C4) network. This application is built as a modular single-page platform utilizing pure HTML5, vanilla CSS3, and standard ES6 JavaScript. It includes live hashrate modeling, heat dynamics, profitability calculators, hardware shops, and Web3 connection flows.

## Core Features

* Browser Mining Engine: Toggles simulated hybrid CPU/GPU hashing threads, prints real-time block validation hashes in a green scrolling log console, and tracks temperature vs coolant fan settings.
* Live SVG Charts: Renders a fluid graphical index mapping historical total hashrates over time using custom SVG path coordinate arrays.
* Hardware Store: Deploys multiple tiers of mining rigs (ASICs, GPUs, and Quantum systems) that run in parallel to compound hashing speeds and power draw metrics.
* Dynamic Yield Calculator: Implements slider components for hashrate, electricity costs, token index values, pool fees, and power draws, and displays estimated profits for hour, day, week, month, and annual periods.
* Wallet Integration: Features a mock Web3 wallet connector supporting MetaMask, Coinbase, and WalletConnect, providing starting virtual capital, a withdraw/convert pipeline, and a detailed wallet portfolio view.

## Codebase Architecture

The application is structured cleanly without external frameworks:

* index.html: Layout markup containing semantic tags, tickers, custom gauges, terminal logging blocks, store grid structures, and wallet overlays.
* css/main.css: Complete design styling system. Defines dark obsidian glassmorphism layouts, custom range sliders, glowing box-shadow selectors, and media queries for fluid responsive scaling.
* js/miner.js: Handles the simulated blockchain validation thread, implementing mathematical thermal curves, power calculation models, and console event hooks.
* js/calculator.js: Executes the profitability computations, updating periodic cash tables instantly on input slide adjustments.
* js/hardware.js: Configures the store catalog inventory and coordinates purchasing requirements.
* js/app.js: The master program controller, handling live tickers, auto-compounding hardware farm loops, and SVG path redraws.

## Local Launch Instructions

To launch the project locally:

1. Open your terminal in the directory where the files are located.
2. Spin up a lightweight local web server to resolve ES6 import modules correctly:
   
   python -m http.server 8000

3. Open your web browser and navigate to:
   
   http://localhost:8000

Alternatively, if local file-access flags are enabled in your environment, you can open the index.html file directly in any modern web browser.

## Contributor
* Name: Soumya
* Email: aaronsamuel0205@gmail.com
* GitHub Account: Aaron-Samuel05

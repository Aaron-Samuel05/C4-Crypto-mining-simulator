/**
 * CRYPTO4 MAIN APPLICATION CONTROLLER
 * Orchestrates wallets, live mining thread callbacks, hardware stores, SVG charts, and notifications.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. APPLICATION STATE
    const state = {
        c4Balance: 0.000000,
        usdPrice: 14.85,
        usdBalance: 1200.00, // Starting simulated capital for rig purchases
        walletConnected: false,
        connectedAddress: '',
        activeThreads: 1,
        minerSpeed: 0, // Browser speed (H/s)
        farmSpeed: 0,  // Hardware rig speed (MH/s)
        totalPower: 0,
        tempState: 'normal',
        
        // Chart history (last 30 data points)
        chartHistory: Array(30).fill(0)
    };

    // 2. COMPONENT INSTANCES
    const miner = new Crypto4Miner();
    const calculator = new Crypto4Calculator();
    const hardware = new Crypto4Hardware();

    // 3. DOM ELEMENTS CACHING
    const dom = {
        // Top Tickers
        priceTicker: document.getElementById('ticker-price'),
        blockTicker: document.getElementById('ticker-block'),
        
        // Wallet Connectors
        walletBtn: document.getElementById('wallet-connect-btn'),
        walletDropdown: document.getElementById('wallet-details-dropdown'),
        walletAddrDisplay: document.getElementById('wallet-address-display'),
        dropdownBalance: document.getElementById('dropdown-balance'),
        dropdownUsd: document.getElementById('dropdown-usd-balance'),
        withdrawBtn: document.getElementById('wallet-withdraw-btn'),
        
        // Modals
        modalOverlay: document.getElementById('wallet-modal-overlay'),
        modalClose: document.getElementById('modal-close-btn'),
        walletProviders: document.querySelectorAll('.wallet-provider-btn'),
        walletLoader: document.getElementById('wallet-connecting-loader'),
        providersList: document.querySelector('.wallet-providers-list'),
        
        // Live Browser Miner Dashboard
        minerToggle: document.getElementById('miner-toggle-btn'),
        minerBtnText: document.getElementById('miner-btn-text'),
        minerBtnSub: document.getElementById('miner-btn-sub'),
        minerPulse: document.getElementById('miner-pulse'),
        hashrateVal: document.getElementById('miner-hashrate'),
        tempVal: document.getElementById('miner-temp'),
        sharesVal: document.getElementById('miner-shares'),
        blocksVal: document.getElementById('miner-blocks'),
        powerVal: document.getElementById('miner-power'),
        consoleLog: document.getElementById('miner-console-log'),
        consoleClear: document.getElementById('terminal-clear'),
        threadBtns: document.querySelectorAll('.thread-btn'),
        fanSpeedSlider: document.getElementById('fan-speed'),
        fanSpeedLabel: document.getElementById('fan-speed-val'),
        
        // Dynamic Inventory Portfolio
        hudBalance: document.getElementById('wallet-balance'),
        hudBalanceUsd: document.getElementById('wallet-balance-usd'),
        notificationCenter: document.getElementById('notification-center')
    };

    // 4. MAIN INITIALIZATION
    function init() {
        // Init Subsystems
        calculator.init();
        hardware.init(() => state.usdBalance);

        // Connect Hardware callbacks
        hardware.onPurchaseSuccess = handleRigPurchase;
        hardware.onPurchaseError = (err) => showNotification("DEPLOYMENT BLOCKED", err, "error");

        // Connect Miner callbacks
        miner.onLog = handleMinerLog;
        miner.onUpdate = handleMinerUpdate;

        // Bind Application UI Events
        bindAppEvents();

        // Start Ambient Network Loops (Difficulty, Coin Pricing shifts)
        startNetworkSimulator();

        // Render initial UI values
        updateWalletUI();
        drawChart();
    }

    // 5. BIND DOM UI INTERACTIVE EVENTS
    function bindAppEvents() {
        // Toggle simulated browser mining
        dom.minerToggle.addEventListener('click', () => {
            if (miner.isActive) {
                miner.stop();
                dom.minerToggle.className = "miner-btn-action btn-inactive";
                dom.minerBtnText.textContent = "START HASH ENGINE";
                dom.minerBtnSub.textContent = "INITIALIZE SIMULATED NODE";
                dom.minerPulse.className = "pulse-ring";
            } else {
                miner.start();
                dom.minerToggle.className = "miner-btn-action btn-active";
                dom.minerPulse.className = "pulse-ring text-green active-pulse";
            }
        });

        // Toggle threads core allocation
        dom.threadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                dom.threadBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeThreads = parseInt(btn.getAttribute('data-threads'));
                miner.setThreads(state.activeThreads);
            });
        });

        // Fan control slider
        dom.fanSpeedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            dom.fanSpeedLabel.textContent = `${speed}%`;
            miner.setFanSpeed(speed);
        });

        // Clear log
        dom.consoleClear.addEventListener('click', () => {
            dom.consoleLog.innerHTML = `<div class="log-line system-line">[SYSTEM] Console terminal log buffer cleared. Hashing continues...</div>`;
        });

        // Wallet Connection flows
        dom.walletBtn.addEventListener('click', () => {
            if (state.walletConnected) {
                dom.walletDropdown.classList.toggle('hidden');
            } else {
                openWalletModal();
            }
        });

        // Close wallet dropdown if clicked outside
        document.addEventListener('click', (e) => {
            if (state.walletConnected && !dom.walletBtn.contains(e.target) && !dom.walletDropdown.contains(e.target)) {
                dom.walletDropdown.classList.add('hidden');
            }
        });

        dom.modalClose.addEventListener('click', closeWalletModal);
        dom.modalOverlay.addEventListener('click', (e) => {
            if (e.target === dom.modalOverlay) closeWalletModal();
        });

        dom.walletProviders.forEach(btn => {
            btn.addEventListener('click', () => {
                const walletType = btn.getAttribute('data-wallet');
                triggerWalletConnection(walletType);
            });
        });

        // Withdraw Simulated Coins
        dom.withdrawBtn.addEventListener('click', () => {
            if (state.c4Balance <= 0) return;
            const coinsToCash = state.c4Balance;
            const cashYield = coinsToCash * state.usdPrice;
            
            state.usdBalance += cashYield;
            state.c4Balance = 0;
            
            showNotification(
                "WITHDRAWAL COMPLETED", 
                `Successfully converted ${coinsToCash.toFixed(6)} C4 into $${cashYield.toFixed(2)} USD simulated capital. Ready to deploy rigs!`, 
                "success"
            );
            
            updateWalletUI();
            updateCalculators();
        });
    }

    // 6. WALLET SIMULATION
    function openWalletModal() {
        dom.modalOverlay.classList.remove('hidden');
        dom.providersList.classList.remove('hidden');
        dom.walletLoader.classList.add('hidden');
    }

    function closeWalletModal() {
        dom.modalOverlay.classList.add('hidden');
    }

    function triggerWalletConnection(provider) {
        dom.providersList.classList.add('hidden');
        dom.walletLoader.classList.remove('hidden');

        // Simulate cryptographic ledger connection latency
        setTimeout(() => {
            const providerNames = {
                metamask: 'MetaMask Wallet',
                coinbase: 'Coinbase Web3 Portal',
                walletconnect: 'WalletConnect Bridge'
            };

            const mockAddr = `c4x${Math.floor(Math.random() * 89999 + 10000)}b4c6${Math.floor(Math.random() * 899 + 100)}fd`;
            
            state.walletConnected = true;
            state.connectedAddress = mockAddr;
            
            // Connected high-roller benefit: Credit simulated cash to let them buy quantum miners!
            const bonusCapital = 100000.00;
            state.usdBalance += bonusCapital;

            showNotification(
                "WALLET SYNCED", 
                `Connected via ${providerNames[provider] || 'Web3 Wallet'}. Simulated funding pool boosted by +$100,000.00!`, 
                "success"
            );

            // Re-render
            dom.walletBtn.innerHTML = `
                <span class="dot connected-dot"></span>
                <span>${mockAddr.slice(0, 4)}...${mockAddr.slice(-4)}</span>
            `;
            dom.walletBtn.className = "btn btn-secondary btn-glow";
            
            dom.walletAddrDisplay.textContent = `${mockAddr.slice(0, 6)}...${mockAddr.slice(-6)}`;
            dom.withdrawBtn.removeAttribute('disabled');

            updateWalletUI();
            closeWalletModal();
        }, 1800);
    }

    // 7. HANDLE INTERACTIVE RIG DEPLOYMENTS
    function handleRigPurchase(rig, hashInc, powerInc, cost) {
        state.usdBalance -= cost;
        
        // Compound farm metrics
        state.farmSpeed += hashInc;
        state.totalPower += powerInc;

        showNotification(
            "RIG DEPLOYED", 
            `Successfully deployed ${rig.title} (+${hashInc} MH/s). Farm power draw expanded by +${powerInc}W.`, 
            "success"
        );

        handleMinerLog(`[RIG ROOM] Automated miner deployed: ${rig.title}. Adding +${hashInc} MH/s mining speed.`, 'success');

        updateWalletUI();
        updateCalculators();
    }

    // 8. UPDATE ACTIVE PROFIT CALCULATIONS
    function updateCalculators() {
        // Feed total farm yields to calculator
        calculator.setHashrate(state.farmSpeed);
        calculator.setPower(state.totalPower);
    }

    // 9. HANDLE BROWSER MINER LOOPS
    function handleMinerLog(msg, type) {
        const line = document.createElement('div');
        line.className = `log-line ${type}-line`;
        
        // Prep timestamp
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        
        line.textContent = `[${hrs}:${mins}:${secs}] ${msg}`;
        dom.consoleLog.appendChild(line);
        
        // Keep scroll container locked to baseline
        dom.consoleLog.scrollTop = dom.consoleLog.scrollHeight;
    }

    function handleMinerUpdate(minerState) {
        state.minerSpeed = minerState.hashrate;
        
        // Format live units
        dom.hashrateVal.textContent = formatHashrate(minerState.hashrate);
        
        // Handle core temperatures
        const temp = minerState.temperature;
        dom.tempVal.textContent = `${temp.toFixed(1)}°C`;
        
        if (temp < 60) {
            dom.tempVal.className = "metric-value temp-normal";
            state.tempState = 'normal';
        } else if (temp < 80) {
            dom.tempVal.className = "metric-value temp-warm";
            state.tempState = 'warm';
        } else {
            dom.tempVal.className = "metric-value temp-hot";
            if (state.tempState !== 'hot') {
                handleMinerLog("[WARNING] Core heat warning: Silicon thermal thresholds exceeding safety standards! Deploy fan speed adjustments.", 'warn');
                state.tempState = 'hot';
            }
        }

        // Handle power draw
        // Power draw is browser miner power + active hardware rig power
        const overallPower = minerState.power + state.totalPower;
        dom.powerVal.textContent = `${overallPower.toFixed(0)} W`;

        // Handle accepted blocks increment
        dom.sharesVal.textContent = minerState.shares;
        
        if (parseInt(dom.blocksVal.textContent) < minerState.blocks) {
            // Browser found a simulated block! Earn 2.5 C4!
            dom.blocksVal.textContent = minerState.blocks;
            addMinedBalance(2.5);
            showNotification(
                "SOLVED BLOCK CHALLENGE", 
                "Your browser successfully verified a node hashing block! Reward: +2.50 C4.", 
                "success"
            );
        }
    }

    // 10. REWARDS BALANCE AND PORTFOLIOS SYNC
    function addMinedBalance(amount) {
        state.c4Balance += amount;
        updateWalletUI();
    }

    function updateWalletUI() {
        const usdVal = state.c4Balance * state.usdPrice;
        
        // Sync Dropdowns
        dom.dropdownBalance.textContent = state.c4Balance.toFixed(6) + " C4";
        dom.dropdownUsd.textContent = "$" + usdVal.toFixed(2) + " USD";

        // Sync Portfolio Cards
        dom.hudBalance.textContent = state.c4Balance.toFixed(6) + " C4";
        dom.hudBalanceUsd.textContent = "$" + usdVal.toFixed(2) + " USD";

        // Withdraw activation
        if (state.walletConnected && state.c4Balance > 0) {
            dom.withdrawBtn.removeAttribute('disabled');
        } else {
            dom.withdrawBtn.setAttribute('disabled', 'true');
        }
    }

    // 11. AMBIENT NETWORK & COIN MULTIPLIERS
    function startNetworkSimulator() {
        let blockHeight = 891324;

        setInterval(() => {
            // 1. Simulate blockchain difficulty / height ticks
            if (Math.random() > 0.85) {
                blockHeight++;
                dom.blockTicker.textContent = `#${blockHeight.toLocaleString()}`;
                
                // Compounding automatic rig yields:
                // Hardware rigs earn passive income continuously based on their hashing power.
                // BASE_NETWORK_YIELD_PER_MHS = C4 per hour per MH/s.
                // Daily passive = farmSpeed (MH/s) * yield * coinPrice.
                if (state.farmSpeed > 0) {
                    const hourlyEarningsC4 = state.farmSpeed * calculator.BASE_NETWORK_YIELD_PER_MHS;
                    // Tick runs every 3 seconds, so add 3 seconds worth of yields
                    const tickEarningsC4 = (hourlyEarningsC4 / 3600) * 3;
                    addMinedBalance(tickEarningsC4);
                }
            }

            // 2. Fluctuate cryptocurrency token index price
            const priceSwing = (Math.random() * 0.16) - 0.08; // +/- 8 cents swing
            state.usdPrice = Math.max(1.00, state.usdPrice + priceSwing);
            dom.priceTicker.textContent = "$" + state.usdPrice.toFixed(2);
            
            // Recalculate calculator displays to match index price
            calculator.coinPrice = state.usdPrice;
            if (calculator.elements.sliderPrice) {
                calculator.elements.sliderPrice.value = state.usdPrice;
                calculator.elements.lblPrice.textContent = "$" + state.usdPrice.toFixed(2);
            }
            calculator.updateProjections();

            // Refresh portfolios
            updateWalletUI();
        }, 3000);

        // Core 1-second system loop for SVG Graph plotting
        setInterval(() => {
            // Total hashrate = Browser H/s (converted to MH/s * 0.0001) + Hardware farm speed in MH/s
            const totalMhs = state.farmSpeed + (state.minerSpeed * 0.0001);
            
            // Add to chart timeline history
            state.chartHistory.shift();
            state.chartHistory.push(totalMhs);

            drawChart();
        }, 1000);
    }

    // 12. HIGH-TECH CUSTOM SVG CHART RENDERING
    function drawChart() {
        const svg = document.getElementById('live-chart-svg');
        const linePath = document.getElementById('chart-line-path');
        const areaPath = document.getElementById('chart-area-path');
        if (!svg || !linePath || !areaPath) return;

        const width = 600;
        const height = 200;
        const padding = 15;

        const maxVal = Math.max(...state.chartHistory, 10); // Minimum scale floor of 10 to look proportional
        const pointsCount = state.chartHistory.length;
        
        let pathD = "";
        let areaD = `M 0 ${height}`;

        state.chartHistory.forEach((val, index) => {
            const x = (index / (pointsCount - 1)) * width;
            // Normalize values in inverted SVG grid
            const normalizedY = ((val / maxVal) * (height - padding * 2)) + padding;
            const y = height - normalizedY;

            if (index === 0) {
                pathD += `M ${x} ${y}`;
                areaD += ` L ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
                areaD += ` L ${x} ${y}`;
            }
        });

        areaD += ` L ${width} ${height} Z`;

        // Update elements
        linePath.setAttribute('d', pathD);
        areaPath.setAttribute('d', areaD);
    }

    // Helper formatter
    function formatHashrate(h) {
        if (h === 0) return "0.00 H/s";
        if (h >= 1000000) return (h / 1000000).toFixed(2) + " MH/s";
        if (h >= 1000) return (h / 1000).toFixed(2) + " KH/s";
        return h.toFixed(2) + " H/s";
    }

    // 13. FLOATING CYBERPUNK HUD NOTIFICATIONS
    function showNotification(title, message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `notification notif-${type}`;
        
        notif.innerHTML = `
            <div class="notif-title">${title}</div>
            <div class="notif-desc">${message}</div>
        `;
        
        dom.notificationCenter.appendChild(notif);
        
        // CSS Transition handles slide in. Auto-destruct after 4 seconds
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(50px)';
            notif.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                notif.remove();
            }, 300);
        }, 4000);
    }
    
    // Fire setup!
    init();
});

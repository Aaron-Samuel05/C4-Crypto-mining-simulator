/**
 * CRYPTO4 BROWSER MINER ENGINE SIMULATOR
 * Dedicated mining thread controller managing CPU/GPU hybrid simulation state.
 */
class Crypto4Miner {
    constructor() {
        this.isActive = false;
        this.baseHashratePerThread = 42.5; // Hashes/sec per simulated thread
        this.threads = 1;
        this.fanSpeed = 40; // Percentage
        this.temperature = 32.0; // Starting room temperature in Celsius
        this.targetTemperature = 32.0;
        this.sharesFound = 0;
        this.blocksMined = 0;
        this.powerConsumption = 0; // Simulated power in Watts
        
        // Loop controls
        this.miningInterval = null;
        this.metricsInterval = null;
        
        // Callbacks
        this.onLog = null; // func(message, type)
        this.onUpdate = null; // func(minerState)
    }

    /**
     * Set active thread count
     */
    setThreads(count) {
        this.threads = parseInt(count) || 1;
        this.log(`Reallocated mining processor to allocate ${this.threads} local threads.`, 'system');
        if (this.isActive) {
            this.recalculatePower();
        }
    }

    /**
     * Set fan speed and adjust cooling dynamics
     */
    setFanSpeed(speed) {
        this.fanSpeed = Math.max(30, Math.min(100, speed));
        this.log(`Cooling unit fan speed adjusted to ${this.fanSpeed}%. Fan RPM state changed.`, 'system');
        this.recalculateTemperature();
    }

    /**
     * Start the hashing engine
     */
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.log("Initializing Crypto4 browser hashing engine...", "system");
        this.log("Synchronizing with peer consensus nodes at network layer...", "system");
        
        // Start simulation loops
        this.startMiningLoop();
        this.startMetricsLoop();
        
        this.log("Hashing thread active. Injecting mock blocks and verifying nonces.", "success");
    }

    /**
     * Stop the hashing engine
     */
    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        this.log("Halting browser mining thread. Cooling core...", "warn");
        
        // Clear loops
        clearInterval(this.miningInterval);
        clearInterval(this.metricsInterval);
        
        this.powerConsumption = 0;
        this.triggerUpdate();
    }

    /**
     * Generate simulated logs and submit shares
     */
    startMiningLoop() {
        const runMiningStep = () => {
            if (!this.isActive) return;

            // Generate fake hex hash (Crypto4 uses C4SHA algorithm simulation)
            const nonce = Math.floor(Math.random() * 99999999);
            const rawHash = this.generateRandomHash();
            const difficultyMatch = Math.random() > 0.6; // 40% chance of standard share block

            if (difficultyMatch) {
                this.sharesFound++;
                const isBlock = Math.random() > 0.93; // 7% chance that an accepted share hits block target!
                
                if (isBlock) {
                    this.blocksMined++;
                    this.log(`[BLOCK CONFIRMED] Block #${891324 + this.blocksMined} successfully processed! Nonce: ${nonce}. Hash: ${rawHash}`, 'success');
                } else {
                    this.log(`[SHARE ACCEPTED] Block Share verified on network pool. Nonce: ${nonce}. Hash: ${rawHash}`, 'success');
                }
            } else {
                this.log(`[HASH] Nonce check: ${nonce} -> verification: failed (difficulty mismatch)`, 'normal');
            }

            // Schedule next step with random delay (simulate latency)
            const nextDelay = 800 + Math.random() * 1200;
            this.miningInterval = setTimeout(runMiningStep, nextDelay);
        };

        runMiningStep();
    }

    /**
     * Periodically update mining temperatures, hashrate, and metrics
     */
    startMetricsLoop() {
        this.metricsInterval = setInterval(() => {
            this.recalculateTemperature();
            this.recalculatePower();
            this.triggerUpdate();
        }, 1000);
    }

    /**
     * Calculate current hashrate with slight realistic fluctuation
     */
    getHashrate() {
        if (!this.isActive) return 0;
        // Basic fluctuation +/- 10%
        const variation = (Math.random() * 0.2) - 0.1; 
        return this.threads * this.baseHashratePerThread * (1 + variation);
    }

    /**
     * Calculate thermal values based on current active thread loads vs cooling fans
     */
    recalculateTemperature() {
        if (this.isActive) {
            // High threads generate more heat, high fan speed cools it down
            const heatGeneration = (this.threads * 12.5);
            const coolingEfficiency = (this.fanSpeed / 100) * 15;
            this.targetTemperature = 32.0 + Math.max(10, heatGeneration - coolingEfficiency);
        } else {
            // Return to ambient temperature of 32°C over time
            this.targetTemperature = 32.0;
        }

        // Smoothly step towards target temperature (inertia simulation)
        const diff = this.targetTemperature - this.temperature;
        this.temperature += diff * 0.15;
    }

    /**
     * Recalculate power draw (Watts)
     */
    recalculatePower() {
        if (!this.isActive) {
            this.powerConsumption = 0;
            return;
        }
        // Base mainboard draw 12W, plus ~18W per processing thread, plus cooling fan load
        this.powerConsumption = Math.round(12 + (this.threads * 18.5) + (this.fanSpeed * 0.35));
    }

    /**
     * Generate hex hash string
     */
    generateRandomHash() {
        const characters = '0123456789abcdef';
        let result = '0000c4'; // Simulated crypto prefix
        for (let i = 0; i < 26; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    /**
     * Helper to write output
     */
    log(msg, type = 'normal') {
        if (this.onLog) {
            this.onLog(msg, type);
        }
    }

    /**
     * Send structured state payload back to orchestrator
     */
    triggerUpdate() {
        if (this.onUpdate) {
            this.onUpdate({
                isActive: this.isActive,
                hashrate: this.getHashrate(),
                temperature: this.temperature,
                shares: this.sharesFound,
                blocks: this.blocksMined,
                power: this.powerConsumption
            });
        }
    }
}

// Global reference
window.Crypto4Miner = Crypto4Miner;

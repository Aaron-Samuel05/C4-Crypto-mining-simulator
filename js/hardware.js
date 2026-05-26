/**
 * CRYPTO4 MINING HARDWARE CATALOG & INVENTORY
 * Models specs, deployment inventory transactions, and affordability constraints.
 */
class Crypto4Hardware {
    constructor() {
        this.inventory = {
            gpu: {
                id: 'gpu',
                title: 'C4-Valkyrie GTX',
                cost: 2400,
                hashIncrease: 340, // MH/s
                powerIncrease: 650, // Watts
                owned: 0,
                specElId: 'gpu-owned-count'
            },
            asic: {
                id: 'asic',
                title: 'Crypto-Forge Pro',
                cost: 8500,
                hashIncrease: 2100, // MH/s
                powerIncrease: 2200, // Watts
                owned: 0,
                specElId: 'asic-owned-count'
            },
            quantum: {
                id: 'quantum',
                title: 'C4-Singularity X',
                cost: 45000,
                hashIncrease: 18500, // MH/s
                powerIncrease: 5000, // Watts
                owned: 0,
                specElId: 'quantum-owned-count'
            }
        };

        this.totalRigsOwned = 0;
        this.onPurchaseSuccess = null; // callback(rig, hashrateInc, powerInc)
        this.onPurchaseError = null; // callback(errorMessage)
    }

    /**
     * Set up buttons listeners
     */
    init(walletBalanceGetter) {
        this.getWalletBalanceUsd = walletBalanceGetter; // returns current wallet USD funds
        this.bindEvents();
        this.updateStoreUI();
    }

    /**
     * Bind click events on hardware purchase buttons
     */
    bindEvents() {
        const buttons = document.querySelectorAll('.btn-rig-purchase');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Find parent rig card data-rig attribute
                const rigType = btn.getAttribute('data-rig');
                this.purchaseRig(rigType);
            });
        });
    }

    /**
     * Conduct validation, cost deduction, and scaling multipliers
     */
    purchaseRig(type) {
        const rig = this.inventory[type];
        if (!rig) return;

        const currentUsdFunds = this.getWalletBalanceUsd();

        // Check wallet status and limits
        if (currentUsdFunds < rig.cost) {
            const shortage = rig.cost - currentUsdFunds;
            if (this.onPurchaseError) {
                this.onPurchaseError(`Insufficient funds. You need $${shortage.toFixed(2)} more to deploy the ${rig.title}. Start mining or connect your simulated Web3 wallet!`);
            }
            return;
        }

        // Execute transaction
        rig.owned++;
        this.totalRigsOwned++;
        
        // Render values
        this.updateStoreUI();

        // Broadcast changes
        if (this.onPurchaseSuccess) {
            this.onPurchaseSuccess(rig, rig.hashIncrease, rig.powerIncrease, rig.cost);
        }
    }

    /**
     * Get aggregate statistics of all owned rigs
     */
    getTotalStats() {
        let extraHashrate = 0;
        let extraPower = 0;
        
        Object.values(this.inventory).forEach(rig => {
            extraHashrate += rig.owned * rig.hashIncrease;
            extraPower += rig.owned * rig.powerIncrease;
        });

        return {
            hashrate: extraHashrate,
            power: extraPower
        };
    }

    /**
     * Redraw counts and titles
     */
    updateStoreUI() {
        // Redraw badge count
        const ownedBadge = document.getElementById('total-rigs-owned');
        if (ownedBadge) {
            ownedBadge.textContent = `OWNED: ${this.totalRigsOwned} ${this.totalRigsOwned === 1 ? 'RIG' : 'RIGS'}`;
        }

        // Redraw specific item cards
        Object.values(this.inventory).forEach(rig => {
            const countEl = document.getElementById(rig.specElId);
            if (countEl) {
                countEl.textContent = rig.owned;
                // Add mini visual animation highlight to the number
                if (rig.owned > 0) {
                    countEl.classList.add('text-green');
                    countEl.classList.remove('text-cyan');
                }
            }
        });
    }
}

// Global reference
window.Crypto4Hardware = Crypto4Hardware;

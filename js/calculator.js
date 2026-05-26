/**
 * CRYPTO4 MINING PROFITABILITY ENGINE
 * Handles mathematics, sliders, utility multipliers, and rendering yields.
 */
class Crypto4Calculator {
    constructor() {
        // Base constants for the simulated blockchain math
        this.BLOCK_REWARD = 2.5; // C4 coins per solved simulation block
        this.BASE_NETWORK_YIELD_PER_MHS = 0.000185; // C4 coins earned per hour per 1 MH/s Hashing Power
        
        // Dynamic factors
        this.hashrate = 500; // MH/s
        this.power = 650; // Watts
        this.electricityCost = 0.12; // $/kWh
        this.poolFee = 1.0; // Percentage
        this.coinPrice = 14.85; // USD/C4
        
        // Element caching
        this.elements = {};
    }

    /**
     * Cache all required inputs/outputs and bind callbacks
     */
    init() {
        // Inputs
        this.elements.sliderHashrate = document.getElementById('calc-hashrate');
        this.elements.sliderPower = document.getElementById('calc-power');
        this.elements.sliderElectricity = document.getElementById('calc-electricity');
        this.elements.sliderPoolFee = document.getElementById('calc-pool-fee');
        this.elements.sliderPrice = document.getElementById('calc-coin-price');
        
        // Display Labels
        this.elements.lblHashrate = document.getElementById('calc-hashrate-val');
        this.elements.lblPower = document.getElementById('calc-power-val');
        this.elements.lblElectricity = document.getElementById('calc-electricity-val');
        this.elements.lblPoolFee = document.getElementById('calc-pool-fee-val');
        this.elements.lblPrice = document.getElementById('calc-coin-price-val');
        
        // Table Cells
        this.elements.coinsHour = document.getElementById('calc-coins-hour');
        this.elements.costHour = document.getElementById('calc-cost-hour');
        this.elements.profitHour = document.getElementById('calc-profit-hour');
        
        this.elements.coinsDay = document.getElementById('calc-coins-day');
        this.elements.costDay = document.getElementById('calc-cost-day');
        this.elements.profitDay = document.getElementById('calc-profit-day');
        
        this.elements.coinsWeek = document.getElementById('calc-coins-week');
        this.elements.costWeek = document.getElementById('calc-cost-week');
        this.elements.profitWeek = document.getElementById('calc-profit-week');
        
        this.elements.coinsMonth = document.getElementById('calc-coins-month');
        this.elements.costMonth = document.getElementById('calc-cost-month');
        this.elements.profitMonth = document.getElementById('calc-profit-month');
        
        this.elements.coinsAnnual = document.getElementById('calc-annual-coins');
        this.elements.costAnnual = document.getElementById('calc-annual-cost');
        this.elements.profitAnnual = document.getElementById('calc-annual-profit');

        // Setup event bindings
        this.bindEvents();
        this.updateProjections();
    }

    /**
     * Bind sliders to calculate triggers
     */
    bindEvents() {
        const updateOnInput = (slider, displayFunc, stateVarName) => {
            if (!slider) return;
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this[stateVarName] = val;
                displayFunc(val);
                this.updateProjections();
            });
        };

        // Formatter functions
        updateOnInput(this.elements.sliderHashrate, (val) => {
            this.elements.lblHashrate.textContent = val >= 1000 
                ? (val / 1000).toFixed(2) + " GH/s" 
                : val.toFixed(0) + " MH/s";
        }, 'hashrate');

        updateOnInput(this.elements.sliderPower, (val) => {
            this.elements.lblPower.textContent = val.toFixed(0) + " Watts";
        }, 'power');

        updateOnInput(this.elements.sliderElectricity, (val) => {
            this.elements.lblElectricity.textContent = "$" + val.toFixed(2) + " / kWh";
        }, 'electricityCost');

        updateOnInput(this.elements.sliderPoolFee, (val) => {
            this.elements.lblPoolFee.textContent = val.toFixed(1) + "%";
        }, 'poolFee');

        updateOnInput(this.elements.sliderPrice, (val) => {
            this.elements.lblPrice.textContent = "$" + val.toFixed(2);
        }, 'coinPrice');
    }

    /**
     * Extends calculations dynamically to sync hardware purchases
     */
    setHashrate(newHashrateMhs) {
        this.hashrate = newHashrateMhs;
        if (this.elements.sliderHashrate) {
            this.elements.sliderHashrate.value = newHashrateMhs;
            this.elements.lblHashrate.textContent = newHashrateMhs >= 1000 
                ? (newHashrateMhs / 1000).toFixed(2) + " GH/s" 
                : newHashrateMhs.toFixed(0) + " MH/s";
        }
        this.updateProjections();
    }

    setPower(newPowerWatts) {
        this.power = newPowerWatts;
        if (this.elements.sliderPower) {
            this.elements.sliderPower.value = newPowerWatts;
            this.elements.lblPower.textContent = newPowerWatts.toFixed(0) + " Watts";
        }
        this.updateProjections();
    }

    /**
     * Compute actual metrics table
     */
    updateProjections() {
        if (!this.elements.coinsHour) return; // Guard initialization

        // Yield calculation (1 MH/s * Hourly Yield * hours)
        const hourlyCoinsRaw = this.hashrate * this.BASE_NETWORK_YIELD_PER_MHS;
        const poolTaxMultiplier = 1 - (this.poolFee / 100);
        const hourlyCoins = hourlyCoinsRaw * poolTaxMultiplier;
        
        // Power cost calculation (Power Watts / 1000 = kW * hours * electricityCost)
        const hourlyPowerKwh = this.power / 1000;
        const hourlyPowerCost = hourlyPowerKwh * this.electricityCost;

        // Periodic breakdowns
        const periods = {
            hour: 1,
            day: 24,
            week: 24 * 7,
            month: 24 * 30,
            annual: 24 * 365
        };

        const renderPeriod = (periodHours, coinElem, costElem, profitElem) => {
            const coins = hourlyCoins * periodHours;
            const cost = hourlyPowerCost * periodHours;
            const revenue = coins * this.coinPrice;
            const profit = revenue - cost;

            coinElem.textContent = coins.toFixed(4) + " C4";
            costElem.textContent = "$" + cost.toFixed(2);
            
            if (profit >= 0) {
                profitElem.textContent = "+$" + profit.toFixed(2);
                profitElem.className = "text-green text-right";
            } else {
                profitElem.textContent = "-$" + Math.abs(profit).toFixed(2);
                profitElem.className = "text-red text-right";
            }
        };

        // Render rows
        renderPeriod(periods.hour, this.elements.coinsHour, this.elements.costHour, this.elements.profitHour);
        renderPeriod(periods.day, this.elements.coinsDay, this.elements.costDay, this.elements.profitDay);
        renderPeriod(periods.week, this.elements.coinsWeek, this.elements.costWeek, this.elements.profitWeek);
        renderPeriod(periods.month, this.elements.coinsMonth, this.elements.costMonth, this.elements.profitMonth);
        renderPeriod(periods.annual, this.elements.coinsAnnual, this.elements.costAnnual, this.elements.profitAnnual);
    }
}

// Global reference
window.Crypto4Calculator = Crypto4Calculator;

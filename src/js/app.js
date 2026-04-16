/**
 * Core Pricing Logic Engine
 * Handles SaaS base pricing + conditional 1st-month setup fees
 */
function calculatePricing(tier, cycle, monthIndex = 1) {
    let totalDue = 0;
    let lineItems = [];

    if (cycle === "monthly") {
        // Always add the base monthly subscription
        lineItems.push({ name: "Biaya Bulanan", amount: tier.priceMonthly });
        totalDue += tier.priceMonthly;

        // Apply Setup Fee ONLY if it is Month 1
        if (monthIndex === 1 && tier.setupFee) {
            lineItems.push({ name: "Setup (1x Bayar)", amount: tier.setupFee });
            totalDue += tier.setupFee;
        }
    } 
    else if (cycle === "yearly") {
        // Yearly plan (waives the setup fee)
        lineItems.push({ name: "Biaya Tahunan", amount: tier.priceYearly });
        totalDue += tier.priceYearly;
    }

    return {
        totalDue: totalDue,
        breakdown: lineItems,
        renewalPrice: cycle === "monthly" ? tier.priceMonthly : tier.priceYearly
    };
}

// Example function that triggers when the user toggles Monthly/Yearly or selects a plan
function updatePricingUI(tierData, cycleSelector) {
    // 1. Run the calculation for checkout (Month 1)
    const pricing = calculatePricing(tierData, cycleSelector, 1);
    
    // 2. Select your DOM elements (Ensure these IDs/classes match your index.html)
    const priceDisplay = document.querySelector('.price-display');
    const setupBadge = document.querySelector('.setup-badge-container');
    const breakdownList = document.querySelector('.invoice-breakdown');

    // 3. Update the main price prominent display
    priceDisplay.textContent = formatIDR(pricing.totalDue);

    // 4. UX: Handle the Setup Fee Badge visibility to prevent sticker shock
    if (cycleSelector === 'monthly' && tierData.setupFee) {
        // Show the "+ Setup (1x Bayar)" badge explicitly
        setupBadge.innerHTML = `<span class="badge bg-soft-warning text-dark mt-2">
            + Setup (1x Bayar) ${formatIDR(tierData.setupFee)} di Bulan 1
        </span>`;
        setupBadge.style.display = 'block';
    } else {
        // Hide badge for yearly or renewals
        setupBadge.style.display = 'none';
        setupBadge.innerHTML = '';
    }

    // 5. Render the Line Items for the invoice/checkout table
    if (breakdownList) {
        breakdownList.innerHTML = pricing.breakdown.map(item => `
            <div class="d-flex justify-content-between border-bottom py-2">
                <span class="text-muted">${item.name}</span>
                <span class="fw-bold">${formatIDR(item.amount)}</span>
            </div>
        `).join('');
    }
}

const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// --- I18N DICTIONARY ---
const i18n = {
    en: { pageTitle: "Project Proposal & Payment Simulator", addonsTitle: "Project Add-ons", includeDomain: "Include Domain (.com) Registration", domainSub: "First year promo rate applied.", termsTitle: "App Payment Terms", payFull: "Full Payment (1x)", payDp: "Down Payment (50%)", payInstallment: "Installments (3x)", supportTitle: "Service Category", supportOptNone: "Custom / No Category", supportOptTier0: "Tier 0: Sandboxing (Testing/Dev)", supportOptTier1: "Tier 1: Starter (Pro Business)", supportOptTier2: "Tier 2: Medium (Growing Scale)", supportOptTier3: "Tier 3: Enterprise (Corporate Scale)", billedYearly: "Billed Yearly (Discounted)", billedMonthly: "Billed Monthly", saveText: "Save", yearlySavings: "Yearly Savings Info", monthsAt: "12 Months @", yearlyUpfront: "Yearly Upfront =", btnGenerate: "Generate Invoice Link & Send via WhatsApp", receiptTitle: "Official Estimate", dateIssued: "Date Issued:", billedTo: "Billed To:", projectRef: "Project Ref:", subtotal: "Subtotal", total: "TOTAL", dueNow: "DUE NOW", settlement100: "100% Settlement", downPayment50: "50% Down Payment", month1of3: "Month 1 of 3", thankYou: "Thank you for building with bagusify.", supportNote: "*Selected category affects monthly/yearly licensing." },
    id: { pageTitle: "Proposal Proyek & Simulator Pembayaran", addonsTitle: "Tambahan Proyek", includeDomain: "Termasuk Registrasi Domain (.com)", domainSub: "Berlaku tarif promo tahun pertama.", termsTitle: "Termin Pembayaran Aplikasi", payFull: "Pelunasan Penuh (1x)", payDp: "Uang Muka / DP (50%)", payInstallment: "Cicilan (3x)", supportTitle: "Kategori Layanan", supportOptNone: "Kustom / Tanpa Kategori", supportOptTier0: "Tier 0: Sandboxing (Uji Coba/Dev)", supportOptTier1: "Tier 1: Starter (Bisnis Profesional)", supportOptTier2: "Tier 2: Medium (Skala Berkembang)", supportOptTier3: "Tier 3: Enterprise (Skala Korporasi)", billedYearly: "Tagihan Tahunan (Diskon)", billedMonthly: "Tagihan Bulanan", saveText: "Hemat", yearlySavings: "Info Hemat Tahunan", monthsAt: "12 Bulan @", yearlyUpfront: "Bayar di Muka =", btnGenerate: "Buat Link Invoice & Kirim via WhatsApp", receiptTitle: "Estimasi Resmi", dateIssued: "Tanggal Rilis:", billedTo: "Ditagihkan Ke:", projectRef: "Ref Proyek:", subtotal: "Subtotal", total: "TOTAL", dueNow: "JATUH TEMPO", settlement100: "Pelunasan 100%", downPayment50: "Uang Muka 50%", month1of3: "Bulan 1 dari 3", thankYou: "Terima kasih telah membangun bersama bagusify.", supportNote: "*Kategori yang dipilih mempengaruhi lisensi bulanan/tahunan." }
};

// Initialize empty global variable for the dynamically loaded data
let masterData = {};
const state = { lang: 'en', includeDomain: false, paymentMode: 'full', supportTier: 'none', supportCycle: 'yearly' };

let els = {};
const setLanguage = (lang) => {
    state.lang = lang;
    document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-lang-id').classList.toggle('active', lang === 'id');
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            if(el.tagName === 'OPTION') el.text = i18n[lang][key];
            else el.textContent = i18n[lang][key];
        }
    });

    if (masterData && masterData.supportTiers) {
        els.selSupport.innerHTML = '';
        masterData.supportTiers.forEach(tier => {
            const opt = document.createElement('option');
            opt.value = tier.id;
            if (tier.id === 'none') {
                opt.text = i18n[lang].supportOptNone;
            } else {
                opt.text = `Tier ${tier.id.replace('tier', '')}: ${tier.name} - ${tier.details[lang]}`;
            }
            if (state.supportTier === tier.id) opt.selected = true;
            els.selSupport.appendChild(opt);
        });
    }

    if (Object.keys(masterData).length > 0) renderInvoice();
};

const renderInvoice = () => {
    if (!masterData.baseItems) return; // Guard clause if data isn't loaded

    let currentItems = [...masterData.baseItems];
    if (state.includeDomain) currentItems.push(masterData.addOns.domain);

    const selectedSupport = masterData.supportTiers.find(t => t.id === state.supportTier);
    if (selectedSupport && selectedSupport.id !== 'none') {
        const supportRate = state.supportCycle === 'yearly' ? selectedSupport.yearly : selectedSupport.monthly;
        const cycleText = state.supportCycle === 'yearly' ? (state.lang === 'en' ? '(1 Year)' : '(1 Tahun)') : (state.lang === 'en' ? '(1 Month)' : '(1 Bulan)');
        
        currentItems.push({
            desc: { en: `${selectedSupport.name} ${cycleText}`, id: `${selectedSupport.name} ${cycleText}` },
            details: selectedSupport.details,
            rate: supportRate, qty: 1
        });

        els.cycleWrapper.style.display = 'block';
        if (state.supportCycle === 'yearly') {
            els.compUI.classList.add('visible');
            const twelveMonthsCost = selectedSupport.monthly * 12;
            const savings = twelveMonthsCost - selectedSupport.yearly;
            els.compSaveAmt.textContent = `${i18n[state.lang].saveText} ${formatIDR(savings)}`;
            els.compMoRate.textContent = formatIDR(selectedSupport.monthly);
            els.compMoTotal.textContent = formatIDR(twelveMonthsCost);
            els.compYrTotal.textContent = formatIDR(selectedSupport.yearly);
        } else els.compUI.classList.remove('visible');
    } else {
        els.cycleWrapper.style.display = 'none';
        els.compUI.classList.remove('visible');
    }

    let subtotal = currentItems.reduce((sum, item) => sum + (item.rate * item.qty), 0);
    
    els.itemsContainer.innerHTML = currentItems.map(item => `
        <div class="item-row">
            <div class="item-desc">${item.qty}x ${item.desc[state.lang]}</div>
            <div class="item-details">${item.details[state.lang]}</div>
            <div class="item-calc">
                <span class="text-muted fw-medium">@ ${formatIDR(item.rate)}</span>
                <span class="mono-num">${formatIDR(item.rate * item.qty)}</span>
            </div>
        </div>
    `).join('');

    els.subtotal.textContent = formatIDR(subtotal);
    els.total.textContent = formatIDR(subtotal);

    if (state.paymentMode === 'full') {
        els.dueSub.textContent = i18n[state.lang].settlement100;
        els.dueAmount.textContent = formatIDR(subtotal);
    } else if (state.paymentMode === 'dp') {
        els.dueSub.textContent = i18n[state.lang].downPayment50;
        els.dueAmount.textContent = formatIDR(Math.round(subtotal / 2));
    } else if (state.paymentMode === 'cicilan') {
        els.dueSub.textContent = i18n[state.lang].month1of3;
        els.dueAmount.textContent = formatIDR(Math.round(subtotal / 3));
    }

    document.querySelectorAll('input[name="pay_mode"], input[name="support_cycle"]').forEach(radio => {
        radio.parentElement.classList.toggle('active', radio.checked);
    });
};

// --- NEW: INITIALIZATION AND DATA FETCHING ---
const initApp = async () => {
    // Cache DOM Elements safely after DOM is loaded
    els = {
        itemsContainer: document.getElementById('ui-items'), subtotal: document.getElementById('ui-subtotal'), total: document.getElementById('ui-total'), dueSub: document.getElementById('ui-due-sub'), dueAmount: document.getElementById('ui-due-amount'), chkDomain: document.getElementById('ctrl-domain'), radModes: document.getElementsByName('pay_mode'), selSupport: document.getElementById('ctrl-support-tier'), radCycles: document.getElementsByName('support_cycle'), cycleWrapper: document.getElementById('support-cycle-wrapper'), compUI: document.getElementById('comparison-ui'), compSaveAmt: document.getElementById('comp-save-amt'), compMoRate: document.getElementById('comp-mo-rate'), compMoTotal: document.getElementById('comp-mo-total'), compYrTotal: document.getElementById('comp-yr-total')
    };

    // Set initial language
    setLanguage('en');

    // 1. Parse URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const rawRefId = urlParams.get('ref');
    const tierParam = urlParams.get('tier');

    if (!rawRefId) {
        // Handle no ref parameter (e.g., show an error message or load a demo fallback)
        els.itemsContainer.innerHTML = `<div class="alert alert-warning">No Project Reference</div>`;
        return;
    }

    // Sanitize path parameter to prevent path traversal
    const refId = rawRefId.replace(/[^a-zA-Z0-9_\-]/g, '');

    try {
        // 2. Fetch the corresponding JSON file (e.g., sifatih.json)
        const response = await fetch(`src/data/${refId}.json`);
        
        if (!response.ok) throw new Error(`Project Reference '${refId}' not found.`);
        
        masterData = await response.json();

        // 3. Populate Header Data and Update Lang Option
        document.getElementById('ui-date').textContent = masterData.issueDate;
        document.getElementById('ui-client').textContent = masterData.client.name;
        document.getElementById('ui-project').textContent = masterData.project;

        if (tierParam && masterData.supportTiers.some(t => t.id === tierParam)) {
            state.supportTier = tierParam;
            els.selSupport.style.display = 'none';
        }

        setLanguage(state.lang);

        // --- NEW PRICING INTEGRATION ---
        // Helper to grab the active tier object and run our new pricing engine
        const syncPricing = () => {
            // Find the full tier object from JSON based on user's selected dropdown state
            const currentTierData = masterData.supportTiers.find(t => t.id === state.supportTier);
            
            // Safety check
            if(!currentTierData) return;

            // Trigger the DOM update using the state's cycle ('monthly' or 'yearly')
            updatePricingUI(currentTierData, state.supportCycle);
        };

        // 4. Attach Listeners (Notice we call BOTH renderInvoice() and syncPricing())
        els.chkDomain.addEventListener('change', (e) => { 
            state.includeDomain = e.target.checked; 
            renderInvoice(); 
        });
        
        els.selSupport.addEventListener('change', (e) => { 
            state.supportTier = e.target.value; 
            renderInvoice(); 
            syncPricing(); // Re-calculate when tier changes (e.g., Basic to Pro)
        });
        
        els.radModes.forEach(radio => radio.addEventListener('change', (e) => { 
            state.paymentMode = e.target.value; 
            renderInvoice(); 
        }));
        
        els.radCycles.forEach(radio => radio.addEventListener('change', (e) => { 
            state.supportCycle = e.target.value; 
            renderInvoice(); 
            syncPricing(); // Re-calculate when cycle toggles (Monthly/Yearly)
        }));

        // 5. Render Initial State (Month 1 on Load)
        renderInvoice();
        syncPricing(); // <--- CALL IT HERE on initial page load!

    } catch (error) {
        console.error("Error loading project data:", error);
        els.itemsContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
};

// Run the app once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
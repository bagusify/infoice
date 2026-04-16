/**
 * Bagusify Infoice — Pricing Engine v2
 * Aligned with sifatih.json schema: priceMonthly, priceYearly, setupFee
 */

const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// --- I18N DICTIONARY ---
const i18n = {
    en: {
        pageTitle: "Project Proposal & Payment Simulator",
        addonsTitle: "Project Add-ons",
        includeDomain: "Include Domain (.com) Registration",
        domainSub: "First year promo rate applied.",
        termsTitle: "App Payment Terms",
        payFull: "Full Payment (1x)",
        payDp: "Down Payment (50%)",
        payInstallment: "Installments (3x)",
        supportTitle: "Service Category",
        supportOptNone: "Custom / No Category",
        supportOptTier0: "Tier 0: Sandboxing (Testing/Dev)",
        supportOptTier1: "Tier 1: Starter (Pro Business)",
        supportOptTier2: "Tier 2: Medium (Growing Scale)",
        supportOptTier3: "Tier 3: Enterprise (Corporate Scale)",
        billedYearly: "Billed Yearly (Discounted)",
        billedMonthly: "Billed Monthly",
        saveText: "Save",
        yearlySavings: "Yearly Savings Info",
        monthsAt: "12 Months @",
        yearlyUpfront: "Yearly Upfront =",
        btnGenerate: "Generate Invoice Link & Send via WhatsApp",
        receiptTitle: "Official Estimate",
        dateIssued: "Date Issued:",
        billedTo: "Billed To:",
        projectRef: "Project Ref:",
        subtotal: "Subtotal",
        total: "TOTAL",
        dueNow: "DUE NOW",
        settlement100: "100% Settlement",
        downPayment50: "50% Down Payment",
        month1of3: "Month 1 of 3",
        thankYou: "Thank you for building with bagusify.",
        supportNote: "*Selected category affects monthly/yearly licensing.",
        setupFeeLabel: "Implementation Fee (1x)",
        setupFeeNote: "One-time charge on first invoice",
        setupWaived: "Setup fee waived with yearly plan"
    },
    id: {
        pageTitle: "Proposal Proyek & Simulator Pembayaran",
        addonsTitle: "Tambahan Proyek",
        includeDomain: "Termasuk Registrasi Domain (.com)",
        domainSub: "Berlaku tarif promo tahun pertama.",
        termsTitle: "Termin Pembayaran Aplikasi",
        payFull: "Pelunasan Penuh (1x)",
        payDp: "Uang Muka / DP (50%)",
        payInstallment: "Cicilan (3x)",
        supportTitle: "Kategori Layanan",
        supportOptNone: "Kustom / Tanpa Kategori",
        supportOptTier0: "Tier 0: Sandboxing (Uji Coba/Dev)",
        supportOptTier1: "Tier 1: Starter (Bisnis Profesional)",
        supportOptTier2: "Tier 2: Medium (Skala Berkembang)",
        supportOptTier3: "Tier 3: Enterprise (Skala Korporasi)",
        billedYearly: "Tagihan Tahunan (Diskon)",
        billedMonthly: "Tagihan Bulanan",
        saveText: "Hemat",
        yearlySavings: "Info Hemat Tahunan",
        monthsAt: "12 Bulan @",
        yearlyUpfront: "Bayar di Muka =",
        btnGenerate: "Buat Link Invoice & Kirim via WhatsApp",
        receiptTitle: "Estimasi Resmi",
        dateIssued: "Tanggal Rilis:",
        billedTo: "Ditagihkan Ke:",
        projectRef: "Ref Proyek:",
        subtotal: "Subtotal",
        total: "TOTAL",
        dueNow: "JATUH TEMPO",
        settlement100: "Pelunasan 100%",
        downPayment50: "Uang Muka 50%",
        month1of3: "Bulan 1 dari 3",
        thankYou: "Terima kasih telah membangun bersama bagusify.",
        supportNote: "*Kategori yang dipilih mempengaruhi lisensi bulanan/tahunan.",
        setupFeeLabel: "Biaya Implementasi (1x)",
        setupFeeNote: "Ditagihkan satu kali di invoice pertama",
        setupWaived: "Biaya setup gratis untuk paket tahunan"
    }
};

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
            if (el.tagName === 'OPTION') el.text = i18n[lang][key];
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
                opt.text = `${tier.name} — ${tier.details[lang]}`;
            }
            if (state.supportTier === tier.id) opt.selected = true;
            els.selSupport.appendChild(opt);
        });
    }

    if (Object.keys(masterData).length > 0) renderInvoice();
};

/**
 * Main render function — single source of truth for the receipt
 * Reads JSON properties: priceMonthly, priceYearly, setupFee
 */
const renderInvoice = () => {
    if (!masterData.baseItems) return;

    const lang = state.lang;
    let currentItems = [...masterData.baseItems];

    if (state.includeDomain) currentItems.push(masterData.addOns.domain);

    const selectedSupport = masterData.supportTiers.find(t => t.id === state.supportTier);
    let setupFeeAmount = 0;
    let showSetupFee = false;

    if (selectedSupport && selectedSupport.id !== 'none') {
        const isYearly = state.supportCycle === 'yearly';
        const supportRate = isYearly ? selectedSupport.priceYearly : selectedSupport.priceMonthly;
        const cycleText = isYearly
            ? (lang === 'en' ? '(1 Year)' : '(1 Tahun)')
            : (lang === 'en' ? '(1 Month)' : '(1 Bulan)');

        currentItems.push({
            desc: { en: `${selectedSupport.name} ${cycleText}`, id: `${selectedSupport.name} ${cycleText}` },
            details: selectedSupport.details,
            rate: supportRate,
            qty: 1
        });

        // Setup fee logic: only applies on monthly cycle, month 1
        if (!isYearly && selectedSupport.setupFee > 0) {
            setupFeeAmount = selectedSupport.setupFee;
            showSetupFee = true;
        }

        els.cycleWrapper.style.display = 'block';

        if (isYearly) {
            els.compUI.classList.add('visible');
            const twelveMonthsCost = selectedSupport.priceMonthly * 12;
            const savings = twelveMonthsCost - selectedSupport.priceYearly;
            els.compSaveAmt.textContent = `${i18n[lang].saveText} ${formatIDR(savings)}`;
            els.compMoRate.textContent = formatIDR(selectedSupport.priceMonthly);
            els.compMoTotal.textContent = formatIDR(twelveMonthsCost);
            els.compYrTotal.textContent = formatIDR(selectedSupport.priceYearly);
        } else {
            els.compUI.classList.remove('visible');
        }
    } else {
        els.cycleWrapper.style.display = 'none';
        els.compUI.classList.remove('visible');
    }

    // Calculate subtotal from line items
    let subtotal = currentItems.reduce((sum, item) => sum + (item.rate * item.qty), 0);

    // Render line items
    els.itemsContainer.innerHTML = currentItems.map(item => `
        <div class="item-row">
            <div class="item-desc">${item.qty}x ${item.desc[lang]}</div>
            <div class="item-details">${item.details[lang]}</div>
            <div class="item-calc">
                <span class="text-muted fw-medium">@ ${formatIDR(item.rate)}</span>
                <span class="mono-num">${formatIDR(item.rate * item.qty)}</span>
            </div>
        </div>
    `).join('');

    // Render setup fee row (if applicable)
    const setupRow = els.itemsContainer.closest('.receipt') 
        ? els.itemsContainer.closest('.receipt').querySelector('#ui-setup-row') 
        : document.getElementById('ui-setup-row');

    if (setupRow) {
        if (showSetupFee) {
            setupRow.style.display = 'flex';
            setupRow.querySelector('.setup-fee-label').textContent = i18n[lang].setupFeeLabel;
            setupRow.querySelector('.setup-fee-note').textContent = i18n[lang].setupFeeNote;
            setupRow.querySelector('.setup-fee-amount').textContent = formatIDR(setupFeeAmount);
        } else {
            setupRow.style.display = 'none';
        }
    }

    // Grand total = subtotal + setup fee
    const grandTotal = subtotal + setupFeeAmount;

    els.subtotal.textContent = formatIDR(subtotal);
    els.total.textContent = formatIDR(grandTotal);

    // Setup fee waived badge
    const setupBadge = document.getElementById('ui-setup-badge');
    if (setupBadge) {
        const tierHasSetup = selectedSupport && selectedSupport.setupFee > 0;
        if (state.supportCycle === 'yearly' && tierHasSetup) {
            setupBadge.style.display = 'inline-flex';
            setupBadge.querySelector('span').textContent = i18n[lang].setupWaived;
        } else {
            setupBadge.style.display = 'none';
        }
    }

    // Due now calculation (based on grand total including setup fee)
    if (state.paymentMode === 'full') {
        els.dueSub.textContent = i18n[lang].settlement100;
        els.dueAmount.textContent = formatIDR(grandTotal);
    } else if (state.paymentMode === 'dp') {
        els.dueSub.textContent = i18n[lang].downPayment50;
        els.dueAmount.textContent = formatIDR(Math.round(grandTotal / 2));
    } else if (state.paymentMode === 'cicilan') {
        els.dueSub.textContent = i18n[lang].month1of3;
        els.dueAmount.textContent = formatIDR(Math.round(grandTotal / 3));
    }

    // Toggle active states on radios
    document.querySelectorAll('input[name="pay_mode"], input[name="support_cycle"]').forEach(radio => {
        radio.parentElement.classList.toggle('active', radio.checked);
    });
};

// --- INITIALIZATION ---
const initApp = async () => {
    els = {
        itemsContainer: document.getElementById('ui-items'),
        subtotal: document.getElementById('ui-subtotal'),
        total: document.getElementById('ui-total'),
        dueSub: document.getElementById('ui-due-sub'),
        dueAmount: document.getElementById('ui-due-amount'),
        chkDomain: document.getElementById('ctrl-domain'),
        radModes: document.getElementsByName('pay_mode'),
        selSupport: document.getElementById('ctrl-support-tier'),
        radCycles: document.getElementsByName('support_cycle'),
        cycleWrapper: document.getElementById('support-cycle-wrapper'),
        compUI: document.getElementById('comparison-ui'),
        compSaveAmt: document.getElementById('comp-save-amt'),
        compMoRate: document.getElementById('comp-mo-rate'),
        compMoTotal: document.getElementById('comp-mo-total'),
        compYrTotal: document.getElementById('comp-yr-total')
    };

    setLanguage('en');

    const urlParams = new URLSearchParams(window.location.search);
    const rawRefId = urlParams.get('ref');
    const tierParam = urlParams.get('tier');

    if (!rawRefId) {
        els.itemsContainer.innerHTML = `<div class="alert alert-warning">No Project Reference</div>`;
        return;
    }

    const refId = rawRefId.replace(/[^a-zA-Z0-9_\-]/g, '');

    try {
        const response = await fetch(`src/data/${refId}.json`);
        if (!response.ok) throw new Error(`Project Reference '${refId}' not found.`);
        masterData = await response.json();

        document.getElementById('ui-date').textContent = masterData.issueDate;
        document.getElementById('ui-client').textContent = masterData.client.name;
        document.getElementById('ui-project').textContent = masterData.project;

        if (tierParam && masterData.supportTiers.some(t => t.id === tierParam)) {
            state.supportTier = tierParam;
            els.selSupport.style.display = 'none';
        }

        setLanguage(state.lang);

        // Attach listeners
        els.chkDomain.addEventListener('change', (e) => {
            state.includeDomain = e.target.checked;
            renderInvoice();
        });

        els.selSupport.addEventListener('change', (e) => {
            state.supportTier = e.target.value;
            renderInvoice();
        });

        els.radModes.forEach(radio => radio.addEventListener('change', (e) => {
            state.paymentMode = e.target.value;
            renderInvoice();
        }));

        els.radCycles.forEach(radio => radio.addEventListener('change', (e) => {
            state.supportCycle = e.target.value;
            renderInvoice();
        }));

        renderInvoice();

    } catch (error) {
        console.error("Error loading project data:", error);
        els.itemsContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
};

document.addEventListener('DOMContentLoaded', initApp);

        const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

        // --- I18N DICTIONARY ---
        const i18n = {
            en: {
                pageTitle: "Project Proposal & Payment Simulator", addonsTitle: "Project Add-ons", includeDomain: "Include Domain (.com) Registration", domainSub: "First year promo rate applied.", termsTitle: "App Payment Terms", payFull: "Full Payment (1x)", payDp: "Down Payment (50%)", payInstallment: "Installments (3x)", supportTitle: "Maintenance & Support", supportOptNone: "No Active Support (Pay-per-incident)", supportOptStarter: "Starter Support (Email, 48h SLA)", supportOptPremium: "Premium Tier 1 (WhatsApp, 24h SLA)", billedYearly: "Billed Yearly (Discounted)", billedMonthly: "Billed Monthly", saveText: "Save", yearlySavings: "Yearly Savings Info", monthsAt: "12 Months @", yearlyUpfront: "Yearly Upfront =", btnGenerate: "Generate Invoice Link & Send via WhatsApp", receiptTitle: "Official Estimate", dateIssued: "Date Issued:", billedTo: "Billed To:", projectRef: "Project Ref:", subtotal: "Subtotal", total: "TOTAL", dueNow: "DUE NOW", settlement100: "100% Settlement", downPayment50: "50% Down Payment", month1of3: "Month 1 of 3", thankYou: "Thank you for building with bagusify.", supportNote: "*Premium Support Tier 1 applies after month 6."
            },
            id: {
                pageTitle: "Proposal Proyek & Simulator Pembayaran", addonsTitle: "Tambahan Proyek", includeDomain: "Termasuk Registrasi Domain (.com)", domainSub: "Berlaku tarif promo tahun pertama.", termsTitle: "Termin Pembayaran Aplikasi", payFull: "Pelunasan Penuh (1x)", payDp: "Uang Muka / DP (50%)", payInstallment: "Cicilan (3x)", supportTitle: "Pemeliharaan & Dukungan", supportOptNone: "Tanpa Dukungan Aktif (Bayar per insiden)", supportOptStarter: "Dukungan Starter (Email, SLA 48 jam)", supportOptPremium: "Premium Tier 1 (WhatsApp, SLA 24 jam)", billedYearly: "Tagihan Tahunan (Diskon)", billedMonthly: "Tagihan Bulanan", saveText: "Hemat", yearlySavings: "Info Hemat Tahunan", monthsAt: "12 Bulan @", yearlyUpfront: "Bayar di Muka =", btnGenerate: "Buat Link Invoice & Kirim via WhatsApp", receiptTitle: "Estimasi Resmi", dateIssued: "Tanggal Rilis:", billedTo: "Ditagihkan Ke:", projectRef: "Ref Proyek:", subtotal: "Subtotal", total: "TOTAL", dueNow: "JATUH TEMPO", settlement100: "Pelunasan 100%", downPayment50: "Uang Muka 50%", month1of3: "Bulan 1 dari 3", thankYou: "Terima kasih telah membangun bersama bagusify.", supportNote: "*Dukungan Premium Tier 1 berlaku setelah bulan ke-6."
            }
        };

        // --- MASTER DATA WITH TRANSLATIONS ---
        const sifatihMasterData = {
            issueDate: "14 April 2026",
            client: { name: "Mitra Flow" },
            project: "Sifatih Core",
            baseItems: [
                { id: "core", desc: { en: "Main Application Architecture", id: "Arsitektur Aplikasi Utama" }, details: { en: "System delivery, API integration, and database migration.", id: "Pengiriman sistem, integrasi API, dan migrasi database." }, rate: 3900000, qty: 1 }
            ],
            addOns: {
                domain: { id: "dom", desc: { en: "Domain Registration (.com)", id: "Registrasi Domain (.com)" }, details: { en: "Year 1 Promo (Renews at Rp 215k/yr)", id: "Promo Tahun 1 (Perpanjangan Rp 215rb/thn)" }, rate: 121900, qty: 1 }
            },
            supportTiers: [
                { id: "none", monthly: 0, yearly: 0 },
                { id: "starter", name: "Starter Support", details: { en: "Email support, 48h SLA", id: "Dukungan Email, SLA 48 jam" }, monthly: 135000, yearly: 1200000 },
                { id: "premium", name: "Premium Tier 1", details: { en: "WhatsApp Priority, 24h SLA", id: "Prioritas WhatsApp, SLA 24 jam" }, monthly: 200000, yearly: 1500000 }
            ]
        };

        const state = { lang: 'en', includeDomain: false, paymentMode: 'full', supportTier: 'none', supportCycle: 'yearly' };

        const els = {
            itemsContainer: document.getElementById('ui-items'), subtotal: document.getElementById('ui-subtotal'), total: document.getElementById('ui-total'), dueSub: document.getElementById('ui-due-sub'), dueAmount: document.getElementById('ui-due-amount'), chkDomain: document.getElementById('ctrl-domain'), radModes: document.getElementsByName('pay_mode'), selSupport: document.getElementById('ctrl-support-tier'), radCycles: document.getElementsByName('support_cycle'), cycleWrapper: document.getElementById('support-cycle-wrapper'), compUI: document.getElementById('comparison-ui')
        };

        const setLanguage = (lang) => {
            state.lang = lang;
            
            // Update UI Buttons
            document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
            document.getElementById('btn-lang-id').classList.toggle('active', lang === 'id');
            
            // Translate all static elements with data-i18n
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[lang][key]) {
                    // Check if it's an option tag, we need to keep the value
                    if(el.tagName === 'OPTION') {
                         el.text = i18n[lang][key];
                    } else {
                         el.innerHTML = i18n[lang][key];
                    }
                }
            });

            renderInvoice(); // Re-render dynamic items
        };

        const renderInvoice = () => {
            let currentItems = [...sifatihMasterData.baseItems];
            if (state.includeDomain) currentItems.push(sifatihMasterData.addOns.domain);

            const selectedSupport = sifatihMasterData.supportTiers.find(t => t.id === state.supportTier);
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
                    const saveWord = i18n[state.lang].saveText;
                    
                    document.getElementById('comp-save-amt').textContent = `${saveWord} ${formatIDR(savings)}`;
                    document.getElementById('comp-mo-rate').textContent = formatIDR(selectedSupport.monthly);
                    document.getElementById('comp-mo-total').textContent = formatIDR(twelveMonthsCost);
                    document.getElementById('comp-yr-total').textContent = formatIDR(selectedSupport.yearly);
                } else {
                    els.compUI.classList.remove('visible');
                }
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
                els.dueSub.innerHTML = i18n[state.lang].settlement100;
                els.dueAmount.textContent = formatIDR(subtotal);
            } else if (state.paymentMode === 'dp') {
                els.dueSub.innerHTML = i18n[state.lang].downPayment50;
                els.dueAmount.textContent = formatIDR(subtotal / 2);
            } else if (state.paymentMode === 'cicilan') {
                els.dueSub.innerHTML = i18n[state.lang].month1of3;
                els.dueAmount.textContent = formatIDR(subtotal / 3);
            }

            document.querySelectorAll('input[name="pay_mode"], input[name="support_cycle"]').forEach(radio => {
                radio.parentElement.classList.toggle('active', radio.checked);
            });
        };

        // Event Listeners
        els.chkDomain.addEventListener('change', (e) => { state.includeDomain = e.target.checked; renderInvoice(); });
        els.selSupport.addEventListener('change', (e) => { state.supportTier = e.target.value; renderInvoice(); });
        els.radModes.forEach(radio => radio.addEventListener('change', (e) => { state.paymentMode = e.target.value; renderInvoice(); }));
        els.radCycles.forEach(radio => radio.addEventListener('change', (e) => { state.supportCycle = e.target.value; renderInvoice(); }));

        // Init
        document.getElementById('ui-date').textContent = sifatihMasterData.issueDate;
        document.getElementById('ui-client').textContent = sifatihMasterData.client.name;
        document.getElementById('ui-project').textContent = sifatihMasterData.project;
        setLanguage('en'); // Boot up in English
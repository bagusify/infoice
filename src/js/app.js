  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

        const sifatihMasterData = {
            issueDate: "14 April 2026",
            client: { name: "Mitra Flow" },
            project: "Sifatih Core",
            baseItems: [
                { id: "core", description: "Main Application Architecture", details: "System delivery, API integration, and database migration.", rate: 3900000, qty: 1 }
            ],
            addOns: {
                domain: { id: "dom", description: "Domain Registration (.com)", details: "Year 1 Promo (Renews at Rp 215k/yr)", rate: 121900, qty: 1 }
            }
        };

        const state = { includeDomain: false, paymentMode: 'full' };

        const els = {
            itemsContainer: document.getElementById('ui-items'),
            subtotal: document.getElementById('ui-subtotal'),
            total: document.getElementById('ui-total'),
            dueLabel: document.getElementById('ui-due-label'),
            dueSub: document.getElementById('ui-due-sub'),
            dueAmount: document.getElementById('ui-due-amount'),
            chkDomain: document.getElementById('ctrl-domain'),
            radModes: document.getElementsByName('pay_mode')
        };

        const renderInvoice = () => {
            let currentItems = [...sifatihMasterData.baseItems];
            if (state.includeDomain) currentItems.push(sifatihMasterData.addOns.domain);

            let subtotal = currentItems.reduce((sum, item) => sum + (item.rate * item.qty), 0);
            
            els.itemsContainer.innerHTML = currentItems.map(item => `
                <div class="item-row">
                    <div class="item-desc">${item.qty}x ${item.description}</div>
                    <div class="item-details">${item.details}</div>
                    <div class="item-calc">
                        <span class="text-muted fw-medium">@ ${formatIDR(item.rate)}</span>
                        <span class="mono-num">${formatIDR(item.rate * item.qty)}</span>
                    </div>
                </div>
            `).join('');

            els.subtotal.textContent = formatIDR(subtotal);
            els.total.textContent = formatIDR(subtotal);

            if (state.paymentMode === 'full') {
                els.dueLabel.innerHTML = "DUE NOW";
                els.dueSub.innerHTML = "100% Settlement";
                els.dueAmount.textContent = formatIDR(subtotal);
            } else if (state.paymentMode === 'dp') {
                els.dueLabel.innerHTML = "DUE NOW";
                els.dueSub.innerHTML = "50% Down Payment";
                els.dueAmount.textContent = formatIDR(subtotal / 2);
            } else if (state.paymentMode === 'cicilan') {
                els.dueLabel.innerHTML = "DUE NOW";
                els.dueSub.innerHTML = "Month 1 of 3";
                els.dueAmount.textContent = formatIDR(subtotal / 3);
            }

            document.querySelectorAll('.pay-opt-card').forEach(card => card.classList.remove('active'));
            document.getElementById(`card-${state.paymentMode}`).classList.add('active');
        };

        els.chkDomain.addEventListener('change', (e) => {
            state.includeDomain = e.target.checked;
            renderInvoice();
        });

        els.radModes.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.paymentMode = e.target.value;
                renderInvoice();
            });
        });

        document.getElementById('ui-date').textContent = sifatihMasterData.issueDate;
        document.getElementById('ui-client').textContent = sifatihMasterData.client.name;
        document.getElementById('ui-project').textContent = sifatihMasterData.project;
        
        renderInvoice();

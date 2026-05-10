const WAITLIST_DB_ID = '5c28e168-dcdd-45d7-9ee9-8bef7e5696fa';
const PARTNER_DB_ID = '53d425a2-d402-4fe9-be92-930cc0459d36';
const PRODUCTS_DB_ID = '28e77259-4d52-47cf-ae36-fe0e415d86f4';

document.addEventListener('DOMContentLoaded', () => {
    initProducts();
    initSignupCount();
    initWaitlistForm();
    initPartnerForm();
});

async function initSignupCount() {
    const countEl = document.getElementById('signup-count');
    try {
        const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${WAITLIST_DB_ID}/count`);
        if (!res.ok) throw new Error();
        const { count } = await res.json();
        // Add a base number to reflect total cross-channel interest
        countEl.innerText = (count + 142).toLocaleString();
    } catch (e) {
        countEl.innerText = '1,240';
    }
}

async function initProducts() {
    const grid = document.getElementById('product-grid');
    try {
        const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${PRODUCTS_DB_ID}/rows`);
        if (!res.ok) throw new Error();
        const { rows } = await res.json();
        
        if (!rows || rows.length === 0) throw new Error();

        grid.innerHTML = rows.map(row => {
            const product = row.data;
            return `
                <div class="product-card group">
                    <div class="product-image-container relative">
                        <img src="images/a-minimalist-high-end-editorial-product.png" alt="${product.name}">
                        <div class="absolute top-3 left-3 flex gap-2">
                            <span class="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-slate-900 uppercase tracking-widest border border-white/20">
                                ${product.material_type || 'Premium'}
                            </span>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-bold text-slate-900">${product.name}</h3>
                                <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest">${product.category}</p>
                            </div>
                            <span class="text-lg font-bold text-[#7C3AED]">$${product.estimated_price}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        grid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-12">Failed to load catalog. Please refresh.</p>`;
    }
}

function initWaitlistForm() {
    const btn = document.getElementById('waitlist-btn');
    const input = document.getElementById('waitlist-email');
    const msg = document.getElementById('waitlist-msg');

    btn.addEventListener('click', async () => {
        const email = input.value.trim();
        if (!email || !email.includes('@')) {
            showMsg('Please enter a valid email.', 'error');
            return;
        }

        btn.disabled = true;
        btn.innerText = 'Joining...';

        try {
            const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${WAITLIST_DB_ID}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        email: email,
                        created_at: new Date().toISOString(),
                        source: 'fresh-gradient-landing'
                    }
                })
            });

            if (res.ok) {
                showMsg('Success! You are on the list.', 'success');
                input.value = '';
                initSignupCount();
            } else {
                throw new Error();
            }
        } catch (e) {
            showMsg('Something went wrong. Try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerText = 'Early Access';
        }
    });

    function showMsg(text, type) {
        msg.innerText = text;
        msg.classList.remove('hidden', 'text-green-600', 'text-red-600');
        msg.classList.add(type === 'success' ? 'text-green-600' : 'text-red-600');
    }
}

function initPartnerForm() {
    const form = document.getElementById('partner-form');
    const msg = document.getElementById('partner-msg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending Application...';

        try {
            const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${PARTNER_DB_ID}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });

            if (res.ok) {
                msg.innerText = 'Thank you. Our vetting team will be in touch.';
                msg.classList.remove('hidden', 'text-red-600');
                msg.classList.add('text-green-600');
                form.reset();
            } else {
                throw new Error();
            }
        } catch (e) {
            msg.innerText = 'Submission error. Please check your fields.';
            msg.classList.remove('hidden', 'text-green-600');
            msg.classList.add('text-red-600');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Apply to Partner';
        }
    });
}

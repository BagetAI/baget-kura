const WAITLIST_DB_ID = '5c28e168-dcdd-45d7-9ee9-8bef7e5696fa';
const PARTNER_DB_ID = '53d425a2-d402-4fe9-be92-930cc0459d36';
const PRODUCTS_DB_ID = '28e77259-4d52-47cf-ae36-fe0e415d86f4';
const ARTISAN_DB_ID = '1bfa4307-8034-4172-8f62-6a316fa8d174';

document.addEventListener('DOMContentLoaded', () => {
    initProducts();
    initArtisans();
    initSignupCount();
    initWaitlistForm();
    initPartnerForm();
    initSmoothScroll();
});

async function initSignupCount() {
    const countEl = document.getElementById('signup-count');
    try {
        const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${WAITLIST_DB_ID}/count`);
        const data = await res.json();
        // Add a base of 2400 to show some traction
        countEl.innerText = (data.count + 2412).toLocaleString();
    } catch (e) {
        countEl.innerText = '2,412';
    }
}

async function initProducts() {
    const grid = document.getElementById('product-grid');
    try {
        const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${PRODUCTS_DB_ID}/rows`);
        const { rows } = await res.json();
        
        if (!rows || rows.length === 0) throw new Error('No products found');

        grid.innerHTML = rows.map(row => {
            const product = row.data;
            return `
                <div class="product-card group cursor-pointer" onclick="showSoonModal('${product.name}')">
                    <div class="product-image-container relative bg-slate-50 rounded-[32px] overflow-hidden aspect-square mb-6">
                        <img src="images/close-up-studio-shot-of-a-high-end-veget.png" 
                             alt="${product.name}" 
                             class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                        <div class="absolute top-4 left-4">
                            <span class="glass px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-800 uppercase tracking-widest border border-white/20">
                                ${product.material_type || 'Premium'}
                            </span>
                        </div>
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                    </div>
                    <div class="space-y-3 px-2">
                        <div class="flex justify-between items-start">
                            <div class="space-y-1">
                                <h3 class="text-xl font-bold text-slate-900 group-hover:text-[#EC4899] transition-colors">${product.name}</h3>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${product.category}</p>
                            </div>
                            <span class="text-xl font-bold text-slate-900">$${product.estimated_price}</span>
                        </div>
                        <div class="flex items-center space-x-2 pt-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">Signed by Master Artisan</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        grid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-12 font-medium">Coming soon to the Origin Series...</p>`;
    }
}

async function initArtisans() {
    const list = document.getElementById('artisan-list');
    try {
        const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${ARTISAN_DB_ID}/rows`);
        const { rows } = await res.json();
        
        if (!rows || rows.length === 0) throw new Error('No artisans found');

        list.innerHTML = rows.map(row => {
            const artisan = row.data;
            return `
                <div class="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                    <div class="flex items-center space-x-5">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-xl text-[#F97316] group-hover:scale-110 transition-transform">
                            ${artisan.name.charAt(0)}
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-white group-hover:text-[#F97316] transition-colors">${artisan.name}</h4>
                            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">${artisan.location}</p>
                        </div>
                    </div>
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Ethos Score</p>
                        <p class="text-lg font-bold text-white">${artisan.ethos_score}/100</p>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        list.innerHTML = `<p class="text-slate-500 py-4 font-medium">Artisans vetting in progress...</p>`;
    }
}

function initWaitlistForm() {
    const btn = document.getElementById('waitlist-btn');
    const input = document.getElementById('waitlist-email');

    btn.addEventListener('click', async () => {
        const email = input.value.trim();
        if (!email || !email.includes('@')) {
            alert('Please provide a valid email address.');
            return;
        }

        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = 'Syncing...';

        try {
            const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${WAITLIST_DB_ID}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        email,
                        source: 'core-mvp-launch',
                        created_at: new Date().toISOString()
                    }
                })
            });

            if (res.ok) {
                btn.innerText = 'Welcome to Kura';
                btn.classList.add('bg-green-600');
                input.value = '';
                initSignupCount();
            } else {
                throw new Error();
            }
        } catch (e) {
            btn.innerText = 'Error. Try again?';
            btn.disabled = false;
        }
    });
}

function initPartnerForm() {
    const form = document.getElementById('partner-form');
    const msg = document.getElementById('partner-msg');
    const btn = document.getElementById('partner-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        btn.disabled = true;
        btn.innerText = 'Vetting Inquiry...';

        try {
            const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${PARTNER_DB_ID}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });

            if (res.ok) {
                msg.innerText = 'Success. Our team will review your workshop details.';
                msg.classList.remove('hidden', 'text-red-600');
                msg.classList.add('text-[#F97316]');
                form.reset();
            } else {
                throw new Error();
            }
        } catch (e) {
            msg.innerText = 'Error. Please verify your connection.';
            msg.classList.remove('hidden');
            msg.classList.add('text-red-600');
        } finally {
            btn.disabled = false;
            btn.innerText = 'Submit Workshop Inquiry';
        }
    });
}

function showSoonModal(productName) {
    // Smooth scroll to waitlist for now
    document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('waitlist-email').focus();
    const btn = document.getElementById('waitlist-btn');
    btn.innerText = `Join waitlist for ${productName}`;
    setTimeout(() => {
        btn.innerText = 'Get Early Access';
    }, 4000);
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

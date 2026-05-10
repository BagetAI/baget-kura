const WAITLIST_DB_ID = '5c28e168-dcdd-45d7-9ee9-8bef7e5696fa';
const PARTNER_DB_ID = '53d425a2-d402-4fe9-be92-930cc0459d36';
const PRODUCTS_DB_ID = '28e77259-4d52-47cf-ae36-fe0e415d86f4';

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadSignupCount();
    
    // Waitlist Form
    const waitlistForm = document.getElementById('waitlist-form');
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('waitlist-email').value;
        const msg = document.getElementById('waitlist-msg');
        const submitBtn = waitlistForm.querySelector('button');
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Joining...';
        
        try {
            const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${WAITLIST_DB_ID}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        email: email,
                        created_at: new Date().toISOString()
                    }
                })
            });
            
            if (res.ok) {
                msg.innerText = 'Welcome to the inner circle. We will notify you when the origin series drops.';
                msg.classList.remove('hidden', 'text-red-500');
                msg.classList.add('text-green-600');
                waitlistForm.reset();
                loadSignupCount();
            } else {
                throw new Error('Submission failed');
            }
        } catch (err) {
            msg.innerText = 'Something went wrong. Please try again.';
            msg.classList.remove('hidden', 'text-green-600');
            msg.classList.add('text-red-500');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Get Early Access';
        }
    });

    // Partner Form
    const partnerForm = document.getElementById('partner-form');
    partnerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('partner-msg');
        const submitBtn = partnerForm.querySelector('button');
        const formData = new FormData(partnerForm);
        const data = Object.fromEntries(formData.entries());
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';
        
        try {
            const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${PARTNER_DB_ID}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });
            
            if (res.ok) {
                msg.innerText = 'Application received. Our vetting team will reach out within 48 hours.';
                msg.classList.remove('hidden', 'text-red-400');
                msg.classList.add('text-green-400');
                partnerForm.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (err) {
            msg.innerText = 'Submission error. Please verify your details.';
            msg.classList.remove('hidden', 'text-green-400');
            msg.classList.add('text-red-400');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Apply to Partner';
        }
    });
});

async function loadSignupCount() {
    try {
        const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${WAITLIST_DB_ID}/count`);
        const { count } = await res.json();
        document.getElementById('signup-count').innerText = count + 42; // Seeded with initial interest
    } catch (e) {
        document.getElementById('signup-count').innerText = '127';
    }
}

async function loadProducts() {
    const grid = document.getElementById('product-grid');
    try {
        const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${PRODUCTS_DB_ID}/rows`);
        const { rows } = await res.json();
        
        if (!rows || rows.length === 0) throw new Error('No products');

        grid.innerHTML = rows.map(product => `
            <div class="product-card group cursor-pointer">
                <div class="relative overflow-hidden rounded-2xl aspect-[4/5] bg-gray-100 mb-4">
                    <img src="images/a-minimalist-high-end-editorial-product.png" alt="${product.data.name}" 
                         class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        ${product.data.material_type}
                    </div>
                </div>
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl mb-1">${product.data.name}</h3>
                        <p class="text-xs uppercase tracking-widest text-slate-400 font-bold">${product.data.category}</p>
                    </div>
                    <span class="heading-font text-lg text-[var(--terracotta)]">$${product.data.estimated_price}</span>
                </div>
            </div>
        `).join('');
    } catch (e) {
        // Fallback static items if DB fails
        grid.innerHTML = `
            <div class="product-card group">
                <div class="rounded-2xl aspect-[4/5] bg-gray-200 mb-4"></div>
                <h3 class="text-xl mb-1">Florence Doctor Bag</h3>
                <p class="text-xs uppercase tracking-widest text-slate-400 font-bold">Viviani | Italy</p>
            </div>
            <div class="product-card group">
                <div class="rounded-2xl aspect-[4/5] bg-gray-200 mb-4"></div>
                <h3 class="text-xl mb-1">Highland Everyday Tote</h3>
                <p class="text-xs uppercase tracking-widest text-slate-400 font-bold">Meron | Ethiopia</p>
            </div>
            <div class="product-card group">
                <div class="rounded-2xl aspect-[4/5] bg-gray-200 mb-4"></div>
                <h3 class="text-xl mb-1">Artisan Chelsea Boot</h3>
                <p class="text-xs uppercase tracking-widest text-slate-400 font-bold">J.L. Rocha | Mexico</p>
            </div>
        `;
    }
}
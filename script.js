// script.js – Interactivity, animations, and cart handling for GIMA MODS

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Product Data Fallback (in case of CORS/file:// protocol restrictions) ---
    const fallbackProducts = [
        {
            "id": 1,
            "name": "Titanium Performance Exhaust",
            "price": 799.99,
            "category": "Exhaust",
            "description": "Ultra-lightweight aerospace-grade titanium cat-back exhaust system. Significantly increases horsepower, delivers an aggressive, deep exhaust note, and features precision burned-blue tips.",
            "image": "./images/exhaust.png",
            "specs": ["Material: Grade 5 Titanium", "Weight reduction: -12.4 kg", "Power Gain: +18 HP", "Tip Diameter: 4.0 inches"]
        },
        {
            "id": 2,
            "name": "Stage 3 Twin Turbocharger Kit",
            "price": 3499.00,
            "category": "Performance",
            "description": "The ultimate forced induction upgrade. Complete heavy-duty twin turbocharger system engineered for maximum boost. Includes high-efficiency intercooler, aluminum charge pipes, wastegates, and all mounting hardware.",
            "image": "./images/turbo.png",
            "specs": ["Compressor Wheel: Billet Aluminum", "Bearing Type: Dual Ball Bearing", "Max Boost Capacity: 35 PSI", "Power Potential: Up to 900 HP"]
        },
        {
            "id": 3,
            "name": "Gloss Carbon Fiber Hood",
            "price": 1199.50,
            "category": "Exterior",
            "description": "High-gloss double-sided carbon fiber hood. Reduces front-end weight for better weight distribution and handling, while featuring functional aggressive heat extraction vents to keep engine bay temperatures cool.",
            "image": "./images/hood.png",
            "specs": ["Material: 2x2 Twill Carbon Fiber", "Finish: UV-Resistant High Gloss Clear Coat", "Weight: 6.8 kg (OEM is 18.2 kg)", "Fitment: Direct OEM Replacement"]
        },
        {
            "id": 4,
            "name": "V2 Custom LED Headlights",
            "price": 549.00,
            "category": "Lighting",
            "description": "High-intensity LED projector headlights featuring an animated start-up welcome sequence. Bright white daytime running lights (DRL) combined with intense sequential amber turn signals for unmatched presence.",
            "image": "./images/headlights.png",
            "specs": ["Light Source: Custom OSRAM LEDs", "Color Temp: 6000K (Daylight White)", "Signaling: Sequential LED Amber", "Certification: DOT/SAE Compliant"]
        },
        {
            "id": 5,
            "name": "Adjustable Racing Coilovers",
            "price": 899.00,
            "category": "Suspension",
            "description": "32-way damping adjustable performance coilovers. Features monotube shocks, polyurethane bushings, and high-tensile cold-wound steel springs. Allows full height adjustment without affecting suspension travel.",
            "image": "./images/coilovers.png",
            "specs": ["Damping Adjustment: 32 Levels", "Spring Rate Front: 8 kg/mm", "Spring Rate Rear: 6 kg/mm", "Material: T6-6061 Hard Anodized Aluminum"]
        },
        {
            "id": 6,
            "name": "Alcantara Sports Steering Wheel",
            "price": 429.00,
            "category": "Interior",
            "description": "Hand-stitched premium Alcantara sports steering wheel. Features ergonomic molded thumb grips, a racing flat-bottom design, red center line marker, and high-gloss real carbon fiber trim inserts.",
            "image": "./images/steering_wheel.png",
            "specs": ["Grip Material: Genuine Italian Alcantara", "Trim Material: 3K Plain Carbon Fiber", "Design: Flat-Bottom Racing D-Shape", "Stitching: Cross-Stitch Red Thread"]
        }
    ];

    let products = [];
    let cart = JSON.parse(localStorage.getItem('gima_mods_cart')) || {};

    // --- DOM Elements ---
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('search-input');
    const filterTags = document.getElementById('filter-tags');
    const navbar = document.getElementById('navbar');
    
    // Cart Elements
    const cartBtn = document.getElementById('cart-btn');
    const closeDrawerBtn = document.getElementById('close-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartCountEl = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Modal Elements
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const modalBody = document.getElementById('modal-body');

    // --- 1. Scroll Effects ---
    // Navbar scroll reduction
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active link indicator highlights section currently visible
        const sections = document.querySelectorAll('section, header');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSectionId = section.getAttribute('id') || '';
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            if (href === currentSectionId || (href === '' && currentSectionId === '')) {
                link.classList.add('active');
            }
        });
    });

    // Intersection Observer for scroll reveal animations
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                revealObserver.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        threshold: 0.15
    });

    document.querySelectorAll('.animate-on-scroll, .service-card, .card').forEach(el => {
        el.classList.add('animate-on-scroll'); // Ensure class exists
        revealObserver.observe(el);
    });


    // --- 2. Before/After Interactive Slider ---
    const slider = document.getElementById('before-after-slider');
    const sliderHandle = document.getElementById('slider-handle');
    const afterImgContainer = document.getElementById('after-img-container');
    const afterImgRaw = document.getElementById('after-img-raw');

    if (slider && sliderHandle && afterImgContainer && afterImgRaw) {
        let isSliding = false;

        const updateSliderWidth = () => {
            // Locks the raw image width to matching slider width so it doesn't compress
            afterImgRaw.style.width = slider.offsetWidth + 'px';
        };

        window.addEventListener('resize', updateSliderWidth);
        updateSliderWidth(); // Initialize sizes

        const slideTo = (clientX) => {
            const rect = slider.getBoundingClientRect();
            let offset = clientX - rect.left;
            
            // Percentage boundaries
            let percentage = (offset / rect.width) * 100;
            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;

            sliderHandle.style.left = `${percentage}%`;
            afterImgContainer.style.width = `${percentage}%`;
        };

        // Mouse Drag events
        sliderHandle.addEventListener('mousedown', () => isSliding = true);
        window.addEventListener('mouseup', () => isSliding = false);
        window.addEventListener('mousemove', (e) => {
            if (!isSliding) return;
            slideTo(e.clientX);
        });

        // Touch Drag events (mobile support)
        sliderHandle.addEventListener('touchstart', () => isSliding = true);
        window.addEventListener('touchend', () => isSliding = false);
        window.addEventListener('touchmove', (e) => {
            if (!isSliding) return;
            slideTo(e.touches[0].clientX);
        });

        // Click-to-move inside container
        slider.addEventListener('click', (e) => {
            if (e.target === sliderHandle || sliderHandle.contains(e.target)) return;
            slideTo(e.clientX);
        });
    }


    // --- 3. Products Loading & Shop Logic ---
    const fetchProducts = async () => {
        try {
            const response = await fetch('./products.json');
            if (!response.ok) throw new Error('Network response was not ok');
            products = await response.json();
        } catch (error) {
            console.warn('CORS or file protocol blocking fetch. Using fallback product database.', error);
            products = fallbackProducts;
        }
        initShop();
    };

    const initShop = () => {
        renderProducts(products);
        setupFilters();
        setupSearch();
        syncCartUI();
    };

    const renderProducts = (productsToRender) => {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem 0;">
                    <i class="fa-solid fa-face-frown" style="font-size: 2.5rem; margin-bottom: 1rem; color: #353a47;"></i>
                    <p>No modification parts match your criteria.</p>
                </div>`;
            return;
        }

        productsToRender.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card animate-on-scroll';
            
            // Check if product is in cart
            const inCart = cart[p.id];
            const btnText = inCart ? 'Added <i class="fa-solid fa-check"></i>' : 'Add to Cart <i class="fa-solid fa-plus"></i>';
            const btnClass = inCart ? 'add-btn added' : 'add-btn';

            card.innerHTML = `
                <div class="card-img-wrapper" data-id="${p.id}">
                    <span class="card-tag">${p.category}</span>
                    <img src="${p.image}" alt="${p.name}" loading="lazy" />
                </div>
                <div class="card-content">
                    <h3 data-id="${p.id}">${p.name}</h3>
                    <p class="card-desc">${p.description}</p>
                    <div class="card-footer">
                        <span class="price">$${p.price.toFixed(2)}</span>
                        <button class="${btnClass}" data-id="${p.id}">${btnText}</button>
                    </div>
                </div>`;

            productGrid.appendChild(card);
            
            // Observe card
            revealObserver.observe(card);
        });

        // Add Event Listeners for Quick View
        document.querySelectorAll('.card-img-wrapper, .card-content h3').forEach(el => {
            el.addEventListener('click', () => {
                const id = parseInt(el.getAttribute('data-id'));
                openQuickView(id);
            });
        });

        // Add Event Listeners for Add to Cart
        document.querySelectorAll('.card .add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                addToCart(id, btn);
            });
        });
    };

    const setupFilters = () => {
        filterTags.addEventListener('click', (e) => {
            if (!e.target.classList.contains('filter-btn')) return;
            
            // Toggle active styling
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            filterAndSearchProducts();
        });
    };

    const setupSearch = () => {
        searchInput.addEventListener('input', filterAndSearchProducts);
    };

    const filterAndSearchProducts = () => {
        const query = searchInput.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-category');

        const filtered = products.filter(p => {
            const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
            const matchesQuery = p.name.toLowerCase().includes(query) || 
                                 p.description.toLowerCase().includes(query) ||
                                 p.category.toLowerCase().includes(query);
            return matchesCategory && matchesQuery;
        });

        renderProducts(filtered);
    };


    // --- 4. Cart Engine ---
    const toggleDrawer = (isOpen) => {
        if (isOpen) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Lock base scroll
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    cartBtn.addEventListener('click', () => toggleDrawer(true));
    closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
    cartOverlay.addEventListener('click', () => toggleDrawer(false));

    const addToCart = (id, buttonEl = null) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        if (cart[id]) {
            cart[id].quantity++;
        } else {
            cart[id] = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            };
        }

        saveCart();
        
        // Shake badge animation
        cartCountEl.classList.remove('pop');
        void cartCountEl.offsetWidth; // Trigger reflow to restart animation
        cartCountEl.classList.add('pop');

        // Optional: animate product card button feedback
        if (buttonEl) {
            buttonEl.classList.add('added');
            buttonEl.innerHTML = 'Added <i class="fa-solid fa-check"></i>';
            setTimeout(() => {
                // Return button to add state only if not still in cart (e.g. quantity manipulation can happen)
                if (!cart[id]) {
                    buttonEl.classList.remove('added');
                    buttonEl.innerHTML = 'Add to Cart <i class="fa-solid fa-plus"></i>';
                }
            }, 1500);
        }
    };

    const changeQuantity = (id, delta) => {
        if (!cart[id]) return;
        
        cart[id].quantity += delta;
        if (cart[id].quantity <= 0) {
            delete cart[id];
        }
        
        saveCart();
    };

    const removeItem = (id) => {
        if (!cart[id]) return;
        
        // Target specific DOM element to perform quick fade-out
        const cartItemEl = document.querySelector(`.cart-item[data-id="${id}"]`);
        if (cartItemEl) {
            cartItemEl.style.transform = 'translateX(100px)';
            cartItemEl.style.opacity = '0';
            cartItemEl.style.transition = 'all 0.3s ease-out';
            setTimeout(() => {
                delete cart[id];
                saveCart();
            }, 300);
        } else {
            delete cart[id];
            saveCart();
        }
    };

    const saveCart = () => {
        localStorage.setItem('gima_mods_cart', JSON.stringify(cart));
        syncCartUI();
    };

    const syncCartUI = () => {
        // 1. Update Navigation Badge
        const totalItemsCount = Object.values(cart).reduce((total, item) => total + item.quantity, 0);
        cartCountEl.textContent = totalItemsCount;

        // Hide cart count if 0
        if (totalItemsCount === 0) {
            cartCountEl.style.display = 'none';
        } else {
            cartCountEl.style.display = 'flex';
        }

        // 2. Repopulate Cart Drawer
        cartItemsContainer.innerHTML = '';
        let totalPrice = 0;

        const cartItems = Object.values(cart);
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-cart-flatbed-suitcase"></i>
                    <p>Your cart is empty.</p>
                </div>`;
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.cursor = 'not-allowed';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';

            cartItems.forEach(item => {
                totalPrice += item.price * item.quantity;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.setAttribute('data-id', item.id);
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <span class="price">$${item.price.toFixed(2)}</span>
                        <div class="cart-item-qty">
                            <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                            <input type="text" class="qty-val" value="${item.quantity}" readonly />
                            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}" aria-label="Remove item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                
                cartItemsContainer.appendChild(itemDiv);
            });
        }

        cartTotalEl.textContent = `$${totalPrice.toFixed(2)}`;

        // Reconnect cart button listeners inside the drawer
        document.querySelectorAll('.cart-item .qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const action = btn.getAttribute('data-action');
                if (action === 'increase') {
                    changeQuantity(id, 1);
                } else {
                    changeQuantity(id, -1);
                }
            });
        });

        document.querySelectorAll('.cart-item .remove-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                removeItem(id);
            });
        });

        // 3. Re-sync Shop grid add buttons style
        document.querySelectorAll('.card .add-btn').forEach(btn => {
            const id = parseInt(btn.getAttribute('data-id'));
            if (cart[id]) {
                btn.classList.add('added');
                btn.innerHTML = 'Added <i class="fa-solid fa-check"></i>';
            } else {
                btn.classList.remove('added');
                btn.innerHTML = 'Add to Cart <i class="fa-solid fa-plus"></i>';
            }
        });
    };

    // Checkout event
    checkoutBtn.addEventListener('click', () => {
        alert('Stuthiy! Your mod parts order has been simulated. GIMA MODS will send details to your email/phone.');
        cart = {};
        saveCart();
        toggleDrawer(false);
    });


    // --- 5. Quick View Modal ---
    const openQuickView = (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        // Render modal content
        const specsList = product.specs.map(spec => `<li>${spec}</li>`).join('');
        
        const inCart = cart[product.id];
        const btnText = inCart ? 'Added To Cart <i class="fa-solid fa-check"></i>' : 'Add to Cart <i class="fa-solid fa-plus"></i>';
        const btnClass = inCart ? 'add-btn added' : 'add-btn';

        modalBody.innerHTML = `
            <div class="modal-img-wrapper">
                <img src="${product.image}" alt="${product.name}" />
            </div>
            <div class="modal-info">
                <span class="modal-category">${product.category}</span>
                <h2>${product.name}</h2>
                <div class="price">$${product.price.toFixed(2)}</div>
                <p class="modal-desc">${product.description}</p>
                
                <h4 class="modal-specs-title">Technical Specifications</h4>
                <ul class="modal-specs">
                    ${specsList}
                </ul>
                
                <div class="modal-footer-btn-container">
                    <button class="${btnClass}" id="modal-add-btn" data-id="${product.id}">${btnText}</button>
                </div>
            </div>
        `;

        // Add event to modal add button
        const modalAddBtn = document.getElementById('modal-add-btn');
        modalAddBtn.addEventListener('click', () => {
            addToCart(product.id, modalAddBtn);
            // Sync with shop grid button instantly
            syncCartUI();
        });

        // Open modal
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modalOverlay.classList.remove('open');
        // Only unlock scrolling if cart drawer is not open
        if (!cartDrawer.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    };

    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            toggleDrawer(false);
        }
    });


    // --- 6. Form Submission Handle ---
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const vehicle = document.getElementById('vehicle').value;
            const message = document.getElementById('message').value;

            alert(`Stuthiy ${name}!\n\nWe received your request for the ${vehicle}.\nOur customization experts will call you at ${phone} within 24 hours to discuss options and send a quote.\n\nDriving with Distinction, GIMA MODS!`);
            quoteForm.reset();
        });
    }

    // --- Kickstart the system ---
    fetchProducts();
});

// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ И ПЕРЕМЕННЫЕ
// ==========================================
let tg = null;
let currentUser = null;
let currentEditImages = []; // Массив для хранения картинок при редактировании

try {
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        currentUser = tg.initDataUnsafe?.user;
    }
} catch (error) {
    console.warn('Запуск вне Telegram или ошибка инициализации:', error);
}

function haptic(type = 'success') {
    try {
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred(type);
    } catch (e) {}
}

// Supabase
let supabaseClient = null;
const SUPABASE_URL = 'https://rrmzadaalapkzafdrndl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXphZGFhbGFwa3phZmRybmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NDkwMTUsImV4cCI6MjEwNTIyNTAxNX0.an6VoASCtqflWnZcRugeJTbieUl5Bbz_A9axkoYkYo8';

try {
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase клиент успешно создан');
    }
} catch (e) {
    console.warn('⚠️ Supabase не доступен');
}

// Переменные состояния
let currentLang = localStorage.getItem('language') || 'ru';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'home';
let currentCategory = 'all';

function safeLoad(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (e) { return fallback; }
}

let cart = safeLoad('cart', []);
let favorites = safeLoad('favorites', []);
let orders = safeLoad('orders', []);
let products = []; // Загружается из Supabase при старте!

// ==========================================
// 2. УВЕДОМЛЕНИЯ
// ==========================================
function showNotification(message, type = 'info', duration = 3000) {
    let container = document.getElementById('notifications');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications';
        container.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:10000;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
        document.body.appendChild(container);
    }
    const notif = document.createElement('div');
    const bgColor = type === 'error' ? 'rgba(244, 67, 54, 0.95)' : (type === 'success' ? 'rgba(76, 175, 80, 0.95)' : 'rgba(0, 0, 0, 0.85)');
    notif.style.cssText = `background:${bgColor};color:#fff;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:500;backdrop-filter:blur(10px);box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideDown 0.3s ease;max-width:90vw;text-align:center;pointer-events:auto;`;
    notif.textContent = message;
    container.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translate(-50%, -20px)';
        notif.style.transition = 'all 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, duration);
}

if (!document.getElementById('notif-style')) {
    const style = document.createElement('style');
    style.id = 'notif-style';
    style.textContent = `@keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }`;
    document.head.appendChild(style);
}

// ==========================================
// 3. ПЕРЕВОДЫ (С НОВЫМИ КАТЕГОРИЯМИ)
// ==========================================
const svgIcons = {
    heart: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21 L10.55 19.7 Q5 15 5 10 Q5 6 8 6 Q10 6 12 8 Q14 6 16 6 Q19 6 19 10 Q19 15 13.45 19.7 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    heartFilled: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21 L10.55 19.7 Q5 15 5 10 Q5 6 8 6 Q10 6 12 8 Q14 6 16 6 Q19 6 19 10 Q19 15 13.45 19.7 Z" fill="#FF0000" stroke="#FF0000" stroke-width="2"/></svg>`
};

const translations = {
    ru: {
        welcome: 'Добро пожаловать!', custom: 'Вещи под заказ', welcomeText: 'Лучшая одежда для вашего стиля', categories: 'Категории',
        catalog: 'Каталог', all: 'Все', jackets: 'Куртки/Жилетки', tshirts: 'Футболки', shorts: 'Шорты', accessories: 'Аксессуары',
        hoodies: 'Худи', hats: 'Головные уборы', pants: 'Штаны',
        cart: 'Корзина', cartEmpty: 'Корзина пуста', total: 'Итого:', checkout: 'Оформить заказ',
        home: 'Главная', profile: 'Профиль', myOrders: 'Мои заказы', favorites: 'Избранное', adminPanel: 'Админ панель',
        noOrders: 'У вас пока нет заказов', noFavorites: 'В избранном пока пусто', noProducts: 'Товаров пока нет',
        addToCart: 'Добавить в корзину', checkoutTitle: 'Оформление заказа', orderSuccess: 'Заказ оформлен!',
        orderSuccessText: 'Мы свяжемся с вами в ближайшее время', backToCatalog: 'Вернуться в каталог',
        name: 'Ваше имя', phone: 'Номер телефона', confirmOrder: 'Подтвердить заказ',
        invalidPhone: 'Неверный формат. Должно быть +380XXXXXXXXX',
        addProduct: 'Добавить товар', addNewProduct: '+ Добавить новый товар', editProduct: 'Редактировать товар',
        saveProduct: 'Сохранить', productImage: 'Изображение товара', productName: 'Название товара',
        productPrice: 'Цена (грн)', productDescription: 'Описание (необязательно)', productCategory: 'Категория',
        selectCategory: 'Выберите категорию', enterName: 'Введите название', enterDescription: 'Описание товара',
        orderNumber: 'Заказ №', remove: 'Удалить', edit: 'Редактировать', delete: 'Удалить',
        deleteConfirm: 'Вы уверены, что хотите удалить этот товар?', productDeleted: 'Товар удален',
        productSaved: 'Товар успешно сохранен!', fillAllFields: 'Заполните все обязательные поля!', selectImage: 'Выберите хотя бы одно изображение!'
    },
    uk: {
        welcome: 'Ласкаво просимо!', custom: 'Речі під замовлення', welcomeText: 'Найкращий одяг для вашого стилю', categories: 'Категорії',
        catalog: 'Каталог', all: 'Всі', jackets: 'Куртки/Жилетки', tshirts: 'Футболки', shorts: 'Шорти', accessories: 'Аксесуари',
        hoodies: 'Худі', hats: 'Головні убори', pants: 'Штани',
        cart: 'Кошик', cartEmpty: 'Кошик порожній', total: 'Разом:', checkout: 'Оформити замовлення',
        home: 'Головна', profile: 'Профіль', myOrders: 'Мої замовлення', favorites: 'Обране', adminPanel: 'Адмін панель',
        noOrders: 'У вас поки немає замовлень', noFavorites: 'В обраному поки порожньо', noProducts: 'Товарів поки немає',
        addToCart: 'Додати в кошик', checkoutTitle: 'Оформлення замовлення', orderSuccess: 'Замовлення оформлено!',
        orderSuccessText: 'Ми зв\'яжемося з вами найближчим часом', backToCatalog: 'Повернутися в каталог',
        name: 'Ваше ім\'я', phone: 'Номер телефону', confirmOrder: 'Підтвердити замовлення',
        invalidPhone: 'Невірний формат. Має бути +380XXXXXXXXX',
        addProduct: 'Додати товар', addNewProduct: '+ Додати новий товар', editProduct: 'Редагувати товар',
        saveProduct: 'Зберегти', productImage: 'Зображення товару', productName: 'Назва товару',
        productPrice: 'Ціна (грн)', productDescription: 'Опис (необов\'язково)', productCategory: 'Категорія',
        selectCategory: 'Оберіть категорію', enterName: 'Введіть назву', enterDescription: 'Опис товару',
        orderNumber: 'Замовлення №', remove: 'Видалити', edit: 'Редагувати', delete: 'Видалити',
        deleteConfirm: 'Ви впевнені, що хочете видалити цей товар?', productDeleted: 'Товар видалено',
        productSaved: 'Товар успішно збережено!', fillAllFields: 'Заповніть всі обов\'язкові поля!', selectImage: 'Оберіть хоча б одне зображення!'
    }
};

function t(key) { return translations[currentLang]?.[key] || translations['ru']?.[key] || key; }

function getProductName(p) { return p.name || 'Товар'; }
function getProductDesc(p) { return p.description || ''; }
function getProductImage(p) { 
    if (p.images && typeof p.images === 'string' && p.images.includes(',')) {
        return p.images.split(',')[0].trim();
    }
    return p.image || p.images || ''; 
}

function getCategoryName(cat) {
    const map = { 
        'jackets': t('jackets'), 
        'tshirts': t('tshirts'), 
        'hoodies': t('hoodies'),
        'hats': t('hats'),
        'pants': t('pants'),
        'shorts': t('shorts'), 
        'accessories': t('accessories'),
        'custom': t('custom'),   // ← Добавлено
        'shoes': t('shoes')      // ← Добавлено
    };
    return map[cat] || cat || '';
}

function saveData() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('orders', JSON.stringify(orders));
    } catch (e) { console.error('Ошибка сохранения:', e); }
}

// ==========================================
// 4. ЗАГРУЗКА ТОВАРОВ ИЗ SUPABASE (КРИТИЧЕСКИ ВАЖНО!)
// ==========================================
async function loadProducts() {
    console.log('📡 Загрузка товаров из Supabase...');
    if (!supabaseClient) {
        console.warn('⚠️ Supabase не инициализирован, используем localStorage как фоллбэк');
        products = safeLoad('products', []);
        renderProducts();
        renderAdminPanel();
        return;
    }
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        products = data || [];
        console.log(`✅ Загружено товаров из БД: ${products.length}`);
        
        // Сохраняем копию в localStorage как кэш на случай сбоя сети
        localStorage.setItem('products', JSON.stringify(products));
        
        renderProducts();
        renderAdminPanel();
    } catch (err) {
        console.error('❌ Ошибка загрузки товаров:', err);
        showNotification('Ошибка загрузки товаров', 'error');
        products = safeLoad('products', []); // Fallback
        renderProducts();
        renderAdminPanel();
    }
}

// ==========================================
// 5. НАВИГАЦИЯ И ПЕРЕВОДЫ
// ==========================================
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang]?.[key]) el.textContent = translations[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang]?.[key]) el.placeholder = translations[currentLang][key];
    });
    document.documentElement.lang = currentLang;
}

function switchPage(page) {
    if (page === 'admin' && !isAdmin()) {
        console.warn('⛔ Попытка несанкционированного доступа к админке!');
        page = 'home'; 
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetPage = document.getElementById(`${page}-page`);
    const targetBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
    
    if (targetPage) targetPage.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');
    
    currentPage = page;
    if (page === 'catalog') renderProducts();
    if (page === 'cart') renderCart();
    if (page === 'orders') renderOrders();
    if (page === 'favorites') renderFavorites();
    if (page === 'admin') renderAdminPanel();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 6. РЕНДЕРИНГ ТОВАРОВ
// ==========================================
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    const filtered = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
    
    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align: center; padding: 40px; color: var(--gray-dark, #666);">${t('noProducts')}</p>`;
        return;
    }
    
    container.innerHTML = filtered.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-container">
                <img src="${getProductImage(product)}" alt="${getProductName(product)}" class="product-image" onerror="this.src='https://placehold.co/300x300/e2e8f0/64748b?text=Нет+фото'">
                <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" data-id="${product.id}">
                    ${favorites.includes(product.id) ? svgIcons.heartFilled : svgIcons.heart}
                </button>
            </div>
            <div class="product-info">
                <div class="product-name">${getProductName(product)}</div>
                <div class="product-price">${product.price} грн</div>
                <button class="btn-add-to-cart" data-id="${product.id}">${t('addToCart')}</button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn') && !e.target.closest('.btn-add-to-cart')) {
                openProductModal(parseInt(card.dataset.id));
            }
        });
    });
    
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const index = favorites.indexOf(id);
            if (index > -1) favorites.splice(index, 1); else favorites.push(id);
            saveData();
            renderProducts();
            if (currentPage === 'favorites') renderFavorites();
            haptic('success');
        });
    });
    
    container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(parseInt(btn.dataset.id));
        });
    });
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const nameEl = document.getElementById('modal-product-name');
    const priceEl = document.getElementById('modal-product-price');
    const descEl = document.getElementById('modal-product-description');
    const imagesContainer = document.getElementById('modal-images-container');
    const addBtn = document.getElementById('modal-add-to-cart');

    if(nameEl) nameEl.textContent = getProductName(product);
    if(priceEl) priceEl.textContent = `${product.price} грн`;
    if(descEl) descEl.textContent = getProductDesc(product) || '';
    
    if (imagesContainer) {
        const images = product.images ? product.images.split(',').map(img => img.trim()) : [getProductImage(product)];
        imagesContainer.innerHTML = images.map(img => `<img src="${img}" alt="product" style="width:100%; height:100%; object-fit:cover;">`).join('');
    }
    
    if (addBtn) {
        addBtn.onclick = () => {
            addToCart(productId);
            closeModal('product-modal');
        };
    }
    openModal('product-modal');
}

function addToCart(productId) {
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveData();
    updateCartBadge();
    haptic('success');
    showNotification('Добавлено в корзину', 'success', 1500);
}

function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    if (total > 0) {
        badge.textContent = total;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ==========================================
// 7. КОРЗИНА, ЗАКАЗЫ, ИЗБРАННОЕ
// ==========================================
function renderCart() {
    const container = document.getElementById('cart-items');
    const emptyState = document.getElementById('cart-empty');
    const footer = document.getElementById('cart-footer');
    if (!container || !emptyState || !footer) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        footer.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    footer.style.display = 'flex';
    let total = 0;
    
    container.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';
        total += product.price * item.quantity;
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${getProductImage(product)}" alt="${getProductName(product)}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${getProductName(product)}</div>
                    <div class="cart-item-price">${product.price} грн × ${item.quantity}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                        <button class="remove-btn" data-id="${item.id}">${t('remove')}</button>
                    </div>
                </div>
            </div>`;
    }).join('');
    
    const totalEl = document.getElementById('cart-total-price');
    if(totalEl) totalEl.textContent = `${total} грн`;

    container.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (!item) return;
            if (btn.dataset.action === 'increase') item.quantity++;
            else item.quantity--;
            
            if (item.quantity === 0) cart = cart.filter(i => i.id !== id);
            saveData();
            renderCart();
            updateCartBadge();
        });
    });
    
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cart = cart.filter(i => i.id !== parseInt(btn.dataset.id));
            saveData();
            renderCart();
            updateCartBadge();
        });
    });
}

function renderOrders() {
    const container = document.getElementById('orders-list');
    const empty = document.getElementById('orders-empty');
    if (!container || !empty) return;
    if (orders.length === 0) { container.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    container.innerHTML = orders.slice().reverse().map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number">${t('orderNumber')}${order.id}</span>
                <span class="order-date">${order.date}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `<div class="order-item"><span>${item.name} × ${item.quantity}</span><span>${item.price * item.quantity} грн</span></div>`).join('')}
            </div>
            <div class="order-total"><span>${t('total')}</span><span>${order.total} грн</span></div>
        </div>`).join('');
}

function renderFavorites() {
    const container = document.getElementById('favorites-list');
    const empty = document.getElementById('favorites-empty');
    if (!container || !empty) return;
    if (favorites.length === 0) { container.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    const favProducts = products.filter(p => favorites.includes(p.id));
    
    container.innerHTML = favProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-container">
                <img src="${getProductImage(product)}" alt="${getProductName(product)}" class="product-image" onerror="this.src='https://placehold.co/300x300/e2e8f0/64748b?text=Нет+фото'">
                <button class="favorite-btn active" data-id="${product.id}">${svgIcons.heartFilled}</button>
            </div>
            <div class="product-info">
                <div class="product-name">${getProductName(product)}</div>
                <div class="product-price">${product.price} грн</div>
                <button class="btn-add-to-cart" data-id="${product.id}">${t('addToCart')}</button>
            </div>
        </div>`).join('');
        
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            favorites = favorites.filter(favId => favId !== id);
            saveData();
            renderFavorites();
            haptic('success');
        });
    });
    container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(parseInt(btn.dataset.id));
        });
    });
}

// ==========================================
// 8. АДМИН ПАНЕЛЬ
// ==========================================
const ADMIN_IDS = [6088315974, 8361950436];

function isAdmin() {
    if (!tg) return true; // Для тестов в браузере
    const userId = tg?.initDataUnsafe?.user?.id;
    return userId && ADMIN_IDS.includes(Number(userId));
}

function updateAdminVisibility() {
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    if (isAdmin()) {
        adminOnlyElements.forEach(el => { el.style.display = 'flex'; });
    } else {
        adminOnlyElements.forEach(el => { el.style.display = 'none'; });
    }
}

function renderAdminPanel() {
    const list = document.getElementById('admin-products-list');
    const empty = document.getElementById('admin-empty');
    const count = document.getElementById('products-count');
    if (!list || !empty || !count) return;
    
    count.textContent = `${t('total')}: ${products.length}`;
    if (products.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    
    list.innerHTML = products.map(product => `
        <div class="admin-product-card" data-id="${product.id}">
            <div class="admin-product-header">
                <img src="${getProductImage(product)}" alt="${getProductName(product)}" class="admin-product-image" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                <div class="admin-product-info">
                    <div class="admin-product-name">${getProductName(product)}</div>
                    <div class="admin-product-category">${getCategoryName(product.category)}</div>
                    <div class="admin-product-price">${product.price} грн</div>
                </div>
            </div>
            <div class="admin-product-actions">
                <button class="admin-btn admin-btn-edit" data-id="${product.id}">✏️ ${t('edit')}</button>
                <button class="admin-btn admin-btn-delete" data-id="${product.id}">🗑️ ${t('delete')}</button>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.admin-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
    });
    list.querySelectorAll('.admin-btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
    });
}

function openAddProductModal() {
    const titleEl = document.getElementById('form-modal-title');
    if(titleEl) titleEl.textContent = t('addProduct');
    const form = document.getElementById('product-form');
    if(form) form.reset();
    const editIdEl = document.getElementById('edit-product-id');
    if(editIdEl) editIdEl.value = '';
    currentEditImages = [];
    const preview = document.getElementById('form-image-preview');
    if(preview) { preview.innerHTML = ''; preview.classList.remove('active'); }
    openModal('product-form-modal');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const titleEl = document.getElementById('form-modal-title');
    if(titleEl) titleEl.textContent = t('editProduct');
    const editIdEl = document.getElementById('edit-product-id');
    if(editIdEl) editIdEl.value = product.id;
    const nameEl = document.getElementById('form-product-name');
    if(nameEl) nameEl.value = product.name || '';
    const priceEl = document.getElementById('form-product-price');
    if(priceEl) priceEl.value = product.price || '';
    const descEl = document.getElementById('form-product-description');
    if(descEl) descEl.value = product.description || '';
    const catEl = document.getElementById('form-product-category');
    if(catEl) catEl.value = product.category || '';
    
    if (product.images) {
        currentEditImages = typeof product.images === 'string' ? product.images.split(',').map(img => img.trim()) : product.images;
    } else {
        currentEditImages = [];
    }
    renderImagePreview();
    openModal('product-form-modal');
}

function renderImagePreview() {
    const preview = document.getElementById('form-image-preview');
    if (!preview) return;
    if (currentEditImages.length === 0) {
        preview.innerHTML = '';
        preview.classList.remove('active');
        return;
    }
    preview.classList.add('active');
    preview.innerHTML = currentEditImages.map((img, index) => `
        <div style="position: relative; display: inline-block; margin: 5px;">
            <img src="${img}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px; object-fit: cover;">
            <button type="button" class="remove-image-btn" data-index="${index}" style="position: absolute; top: -8px; right: -8px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">×</button>
        </div>
    `).join('');
    
    preview.querySelectorAll('.remove-image-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentEditImages.splice(parseInt(btn.dataset.index), 1);
            renderImagePreview();
            haptic('success');
        });
    });
}

async function deleteProduct(productId) {
    if (!confirm(t('deleteConfirm'))) return;
    const productToDelete = products.find(p => p.id == productId);
    
    const { error } = await supabaseClient.from('products').delete().eq('id', productId);
    if (error) {
        console.error('❌ Ошибка удаления из БД:', error);
        showNotification('Ошибка удаления: ' + error.message, 'error');
        return;
    }
    
    if (productToDelete && productToDelete.images) {
        const oldImagesArray = typeof productToDelete.images === 'string' ? productToDelete.images.split(',') : productToDelete.images;
        const oldPaths = oldImagesArray.map(url => url.split('/').pop()).filter(path => path.length > 0);
        if (oldPaths.length > 0) {
            await supabaseClient.storage.from('product-images').remove(oldPaths);
        }
    }
    
    products = products.filter(p => p.id != productId);
    cart = cart.filter(i => i.id != productId);
    favorites = favorites.filter(f => f != productId);
    saveData();
    showNotification(t('productDeleted'), 'success');
    haptic('success');
    setTimeout(() => location.reload(), 1000);
}

// ==========================================
// 9. ОБРАБОТКА ФОРМЫ ТОВАРА
// ==========================================
const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('edit-product-id').value;
        const name = document.getElementById('form-product-name').value.trim();
        const price = parseInt(document.getElementById('form-product-price').value);
        const description = document.getElementById('form-product-description').value.trim();
        const category = document.getElementById('form-product-category').value;
        const imageFiles = document.getElementById('form-product-image').files;

        if (!name || !price || !category) {
            showNotification(t('fillAllFields'), 'error');
            return;
        }

        const saveProduct = async (imageUrls) => {
            const existingProduct = productId ? products.find(p => p.id == productId) : null;
            const finalImages = (imageUrls && imageUrls.length > 0) 
                ? imageUrls 
                : (existingProduct?.images ? (typeof existingProduct.images === 'string' ? existingProduct.images.split(',') : existingProduct.images) : []);
            
            const productData = {
                name: name,
                price: price,
                description: description,
                category: category,
                image: finalImages[0] || '',
                images: finalImages.join(',')
            };

            if (productId) {
                const { error } = await supabaseClient.from('products').update(productData).eq('id', parseInt(productId)).select();
                if (error) { showNotification('Ошибка при сохранении', 'error'); return; }
                const index = products.findIndex(p => p.id == productId);
                if (index !== -1) products[index] = { ...products[index], ...productData, id: parseInt(productId) };
            } else {
                if (!finalImages || finalImages.length === 0) { showNotification(t('selectImage'), 'error'); return; }
                const { data, error } = await supabaseClient.from('products').insert([productData]).select();
                if (error) { showNotification('Ошибка при сохранении', 'error'); return; }
                products.push({ ...productData, id: data[0].id });
            }
            
            saveData();
            showNotification(t('productSaved'), 'success');
            productForm.reset();
            document.getElementById('form-image-preview').innerHTML = '';
            document.getElementById('form-image-preview').classList.remove('active');
            closeModal('product-form-modal');
            renderAdminPanel();
            haptic('success');
        };

        if (imageFiles && imageFiles.length > 0) {
            if (currentEditImages.length > 0) {
                const oldPaths = currentEditImages.map(url => url.split('/').pop()).filter(path => path.length > 0);
                if (oldPaths.length > 0) await supabaseClient.storage.from('product-images').remove(oldPaths);
            }
            const imageUrls = [];
            let loaded = 0;
            const uniqueId = Date.now();
            Array.from(imageFiles).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const response = await fetch(event.target.result);
                    const blob = await response.blob();
                    const fileName = `${uniqueId}_${index}_${file.name.replace(/\s/g, '_')}`;
                    const { error } = await supabaseClient.storage.from('product-images').upload(fileName, blob, { upsert: true });
                    if (error) { showNotification('Ошибка загрузки фото', 'error'); return; }
                    const { data: { publicUrl } } = supabaseClient.storage.from('product-images').getPublicUrl(fileName);
                    imageUrls[index] = publicUrl;
                    loaded++;
                    if (loaded === imageFiles.length) saveProduct(imageUrls);
                };
                reader.readAsDataURL(file);
            });
        } else if (productId) {
            saveProduct(currentEditImages);
        } else {
            showNotification(t('selectImage'), 'error');
        }
    });
}

// ==========================================
// 10. МОДАЛКИ И ОФОРМЛЕНИЕ ЗАКАЗА
// ==========================================
function openModal(modalId) { const m = document.getElementById(modalId); if (m) m.classList.add('active'); }
function closeModal(modalId) { const m = document.getElementById(modalId); if (m) m.classList.remove('active'); }

function checkout() {
    if (cart.length === 0) { haptic('error'); return; }
    openModal('checkout-modal');
}

function validatePhone(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+380\d{9}$/.test(cleanPhone);
}

const phoneInput = document.getElementById('customer-phone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        const errorText = document.getElementById('phone-error');
        const phone = e.target.value.trim();
        if (validatePhone(phone)) {
            if (errorText) { errorText.classList.add('hidden'); errorText.style.display = 'none'; }
        } else if (phone.length > 0) {
            if (errorText) { errorText.classList.remove('hidden'); errorText.style.display = 'block'; }
        }
    });
}

function generateOrderNumber() { return Math.floor(100000 + Math.random() * 900000); }

function confirmOrder(name, phone) {
    const orderNumber = generateOrderNumber();
    const orderItems = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return { name: getProductName(product), price: product.price, quantity: item.quantity };
    });
    const orderTotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product.price * item.quantity);
    }, 0);
    
    const order = {
        id: orderNumber,
        date: new Date().toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'uk-UA'),
        items: orderItems,
        total: orderTotal,
        customer: { name, phone }
    };
    
    // ==========================================
    // ОТПРАВКА УВЕДОМЛЕНИЯ ПРЯМО В TELEGRAM
    // ==========================================
    const BOT_TOKEN = '8256209065:AAHa5P1wKr4T974KOllfjYwzTEkYk29amSk';
    const CHAT_ID = '8147881651';

    // Получаем username из Telegram (если есть)
    const username = currentUser?.username ? `@${currentUser.username}` : 'Не указан';

    // Формируем список товаров для сообщения
    const itemsList = orderItems.map(item => 
        `• ${item.name} x${item.quantity} — ${item.price * item.quantity} грн`
    ).join('\n');

    // Формируем красивое сообщение с HTML-разметкой (жирный шрифт)
    const message = `
 <b>Нове замовлення!</b>
👤 <b>Ім'я:</b> ${name}
 <b>Telegram:</b> ${username}
📞 <b>Телефон:</b> ${phone}
🆔 <b>Замовлення №:</b> ${orderNumber}
📅 <b>Дата:</b> ${order.date}

📦 <b>Товари:</b>
${itemsList}

💰 <b>Разом:</b> ${orderTotal} грн
    `.trim();

    // Отправляем запрос к Telegram API
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML' // Включает поддержку жирного текста и переносов строк
        })
    })
    .then(response => {
        if (response.ok) {
            console.log('✅ Уведомление успешно отправлено в Telegram');
        } else {
            console.error('❌ Ошибка отправки уведомления:', response.statusText);
        }
    })
    .catch(error => {
        console.error('❌ Сетевая ошибка при отправке уведомления:', error);
    });
    // ==========================================
    
    // Сохраняем заказ локально (для истории в приложении)
    orders.push(order);
    cart = [];
    saveData();
    updateCartBadge();
    closeModal('checkout-modal');
    
    // Показываем номер заказа клиенту
    const orderNumDisplay = document.getElementById('order-number-display');
    if(orderNumDisplay) orderNumDisplay.textContent = `${t('orderNumber')}${orderNumber}`;
    
    openModal('success-modal');
    haptic('success');
}

// ==========================================
// 11. ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Приложение запускается...');
    
    currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', currentTheme === 'dark');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.classList.toggle('dark', currentTheme === 'dark');
            localStorage.setItem('theme', currentTheme);
            haptic('success');
        });
    }
    
    currentLang = localStorage.getItem('language') || 'ru';
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const activeLangBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
    if (activeLangBtn) activeLangBtn.classList.add('active');
    applyTranslations();

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            localStorage.setItem('language', currentLang);
            applyTranslations();
            renderProducts();
            if (currentPage === 'cart') renderCart();
            if (currentPage === 'orders') renderOrders();
            if (currentPage === 'favorites') renderFavorites();
            if (currentPage === 'admin') renderAdminPanel();
            haptic('success');
        });
    });

    if (currentUser) {
        const nicknameEl = document.getElementById('user-nickname');
        if(nicknameEl) nicknameEl.textContent = currentUser.first_name || 'Пользователь';
        if (currentUser.photo_url) {
            const avatarContainer = document.querySelector('.avatar-container');
            if (avatarContainer) avatarContainer.innerHTML = `<img src="${currentUser.photo_url}" alt="Avatar" class="user-avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    } else {
        const nicknameEl = document.getElementById('user-nickname');
        if(nicknameEl) nicknameEl.textContent = 'Гость';
    }

    updateAdminVisibility();
    updateCartBadge();
    
    // 🔥 ГЛАВНОЕ: Загружаем товары из базы при старте!
    loadProducts();

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); switchPage(btn.dataset.page); });
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.filter || 'all';
            renderProducts();
        });
    });

    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            currentCategory = card.dataset.category || 'all';
            switchPage('catalog');
            setTimeout(() => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === currentCategory));
            }, 100);
        });
    });

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('customer-name').value.trim();
            const phone = document.getElementById('customer-phone').value.trim();
            const errorText = document.getElementById('phone-error');
            if (!validatePhone(phone)) {
                if(errorText) errorText.classList.remove('hidden');
                haptic('error');
                return;
            }
            if(errorText) errorText.classList.add('hidden');
            confirmOrder(name, phone);
        });
    }

    const successCloseBtn = document.getElementById('success-close-btn');
    if (successCloseBtn) successCloseBtn.addEventListener('click', () => { closeModal('success-modal'); switchPage('catalog'); });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => { const modal = btn.closest('.modal'); if(modal) modal.classList.remove('active'); });
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    });

    document.querySelectorAll('.profile-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.section)));
    document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.back)));
    
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) addProductBtn.addEventListener('click', openAddProductModal);
    
    console.log('🎉 Приложение успешно запущено и готово к работе!');
});
// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================
let tg = null;
let currentUser = null;
const ADMIN_IDS = [6088315974, 8361950436];

try {
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        currentUser = tg.initDataUnsafe?.user;
        console.log('✅ Telegram Web App инициализирован');
        console.log('Пользователь:', currentUser);
    } else {
        console.log('⚠️ Режим обычного браузера');
    }
} catch (error) {
    console.error('❌ Ошибка инициализации Telegram:', error);
}

function haptic(type = 'success') {
    try {
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred(type);
        }
    } catch (e) {
        console.log('Haptic:', type);
    }
}

let currentLang = localStorage.getItem('language') || 'ru';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'home';
let currentCategory = 'all';

function safeLoad(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (e) {
        return fallback;
    }
}

let cart = safeLoad('cart', []);
let favorites = safeLoad('favorites', []);
let orders = safeLoad('orders', []);
let products = safeLoad('products', []);

// ==========================================
// 2. ДАННЫЕ И ПЕРЕВОДЫ
// ==========================================
const svgIcons = {
    heart: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21 L10.55 19.7 Q5 15 5 10 Q5 6 8 6 Q10 6 12 8 Q14 6 16 6 Q19 6 19 10 Q19 15 13.45 19.7 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    heartFilled: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21 L10.55 19.7 Q5 15 5 10 Q5 6 8 6 Q10 6 12 8 Q14 6 16 6 Q19 6 19 10 Q19 15 13.45 19.7 Z" fill="#FF0000" stroke="#FF0000" stroke-width="2"/></svg>`
};

const translations = {
    ru: {
        welcome: 'Добро пожаловать!', welcomeText: 'Лучшая одежда для вашего стиля', categories: 'Категории',
        catalog: 'Каталог', all: 'Все', jackets: 'Куртки/Жилетки', tshirts: 'Футболки', shorts: 'Шорты', accessories: 'Аксессуары',
        cart: 'Корзина', cartEmpty: 'Корзина пуста', total: 'Итого:', checkout: 'Оформить заказ',
        home: 'Главная', profile: 'Профиль', myOrders: 'Мои заказы', favorites: 'Избранное', adminPanel: 'Админ панель',
        noOrders: 'У вас пока нет заказов', noFavorites: 'В избранном пока пусто', noProducts: 'Товаров пока нет',
        addToCart: 'Добавить в корзину', checkoutTitle: 'Оформление заказа', orderSuccess: 'Заказ оформлен!',
        orderSuccessText: 'Мы свяжемся с вами в ближайшее время', backToCatalog: 'Вернуться в каталог',
        name: 'Ваше имя', phone: 'Номер телефона', confirmOrder: 'Подтвердить заказ',
        invalidPhone: 'Неверный формат. Должно быть +380XXXXXXXXX',
        addProduct: 'Добавить товар', addNewProduct: '+ Добавить новый товар', editProduct: 'Редактировать товар',
        saveProduct: 'Сохранить', productImage: 'Изображение товара (можно несколько)', productName: 'Название товара',
        productPrice: 'Цена (грн)', productDescription: 'Описание (необязательно)', productCategory: 'Категория',
        selectCategory: 'Выберите категорию', enterName: 'Введите название', enterDescription: 'Описание товара',
        orderNumber: 'Заказ №', remove: 'Удалить', edit: 'Редактировать', delete: 'Удалить',
        deleteConfirm: 'Вы уверены, что хотите удалить этот товар?', productDeleted: 'Товар удален',
        productSaved: 'Товар успешно сохранен!', fillAllFields: 'Заполните все обязательные поля!', selectImage: 'Выберите хотя бы одно изображение!'
    },
    uk: {
        welcome: 'Ласкаво просимо!', welcomeText: 'Найкращий одяг для вашого стилю', categories: 'Категорії',
        catalog: 'Каталог', all: 'Всі', jackets: 'Куртки/Жилетки', tshirts: 'Футболки', shorts: 'Шорти', accessories: 'Аксесуари',
        cart: 'Кошик', cartEmpty: 'Кошик порожній', total: 'Разом:', checkout: 'Оформити замовлення',
        home: 'Головна', profile: 'Профіль', myOrders: 'Мої замовлення', favorites: 'Обране', adminPanel: 'Адмін панель',
        noOrders: 'У вас поки немає замовлень', noFavorites: 'В обраному поки порожньо', noProducts: 'Товарів поки немає',
        addToCart: 'Додати в кошик', checkoutTitle: 'Оформлення замовлення', orderSuccess: 'Замовлення оформлено!',
        orderSuccessText: 'Ми зв\'яжемося з вами найближчим часом', backToCatalog: 'Повернутися в каталог',
        name: 'Ваше ім\'я', phone: 'Номер телефону', confirmOrder: 'Підтвердити замовлення',
        invalidPhone: 'Невірний формат. Має бути +380XXXXXXXXX',
        addProduct: 'Додати товар', addNewProduct: '+ Додати новий товар', editProduct: 'Редагувати товар',
        saveProduct: 'Зберегти', productImage: 'Зображення товару (можна декілька)', productName: 'Назва товару',
        productPrice: 'Ціна (грн)', productDescription: 'Опис (необов\'язково)', productCategory: 'Категорія',
        selectCategory: 'Оберіть категорію', enterName: 'Введіть назву', enterDescription: 'Опис товару',
        orderNumber: 'Замовлення №', remove: 'Видалити', edit: 'Редагувати', delete: 'Видалити',
        deleteConfirm: 'Ви впевнені, що хочете видалити цей товар?', productDeleted: 'Товар видалено',
        productSaved: 'Товар успішно збережено!', fillAllFields: 'Заповніть всі обов\'язкові поля!', selectImage: 'Оберіть хоча б одне зображення!'
    }
};

function t(key) { return translations[currentLang][key] || key; }

// ==========================================
// 3. УТИЛИТЫ И СОХРАНЕНИЕ
// ==========================================
function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.textContent = translations[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) el.placeholder = translations[currentLang][key];
    });
    document.documentElement.lang = currentLang;
}

function applyTheme(theme) {
    currentTheme = theme;
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
}

function generateOrderNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

function saveData() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('products', JSON.stringify(products));
        console.log('✅ Данные сохранены');
    } catch (e) { 
        console.error('Ошибка сохранения:', e); 
        alert('Ошибка сохранения данных. Возможно, localStorage переполнен.');
    }
}

function getCategoryName(category) {
    const map = { 'jackets': t('jackets'), 'tshirts': t('tshirts'), 'shorts': t('shorts'), 'accessories': t('accessories') };
    return map[category] || category;
}

// ==========================================
// 4. НАВИГАЦИЯ И РЕНДЕРИНГ
// ==========================================
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetPage = document.getElementById(`${page}-page`);
    const targetBtn = document.querySelector(`[data-page="${page}"]`);
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

function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    const filtered = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--gray-dark);">Товаров пока нет</p>';
        return;
    }
    
    container.innerHTML = filtered.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" data-id="${product.id}">
                    ${favorites.includes(product.id) ? svgIcons.heartFilled : svgIcons.heart}
                </button>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
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
        btn.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(parseInt(btn.dataset.id)); });
    });
    container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(parseInt(btn.dataset.id)); });
    });
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = `${product.price} грн`;
    document.getElementById('modal-product-description').textContent = product.description || '';
    const imagesContainer = document.getElementById('modal-images-container');
    const images = product.images || [product.image];
    imagesContainer.innerHTML = images.map(img => `<img src="${img}" alt="${product.name}">`).join('');
    document.getElementById('modal-add-to-cart').onclick = () => { addToCart(productId); closeModal('product-modal'); };
    openModal('product-modal');
}

function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    index > -1 ? favorites.splice(index, 1) : favorites.push(productId);
    saveData();
    renderProducts();
    if (currentPage === 'favorites') renderFavorites();
    haptic('success');
}

function addToCart(productId) {
    const existing = cart.find(item => item.id === productId);
    existing ? existing.quantity++ : cart.push({ id: productId, quantity: 1 });
    saveData();
    updateCartBadge();
    haptic('success');
}

function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    total > 0 ? (badge.textContent = total, badge.classList.remove('hidden')) : badge.classList.add('hidden');
}

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
    footer.style.display = 'block';
    let total = 0;
    container.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';
        total += product.price * item.quantity;
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
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
    document.getElementById('cart-total-price').textContent = `${total} грн`;

    container.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (!item) return;
            btn.dataset.action === 'increase' ? item.quantity++ : item.quantity--;
            if (item.quantity === 0) cart = cart.filter(i => i.id !== id);
            saveData(); renderCart(); updateCartBadge();
        });
    });
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cart = cart.filter(i => i.id !== parseInt(btn.dataset.id));
            saveData(); renderCart(); updateCartBadge();
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
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <button class="favorite-btn active" data-id="${product.id}">${svgIcons.heartFilled}</button>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price} грн</div>
                <button class="btn-add-to-cart" data-id="${product.id}">${t('addToCart')}</button>
            </div>
        </div>`).join('');
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(parseInt(btn.dataset.id)); });
    });
    container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(parseInt(btn.dataset.id)); });
    });
}

// ==========================================
// 5. АДМИН ПАНЕЛЬ (МНОЖЕСТВЕННЫЕ ФОТО)
// ==========================================
function renderAdminPanel() {
    const list = document.getElementById('admin-products-list');
    const empty = document.getElementById('admin-empty');
    const count = document.getElementById('products-count');
    if (!list || !empty) return;

    count.textContent = `${t('total')}: ${products.length}`;
    if (products.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    list.innerHTML = products.map(product => `
        <div class="admin-product-card" data-id="${product.id}">
            <div class="admin-product-header">
                <img src="${product.image}" alt="${product.name}" class="admin-product-image">
                <div class="admin-product-info">
                    <div class="admin-product-name">${product.name}</div>
                    <div class="admin-product-category">${getCategoryName(product.category)}</div>
                    <div class="admin-product-price">${product.price} грн</div>
                </div>
            </div>
            <div class="admin-product-actions">
                <button class="admin-btn admin-btn-edit" onclick="editProduct(${product.id})">️ ${t('edit')}</button>
                <button class="admin-btn admin-btn-delete" onclick="deleteProduct(${product.id})">🗑️ ${t('delete')}</button>
            </div>
        </div>
    `).join('');
}

function openAddProductModal() {
    document.getElementById('form-modal-title').textContent = t('addProduct');
    document.getElementById('product-form').reset();
    document.getElementById('edit-product-id').value = '';
    document.getElementById('form-image-preview').innerHTML = '';
    document.getElementById('form-image-preview').classList.remove('active');
    openModal('product-form-modal');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('form-modal-title').textContent = t('editProduct');
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('form-product-name').value = product.name;
    document.getElementById('form-product-price').value = product.price;
    document.getElementById('form-product-description').value = product.description || '';
    document.getElementById('form-product-category').value = product.category;
    const preview = document.getElementById('form-image-preview');
    preview.innerHTML = product.images.map(img => `<img src="${img}" alt="Preview" style="max-width: 100px; margin: 5px;">`).join('');
    preview.classList.add('active');
    openModal('product-form-modal');
}

function deleteProduct(productId) {
    if (!confirm(t('deleteConfirm'))) return;
    products = products.filter(p => p.id !== productId);
    saveData();
    renderAdminPanel();
    haptic('success');
    alert(t('productDeleted'));
}

// Обработка формы с МНОЖЕСТВЕННЫМИ фото
document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const productId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('form-product-name').value.trim();
    const price = parseInt(document.getElementById('form-product-price').value);
    const description = document.getElementById('form-product-description').value.trim();
    const category = document.getElementById('form-product-category').value;
    const imageFiles = document.getElementById('form-product-image').files;

    if (!name || !price || !category) { alert(t('fillAllFields')); return; }

    const saveProduct = (imagesData) => {
        if (productId) {
            const index = products.findIndex(p => p.id == productId);
            if (index !== -1) {
                products[index] = { 
                    ...products[index], 
                    name, 
                    price, 
                    description, 
                    category, 
                    image: imagesData[0] || products[index].image,
                    images: imagesData.length > 0 ? imagesData : products[index].images 
                };
            }
        } else {
            if (imagesData.length === 0) { alert(t('selectImage')); return; }
            products.push({ 
                id: Date.now(), 
                name, 
                price, 
                description, 
                category, 
                image: imagesData[0], 
                images: imagesData 
            });
        }
        saveData();
        closeModal('product-form-modal');
        renderAdminPanel();
        haptic('success');
        alert(t('productSaved'));
    };

    if (imageFiles.length > 0) {
        const readers = [];
        const imagesData = [];
        let loaded = 0;
        
        Array.from(imageFiles).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagesData[index] = event.target.result;
                loaded++;
                if (loaded === imageFiles.length) {
                    saveProduct(imagesData);
                }
            };
            reader.readAsDataURL(file);
        });
    } else if (productId) {
        const product = products.find(p => p.id == productId);
        saveProduct(product?.images || []);
    } else {
        alert(t('selectImage'));
    }
});

// Превью для МНОЖЕСТВЕННЫХ изображений
document.getElementById('form-product-image').addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        const preview = document.getElementById('form-image-preview');
        preview.innerHTML = '';
        let loaded = 0;
        
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.maxWidth = '100px';
                img.style.margin = '5px';
                preview.appendChild(img);
                loaded++;
                if (loaded === files.length) {
                    preview.classList.add('active');
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

// ==========================================
// 6. ОФОРМЛЕНИЕ ЗАКАЗА И МОДАЛКИ
// ==========================================
function checkout() {
    if (cart.length === 0) { haptic('error'); return; }
    openModal('checkout-modal');
}

function validatePhone(phone) {
    return /^\+380\d{9}$/.test(phone.replace(/\s/g, ''));
}

function confirmOrder(name, phone) {
    const orderNumber = generateOrderNumber();
    const order = {
        id: orderNumber,
        date: new Date().toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'uk-UA'),
        items: cart.map(item => {
            const product = products.find(p => p.id === item.id);
            return { name: product.name, price: product.price, quantity: item.quantity };
        }),
        total: cart.reduce((sum, item) => {
            const product = products.find(p => p.id === item.id);
            return sum + (product.price * item.quantity);
        }, 0),
        customer: { name, phone }
    };
    orders.push(order);
    cart = [];
    saveData();
    updateCartBadge();
    closeModal('checkout-modal');
    document.getElementById('order-number-display').textContent = `${t('orderNumber')}${orderNumber}`;
    openModal('success-modal');
    haptic('success');
}

function openModal(modalId) { const m = document.getElementById(modalId); if (m) m.classList.add('active'); }
function closeModal(modalId) { const m = document.getElementById(modalId); if (m) m.classList.remove('active'); }

// ==========================================
// 7. ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.lang-btn[data-lang="${currentLang}"]`)?.classList.add('active');
    updateTranslations();

    // Установка аватарки и имени пользователя
    if (currentUser) {
        document.getElementById('user-nickname').textContent = currentUser.first_name || 'Пользователь';
        if (currentUser.photo_url) {
            const avatarContainer = document.querySelector('.avatar-container');
            avatarContainer.innerHTML = `<img src="${currentUser.photo_url}" alt="Avatar" class="user-avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    } else {
        document.getElementById('user-nickname').textContent = 'Гость';
    }

    // Показ кнопки админ панели только для админов
    if (currentUser && ADMIN_IDS.includes(currentUser.id)) {
        document.querySelectorAll('.admin-only').forEach(btn => {
            btn.style.display = 'flex';
        });
        console.log('✅ Админ панель доступна для пользователя:', currentUser.id);
    }

    updateCartBadge();

    // Переключатель темы
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        haptic('success');
    });

    // Переключатель языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            localStorage.setItem('language', currentLang);
            updateTranslations();
            renderProducts();
            if (currentPage === 'cart') renderCart();
            if (currentPage === 'orders') renderOrders();
            if (currentPage === 'favorites') renderFavorites();
            if (currentPage === 'admin') renderAdminPanel();
            haptic('success');
        });
    });

    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });

    // Фильтры и категории
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.filter;
            renderProducts();
        });
    });
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            currentCategory = card.dataset.category;
            switchPage('catalog');
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === currentCategory));
        });
    });

    // Оформление заказа
    document.getElementById('checkout-btn')?.addEventListener('click', checkout);
    document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const errorText = document.getElementById('phone-error');
        if (!validatePhone(phone)) { errorText.classList.remove('hidden'); haptic('error'); return; }
        errorText.classList.add('hidden');
        confirmOrder(name, phone);
    });

    document.getElementById('customer-phone')?.addEventListener('input', (e) => {
        const errorText = document.getElementById('phone-error');
        e.target.value.length > 0 && !validatePhone(e.target.value) ? errorText.classList.remove('hidden') : errorText.classList.add('hidden');
    });

    // Закрытие модалок
    document.getElementById('success-close-btn')?.addEventListener('click', () => { closeModal('success-modal'); switchPage('catalog'); });
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => btn.closest('.modal').classList.remove('active'));
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    });

    // Профиль и назад
    document.querySelectorAll('.profile-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.section)));
    document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.back)));
    
    console.log('✅ Приложение инициализировано');
    console.log('📦 Товаров:', products.length);
});
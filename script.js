// 1. Регистрируем плагин GSAP
gsap.registerPlugin(ScrollTrigger);

// ==============================================
// НАСТРОЙКА ЛИНИЙ (Анимация карты)
// ==============================================
function setupPath(selector) {
    const paths = document.querySelectorAll(selector);
    paths.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length
        });
    });
}
// Проверяем, есть ли элементы на странице перед запуском, чтобы избежать ошибок
if(document.querySelector(".route-path")) {
    setupPath(".route-path");
}

// ==============================================
// АНИМАЦИЯ КАРТЫ (ПО ШАГАМ)
// ==============================================
// Оборачиваем в проверку, чтобы скрипт не падал, если элементов нет
if(document.querySelector(".path-1")) {
    gsap.to(".path-1", {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: ".step-1", start: "top center", end: "bottom center", scrub: 1 },
        onStart: () => {
            gsap.to(".city-dot[data-city='chios']", { opacity: 1, duration: 0.5 });
            gsap.to(".city-label", { opacity: 1, duration: 0.5, stagger: 0.1 });
        }
    });

    gsap.to([".path-2a", ".path-2b"], {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: ".step-2", start: "top center", end: "bottom center", scrub: 1 },
        onStart: () => {
            gsap.to(".city-dot[data-city='istanbul']", { opacity: 1, scale: 1.5, duration: 0.3 });
        }
    });

    ScrollTrigger.create({
        trigger: ".step-3", start: "top center",
        onEnter: () => {
            gsap.to(".city-dot[data-city='odessa'], .city-dot[data-city='kerch'], .city-dot[data-city='mariupol'], .city-dot[data-city='taganrog']", 
            { opacity: 1, scale: 1.2, duration: 0.5, stagger: 0.1 });
        }
    });
}

// ==============================================
// ПЛАВНОЕ ПОЯВЛЕНИЕ БЛОКОВ
// ==============================================
const animatedBlocks = document.querySelectorAll(".book-spread, .flipbook-container");

animatedBlocks.forEach(block => {
    gsap.from(block, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: block,
            start: "top 85%", 
            toggleActions: "play none none reverse"
        }
    });
});

// ==============================================
// ЗАПУСК КНИГИ (ИСПРАВЛЕНО)
// ==============================================
jQuery(document).ready(function($) {
    
    var bookElement = $("#family-book");
    var source = bookElement.attr("data-source");

    // Запускаем только если элемент существует и есть ссылка
    if(bookElement.length > 0 && source) {
        
        // Опции для dFlip
        var options = {
            height: '100%',
            duration: 800,
            webgl: false // Отключаем 3D для стабильности (особенно локально)
        };

        bookElement.flipBook(source, options);
    }
});
// ==============================================
// РЕЕСТР ПЕРСОНАЛИЙ (С ПАГИНАЦИЕЙ И ССЫЛКАМИ)
// ==============================================

let allPeopleData = [];  // Все данные
let filteredData = [];   // Данные после поиска
let currentPage = 1;     // Текущая страница
const itemsPerPage = 10; // Сколько показывать на странице

// 1. Загрузка данных
fetch('people.json')
    .then(response => response.json())
    .then(data => {
        allPeopleData = data;
        filteredData = data; // Сначала показываем всех
        renderPage(1);       // Рисуем 1 страницу
    })
    .catch(error => console.error('Ошибка загрузки JSON:', error));

// 2. Функция отрисовки страницы
function renderPage(page) {
    const list = document.getElementById('registryList');
    const pagination = document.getElementById('paginationControls');
    list.innerHTML = '';
    pagination.innerHTML = '';

    // Если список пуст
    if (filteredData.length === 0) {
        list.innerHTML = '<div style="padding:20px; text-align:center; opacity:0.6;">Ничего не найдено</div>';
        return;
    }

    // Вычисляем, кого показывать (slice)
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredData.slice(startIndex, endIndex);

    // Рисуем список
    pageItems.forEach(person => {
        const row = document.createElement('div');
        row.className = 'registry-row';
        row.onclick = () => openModal(person);
        
        row.innerHTML = `
            <span class="reg-name">${person.name}</span>
            <span class="reg-dates">${person.dates || ''}</span>
        `;
        list.appendChild(row);
    });

    // Рисуем пагинацию
    renderPagination(filteredData.length, page);
}

// 3. Рисуем кнопки страниц
function renderPagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('paginationControls');
    
    if (totalPages <= 1) return; // Если страница одна, кнопки не нужны

    // Кнопка "Назад"
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerText = '←';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    container.appendChild(prevBtn);

    // Номера страниц (простая версия)
    // Если страниц много, можно показать только текущую "Стр 1 из 5"
    const info = document.createElement('span');
    info.style.cssText = 'align-self:center; font-size:0.9rem; color:var(--slate-light); font-family:Lato;';
    info.innerText = `Стр. ${currentPage} из ${totalPages}`;
    container.appendChild(info);

    // Кнопка "Вперед"
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerText = '→';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    container.appendChild(nextBtn);
}

function changePage(newPage) {
    currentPage = newPage;
    renderPage(newPage);
    // Плавный скролл к началу списка
    document.getElementById('registry').scrollIntoView({ behavior: 'smooth' });
}

// 4. Поиск
document.getElementById('registrySearch').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredData = allPeopleData.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.location && p.location.toLowerCase().includes(term))
    );
    currentPage = 1; // При поиске сбрасываем на 1 страницу
    renderPage(1);
});

// 5. Обработка ссылок на родственников (МАГИЯ REGEX)
function formatRelatives(text) {
    if (!text) return '';
    // Ищем паттерн "(id=123)" или "id=123" и заменяем на ссылку
    // \d+ означает "любое число"
    return text.replace(/\(id=(\d+)\)/gi, (match, id) => {
        return `<span class="relative-link" onclick="openRelative(${id})">➜ перейти</span>`;
    });
}

// Глобальная функция для открытия родственника
window.openRelative = function(id) {
    // Ищем человека по ID
    // Обрати внимание: id в JSON число, а из HTML приходит строка, поэтому == (не ===)
    const relative = allPeopleData.find(p => p.id == id);
    if (relative) {
        openModal(relative); // Просто открываем модалку с новым человеком
    } else {
        alert('Карточка родственника пока не создана.');
    }
};

// 6. Открытие модального окна
function openModal(person) {
    const modal = document.getElementById('personModal');
    const content = document.getElementById('modalContent');
    
    // Формируем HTML
    let html = `
        <div class="person-layout-grid">
            <div class="person-left-col">
                ${person.photo ? `<img src="${person.photo}" class="person-img" alt="${person.name}">` : ''}
                
                ${person.relatives ? `
                    <div class="relatives-box">
                        <strong style="display:block; margin-bottom:5px; color:var(--slate-light); text-transform:uppercase; font-size:0.75rem;">Родственные связи:</strong>
                        ${formatRelatives(person.relatives)}
                    </div>
                ` : ''}
            </div>

            <div class="person-right-col">
                <h2 class="person-full-name">${person.name}</h2>

                ${(person.birth || person.death) ? `
                    <div class="life-dates">
                        ${person.birth ? `<div class="date-row"><span class="date-icon">★</span> <span>${person.birth}</span></div>` : ''}
                        ${person.death ? `<div class="date-row"><span class="date-icon">✝</span> <span>${person.death}</span></div>` : ''}
                    </div>
                ` : ''}

                ${person.bio ? `
                    <div class="person-bio">${person.bio}</div>
                ` : '<p style="opacity:0.5; font-style:italic;">Информация о биографии отсутствует.</p>'}
                
                ${person.sources ? `
                    <div class="sources-box">
                        <strong>🕮 Источники:</strong><br>
                        ${person.sources.replace(/\n/g, '<br>')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    content.innerHTML = html;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; 
    
    // Прокручиваем модальное окно наверх (важно при переходе между родственниками)
    document.querySelector('.modal-card').scrollTop = 0;
}

function closeModal() {
    document.getElementById('personModal').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('personModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('personModal')) {
        closeModal();
    }
});

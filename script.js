// 1. Регистрируем плагин GSAP
gsap.registerPlugin(ScrollTrigger);

// ==============================================
// ВАЖНО: Настройка для поиска текста (ставим в самое начало)
// ==============================================
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

// ==============================================
// АНИМАЦИЯ ВЕКТОРНОЙ КАРТЫ (SCROLLYTELLING)
// ==============================================

// Подготовка линий (прячем их перед стартом)
function preparePaths() {
    const paths = document.querySelectorAll(".routes-group .route-path");
    paths.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
}

// Запускаем только если карта есть на странице
if(document.querySelector(".map-svg-vector")) {
    preparePaths();

    // --- ШАГ 1: Хиос (Старт) ---
    // Используем jQuery() для поиска текста, чтобы избежать ошибки
    gsap.to([".city-dot[data-city='chios']", jQuery(".city-label:contains('Хиос')")], {
        opacity: 1, scale: 1.2,
        duration: 0.5,
        scrollTrigger: {
            trigger: ".step-1", start: "top center", end: "center center",
            toggleActions: "play reverse play reverse"
        }
    });

    // --- ШАГ 2: Исход ---
    gsap.to(".stage-1 .route-path", {
        strokeDashoffset: 0,
        scrollTrigger: {
            trigger: ".step-2", start: "top center", end: "bottom center",
            scrub: 1.5
        }
    });
    
    // Стамбул и Одесса (используем jQuery для безопасности)
    gsap.to([".city-dot[data-city='istanbul']", ".city-dot[data-city='odessa']", jQuery(".city-label:contains('Стамбул')"), jQuery(".city-label:contains('Одесса')")], {
        opacity: 1, duration: 0.5, delay: 0.2,
        scrollTrigger: { trigger: ".step-2", start: "center center" }
    });


    // --- ШАГ 3: Таганрог ---
    gsap.to(".city-dot[data-city='taganrog']", {
        opacity: 1, scale: 2.5,
        duration: 0.8, ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: ".step-3", start: "top center",
            toggleActions: "play reverse play reverse"
        }
    });
    // Показываем подпись Таганрога
    gsap.to(jQuery(".city-label:contains('Таганрог')"), { 
        opacity: 1, 
        scrollTrigger: { trigger: ".step-3", start: "top center" } 
    });


    // --- ШАГ 4: В столицы ---
    gsap.to(".stage-2 .route-path", {
        strokeDashoffset: 0,
        scrollTrigger: { trigger: ".step-4", start: "top center", end: "bottom center", scrub: 1.5 }
    });
    // Москва и СПБ
    gsap.to([".city-dot[data-city='moscow']", ".city-dot[data-city='spb']", jQuery(".city-label:contains('Москва')"), jQuery(".city-label:contains('Петербург')")], {
        opacity: 1,
        scrollTrigger: { trigger: ".step-4", start: "center center" }
    });

    // --- ШАГ 5: Эмиграция ---
    gsap.to(".stage-3 .route-path", {
        strokeDashoffset: 0,
        scrollTrigger: { trigger: ".step-5", start: "top center", end: "bottom center", scrub: 1.5 }
    });
    // Европа
    gsap.to([".city-dot[data-city='geneva']", ".city-dot[data-city='paris']", ".city-dot[data-city='warsaw']", jQuery(".city-label:contains('Женева')"), jQuery(".city-label:contains('Париж')"), jQuery(".city-label:contains('Варшава')")], {
        opacity: 1, stagger: 0.1,
        scrollTrigger: { trigger: ".step-5", start: "center center" }
    });
}

// Плавное появление блоков (Книга)
const animatedBlocks = document.querySelectorAll(".book-spread, .flipbook-container");
animatedBlocks.forEach(block => {
    gsap.from(block, {
        opacity: 0, y: 50, duration: 1,
        scrollTrigger: { trigger: block, start: "top 85%", toggleActions: "play none none reverse" }
    });
});

// Запуск dFlip (Книга)
jQuery(document).ready(function($) {
    var bookElement = $("#family-book");
    var source = bookElement.attr("data-source");
    if(bookElement.length > 0 && source) {
        bookElement.flipBook(source, { height: '100%', duration: 800, webgl: false });
    }
});


// ==============================================
// РЕЕСТР ПЕРСОНАЛИЙ
// ==============================================

let allPeopleData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 5;

// Загрузка
fetch('people.json')
    .then(response => {
        if (!response.ok) throw new Error("HTTP error " + response.status);
        return response.json();
    })
    .then(data => {
        allPeopleData = data;
        filteredData = data;
        renderPage(1);
    })
    .catch(error => console.error('Ошибка загрузки people.json. Если вы открываете сайт локально, используйте локальный сервер.', error));

// Выбор количества
const selectElement = document.getElementById('itemsPerPageSelect');
if (selectElement) {
    selectElement.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; 
        renderPage(1);
    });
}

// Отрисовка
function renderPage(page) {
    const list = document.getElementById('registryList');
    const pagination = document.getElementById('paginationControls');
    
    if(!list) return;
    list.innerHTML = '';
    pagination.innerHTML = '';

    if (filteredData.length === 0) {
        list.innerHTML = '<div style="padding:20px; text-align:center; opacity:0.6;">Ничего не найдено</div>';
        return;
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredData.slice(startIndex, endIndex);

    pageItems.forEach(person => {
        const row = document.createElement('div');
        row.className = 'registry-row';
        row.onclick = () => openModal(person);
        row.innerHTML = `<span class="reg-name">${person.name}</span><span class="reg-dates">${person.dates || ''}</span>`;
        list.appendChild(row);
    });

    renderPagination(filteredData.length, page);
}

// Пагинация
function renderPagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('paginationControls');
    
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerText = '←';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    container.appendChild(prevBtn);

    const info = document.createElement('span');
    info.style.cssText = 'align-self:center; font-size:0.9rem; color:var(--slate-light); font-family:Lato; margin:0 10px;';
    info.innerText = `Стр. ${currentPage} из ${totalPages}`;
    container.appendChild(info);

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
    const section = document.getElementById('registry');
    if(section) {
        const y = section.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}

// Поиск
const searchInput = document.getElementById('registrySearch');
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredData = allPeopleData.filter(p => 
            p.name.toLowerCase().includes(term) || 
            (p.location && p.location.toLowerCase().includes(term))
        );
        currentPage = 1;
        renderPage(1);
    });
}


/* =========================================
   ФУНКЦИЯ: ПРЕВРАЩЕНИЕ ТЕКСТА В ССЫЛКИ
   (Ищет "id=123" и делает ссылку)
   ========================================= */
function formatRelatives(relativesText) {
    if (!relativesText) return "Нет данных";

    // 1. Разбиваем список по точке с запятой ";"
    const list = relativesText.split(';');

    // 2. Обрабатываем каждый кусочек
    return list.map(item => {
        item = item.trim(); // Убираем лишние пробелы

        // Регулярное выражение: ищем текст, а потом (id=ЧИСЛО...)
        // match[1] — это текст (например, "Отец: Николай")
        // match[2] — это само число ID (например, "12")
        const match = item.match(/^(.*?)\s*\(id=(\d+).*?\)$/);

        if (match) {
            const cleanText = match[1]; 
            const linkId = match[2];
            
            // Возвращаем кликабельную ссылку
            return `<div class="relatives-line">
                        <span class="relative-link" onclick="openModal(${linkId})">
                            ${cleanText} ➜
                        </span>
                    </div>`;
        } else {
            // Если ID нет, возвращаем просто текст
            if(item === "") return "";
            return `<div class="relatives-line">${item}</div>`;
        }
    }).join(''); // Собираем всё обратно в одну строку
}

/* =========================================
   ОТКРЫТИЕ МОДАЛЬНОГО ОКНА
   ========================================= */
function openModal(id) {
    // 1. Находим человека в базе (peopleData - это наш JSON)
    const person = peopleData.find(p => p.id == id);
    if (!person) return;

    // 2. Генерируем красивые ссылки для родственников
    const relativesHtml = formatRelatives(person.relatives);

    // 3. Собираем содержимое окна
    const modalHtml = `
        <div class="person-layout-grid">
            
            <div class="person-left-col">
                ${person.image 
                    ? `<img src="${person.image}" alt="${person.name}" class="person-img">` 
                    : `<div class="person-img-placeholder">Нет фото</div>`
                }

                <div class="relatives-box">
                    <strong style="display:block; margin-bottom:10px; color:var(--ink);">Родственники:</strong>
                    ${relativesHtml}
                </div>
            </div>

            <div class="person-right-col">
                <h2 class="person-full-name">${person.name}</h2>
                
                <div class="life-dates">
                    <div class="date-row">
                        <span class="date-icon">🐣</span> 
                        <strong>Рождение:</strong> ${person.birthDate || "?"} 
                        ${person.birthPlace ? `(${person.birthPlace})` : ""}
                    </div>
                    <div class="date-row" style="margin-top:5px;">
                        <span class="date-icon">✝️</span> 
                        <strong>Смерть:</strong> ${person.deathDate || "—"} 
                        ${person.deathPlace ? `(${person.deathPlace})` : ""}
                    </div>
                </div>

                <div class="person-bio">
                    ${person.bio ? person.bio : "Биография уточняется..."}
                </div>

                ${person.sources ? `
                <div class="sources-box">
                    <strong>Источники:</strong><br>
                    <a href="${person.sources}" target="_blank" style="color:var(--gold); text-decoration:underline;">
                        Перейти к архивному документу
                    </a>
                </div>` : ""}
            </div>
        </div>
    `;

    // 4. Вставляем в HTML и показываем
    document.getElementById('modalContent').innerHTML = modalHtml;
    document.getElementById('personModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
}

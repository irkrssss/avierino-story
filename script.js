// 1. Регистрируем плагин GSAP
gsap.registerPlugin(ScrollTrigger);

// ==============================================
// АНИМАЦИЯ КАРТЫ И ЛИНИЙ
// ==============================================
function setupPath(selector) {
    const paths = document.querySelectorAll(selector);
    paths.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
}
if(document.querySelector(".route-path")) setupPath(".route-path");

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

// Плавное появление блоков
const animatedBlocks = document.querySelectorAll(".book-spread, .flipbook-container");
animatedBlocks.forEach(block => {
    gsap.from(block, {
        opacity: 0, y: 50, duration: 1,
        scrollTrigger: { trigger: block, start: "top 85%", toggleActions: "play none none reverse" }
    });
});

// Запуск книги (Flipbook)
jQuery(document).ready(function($) {
    var bookElement = $("#family-book");
    var source = bookElement.attr("data-source");
    if(bookElement.length > 0 && source) {
        bookElement.flipBook(source, { height: '100%', duration: 800, webgl: false });
    }
});


// ==============================================
// РЕЕСТР ПЕРСОНАЛИЙ (ФИНАЛ)
// ==============================================

let allPeopleData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 5; // По умолчанию 5

// 1. Загрузка
fetch('people.json')
    .then(response => response.json())
    .then(data => {
        allPeopleData = data;
        filteredData = data;
        renderPage(1);
    })
    .catch(error => console.error('Ошибка JSON:', error));

// 2. Обработка выбора количества (5/10/20)
const selectElement = document.getElementById('itemsPerPageSelect');
if (selectElement) {
    selectElement.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; // Сброс на начало
        renderPage(1);
    });
}

// 3. Отрисовка страницы
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

// 4. Пагинация
function renderPagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('paginationControls');
    
    if (totalPages <= 1) return;

    // Кнопка Назад
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerText = '←';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    container.appendChild(prevBtn);

    // Инфо
    const info = document.createElement('span');
    info.style.cssText = 'align-self:center; font-size:0.9rem; color:var(--slate-light); font-family:Lato; margin:0 10px;';
    info.innerText = `Стр. ${currentPage} из ${totalPages}`;
    container.appendChild(info);

    // Кнопка Вперед
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
    // Скролл чуть выше реестра
    const section = document.getElementById('registry');
    if(section) {
        const y = section.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}

// 5. Поиск
document.getElementById('registrySearch').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredData = allPeopleData.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.location && p.location.toLowerCase().includes(term))
    );
    currentPage = 1;
    renderPage(1);
});

// 6. Форматирование ссылок и Модалка
function formatRelatives(text) {
    if (!text) return '';
    return text.split('\n').map(line => {
        const match = line.match(/(.*?)\s*\(id=(\d+)\)/i);
        if (match) {
            return `<div class="relatives-line"><span class="relative-link" onclick="openRelative(${match[2]})">${match[1].trim()}</span></div>`;
        }
        return line.trim() ? `<div class="relatives-line">${line}</div>` : '';
    }).join('');
}

window.openRelative = function(id) {
    const person = allPeopleData.find(p => p.id == id);
    if (person) openModal(person);
};

function openModal(person) {
    const modal = document.getElementById('personModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="person-layout-grid">
            <div class="person-left-col">
                ${person.photo ? `<img src="${person.photo}" class="person-img" alt="${person.name}">` : ''}
                ${person.relatives ? `<div class="relatives-box"><strong style="display:block;margin-bottom:5px;color:var(--slate-light);font-size:0.75rem;">РОДСТВЕННЫЕ СВЯЗИ:</strong>${formatRelatives(person.relatives)}</div>` : ''}
            </div>
            <div class="person-right-col">
                <h2 class="person-full-name">${person.name}</h2>
                ${(person.birth || person.death) ? `<div class="life-dates">${person.birth ? `<div class="date-row"><span class="date-icon">★</span> ${person.birth}</div>` : ''}${person.death ? `<div class="date-row"><span class="date-icon">✝</span> ${person.death}</div>` : ''}</div>` : ''}
                ${person.bio ? `<div class="person-bio">${person.bio}</div>` : '<p style="opacity:0.5;">Биография отсутствует.</p>'}
                ${person.sources ? `<div class="sources-box"><strong>🕮 Источники:</strong><br>${person.sources.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
        </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.querySelector('.modal-card').scrollTop = 0;
}

function closeModal() {
    document.getElementById('personModal').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('personModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('personModal')) closeModal();
});

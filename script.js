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
// РЕЕСТР ПЕРСОНАЛИЙ
// ==============================================

let peopleData = []; // Сюда загрузим данные

// 1. Загрузка данных
fetch('people.json')
    .then(response => response.json())
    .then(data => {
        peopleData = data;
        renderRegistry(peopleData); // Рисуем список сразу
    })
    .catch(error => console.error('Ошибка загрузки JSON:', error));

// 2. Функция отрисовки списка
function renderRegistry(data) {
    const list = document.getElementById('registryList');
    list.innerHTML = ''; // Очищаем текущий список

    if (data.length === 0) {
        list.innerHTML = '<div style="padding:20px; text-align:center;">Ничего не найдено</div>';
        return;
    }

    data.forEach(person => {
        const row = document.createElement('div');
        row.className = 'registry-row';
        // По клику открываем модалку с этим человеком
        row.onclick = () => openModal(person);
        
        row.innerHTML = `
            <span style="font-weight:bold; color:var(--ink);">${person.name}</span>
            <span style="color:var(--slate-light);">${person.dates || ''}</span>
            <span style="font-style:italic;">${person.location || ''}</span>
        `;
        list.appendChild(row);
    });
}

// 3. Поиск (фильтрация)
document.getElementById('registrySearch').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = peopleData.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.location && p.location.toLowerCase().includes(term))
    );
    renderRegistry(filtered);
});

// 4. Открытие модального окна (ОБНОВЛЕННАЯ ВЕРСИЯ)
function openModal(person) {
    const modal = document.getElementById('personModal');
    const content = document.getElementById('modalContent');
    
    const layoutClass = person.photo ? 'person-layout has-photo' : 'person-layout';
    
    let html = `
        <div class="${layoutClass}">
            ${person.photo ? `<div><img src="${person.photo}" class="person-img" alt="${person.name}"></div>` : ''}
            
            <div class="person-info">
                <h3 class="person-name">${person.name}</h3>
                <span class="person-dates">${person.dates || ''}</span>
                ${person.location ? `<p style="margin-bottom:15px;"><strong>📍 ${person.location}</strong></p>` : ''}
                
                ${person.bio ? `
                    <div style="margin-top:20px;">
                        <span class="person-bio-label">Биография</span>
                        <p style="margin-top:5px; text-align:justify;">${person.bio}</p>
                    </div>
                ` : ''}

                ${person.relatives ? `
                    <div style="margin-top:20px; padding:15px; background:rgba(192, 160, 98, 0.1); border-radius:4px;">
                        <strong style="color:var(--ink); font-size:0.9rem;">Родственные связи:</strong>
                        <p style="margin:5px 0 0 0; font-size:0.9rem;">${person.relatives}</p>
                    </div>
                ` : ''}

                ${person.sources ? `
                    <div style="margin-top:20px; font-size:0.85rem; opacity:0.7;">
                        <strong>Источники:</strong> ${person.sources}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    content.innerHTML = html;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; 
}

// 5. Закрытие модального окна
function closeModal() {
    document.getElementById('personModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Закрытие по клику на затемненный фон
document.getElementById('personModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('personModal')) {
        closeModal();
    }
});

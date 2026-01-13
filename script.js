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

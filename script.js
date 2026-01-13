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

setupPath(".route-path");


// ==============================================
// АНИМАЦИЯ МАРШРУТОВ (ПО ШАГАМ)
// ==============================================

// ШАГ 1
gsap.to(".path-1", {
    strokeDashoffset: 0, ease: "none",
    scrollTrigger: { trigger: ".step-1", start: "top center", end: "bottom center", scrub: 1 },
    onStart: () => {
        gsap.to(".city-dot[data-city='chios']", { opacity: 1, duration: 0.5 });
        gsap.to(".city-label", { opacity: 1, duration: 0.5, stagger: 0.1 });
    }
});

// ШАГ 2
gsap.to([".path-2a", ".path-2b"], {
    strokeDashoffset: 0, ease: "none",
    scrollTrigger: { trigger: ".step-2", start: "top center", end: "bottom center", scrub: 1 },
    onStart: () => {
        gsap.to(".city-dot[data-city='istanbul']", { opacity: 1, scale: 1.5, duration: 0.3 });
    }
});

// ШАГ 3
ScrollTrigger.create({
    trigger: ".step-3", start: "top center",
    onEnter: () => {
        gsap.to(".city-dot[data-city='odessa'], .city-dot[data-city='kerch'], .city-dot[data-city='mariupol'], .city-dot[data-city='taganrog']", 
        { opacity: 1, scale: 1.2, duration: 0.5, stagger: 0.1 });
    }
});


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
// !!! ВАЖНО: ПРИНУДИТЕЛЬНЫЙ ЗАПУСК КНИГИ !!!
// ==============================================
// Если книга не появляется сама, мы запускаем её вручную через jQuery
jQuery(document).ready(function($) {
    
    var bookElement = $("#family-book");
    var source = bookElement.attr("data-source");

    if(source) {
        // Запускаем dFlip
        bookElement.flipBook({
            pdf: source,
            template: {
                html: "https://cdn.jsdelivr.net/npm/dflip/templates/default-book-view.html",
                styles: [
                    "https://cdn.jsdelivr.net/npm/dflip/css/short-white-book-view.css",
                    "https://cdn.jsdelivr.net/npm/dflip/css/white-book-view.css"
                ],
                script: "https://cdn.jsdelivr.net/npm/dflip/js/default-book-view.js"
            }
        });
    }
});

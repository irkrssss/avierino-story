// 1. Регистрируем плагин
gsap.registerPlugin(ScrollTrigger);

// ==============================================
// НАСТРОЙКА ЛИНИЙ (Чтобы они рисовались честно)
// ==============================================
function setupPath(selector) {
    const paths = document.querySelectorAll(selector);
    paths.forEach(path => {
        const length = path.getTotalLength();
        // Скрываем линию: отступ равен длине линии
        gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length
        });
    });
}

// Подготавливаем все наши маршруты перед стартом
setupPath(".route-path");


// ==============================================
// АНИМАЦИЯ КАРТЫ (ПО ШАГАМ)
// ==============================================

// ШАГ 1: Хиос -> Константинополь
// Когда скроллим первый текстовый блок (.step-1)
gsap.to(".path-1", {
    strokeDashoffset: 0, // Рисуем линию до конца
    ease: "none",
    scrollTrigger: {
        trigger: ".step-1",
        start: "top center",   // Начинаем, когда текст доехал до центра
        end: "bottom center",  // Заканчиваем, когда текст уехал
        scrub: 1               // Плавная привязка к скроллу
    },
    onStart: () => {
        // Показываем точку Хиоса и подписи при старте
        gsap.to(".city-dot[data-city='chios']", { opacity: 1, duration: 0.5 });
        gsap.to(".city-label", { opacity: 1, duration: 0.5, stagger: 0.1 });
    }
});

// ШАГ 2: Разветвление (Ветки на Одессу и Керчь)
// Когда скроллим второй текстовый блок (.step-2)
gsap.to([".path-2a", ".path-2b"], {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
        trigger: ".step-2",
        start: "top center",
        end: "bottom center",
        scrub: 1
    },
    onStart: () => {
        // Подсвечиваем Константинополь, когда дошли до него
        gsap.to(".city-dot[data-city='istanbul']", { opacity: 1, scale: 1.5, duration: 0.3 });
    }
});

// ШАГ 3: Финал (Таганрог и Мариуполь)
// Когда доходим до третьего блока
ScrollTrigger.create({
    trigger: ".step-3",
    start: "top center",
    onEnter: () => {
        // Зажигаем финальные города
        gsap.to(".city-dot[data-city='odessa'], .city-dot[data-city='kerch'], .city-dot[data-city='mariupol'], .city-dot[data-city='taganrog']", 
        { opacity: 1, scale: 1.2, duration: 0.5, stagger: 0.1 });
    }
});


// ==============================================
// ДОПОЛНИТЕЛЬНО: Плавное появление книг
// ==============================================
const books = document.querySelectorAll(".book-spread");

books.forEach(book => {
    gsap.from(book, {
        opacity: 0,
        y: 50, // Книга выезжает снизу
        duration: 1,
        scrollTrigger: {
            trigger: book,
            start: "top 85%", // Анимация начнется, когда верх книги появится внизу экрана
            toggleActions: "play none none reverse" // Появляется один раз (или исчезает при скролле вверх)
        }
    });
});

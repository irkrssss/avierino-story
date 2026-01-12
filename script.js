gsap.registerPlugin(ScrollTrigger);

// 1. АНИМАЦИЯ КАРТЫ (Рисуем линию)
// Находим длину пути
const path = document.querySelector("#route-line");
const pathLength = path.getTotalLength();

// Скрываем линию изначально
gsap.set(path, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength
});

gsap.to(path, {
    strokeDashoffset: 0, // Рисуем до конца
    ease: "none",
    scrollTrigger: {
        trigger: ".map-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // Привязываем к скроллу
    }
});

// Анимация текста шагов (появление)
const steps = document.querySelectorAll(".step");
steps.forEach(step => {
    gsap.from(step, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: step,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play reverse play reverse"
        }
    });
});

// 2. ПАРАЛЛАКС ФОНА (Контекст)
gsap.to(".context-bg", {
    yPercent: 30, // Фон движется медленнее скролла
    ease: "none",
    scrollTrigger: {
        trigger: ".context-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
});

// 3. ДРЕВО (Фокус)
// Скрываем "чужие" ноды, когда доходим до древа
gsap.to(".other-node", {
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: ".tree-section",
        start: "top center",
        toggleActions: "play none none reverse"
    }
});

// Показываем подписи к "моей" ветке по очереди
const myNodes = document.querySelectorAll(".my-node span");
gsap.to(myNodes, {
    opacity: 1,
    stagger: 0.5, // С задержкой
    scrollTrigger: {
        trigger: ".tree-section",
        start: "top center",
        end: "bottom center",
        scrub: 1
    }
});

// 4. ГАЛЕРЕЯ (Горизонтальный скролл)
// Мы перехватываем вертикальный скролл и двигаем контейнер влево
const galleryContainer = document.querySelector(".gallery-container");

gsap.to(galleryContainer, {
    xPercent: -100 * (galleryContainer.offsetWidth / window.innerWidth - 1), // Вычисляем, насколько двигать
    ease: "none",
    scrollTrigger: {
        trigger: ".gallery-wrapper",
        pin: true, // Закрепляем секцию на экране
        scrub: 1, // Привязываем к колесику мыши
        // snap: 1 / 4, // (Опционально) Доводка до слайдов
        end: () => "+=" + galleryContainer.offsetWidth // Длина скролла равна ширине галереи
    }
});

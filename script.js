// Регистрируем плагин
gsap.registerPlugin(ScrollTrigger);

// 1. Анимация появления заголовка
gsap.to(".hero-title", {
    duration: 1.5,
    y: 0,
    opacity: 1,
    ease: "power3.out",
    delay: 0.5
});

gsap.to(".hero-subtitle", {
    duration: 1.5,
    opacity: 1,
    delay: 1.5
});

// 2. Анимация текста главы
gsap.from(".chapter-one div", {
    scrollTrigger: {
        trigger: ".chapter-one",
        start: "top 80%",
        end: "bottom top",
        toggleActions: "play none none reverse"
    },
    y: 50,
    opacity: 0,
    duration: 1
});

// 3. Анимация цитаты
gsap.from("#card-anim", {
    scrollTrigger: {
        trigger: ".gallery-section",
        start: "top center",
        scrub: 1
    },
    scale: 0.8,
    opacity: 0,
    duration: 1
});

// Fancy Tab Transitions + Smooth Fade + Parallax Background

document.addEventListener("DOMContentLoaded", () => {
    // 1. Smooth fade-in for whole site
    document.body.style.opacity = 0;
    setTimeout(() => {
        document.body.style.transition = "opacity 0.8s ease";
        document.body.style.opacity = 1;
    }, 100);

    // 2. Add animated underline effect to tabs
    const tabs = document.querySelectorAll("label.tab-link");
    tabs.forEach(tab => {
        tab.addEventListener("mouseenter", () => {
            tab.style.boxShadow = "0 0 15px crimson";
        });
        tab.addEventListener("mouseleave", () => {
            tab.style.boxShadow = "none";
        });
    });

    // 3. Parallax background movement for content wrapper
    const wrapper = document.querySelector(".content-wrapper");

    document.addEventListener("mousemove", e => {
        const x = (window.innerWidth - e.pageX * 2) / 90;
        const y = (window.innerHeight - e.pageY * 2) / 90;
        wrapper.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });

    // 4. Smooth scroll when switching tabs (even though content snaps)
    const radios = document.querySelectorAll("input[name='tab-control']");
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });

    // 5. Add floating particles in background
    createParticles(40);
});

// -----------------------
// PARTICLE SYSTEM
// -----------------------
function createParticles(amount) {
    for (let i = 0; i < amount; i++) {
        const p = document.createElement("div");
        p.className = "particle";

        const size = Math.random() * 4 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;

        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";

        p.style.animationDuration = Math.random() * 10 + 5 + "s";
        p.style.animationDelay = Math.random() * 5 + "s";

        document.body.appendChild(p);
    }
}

// -----------------------
// EXTRA FEATURES ADDED
// -----------------------

// BMW-Themed Particle Colors (blue / white)
document.querySelectorAll('.particle').forEach(p => {
    const colors = ['#007bff', '#ffffff'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
});

// Sound effect on tab switch
const switchSound = new Audio('switch.mp3'); // <-- Add your own sound file

const radioButtons = document.querySelectorAll("input[name='tab-control']");
radioButtons.forEach(r => {
    r.addEventListener('change', () => {
        switchSound.currentTime = 0;
        switchSound.play().catch(() => {});
    });
});

// Cursor trail effect
document.addEventListener('mousemove', e => {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.style.left = e.pageX + 'px';
    dot.style.top = e.pageY + 'px';
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 500);
});

// Intro fade + Zoom
window.addEventListener('load', () => {
    const wrapper = document.querySelector('.content-wrapper');
    wrapper.style.opacity = 0;
    wrapper.style.transform = 'scale(0.9)';

    setTimeout(() => {
        wrapper.style.transition = 'all 0.8s ease';
        wrapper.style.opacity = 1;
        wrapper.style.transform = 'scale(1)';
    }, 200);
});

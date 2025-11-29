// Optimized script.js
// - requestAnimationFrame-driven parallax
// - canvas ribbon trail (reusable, GPU friendly, no DOM spamming)
// - particles optimized
// - no heavy mousemove DOM operations
// - smooth fade, smooth scroll, sound preserved

document.addEventListener("DOMContentLoaded", () => {
    // Basic fade-in
    document.body.style.opacity = 0;
    setTimeout(() => {
        document.body.style.transition = "opacity 0.6s ease";
        document.body.style.opacity = 1;
    }, 80);

    const wrapper = document.querySelector(".content-wrapper");
    if (wrapper) wrapper.style.willChange = "transform";

    // Tab hover glow
    document.querySelectorAll("label.tab-link").forEach(tab => {
        tab.addEventListener("mouseenter", () => tab.style.boxShadow = "0 0 15px crimson");
        tab.addEventListener("mouseleave", () => tab.style.boxShadow = "none");
    });

    // Parallax via rAF
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let targetX = 0, targetY = 0;
    let parallaxX = 0, parallaxY = 0;
    const parallaxEase = 0.12;

    document.addEventListener("mousemove", e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        targetX = (window.innerWidth / 2 - mouseX) / 90;
        targetY = (window.innerHeight / 2 - mouseY) / 90;
    }, { passive: true });

    // Ribbon trail (Option A applied: fadeAlpha: 0.14)
    const ribbon = new RibbonTrail({
        length: 36,
        smoothing: 0.18,
        lineWidth: 32,
        fadeAlpha: 0.14,  // <<< OPTION A — smooth fade, no lingering fog
        hue: 205
    });
    ribbon.mount();

    // Optimized particles
    createParticles(12);

    // Tab smooth scroll
    document.querySelectorAll("input[name='tab-control']").forEach(r => {
        r.addEventListener("change", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            playSwitchSound();
        });
    });

    // Intro zoom
    window.addEventListener('load', () => {
        if (!wrapper) return;
        wrapper.style.opacity = 0;
        wrapper.style.transform = 'scale(0.985)';
        setTimeout(() => {
            wrapper.style.transition = 'transform 0.7s cubic-bezier(.2,.9,.3,1), opacity 0.6s ease';
            wrapper.style.opacity = 1;
            wrapper.style.transform = 'scale(1)';
        }, 160);
    });

    // Sound effect
    const switchSound = new Audio('switch.mp3');
    function playSwitchSound() {
        try {
            switchSound.currentTime = 0;
            switchSound.play().catch(()=>{});
        } catch(e){}
    }

    // RAF loop
    function rafLoop() {
        parallaxX += (targetX - parallaxX) * parallaxEase;
        parallaxY += (targetY - parallaxY) * parallaxEase;

        if (wrapper) {
            wrapper.style.transform = `translate3d(${parallaxX.toFixed(2)}px, ${parallaxY.toFixed(2)}px, 0)`;
        }

        ribbon.update();
        requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);
});

/* ---------------------------
   RibbonTrail - Canvas Ribbon
   --------------------------- */
function RibbonTrail(opts = {}) {
    const cfg = Object.assign({
        length: 36,
        smoothing: 0.18,
        lineWidth: 32,
        fadeAlpha: 0.14, // Option A (no fog accumulation)
        hue: 205
    }, opts);

    const canvas = document.createElement('canvas');
    canvas.id = 'cursorRibbon';
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 1500;
    canvas.style.mixBlendMode = 'screen';
    canvas.style.willChange = 'transform, opacity';

    let ctx = null;
    let w = 0, h = 0, dpr = 1;

    const points = [];
    for (let i = 0; i < cfg.length; i++) {
        points.push({ x: window.innerWidth/2, y: window.innerHeight/2 });
    }

    let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };

    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    function resize() {
        dpr = Math.max(1, window.devicePixelRatio || 1);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    window.addEventListener('resize', debounce(resize, 200));
    resize();

    this.mount = () => document.body.appendChild(canvas);
    this.unmount = () => canvas.remove();

    this.update = () => {
        if (!ctx) return;

        let prev = { x: mouse.x, y: mouse.y };
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            p.x += (prev.x - p.x) * (cfg.smoothing + i * 0.002);
            p.y += (prev.y - p.y) * (cfg.smoothing + i * 0.002);
            prev = p;
        }

        // Option A fade (smooth, no sticking fog)
        ctx.fillStyle = `rgba(10,10,10,${cfg.fadeAlpha})`;
        ctx.fillRect(0, 0, w, h);

        for (let side = -1; side <= 1; side += 2) {
            ctx.beginPath();
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i+1];
                const t = i / points.length;

                const dx = p1.x - p0.x;
                const dy = p1.y - p0.y;
                const len = Math.sqrt(dx*dx + dy*dy) || 1;
                const nx = -dy / len;
                const ny = dx / len;

                const width = cfg.lineWidth * (1 - t) * (0.6 + 0.4 * Math.sin(t * Math.PI));
                const px = p0.x + nx * width * side * 0.5;
                const py = p0.y + ny * width * side * 0.5;

                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }

            const g = ctx.createLinearGradient(0, 0, w, h);
            const hue = cfg.hue;
            g.addColorStop(0, `hsla(${hue - 40}, 90%, 50%, 0.18)`);
            g.addColorStop(0.5, `hsla(${hue}, 95%, 60%, 0.32)`);
            g.addColorStop(1, `hsla(${hue + 40}, 85%, 55%, 0.12)`);

            ctx.strokeStyle = g;
            ctx.lineWidth = 1;
            ctx.globalCompositeOperation = 'lighter';
            ctx.stroke();
        }

        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        const coreGrad = ctx.createLinearGradient(0, 0, w, h);
        coreGrad.addColorStop(0, 'rgba(255,255,255,0.12)');
        coreGrad.addColorStop(0.5, 'rgba(220,240,255,0.24)');
        coreGrad.addColorStop(1, 'rgba(180,210,255,0.08)');
        ctx.strokeStyle = coreGrad;
        ctx.lineWidth = 2;
        ctx.globalCompositeOperation = 'lighter';
        ctx.stroke();

        const head = points[0];
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.arc(head.x, head.y, 26, 0, Math.PI*2);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
    };

    function debounce(fn, t=100) {
        let id = null;
        return function(...a) {
            clearTimeout(id);
            id = setTimeout(() => fn.apply(this, a), t);
        };
    }
}

/* ---------------------------
   Optimized particle system
   --------------------------- */
function createParticles(amount = 12) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < amount; i++) {
        const p = document.createElement("div");
        p.className = "particle";

        const size = Math.random() * 6 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";

        p.style.animationDuration = (Math.random() * 12 + 6) + "s";
        p.style.animationDelay = (Math.random() * 4) + "s";

        p.style.background = Math.random() > 0.6 ? '#ffffff' : '#007bff';

        if (Math.random() > 0.92) p.classList.add('big');

        frag.appendChild(p);
    }
    document.body.appendChild(frag);
}

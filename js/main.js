/* main.js — GSAP ScrollTrigger, Loader, Cursor, Counters, Contact Canvas */
(function () {
    /* =======================
       1. Register GSAP Plugins
       ======================= */
    gsap.registerPlugin(ScrollTrigger);

    /* =======================
       2. Custom Cursor
       ======================= */
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0 });
    });

    function animateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        gsap.set(follower, { x: followerX, y: followerY });
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor scale on hover
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .icon-card, .social-link');
    hoverTargets.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 3, background: 'transparent', border: '1.5px solid #D4A853', duration: 0.3 });
            gsap.to(follower, { scale: 0, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, background: '#D4A853', border: 'none', duration: 0.3 });
            gsap.to(follower, { scale: 1, duration: 0.3 });
        });
    });

    /* =======================
       3. Loader
       ======================= */
    const loader = document.getElementById('loader');
    const loaderNum = document.getElementById('loader-num');
    let count = 0;
    const counter = setInterval(() => {
        count += Math.floor(Math.random() * 8) + 3;
        if (count >= 100) {
            count = 100;
            clearInterval(counter);
            loaderNum.textContent = count;
            gsap.to(loader, {
                opacity: 0, duration: 0.6, delay: 0.3,
                onComplete: () => {
                    loader.style.display = 'none';
                    playHeroEntrance();
                }
            });
        } else {
            loaderNum.textContent = count;
        }
    }, 40);

    /* =======================
       4. Hero Entrance
       ======================= */
    function playHeroEntrance() {
        const tl = gsap.timeline();
        tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
            .to('.hero-line', {
                opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power4.out'
            }, '-=0.3')
            .to('.hero-subtitle', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.5')
            .to('.hero-tagline', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
            .to('.hero-actions', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
            .to('.hero-stats', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
            .to('.scroll-indicator', { opacity: 1, duration: 0.6 }, '-=0.2');

        // Animate stat counters
        setTimeout(() => {
            document.querySelectorAll('.stat-num').forEach((el) => {
                const target = +el.dataset.target;
                gsap.to({ val: 0 }, {
                    val: target, duration: 1.5, ease: 'power2.out',
                    onUpdate: function () { el.textContent = Math.round(this.targets()[0].val); }
                });
            });
        }, 1400);
    }

    /* =======================
       5. Navbar Scroll
       ======================= */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    // Navbar entrance
    gsap.from('.navbar', { y: -80, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });

    /* =======================
       6. Mobile Menu
       ======================= */
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    let menuOpen = false;

    hamburger.addEventListener('click', () => {
        menuOpen = !menuOpen;
        mobileMenu.classList.toggle('active', menuOpen);
        hamburger.children[0].style.transform = menuOpen ? 'rotate(45deg) translate(5px,5px)' : '';
        hamburger.children[1].style.opacity = menuOpen ? '0' : '1';
        hamburger.children[2].style.transform = menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });

    document.querySelectorAll('.mobile-link').forEach((link) => {
        link.addEventListener('click', () => {
            menuOpen = false;
            mobileMenu.classList.remove('active');
            hamburger.children[0].style.transform = '';
            hamburger.children[1].style.opacity = '1';
            hamburger.children[2].style.transform = '';
        });
    });

    /* =======================
       7. Reveal on Scroll
       ======================= */
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealEls.forEach((el) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => el.classList.add('revealed'),
        });
    });

    /* =======================
       8. Skill Bars
       ======================= */
    const skillFills = document.querySelectorAll('.skill-fill');
    skillFills.forEach((fill) => {
        const width = fill.dataset.width;
        ScrollTrigger.create({
            trigger: fill,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(fill, { width: width + '%', duration: 1.2, ease: 'power3.out' });
            }
        });
    });

    /* =======================
       9. Timeline Line
       ======================= */
    const timelineLine = document.getElementById('timeline-line');
    if (timelineLine) {
        const timelineWrap = document.querySelector('.timeline-wrap');
        ScrollTrigger.create({
            trigger: '.timeline',
            start: 'top 80%',
            end: 'bottom 20%',
            onUpdate: (self) => {
                const wrapHeight = timelineWrap.offsetHeight;
                timelineLine.style.height = (self.progress * wrapHeight) + 'px';
            }
        });
    }

    /* =======================
       10. Section Bg Parallax
       ======================= */
    gsap.to('.about-bg-text', {
        y: -100,
        ease: 'none',
        scrollTrigger: {
            trigger: '.about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        }
    });

    /* =======================
       11. Magnetic Buttons
       ======================= */
    document.querySelectorAll('.magnetic').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.3;
            const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.3;
            gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' });
        });
    });

    /* =======================
       12. Project Card Tilt
       ======================= */
    document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const rx = ((e.clientY - cy) / rect.height) * 8;
            const ry = ((e.clientX - cx) / rect.width) * -8;
            // Only tilt if not flipped
            if (!card.classList.contains('flipped')) {
                gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.3, ease: 'power1.out', transformPerspective: 1200 });
            }
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
        });
    });

    /* =======================
       13. Contact Three.js Canvas
       ======================= */
    const contactCanvas = document.getElementById('contact-canvas');
    if (contactCanvas && typeof THREE !== 'undefined') {
        const cRenderer = new THREE.WebGLRenderer({ canvas: contactCanvas, antialias: true, alpha: true });
        cRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        cRenderer.setSize(contactCanvas.parentElement.offsetWidth, contactCanvas.parentElement.offsetHeight);
        cRenderer.setClearColor(0x000000, 0);

        const cScene = new THREE.Scene();
        const cCamera = new THREE.PerspectiveCamera(60, contactCanvas.parentElement.offsetWidth / contactCanvas.parentElement.offsetHeight, 0.1, 100);
        cCamera.position.z = 5;

        const cKnotGeo = new THREE.TorusKnotGeometry(1.5, 0.5, 120, 16);
        const cKnotMat = new THREE.MeshBasicMaterial({ color: 0xD4A853, wireframe: true, transparent: true, opacity: 0.2 });
        const cKnot = new THREE.Mesh(cKnotGeo, cKnotMat);
        cKnot.position.set(3, 0, 0);
        cScene.add(cKnot);

        const clock2 = new THREE.Clock();
        function animateContact() {
            requestAnimationFrame(animateContact);
            const t = clock2.getElapsedTime();
            cKnot.rotation.x = t * 0.25;
            cKnot.rotation.y = t * 0.4;
            cRenderer.render(cScene, cCamera);
        }
        animateContact();

        window.addEventListener('resize', () => {
            const w = contactCanvas.parentElement.offsetWidth;
            const h = contactCanvas.parentElement.offsetHeight;
            cRenderer.setSize(w, h);
            cCamera.aspect = w / h;
            cCamera.updateProjectionMatrix();
        });
    }

    /* =======================
       14. Form Interaction
       ======================= */
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type=submit]');
            const orig = btn.textContent;
            btn.textContent = '✓ Message Sent!';
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.textContent = orig;
                btn.style.background = '';
                form.reset();
            }, 3000);
        });

        // Animated label float
        form.querySelectorAll('input, textarea').forEach((input) => {
            input.addEventListener('focus', () => {
                gsap.to(input, { borderColor: '#D4A853', duration: 0.3 });
            });
            input.addEventListener('blur', () => {
                gsap.to(input, { borderColor: 'rgba(255,255,255,0.08)', duration: 0.3 });
            });
        });
    }

    /* =======================
       15. Smooth scroll for nav links
       ======================= */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
            }
        });
    });

    /* =======================
       16. Icon cards stagger
       ======================= */
    ScrollTrigger.create({
        trigger: '.icon-grid',
        start: 'top 80%',
        onEnter: () => {
            gsap.from('.icon-card', {
                opacity: 0, y: 30, scale: 0.85, duration: 0.5,
                stagger: 0.07, ease: 'power3.out'
            });
        }
    });

    /* =======================
       17. Section titles stagger
       ======================= */
    document.querySelectorAll('.section-title').forEach((el) => {
        gsap.from(el, {
            opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    /* =======================
       18. Footer animation
       ======================= */
    gsap.from('.footer-inner > *', {
        opacity: 0, y: 20, stagger: 0.12, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.footer', start: 'top 90%' }
    });

})();

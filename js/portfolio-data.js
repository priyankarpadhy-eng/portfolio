/* ================================================
   portfolio-data.js
   Reads localStorage and populates the portfolio
   with user's data. Falls back to demo data if none.
   ================================================ */
(function populatePortfolio() {
    const raw = localStorage.getItem('portfolio_data');
    if (!raw) return; // No data saved — use default HTML content

    let d;
    try { d = JSON.parse(raw); } catch (_) { return; }

    /* ── Helper ── */
    const set = (sel, val) => {
        const els = document.querySelectorAll(sel);
        els.forEach(el => { if (val !== undefined && val !== null) el.textContent = val; });
    };
    const setHTML = (sel, html) => {
        const el = document.querySelector(sel);
        if (el && html) el.innerHTML = html;
    };
    const setAttr = (sel, attr, val) => {
        const el = document.querySelector(sel);
        if (el && val) el.setAttribute(attr, val);
    };

    /* ── Navbar + footer logo ── */
    const initials = d.name ? d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'ME';
    document.querySelectorAll('.nav-logo, .footer-logo').forEach(el => {
        el.innerHTML = `<span class="logo-bracket">[</span>${initials}<span class="logo-bracket">]</span>`;
    });

    /* ── Hero ── */
    if (d.name) {
        const parts = d.name.trim().split(' ');
        const first = parts[0].toUpperCase();
        const rest = parts.slice(1).join(' ').toUpperCase() || '';
        const titleEl = document.querySelector('.hero-title');
        if (titleEl) {
            titleEl.innerHTML = `
        <span class="hero-line" data-text="${first}">${first}</span>
        <span class="hero-line accent" data-text="${rest}">${rest}</span>`;
        }
    }
    if (d.headline) set('.hero-subtitle', d.headline);
    if (d.badge) {
        const badgeEl = document.querySelector('.hero-badge');
        if (badgeEl) {
            badgeEl.innerHTML = `<span class="badge-dot"></span>${d.badge}`;
        }
    }
    if (d.stat_projects) document.querySelectorAll('[data-target]')[0]?.setAttribute('data-target', d.stat_projects);
    if (d.stat_years) document.querySelectorAll('[data-target]')[1]?.setAttribute('data-target', d.stat_years);
    if (d.stat_internships) document.querySelectorAll('[data-target]')[2]?.setAttribute('data-target', d.stat_internships);

    /* ── About ── */
    if (d.name || d.university) {
        const card = document.querySelector('.about-card');
        if (card && (d.university || d.degree)) {
            card.innerHTML = `<div class="about-card-icon">🏗️</div><div><strong>${d.university || ''}</strong><br/><small>${d.degree || 'Civil Engineering'}</small></div>`;
        }
    }
    if (d.bio) {
        const introEl = document.querySelector('.about-intro');
        if (introEl) introEl.innerHTML = d.bio;
    }
    /* Tags */
    if (d.tags && d.tags.length) {
        const tagsEl = document.querySelector('.about-tags');
        if (tagsEl) {
            tagsEl.innerHTML = d.tags.map(t => `<span class="tag">${t}</span>`).join('');
        }
    }

    /* ── Skills bars ── */
    if (d.skills && d.skills.length) {
        const barsWrap = document.querySelector('.skills-bars');
        if (barsWrap) {
            const cat = barsWrap.querySelector('.skills-cat');
            // Remove existing items (keep heading)
            barsWrap.querySelectorAll('.skill-item').forEach(el => el.remove());
            d.skills.forEach(s => {
                const item = document.createElement('div');
                item.className = 'skill-item';
                item.innerHTML = `
          <div class="skill-meta"><span>${s.name}</span><span>${s.pct}%</span></div>
          <div class="skill-bar"><div class="skill-fill" data-width="${s.pct}"></div></div>`;
                barsWrap.appendChild(item);
            });
        }
    }

    /* ── Tool icons ── */
    if (d.tools && d.tools.length) {
        const grid = document.querySelector('.icon-grid');
        if (grid) {
            grid.innerHTML = d.tools.map(t =>
                `<div class="icon-card glass"><span class="icon-emoji">${t.emoji}</span><span>${t.label}</span></div>`
            ).join('');
        }
    }

    /* ── Projects ── */
    if (d.projects && d.projects.length) {
        const grid = document.querySelector('.projects-grid');
        if (grid) {
            // SVG templates for card fronts
            const svgs = [
                `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="150" x2="400" y2="150" stroke="#D4A853" stroke-width="3"/><line x1="200" y1="20" x2="50" y2="150" stroke="#D4A853" stroke-width="2" stroke-dasharray="4"/><line x1="200" y1="20" x2="350" y2="150" stroke="#D4A853" stroke-width="2" stroke-dasharray="4"/><rect x="190" y="10" width="20" height="140" fill="#D4A853" opacity="0.8"/></svg>`,
                `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="360" height="160" fill="none" stroke="#4a90a4" stroke-width="1.5" opacity="0.5"/><rect x="40" y="40" width="140" height="100" fill="none" stroke="#4a90a4" stroke-width="1" opacity="0.6"/><rect x="220" y="40" width="140" height="100" fill="none" stroke="#D4A853" stroke-width="1" opacity="0.6"/></svg>`,
                `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect x="140" y="60" width="120" height="120" fill="#1a3d1a" stroke="#4CAF50" stroke-width="1.5" opacity="0.8"/><ellipse cx="180" cy="80" rx="30" ry="35" fill="#4CAF50" opacity="0.5"/><ellipse cx="220" cy="90" rx="25" ry="28" fill="#4CAF50" opacity="0.6"/></svg>`,
                `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="100" width="400" height="100" fill="#3d2b1a" opacity="0.6"/><line x1="0" y1="100" x2="400" y2="100" stroke="#D4A853" stroke-width="1.5" stroke-dasharray="5"/><rect x="180" y="40" width="8" height="120" fill="#888" opacity="0.8"/><circle cx="184" cy="100" r="6" fill="#D4A853"/></svg>`
            ];
            const bgs = [
                'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
                'linear-gradient(135deg,#0a0a1a,#1a1a3e,#0d2137)',
                'linear-gradient(135deg,#0a1a0a,#0d2b14,#123d1a)',
                'linear-gradient(135deg,#1a0a0a,#3d1a0d,#5c2d10)'
            ];
            grid.innerHTML = d.projects.map((p, i) => {
                const techArr = (p.tech || '').split(',').map(t => t.trim()).filter(Boolean);
                const techTags = techArr.map(t => `<span>${t}</span>`).join('');
                const link = p.link ? `<a href="${p.link}" target="_blank" class="btn-sm">View Project</a>` : `<a href="#" class="btn-sm">View Report</a>`;
                return `
          <div class="project-card reveal" id="proj-${i + 1}">
            <div class="project-card-inner">
              <div class="project-front">
                <div class="project-img" style="background:${bgs[i % bgs.length]};">
                  <div class="project-img-overlay"><span class="project-cat">${p.category || 'Project'}</span></div>
                  <div class="bridge-svg">${svgs[i % svgs.length]}</div>
                </div>
                <div class="project-info">
                  <h3 class="project-title">${p.title || 'Untitled Project'}</h3>
                  <p class="project-brief">${p.brief || ''}</p>
                  <div class="project-hover-hint">Hover to flip →</div>
                </div>
              </div>
              <div class="project-back glass">
                <span class="project-cat-back">${p.category || 'Project'}</span>
                <h3>${p.title || ''}</h3>
                <p>${p.description || p.brief || ''}</p>
                <div class="project-tech">${techTags}</div>
                <div class="project-links">${link}<a href="#" class="btn-sm-ghost">Gallery</a></div>
              </div>
            </div>
          </div>`;
            }).join('');
        }
    }

    /* ── Contact ── */
    if (d.location) set('.contact-item:nth-child(1) span:last-child', d.location);
    if (d.email) set('.contact-item:nth-child(2) span:last-child', d.email);
    if (d.phone) set('.contact-item:nth-child(3) span:last-child', d.phone);
    if (d.linkedin) setAttr('.social-link[aria-label="LinkedIn"]', 'href', d.linkedin);
    if (d.github) setAttr('.social-link[aria-label="GitHub"]', 'href', d.github);

    /* ── Footer ── */
    if (d.name) {
        const ftText = document.querySelector('.footer-text');
        if (ftText) ftText.textContent = `© ${new Date().getFullYear()} ${d.name}. Designed with ♥ and a lot of concrete.`;
        const ftTag = document.querySelector('.footer-tag');
        if (ftTag && d.degree) ftTag.textContent = `${d.degree} · ${d.university || 'Engineering'} · Builder`;
    }

    /* ── Page title ── */
    if (d.name) document.title = `${d.name} — Civil Engineering Portfolio`;

    console.log('✅ Portfolio populated from localStorage data');
})();

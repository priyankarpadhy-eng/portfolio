/* =====================================================
   setup.js — LinkedIn oEmbed fetch + form + localStorage
   ===================================================== */
'use strict';

/* ─── State ─────────────────────────────────────── */
let currentStep = 1;
const TOTAL_STEPS = 4;
const data = {
    li_url: '',
    name: '', headline: '', bio: '',
    university: '', degree: '', grad_year: '',
    location: '', email: '', phone: '',
    linkedin: '', github: '',
    badge: 'Available for Internships & Collaboration',
    avatar_url: '',
    stat_projects: 12, stat_years: 3, stat_internships: 4,
    tags: ['AutoCAD', 'STAAD.Pro', 'Python', 'BIM', 'Revit'],
    skills: [
        { name: 'Structural Analysis', pct: 92 },
        { name: 'AutoCAD / Civil 3D', pct: 88 },
        { name: 'STAAD.Pro / SAP2000', pct: 80 },
        { name: 'Material Science', pct: 85 },
        { name: 'Geotechnical Engineering', pct: 75 }
    ],
    tools: [
        { emoji: '📐', label: 'AutoCAD' }, { emoji: '🏗️', label: 'STAAD.Pro' },
        { emoji: '🧱', label: 'Stadd.Pro' }, { emoji: '🗺️', label: 'ArcGIS' },
        { emoji: '🐍', label: 'Python' }, { emoji: '📊', label: 'MATLAB' },
        { emoji: '☁️', label: 'MS Project' }, { emoji: '🌿', label: 'LEED' }
    ],
    projects: [
        {
            title: 'Cable-Stayed Bridge Design',
            category: 'Structural Design',
            brief: '200m span bridge with composite deck and twin pylons',
            description: 'Designed a 200m cable-stayed bridge for a semi-urban crossing, performing load analysis, pylon design, and cable optimization using STAAD.Pro and SAP2000.',
            tech: 'SAP2000, AutoCAD, STAAD.Pro',
            link: ''
        },
        {
            title: 'Smart Campus BIM Model',
            category: 'BIM & Planning',
            brief: 'Full BIM model for a sustainable university campus',
            description: 'Comprehensive BIM model for a 50-acre smart campus, including structural, MEP, and landscape layers. Integrated energy simulation for LEED certification.',
            tech: 'Revit, Navisworks, AutoCAD',
            link: ''
        }
    ]
};

/* ─── Background Three.js ───────────────────────── */
(function initBg() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    const count = 3000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 20;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xD4A853, size: 0.025, transparent: true, opacity: 0.6 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        pts.rotation.y = clock.getElapsedTime() * 0.04;
        pts.rotation.x = clock.getElapsedTime() * 0.02;
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
})();

/* ─── Step navigation ───────────────────────────── */
function goStep(n) {
    const current = document.getElementById('step-' + currentStep);
    const next = document.getElementById('step-' + n);
    if (!next) return;
    current.classList.add('exit-left');
    setTimeout(() => {
        current.classList.remove('active', 'exit-left');
        next.classList.add('active');
        currentStep = n;
        updateProgress();
    }, 350);
}

function updateProgress() {
    document.getElementById('progress-bar').style.width = ((currentStep / TOTAL_STEPS) * 100) + '%';
    document.querySelectorAll('.step-dot').forEach((dot, i) => {
        dot.classList.remove('active', 'done');
        const s = i + 1;
        if (s < currentStep) dot.classList.add('done');
        else if (s === currentStep) dot.classList.add('active');
    });
}

/* ─── RapidAPI panel toggle ─────────────────────── */
function toggleRapidAPI() {
    const body = document.getElementById('rapidapi-body');
    const toggle = document.getElementById('rapidapi-toggle');
    const isOpen = !body.classList.contains('hidden');
    body.classList.toggle('hidden', isOpen);
    toggle.classList.toggle('open', !isOpen);
    // Persist key from localStorage
    const savedKey = localStorage.getItem('rapidapi_key');
    if (savedKey && !document.getElementById('rapidapi-key').value) {
        document.getElementById('rapidapi-key').value = savedKey;
        document.getElementById('key-status').textContent = '🔑';
    }
}

/* ─── RapidAPI: Full LinkedIn profile fetch ─────── */
async function fetchFromRapidAPI(profileUrl, apiKey) {
    // Fresh LinkedIn Profile Data API on RapidAPI
    const endpoint = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile?linkedin_url=${encodeURIComponent(profileUrl)}&include_skills=true`;
    const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
            'x-rapidapi-key': apiKey
        },
        signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`RapidAPI returned ${res.status}`);
    const json = await res.json();
    // API wraps response in `data`
    return json.data || json;
}

function applyRapidAPIData(profile) {
    // Map RapidAPI fields → our data object
    if (profile.full_name) data.name = profile.full_name;
    if (profile.headline) data.headline = profile.headline;
    if (profile.about) data.bio = profile.about;
    if (profile.location?.short) data.location = profile.location.short;
    else if (profile.city) data.location = [profile.city, profile.country].filter(Boolean).join(', ');
    if (profile.profile_image_url) data.avatar_url = profile.profile_image_url;

    // Skills → tags + skill bars
    if (profile.skills && profile.skills.length) {
        data.tags = profile.skills.slice(0, 8).map(s => typeof s === 'string' ? s : s.name);
        data.skills = profile.skills.slice(0, 8).map((s, i) => ({
            name: typeof s === 'string' ? s : s.name,
            pct: Math.max(70, 95 - i * 3) // descending confidence: 95, 92, 89…
        }));
    }

    // Education → university/degree from most recent entry
    if (profile.educations && profile.educations.length) {
        const ed = profile.educations[0];
        if (ed.school && !data.university) data.university = ed.school;
        if (ed.degree && !data.degree) data.degree = ed.degree + (ed.field_of_study ? ` in ${ed.field_of_study}` : '');
        if (ed.date_range) data.grad_year = (ed.date_range.end || '').slice(-4) || data.grad_year;
    }

    // Experience → timeline entries (stored for future use)
    if (profile.experiences && profile.experiences.length) {
        data.experiences = profile.experiences.slice(0, 4).map(e => ({
            company: e.company_name || '',
            title: e.title || '',
            duration: e.date_range || '',
            location: e.location || ''
        }));
    }
}

/* ─── LinkedIn oEmbed fetch ─────────────────────── */
async function fetchLinkedIn() {
    const urlInput = document.getElementById('li-url');
    let url = urlInput.value.trim();

    if (!url) {
        showStatus('warning', '⚠️ Please enter your LinkedIn profile URL.');
        return;
    }

    /* ── Step 1: Normalize URL — always ensure https:// prefix ── */
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        urlInput.value = url; // show corrected URL to user
    }

    /* ── Step 2: Validate format ── */
    if (!url.includes('linkedin.com/in/')) {
        showStatus('warning', '⚠️ Please enter a valid LinkedIn profile URL (linkedin.com/in/your-username)');
        return;
    }

    const btn = document.getElementById('li-fetch-btn');
    const btnText = document.getElementById('li-btn-text');
    btn.disabled = true;
    btnText.textContent = 'Fetching…';
    data.li_url = url;
    data.linkedin = url;

    /* ── Try RapidAPI first if key is provided ── */
    const apiKeyInput = document.getElementById('rapidapi-key');
    const apiKey = (apiKeyInput && apiKeyInput.value.trim()) || localStorage.getItem('rapidapi_key') || '';
    if (apiKey) {
        localStorage.setItem('rapidapi_key', apiKey);
        document.getElementById('key-status').textContent = '⏳';
        showStatus('info', '⚡ Fetching full profile via RapidAPI…');
        try {
            const profile = await fetchFromRapidAPI(url, apiKey);
            applyRapidAPIData(profile);
            document.getElementById('key-status').textContent = '✅';
            applyLinkedInPreview(data.name, data.headline, data.avatar_url);
            showStatus('success',
                `✅ Full profile imported! Name: <strong>${data.name}</strong>` +
                (data.bio ? ` · Bio: ${data.bio.slice(0, 60)}…` : '') +
                (data.skills.length ? ` · ${data.skills.length} skills auto-filled` : '')
            );
            document.getElementById('li-preview').classList.remove('hidden');
            setFieldIfEmpty('f-name', data.name);
            setFieldIfEmpty('f-headline', data.headline);
            setFieldIfEmpty('f-linkedin', data.linkedin);
            btn.disabled = false;
            btnText.textContent = 'Import →';
            return; // skip oEmbed fallback
        } catch (err) {
            console.warn('RapidAPI fetch failed:', err.message);
            document.getElementById('key-status').textContent = '❌';
            showStatus('warning', `⚠️ RapidAPI error: ${err.message}. Falling back to oEmbed…`);
        }
    } else {
        showStatus('info', '🔍 Contacting LinkedIn oEmbed API…');
    }

    /* ── Step 3: Build oEmbed target URL ── */
    // LinkedIn oEmbed endpoint: the `url` param must be the full https:// profile URL
    const profileUrl = url.split('?')[0].replace(/\/$/, ''); // strip query/trailing slash
    const oEmbedTarget = `https://www.linkedin.com/oembed?url=${encodeURIComponent(profileUrl)}&format=json`;

    /* ── Step 4: Try CORS proxies — each has its own URL format ── */
    const proxies = [
        // corsproxy.io: append target URL directly after ?
        `https://corsproxy.io/?${encodeURIComponent(oEmbedTarget)}`,
        // allorigins: uses ?url= param + raw endpoint
        `https://api.allorigins.win/raw?url=${encodeURIComponent(oEmbedTarget)}`,
        // corsproxy.io GET format (alternative encoding)
        `https://corsproxy.io/?url=${encodeURIComponent(oEmbedTarget)}`,
        // thingproxy: append URL after /fetch/
        `https://thingproxy.freeboard.io/fetch/${oEmbedTarget}`,
    ];

    let fetched = false;
    for (const proxy of proxies) {
        try {
            showStatus('info', `🔍 Trying proxy ${proxies.indexOf(proxy) + 1} of ${proxies.length}…`);
            const res = await fetch(proxy, {
                signal: AbortSignal.timeout(7000),
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) {
                console.warn(`Proxy ${proxies.indexOf(proxy) + 1} returned ${res.status}`);
                continue;
            }
            const text = await res.text();
            let json;
            try { json = JSON.parse(text); } catch (_) { continue; }

            if (json && json.title) {
                // LinkedIn oEmbed title format: "Name | Headline - LinkedIn Premium"
                // or "Name - Headline | LinkedIn"
                let name = '', headline = '';
                const byPipe = json.title.split(' | ');
                const byDash = json.title.split(' - ');
                if (byPipe.length >= 2) {
                    name = byPipe[0].trim();
                    headline = byPipe[1].replace(/\s*-?\s*LinkedIn.*$/i, '').trim();
                } else if (byDash.length >= 2) {
                    name = byDash[0].trim();
                    headline = byDash[1].replace(/\s*LinkedIn.*$/i, '').trim();
                } else {
                    name = json.title.replace(/\s*[\|-].*LinkedIn.*$/i, '').trim();
                }
                data.name = name;
                data.headline = headline || 'Civil Engineering Undergraduate';
                if (json.thumbnail_url) data.avatar_url = json.thumbnail_url;
                applyLinkedInPreview(data.name, data.headline, data.avatar_url);
                showStatus('success', `✅ Profile imported from LinkedIn! Name: <strong>${data.name}</strong>`);
                fetched = true;
                break;
            }
        } catch (err) {
            console.warn('Proxy failed:', err.message || err);
        }
    }

    if (!fetched) {
        /* ── Graceful fallback: extract name from URL slug ── */
        const match = url.match(/linkedin\.com\/in\/([^/?#]+)/);
        const slug = match ? match[1] : '';
        // Convert "priyankar-padhy-06aa3137a" → "Priyankar Padhy" (strip trailing hash-like segments)
        const cleanSlug = slug.replace(/-[a-f0-9]{6,}$/i, ''); // remove LinkedIn ID suffix
        const username = cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        data.name = username;
        data.headline = 'Civil Engineering Undergraduate';
        applyLinkedInPreview(data.name || '—', data.headline, '');

        showStatus('warning',
            '⚠️ LinkedIn blocked all proxy attempts (normal — LinkedIn has strict CORS rules).' +
            (username ? ` <br/>Username extracted from URL: <strong>${username}</strong>.` : '') +
            ' <br/>Please review and complete your details in Step 2.'
        );
    }

    btn.disabled = false;
    btnText.textContent = 'Import →';
    document.getElementById('li-preview').classList.remove('hidden');

    // Pre-fill step 2 fields with whatever we got
    setFieldIfEmpty('f-name', data.name);
    setFieldIfEmpty('f-headline', data.headline);
    setFieldIfEmpty('f-linkedin', data.linkedin);
}


function applyLinkedInPreview(name, headline, avatarUrl) {
    document.getElementById('li-preview-name').textContent = name || '—';
    document.getElementById('li-preview-headline').textContent = headline || '—';
    const img = document.getElementById('li-avatar-img');
    const fallback = document.getElementById('li-avatar-fallback');
    if (avatarUrl) {
        img.src = avatarUrl;
        img.style.display = 'block';
        fallback.style.display = 'none';
    } else {
        img.style.display = 'none';
        fallback.style.display = 'flex';
    }
}

function showStatus(type, msg) {
    const el = document.getElementById('li-status');
    el.className = 'li-status ' + type;
    el.innerHTML = msg;
    el.classList.remove('hidden');
}

function setFieldIfEmpty(id, value) {
    const el = document.getElementById(id);
    if (el && value && !el.value) el.value = value;
}

function skipLinkedIn() {
    document.getElementById('li-preview').classList.add('hidden');
    document.getElementById('li-status').classList.add('hidden');
    goStep(2);
}

/* ─── Step 2: Save personal info ────────────────── */
function saveStep2() {
    data.name = v('f-name') || data.name;
    data.university = v('f-university') || data.university;
    data.degree = v('f-degree') || data.degree;
    data.grad_year = v('f-grad-year') || data.grad_year;
    data.headline = v('f-headline') || data.headline;
    data.bio = v('f-bio') || data.bio;
    data.location = v('f-location') || data.location;
    data.email = v('f-email') || data.email;
    data.phone = v('f-phone') || data.phone;
    data.linkedin = v('f-linkedin') || data.linkedin;
    data.github = v('f-github') || data.github;
    data.badge = v('f-badge') || data.badge;
    data.stat_projects = +v('f-stat-projects') || data.stat_projects;
    data.stat_years = +v('f-stat-years') || data.stat_years;
    data.stat_internships = +v('f-stat-internships') || data.stat_internships;
}

function v(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

/* ─── Step 3: Skills & Tools DOM ────────────────── */
function renderSkillsList() {
    const list = document.getElementById('skills-list');
    list.innerHTML = '';
    data.skills.forEach((s, i) => {
        const row = document.createElement('div');
        row.className = 'skill-edit-row';
        row.innerHTML = `
      <input type="text" value="${s.name}" placeholder="Skill name" oninput="data.skills[${i}].name=this.value"/>
      <input type="range" min="0" max="100" value="${s.pct}" oninput="data.skills[${i}].pct=+this.value;this.nextElementSibling.textContent=this.value+'%'"/>
      <span class="pct-label">${s.pct}%</span>
      <button class="btn-remove" onclick="removeSkill(${i})">✕</button>`;
        list.appendChild(row);
    });
}

function addSkill() {
    if (data.skills.length >= 8) return;
    data.skills.push({ name: '', pct: 75 });
    renderSkillsList();
}

function removeSkill(i) {
    data.skills.splice(i, 1);
    renderSkillsList();
}

function renderToolsList() {
    const list = document.getElementById('tools-list');
    list.innerHTML = '';
    data.tools.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'tool-edit-row';
        row.innerHTML = `
      <input type="text" value="${t.emoji}" placeholder="🔧" oninput="data.tools[${i}].emoji=this.value"/>
      <input type="text" value="${t.label}" placeholder="Tool name" oninput="data.tools[${i}].label=this.value"/>
      <button class="btn-remove" onclick="removeTool(${i})">✕</button>`;
        list.appendChild(row);
    });
}

function addTool() {
    if (data.tools.length >= 8) return;
    data.tools.push({ emoji: '🔧', label: '' });
    renderToolsList();
}

function removeTool(i) {
    data.tools.splice(i, 1);
    renderToolsList();
}

function saveStep3() {
    const tagsInput = document.getElementById('f-tags');
    if (tagsInput && tagsInput.value.trim()) {
        data.tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
    }
}

/* ─── Step 4: Projects DOM ──────────────────────── */
function renderProjects() {
    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    data.projects.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'project-edit-card';
        card.innerHTML = `
      <div class="card-header">
        <span class="card-num">PROJECT ${String(i + 1).padStart(2, '0')}</span>
        <button class="btn-remove" onclick="removeProject(${i})">✕ Remove</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Project Title</label>
          <input type="text" value="${p.title}" placeholder="e.g. Cable-Stayed Bridge Design" oninput="data.projects[${i}].title=this.value"/>
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" value="${p.category}" placeholder="e.g. Structural Design" oninput="data.projects[${i}].category=this.value"/>
        </div>
        <div class="form-group full">
          <label>Short Description (Card front)</label>
          <input type="text" value="${p.brief}" placeholder="One line summary..." oninput="data.projects[${i}].brief=this.value"/>
        </div>
        <div class="form-group full">
          <label>Detailed Description (Card back)</label>
          <textarea rows="3" placeholder="Full project description..." oninput="data.projects[${i}].description=this.value">${p.description}</textarea>
        </div>
        <div class="form-group">
          <label>Tech Stack (comma separated)</label>
          <input type="text" value="${p.tech}" placeholder="SAP2000, AutoCAD, Python" oninput="data.projects[${i}].tech=this.value"/>
        </div>
        <div class="form-group">
          <label>Project Link (optional)</label>
          <input type="url" value="${p.link}" placeholder="https://..." oninput="data.projects[${i}].link=this.value"/>
        </div>
      </div>`;
        list.appendChild(card);
    });
    document.getElementById('add-proj-btn').style.display = data.projects.length >= 4 ? 'none' : '';
}

function addProject() {
    if (data.projects.length >= 4) return;
    data.projects.push({ title: '', category: '', brief: '', description: '', tech: '', link: '' });
    renderProjects();
}

function removeProject(i) {
    data.projects.splice(i, 1);
    renderProjects();
}

/* ─── Generate portfolio ────────────────────────── */
function generatePortfolio() {
    saveStep2();
    saveStep3();
    localStorage.setItem('portfolio_data', JSON.stringify(data));
    // Flash success then redirect
    const btn = document.querySelector('.btn-generate');
    btn.textContent = '✓ Generating…';
    btn.style.background = 'linear-gradient(135deg,#4CAF50,#45a049)';
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
}

/* ─── Pre-fill step 2 from data ─────────────────── */
function prefillStep2() {
    const map = {
        'f-name': 'name', 'f-university': 'university', 'f-degree': 'degree',
        'f-grad-year': 'grad_year', 'f-headline': 'headline', 'f-bio': 'bio',
        'f-location': 'location', 'f-email': 'email', 'f-phone': 'phone',
        'f-linkedin': 'linkedin', 'f-github': 'github', 'f-badge': 'badge',
        'f-stat-projects': 'stat_projects', 'f-stat-years': 'stat_years',
        'f-stat-internships': 'stat_internships'
    };
    Object.entries(map).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el && data[key]) el.value = data[key];
    });
    const tagsEl = document.getElementById('f-tags');
    if (tagsEl && data.tags) tagsEl.value = data.tags.join(', ');
}

/* ─── If returning user: load existing data ─────── */
(function loadExisting() {
    const saved = localStorage.getItem('portfolio_data');
    if (saved) {
        try {
            Object.assign(data, JSON.parse(saved));
        } catch (_) { }
    }
    prefillStep2();
    renderSkillsList();
    renderToolsList();
    renderProjects();
})();

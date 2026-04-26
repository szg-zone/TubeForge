// TubeForge - Frontend Application Logic v3.0

// Base URL for API - defaults to same origin, override for external backend
const API_BASE = '';

// ============================================
// GLOBAL STATE
// ============================================
let currentIdeas = [];
let currentTitles = [];
let sharedIdea = '';
let sharedNiche = '';
let sharedAudience = '';
let sharedTitle = '';
let userEmail = localStorage.getItem('tubeforge_email') || '';

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(tabName) {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('on'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('on');
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(`tab-${tabName}`).style.display = 'block';
  
  if (typeof clearOutput === 'function') {
    clearOutput();
  }
}

function initTabs() {
  document.querySelectorAll('.atab').forEach(tab => {
    tab.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initTabs();
  initScrollAnimations();
  initNavHighlight();
  
  const userEmailEl = document.getElementById('user-email');
  if (userEmail && userEmailEl) {
    userEmailEl.value = userEmail;
    if (typeof loadMembershipStatus === 'function') {
      loadMembershipStatus();
    }
  }
});

// ============================================
// WAITLIST FORM
// ============================================
function wlSubmit() {
  const input = document.getElementById('wl-input');
  const btn = document.getElementById('wl-btn');
  const label = document.getElementById('wl-btn-label');
  const spinner = document.getElementById('wl-spinner');
  
  if (!input.value || !input.value.includes('@')) {
    input.focus();
    return;
  }

  label.style.display = 'none';
  spinner.style.display = 'block';
  btn.disabled = input.disabled = true;

  setTimeout(() => {
    document.getElementById('wl-form').classList.add('hide');
    const suc = document.getElementById('wl-success');
    suc.classList.add('show');
    fireConfetti();
    input.value = '';
    label.style.display = 'block';
    spinner.style.display = 'none';
    btn.disabled = input.disabled = false;
  }, 1500);
}

document.getElementById('wl-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') wlSubmit();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showLoading() {
  document.getElementById('output-empty').innerHTML = `
    <svg class="i" width="48" height="48" style="animation:spin-cw .8s linear infinite"><use href="#ic-sparkles"/></svg>
    <p>Generating...</p>
  `;
  document.getElementById('output-empty').style.display = 'flex';
  document.getElementById('output-content').style.display = 'none';
}

function clearOutput() {
  document.getElementById('output-empty').style.display = 'flex';
  document.getElementById('output-content').style.display = 'none';
  document.getElementById('output-empty').innerHTML = `
    <svg class="i" width="48" height="48"><use href="#ic-sparkles"/></svg>
    <p>Your AI-generated content will appear here</p>
  `;
}

function escapeHtml(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

function toggleCustomStyle(select) {
  const customField = document.getElementById('custom-style-field');
  if (select.value === 'Custom') {
    customField.style.display = 'block';
    document.getElementById('script-custom').focus();
  } else {
    customField.style.display = 'none';
  }
}

function toggleThumbSource(type) {
  const titleSource = document.getElementById('thumb-source-title');
  const ideaSource = document.getElementById('thumb-source-idea');
  
  if (type === 'title') {
    titleSource.style.display = 'block';
    ideaSource.style.display = 'none';
  } else {
    titleSource.style.display = 'none';
    ideaSource.style.display = 'block';
  }
}

// ============================================
// API CALLS
// ============================================
async function generateIdeas() {
  const niche = document.getElementById('ideas-niche').value.trim();
  const audience = document.getElementById('ideas-audience').value.trim();
  const idea = document.getElementById('ideas-idea').value.trim();
  
  if (!niche) {
    document.getElementById('ideas-niche').focus();
    return;
  }

  showLoading();
  setButtonLoading('generateIdeas', true);

  try {
    const response = await fetch(API_BASE + '/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche, audience, idea, email: userEmail || 'free@default' })
    });

    const data = await response.json();
    
    if (data.error) {
      displayIdeas('Error: ' + data.error);
    } else {
      const content = data.result || data.choices?.[0]?.message?.content || data.content || 'No ideas generated';
      sharedNiche = niche;
      sharedAudience = audience;
      displayIdeas(content);
    }
  } catch (error) {
    displayIdeas('Error connecting to AI service. Please try again.');
  }

  setButtonLoading('generateIdeas', false);
}

async function generateTitles() {
  const idea = document.getElementById('title-idea').value.trim();
  const niche = document.getElementById('title-niche').value.trim();
  const audience = document.getElementById('title-audience').value.trim();
  const tone = document.getElementById('title-tone').value;
  const hookStyle = document.getElementById('title-hook').value;
  const keywords = document.getElementById('title-keywords').value.trim();
  const targetLength = document.getElementById('title-length').value;
  
  if (!idea) {
    document.getElementById('title-idea').focus();
    return;
  }

  showLoading();
  setButtonLoading('generateTitles', true);

  try {
    const response = await fetch(API_BASE + '/api/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, niche, audience, tone, hookStyle, keywords, targetLength, email: userEmail || 'free@default' })
    });

    const data = await response.json();
    
    if (data.error) {
      displayTitles('Error: ' + data.error);
    } else {
      const content = data.result || data.choices?.[0]?.message?.content || data.content || 'No titles generated';
      sharedIdea = idea;
      sharedNiche = niche || sharedNiche;
      sharedAudience = audience || sharedAudience;
      displayTitles(content);
    }
  } catch (error) {
    displayTitles('Error connecting to AI service. Please try again.');
  }

  setButtonLoading('generateTitles', false);
}

async function generateScript() {
  const title = document.getElementById('script-title').value.trim();
  const idea = document.getElementById('script-idea').value.trim();
  const audience = document.getElementById('script-audience').value.trim();
  const videoLength = document.getElementById('script-length').value;
  const scriptStyle = document.getElementById('script-style').value;
  const customStyle = document.getElementById('script-custom').value.trim();
  
  const sections = [];
  if (document.getElementById('sec-hook').checked) sections.push('Hook');
  if (document.getElementById('sec-main').checked) sections.push('Main Content');
  if (document.getElementById('sec-cta').checked) sections.push('CTA');
  if (document.getElementById('sec-sponsor').checked) sections.push('Sponsor Segment');
  
  if (!title) {
    document.getElementById('script-title').focus();
    return;
  }

  showLoading();
  setButtonLoading('generateScript', true);

  try {
    const response = await fetch(API_BASE + '/api/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, idea, audience, videoLength, scriptStyle, customStyle, sections, email: userEmail || 'free@default' })
    });

    const data = await response.json();
    
    if (data.error) {
      displayScript('Error: ' + data.error);
    } else {
      const content = data.result || data.choices?.[0]?.message?.content || data.content || 'No script generated';
      sharedTitle = title;
      sharedIdea = idea || sharedIdea;
      sharedAudience = audience || sharedAudience;
      displayScript(content);
    }
  } catch (error) {
    displayScript('Error connecting to AI service. Please try again.');
  }

  setButtonLoading('generateScript', false);
}

async function generateThumbnail() {
  const sourceType = document.querySelector('input[name="thumb-source"]:checked').value;
  const title = sourceType === 'title' ? document.getElementById('thumb-title').value.trim() : '';
  const idea = sourceType === 'idea' ? document.getElementById('thumb-idea').value.trim() : '';
  const topic = document.getElementById('thumb-topic').value.trim();
  
  if (!topic) {
    document.getElementById('thumb-topic').focus();
    return;
  }

  showLoading();
  setButtonLoading('generateThumbnail', true);

  try {
    const response = await fetch(API_BASE + '/api/thumbnail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceType, title, idea, topic, email: userEmail || 'free@default' })
    });

    const data = await response.json();
    
    if (data.error) {
      displayThumbnail('Error: ' + data.error);
    } else {
      const content = data.result || data.choices?.[0]?.message?.content || data.content || 'No thumbnail prompt generated';
      displayThumbnail(content);
    }
  } catch (error) {
    displayThumbnail('Error connecting to AI service. Please try again.');
  }

  setButtonLoading('generateThumbnail', false);
}

// ============================================
// BUTTON LOADING
// ============================================
function setButtonLoading(funcName, loading) {
  const btn = document.querySelector(`button[onclick="${funcName}()"]`);
  if (!btn) return;
  
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" style="animation:spin-cw .8s linear infinite">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" stroke-width="3" fill="none"/>
        <path d="M4 12a8 8 0 018-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
      <span>Generating...</span>
    `;
  } else {
    btn.disabled = false;
    const labels = {
      'generateIdeas': 'Expand Ideas',
      'generateTitles': 'Generate Titles',
      'generateScript': 'Generate Script',
      'generateThumbnail': 'Generate Thumbnail Prompt'
    };
    btn.innerHTML = `
      <svg class="i" width="16" height="16"><use href="#ic-sparkles"/></svg>
      <span>${labels[funcName] || funcName}</span>
    `;
  }
}

// ============================================
// AUTO-FILL FUNCTIONS (Click-to-use)
// ============================================
function useForTitle(idea) {
  sharedIdea = idea;
  
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('on'));
  document.querySelector('[data-tab="title"]').classList.add('on');
  
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.getElementById('tab-title').style.display = 'block';
  
  document.getElementById('title-idea').value = idea;
  document.getElementById('title-niche').value = sharedNiche;
  document.getElementById('title-audience').value = sharedAudience;
  
  document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
  clearOutput();
}

function useForScript(title) {
  sharedTitle = title;
  
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('on'));
  document.querySelector('[data-tab="script"]').classList.add('on');
  
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.getElementById('tab-script').style.display = 'block';
  
  document.getElementById('script-title').value = title;
  document.getElementById('script-idea').value = sharedIdea;
  document.getElementById('script-audience').value = sharedAudience;
  
  document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
  clearOutput();
}

function useForThumbnail() {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('on'));
  document.querySelector('[data-tab="thumbnail"]').classList.add('on');
  
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.getElementById('tab-thumbnail').style.display = 'block';
  
  if (sharedTitle) {
    document.querySelector('input[name="thumb-source"][value="title"]').checked = true;
    toggleThumbSource('title');
    document.getElementById('thumb-title').value = sharedTitle;
  } else if (sharedIdea) {
    document.querySelector('input[name="thumb-source"][value="idea"]').checked = true;
    toggleThumbSource('idea');
    document.getElementById('thumb-idea').value = sharedIdea;
  }
  
  document.getElementById('thumb-topic').value = sharedNiche;
  
  document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
  clearOutput();
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================
function displayIdeas(text) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).slice(0, 5);
  const ideas = paragraphs.map(p => p.replace(/^\d+[\.)]\s*/, '').trim()).filter(p => p);
  
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  
  let html = '<div class="ideas-list">';
  ideas.forEach((idea, i) => {
    if (!idea) return;
    html += `
      <div class="idea-card click-action" onclick="useForTitle(\`${escapeHtml(idea)}\`)">
        <span class="idea-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="idea-text">
          ${idea.replace(/\n/g, '<br>')}
          <div class="idea-action">Click to use for Title →</div>
        </div>
        <span class="tooltip">Click to use for Title →</span>
      </div>
    `;
  });
  html += '</div>';
  html += `<button class="copy-btn" onclick="copyToClipboard(this, \`${escapeHtml(text)}\`)">
    <svg class="i" width="14" height="14"><use href="#ic-copy"/></svg> Copy all ideas
  </button>`;
  
  document.getElementById('output-content').innerHTML = html;
}

function displayTitles(text) {
  const titles = text.split(/\n\d+[\.)]\s*/).filter(t => t.trim()).slice(0, 7);
  
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  
  let html = '<div class="ideas-list">';
  titles.forEach((title, i) => {
    const cleanTitle = title.replace(/^\d+[\.)]\s*/, '').trim();
    if (!cleanTitle) return;
    html += `
      <div class="title-card click-action" onclick="useForScript(\`${escapeHtml(cleanTitle)}\`)">
        <span class="title-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="title-text">${cleanTitle}</div>
        <div class="title-action">Click to use for Script →</div>
        <span class="tooltip">Click to use for Script →</span>
      </div>
    `;
  });
  html += '</div>';
  html += `<button class="copy-btn" onclick="copyToClipboard(this, \`${escapeHtml(text)}\`)">
    <svg class="i" width="14" height="14"><use href="#ic-copy"/></svg> Copy all titles
  </button>`;
  
  document.getElementById('output-content').innerHTML = html;
}

function displayScript(text) {
  const wordCount = text.split(/\s+/).filter(w => w).length;
  
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  
  let html = '<div class="script-content">';
  
  const sectionPattern = /([A-Z][a-zA-Z\s]+(?:\s+Segment)?)\s*[-:]\s*/;
  const lines = text.split('\n');
  let currentSection = '';
  let currentContent = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    const match = trimmed.match(sectionPattern);
    if (match && match[1].length < 30) {
      if (currentSection && currentContent.length) {
        html += `
          <div class="script-section">
            <div class="script-section-title">${currentSection}</div>
            <p>${currentContent.join('<br>')}</p>
          </div>
        `;
      }
      currentSection = match[1];
      currentContent = [trimmed.replace(sectionPattern, '')];
    } else {
      currentContent.push(trimmed);
    }
  });
  
  if (currentSection && currentContent.length) {
    html += `
      <div class="script-section">
        <div class="script-section-title">${currentSection}</div>
        <p>${currentContent.join('<br>')}</p>
      </div>
    `;
  }
  
  if (!currentSection) {
    html += `<p>${text.replace(/\n/g, '<br>')}</p>`;
  }
  
  html += '</div>';
  html += `<div class="word-count">~${wordCount} words</div>`;
  html += `<button class="copy-btn" onclick="copyToClipboard(this, \`${escapeHtml(text)}\`)">
    <svg class="i" width="14" height="14"><use href="#ic-copy"/></svg> Copy script
  </button>`;
  html += `<button class="copy-btn" onclick="useForThumbnail()" style="margin-left:8px">
    <svg class="i" width="14" height="14"><use href="#ic-layout"/></svg> Create Thumbnail
  </button>`;
  
  document.getElementById('output-content').innerHTML = html;
}

function displayThumbnail(text) {
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  
  const sectionHeaders = [
    'TEXT OVERLAYS', 'COLOR PALETTE', 'ELEMENTS/OBJECTS', 'COMPOSITION', 
    'STYLE DIRECTION', 'SUBJECT/EXPRESSION', 'BACKGROUND/SCENE', 'WHAT TO AVOID'
  ];
  
  let html = '<div class="thumb-brief">';
  let currentItem = null;
  let currentContent = [];
  
  const lines = text.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    const isHeader = sectionHeaders.some(h => trimmed.toUpperCase().includes(h) || trimmed.match(/^\d+[\.)]\s*[A-Z]/));
    
    if (isHeader && currentItem) {
      html += `
        <div class="thumb-item">
          <div class="thumb-item-title">${currentItem}</div>
          <div class="thumb-item-content">${currentContent.join('<br>')}</div>
        </div>
      `;
      currentContent = [];
    }
    
    if (isHeader) {
      currentItem = trimmed.replace(/^\d+[\.)]\s*/, '').replace(/:$/, '').trim();
    } else if (currentItem) {
      currentContent.push(trimmed.replace(/^[-•*]\s*/, ''));
    }
  });
  
  if (currentItem && currentContent.length) {
    html += `
      <div class="thumb-item">
        <div class="thumb-item-title">${currentItem}</div>
        <div class="thumb-item-content">${currentContent.join('<br>')}</div>
      </div>
    `;
  }
  
  if (!currentItem) {
    html = `<div class="thumb-item"><div class="thumb-item-content">${text.replace(/\n/g, '<br>')}</div></div>`;
  }
  
  html += '</div>';
  html += `<button class="copy-btn" onclick="copyToClipboard(this, \`${escapeHtml(text)}\`)">
    <svg class="i" width="14" height="14"><use href="#ic-copy"/></svg> Copy prompt
  </button>`;
  
  document.getElementById('output-content').innerHTML = html;
}

async function copyToClipboard(btn, text) {
  try {
    await navigator.clipboard.writeText(text.replace(/\\`/g, '`').replace(/\\\\/g, '\\').replace(/\\\$/g, '$'));
    btn.classList.add('copied');
    btn.innerHTML = `<svg class="i" width="14" height="14"><use href="#ic-check"/></svg> Copied!`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg class="i" width="14" height="14"><use href="#ic-copy"/></svg> Copy`;
    }, 2000);
  } catch (err) {
    console.error('Copy failed', err);
  }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
}

// ============================================
// NAV HIGHLIGHT
// ============================================
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ============================================
// CONFETTI
// ============================================
function fireConfetti() {
  const canvas = document.getElementById('wl-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const cols = ['#ff0000', '#00c97a', '#0079da', '#fbbf24', '#f472b6', '#ffffff'];
  const pts = [];
  for (let i = 0; i < 60; i++) pts.push({
    x: canvas.width / 2, y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 2) * 11,
    life: 100, color: cols[Math.floor(Math.random() * cols.length)],
    size: Math.random() * 4 + 2
  });
  
  (function loop() {
    if (!pts.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life -= 2;
      if (p.life <= 0) pts.splice(i, 1);
    }
    requestAnimationFrame(loop);
  })();
}

// ============================================
// IMAGE GENERATION (Picsart API - Direct from frontend)
// ============================================
let currentImageUrl = '';

async function generateImage() {
  const prompt = document.getElementById('image-prompt').value.trim();
  const model = document.getElementById('image-model').value;
  
  const aspectSelect = document.getElementById('image-aspect');
  const selectedOption = aspectSelect.options[aspectSelect.selectedIndex];
  const width = parseInt(selectedOption.getAttribute('data-width'));
  const height = parseInt(selectedOption.getAttribute('data-height'));
  
  if (!prompt) {
    document.getElementById('image-prompt').focus();
    return;
  }

  const btn = document.getElementById('gen-image-btn');
  btn.disabled = true;
  btn.innerHTML = '<span>Generating...</span>';

  try {
    // Step 1: Submit generation request directly to Picsart
    const submitResponse = await fetch('https://genai-api.picsart.io/v1/text2image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Picsart-API-Key': 'paat-C5sEySOC0awYwDkEr1Zt1iXRUA0',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        model: model,
        width: width,
        height: height,
        count: 1
      })
    });

    const submitData = await submitResponse.json();
    console.log('Submit Response:', submitData);
    
    if (!submitResponse.ok) {
      throw new Error(submitData.message || submitData.error || 'Failed to submit image request');
    }

    // Handle different response structures
    let taskId = null;
    if (submitData.data?.task_id) {
      taskId = submitData.data.task_id;
    } else if (submitData.task_id) {
      taskId = submitData.task_id;
    } else if (submitData.data?.id) {
      taskId = submitData.data.id;
    } else if (submitData.inference_id) {
      taskId = submitData.inference_id;
    } else if (submitData.data?.inference_id) {
      taskId = submitData.data.inference_id;
    }
    
    if (!taskId) {
      // Maybe the image is directly returned?
      if (submitData.data?.image_url || submitData.image_url) {
        const imageUrl = submitData.data?.image_url || submitData.image_url;
        showImageResult(imageUrl);
        return;
      }
      throw new Error('Could not get task ID from response');
    }

    // Step 2: Poll for result
    const imageUrl = await pollForResult(taskId);
    currentImageUrl = imageUrl;
    
    showImageResult(imageUrl);
  } catch (err) {
    console.error('Image generation error:', err);
    alert('Error: ' + err.message);
  }
}

async function pollForResult(taskId, maxAttempts = 30) {
  const API_KEY = 'paat-C5sEySOC0awYwDkEr1Zt1iXRUA0';
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, 5000));
    
    const statusResponse = await fetch(`https://genai-api.picsart.io/v1/text2image/inferences/${taskId}`, {
      method: 'GET',
      headers: {
        'X-Picsart-API-Key': API_KEY,
        'accept': 'application/json'
      }
    });

    const statusData = await statusResponse.json();
    console.log('Status Response:', statusData);
    
    if (!statusResponse.ok) {
      throw new Error(statusData.message || statusData.error || 'Failed to check status');
    }

    // Success: found image URL
    if (statusData.status === 'success' && statusData.data?.length) {
      return statusData.data[0].url;
    }
    
    // Failure case
    if (statusData.status === 'failed' || statusData.status === 'error') {
      throw new Error('Image generation failed');
    }
    
    // Update button to show progress
    const btn = document.getElementById('gen-image-btn');
    btn.innerHTML = '<span>Generating... (' + (attempt + 1) + '/' + maxAttempts + ')</span>';
  }
  
  throw new Error('Image generation timed out');
}

function showImageResult(imageUrl) {
  document.getElementById('output-content').innerHTML = `
    <div class="image-result">
      <img src="${imageUrl}" alt="Generated image" style="max-width:100%;border-radius:12px;" />
      <a href="${imageUrl}" download class="copy-btn">Download</a>
    </div>
  `;
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  
  const btn = document.getElementById('gen-image-btn');
  btn.disabled = false;
  btn.innerHTML = '<svg class="i" width="16" height="16"><use href="#ic-sparkles"/></svg><span>Generate Image</span>';
}
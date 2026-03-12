// TubeForge - Frontend Application Logic

// ============================================
// TAB SWITCHING
// ============================================
function initTabs() {
  document.querySelectorAll('.atab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      
      // Update tab buttons
      document.querySelectorAll('.atab').forEach(t => t.classList.remove('on'));
      this.classList.add('on');
      
      // Show/hide tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(`tab-${tabName}`).style.display = 'block';
      
      // Clear output when switching tabs
      if (typeof clearOutput === 'function') {
        clearOutput();
      }
    });
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initTabs();
  initScrollAnimations();
  initNavHighlight();
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
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5;
      p.life -= 2;
      ctx.globalAlpha = Math.max(0, p.life / 100);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.life <= 0) {
        pts.splice(i, 1);
        i--;
      }
    }
    requestAnimationFrame(loop);
  })();
}

// ============================================
// FAQ TOGGLE
// ============================================
function toggleFaq(btn) {
  const item = btn.closest('.fitem');
  const was = item.classList.contains('open');
  document.querySelectorAll('.fitem').forEach(i => i.classList.remove('open'));
  if (!was) item.classList.add('open');
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver(e => e.forEach(x => {
    if (x.isIntersecting) {
      x.target.style.opacity = '1';
      x.target.style.transform = 'translateY(0)';
    }
  }), { threshold: 0.1 });

  document.querySelectorAll('.feat-card,.step-card,.tcard,.pcard,.stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.feat-grid,.steps-grid,.testi-grid,.price-grid,.stats-grid').forEach(g => {
  Array.from(g.children).forEach((c, i) => c.style.transitionDelay = (i * 0.1) + 's');
  });
}

// ============================================
// NAV SCROLL HIGHLIGHT
// ============================================
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 80) cur = s.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--red)' : '';
    });
  });
}

// ============================================
// APP FUNCTIONS
// ============================================
let currentIdeas = [];

function clearOutput() {
  document.getElementById('output-empty').style.display = 'flex';
  document.getElementById('output-content').style.display = 'none';
  document.getElementById('output-content').innerHTML = '';
  currentIdeas = [];
}

function showLoading() {
  document.getElementById('output-empty').innerHTML = `
    <svg class="spinner" width="48" height="48" viewBox="0 0 24 24" style="animation:spin-cw .8s linear infinite">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.2)" stroke-width="3" fill="none"/>
      <path d="M4 12a8 8 0 018-8" stroke="var(--red)" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>
    <p>AI is thinking...</p>
  `;
}

function showError(message) {
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  document.getElementById('output-content').innerHTML = `
    <div style="padding:20px;text-align:center;color:var(--red)">
      <svg class="i" width="32" height="32" style="margin-bottom:12px"><use href="#ic-alert"/></svg>
      <p>${message}</p>
    </div>
  `;
}

// ============================================
// API CALLS (Demo Mode - No Backend Required)
// ============================================
async function generateIdeas() {
  const niche = document.getElementById('ideas-niche').value.trim();
  const audience = document.getElementById('ideas-audience').value.trim();
  
  if (!niche) {
    document.getElementById('ideas-niche').focus();
    return;
  }

  showLoading();
  setButtonLoading('generateIdeas', true);

  // Simulate AI delay
  await new Promise(r => setTimeout(r, 1500));

  // Demo response based on niche
  const demoIdeas = `1. I Tried ${niche} for 30 Days — Here's What Happened
2. The Ultimate ${niche} Guide for Beginners (2026)
3. 10 ${niche} Mistakes That Are Killing Your Progress
4. How to Master ${niche} in 2026 — Step by Step
5. Why Most People Fail at ${niche} (And How to Avoid It)
6. ${niche} Tips That Changed My Life — Full Tutorial
7. The Secret to ${niche} Success (Most People Don't Know)`;

  displayIdeas(demoIdeas);
  setButtonLoading('generateIdeas', false);
}

async function generateScript() {
  const title = document.getElementById('script-title').value.trim();
  const audience = document.getElementById('script-audience').value.trim();
  
  if (!title) {
    document.getElementById('script-title').focus();
    return;
  }

  showLoading();
  setButtonLoading('generateScript', true);

  // Simulate AI delay
  await new Promise(r => setTimeout(r, 2000));

  // Demo script
  const demoScript = `# HOOK
[0:00-0:30]
Stop what you're doing right now. If you're into ${title}, you NEED to watch this until the end. Because in the next few minutes, I'm going to show you something that changed everything for me.

# INTRODUCTION
[0:30-1:00]
Hey everyone, welcome back! I'm so glad you're here. In this video, we're diving deep into "${title}" — this is the exact strategy I used to get results, and I'm going to break it down step by step for you.

# MAIN CONTENT
[1:00-5:00]
Point 1: First things first — you need to understand the fundamentals. Most people skip this and wonder why they're not getting results. Don't be like most people.

Point 2: Now let's talk about the real stuff. The tactics that actually work. I've tested these personally and they deliver.

Point 3: Here's what most creators get wrong. This is the make-or-break point that determines your success.

# CALL TO ACTION
[5:00-5:30]
If this video helped you, smash that like button and subscribe! Drop a comment below — what's your biggest challenge with ${title}? I read every single one.

# OUTRO
[5:30-6:00]
Thanks for watching! If you want more tips like this, check out my other videos. See you in the next one!`;

  displayScript(demoScript);
  setButtonLoading('generateScript', false);
}

async function generateThumbnail() {
  const title = document.getElementById('thumb-title').value.trim();
  
  if (!title) {
    document.getElementById('thumb-title').focus();
    return;
  }

  showLoading();
  setButtonLoading('generateThumbnail', true);

  // Simulate AI delay
  await new Promise(r => setTimeout(r, 1500));

  // Demo thumbnail brief
  const demoBrief = `# THUMBNAIL TEXT
Main Text: STOP (bold, white, Impact font)
Secondary Text: Doing This (yellow, smaller)

# BACKGROUND
Dark navy blue (#0a0a1a) with subtle gradient
Add a small person silhouette in corner for depth

# COLOR PALETTE
#FF0000 (YouTube red - main accent)
#FFD700 (Gold - secondary highlight)  
#FFFFFF (White - text)

# SUBJECT & EXPRESSION
Creator: Shocked/surprised expression
Eyes wide open, eyebrows raised
Pointing finger at the text

# STYLE & MOOD
Bold, high-contrast, urgency-driven
Leave plenty of negative space on left
Text should occupy top-right quadrant

# WHAT TO AVOID
- Cluttered backgrounds
- Too many colors
- Small unreadable text
- Sad/neutral expressions`;

  displayThumbnail(demoBrief);
  setButtonLoading('generateThumbnail', false);
}

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
      'generateIdeas': 'Generate Ideas',
      'generateScript': 'Generate Script',
      'generateThumbnail': 'Generate Thumbnail Brief'
    };
    btn.innerHTML = `
      <svg class="i" width="16" height="16"><use href="#ic-sparkles"/></svg>
      <span>${labels[funcName]}</span>
    `;
  }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================
function displayIdeas(text) {
  // Parse the ideas - split by numbered items
  const ideas = text.split(/\n\d+[\.)]\s*/).filter(i => i.trim());
  
  if (ideas.length === 0) {
    // Try alternative parsing
    const lines = text.split('\n').filter(l => l.trim() && !l.match(/^#/));
    currentIdeas = lines.slice(0, 7);
  } else {
    currentIdeas = ideas.slice(0, 7);
  }

  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  
  let html = '<div class="ideas-list">';
  currentIdeas.forEach((idea, i) => {
    const cleanIdea = idea.replace(/^\d+[\.)]\s*/, '').trim();
    html += `
      <div class="idea-item" onclick="useIdea(${i})">
        <span class="idea-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="idea-text">
          ${cleanIdea}
          <div class="idea-use">Click to use for script →</div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  html += `<button class="copy-btn" onclick="copyToClipboard(this, \`${escapeHtml(text)}\`)">
    <svg class="i" width="14" height="14"><use href="#ic-copy"/></svg> Copy all ideas
  </button>`;
  
  document.getElementById('output-content').innerHTML = html;
}

function useIdea(index) {
  const idea = currentIdeas[index].replace(/^\d+[\.)]\s*/, '').trim();
  
  // Switch to script tab
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('on'));
  document.querySelector('[data-tab="script"]').classList.add('on');
  
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.getElementById('tab-script').style.display = 'block';
  
  document.getElementById('script-title').value = idea;
  
  // Scroll to app
  document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
  
  // Clear output
  clearOutput();
}

function displayScript(text) {
  const wordCount = text.split(/\s+/).filter(w => w).length;
  
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  
  // Parse sections
  const sections = text.split(/(?=^#{1,3}\s+|^[A-Z][a-z]+ —)/m);
  
  let html = '<div class="script-content">';
  
  sections.forEach(section => {
    if (!section.trim()) return;
    
    // Try to identify section headers
    const match = section.match(/^(#{1,3}\s+)?([A-Z][a-zA-Z\s]+)(—|:)?\s*\n?/);
    
    if (match) {
      const title = match[2].trim();
      const content = section.replace(match[0], '').trim();
      html += `
        <div class="script-section">
          <div class="script-section-title">${title}</div>
          <p>${content.replace(/\n\n/g, '</p><p>')}</p>
        </div>
      `;
    } else {
      html += `<p>${section.replace(/\n/g, '<br>')}</p>`;
    }
  });
  
  html += '</div>';
  html += `<div class="word-count">${wordCount} words</div>`;
  html += `<button class="copy-btn" onclick="copyToClipboard(this, \`${escapeHtml(text)}\`)">
    <svg class="i" width="14" height="14"><use href="#ic-copy"/></svg> Copy script
  </button>`;
  
  document.getElementById('output-content').innerHTML = html;
}

function displayThumbnail(text) {
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  
  // Parse sections from the text
  const lines = text.split('\n').filter(l => l.trim());
  let html = '<div class="thumb-brief">';
  
  let currentItem = null;
  let currentContent = [];
  
  lines.forEach(line => {
    // Check for section headers
    if (line.match(/^(Thumbnail Text|Background|Color Palette|Subject|Style|What to Avoid|Advice)/i)) {
      if (currentItem) {
        html += `
          <div class="thumb-item">
            <div class="thumb-item-title">${currentItem}</div>
            <div class="thumb-item-content">${currentContent.join('<br>')}</div>
          </div>
        `;
      }
      currentItem = line.replace(/^#+\s*/, '').trim();
      currentContent = [];
    } else if (currentItem) {
      currentContent.push(line.replace(/^[-•*]\s*/, ''));
    }
  });
  
  // Last item
  if (currentItem) {
    html += `
      <div class="thumb-item">
        <div class="thumb-item-title">${currentItem}</div>
        <div class="thumb-item-content">${currentContent.join('<br>')}</div>
      </div>
    `;
  }
  
  // If no sections parsed, just show raw text with highlighting
  if (!currentItem) {
    html = `<div class="thumb-item"><div class="thumb-item-content">${text.replace(/\n/g, '<br>')}</div></div>`;
  }
  
  html += '</div>';
  html += `<button class="copy-btn" onclick="copyToClipboard(this, \`${escapeHtml(text)}\`)">
    <svg class="i" width="14" height="14"><use href="#ic-copy"/></svg> Copy brief
  </button>`;
  
  document.getElementById('output-content').innerHTML = html;
}

function escapeHtml(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
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
    console.error('Copy failed:', err);
  }
}

// ============================================
// IMAGE GENERATOR (Picsart API)
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

  showImageLoading(true);

  try {
    // Step 1: Submit generation request
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
        showImageLoading(false);
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
    showImageError(err.message);
  } finally {
    showImageLoading(false);
  }
}

async function pollForResult(taskId, maxAttempts = 30) {
  const API_KEY = 'paat-C5sEySOC0awYwDkEr1Zt1iXRUA0';
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
    
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
    if (statusData.status === 'failed') {
      throw new Error('Image generation failed');
    }
    
    // Update progress in UI
    updateImageProgress(attempt + 1, maxAttempts);
  }
  
  throw new Error('Image generation timed out');
}

function showImageLoading(loading) {
  const btn = document.getElementById('gen-image-btn');
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" style="animation:spin-cw .8s linear infinite">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" stroke-width="3" fill="none"/>
        <path d="M4 12a8 8 0 018-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
      <span>Generating...</span>
    `;
    
    // Show loading UI
    document.getElementById('output-empty').style.display = 'none';
    document.getElementById('output-content').style.display = 'block';
    document.getElementById('output-content').innerHTML = `
      <div class="image-loading">
        <div class="image-loading-spinner"></div>
        <div class="image-loading-text">Generating your image...</div>
        <div class="image-loading-progress" id="image-progress">This may take up to 2 minutes</div>
      </div>
    `;
  } else {
    btn.disabled = false;
    btn.innerHTML = `
      <svg class="i" width="16" height="16"><use href="#ic-image"/></svg>
      <span>Generate Image</span>
    `;
  }
}

function updateImageProgress(current, total) {
  const outputContent = document.getElementById('output-content');
  const progressEl = document.getElementById('image-progress');
  if (progressEl) {
    progressEl.textContent = `Progress: ${current}/${total} attempts`;
  }
}

function showImageResult(imageUrl) {
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  document.getElementById('output-content').innerHTML = `
    <div class="image-result">
      <div class="image-preview">
        <img src="${imageUrl}" alt="Generated Image" />
      </div>
      <div class="image-actions">
        <button class="image-btn image-btn-primary" onclick="downloadImage('${imageUrl}')">
          <svg class="i" width="16" height="16"><use href="#ic-arrow"/></svg> Download
        </button>
        <button class="image-btn image-btn-secondary" onclick="openInNewTab('${imageUrl}')">
          <svg class="i" width="16" height="16"><use href="#ic-image"/></svg> Open Full Size
        </button>
      </div>
    </div>
  `;
}

function showImageError(message) {
  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('output-content').style.display = 'block';
  document.getElementById('output-content').innerHTML = `
    <div class="image-error">
      <svg class="i" width="32" height="32" style="margin-bottom:12px"><use href="#ic-alert"/></svg>
      <p>${message}</p>
    </div>
  `;
}

function downloadImage(url) {
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tubeforge-image.png';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function openInNewTab(url) {
  window.open(url, '_blank');
}

function updateImageSize() {
  const aspectDropdown = document.getElementById('aspect-dropdown');
  const selected = aspectDropdown.querySelector('.cmd-option.selected');
  if (selected) {
    const width = selected.getAttribute('data-width');
    const height = selected.getAttribute('data-height');
    console.log(`Selected: ${width}x${height}`);
  }
}

// ============================================
// Command-Style Searchable Dropdowns (disabled - not used)




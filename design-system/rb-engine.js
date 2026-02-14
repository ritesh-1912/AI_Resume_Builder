/**
 * AI Resume Builder — Build Engine
 * Shared logic for all /rb/ step pages.
 *
 * Handles: gating, navigation, build panel, artifact storage,
 *          status badge, proof footer rendering.
 *
 * Usage: Include this script on any step page. Set data-step="N"
 *        on <body> where N is 1-8.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════
   * Constants
   * ═══════════════════════════════════════════ */
  var TOTAL_STEPS = 8;
  var PROJECT_NAME = 'AI Resume Builder';
  var PROJECT_LABEL = 'Project 3';

  var STEP_META = [
    { num: 1, slug: '01-problem',      title: 'Define the Problem',  sub: 'Articulate the core problem your AI Resume Builder solves.' },
    { num: 2, slug: '02-market',       title: 'Market Research',     sub: 'Analyze existing resume tools and identify your differentiation.' },
    { num: 3, slug: '03-architecture', title: 'System Architecture', sub: 'Map out the overall system components and data flow.' },
    { num: 4, slug: '04-hld',          title: 'High-Level Design',   sub: 'Define modules, APIs, and component boundaries.' },
    { num: 5, slug: '05-lld',          title: 'Low-Level Design',    sub: 'Detail individual component logic and state management.' },
    { num: 6, slug: '06-build',        title: 'Build',               sub: 'Implement the core features step by step.' },
    { num: 7, slug: '07-test',         title: 'Test',                sub: 'Verify every feature works correctly end-to-end.' },
    { num: 8, slug: '08-ship',         title: 'Ship',                sub: 'Deploy, document, and submit your finished project.' }
  ];

  /* ═══════════════════════════════════════════
   * LocalStorage helpers
   * ═══════════════════════════════════════════ */
  function artifactKey(stepNum) {
    return 'rb_step_' + stepNum + '_artifact';
  }

  function getArtifact(stepNum) {
    try {
      var raw = localStorage.getItem(artifactKey(stepNum));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setArtifact(stepNum, data) {
    localStorage.setItem(artifactKey(stepNum), JSON.stringify(data));
  }

  function getProofLinks() {
    try {
      var raw = localStorage.getItem('rb_proof_links');
      return raw ? JSON.parse(raw) : { lovable: '', github: '', deployed: '' };
    } catch (e) {
      return { lovable: '', github: '', deployed: '' };
    }
  }

  function isValidUrl(s) {
    if (!s || typeof s !== 'string') return false;
    s = s.trim();
    if (!s) return false;
    try {
      var u = new URL(s);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch (e) {
      return false;
    }
  }

  /* ═══════════════════════════════════════════
   * Gating: Can user access step N?
   * Step 1 always accessible. Step N requires artifact from step N-1.
   * ═══════════════════════════════════════════ */
  function canAccessStep(stepNum) {
    if (stepNum <= 1) return true;
    return !!getArtifact(stepNum - 1);
  }

  function isStepComplete(stepNum) {
    return !!getArtifact(stepNum);
  }

  /* ═══════════════════════════════════════════
   * Compute overall status badge
   * ═══════════════════════════════════════════ */
  function computeStatus() {
    var completed = 0;
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      if (isStepComplete(i)) completed++;
    }
    if (completed === 0) return 'not-started';
    if (completed === TOTAL_STEPS) return 'shipped';
    return 'progress';
  }

  function statusLabel(status) {
    if (status === 'shipped') return 'Shipped';
    if (status === 'progress') return 'In Progress';
    return 'Not Started';
  }

  /* ═══════════════════════════════════════════
   * Render: Top Bar
   * ═══════════════════════════════════════════ */
  function renderTopBar(stepNum) {
    var status = computeStatus();
    var bar = document.getElementById('kn-top-bar');
    if (!bar) return;

    bar.innerHTML =
      '<span class="kn-top-bar__project">' + PROJECT_NAME + '</span>' +
      '<span class="kn-top-bar__progress">' + PROJECT_LABEL + ' — Step ' + stepNum + ' of ' + TOTAL_STEPS + '</span>' +
      '<span class="kn-badge kn-badge--' + status + '">' + statusLabel(status) + '</span>';
  }

  /* ═══════════════════════════════════════════
   * Render: Context Header
   * ═══════════════════════════════════════════ */
  function renderContextHeader(stepNum) {
    var meta = STEP_META[stepNum - 1];
    var header = document.getElementById('kn-context-header');
    if (!header) return;

    header.innerHTML =
      '<h1 class="kn-heading">Step ' + stepNum + ': ' + meta.title + '</h1>' +
      '<p class="kn-subtext">' + meta.sub + '</p>';
  }

  /* ═══════════════════════════════════════════
   * Render: Build Panel (30% right side)
   * ═══════════════════════════════════════════ */
  function renderBuildPanel(stepNum) {
    var panel = document.getElementById('kn-panel');
    if (!panel) return;

    var artifact = getArtifact(stepNum);
    var feedbackStatus = artifact ? artifact.status : null;
    var screenshotName = artifact && artifact.screenshot ? artifact.screenshot : '';

    panel.innerHTML =
      '<div class="rb-panel-section">' +
        '<p class="rb-panel-section__title">Copy This Into Lovable</p>' +
        '<p class="rb-panel-section__hint">Paste this prompt into Lovable to generate your step artifact.</p>' +
        '<textarea class="rb-prompt-textarea" id="rb-prompt" placeholder="Paste or type your Lovable prompt here…"></textarea>' +
        '<div class="rb-panel-actions">' +
          '<button type="button" class="kn-btn kn-btn--secondary" id="rb-copy-btn">Copy</button>' +
          '<a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" class="kn-btn kn-btn--primary" id="rb-build-btn">Build in Lovable</a>' +
        '</div>' +
      '</div>' +

      '<div class="rb-feedback">' +
        '<p class="rb-feedback__title">After building, report your result:</p>' +
        '<div class="rb-feedback__buttons">' +
          '<button type="button" class="rb-feedback__btn rb-feedback__btn--success' + (feedbackStatus === 'worked' ? ' rb-feedback__btn--active' : '') + '" id="rb-worked">&#10003; It Worked</button>' +
          '<button type="button" class="rb-feedback__btn rb-feedback__btn--error' + (feedbackStatus === 'error' ? ' rb-feedback__btn--active' : '') + '" id="rb-error">&#10007; Error</button>' +
          '<div class="rb-screenshot">' +
            '<label class="rb-screenshot__label" for="rb-screenshot-input">&#128247; Add Screenshot</label>' +
            '<input type="file" accept="image/*" class="rb-screenshot__input" id="rb-screenshot-input">' +
            (screenshotName ? '<p class="rb-screenshot__name">' + escapeHtml(screenshotName) + '</p>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="rb-artifact-status' + (artifact ? ' rb-artifact-status--done' : ' rb-artifact-status--pending') + '" id="rb-artifact-indicator">' +
        (artifact ? 'Artifact recorded — Step unlocked' : 'No artifact yet — complete this step to proceed') +
      '</div>';

    // Bind events
    bindPanelEvents(stepNum);
  }

  function bindPanelEvents(stepNum) {
    // Copy button
    var copyBtn = document.getElementById('rb-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var textarea = document.getElementById('rb-prompt');
        if (!textarea || !textarea.value.trim()) return;
        navigator.clipboard.writeText(textarea.value).then(function () {
          copyBtn.textContent = 'Copied!';
          setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
        }).catch(function () {});
      });
    }

    // It Worked
    var workedBtn = document.getElementById('rb-worked');
    if (workedBtn) {
      workedBtn.addEventListener('click', function () {
        setArtifact(stepNum, {
          status: 'worked',
          timestamp: new Date().toISOString()
        });
        renderBuildPanel(stepNum);
        renderStepNav(stepNum);
        renderProofFooter();
        renderTopBar(stepNum);
      });
    }

    // Error
    var errorBtn = document.getElementById('rb-error');
    if (errorBtn) {
      errorBtn.addEventListener('click', function () {
        var note = prompt('Briefly describe the error (optional):') || '';
        setArtifact(stepNum, {
          status: 'error',
          errorNote: note,
          timestamp: new Date().toISOString()
        });
        renderBuildPanel(stepNum);
        renderStepNav(stepNum);
        renderProofFooter();
        renderTopBar(stepNum);
      });
    }

    // Screenshot
    var screenshotInput = document.getElementById('rb-screenshot-input');
    if (screenshotInput) {
      screenshotInput.addEventListener('change', function () {
        var file = screenshotInput.files && screenshotInput.files[0];
        if (!file) return;
        setArtifact(stepNum, {
          status: 'screenshot',
          screenshot: file.name,
          timestamp: new Date().toISOString()
        });
        renderBuildPanel(stepNum);
        renderStepNav(stepNum);
        renderProofFooter();
        renderTopBar(stepNum);
      });
    }
  }

  /* ═══════════════════════════════════════════
   * Render: Step Navigation (prev/next)
   * ═══════════════════════════════════════════ */
  function renderStepNav(stepNum) {
    var nav = document.getElementById('rb-step-nav');
    if (!nav) return;

    var prevStep = stepNum > 1 ? STEP_META[stepNum - 2] : null;
    var nextStep = stepNum < TOTAL_STEPS ? STEP_META[stepNum] : null;
    var nextEnabled = isStepComplete(stepNum);

    var prevHtml = prevStep
      ? '<a href="' + prevStep.slug + '.html" class="kn-btn kn-btn--secondary">&larr; Step ' + prevStep.num + '</a>'
      : '<span></span>';

    var nextHtml = '';
    if (nextStep) {
      if (nextEnabled) {
        nextHtml = '<a href="' + nextStep.slug + '.html" class="kn-btn kn-btn--primary">Step ' + nextStep.num + ' &rarr;</a>';
      } else {
        nextHtml = '<span class="kn-btn kn-btn--primary kn-btn--disabled" title="Complete this step to proceed">Step ' + nextStep.num + ' &rarr;</span>';
      }
    } else {
      // Last step → go to proof
      if (nextEnabled) {
        nextHtml = '<a href="proof.html" class="kn-btn kn-btn--primary">View Proof &rarr;</a>';
      } else {
        nextHtml = '<span class="kn-btn kn-btn--primary kn-btn--disabled" title="Complete this step to proceed">View Proof &rarr;</span>';
      }
    }

    nav.innerHTML =
      prevHtml +
      '<span class="rb-step-nav__info">Step ' + stepNum + ' of ' + TOTAL_STEPS + '</span>' +
      nextHtml;
  }

  /* ═══════════════════════════════════════════
   * Render: Proof Footer (persistent bar)
   * ═══════════════════════════════════════════ */
  function renderProofFooter() {
    var footer = document.getElementById('kn-proof-footer');
    if (!footer) return;

    var html = '<p class="kn-proof-footer__title">Build Progress</p><div class="rb-proof-footer-bar">';
    for (var i = 0; i < TOTAL_STEPS; i++) {
      var done = isStepComplete(i + 1);
      var meta = STEP_META[i];
      html += '<span class="rb-proof-footer-item' + (done ? ' rb-proof-footer-item--done' : '') + '">';
      html += (done ? '&#10003;' : '&#9675;') + ' ' + meta.title;
      html += '</span>';
    }
    html += '</div>';
    footer.innerHTML = html;
  }

  /* ═══════════════════════════════════════════
   * Render: Gating overlay (if step locked)
   * ═══════════════════════════════════════════ */
  function renderGatingOverlay(stepNum) {
    if (canAccessStep(stepNum)) return;

    var workspace = document.getElementById('kn-workspace');
    var panel = document.getElementById('kn-panel');
    if (!workspace) return;

    // Overlay the entire main area
    var main = document.querySelector('.kn-main');
    if (main) {
      main.style.position = 'relative';
      var overlay = document.createElement('div');
      overlay.className = 'rb-gated__overlay';
      overlay.innerHTML =
        '<span class="rb-gated__icon">&#128274;</span>' +
        '<p class="rb-gated__text">Step ' + stepNum + ' is locked</p>' +
        '<p class="rb-gated__hint">Complete Step ' + (stepNum - 1) + ' first to unlock this step.</p>' +
        '<a href="' + STEP_META[stepNum - 2].slug + '.html" class="kn-btn kn-btn--primary" style="margin-top:var(--kn-space-2)">Go to Step ' + (stepNum - 1) + '</a>';
      main.appendChild(overlay);
    }
  }

  /* ═══════════════════════════════════════════
   * Utility
   * ═══════════════════════════════════════════ */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ═══════════════════════════════════════════
   * Init: called once per step page
   * ═══════════════════════════════════════════ */
  function initStep() {
    var body = document.body;
    var stepNum = parseInt(body.getAttribute('data-step'), 10);
    if (!stepNum || stepNum < 1 || stepNum > TOTAL_STEPS) return;

    renderTopBar(stepNum);
    renderContextHeader(stepNum);
    renderBuildPanel(stepNum);
    renderStepNav(stepNum);
    renderProofFooter();
    renderGatingOverlay(stepNum);
  }

  /* ═══════════════════════════════════════════
   * Expose for proof page
   * ═══════════════════════════════════════════ */
  window.RBEngine = {
    STEP_META: STEP_META,
    TOTAL_STEPS: TOTAL_STEPS,
    PROJECT_NAME: PROJECT_NAME,
    PROJECT_LABEL: PROJECT_LABEL,
    getArtifact: getArtifact,
    isStepComplete: isStepComplete,
    canAccessStep: canAccessStep,
    computeStatus: computeStatus,
    statusLabel: statusLabel,
    getProofLinks: getProofLinks,
    isValidUrl: isValidUrl,
    escapeHtml: escapeHtml
  };

  /* Auto-init when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStep);
  } else {
    initStep();
  }
})();

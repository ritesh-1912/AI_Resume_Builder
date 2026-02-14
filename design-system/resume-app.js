/**
 * AI Resume Builder — Resume App
 * Data model, localStorage, sample data, live preview sync, preview page render.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'resumeBuilderData';
  var TEMPLATE_KEY = 'resumeBuilderTemplate';
  var ACTION_VERBS = /^(Built|Developed|Designed|Implemented|Led|Improved|Created|Optimized|Automated)\b/i;
  var NUMBER_RE = /\d|%|\b[kKmMxX]\b/;

  function getTemplate() {
    try {
      var t = localStorage.getItem(TEMPLATE_KEY);
      if (t === 'modern' || t === 'minimal') return t;
    } catch (e) {}
    return 'classic';
  }

  function setTemplate(key) {
    if (key !== 'classic' && key !== 'modern' && key !== 'minimal') return;
    try { localStorage.setItem(TEMPLATE_KEY, key); } catch (e) {}
  }

  /**
   * Top 3 Improvements (separate from ATS suggestions). Max 3, priority order.
   */
  function getTopImprovements(data) {
    var d = data || getEmptyResume();
    var out = [];
    var projectCount = (d.projects && d.projects.length) || 0;
    if (projectCount < 2) out.push('Add at least 2 projects.');
    var hasNumber = false;
    function checkDesc(text) {
      if ((text || '').trim() && NUMBER_RE.test(text)) hasNumber = true;
    }
    (d.experience || []).forEach(function (e) { checkDesc(e.description); });
    (d.projects || []).forEach(function (e) { checkDesc(e.description); });
    if (!hasNumber) out.push('Add measurable impact (numbers) in bullets.');
    var summaryWords = (d.summary || '').trim().split(/\s+/).filter(Boolean).length;
    if (summaryWords < 40) out.push('Expand summary (target 40+ words).');
    var skillsCount = (d.skills || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean).length;
    if (skillsCount < 8) out.push('Add more skills (target 8+).');
    var expCount = (d.experience && d.experience.length) || 0;
    if (expCount < 1) out.push('Add experience (internship or project work).');
    return out.slice(0, 3);
  }

  /**
   * Bullet discipline: action verb + numeric impact. Returns { needActionVerb, needNumber }.
   */
  function getBulletGuidance(descriptionText) {
    var text = (descriptionText || '').trim();
    if (!text) return { needActionVerb: false, needNumber: false };
    var lines = text.split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (lines.length === 0) return { needActionVerb: false, needNumber: false };
    var needActionVerb = false;
    var hasNumber = false;
    for (var i = 0; i < lines.length; i++) {
      if (!ACTION_VERBS.test(lines[i])) needActionVerb = true;
      if (NUMBER_RE.test(lines[i])) hasNumber = true;
    }
    return { needActionVerb: needActionVerb, needNumber: !hasNumber };
  }

  function getEmptyResume() {
    return {
      personal: { name: '', email: '', phone: '', location: '' },
      summary: '',
      education: [],
      experience: [],
      projects: [],
      skills: '',
      links: { github: '', linkedin: '' }
    };
  }

  function getSampleResume() {
    return {
      personal: {
        name: 'Jordan Chen',
        email: 'jordan.chen@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA'
      },
      summary: 'Product-minded engineer with 6+ years building web applications. Focus on clarity, performance, and inclusive design. Led migration to React and design system adoption at previous company.',
      education: [
        { degree: 'B.S. Computer Science', school: 'University of California', location: 'Berkeley, CA', year: '2018' }
      ],
      experience: [
        { title: 'Senior Software Engineer', company: 'Tech Co', location: 'San Francisco, CA', period: '2020 – Present', description: 'Lead front-end architecture. Introduced design system and reduced bundle size by 30%. Mentor 2 junior engineers.' },
        { title: 'Software Engineer', company: 'Startup Inc', location: 'Oakland, CA', period: '2018 – 2020', description: 'Built customer dashboard and internal tools. React, TypeScript, Node.' }
      ],
      projects: [
        { name: 'Design System', description: 'Component library and tokens. Used across 4 product teams.', link: '' },
        { name: 'Resume Builder', description: 'Side project: structured resume editor with live preview.', link: 'https://github.com/example' }
      ],
      skills: 'JavaScript, TypeScript, React, Node.js, CSS, REST APIs, Figma',
      links: { github: 'https://github.com/jordanchen', linkedin: 'https://linkedin.com/in/jordanchen' }
    };
  }

  function getResumeData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        return data;
      }
    } catch (e) {}
    return getEmptyResume();
  }

  function setResumeData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * ATS Score v1: deterministic 0–100.
   * +15 summary 40–120 words, +10 ≥2 projects, +10 ≥1 experience,
   * +10 ≥8 skills, +10 GitHub or LinkedIn, +15 number in bullets, +10 education complete.
   * Returns { score, suggestions } (suggestions max 3).
   */
  function computeATSScore(data) {
    var d = data || getEmptyResume();
    var score = 0;
    var suggestions = [];

    var summaryWords = (d.summary || '').trim().split(/\s+/).filter(Boolean).length;
    if (summaryWords >= 40 && summaryWords <= 120) score += 15;
    else suggestions.push('Write a stronger summary (40–120 words).');

    var projectCount = (d.projects && d.projects.length) || 0;
    if (projectCount >= 2) score += 10;
    else suggestions.push('Add at least 2 projects.');

    var expCount = (d.experience && d.experience.length) || 0;
    if (expCount >= 1) score += 10;
    else suggestions.push('Add at least one experience entry.');

    var skillsList = (d.skills || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (skillsList.length >= 8) score += 10;
    else suggestions.push('Add more skills (target 8+).');

    var hasLink = !!((d.links && (d.links.github || '').trim()) || (d.links && (d.links.linkedin || '').trim()));
    if (hasLink) score += 10;
    else suggestions.push('Add a GitHub or LinkedIn link.');

    var hasNumberInBullets = false;
    var numberRe = /\d|%|\b[kKmMxX]\b/;
    function checkDesc(text) {
      if ((text || '').trim() && numberRe.test(text)) hasNumberInBullets = true;
    }
    (d.experience || []).forEach(function (e) { checkDesc(e.description); });
    (d.projects || []).forEach(function (e) { checkDesc(e.description); });
    if (hasNumberInBullets) score += 15;
    else suggestions.push('Add measurable impact (numbers) in bullets.');

    var educationComplete = false;
    if (d.education && d.education.length) {
      educationComplete = d.education.some(function (e) {
        return (e.degree || '').trim() && (e.school || '').trim() && (e.year || '').trim();
      });
    }
    if (educationComplete) score += 10;
    else suggestions.push('Complete education (degree, school, year).');

    score = Math.min(100, score);
    return { score: score, suggestions: suggestions.slice(0, 3) };
  }

  function escapeHtml(str) {
    if (str == null || str === '') return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderLivePreview(data, container) {
    if (!container) return;
    var d = data || getEmptyResume();
    var p = d.personal || {};
    var name = (p.name || '').trim() || 'Your Name';
    var contactParts = [p.email, p.phone, p.location].filter(Boolean).map(function (s) { return s.trim(); });
    var contact = contactParts.join(' · ') || 'Email · Phone · Location';

    var html = '<div class="resume-live-preview">';
    html += '<h1 class="resume-live-preview__name">' + escapeHtml(name) + '</h1>';
    html += '<p class="resume-live-preview__contact">' + escapeHtml(contact) + '</p>';

    if ((d.summary || '').trim()) {
      html += '<div class="resume-live-preview__section">';
      html += '<h2 class="resume-live-preview__section-title">Summary</h2>';
      html += '<div class="resume-live-preview__section-body">' + escapeHtml(d.summary) + '</div></div>';
    }

    var hasEducation = d.education && d.education.some(function (e) {
      return (e.degree || '').trim() || (e.school || '').trim() || (e.year || '').trim();
    });
    if (hasEducation) {
      html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Education</h2>';
      d.education.forEach(function (e) {
        if ((e.degree || '').trim() || (e.school || '').trim() || (e.year || '').trim()) {
          html += '<div class="resume-live-preview__item">';
          html += '<div class="resume-live-preview__item-title">' + escapeHtml(e.degree || '') + '</div>';
          html += '<div class="resume-live-preview__item-meta">' + escapeHtml([e.school, e.location, e.year].filter(Boolean).join(' · ')) + '</div></div>';
        }
      });
      html += '</div>';
    }

    var hasExperience = d.experience && d.experience.some(function (e) {
      return (e.title || '').trim() || (e.company || '').trim();
    });
    if (hasExperience) {
      html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Experience</h2>';
      d.experience.forEach(function (e) {
        if ((e.title || '').trim() || (e.company || '').trim()) {
          html += '<div class="resume-live-preview__item">';
          html += '<div class="resume-live-preview__item-title">' + escapeHtml(e.title || '') + '</div>';
          html += '<div class="resume-live-preview__item-meta">' + escapeHtml(e.company || '') + (e.period ? ' · ' + escapeHtml(e.period) : '') + '</div>';
          if ((e.description || '').trim()) html += '<p class="resume-live-preview__item-desc">' + escapeHtml(e.description) + '</p>';
          html += '</div>';
        }
      });
      html += '</div>';
    }

    var hasProjects = d.projects && d.projects.some(function (e) {
      return (e.name || '').trim() || (e.description || '').trim();
    });
    if (hasProjects) {
      html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Projects</h2>';
      d.projects.forEach(function (e) {
        if ((e.name || '').trim() || (e.description || '').trim()) {
          html += '<div class="resume-live-preview__item">';
          html += '<div class="resume-live-preview__item-title">' + escapeHtml(e.name || '') + '</div>';
          if ((e.description || '').trim()) html += '<p class="resume-live-preview__item-desc">' + escapeHtml(e.description) + '</p>';
          html += '</div>';
        }
      });
      html += '</div>';
    }

    if ((d.skills || '').trim()) {
      html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Skills</h2>';
      html += '<div class="resume-live-preview__section-body">' + escapeHtml(d.skills) + '</div></div>';
    }

    var links = d.links || {};
    var hasLinks = (links.github || '').trim() || (links.linkedin || '').trim();
    if (hasLinks) {
      var linkParts = [];
      if ((links.github || '').trim()) linkParts.push('GitHub');
      if ((links.linkedin || '').trim()) linkParts.push('LinkedIn');
      html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Links</h2>';
      html += '<div class="resume-live-preview__section-body">' + linkParts.join(' · ') + '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function renderPreviewPage(container) {
    if (!container) return;
    var d = getResumeData();
    var p = d.personal || {};
    var name = (p.name || '').trim();
    var contactParts = [p.email, p.phone, p.location].filter(Boolean).map(function (s) { return s.trim(); });
    var contact = contactParts.join(' · ');

    if (!name && !contact && !(d.summary || '').trim() && (!d.education || !d.education.length) && (!d.experience || !d.experience.length)) {
      container.innerHTML = '<div class="resume-preview-page__empty">No resume data yet. <a href="builder.html">Go to Builder</a> to add content.</div>';
      return;
    }

    var html = '<div class="resume-preview-page__inner">';
    html += '<h1 class="resume-preview-page__name">' + (name ? escapeHtml(name) : 'Your Name') + '</h1>';
    html += '<p class="resume-preview-page__contact">' + (contact ? escapeHtml(contact) : '') + '</p>';

    if ((d.summary || '').trim()) {
      html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Summary</h2>';
      html += '<div class="resume-preview-page__section-body"><p class="resume-preview-page__item-desc">' + escapeHtml(d.summary) + '</p></div></div>';
    }

    if (d.education && d.education.length) {
      html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Education</h2><div class="resume-preview-page__section-body">';
      d.education.forEach(function (e) {
        html += '<div class="resume-preview-page__item">';
        html += '<div class="resume-preview-page__item-title">' + escapeHtml(e.degree || '') + '</div>';
        html += '<div class="resume-preview-page__item-meta">' + escapeHtml([e.school, e.location, e.year].filter(Boolean).join(' · ')) + '</div></div>';
      });
      html += '</div></div>';
    }

    if (d.experience && d.experience.length) {
      html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Experience</h2><div class="resume-preview-page__section-body">';
      d.experience.forEach(function (e) {
        html += '<div class="resume-preview-page__item">';
        html += '<div class="resume-preview-page__item-title">' + escapeHtml(e.title || '') + '</div>';
        html += '<div class="resume-preview-page__item-meta">' + escapeHtml(e.company || '') + (e.period ? ' · ' + escapeHtml(e.period) : '') + '</div>';
        if ((e.description || '').trim()) html += '<p class="resume-preview-page__item-desc">' + escapeHtml(e.description) + '</p>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    if (d.projects && d.projects.length) {
      html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Projects</h2><div class="resume-preview-page__section-body">';
      d.projects.forEach(function (e) {
        html += '<div class="resume-preview-page__item">';
        html += '<div class="resume-preview-page__item-title">' + escapeHtml(e.name || '') + '</div>';
        if ((e.description || '').trim()) html += '<p class="resume-preview-page__item-desc">' + escapeHtml(e.description) + '</p>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    if ((d.skills || '').trim()) {
      html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Skills</h2>';
      html += '<div class="resume-preview-page__section-body">' + escapeHtml(d.skills) + '</div></div>';
    }

    var links = d.links || {};
    if ((links.github || '').trim() || (links.linkedin || '').trim()) {
      html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Links</h2><div class="resume-preview-page__section-body">';
      if ((links.github || '').trim()) html += 'GitHub · ';
      if ((links.linkedin || '').trim()) html += 'LinkedIn';
      html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  window.ResumeApp = {
    getEmptyResume: getEmptyResume,
    getSampleResume: getSampleResume,
    getResumeData: getResumeData,
    setResumeData: setResumeData,
    getTemplate: getTemplate,
    setTemplate: setTemplate,
    getTopImprovements: getTopImprovements,
    getBulletGuidance: getBulletGuidance,
    computeATSScore: computeATSScore,
    renderLivePreview: renderLivePreview,
    renderPreviewPage: renderPreviewPage,
    escapeHtml: escapeHtml
  };
})();

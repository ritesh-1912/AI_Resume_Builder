/**
 * AI Resume Builder — Resume App
 * Data model, localStorage, sample data, live preview sync, preview page render.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'resumeBuilderData';

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
    } else {
      html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Summary</h2>';
      html += '<p class="resume-live-preview__placeholder">Brief professional summary…</p></div>';
    }

    html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Education</h2>';
    if (d.education && d.education.length) {
      d.education.forEach(function (e) {
        html += '<div class="resume-live-preview__item">';
        html += '<div class="resume-live-preview__item-title">' + escapeHtml(e.degree || '') + '</div>';
        html += '<div class="resume-live-preview__item-meta">' + escapeHtml([e.school, e.location, e.year].filter(Boolean).join(' · ')) + '</div></div>';
      });
    } else {
      html += '<p class="resume-live-preview__placeholder">Degree, School, Year</p>';
    }
    html += '</div>';

    html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Experience</h2>';
    if (d.experience && d.experience.length) {
      d.experience.forEach(function (e) {
        html += '<div class="resume-live-preview__item">';
        html += '<div class="resume-live-preview__item-title">' + escapeHtml(e.title || '') + '</div>';
        html += '<div class="resume-live-preview__item-meta">' + escapeHtml(e.company || '') + (e.period ? ' · ' + e.period : '') + '</div>';
        if ((e.description || '').trim()) html += '<p class="resume-live-preview__item-desc">' + escapeHtml(e.description) + '</p>';
        html += '</div>';
      });
    } else {
      html += '<p class="resume-live-preview__placeholder">Title, Company, Period, Description</p>';
    }
    html += '</div>';

    html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Projects</h2>';
    if (d.projects && d.projects.length) {
      d.projects.forEach(function (e) {
        html += '<div class="resume-live-preview__item">';
        html += '<div class="resume-live-preview__item-title">' + escapeHtml(e.name || '') + '</div>';
        if ((e.description || '').trim()) html += '<p class="resume-live-preview__item-desc">' + escapeHtml(e.description) + '</p>';
        html += '</div>';
      });
    } else {
      html += '<p class="resume-live-preview__placeholder">Project name, description</p>';
    }
    html += '</div>';

    html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Skills</h2>';
    html += '<div class="resume-live-preview__section-body">' + (d.skills ? escapeHtml(d.skills) : '<span class="resume-live-preview__placeholder">Comma-separated skills</span>') + '</div></div>';

    var links = d.links || {};
    var linkParts = [];
    if ((links.github || '').trim()) linkParts.push('GitHub');
    if ((links.linkedin || '').trim()) linkParts.push('LinkedIn');
    html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Links</h2>';
    html += '<div class="resume-live-preview__section-body">' + (linkParts.length ? linkParts.join(' · ') : '<span class="resume-live-preview__placeholder">GitHub, LinkedIn</span>') + '</div></div>';

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
    renderLivePreview: renderLivePreview,
    renderPreviewPage: renderPreviewPage,
    escapeHtml: escapeHtml
  };
})();

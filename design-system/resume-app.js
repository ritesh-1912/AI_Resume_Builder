/**
 * AI Resume Builder — Resume App
 * Data model, localStorage, sample data, live preview sync, preview page render.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'resumeBuilderData';
  var TEMPLATE_KEY = 'resumeBuilderTemplate';
  var THEME_COLOR_KEY = 'resumeBuilderThemeColor';
  var ACTION_VERBS = /^(Built|Developed|Designed|Implemented|Led|Improved|Created|Optimized|Automated)\b/i;
  var NUMBER_RE = /\d|%|\b[kKmMxX]\b/;

  var THEME_COLORS = {
    teal: 'hsl(168, 60%, 40%)',
    navy: 'hsl(220, 60%, 35%)',
    burgundy: 'hsl(345, 60%, 35%)',
    forest: 'hsl(150, 50%, 30%)',
    charcoal: 'hsl(0, 0%, 25%)'
  };

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

  function getThemeColor() {
    try {
      var c = localStorage.getItem(THEME_COLOR_KEY);
      if (THEME_COLORS[c]) return c;
    } catch (e) {}
    return 'teal';
  }

  function setThemeColor(key) {
    if (!THEME_COLORS[key]) return;
    try { localStorage.setItem(THEME_COLOR_KEY, key); } catch (e) {}
  }

  function getThemeColorHsl(key) {
    return THEME_COLORS[key || getThemeColor()] || THEME_COLORS.teal;
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
    var skillsCount = 0;
    if (d.skills && typeof d.skills === 'object') {
      skillsCount = (d.skills.technical || []).length + (d.skills.softSkills || []).length + (d.skills.tools || []).length;
    }
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
      skills: { technical: [], softSkills: [], tools: [] },
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
        { name: 'Design System', description: 'Component library and tokens. Used across 4 product teams.', techStack: ['React', 'TypeScript'], liveUrl: '', githubUrl: 'https://github.com/example/design-system' },
        { name: 'Resume Builder', description: 'Side project: structured resume editor with live preview.', techStack: ['React', 'Node.js'], liveUrl: 'https://resume-demo.example.com', githubUrl: 'https://github.com/example' }
      ],
      skills: {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
        softSkills: ['Team Leadership', 'Problem Solving'],
        tools: ['Git', 'Docker', 'AWS', 'Figma']
      },
      links: { github: 'https://github.com/jordanchen', linkedin: 'https://linkedin.com/in/jordanchen' }
    };
  }

  function normalizeResumeData(data) {
    if (!data) return getEmptyResume();
    if (typeof data.skills === 'string') {
      var arr = (data.skills || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      data.skills = { technical: arr.slice(), softSkills: [], tools: [] };
    }
    if (!data.skills || !data.skills.technical) data.skills = data.skills || { technical: [], softSkills: [], tools: [] };
    if (!Array.isArray(data.skills.technical)) data.skills.technical = [];
    if (!Array.isArray(data.skills.softSkills)) data.skills.softSkills = [];
    if (!Array.isArray(data.skills.tools)) data.skills.tools = [];
    (data.projects || []).forEach(function (p) {
      if (!Array.isArray(p.techStack)) p.techStack = [];
      if (p.liveUrl === undefined) p.liveUrl = '';
      if (p.githubUrl === undefined) p.githubUrl = (p.link || '');
    });
    return data;
  }

  function getResumeData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        return normalizeResumeData(data);
      }
    } catch (e) {}
    return getEmptyResume();
  }

  function setResumeData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getSuggestedSkills() {
    return {
      technical: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
      softSkills: ['Team Leadership', 'Problem Solving'],
      tools: ['Git', 'Docker', 'AWS']
    };
  }

  /**
   * ATS Score: deterministic 0–100.
   * +10 name, +10 email, +10 summary > 50 chars, +15 ≥1 experience with bullets,
   * +10 ≥1 education, +10 ≥5 skills, +10 ≥1 project, +5 phone, +5 LinkedIn, +5 GitHub,
   * +10 summary contains action verbs.
   * Returns { score, suggestions } where suggestions list missing items with point values.
   */
  function computeATSScore(data) {
    var d = data || getEmptyResume();
    var score = 0;
    var suggestions = [];
    var p = d.personal || {};
    var links = d.links || {};

    if ((p.name || '').trim()) score += 10;
    else suggestions.push('Add your name (+10 points)');

    if ((p.email || '').trim()) score += 10;
    else suggestions.push('Add your email (+10 points)');

    var summaryText = (d.summary || '').trim();
    if (summaryText.length > 50) score += 10;
    else suggestions.push('Add a professional summary over 50 characters (+10 points)');

    var hasExpWithBullets = (d.experience || []).some(function (e) {
      return ((e.description || '').trim().length > 0);
    });
    if (hasExpWithBullets) score += 15;
    else suggestions.push('Add at least 1 experience entry with bullets (+15 points)');

    var hasEducation = (d.education || []).length >= 1;
    if (hasEducation) score += 10;
    else suggestions.push('Add at least 1 education entry (+10 points)');

    var skillsCount = 0;
    if (d.skills && typeof d.skills === 'object') {
      skillsCount = (d.skills.technical || []).length + (d.skills.softSkills || []).length + (d.skills.tools || []).length;
    }
    if (skillsCount >= 5) score += 10;
    else suggestions.push('Add at least 5 skills (+10 points)');

    var projectCount = (d.projects && d.projects.length) || 0;
    if (projectCount >= 1) score += 10;
    else suggestions.push('Add at least 1 project (+10 points)');

    if ((p.phone || '').trim()) score += 5;
    else suggestions.push('Add your phone (+5 points)');

    if ((links.linkedin || '').trim()) score += 5;
    else suggestions.push('Add LinkedIn link (+5 points)');

    if ((links.github || '').trim()) score += 5;
    else suggestions.push('Add GitHub link (+5 points)');

    if (ACTION_VERBS.test(summaryText)) score += 10;
    else suggestions.push('Use action verbs in summary (e.g. built, led, designed) (+10 points)');

    score = Math.min(100, score);
    return { score: score, suggestions: suggestions };
  }

  /**
   * ATS band label for score: 0–40 Needs Work, 41–70 Getting There, 71–100 Strong Resume.
   */
  function getATSBand(score) {
    if (score <= 40) return { label: 'Needs Work', level: 'low' };
    if (score <= 70) return { label: 'Getting There', level: 'medium' };
    return { label: 'Strong Resume', level: 'high' };
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

    var template = getTemplate();
    var isModern = template === 'modern';
    var html;

    if (isModern) {
      html = '<div class="resume-live-preview resume-live-preview--modern">';
      html += '<div class="resume-live-preview__sidebar">';
      html += '<h1 class="resume-live-preview__name">' + escapeHtml(name) + '</h1>';
      html += '<p class="resume-live-preview__contact">' + escapeHtml(contact) + '</p>';
      var sk = d.skills && typeof d.skills === 'object' ? d.skills : { technical: [], softSkills: [], tools: [] };
      var hasAnySkills = (sk.technical && sk.technical.length) || (sk.softSkills && sk.softSkills.length) || (sk.tools && sk.tools.length);
      if (hasAnySkills) {
        html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Skills</h2>';
        if (sk.technical && sk.technical.length) {
          html += '<div class="resume-live-preview__skill-group"><span class="resume-live-preview__skill-group-label">Technical</span><div class="resume-live-preview__pills">';
          sk.technical.forEach(function (t) { html += '<span class="resume-live-preview__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        if (sk.softSkills && sk.softSkills.length) {
          html += '<div class="resume-live-preview__skill-group"><span class="resume-live-preview__skill-group-label">Soft</span><div class="resume-live-preview__pills">';
          sk.softSkills.forEach(function (t) { html += '<span class="resume-live-preview__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        if (sk.tools && sk.tools.length) {
          html += '<div class="resume-live-preview__skill-group"><span class="resume-live-preview__skill-group-label">Tools</span><div class="resume-live-preview__pills">';
          sk.tools.forEach(function (t) { html += '<span class="resume-live-preview__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        html += '</div>';
      }
      var links = d.links || {};
      if ((links.github || '').trim() || (links.linkedin || '').trim()) {
        var linkParts = [];
        if ((links.github || '').trim()) linkParts.push('GitHub');
        if ((links.linkedin || '').trim()) linkParts.push('LinkedIn');
        html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Links</h2>';
        html += '<div class="resume-live-preview__section-body">' + linkParts.join(' · ') + '</div></div>';
      }
      html += '</div>';
      html += '<div class="resume-live-preview__main">';
    } else {
      html = '<div class="resume-live-preview">';
    }

    if (!isModern) {
      html += '<h1 class="resume-live-preview__name">' + escapeHtml(name) + '</h1>';
      html += '<p class="resume-live-preview__contact">' + escapeHtml(contact) + '</p>';
    }

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
          html += '<div class="resume-live-preview__card">';
          html += '<div class="resume-live-preview__item-title">' + escapeHtml(e.name || '') + '</div>';
          if ((e.description || '').trim()) html += '<p class="resume-live-preview__item-desc">' + escapeHtml(e.description) + '</p>';
          if (e.techStack && e.techStack.length) {
            html += '<div class="resume-live-preview__pills">';
            e.techStack.forEach(function (t) { html += '<span class="resume-live-preview__pill">' + escapeHtml(t) + '</span>'; });
            html += '</div>';
          }
          if ((e.liveUrl || '').trim() || (e.githubUrl || '').trim()) {
            html += '<div class="resume-live-preview__links">';
            if ((e.liveUrl || '').trim()) html += '<span class="resume-live-preview__link-icon" title="Live">&#128279;</span>';
            if ((e.githubUrl || '').trim()) html += '<span class="resume-live-preview__link-icon" title="GitHub">&#128279;</span>';
            html += '</div>';
          }
          html += '</div>';
        }
      });
      html += '</div>';
    }

    if (!isModern) {
      var sk = d.skills && typeof d.skills === 'object' ? d.skills : { technical: [], softSkills: [], tools: [] };
      var hasAnySkills = (sk.technical && sk.technical.length) || (sk.softSkills && sk.softSkills.length) || (sk.tools && sk.tools.length);
      if (hasAnySkills) {
        html += '<div class="resume-live-preview__section"><h2 class="resume-live-preview__section-title">Skills</h2>';
        if (sk.technical && sk.technical.length) {
          html += '<div class="resume-live-preview__skill-group"><span class="resume-live-preview__skill-group-label">Technical Skills</span><div class="resume-live-preview__pills">';
          sk.technical.forEach(function (t) { html += '<span class="resume-live-preview__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        if (sk.softSkills && sk.softSkills.length) {
          html += '<div class="resume-live-preview__skill-group"><span class="resume-live-preview__skill-group-label">Soft Skills</span><div class="resume-live-preview__pills">';
          sk.softSkills.forEach(function (t) { html += '<span class="resume-live-preview__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        if (sk.tools && sk.tools.length) {
          html += '<div class="resume-live-preview__skill-group"><span class="resume-live-preview__skill-group-label">Tools & Technologies</span><div class="resume-live-preview__pills">';
          sk.tools.forEach(function (t) { html += '<span class="resume-live-preview__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        html += '</div>';
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
    }

    if (isModern) html += '</div>';
    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Plain-text version for copy. Sections: Name, Contact, Summary, Education, Experience, Projects, Skills, Links.
   */
  function getResumeAsPlainText(data) {
    var d = data || getResumeData();
    var p = d.personal || {};
    var lines = [];
    var name = (p.name || '').trim() || 'Your Name';
    lines.push(name);
    var contactParts = [p.email, p.phone, p.location].filter(Boolean).map(function (s) { return s.trim(); });
    if (contactParts.length) lines.push(contactParts.join(' · '));
    lines.push('');

    if ((d.summary || '').trim()) {
      lines.push('Summary');
      lines.push((d.summary || '').trim());
      lines.push('');
    }

    if (d.education && d.education.length) {
      lines.push('Education');
      d.education.forEach(function (e) {
        var parts = [e.degree, e.school, e.location, e.year].filter(Boolean).map(function (s) { return (s || '').trim(); }).filter(Boolean);
        if (parts.length) lines.push(parts.join(' · '));
      });
      lines.push('');
    }

    if (d.experience && d.experience.length) {
      lines.push('Experience');
      d.experience.forEach(function (e) {
        lines.push((e.title || '') + (e.company ? ' — ' + e.company : '') + (e.period ? ' · ' + e.period : ''));
        if ((e.description || '').trim()) lines.push((e.description || '').trim());
      });
      lines.push('');
    }

    if (d.projects && d.projects.length) {
      lines.push('Projects');
      d.projects.forEach(function (e) {
        if ((e.name || '').trim()) lines.push(e.name);
        if ((e.description || '').trim()) lines.push((e.description || '').trim());
        if (e.techStack && e.techStack.length) lines.push(e.techStack.join(', '));
      });
      lines.push('');
    }

    var sk = d.skills && typeof d.skills === 'object' ? d.skills : { technical: [], softSkills: [], tools: [] };
    if ((sk.technical && sk.technical.length) || (sk.softSkills && sk.softSkills.length) || (sk.tools && sk.tools.length)) {
      lines.push('Skills');
      if (sk.technical && sk.technical.length) lines.push('Technical: ' + sk.technical.join(', '));
      if (sk.softSkills && sk.softSkills.length) lines.push('Soft: ' + sk.softSkills.join(', '));
      if (sk.tools && sk.tools.length) lines.push('Tools: ' + sk.tools.join(', '));
      lines.push('');
    }

    var links = d.links || {};
    if ((links.github || '').trim() || (links.linkedin || '').trim()) {
      lines.push('Links');
      if ((links.github || '').trim()) lines.push('GitHub: ' + (links.github || '').trim());
      if ((links.linkedin || '').trim()) lines.push('LinkedIn: ' + (links.linkedin || '').trim());
    }

    return lines.join('\n');
  }

  /**
   * Returns warning message if name missing or (no project and no experience). Does not block export.
   */
  function getExportValidationWarning(data) {
    var d = data || getResumeData();
    var p = d.personal || {};
    var hasName = !!((p.name || '').trim());
    var hasProject = d.projects && d.projects.length > 0;
    var hasExperience = d.experience && d.experience.length > 0;
    if (!hasName || (!hasProject && !hasExperience)) return 'Your resume may look incomplete.';
    return null;
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

    var template = getTemplate();
    var isModern = template === 'modern';
    var html;

    if (isModern) {
      html = '<div class="resume-preview-page__inner resume-preview-page__inner--modern">';
      html += '<div class="resume-preview-page__sidebar">';
      html += '<h1 class="resume-preview-page__name">' + (name ? escapeHtml(name) : 'Your Name') + '</h1>';
      html += '<p class="resume-preview-page__contact">' + (contact ? escapeHtml(contact) : '') + '</p>';
      var sk = d.skills && typeof d.skills === 'object' ? d.skills : { technical: [], softSkills: [], tools: [] };
      if ((sk.technical && sk.technical.length) || (sk.softSkills && sk.softSkills.length) || (sk.tools && sk.tools.length)) {
        html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Skills</h2><div class="resume-preview-page__section-body">';
        if (sk.technical && sk.technical.length) {
          html += '<div class="resume-preview-page__skill-group"><span class="resume-preview-page__skill-group-label">Technical</span><div class="resume-preview-page__pills">';
          sk.technical.forEach(function (t) { html += '<span class="resume-preview-page__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        if (sk.softSkills && sk.softSkills.length) {
          html += '<div class="resume-preview-page__skill-group"><span class="resume-preview-page__skill-group-label">Soft</span><div class="resume-preview-page__pills">';
          sk.softSkills.forEach(function (t) { html += '<span class="resume-preview-page__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        if (sk.tools && sk.tools.length) {
          html += '<div class="resume-preview-page__skill-group"><span class="resume-preview-page__skill-group-label">Tools</span><div class="resume-preview-page__pills">';
          sk.tools.forEach(function (t) { html += '<span class="resume-preview-page__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        html += '</div></div>';
      }
      var links = d.links || {};
      if ((links.github || '').trim() || (links.linkedin || '').trim()) {
        html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Links</h2><div class="resume-preview-page__section-body">';
        if ((links.github || '').trim()) html += 'GitHub · ';
        if ((links.linkedin || '').trim()) html += 'LinkedIn';
        html += '</div></div>';
      }
      html += '</div>';
      html += '<div class="resume-preview-page__main">';
    } else {
      html = '<div class="resume-preview-page__inner">';
      html += '<h1 class="resume-preview-page__name">' + (name ? escapeHtml(name) : 'Your Name') + '</h1>';
      html += '<p class="resume-preview-page__contact">' + (contact ? escapeHtml(contact) : '') + '</p>';
    }

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
        html += '<div class="resume-preview-page__card">';
        html += '<div class="resume-preview-page__item-title">' + escapeHtml(e.name || '') + '</div>';
        if ((e.description || '').trim()) html += '<p class="resume-preview-page__item-desc">' + escapeHtml(e.description) + '</p>';
        if (e.techStack && e.techStack.length) {
          html += '<div class="resume-preview-page__pills">';
          e.techStack.forEach(function (t) { html += '<span class="resume-preview-page__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div>';
        }
        if ((e.liveUrl || '').trim() || (e.githubUrl || '').trim()) {
          html += '<div class="resume-preview-page__links">';
          if ((e.liveUrl || '').trim()) html += '<a href="' + escapeHtml(e.liveUrl) + '" target="_blank" rel="noopener" class="resume-preview-page__link-icon" title="Live">&#128279;</a>';
          if ((e.githubUrl || '').trim()) html += '<a href="' + escapeHtml(e.githubUrl) + '" target="_blank" rel="noopener" class="resume-preview-page__link-icon" title="GitHub">&#128279;</a>';
          html += '</div>';
        }
        html += '</div>';
      });
      html += '</div></div>';
    }

    if (!isModern) {
      var sk = d.skills && typeof d.skills === 'object' ? d.skills : { technical: [], softSkills: [], tools: [] };
      var hasAnySkills = (sk.technical && sk.technical.length) || (sk.softSkills && sk.softSkills.length) || (sk.tools && sk.tools.length);
      if (hasAnySkills) {
        html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Skills</h2><div class="resume-preview-page__section-body">';
        if (sk.technical && sk.technical.length) {
          html += '<div class="resume-preview-page__skill-group"><span class="resume-preview-page__skill-group-label">Technical Skills</span><div class="resume-preview-page__pills">';
          sk.technical.forEach(function (t) { html += '<span class="resume-preview-page__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        if (sk.softSkills && sk.softSkills.length) {
          html += '<div class="resume-preview-page__skill-group"><span class="resume-preview-page__skill-group-label">Soft Skills</span><div class="resume-preview-page__pills">';
          sk.softSkills.forEach(function (t) { html += '<span class="resume-preview-page__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        if (sk.tools && sk.tools.length) {
          html += '<div class="resume-preview-page__skill-group"><span class="resume-preview-page__skill-group-label">Tools & Technologies</span><div class="resume-preview-page__pills">';
          sk.tools.forEach(function (t) { html += '<span class="resume-preview-page__pill">' + escapeHtml(t) + '</span>'; });
          html += '</div></div>';
        }
        html += '</div></div>';
      }
      var links = d.links || {};
      if ((links.github || '').trim() || (links.linkedin || '').trim()) {
        html += '<div class="resume-preview-page__section"><h2 class="resume-preview-page__section-title">Links</h2><div class="resume-preview-page__section-body">';
        if ((links.github || '').trim()) html += 'GitHub · ';
        if ((links.linkedin || '').trim()) html += 'LinkedIn';
        html += '</div></div>';
      }
    }

    if (isModern) html += '</div>';
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
    getThemeColor: getThemeColor,
    setThemeColor: setThemeColor,
    getThemeColorHsl: getThemeColorHsl,
    THEME_COLORS: THEME_COLORS,
    getTopImprovements: getTopImprovements,
    getBulletGuidance: getBulletGuidance,
    computeATSScore: computeATSScore,
    getATSBand: getATSBand,
    getResumeAsPlainText: getResumeAsPlainText,
    getExportValidationWarning: getExportValidationWarning,
    getSuggestedSkills: getSuggestedSkills,
    normalizeResumeData: normalizeResumeData,
    renderLivePreview: renderLivePreview,
    renderPreviewPage: renderPreviewPage,
    escapeHtml: escapeHtml
  };
})();

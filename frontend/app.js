/**
 * Hackathon AI Mentor - Frontend Client Application
 * 
 * Provides interactive form submission, client-side validation,
 * exact POST /api/mentor integration, DOM-safe rendering of all
 * 11 dashboard sections, explicit dev mock mode, and export tools.
 */

(function () {
  'use strict';

  // ==========================================================================
  // Application State & Configuration
  // ==========================================================================

  const state = {
    // Isolated Mock Mode (disabled by default as per requirements)
    mockMode: false,
    isSubmitting: false,
    lastPlanData: null,
    activeTab: 'all',
    completedTasks: new Set(),
    checkedDemoItems: new Set()
  };

  // Determine API base URL (supports both same-origin and localhost:3000 fallback)
  const API_ENDPOINT = (window.location.protocol === 'file:')
    ? 'http://localhost:3000/api/mentor'
    : '/api/mentor';

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const elements = {
    // Form & Inputs
    form: document.getElementById('mentorForm'),
    problemStatement: document.getElementById('problemStatement'),
    teamSize: document.getElementById('teamSize'),
    timeLimit: document.getElementById('timeLimit'),
    submitBtn: document.getElementById('submitBtn'),
    resetBtn: document.getElementById('resetBtn'),
    charCount: document.getElementById('charCount'),
    formCard: document.getElementById('formCard'),

    // Validation Errors
    problemError: document.getElementById('problemError'),
    teamSizeError: document.getElementById('teamSizeError'),
    timeLimitError: document.getElementById('timeLimitError'),

    // Header & Toggles
    backendBadge: document.getElementById('backendBadge'),
    statusDot: document.getElementById('statusDot'),
    statusLabel: document.getElementById('statusLabel'),
    mockModeToggle: document.getElementById('mockModeToggle'),

    // Alert Banner
    alertBox: document.getElementById('alertBox'),
    alertTitle: document.getElementById('alertTitle'),
    alertMessage: document.getElementById('alertMessage'),
    alertActions: document.getElementById('alertActions'),
    alertCloseBtn: document.getElementById('alertCloseBtn'),

    // Loading State
    loadingCard: document.getElementById('loadingCard'),
    loadingStepText: document.getElementById('loadingStepText'),

    // Results Dashboard
    resultsDashboard: document.getElementById('resultsDashboard'),
    summaryProblemTitle: document.getElementById('summaryProblemTitle'),
    metaTeamSize: document.getElementById('metaTeamSize'),
    metaTimeLimit: document.getElementById('metaTimeLimit'),
    metaMockPill: document.getElementById('metaMockPill'),
    editProblemBtn: document.getElementById('editProblemBtn'),
    copyPlanBtn: document.getElementById('copyPlanBtn'),
    copyBtnText: document.getElementById('copyBtnText'),
    printPlanBtn: document.getElementById('printPlanBtn'),
    bottomNewProblemBtn: document.getElementById('bottomNewProblemBtn'),

    // Result Sections
    problemSummaryContent: document.getElementById('problemSummaryContent'),
    targetUsersList: document.getElementById('targetUsersList'),
    userNeedsList: document.getElementById('userNeedsList'),
    suggestedFeaturesGrid: document.getElementById('suggestedFeaturesGrid'),
    mvpPlanList: document.getElementById('mvpPlanList'),
    techStackContainer: document.getElementById('techStackContainer'),
    devTasksContainer: document.getElementById('devTasksContainer'),
    taskProgressCount: document.getElementById('taskProgressCount'),
    validationCheckpointsContainer: document.getElementById('validationCheckpointsContainer'),
    testCasesContainer: document.getElementById('testCasesContainer'),
    demoChecklistContainer: document.getElementById('demoChecklistContainer'),
    juryPresentationContainer: document.getElementById('juryPresentationContainer')
  };

  // ==========================================================================
  // DOM-Safe Helper Utilities (XSS Prevention)
  // ==========================================================================

  /**
   * Safely create an HTML element with class and textContent
   */
  function createSafeElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent !== undefined && textContent !== null) {
      el.textContent = String(textContent);
    }
    return el;
  }

  /**
   * Safely clear all children from an element
   */
  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  // ==========================================================================
  // Alert & Notification Management
  // ==========================================================================

  function showAlert(title, message, type = 'error', actions = []) {
    if (!elements.alertBox) return;

    elements.alertBox.className = `alert-box ${type}`;
    elements.alertTitle.textContent = title;
    elements.alertMessage.textContent = message;

    clearElement(elements.alertActions);
    if (actions && actions.length > 0) {
      actions.forEach(action => {
        const btn = createSafeElement('button', 'btn btn-secondary btn-sm', action.label);
        btn.type = 'button';
        btn.addEventListener('click', action.onClick);
        elements.alertActions.appendChild(btn);
      });
    }

    elements.alertBox.classList.remove('hidden');
    elements.alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (elements.alertBox) {
      elements.alertBox.classList.add('hidden');
    }
  }

  if (elements.alertCloseBtn) {
    elements.alertCloseBtn.addEventListener('click', hideAlert);
  }

  // ==========================================================================
  // Form Validation
  // ==========================================================================

  function validateForm() {
    let isValid = true;
    hideAlert();

    // Reset field errors
    [elements.problemStatement, elements.teamSize, elements.timeLimit].forEach(input => {
      if (input) input.classList.remove('is-invalid');
    });
    if (elements.problemError) elements.problemError.classList.remove('active');
    if (elements.teamSizeError) elements.teamSizeError.classList.remove('active');
    if (elements.timeLimitError) elements.timeLimitError.classList.remove('active');

    // 1. Problem Statement Validation
    const problemText = elements.problemStatement.value.trim();
    if (!problemText) {
      elements.problemStatement.classList.add('is-invalid');
      elements.problemError.textContent = 'Please enter a problem statement.';
      elements.problemError.classList.add('active');
      isValid = false;
    } else if (problemText.length < 10) {
      elements.problemStatement.classList.add('is-invalid');
      elements.problemError.textContent = 'Problem statement must be at least 10 characters long.';
      elements.problemError.classList.add('active');
      isValid = false;
    }

    // 2. Team Size Validation
    const teamSizeVal = parseInt(elements.teamSize.value, 10);
    if (isNaN(teamSizeVal) || teamSizeVal < 1 || teamSizeVal > 20) {
      elements.teamSize.classList.add('is-invalid');
      elements.teamSizeError.textContent = 'Team size must be a number between 1 and 20.';
      elements.teamSizeError.classList.add('active');
      isValid = false;
    }

    // 3. Time Limit Validation
    const timeLimitVal = parseInt(elements.timeLimit.value, 10);
    if (isNaN(timeLimitVal) || timeLimitVal < 15 || timeLimitVal > 2880) {
      elements.timeLimit.classList.add('is-invalid');
      elements.timeLimitError.textContent = 'Time limit must be between 15 and 2880 minutes (48 hours).';
      elements.timeLimitError.classList.add('active');
      isValid = false;
    }

    if (!isValid) {
      showAlert('Form Incomplete', 'Please correct the highlighted fields before generating your plan.', 'error');
    }

    return isValid;
  }

  // Character Counter for textarea
  if (elements.problemStatement) {
    elements.problemStatement.addEventListener('input', function () {
      const len = this.value.length;
      elements.charCount.textContent = `${len} character${len === 1 ? '' : 's'}`;
      if (this.classList.contains('is-invalid') && this.value.trim().length >= 10) {
        this.classList.remove('is-invalid');
        elements.problemError.classList.remove('active');
      }
    });
  }

  // Example Prompt Chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const problemText = this.getAttribute('data-problem');
      if (problemText && elements.problemStatement) {
        elements.problemStatement.value = problemText;
        elements.problemStatement.dispatchEvent(new Event('input'));
        elements.problemStatement.focus();
      }
    });
  });

  // Time Preset Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const timeVal = this.getAttribute('data-time');
      if (timeVal && elements.timeLimit) {
        elements.timeLimit.value = timeVal;
      }
    });
  });

  // Reset Form
  if (elements.resetBtn) {
    elements.resetBtn.addEventListener('click', function () {
      elements.form.reset();
      elements.teamSize.value = 5;
      elements.timeLimit.value = 90;
      elements.charCount.textContent = '0 characters';
      hideAlert();
      [elements.problemStatement, elements.teamSize, elements.timeLimit].forEach(input => {
        if (input) input.classList.remove('is-invalid');
      });
      if (elements.problemError) elements.problemError.classList.remove('active');
      if (elements.teamSizeError) elements.teamSizeError.classList.remove('active');
      if (elements.timeLimitError) elements.timeLimitError.classList.remove('active');
    });
  }

  // ==========================================================================
  // Mock Mode Toggle & Handling
  // ==========================================================================

  if (elements.mockModeToggle) {
    elements.mockModeToggle.checked = state.mockMode;
    elements.mockModeToggle.addEventListener('change', function () {
      state.mockMode = this.checked;
      updateStatusBadge();
      if (state.mockMode) {
        showAlert('Dev Mock Mode Enabled', 'Submitting will now simulate a full mentor plan locally. Useful for testing UI when the backend is offline.', 'warning');
      } else {
        hideAlert();
      }
    });
  }

  function updateStatusBadge() {
    if (state.mockMode) {
      elements.statusDot.className = 'status-dot amber';
      elements.statusLabel.textContent = 'Mock Mode (Local)';
    } else {
      elements.statusDot.className = 'status-dot green';
      elements.statusLabel.textContent = 'Live Backend Mode';
    }
  }
  updateStatusBadge();

  // ==========================================================================
  // Loading State Manager
  // ==========================================================================

  let loadingInterval = null;
  const loadingSteps = [
    'Analyzing problem statement & target beneficiaries...',
    'Scoping laser-focused MVP boundaries...',
    'Selecting optimal full-stack technology stack...',
    'Partitioning development tasks across team members...',
    'Designing validation checkpoints & milestone time gates...',
    'Crafting test scenarios & jury pitch outline...'
  ];

  function setLoading(isLoading) {
    state.isSubmitting = isLoading;
    if (isLoading) {
      elements.submitBtn.disabled = true;
      elements.loadingCard.classList.remove('hidden');
      elements.resultsDashboard.classList.add('hidden');
      elements.loadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      let stepIdx = 0;
      elements.loadingStepText.textContent = loadingSteps[0];
      loadingInterval = setInterval(() => {
        stepIdx = (stepIdx + 1) % loadingSteps.length;
        elements.loadingStepText.textContent = loadingSteps[stepIdx];
      }, 1400);
    } else {
      elements.submitBtn.disabled = false;
      elements.loadingCard.classList.add('hidden');
      if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
      }
    }
  }

  // ==========================================================================
  // API Call & Submission Handler
  // ==========================================================================

  elements.form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    const requestPayload = {
      problem_statement: elements.problemStatement.value.trim(),
      team_size: parseInt(elements.teamSize.value, 10),
      time_limit_minutes: parseInt(elements.timeLimit.value, 10)
    };

    setLoading(true);

    try {
      let data;

      if (state.mockMode) {
        // Dev Mock Mode is explicitly active
        data = await getSimulatedMentorPlan(requestPayload);
      } else {
        // Live Fetch to Backend (Exact API contract)
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
          let errorDetail = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errJson = await response.json();
            if (errJson && errJson.error) {
              errorDetail = errJson.error;
            }
          } catch (_) {
            // response was not JSON
          }
          throw new Error(`Backend returned error: ${errorDetail}`);
        }

        data = await response.json();
      }

      // Validate returned contract structure
      if (!data || typeof data !== 'object') {
        throw new Error('Received malformed response: Expected JSON object.');
      }

      if (data.success !== true) {
        throw new Error(data.error || 'Backend indicated failure (success: false).');
      }

      if (!data.mentor || !data.plan || !data.demo) {
        throw new Error('Response is missing required keys ("mentor", "plan", or "demo").');
      }

      // Store in state and render
      state.lastPlanData = data;
      renderMentorPlan(data, state.mockMode);

    } catch (err) {
      console.error('Error generating mentor plan:', err);

      const isNetworkError = err.name === 'TypeError' || err.message.includes('fetch');
      const errorTitle = isNetworkError ? 'Backend Connection Offline' : 'Failed to Generate Plan';
      const errorMessage = isNetworkError
        ? `Could not connect to backend server at ${API_ENDPOINT}. Ensure the Node.js backend server is running on port 3000.`
        : err.message;

      const actions = [];
      // Provide an option to enable Dev Mock Mode if backend is not running
      if (!state.mockMode) {
        actions.push({
          label: 'Enable Dev Mock Mode to Preview UI',
          onClick: () => {
            elements.mockModeToggle.checked = true;
            state.mockMode = true;
            updateStatusBadge();
            hideAlert();
            elements.form.dispatchEvent(new Event('submit'));
          }
        });
      }
      actions.push({
        label: 'Retry Request',
        onClick: () => {
          hideAlert();
          elements.form.dispatchEvent(new Event('submit'));
        }
      });

      showAlert(errorTitle, errorMessage, 'error', actions);
    } finally {
      setLoading(false);
    }
  });

  // ==========================================================================
  // Safe DOM Rendering for All 11 Sections
  // ==========================================================================

  /**
   * Main render function that populates all 11 sections
   */
  function renderMentorPlan(data, isMock = false) {
    const { input, mentor, plan, demo } = data;

    // Reset task progress sets
    state.completedTasks.clear();
    state.checkedDemoItems.clear();

    // 1. Results Summary Bar
    if (elements.summaryProblemTitle) {
      elements.summaryProblemTitle.textContent = input && input.problem_statement
        ? input.problem_statement
        : elements.problemStatement.value.trim();
    }
    if (elements.metaTeamSize) {
      const size = (input && input.team_size) || elements.teamSize.value;
      elements.metaTeamSize.textContent = `👥 Team: ${size} members`;
    }
    if (elements.metaTimeLimit) {
      const time = (input && input.time_limit_minutes) || elements.timeLimit.value;
      elements.metaTimeLimit.textContent = `⏱️ Time Limit: ${time} minutes`;
    }
    if (elements.metaMockPill) {
      if (isMock) {
        elements.metaMockPill.classList.remove('hidden');
      } else {
        elements.metaMockPill.classList.add('hidden');
      }
    }

    // 2. Render each of the 11 Sections safely:

    // Section 1: Problem Summary (mentor.problem_summary)
    renderProblemSummary(mentor ? mentor.problem_summary : null);

    // Section 2: Target Users (mentor.users)
    renderTargetUsers(mentor ? mentor.users : []);

    // Section 3: User Needs (mentor.user_needs)
    renderUserNeeds(mentor ? mentor.user_needs : []);

    // Section 4: Suggested Features (mentor.features)
    renderSuggestedFeatures(mentor ? mentor.features : []);

    // Section 5: MVP Plan (plan.mvp_plan)
    renderMvpPlan(plan ? plan.mvp_plan : []);

    // Section 6: Recommended Tech Stack (plan.tech_stack)
    renderTechStack(plan ? plan.tech_stack : []);

    // Section 7: Development Tasks (plan.tasks)
    renderDevTasks(plan ? plan.tasks : []);

    // Section 8: Validation Checkpoints (plan.validation_checkpoints)
    renderValidationCheckpoints(plan ? plan.validation_checkpoints : []);

    // Section 9: Test Cases (demo.test_cases)
    renderTestCases(demo ? demo.test_cases : []);

    // Section 10: Demo Checklist (demo.demo_checklist)
    renderDemoChecklist(demo ? demo.demo_checklist : []);

    // Section 11: Jury Presentation Outline (demo.jury_presentation_outline)
    renderJuryPresentation(demo ? demo.jury_presentation_outline : []);

    // Show Results Dashboard
    elements.resultsDashboard.classList.remove('hidden');
    elements.resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --------------------------------------------------------------------------
  // 1. Problem Summary
  // --------------------------------------------------------------------------
  function renderProblemSummary(summary) {
    clearElement(elements.problemSummaryContent);
    if (!summary) {
      elements.problemSummaryContent.textContent = 'No problem summary provided.';
      return;
    }

    if (typeof summary === 'string') {
      elements.problemSummaryContent.textContent = summary;
    } else if (typeof summary === 'object') {
      // If object, unpack text content cleanly
      const text = summary.summary || summary.text || summary.description || JSON.stringify(summary, null, 2);
      elements.problemSummaryContent.textContent = text;
    }
  }

  // --------------------------------------------------------------------------
  // 2. Target Users
  // --------------------------------------------------------------------------
  function renderTargetUsers(users) {
    clearElement(elements.targetUsersList);
    if (!Array.isArray(users) || users.length === 0) {
      const emptyLi = createSafeElement('li', 'user-item-card', 'No target users specified.');
      elements.targetUsersList.appendChild(emptyLi);
      return;
    }

    const defaultAvatars = ['👤', '🎓', '🏢', '⚡', '🧑‍💻', '👥'];

    users.forEach((item, index) => {
      const li = createSafeElement('li', 'user-item-card');

      const avatar = createSafeElement('div', 'user-avatar-badge', defaultAvatars[index % defaultAvatars.length]);
      li.appendChild(avatar);

      const content = createSafeElement('div', 'user-item-content');

      if (typeof item === 'string') {
        const title = createSafeElement('div', 'user-item-title', item);
        content.appendChild(title);
      } else if (typeof item === 'object' && item !== null) {
        const role = item.role || item.persona || item.name || `User Group ${index + 1}`;
        const desc = item.description || item.pain_point || item.details || '';

        const title = createSafeElement('div', 'user-item-title', role);
        content.appendChild(title);

        if (desc) {
          const descEl = createSafeElement('div', 'user-item-desc', desc);
          content.appendChild(descEl);
        }
      }

      li.appendChild(content);
      elements.targetUsersList.appendChild(li);
    });
  }

  // --------------------------------------------------------------------------
  // 3. User Needs
  // --------------------------------------------------------------------------
  function renderUserNeeds(needs) {
    clearElement(elements.userNeedsList);
    if (!Array.isArray(needs) || needs.length === 0) {
      const emptyLi = createSafeElement('li', 'need-item-card', 'No user needs identified.');
      elements.userNeedsList.appendChild(emptyLi);
      return;
    }

    needs.forEach(item => {
      const li = createSafeElement('li', 'need-item-card');
      const bullet = createSafeElement('div', 'need-bullet', '✓');
      li.appendChild(bullet);

      let text = '';
      if (typeof item === 'string') {
        text = item;
      } else if (typeof item === 'object' && item !== null) {
        text = item.need || item.title || item.description || JSON.stringify(item);
      }

      const textEl = createSafeElement('div', 'need-text', text);
      li.appendChild(textEl);
      elements.userNeedsList.appendChild(li);
    });
  }

  // --------------------------------------------------------------------------
  // 4. Suggested Features
  // --------------------------------------------------------------------------
  function renderSuggestedFeatures(features) {
    clearElement(elements.suggestedFeaturesGrid);
    if (!Array.isArray(features) || features.length === 0) {
      elements.suggestedFeaturesGrid.appendChild(
        createSafeElement('div', 'feature-card', 'No suggested features returned.')
      );
      return;
    }

    features.forEach((feat, index) => {
      const card = createSafeElement('div', 'feature-card');
      const header = createSafeElement('div', 'feature-card-header');

      let titleText = `Feature ${index + 1}`;
      let descText = '';
      let pillText = 'Core MVP';

      if (typeof feat === 'string') {
        titleText = feat;
        descText = 'Prioritized for rapid implementation in the current sprint.';
      } else if (typeof feat === 'object' && feat !== null) {
        titleText = feat.title || feat.name || `Feature ${index + 1}`;
        descText = feat.description || feat.details || '';
        pillText = feat.priority || feat.category || 'High Priority';
      }

      const titleEl = createSafeElement('h4', 'feature-title', titleText);
      const pillEl = createSafeElement('span', 'feature-pill', pillText);
      header.appendChild(titleEl);
      header.appendChild(pillEl);
      card.appendChild(header);

      if (descText) {
        const descEl = createSafeElement('p', 'feature-desc', descText);
        card.appendChild(descEl);
      }

      elements.suggestedFeaturesGrid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 5. MVP Plan
  // --------------------------------------------------------------------------
  function renderMvpPlan(mvpPlan) {
    clearElement(elements.mvpPlanList);
    if (!Array.isArray(mvpPlan) || mvpPlan.length === 0) {
      elements.mvpPlanList.appendChild(
        createSafeElement('div', 'mvp-step-card', 'No MVP steps provided.')
      );
      return;
    }

    mvpPlan.forEach((step, index) => {
      const card = createSafeElement('div', 'mvp-step-card');
      const numBadge = createSafeElement('div', 'mvp-step-num', String(index + 1));
      card.appendChild(numBadge);

      const body = createSafeElement('div', 'mvp-step-body');

      let title = `Phase ${index + 1}`;
      let desc = '';

      if (typeof step === 'string') {
        title = step;
      } else if (typeof step === 'object' && step !== null) {
        title = step.step || step.title || step.phase || `Phase ${index + 1}`;
        desc = step.description || step.deliverables || step.details || '';
      }

      const titleEl = createSafeElement('div', 'mvp-step-title', title);
      body.appendChild(titleEl);

      if (desc) {
        const descEl = createSafeElement('div', 'mvp-step-desc', desc);
        body.appendChild(descEl);
      }

      card.appendChild(body);
      elements.mvpPlanList.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 6. Recommended Tech Stack
  // --------------------------------------------------------------------------
  function renderTechStack(techStack) {
    clearElement(elements.techStackContainer);
    if (!Array.isArray(techStack) || techStack.length === 0) {
      elements.techStackContainer.appendChild(
        createSafeElement('div', 'tech-category-group', 'No tech stack items specified.')
      );
      return;
    }

    // Check if items are objects with categories or simple strings
    const isCategorized = techStack.some(item => typeof item === 'object' && item !== null && item.category);

    if (isCategorized) {
      // Group by category
      const categories = {};
      techStack.forEach(item => {
        const cat = item.category || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(item);
      });

      Object.keys(categories).forEach(catName => {
        const group = createSafeElement('div', 'tech-category-group');
        const catTitle = createSafeElement('div', 'tech-category-name', catName);
        group.appendChild(catTitle);

        const chipsWrap = createSafeElement('div', 'tech-chips-wrapper');
        categories[catName].forEach(techItem => {
          const techName = techItem.name || techItem.tech || JSON.stringify(techItem);
          const chip = createSafeElement('span', 'tech-chip', techName);
          if (techItem.rationale || techItem.role) {
            const rat = createSafeElement('span', 'tech-chip-rationale', `(${techItem.rationale || techItem.role})`);
            chip.appendChild(document.createTextNode(' '));
            chip.appendChild(rat);
          }
          chipsWrap.appendChild(chip);
        });
        group.appendChild(chipsWrap);
        elements.techStackContainer.appendChild(group);
      });
    } else {
      // Flat list of technologies
      const group = createSafeElement('div', 'tech-category-group');
      const catTitle = createSafeElement('div', 'tech-category-name', 'Recommended Stack & Libraries');
      group.appendChild(catTitle);

      const chipsWrap = createSafeElement('div', 'tech-chips-wrapper');
      techStack.forEach(tech => {
        let label = typeof tech === 'string' ? tech : (tech.name || tech.tech || JSON.stringify(tech));
        const chip = createSafeElement('span', 'tech-chip', label);
        chipsWrap.appendChild(chip);
      });
      group.appendChild(chipsWrap);
      elements.techStackContainer.appendChild(group);
    }
  }

  // --------------------------------------------------------------------------
  // 7. Development Tasks
  // --------------------------------------------------------------------------
  function renderDevTasks(tasks) {
    clearElement(elements.devTasksContainer);
    if (!Array.isArray(tasks) || tasks.length === 0) {
      elements.devTasksContainer.appendChild(
        createSafeElement('div', 'task-card', 'No development tasks returned.')
      );
      updateTaskCount(0, 0);
      return;
    }

    const totalTasks = tasks.length;
    updateTaskCount(0, totalTasks);

    tasks.forEach((task, index) => {
      const taskId = `task_${index}`;
      const card = createSafeElement('div', 'task-card');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox-custom';
      checkbox.id = taskId;
      checkbox.setAttribute('aria-label', `Complete task ${index + 1}`);

      checkbox.addEventListener('change', function () {
        if (this.checked) {
          card.classList.add('completed');
          state.completedTasks.add(taskId);
        } else {
          card.classList.remove('completed');
          state.completedTasks.delete(taskId);
        }
        updateTaskCount(state.completedTasks.size, totalTasks);
      });
      card.appendChild(checkbox);

      const details = createSafeElement('div', 'task-details');

      let taskTitle = `Task ${index + 1}`;
      let assignee = `Member ${(index % parseInt(elements.teamSize.value || 5, 10)) + 1}`;
      let timeEst = '25 mins';

      if (typeof task === 'string') {
        taskTitle = task;
      } else if (typeof task === 'object' && task !== null) {
        taskTitle = task.task || task.title || task.name || `Task ${index + 1}`;
        if (task.assignee || task.owner || task.role) {
          assignee = task.assignee || task.owner || task.role;
        }
        if (task.time || task.duration || task.estimate) {
          timeEst = task.time || task.duration || task.estimate;
        }
      }

      const titleEl = createSafeElement('div', 'task-title', taskTitle);
      details.appendChild(titleEl);

      const metaRow = createSafeElement('div', 'task-meta-row');
      const assigneePill = createSafeElement('span', 'task-assignee-pill', `👤 ${assignee}`);
      const timePill = createSafeElement('span', 'task-time-pill', `⏱️ ${timeEst}`);
      metaRow.appendChild(assigneePill);
      metaRow.appendChild(timePill);

      details.appendChild(metaRow);
      card.appendChild(details);
      elements.devTasksContainer.appendChild(card);
    });
  }

  function updateTaskCount(completed, total) {
    if (elements.taskProgressCount) {
      elements.taskProgressCount.textContent = `${completed} / ${total} completed`;
    }
  }

  // --------------------------------------------------------------------------
  // 8. Validation Checkpoints
  // --------------------------------------------------------------------------
  function renderValidationCheckpoints(checkpoints) {
    clearElement(elements.validationCheckpointsContainer);
    if (!Array.isArray(checkpoints) || checkpoints.length === 0) {
      elements.validationCheckpointsContainer.appendChild(
        createSafeElement('div', 'checkpoint-card', 'No validation checkpoints defined.')
      );
      return;
    }

    checkpoints.forEach((cp, index) => {
      const card = createSafeElement('div', 'checkpoint-card');

      let time = `Checkpoint ${index + 1}`;
      let title = '';
      let criteria = '';

      if (typeof cp === 'string') {
        title = cp;
        time = `Gate ${index + 1}`;
      } else if (typeof cp === 'object' && cp !== null) {
        time = cp.time || cp.timing || cp.milestone || `T+${(index + 1) * 20}m`;
        title = cp.title || cp.checkpoint || cp.gate || `Milestone ${index + 1}`;
        criteria = cp.criteria || cp.verification || cp.details || '';
      }

      const timeEl = createSafeElement('div', 'checkpoint-time', time);
      card.appendChild(timeEl);

      if (title) {
        const titleEl = createSafeElement('div', 'checkpoint-title', title);
        card.appendChild(titleEl);
      }

      if (criteria) {
        const critEl = createSafeElement('div', 'checkpoint-criteria', criteria);
        card.appendChild(critEl);
      }

      elements.validationCheckpointsContainer.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 9. Test Cases
  // --------------------------------------------------------------------------
  function renderTestCases(testCases) {
    clearElement(elements.testCasesContainer);
    if (!Array.isArray(testCases) || testCases.length === 0) {
      elements.testCasesContainer.appendChild(
        createSafeElement('div', 'test-case-card', 'No test cases specified.')
      );
      return;
    }

    testCases.forEach((tc, index) => {
      const card = createSafeElement('div', 'test-case-card');
      const header = createSafeElement('div', 'test-case-header');

      const testId = (typeof tc === 'object' && tc.id) ? tc.id : `TC-0${index + 1}`;
      const badge = createSafeElement('span', 'test-id-badge', testId);
      header.appendChild(badge);
      card.appendChild(header);

      if (typeof tc === 'string') {
        const scenario = createSafeElement('div', 'test-scenario', tc);
        card.appendChild(scenario);
      } else if (typeof tc === 'object' && tc !== null) {
        const scenarioText = tc.scenario || tc.title || tc.description || `Test Scenario ${index + 1}`;
        const scenarioEl = createSafeElement('div', 'test-scenario', scenarioText);
        card.appendChild(scenarioEl);

        if (tc.input) {
          const inRow = createSafeElement('div', 'test-row');
          inRow.appendChild(createSafeElement('span', 'test-label', 'Input: '));
          inRow.appendChild(createSafeElement('span', 'test-value', typeof tc.input === 'object' ? JSON.stringify(tc.input) : String(tc.input)));
          card.appendChild(inRow);
        }

        if (tc.expected || tc.expected_output) {
          const expRow = createSafeElement('div', 'test-row');
          expRow.appendChild(createSafeElement('span', 'test-label', 'Expected: '));
          expRow.appendChild(createSafeElement('span', 'test-value', tc.expected || tc.expected_output));
          card.appendChild(expRow);
        }
      }

      elements.testCasesContainer.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 10. Demo Checklist
  // --------------------------------------------------------------------------
  function renderDemoChecklist(checklist) {
    clearElement(elements.demoChecklistContainer);
    if (!Array.isArray(checklist) || checklist.length === 0) {
      elements.demoChecklistContainer.appendChild(
        createSafeElement('li', 'checklist-item', 'No checklist items provided.')
      );
      return;
    }

    checklist.forEach((item, index) => {
      const li = createSafeElement('li', 'checklist-item');
      const chkId = `demo_chk_${index}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'checklist-checkbox';
      checkbox.id = chkId;

      checkbox.addEventListener('change', function () {
        if (this.checked) {
          li.classList.add('checked');
          state.checkedDemoItems.add(chkId);
        } else {
          li.classList.remove('checked');
          state.checkedDemoItems.delete(chkId);
        }
      });
      li.appendChild(checkbox);

      let text = typeof item === 'string' ? item : (item.item || item.task || item.title || JSON.stringify(item));
      const textEl = createSafeElement('label', 'checklist-text', text);
      textEl.setAttribute('for', chkId);
      li.appendChild(textEl);

      elements.demoChecklistContainer.appendChild(li);
    });
  }

  // --------------------------------------------------------------------------
  // 11. Jury Presentation Outline
  // --------------------------------------------------------------------------
  function renderJuryPresentation(outline) {
    clearElement(elements.juryPresentationContainer);
    if (!Array.isArray(outline) || outline.length === 0) {
      elements.juryPresentationContainer.appendChild(
        createSafeElement('div', 'pitch-slide-card', 'No jury presentation outline generated.')
      );
      return;
    }

    outline.forEach((slide, index) => {
      const card = createSafeElement('div', 'pitch-slide-card');
      const numPill = createSafeElement('div', 'slide-number-pill', String(index + 1));
      card.appendChild(numPill);

      const content = createSafeElement('div', 'slide-content');
      const headerRow = createSafeElement('div', 'slide-header-row');

      let title = `Slide ${index + 1}`;
      let duration = '45s';
      let points = '';

      if (typeof slide === 'string') {
        title = slide;
      } else if (typeof slide === 'object' && slide !== null) {
        title = slide.slide || slide.topic || slide.title || `Section ${index + 1}`;
        duration = slide.duration || slide.time || '1 min';
        points = slide.talking_points || slide.points || slide.notes || '';
      }

      const titleEl = createSafeElement('div', 'slide-title', title);
      const durationBadge = createSafeElement('span', 'slide-duration-badge', `⏱️ ${duration}`);
      headerRow.appendChild(titleEl);
      headerRow.appendChild(durationBadge);
      content.appendChild(headerRow);

      if (points) {
        const pointsEl = createSafeElement('div', 'slide-points', Array.isArray(points) ? points.join(' • ') : points);
        content.appendChild(pointsEl);
      }

      card.appendChild(content);
      elements.juryPresentationContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // Dashboard Navigation & Filtering Tabs
  // ==========================================================================

  const tabButtons = document.querySelectorAll('.dash-tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      tabButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const targetTab = this.getAttribute('data-tab');
      state.activeTab = targetTab;

      const sectionGroups = document.querySelectorAll('.section-group');
      sectionGroups.forEach(group => {
        const groupName = group.getAttribute('data-group');
        if (targetTab === 'all' || targetTab === groupName) {
          group.style.display = 'grid';
        } else {
          group.style.display = 'none';
        }
      });
    });
  });

  // ==========================================================================
  // Action Handlers: Edit/New Problem, Copy Plan, Print
  // ==========================================================================

  function scrollToFormAndFocus() {
    elements.formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      elements.problemStatement.focus();
    }, 400);
  }

  if (elements.editProblemBtn) {
    elements.editProblemBtn.addEventListener('click', scrollToFormAndFocus);
  }

  if (elements.bottomNewProblemBtn) {
    elements.bottomNewProblemBtn.addEventListener('click', scrollToFormAndFocus);
  }

  if (elements.printPlanBtn) {
    elements.printPlanBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (elements.copyPlanBtn) {
    elements.copyPlanBtn.addEventListener('click', async () => {
      if (!state.lastPlanData) return;

      const formattedMarkdown = formatPlanAsMarkdown(state.lastPlanData);
      try {
        await navigator.clipboard.writeText(formattedMarkdown);
        elements.copyBtnText.textContent = 'Copied!';
        setTimeout(() => {
          elements.copyBtnText.textContent = 'Copy Plan';
        }, 2200);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = formattedMarkdown;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        elements.copyBtnText.textContent = 'Copied!';
        setTimeout(() => {
          elements.copyBtnText.textContent = 'Copy Plan';
        }, 2200);
      }
    });
  }

  function formatPlanAsMarkdown(data) {
    const { input, mentor, plan, demo } = data;
    let md = `# Hackathon AI Mentor Plan\n\n`;
    md += `**Problem Statement:** ${input.problem_statement}\n`;
    md += `**Team Size:** ${input.team_size} members | **Time Limit:** ${input.time_limit_minutes} minutes\n\n`;

    md += `## 1. Problem Summary\n${typeof mentor.problem_summary === 'string' ? mentor.problem_summary : JSON.stringify(mentor.problem_summary)}\n\n`;

    md += `## 2. Target Users\n`;
    (mentor.users || []).forEach(u => {
      md += `- ${typeof u === 'string' ? u : `${u.role || u.name}: ${u.description || ''}`}\n`;
    });
    md += `\n`;

    md += `## 3. User Needs\n`;
    (mentor.user_needs || []).forEach(n => {
      md += `- ${typeof n === 'string' ? n : (n.need || n.title || JSON.stringify(n))}\n`;
    });
    md += `\n`;

    md += `## 4. Suggested Features\n`;
    (mentor.features || []).forEach(f => {
      md += `- **${typeof f === 'string' ? f : f.title}**: ${typeof f === 'object' && f.description ? f.description : ''}\n`;
    });
    md += `\n`;

    md += `## 5. MVP Plan\n`;
    (plan.mvp_plan || []).forEach((m, i) => {
      md += `${i + 1}. ${typeof m === 'string' ? m : `${m.title || m.step}: ${m.description || ''}`}\n`;
    });
    md += `\n`;

    md += `## 6. Recommended Tech Stack\n`;
    (plan.tech_stack || []).forEach(t => {
      md += `- ${typeof t === 'string' ? t : `${t.tech || t.name} (${t.category || ''})`}\n`;
    });
    md += `\n`;

    md += `## 7. Development Tasks\n`;
    (plan.tasks || []).forEach((t, i) => {
      md += `- [ ] **${typeof t === 'string' ? t : t.task}** (${typeof t === 'object' && t.assignee ? t.assignee : `Member ${(i % 5) + 1}`})\n`;
    });
    md += `\n`;

    md += `## 8. Validation Checkpoints\n`;
    (plan.validation_checkpoints || []).forEach(c => {
      md += `- 🚩 **${typeof c === 'string' ? c : c.time}**: ${typeof c === 'object' ? `${c.title || ''} - ${c.criteria || ''}` : ''}\n`;
    });
    md += `\n`;

    md += `## 9. Test Cases\n`;
    (demo.test_cases || []).forEach(tc => {
      md += `- 🧪 ${typeof tc === 'string' ? tc : `${tc.id || 'TC'}: ${tc.scenario || tc.title} -> ${tc.expected || ''}`}\n`;
    });
    md += `\n`;

    md += `## 10. Demo Checklist\n`;
    (demo.demo_checklist || []).forEach(dc => {
      md += `- [ ] ${typeof dc === 'string' ? dc : dc.item || JSON.stringify(dc)}\n`;
    });
    md += `\n`;

    md += `## 11. Jury Presentation Outline\n`;
    (demo.jury_presentation_outline || []).forEach((j, i) => {
      md += `${i + 1}. **${typeof j === 'string' ? j : j.slide || j.topic}** (${typeof j === 'object' ? j.duration || '' : ''}): ${typeof j === 'object' ? j.talking_points || '' : ''}\n`;
    });

    return md;
  }

  // ==========================================================================
  // Simulated Mentor Plan (Explicit Dev Mock Mode Only)
  // Conforms strictly to the specified API Contract
  // ==========================================================================

  async function getSimulatedMentorPlan(input) {
    // Artificial 800ms delay to give genuine feedback to tester
    await new Promise(res => setTimeout(res, 850));

    const problem = input.problem_statement;
    const teamSize = input.team_size;
    const timeLimit = input.time_limit_minutes;

    return {
      success: true,
      input: {
        problem_statement: problem,
        team_size: teamSize,
        time_limit_minutes: timeLimit
      },
      mentor: {
        problem_summary: `This project targets the urgent issue of "${problem}". Within a ${timeLimit}-minute hackathon window, the team must prioritize a lean, demonstrable prototype that solves the primary bottleneck for end-users rather than over-engineering secondary features.`,
        users: [
          {
            role: "Primary Consumers / Students",
            description: "End-users seeking real-time access, notifications, and affordable local availability."
          },
          {
            role: "Operations / Facility Staff",
            description: "Administrators who require frictionless inventory logging and surplus tracking."
          },
          {
            role: "Community Partners / Volunteers",
            description: "Receivers who coordinate rapid logistics for excess distribution."
          }
        ],
        user_needs: [
          "Instant visibility into current item availability and discounts",
          "One-tap reservation system with zero sign-up friction",
          "Automated surplus alerts before daily expiration windows close",
          "Transparent accountability metrics to showcase social/environmental impact"
        ],
        features: [
          {
            title: "Live Inventory & Surplus Feed",
            description: "Real-time list of available items with status, quantity, and reservation badges.",
            priority: "MVP Core",
            category: "Core Flow"
          },
          {
            title: "Instant 1-Click Reservation",
            description: "Generates a temporary claim token to lock an item without mandatory login.",
            priority: "MVP Core",
            category: "Core Flow"
          },
          {
            title: "Emergency Redistribution Broadcast",
            description: "Dispatches SMS/Push pings when surplus remains 30 minutes before cut-off.",
            priority: "Nice-to-Have",
            category: "Alerts"
          },
          {
            title: "Impact Metric Ticker",
            description: "Displays live tally of meals saved, kilograms diverted, and CO2 emissions cut.",
            priority: "Jury Wow Factor",
            category: "Analytics"
          }
        ]
      },
      plan: {
        mvp_plan: [
          {
            step: "Phase 1 (Min 0-30): Data Model & Seed Endpoints",
            title: "Backend Foundation",
            description: "Stand up Express JSON endpoints and mock dataset for real-time inventory items."
          },
          {
            step: "Phase 2 (Min 30-60): Core Consumer UI & Reservation State",
            title: "Frontend Integration",
            description: "Build clean mobile-first reservation cards that trigger POST requests to reserve items."
          },
          {
            step: "Phase 3 (Min 60-75): Staff Admin Toggles & State Sync",
            title: "Dual-Role Experience",
            description: "Add quick staff toggle to add new surplus or mark items as claimed."
          },
          {
            step: "Phase 4 (Min 75-90): Polish, Test Scenarios & Demo Seed",
            title: "Demo Hardening",
            description: "Execute end-to-end test cases and rehearse 3-minute jury pitch flow."
          }
        ],
        tech_stack: [
          { category: "Frontend", name: "Vanilla HTML5 / CSS3 / JS", rationale: "Zero build overhead, 100% reliable" },
          { category: "Backend", name: "Node.js & Express", rationale: "Fast JSON APIs with standard HTTP REST" },
          { category: "Storage", name: "SQLite / In-Memory Store", rationale: "Instant setup, no remote DB latency" },
          { category: "Styling", name: "Modern CSS Variables & Grid", rationale: "Fluid mobile responsiveness" }
        ],
        tasks: [
          {
            task: "Scaffold Express REST API with GET /items and POST /claim",
            assignee: "Backend Lead",
            time: "25 mins"
          },
          {
            task: "Construct responsive card layout for live surplus feed",
            assignee: "Frontend Dev 1",
            time: "30 mins"
          },
          {
            task: "Implement interactive reservation modal and claim token generator",
            assignee: "Frontend Dev 2",
            time: "30 mins"
          },
          {
            task: "Create staff dashboard panel for logging remaining meals",
            assignee: "Fullstack Dev",
            time: "25 mins"
          },
          {
            task: "Prepare seed data, test scripts, and rehearse jury pitch slides",
            assignee: "QA & Pitch Lead",
            time: "20 mins"
          }
        ],
        validation_checkpoints: [
          {
            time: `T+${Math.floor(timeLimit * 0.3)}m Checkpoint`,
            title: "API Sanity Gate",
            criteria: "GET /items returns seed JSON and POST /claim correctly mutates item inventory status."
          },
          {
            time: `T+${Math.floor(timeLimit * 0.65)}m Checkpoint`,
            title: "End-to-End Integration Gate",
            criteria: "Frontend successfully loads items from backend and records a test reservation live in the UI."
          },
          {
            time: `T+${Math.floor(timeLimit * 0.9)}m Checkpoint`,
            title: "Feature Freeze & Live Demo Run",
            criteria: "Stop writing new code. Complete 1 full dry run of the 3-minute pitch deck on mobile & desktop."
          }
        ]
      },
      demo: {
        test_cases: [
          {
            id: "TC-01",
            scenario: "Claim available surplus meal",
            input: "{ itemId: 101, studentId: 'VES-2024' }",
            expected: "HTTP 200 with reservation token and status set to 'claimed'"
          },
          {
            id: "TC-02",
            scenario: "Attempt claiming an already claimed item",
            input: "{ itemId: 101, studentId: 'VES-2025' }",
            expected: "HTTP 409 Conflict with message 'Item already reserved'"
          },
          {
            id: "TC-03",
            scenario: "Staff adds zero-quantity item",
            input: "{ title: 'Salad Bowls', quantity: 0 }",
            expected: "HTTP 400 Validation error"
          }
        ],
        demo_checklist: [
          "Ensure local Node.js server is started on port 3000 before judges arrive",
          "Pre-seed 4 realistic inventory items in database with high-resolution food images",
          "Clear browser cache and test on mobile screen resolution (Chrome DevTools 390x844)",
          "Have backup offline screenshots/video recorded in case of venue Wi-Fi failure",
          "Assign one team member to speak while another operates the mouse/phone"
        ],
        jury_presentation_outline: [
          {
            slide: "1. The Hook & The Bleeding Pain",
            duration: "30 sec",
            talking_points: `Open with the staggering scale: why "${problem}" causes real waste and cost every single day on campus.`
          },
          {
            slide: "2. The Solution & Live Product Demo",
            duration: "90 sec",
            talking_points: "Jump straight into the live running app. Show a user claiming a meal in under 5 seconds."
          },
          {
            slide: "3. Architecture & Tech Differentiation",
            duration: "30 sec",
            talking_points: "Briefly explain the clean modular Node.js stack, speed, and zero-friction design."
          },
          {
            slide: "4. Business Viability & Next Steps",
            duration: "30 sec",
            talking_points: "Address scalability, shelter partner APIs, and how this expands past the hackathon."
          }
        ]
      }
    };
  }

})();

'use strict';

/**
 * modules/planner.js
 * MVP-Planning module for the Hackathon AI Mentor.
 *
 * Exported API
 * ───────────────────────────────────────────────────────────────────────────
 * generatePlan(input) → { mvp_plan, tech_stack, tasks, validation_checkpoints }
 *
 * All logic is synchronous and uses only Node.js built-ins (CommonJS).
 * No packages are installed, no external APIs are called, no server is started.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Keyword → domain tag mapping.
 * Used to pick the right template bucket when no mentor object is supplied.
 */
const DOMAIN_KEYWORDS = {
  food:        ['food', 'waste', 'restaurant', 'meal', 'hunger', 'grocery', 'nutrition', 'diet'],
  health:      ['health', 'medical', 'hospital', 'patient', 'doctor', 'clinic', 'fitness', 'mental'],
  education:   ['education', 'learn', 'student', 'teacher', 'school', 'course', 'quiz', 'tutor'],
  environment: ['environment', 'climate', 'carbon', 'emission', 'green', 'recycle', 'energy', 'solar'],
  finance:     ['finance', 'money', 'budget', 'expense', 'payment', 'bank', 'loan', 'invest'],
  transport:   ['transport', 'traffic', 'commute', 'route', 'ride', 'vehicle', 'parking', 'bus'],
  community:   ['community', 'volunteer', 'social', 'charity', 'ngo', 'donation', 'event', 'local'],
};

/**
 * Domain-specific feature templates.
 * Each entry supplies sensible defaults when the mentor object is absent.
 */
const DOMAIN_TEMPLATES = {
  food: {
    features: [
      'Food waste logging form',
      'Display of logged waste entries',
      'Simple tip generator for reducing food waste',
      'Basic summary/stats of total waste logged',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'],
  },
  health: {
    features: [
      'Symptom / health-log input form',
      'Display of recent health entries',
      'Wellness tip suggestion panel',
      'Basic progress summary',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'],
  },
  education: {
    features: [
      'Topic selection interface',
      'Quiz / flashcard component',
      'Instant feedback on answers',
      'Score summary at the end',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'],
  },
  environment: {
    features: [
      'Carbon / emission input form',
      'Real-time footprint calculation',
      'Actionable eco-tips panel',
      'Visual summary of results',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'],
  },
  finance: {
    features: [
      'Expense entry form',
      'Expense list / history view',
      'Category-based summary',
      'Over-budget alert display',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'],
  },
  transport: {
    features: [
      'Origin / destination input form',
      'Route suggestion display',
      'Estimated travel-time calculation',
      'Mode-of-transport selector',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'],
  },
  community: {
    features: [
      'Event / volunteer listing page',
      'Sign-up / registration form',
      'Confirmation message display',
      'Basic filter by category',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'],
  },
  generic: {
    features: [
      'Core data input form',
      'Display / listing of submitted entries',
      'Basic search or filter functionality',
      'Summary or result panel',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Detect the closest domain from a free-text problem statement.
 * Returns one of the keys in DOMAIN_TEMPLATES.
 * @param {string} text
 * @returns {string}
 */
function detectDomain(text) {
  const lower = text.toLowerCase();
  let bestDomain = 'generic';
  let bestScore  = 0;

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore  = score;
      bestDomain = domain;
    }
  }

  return bestDomain;
}

/**
 * Limit a list to at most n items.
 * @param {string[]} arr
 * @param {number}   n
 * @returns {string[]}
 */
function topN(arr, n) {
  return arr.slice(0, n);
}

/**
 * Clamp a value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// ─── Core planning logic ──────────────────────────────────────────────────────

/**
 * Select MVP features.
 *
 * Priority:
 *  1. Features from the mentor object (already ordered by mentor judgment).
 *  2. Domain-specific template defaults.
 *
 * For a 90-minute build (time_limit_minutes <= 90) we cap at 3 features so the
 * team can realistically finish. Longer time limits allow up to 5 features.
 *
 * @param {string[]}   mentorFeatures   - features from mentor (may be [])
 * @param {string[]}   templateFeatures - fallback template features
 * @param {number}     timeLimitMinutes
 * @returns {string[]}
 */
function selectMvpFeatures(mentorFeatures, templateFeatures, timeLimitMinutes) {
  const maxFeatures = timeLimitMinutes <= 90 ? 3 : 5;
  const source = (mentorFeatures && mentorFeatures.length > 0)
    ? mentorFeatures
    : templateFeatures;
  return topN(source, maxFeatures);
}

/**
 * Build the tech-stack recommendation.
 *
 * Always returns HTML / CSS / JavaScript / Node.js / Express because that
 * matches the project existing setup and is beginner-friendly.
 *
 * @param {string[]} templateStack
 * @returns {string[]}
 */
function buildTechStack(templateStack) {
  const canonical = ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'];
  const canonicalLower = canonical.map(function (c) { return c.toLowerCase(); });
  const extra = (templateStack || []).filter(
    function (item) { return !canonicalLower.includes(item.toLowerCase()); }
  );
  return canonical.concat(extra);
}

/**
 * Generate concrete, ordered tasks from selected MVP features.
 *
 * @param {string[]} mvpFeatures
 * @param {number}   teamSize
 * @param {number}   timeLimitMinutes
 * @returns {string[]}
 */
function buildTasks(mvpFeatures, teamSize, timeLimitMinutes) {
  const tasks = [];

  // Scaffold
  tasks.push(
    'Set up project scaffold: initialise Node.js/Express server, create index.html and style.css'
  );

  // Feature tasks
  mvpFeatures.forEach(function (feature, i) {
    if (teamSize === 1) {
      tasks.push(
        'Build "' + feature + '": implement HTML structure, CSS styling, and JavaScript logic sequentially'
      );
    } else if (teamSize === 2) {
      if (i % 2 === 0) {
        tasks.push(
          'Build "' + feature + '": one member handles the HTML/CSS layout while the other wires the Express route'
        );
      } else {
        tasks.push(
          'Build "' + feature + '": implement client-side JavaScript; integrate with backend endpoint'
        );
      }
    } else {
      tasks.push(
        'Build "' + feature + '": assign a sub-team — front-end (HTML/CSS), logic (JS), and route (Express)'
      );
    }
  });

  // Integration
  tasks.push(
    'Integrate all features: wire front-end fetch calls to Express routes, verify data flows end-to-end'
  );

  // Presentation prep (only if enough time per task)
  const minutesPerTask = timeLimitMinutes / (tasks.length + 1);
  if (minutesPerTask > 10) {
    tasks.push(
      'Polish UI and prepare a 2-minute demo script covering the problem, solution, and live walkthrough'
    );
  }

  return tasks;
}

/**
 * Generate validation checkpoints.
 *
 * Always includes:
 *  - Input validation (required fields, type checks).
 *  - Normal-case tests for each MVP feature.
 *  - Edge-case tests.
 *  - End-to-end check.
 *
 * @param {string[]} mvpFeatures
 * @param {string}   problemStatement
 * @returns {string[]}
 */
function buildCheckpoints(mvpFeatures, problemStatement) {
  const checkpoints = [];

  // Input validation
  checkpoints.push(
    'Input validation: confirm all required form fields reject empty or invalid submissions and display an appropriate error message'
  );

  // Normal-case tests
  mvpFeatures.forEach(function (feature) {
    checkpoints.push(
      'Normal-case test for "' + feature + '": submit valid data, verify the expected output is displayed correctly'
    );
  });

  // Edge-case tests
  checkpoints.push(
    'Edge-case test: submit boundary values (empty string, very large numbers, special characters) and confirm graceful handling'
  );
  checkpoints.push(
    'Edge-case test: simulate rapid consecutive submissions and confirm the UI remains consistent with no duplicate entries'
  );

  // End-to-end check
  const truncated = problemStatement.length > 60
    ? problemStatement.substring(0, 60).trim() + '...'
    : problemStatement;
  checkpoints.push(
    'End-to-end check: walk through the complete user journey from the "' + truncated + '" perspective — enter data, view results, and verify the core value is delivered'
  );

  return checkpoints;
}

/**
 * Build the high-level MVP plan narrative as an ordered list of strings.
 *
 * @param {string[]} selectedFeatures
 * @param {string}   problemStatement
 * @param {string}   mentorSummary
 * @param {number}   teamSize
 * @param {number}   timeLimitMinutes
 * @returns {string[]}
 */
function buildMvpPlan(selectedFeatures, problemStatement, mentorSummary, teamSize, timeLimitMinutes) {
  const minutesPerFeature = Math.floor(timeLimitMinutes / (selectedFeatures.length + 2));
  const teamDesc = teamSize === 1 ? 'a solo developer' : 'a team of ' + teamSize;

  const ps = problemStatement.length > 80
    ? problemStatement.substring(0, 80).trim() + '...'
    : problemStatement;

  const plan = [];

  // Context sentence
  plan.push(
    'Build the smallest working solution for: "' + ps + '" — targeted at ' + teamDesc + ' with ' + timeLimitMinutes + ' minutes.'
  );

  // Mentor enrichment
  if (mentorSummary) {
    plan.push('Core problem insight from mentor: ' + mentorSummary);
  }

  // Feature scope
  plan.push(
    'Focus exclusively on ' + selectedFeatures.length + ' core feature(s) to ensure completion within the time constraint:'
  );

  selectedFeatures.forEach(function (feature, i) {
    plan.push('  ' + (i + 1) + '. ' + feature + ' (~' + minutesPerFeature + ' min)');
  });

  // Constraints
  plan.push(
    'Avoid any feature that requires a database, external API, OAuth, model training, or multi-page navigation — these cannot realistically be completed within the time limit.'
  );

  if (timeLimitMinutes <= 90) {
    plan.push(
      'Prefer in-memory storage (JavaScript arrays/objects) over a database for all data persistence during the hackathon.'
    );
  }

  plan.push(
    'All styling should use vanilla CSS — no frameworks — to keep the setup fast and the bundle lightweight.'
  );

  plan.push(
    'Reserve the final 10-15 minutes for end-to-end testing, bug fixes, and demo preparation.'
  );

  return plan;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a hackathon MVP plan.
 *
 * @param {object}   input
 * @param {string}   input.problem_statement
 * @param {number}   input.team_size
 * @param {number}   input.time_limit_minutes
 * @param {object}  [input.mentor]
 * @param {string}  [input.mentor.problem_summary]
 * @param {string[]}[input.mentor.users]
 * @param {string[]}[input.mentor.user_needs]
 * @param {string[]}[input.mentor.features]
 *
 * @returns {{ mvp_plan: string[], tech_stack: string[], tasks: string[], validation_checkpoints: string[] }}
 * @throws  {Error} on invalid required inputs
 */
function generatePlan(input) {
  // 1. Guard: input must be a non-null object
  if (input === null || typeof input !== 'object') {
    throw new Error('generatePlan: input must be a non-null object.');
  }

  var problem_statement  = input.problem_statement;
  var team_size          = input.team_size;
  var time_limit_minutes = input.time_limit_minutes;
  var mentor             = input.mentor;

  // 2. Validate required fields
  if (typeof problem_statement !== 'string' || problem_statement.trim() === '') {
    throw new Error(
      'generatePlan: "problem_statement" is required and must be a non-empty string.'
    );
  }

  if (typeof team_size !== 'number' || !Number.isFinite(team_size) || team_size < 1) {
    throw new Error(
      'generatePlan: "team_size" is required and must be a positive finite number (>= 1).'
    );
  }

  if (
    typeof time_limit_minutes !== 'number' ||
    !Number.isFinite(time_limit_minutes) ||
    time_limit_minutes <= 0
  ) {
    throw new Error(
      'generatePlan: "time_limit_minutes" is required and must be a positive finite number.'
    );
  }

  // Normalise to sane bounds (non-fatal)
  var effectiveTeamSize  = clamp(Math.floor(team_size), 1, 20);
  var effectiveTimeLimit = clamp(time_limit_minutes, 1, 480);

  // 3. Derive domain and template
  var domain   = detectDomain(problem_statement);
  var template = DOMAIN_TEMPLATES[domain] || DOMAIN_TEMPLATES.generic;

  // 4. Extract mentor context (optional)
  var mentorFeatures = [];
  var mentorSummary  = '';

  if (mentor !== null && mentor !== undefined && typeof mentor === 'object') {
    if (Array.isArray(mentor.features)) {
      mentorFeatures = mentor.features.filter(
        function (f) { return typeof f === 'string' && f.trim() !== ''; }
      );
    }
    if (typeof mentor.problem_summary === 'string') {
      mentorSummary = mentor.problem_summary.trim();
    }
  }

  // 5. Build plan components
  var selectedFeatures = selectMvpFeatures(
    mentorFeatures,
    template.features,
    effectiveTimeLimit
  );

  var techStack = buildTechStack(template.stack);

  var mvpPlan = buildMvpPlan(
    selectedFeatures,
    problem_statement.trim(),
    mentorSummary,
    effectiveTeamSize,
    effectiveTimeLimit
  );

  var tasks = buildTasks(selectedFeatures, effectiveTeamSize, effectiveTimeLimit);

  var validationCheckpoints = buildCheckpoints(
    selectedFeatures,
    problem_statement.trim()
  );

  // 6. Return
  return {
    mvp_plan:               mvpPlan,
    tech_stack:             techStack,
    tasks:                  tasks,
    validation_checkpoints: validationCheckpoints,
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { generatePlan };
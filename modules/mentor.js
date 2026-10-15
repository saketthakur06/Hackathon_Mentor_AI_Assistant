/**
 * Problem-Analysis Module for Hackathon AI Mentor
 *
 * Deterministic rule-based analysis module that evaluates a hackathon problem statement,
 * team constraints, and time limits to extract target users, practical needs,
 * and feasible MVP features.
 */

/**
 * Validates input parameters and ensures required types and constraints are met.
 *
 * @param {Object} input
 */
function validateInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be a valid object containing problem_statement, team_size, and time_limit_minutes.');
  }

  const { problem_statement, team_size, time_limit_minutes } = input;

  if (typeof problem_statement !== 'string' || problem_statement.trim() === '') {
    throw new Error('problem_statement is required and cannot be blank.');
  }

  if (typeof team_size !== 'number' || !Number.isInteger(team_size) || team_size <= 0) {
    throw new Error('team_size must be a positive integer.');
  }

  if (typeof time_limit_minutes !== 'number' || !Number.isInteger(time_limit_minutes) || time_limit_minutes <= 0) {
    throw new Error('time_limit_minutes must be a positive integer.');
  }
}

/**
 * Domain definitions with matched keywords, personas, practical needs, and modular features.
 */
const DOMAIN_PROFILES = [
  {
    id: 'food_waste',
    keywords: ['food', 'waste', 'canteen', 'cafeteria', 'dining', 'meal', 'kitchen', 'restaurant', 'leftover', 'spoilage', 'perishable'],
    getAnalysis: (text, teamSize, timeLimit, isCampus) => {
      const location = isCampus ? 'college canteens' : 'food service facilities';
      const dinerGroup = isCampus ? 'Students and campus diners' : 'Consumers and regular diners';
      const coordinatorGroup = isCampus
        ? 'Campus sustainability team and food redistribution volunteers'
        : 'Community food banks and redistribution coordinators';

      const summary = `Food waste in ${location} stems primarily from unpredictable diner attendance and lack of immediate channels to redistribute edible surplus. This project structures an MVP to forecast demand, broadcast remaining portions, and log waste metrics, tailored for a ${teamSize}-person team within a ${timeLimit}-minute development window.`;

      const users = [
        'Kitchen staff and cafeteria operational managers',
        dinerGroup,
        coordinatorGroup
      ];

      const user_needs = [
        'Kitchen managers need accurate daily headcount forecasts to avoid over-preparing food.',
        'Diners need real-time awareness of meal availability and discounted end-of-day surplus.',
        'Staff need a fast, low-effort mechanism to broadcast surplus portions before expiration.',
        'Administrators need daily waste logs to identify over-prepped menu items and reduce costs.'
      ];

      const allFeatures = [
        'Meal Demand Headcount Logger: A quick pre-order or attendance poll allowing diners to signal meal attendance before prep begins.',
        'Surplus Food Broadcast Panel: A simple dashboard for kitchen staff to post available leftover portions with pickup timeframes.',
        'Real-Time Surplus Notification Feed: A live view where diners can claim or reserve surplus meals at discounted rates.',
        'Daily Waste & Weight Tracker: A streamlined logging form to record surplus meal quantities and track reduction over time.',
        'Volunteer Redistribution Alert: Direct alert system notifying partner shelters or campus teams when surplus crosses a bulk threshold.'
      ];

      return { summary, users, user_needs, allFeatures };
    }
  },
  {
    id: 'healthcare',
    keywords: ['health', 'medical', 'patient', 'doctor', 'clinic', 'hospital', 'triage', 'prescription', 'medicine', 'symptom', 'disease'],
    getAnalysis: (text, teamSize, timeLimit) => {
      const summary = `Healthcare workflows suffer from delayed triage and fragmented communication between patients and providers. This solution creates an MVP to prioritize patient intake, organize clinical queues, and provide timely notifications, calibrated for a ${teamSize}-member team over ${timeLimit} minutes.`;

      const users = [
        'Patients and caregivers seeking timely care',
        'Clinic nurses and intake triage staff',
        'Attending physicians and healthcare coordinators'
      ];

      const user_needs = [
        'Patients need immediate visibility into triage status and estimated wait times.',
        'Clinical staff need a standardized intake screen to quickly flag high-acuity cases.',
        'Caregivers need clear instructions on follow-up care and medication schedules.',
        'Administrators need patient flow metrics to alleviate department bottlenecks.'
      ];

      const allFeatures = [
        'Digital Symptom Intake Form: A structured patient check-in screen capturing vital symptoms and urgency level.',
        'Priority Triage Queue: Real-time clinical queue that automatically sorts patients by severity for staff attention.',
        'Live Wait-Time Status Monitor: A patient-facing dashboard displaying queue position and estimated consultation times.',
        'Medication & Care Plan Logger: A straightforward checklist for doctors to record prescribed care steps for patients.',
        'Critical Alert Dispatcher: Automated SMS/email notification to on-call doctors when high-urgency symptoms are flagged.'
      ];

      return { summary, users, user_needs, allFeatures };
    }
  },
  {
    id: 'education',
    keywords: ['education', 'student', 'learning', 'study', 'course', 'school', 'exam', 'academic', 'classroom', 'teacher', 'homework', 'syllabus'],
    getAnalysis: (text, teamSize, timeLimit) => {
      const summary = `Students and educators often struggle with fragmented deadlines, uneven learning paces, and resource disorganization. This project builds a focused tool to structure coursework timelines, facilitate peer study, and track assignment progress, designed for ${teamSize} developers in a ${timeLimit}-minute sprint.`;

      const users = [
        'Students managing academic coursework and exam deadlines',
        'Instructors and teaching assistants',
        'Peer study groups and academic mentors'
      ];

      const user_needs = [
        'Students need a unified timeline breaking large course milestones into actionable daily steps.',
        'Instructors need visibility into topics where students face frequent blockers.',
        'Study groups need a centralized board to share verified study notes and question banks.',
        'Students need structured peer check-ins to maintain consistent study momentum.'
      ];

      const allFeatures = [
        'Interactive Study Schedule Generator: Tool to input syllabus milestones and generate day-by-day task targets.',
        'Concept Blocker Q&A Board: A forum where students post difficult problem tags and receive peer/TA guidance.',
        'Collaborative Study Resource Deck: A repository for students and educators to share and upvote concise revision guides.',
        'Progress & Milestone Tracker: A visual completion dashboard giving students clear feedback on prep status.',
        'Deadline Reminder Dispatcher: Automated notification service flagging upcoming submission gates 48 hours in advance.'
      ];

      return { summary, users, user_needs, allFeatures };
    }
  },
  {
    id: 'environment',
    keywords: ['environment', 'sustainability', 'energy', 'carbon', 'solar', 'recycling', 'climate', 'water', 'emissions', 'pollution', 'green'],
    getAnalysis: (text, teamSize, timeLimit) => {
      const summary = `Tracking and mitigating environmental impact is often hindered by lack of localized data and unclear conservation incentives. This MVP provides transparent resource monitoring, practical guidance, and habit tracking, scoped for a ${teamSize}-person team in ${timeLimit} minutes.`;

      const users = [
        'Eco-conscious residents and community members',
        'Facility managers and local sustainability officers',
        'Community recycling and conservation coordinators'
      ];

      const user_needs = [
        'Community members need simple, verified instructions on proper local disposal and recycling.',
        'Facility leads need centralized logging to monitor utility consumption trends against baselines.',
        'Organizers need a structured leaderboard to encourage community conservation challenges.',
        'Residents need automated threshold alerts when consumption spikes unexpectedly.'
      ];

      const allFeatures = [
        'Resource Consumption Tracker: A lightweight logger recording utility readings or personal carbon estimates.',
        'Waste Sorting & Disposal Guide: A searchable directory specifying correct recycling rules for everyday items.',
        'Community Challenge Leaderboard: A shared board tracking team or neighborhood conservation achievements.',
        'Automated Efficiency Audit: A basic engine flagging abnormal consumption spikes and suggesting reductions.',
        'Milestone Certificate Generator: Generates verifiable digital proof for verified conservation actions.'
      ];

      return { summary, users, user_needs, allFeatures };
    }
  },
  {
    id: 'transport',
    keywords: ['transport', 'traffic', 'transit', 'commute', 'commuter', 'bus', 'train', 'parking', 'route', 'congestion', 'vehicle'],
    getAnalysis: (text, teamSize, timeLimit) => {
      const summary = `Commuters face daily unpredictability from transit delays, congestion, and parking shortages. This MVP delivers route comparison, parking space tracking, and community incident reporting, calibrated for a ${teamSize}-member team working across ${timeLimit} minutes.`;

      const users = [
        'Daily commuters and drivers',
        'Transit operators and parking facility attendants',
        'Municipal transport planners'
      ];

      const user_needs = [
        'Commuters need timely alerts on delays and road congestion before departing.',
        'Drivers need real-time visibility into available parking slots to avoid circling.',
        'Operators need a quick tool to publish schedule changes and service alerts.',
        'Riders need a simple channel to confirm route alternatives when transit disruptions occur.'
      ];

      const allFeatures = [
        'Live Parking Slot Availability Tracker: A dashboard showing open parking bay capacities and arrival times.',
        'Transit Delay & Route Advisory Feed: A real-time notification board flagging transit bottlenecks and alternative paths.',
        'Commuter Ride Coordination Board: A simple bulletin enabling verified users to share rides on common routes.',
        'Incident Hazard Reporter: A crowdsourced intake form allowing drivers to flag road obstacles or delays.',
        'Route Time Estimator: A comparison widget assessing travel times across active transit options.'
      ];

      return { summary, users, user_needs, allFeatures };
    }
  },
  {
    id: 'finance',
    keywords: ['finance', 'budget', 'expense', 'money', 'payment', 'savings', 'invoice', 'financial', 'spending', 'cost'],
    getAnalysis: (text, teamSize, timeLimit) => {
      const summary = `Personal and team budgeting often breaks down when expense tracking requires high manual friction. This MVP introduces quick transaction recording, budget boundaries, and spending alerts, structured for ${teamSize} team members within ${timeLimit} minutes.`;

      const users = [
        'Individual spenders and students managing tight allowances',
        'Small team managers tracking project expenses',
        'Financial coaches or accountability partners'
      ];

      const user_needs = [
        'Users need low-friction expense capture to log transactions in seconds.',
        'Spenders need visual warnings as categories approach their budget ceiling.',
        'Managers need structured category breakdowns to audit monthly outlays.',
        'Users need reminders for recurring subscriptions and renewal deadlines.'
      ];

      const allFeatures = [
        'Rapid Expense Entry Form: A minimal form with auto-categorization for fast expenditure logging.',
        'Budget Threshold Meter: Visual progress meters highlighting current burn rate against limits.',
        'Monthly Spending Breakdown Chart: Category-wise summary highlighting top expenditure channels.',
        'Recurring Bill Reminder: A calendar view tracking upcoming subscriptions and billing due dates.',
        'Exportable Expense Summary: One-click export producing structured CSV/JSON audit reports.'
      ];

      return { summary, users, user_needs, allFeatures };
    }
  }
];

/**
 * Fallback generic analysis generator for topics that do not match predefined domains.
 *
 * @param {string} text - Cleaned problem statement
 * @param {number} teamSize
 * @param {number} timeLimit
 */
function generateGenericAnalysis(text, teamSize, timeLimit) {
  const cleanTopic = text.replace(/[^\w\s-]/g, '').trim();

  const summary = `Addressing "${cleanTopic}" requires clarifying primary user bottlenecks and deploying a reliable initial workflow. This MVP focuses core capabilities on direct user intake, status tracking, and notification delivery, scoped for a ${teamSize}-person team within a ${timeLimit}-minute development window.`;

  const users = [
    'Primary end users directly affected by the problem',
    'Operational managers and workflow administrators',
    'External support staff and community stakeholders'
  ];

  const user_needs = [
    'End users need an intuitive, low-friction entry point to log and track their requests.',
    'Operational leads need organized status oversight to triage incoming issues without delay.',
    'Team members need automated updates when task statuses or critical conditions change.',
    'Administrators need historical activity logs to review performance and refine processes.'
  ];

  const allFeatures = [
    'User Intake & Request Portal: A clean input interface allowing end users to submit structured data directly.',
    'Centralized Operational Queue: A filtered overview enabling administrators to review and prioritize active entries.',
    'Real-Time Status & Notification Hub: A responsive dashboard displaying live updates and immediate alert badges.',
    'Activity & Performance Audit Log: A historical table tracking status progression, timestamps, and key milestones.',
    'Export & Integration Utility: A utility to download organized reports and share summary snapshots with stakeholders.'
  ];

  return { summary, users, user_needs, allFeatures };
}

/**
 * Determines feature count based on team size and available development time.
 * Hackathon constraint considerations:
 * - Ultra-tight sprints (<= 60 mins) or solo/duo teams: 3 features (lean MVP)
 * - Standard sprints (61 - 180 mins) or small-to-mid teams: 4 features (balanced MVP)
 * - Extended time (> 180 mins) and large teams (>= 5): 5 features (full-spectrum MVP)
 *
 * @param {number} teamSize
 * @param {number} timeLimit
 * @returns {number}
 */
function determineFeatureCount(teamSize, timeLimit) {
  if (timeLimit <= 60 || teamSize <= 2) {
    return 3;
  }
  if (timeLimit > 180 && teamSize >= 5) {
    return 5;
  }
  return 4;
}

/**
 * Generates structured problem analysis for Hackathon AI Mentor.
 *
 * @param {Object} params
 * @param {string} params.problem_statement
 * @param {number} params.team_size
 * @param {number} params.time_limit_minutes
 * @returns {{
 *   problem_summary: string,
 *   users: string[],
 *   user_needs: string[],
 *   features: string[]
 * }}
 */
let geminiModule = null;
try {
  geminiModule = require('../backend/gemini');
} catch (err) {
  // If backend/gemini is unavailable, pure rule-based fallback will be used
}

/**
 * Computes deterministic rule-based analysis.
 *
 * @param {Object} params
 * @param {string} params.problem_statement
 * @param {number} params.team_size
 * @param {number} params.time_limit_minutes
 * @returns {{
 *   problem_summary: string,
 *   users: string[],
 *   user_needs: string[],
 *   features: string[]
 * }}
 */
function generateRuleBasedAnalysis({ problem_statement, team_size, time_limit_minutes }) {
  const cleanedText = problem_statement.trim();
  const lowerText = cleanedText.toLowerCase();

  const isCampus = lowerText.includes('college') ||
                   lowerText.includes('campus') ||
                   lowerText.includes('university') ||
                   lowerText.includes('school');

  let bestDomain = null;
  let highestScore = 0;

  for (const profile of DOMAIN_PROFILES) {
    let score = 0;
    for (const kw of profile.keywords) {
      if (lowerText.includes(kw)) {
        score += 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestDomain = profile;
    }
  }

  const analysis = (bestDomain && highestScore > 0)
    ? bestDomain.getAnalysis(cleanedText, team_size, time_limit_minutes, isCampus)
    : generateGenericAnalysis(cleanedText, team_size, time_limit_minutes);

  const featureCount = determineFeatureCount(team_size, time_limit_minutes);
  const selectedFeatures = analysis.allFeatures.slice(0, featureCount);

  return {
    problem_summary: analysis.summary,
    users: analysis.users,
    user_needs: analysis.user_needs,
    features: selectedFeatures
  };
}

/**
 * Generates structured problem analysis for Hackathon AI Mentor.
 * Uses Gemini API when available, and automatically falls back to
 * deterministic rule-based analysis on API error or offline mode.
 *
 * @param {Object} params
 * @param {string} params.problem_statement
 * @param {number} params.team_size
 * @param {number} params.time_limit_minutes
 * @returns {Promise<{
 *   problem_summary: string,
 *   users: string[],
 *   user_needs: string[],
 *   features: string[]
 * }> & {
 *   problem_summary: string,
 *   users: string[],
 *   user_needs: string[],
 *   features: string[]
 * }}
 */
function generateMentor({ problem_statement, team_size, time_limit_minutes } = {}) {
  // Input validation (rejects invalid input synchronously with a clear Error)
  validateInput({ problem_statement, team_size, time_limit_minutes });

  const fallbackResult = generateRuleBasedAnalysis({ problem_statement, team_size, time_limit_minutes });

  if (geminiModule && typeof geminiModule.generateGeminiMentorAnalysis === 'function') {
    const promise = (async () => {
      try {
        const aiResult = await geminiModule.generateGeminiMentorAnalysis({
          problem_statement,
          team_size,
          time_limit_minutes
        });
        if (
          aiResult &&
          typeof aiResult.problem_summary === 'string' &&
          Array.isArray(aiResult.users) &&
          Array.isArray(aiResult.user_needs) &&
          Array.isArray(aiResult.features)
        ) {
          return aiResult;
        }
      } catch (apiError) {
        // Intended fallback: On any API failure, return deterministic rule-based analysis
      }
      return fallbackResult;
    })();

    // Attach synchronous properties for seamless dual sync & async compatibility
    Object.assign(promise, fallbackResult);
    return promise;
  }

  return fallbackResult;
}

module.exports = {
  generateMentor,
  generateRuleBasedAnalysis
};


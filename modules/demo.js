/**
 * Testing and Demo-Preparation Module for Hackathon AI Mentor.
 * Synchronously generates test cases, an end-to-end demo checklist,
 * and a structured jury presentation outline for a 90-minute hackathon.
 */

function generateDemo(options) {
  // Validate input object and primary problem statement
  if (!options || typeof options !== 'object') {
    throw new Error("Invalid input: options must be an object containing 'problem_statement'.");
  }

  const problemStatement = typeof options.problem_statement === 'string'
    ? options.problem_statement.trim()
    : '';

  if (!problemStatement) {
    throw new Error("Invalid problem statement: 'problem_statement' must be a non-empty string.");
  }

  // Safely extract mentor and plan context if provided
  const mentor = (options.mentor && typeof options.mentor === 'object') ? options.mentor : {};
  const plan = (options.plan && typeof options.plan === 'object') ? options.plan : {};

  const problemSummary = (typeof mentor.problem_summary === 'string' && mentor.problem_summary.trim())
    ? mentor.problem_summary.trim()
    : problemStatement;

  const users = Array.isArray(mentor.users) && mentor.users.length > 0
    ? mentor.users
    : ['Target End Users', 'Key Stakeholders'];

  const userNeeds = Array.isArray(mentor.user_needs) && mentor.user_needs.length > 0
    ? mentor.user_needs
    : ['core problem relief', 'streamlined workflow'];

  const features = Array.isArray(mentor.features) && mentor.features.length > 0
    ? mentor.features
    : ['Core MVP solution flow'];

  const mvpPlan = Array.isArray(plan.mvp_plan) && plan.mvp_plan.length > 0
    ? plan.mvp_plan
    : ['Setup core scaffold', 'Implement primary workflow', 'Verify end-to-end functionality'];

  const techStack = Array.isArray(plan.tech_stack) && plan.tech_stack.length > 0
    ? plan.tech_stack
    : ['Node.js', 'Vanilla JS'];

  const validationCheckpoints = Array.isArray(plan.validation_checkpoints) && plan.validation_checkpoints.length > 0
    ? plan.validation_checkpoints
    : ['MVP pipeline operational', 'Primary user path validated'];

  // Determine an alternative domain problem statement
  const lowerProblem = problemStatement.toLowerCase();
  let alternativeDomainName = '';
  let alternativeDomainInput = '';
  let alternativeDomainOutput = '';

  if (lowerProblem.includes('food') || lowerProblem.includes('waste') || lowerProblem.includes('meal') || lowerProblem.includes('restaurant')) {
    alternativeDomainName = 'Problem from a different domain (Healthcare Triage)';
    alternativeDomainInput = 'Automated patient queue triage for rural clinics to prioritize urgent cases based on vital signs.';
    alternativeDomainOutput = 'System should adapt to clinical workflows, extract medical personnel and patient personas, and generate a scoped health-tech MVP plan with safety-first validation checkpoints.';
  } else if (lowerProblem.includes('health') || lowerProblem.includes('medic') || lowerProblem.includes('patient') || lowerProblem.includes('clinic')) {
    alternativeDomainName = 'Problem from a different domain (Logistics & Food Distribution)';
    alternativeDomainInput = 'Hyperlocal food rescue platform routing excess restaurant meals to community centers before expiration.';
    alternativeDomainOutput = 'System should adapt to logistics workflows, extract donor and recipient personas, and generate an inventory and dispatch MVP plan within 90-minute hackathon constraints.';
  } else {
    alternativeDomainName = 'Problem from a different domain (FinTech & Micro-lending)';
    alternativeDomainInput = 'Offline-first digital ledger and micro-loan tracking system for unbanked street merchants.';
    alternativeDomainOutput = 'System should adapt to financial micro-transaction workflows, extract merchant personas, and generate a resilient offline-first MVP architecture.';
  }

  // 1. Generate at least four test cases
  const test_cases = [
    {
      name: 'A normal, complete problem statement',
      input: problemStatement,
      expected_output: `System accepts the complete problem statement, identifies key personas (${users.slice(0, 2).join(', ')}), and outputs an actionable MVP scope delivering ${features.slice(0, 2).join(' and ')} within 90 minutes.`
    },
    {
      name: alternativeDomainName,
      input: alternativeDomainInput,
      expected_output: alternativeDomainOutput
    },
    {
      name: 'An empty or missing problem statement',
      input: '',
      expected_output: "System rejects the empty input with a clear validation error indicating that 'problem_statement' must be a non-empty string, preventing downstream processing."
    },
    {
      name: 'A vague or overly broad problem statement',
      input: 'Create an AI platform that uses blockchain and quantum computing to fix climate change.',
      expected_output: 'System detects excessive ambiguity and unmanageable scope, prompts the user with clarifying constraints, and recommends narrowing the focus to a measurable 90-minute hackathon deliverable.'
    }
  ];

  // 2. Concise end-to-end demo checklist (tuned for a 90-minute hackathon)
  const demo_checklist = [
    'Environment & Services: Confirm local server is running, environment variables are loaded, and a backup mobile hotspot is available.',
    'Seed Realistic Demo Data: Pre-load realistic, non-empty data records into the database/state to eliminate awkward live typing during the pitch.',
    `Core Happy Path Rehearsal: Verify the end-to-end happy path flow (${features[0] || 'primary feature'} -> functional outcome) from start to finish without console errors.`,
    'Graceful Failure & Input Guardrails: Verify that unexpected jury inputs or empty fields trigger friendly feedback rather than application crashes.',
    `Validation Checkpoints Review: Verify all hackathon milestones are demonstrably complete (${validationCheckpoints.join(', ')}).`,
    'Time Management & Rehearsal: Run a timed rehearsal to ensure the live demo completes in under 2 minutes, reserving 1 minute for jury Q&A.'
  ];

  // 3. Jury presentation outline covering all 6 required sections: problem, users, approach, working prototype, results, limitations
  const jury_presentation_outline = [
    `Problem (30s): Introduce the problem hook: "${problemSummary}". Emphasize the urgent friction and why existing tools fail.`,
    `Users (20s): Define target beneficiaries (${users.join(', ')}) and highlight their critical unmet needs: ${userNeeds.join(', ')}.`,
    `Approach (25s): Present the technical solution architecture built with ${techStack.join(', ')}, highlighting pragmatic design decisions optimized for a 90-minute hackathon.`,
    `Working Prototype (60s): Deliver a focused live demo showing the working prototype in action (${features.join(', ')}), demonstrating measurable progress across MVP tasks (${mvpPlan.slice(0, 2).join(', ')}).`,
    `Results (25s): Share validated outcomes and benchmark accomplishments (${validationCheckpoints.join(', ')}), illustrating real-world usability and time saved.`,
    'Limitations (20s): Address hackathon scope boundaries transparently (e.g., edge-case automation, high-concurrency scaling) and outline clear next steps for post-hackathon development.'
  ];

  return {
    test_cases,
    demo_checklist,
    jury_presentation_outline
  };
}

module.exports = { generateDemo };

import { config } from './config.js';

const INTRO_KEYWORDS = [
  'based in', 'located in', 'from',
  'fun fact', 'funfact',
  'contribute', 'looking to', 'want to',
  'i am', "i'm", 'my name is', 'hey everyone', 'hello everyone',
  'building', 'developer', 'designer', 'founder', 'working on',
];

const LOCATION_INDICATORS = [
  '📍', 'based', 'location', 'from', 'living in', 'residing',
  'kuala lumpur', 'kl', 'malaysia', 'singapore', 'jakarta',
  'bangkok', 'vietnam', 'philippines', 'indonesia',
];

const CONTRIBUTION_INDICATORS = [
  'contribute', 'help', 'looking to', 'want to', 'excited to',
  'connect', 'build', 'support', 'mentor', 'learn',
  '🤝', 'collaborate',
];

export function validateIntroLength(text) {
  return text.length >= config.validation.minIntroLength;
}

export function validateIntroFormat(text) {
  if (!config.validation.enableFormatValidation) {
    return { valid: true, score: 100, feedback: null };
  }

  const lowerText = text.toLowerCase();
  let score = 0;
  const feedback = [];

  if (validateIntroLength(text)) {
    score += 25;
  } else {
    feedback.push(`Your intro seems a bit short. Try adding more details about yourself!`);
  }

  const hasKeywords = INTRO_KEYWORDS.some(keyword => lowerText.includes(keyword));
  if (hasKeywords) {
    score += 25;
  } else {
    feedback.push(`Consider introducing yourself (e.g., "I'm..." or "My name is...")`);
  }

  const hasLocation = LOCATION_INDICATORS.some(indicator => lowerText.includes(indicator));
  if (hasLocation) {
    score += 25;
  } else {
    feedback.push(`Don't forget to mention where you're based!`);
  }

  const hasContribution = CONTRIBUTION_INDICATORS.some(indicator => lowerText.includes(indicator));
  if (hasContribution) {
    score += 25;
  } else {
    feedback.push(`Share how you'd like to contribute to Superteam MY!`);
  }

  const valid = score >= 50;

  return {
    valid,
    score,
    feedback: feedback.length > 0 ? feedback : null,
  };
}

export function isValidIntro(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  if (!validateIntroLength(text)) {
    return false;
  }

  if (config.validation.enableFormatValidation) {
    const result = validateIntroFormat(text);
    return result.valid;
  }

  return true;
}

export function getIntroFeedback(text) {
  const result = validateIntroFormat(text);
  return result.feedback;
}

import { config } from './config.js';

const INTRO_KEYWORDS = [
  'based', 'located', 'from',
  'contribute', 'looking', 'want', 'excited', 'connect', 'build', 'support', 'mentor', 'learn',
  'i am', "i'm", 'im', 'name', 'hey', 'hello', 'hi',
  'building', 'developer', 'designer', 'founder', 'working', 'project', 'team', 'company'
];

export function validateIntroLength(text) {
  return text.length >= config.validation.minIntroLength;
}

export function validateIntroFormat(text) {
  if (!config.validation.enableFormatValidation) {
    return { valid: true, feedback: null };
  }

  const lowerText = text.toLowerCase();
  const feedback = [];

  if (!validateIntroLength(text)) {
    feedback.push(`Your intro seems a bit short. Try adding more details about yourself!`);
  }

  const hasKeywords = INTRO_KEYWORDS.some(keyword => lowerText.includes(keyword));
  if (!hasKeywords) {
    feedback.push(`Consider introducing yourself (e.g., "I'm...", "My name is...", "Hey everyone...")`);
  }

  const valid = validateIntroLength(text) && hasKeywords;

  return {
    valid,
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

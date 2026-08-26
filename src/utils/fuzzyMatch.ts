/**
 * Fuzzy Matching & Levenshtein Distance Utility for Kollywood trivia
 */

export function calculateLevenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (b[j - 1] === a[i - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // replace non-letter/non-number with space (preserves Tamil, English, and all Unicode alphabets)
    .replace(/\s+/g, ' ')           // collapse multiple spaces
    .trim();
}

/**
 * Normalizes common Tamil english transliteration variants
 * e.g. "dh" -> "d", "th" -> "t", repeated vowels "aa"->"a"
 */
function phoneticSimplify(text: string): string {
  return normalizeText(text)
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/zh/g, 'l')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/ck/g, 'k')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/sh/g, 's')
    .replace(/ph/g, 'f')
    .replace(/ai/g, 'ay')
    .replace(/ou/g, 'au');
}

/**
 * Checks whether user guess matches the target name or any of its aliases
 */
export function checkAnswer(guess: string, targetName: string, aliases: string[] = []): boolean {
  const normGuess = normalizeText(guess);
  if (!normGuess) return false;

  const candidateTargets = [targetName, ...aliases].filter(Boolean);

  for (const target of candidateTargets) {
    const normTarget = normalizeText(target);
    if (!normTarget) continue;

    // 1. Direct match
    if (normGuess === normTarget) return true;

    // 2. Direct phonetic match
    const phonGuess = phoneticSimplify(normGuess);
    const phonTarget = phoneticSimplify(normTarget);
    if (phonGuess === phonTarget) return true;

    // 3. Substring match for multi-word names (e.g. "Vijay" inside "Thalapathy Vijay" or "Rajini" inside "Rajinikanth")
    if (normTarget.split(' ').includes(normGuess) || (normGuess.length >= 4 && normTarget.includes(normGuess))) {
      return true;
    }

    // 4. Levenshtein distance match
    const maxDistance = normTarget.length <= 4 ? 1 : 2;
    const distance = calculateLevenshtein(normGuess, normTarget);
    if (distance <= maxDistance) return true;

    // 5. Phonetic Levenshtein distance
    const phonDistance = calculateLevenshtein(phonGuess, phonTarget);
    if (phonDistance <= maxDistance) return true;
  }

  return false;
}

/**
 * Generates an masked hint for a name given the number of hints already revealed
 * e.g., "Rajinikanth" with hintLevel 0 => "R _ _ _ _ _ _ _ _ _ _"
 * hintLevel 1 => "R a _ _ _ _ _ _ _ _ _"
 */
export function getMaskedDisplay(name: string, hintLevel: number = 0): string {
  if (!name) return '';
  const words = name.split(' ');

  return words
    .map((word) => {
      let result = '';
      for (let i = 0; i < word.length; i++) {
        if (i <= hintLevel) {
          result += word[i].toUpperCase();
        } else {
          result += '_';
        }
        if (i < word.length - 1) result += ' ';
      }
      return result;
    })
    .join('   ');
}

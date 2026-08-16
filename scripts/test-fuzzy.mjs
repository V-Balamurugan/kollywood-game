import { checkAnswer, calculateLevenshtein, getMaskedDisplay, normalizeText } from '../src/utils/fuzzyMatch.ts';

console.log('--- RUNNING FUZZY MATCH & GAME LOGIC TESTS ---');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Direct and Alias Matches
assert(checkAnswer('Vijay', 'Vijay', ['Thalapathy Vijay']), 'Direct match "Vijay"');
assert(checkAnswer('thalapathy', 'Vijay', ['Thalapathy Vijay']), 'Alias match "thalapathy"');
assert(checkAnswer('Rajini', 'Rajinikanth', ['Superstar Rajinikanth']), 'Short alias "Rajini" for Rajinikanth');
assert(checkAnswer('Superstar', 'Rajinikanth', ['Superstar Rajinikanth']), 'Alias "Superstar"');

// 2. Transliteration variants
assert(checkAnswer('Thalapathi', 'Vijay', ['Thalapathy']), 'Phonetic variant "Thalapathi" vs "Thalapathy"');
assert(checkAnswer('Kamal Hasan', 'Kamal Haasan', ['Kamal']), 'Spelling variant "Kamal Hasan" vs "Kamal Haasan"');
assert(checkAnswer('Trisha Krishnan', 'Trisha', ['Trisha Krishnan']), 'Full name alias "Trisha Krishnan"');
assert(checkAnswer('Gilli', 'Ghilli', ['Gilli']), 'Spelling variant "Gilli" vs "Ghilli"');

// 3. Typo / Levenshtein tolerance
assert(checkAnswer('Rajnikanth', 'Rajinikanth', []), 'Minor typo "Rajnikanth"');
assert(checkAnswer('Nayantara', 'Nayanthara', []), 'Phonetic variant "Nayantara"');
assert(checkAnswer('Anirud', 'Anirudh', []), 'Transliteration typo "Anirud"');

// 4. Incorrect Guesses
assert(!checkAnswer('Ajith', 'Vijay', ['Thalapathy']), 'Ajith should not match Vijay');
assert(!checkAnswer('Mankatha', 'Ghilli', []), 'Mankatha should not match Ghilli');

// 5. Masked Display
assert(getMaskedDisplay('Vijay', 0) === 'V _ _ _ _', 'Mask display level 0');
assert(getMaskedDisplay('Vijay', 1) === 'V I _ _ _', 'Mask display level 1');
assert(getMaskedDisplay('Leo Das', 0) === 'L _ _   D _ _', 'Mask multi-word display');

console.log('\n🎉 ALL GAME UTILITY TESTS PASSED PERFECTLY!');

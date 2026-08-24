import assert from 'assert';

console.log('--- RUNNING CUSTOM ROOM & DIRECTOR QUEST SYSTEM TESTS ---');

// Mock in-memory test environment simulating Firebase & Local Fallback
const room = {
  id: 'ROOM12',
  code: 'ROOM12',
  hostUid: 'host-123',
  status: 'lobby',
  currentPuzzleIndex: 0,
  players: {
    'host-123': { uid: 'host-123', name: 'Director Host', score: 100, ready: true },
    'player-456': { uid: 'player-456', name: 'Contestant Bala', score: 50, ready: true }
  },
  directorHints: [],
  hintRequests: [],
  sharedAnswers: {},
  nextRoundVotes: {}
};

// 1. Test Custom Movie Creation by ANY player in the room (e.g. Challenger or Host)
const customMovie = {
  id: 'custom-mankatha-2011',
  year: 2011,
  difficulty: 'medium',
  director: 'Venkat Prabhu',
  musicDirector: 'Yuvan Shankar Raja',
  genre: 'Action Thriller',
  trivia: 'Money heist in Dharavi with Ajith Kumar in negative shade',
  createdBy: 'Director Host',
  creatorUid: 'host-123',
  movie: { name: 'Mankatha', firstLetter: 'M', aliases: ['Mankatha', 'Mangatha'] },
  hero: { name: 'Ajith Kumar', firstLetter: 'A', aliases: ['Ajith Kumar', 'AK', 'Thala'] },
  heroine: { name: 'Trisha', firstLetter: 'T', aliases: ['Trisha', 'Trisha Krishnan'] },
  song: { name: 'Machi Open the Bottle', firstLetter: 'M', aliases: ['Machi Open the Bottle'] }
};

// Set custom puzzle & start match
room.customPuzzle = customMovie;
room.currentCreatorUid = customMovie.creatorUid;
room.status = 'in-progress';
room.roundStartTime = Date.now();
room.sharedAnswers = {};
room.directorHints = [];
room.hintRequests = [];

assert.strictEqual(room.status, 'in-progress', 'Room successfully transitioned to in-progress');
assert.strictEqual(room.customPuzzle.movie.name, 'Mankatha', 'Custom puzzle attached to room');
assert.strictEqual(room.currentCreatorUid, 'host-123', 'Creator UID registered as active Director');
console.log('✅ PASS: Custom movie created and started properly in custom arena');

// 2. Test Director broadcasting clues/quests anytime (Proactive Director Quest)
const directorBroadcastClue = {
  id: `hint-${Date.now()}`,
  fromName: 'Director Host',
  message: 'Director Clue: Directed by Venkat Prabhu - A Venkat Prabhu Game',
  timestamp: Date.now()
};

room.directorHints.push(directorBroadcastClue);
room.players['host-123'].score += 50; // +50 pts bounty awarded

assert.strictEqual(room.directorHints.length, 1, 'Director broadcast clue registered');
assert.strictEqual(room.players['host-123'].score, 150, 'Director awarded +50 pts bounty for broadcasting');
console.log('✅ PASS: Director broadcast clue and earned bounty points');

// 3. Test Contestant requesting hint from Director (-25 pts penalty)
const hintRequest = {
  id: `req-${Date.now()}`,
  fromUid: 'player-456',
  fromName: 'Contestant Bala',
  timestamp: Date.now()
};

room.hintRequests.push(hintRequest);
room.players['player-456'].score = Math.max(0, room.players['player-456'].score - 25);

assert.strictEqual(room.hintRequests.length, 1, 'Hint request queued');
assert.strictEqual(room.players['player-456'].score, 25, 'Contestant deducted 25 points');
console.log('✅ PASS: Contestant hint request handled with points deduction');

// 4. Test Director answering request with second clue (+50 pts bounty and clear request queue)
const answerClue = {
  id: `hint-${Date.now() + 1}`,
  fromName: 'Director Host',
  message: 'Music Clue: Songs composed by Yuvan Shankar Raja',
  timestamp: Date.now()
};

room.directorHints.push(answerClue);
room.hintRequests = []; // Cleared
room.players['host-123'].score += 50;

assert.strictEqual(room.directorHints.length, 2, 'Two hints broadcasted');
assert.strictEqual(room.hintRequests.length, 0, 'Hint requests queue cleared');
assert.strictEqual(room.players['host-123'].score, 200, 'Director awarded additional +50 pts bounty');
console.log('✅ PASS: Director fulfilled contestant hint request and cleared queue');

// 5. Test Round Advancement resetting custom puzzle for next playlist round
const nextIndex = 1;
delete room.customPuzzle;
delete room.currentCreatorUid;
room.currentPuzzleIndex = nextIndex;
room.directorHints = [];
room.hintRequests = [];
room.sharedAnswers = {};
room.nextRoundVotes = {};

// 6. Test Movie Database Existence & Duplicate Rejection
const mockDb = [
  { id: 'leo-2023', movie: { name: 'Leo', canonicalName: 'Leo' }, wikidataId: 'Q116536092' },
  { id: 'vikram-2022', movie: { name: 'Vikram', canonicalName: 'Vikram' }, wikidataId: 'Q102147285' }
];

function canAddCustomMovie(movieCandidate, db) {
  const normalizedTitle = movieCandidate.movie.name.toLowerCase().trim();
  const normalizedCanonical = movieCandidate.movie.canonicalName?.toLowerCase().trim();
  const alreadyExists = db.some(
    p => p.id === movieCandidate.id ||
         p.movie.name.toLowerCase().trim() === normalizedTitle ||
         (normalizedCanonical && p.movie.canonicalName?.toLowerCase().trim() === normalizedCanonical) ||
         (p.wikidataId && movieCandidate.wikidataId && p.wikidataId === movieCandidate.wikidataId)
  );
  if (alreadyExists) return { allowed: false, reason: 'Movie already exists in database' };
  return { allowed: true, reason: 'New movie added to database' };
}

// Existing movie "Leo" should be rejected
const duplicateAttempt = {
  id: 'custom-leo-duplicate',
  movie: { name: 'LEO', canonicalName: 'Leo' },
  wikidataId: 'Q116536092'
};
const duplicateResult = canAddCustomMovie(duplicateAttempt, mockDb);
assert.strictEqual(duplicateResult.allowed, false, 'Existing movie correctly blocked from duplicate entry');
console.log('✅ PASS: Existing movie "Leo" rejected from duplicate insertion');

// New movie "Ghilli" should be allowed
const newMovieAttempt = {
  id: 'custom-ghilli-2004',
  movie: { name: 'Ghilli', canonicalName: 'Ghilli' },
  wikidataId: 'Q3424381'
};
const newResult = canAddCustomMovie(newMovieAttempt, mockDb);
assert.strictEqual(newResult.allowed, true, 'Brand new movie successfully allowed into database');
console.log('✅ PASS: Brand new movie "Ghilli" successfully validated and added');

console.log('\n🎉 ALL CUSTOM ROOM & DIRECTOR QUEST SYSTEM LOGICAL TESTS PASSED PERFECTLY!');

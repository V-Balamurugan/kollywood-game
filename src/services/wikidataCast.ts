import { CastMember, MovieCast, Puzzle } from '../types/game';

// Re-export core types
export type { CastMember, MovieCast };

// Confidential Wiki Endpoints configured via Environment Variables (.env)
export const WIKIDATA_API_URL = (import.meta as any).env?.VITE_WIKIDATA_API_URL || 'https://www.wikidata.org/w/api.php';
export const WIKIPEDIA_API_URL = (import.meta as any).env?.VITE_WIKIPEDIA_API_URL || 'https://en.wikipedia.org/w/api.php';
export const WIKIPEDIA_REST_URL = (import.meta as any).env?.VITE_WIKIPEDIA_REST_URL || 'https://en.wikipedia.org/api/rest_v1';
export const WIKIMEDIA_COMMONS_URL = (import.meta as any).env?.VITE_WIKIMEDIA_COMMONS_URL || 'https://commons.wikimedia.org/wiki/Special:FilePath';
export const WIKIDATA_WEB_URL = (import.meta as any).env?.VITE_WIKIDATA_WEB_URL || 'https://www.wikidata.org/wiki';

// Local storage prefix and TTL (7 days in ms)
const CACHE_PREFIX = 'kollywood_cast_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// In-memory runtime cache for lightning-fast lookups during a game session
const memoryCache = new Map<string, MovieCast>();

export interface MovieCandidate {
  qid: string;
  title: string;
  cleanTitle: string;
  year?: number;
  director?: string;
  snippet: string;
  poster?: string;
}

export interface FullCastPerson {
  id: string;
  canonicalName: string;
  suggestedDisplayName: string;
  character?: string;
  imageUrl?: string;
  gender: 'male' | 'female';
  wikidataUrl: string;
}

export interface FullMovieDetails {
  qid: string;
  movieTitle: string;
  suggestedDisplayTitle: string;
  year: number;
  director?: string;
  musicDirector?: string;
  genre?: string;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  hero: FullCastPerson | null;
  heroine: FullCastPerson | null;
  cast: FullCastPerson[];
  source: 'wikidata' | 'database';
}

export interface MovieAutoFillData {
  title?: string;
  year?: number;
  director?: string;
  musicDirector?: string;
  genre?: string;
  trivia?: string;
  heroName?: string;
  heroineName?: string;
  poster?: string;
  cast: CastMember[];
}

// Pre-seeded popular Kollywood movie cast data for instant offline/zero-latency loads
const PRE_SEEDED_CASTS: Record<string, CastMember[]> = {
  leo: [
    {
      id: 'Q315796',
      name: 'Vijay',
      character: 'Parthiban / Leo Das',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Vijay_at_the_Varisu_Audio_Launch.jpg/300px-Vijay_at_the_Varisu_Audio_Launch.jpg',
      wikidataUrl: 'https://www.wikidata.org/wiki/Q315796'
    },
    {
      id: 'Q273273',
      name: 'Trisha',
      character: 'Sathya',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Trisha_Krishnan_at_PS1_promotions.jpg/300px-Trisha_Krishnan_at_PS1_promotions.jpg',
      wikidataUrl: 'https://www.wikidata.org/wiki/Q273273'
    },
    {
      id: 'Q326248',
      name: 'Sanjay Dutt',
      character: 'Antony Das',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Sanjay_Dutt_promoting_K.G.F_Chapter_2.jpg/300px-Sanjay_Dutt_promoting_K.G.F_Chapter_2.jpg',
      wikidataUrl: 'https://www.wikidata.org/wiki/Q326248'
    },
    {
      id: 'Q277284',
      name: 'Arjun Sarja',
      character: 'Harold Das',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Arjun_Sarja_at_Nibunan_Press_Meet.jpg/300px-Arjun_Sarja_at_Nibunan_Press_Meet.jpg',
      wikidataUrl: 'https://www.wikidata.org/wiki/Q277284'
    }
  ],
  vikram: [
    {
      id: 'Q381163',
      name: 'Kamal Haasan',
      character: 'Agent Vikram / Karnan',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Kamal_Haasan_at_Vikram_Success_Meet.jpg/300px-Kamal_Haasan_at_Vikram_Success_Meet.jpg',
      wikidataUrl: 'https://www.wikidata.org/wiki/Q381163'
    },
    {
      id: 'Q3538494',
      name: 'Vijay Sethupathi',
      character: 'Sandhanam',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Vijay_Sethupathi_at_Master_Press_Meet.jpg/300px-Vijay_Sethupathi_at_Master_Press_Meet.jpg',
      wikidataUrl: 'https://www.wikidata.org/wiki/Q3538494'
    },
    {
      id: 'Q5429500',
      name: 'Fahadh Faasil',
      character: 'Amar',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Fahadh_Faasil_at_Trance_Promotion.jpg/300px-Fahadh_Faasil_at_Trance_Promotion.jpg',
      wikidataUrl: 'https://www.wikidata.org/wiki/Q5429500'
    },
    {
      id: 'Q5528739',
      name: 'Gayathrie',
      character: 'Gayathri Amar',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Gayathrie_Shankar_at_Super_Deluxe_Launch.jpg/300px-Gayathrie_Shankar_at_Super_Deluxe_Launch.jpg',
      wikidataUrl: 'https://www.wikidata.org/wiki/Q5528739'
    }
  ]
};

/**
 * Normalizes movie titles for reliable lookup and cache keys
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent Director Display Name Generator:
 * Maps formal canonical API / legal names (e.g. "C. Joseph Vijay", "Diana Mariam Kurian")
 * to the popular screen name recognizable by fans (e.g. "Vijay", "Nayanthara").
 */
export function generateSuggestedDisplayName(canonicalName: string): string {
  if (!canonicalName) return '';

  const lower = canonicalName.toLowerCase().trim();

  // Known superstar mappings for Kollywood
  const superstarMap: Record<string, string> = {
    'c. joseph vijay': 'Vijay',
    'joseph vijay': 'Vijay',
    'vijay chandrasekhar': 'Vijay',
    'diana mariam kurian': 'Nayanthara',
    'nayantara': 'Nayanthara',
    'trisha krishnan': 'Trisha',
    'shivaji rao gaekwad': 'Rajinikanth',
    'rajnikanth': 'Rajinikanth',
    'kamal haasan': 'Kamal Haasan',
    'kamalhasan': 'Kamal Haasan',
    'ajith kumar': 'Ajith Kumar',
    'ajith': 'Ajith Kumar',
    'saravanan sivakumar': 'Suriya',
    'surya sivakumar': 'Suriya',
    'surya': 'Suriya',
    'karthi sivakumar': 'Karthi',
    'dhanush': 'Dhanush',
    'venkatesh prabhu kasthuri raja': 'Dhanush',
    'vijaya gurunatha sethupathi': 'Vijay Sethupathi',
    'vijay sethupathi': 'Vijay Sethupathi',
    'silambarasan thesingu rajendar': 'Silambarasan',
    'silambarasan': 'Silambarasan',
    'str': 'Silambarasan',
    'simbu': 'Silambarasan',
    'sivakarthikeyan doss': 'Sivakarthikeyan',
    'sivakarthikeyan': 'Sivakarthikeyan',
    'vikram kennedy': 'Vikram',
    'chiyaan vikram': 'Vikram',
    'anushka shetty': 'Anushka Shetty',
    'sweety shetty': 'Anushka Shetty',
    'keerthy suresh': 'Keerthy Suresh',
    'samantha ruth prabhu': 'Samantha',
    'samantha': 'Samantha',
    'sai pallavi senthamarai': 'Sai Pallavi',
    'sai pallavi': 'Sai Pallavi',
    'rashmika mandanna': 'Rashmika',
    'tamannaah bhatia': 'Tamannaah',
    'tamanna bhatia': 'Tamannaah',
    's. j. surya': 'SJ Surya',
    's. j. suryah': 'SJ Surya',
    'sj suryah': 'SJ Surya',
    'fadhadh faasil': 'Fahadh Faasil',
    'fahadh faasil': 'Fahadh Faasil'
  };

  if (superstarMap[lower]) {
    return superstarMap[lower];
  }

  // Remove common initials and honorific prefixes
  let clean = canonicalName
    .replace(/^C\.\s*Joseph\s+/i, '')
    .replace(/^[A-Z]\.\s*[A-Z]\.\s*/i, '')
    .replace(/^[A-Z]\.\s*/i, '')
    .trim();

  return clean || canonicalName;
}

/**
 * Searches Wikipedia and Wikidata for Tamil/Indian movie candidates to handle ambiguous film titles.
 * e.g., "Vikram" -> ["Vikram (2022 film)", "Vikram (1986 film)"]
 */
export async function searchMovieCandidates(
  query: string,
  signal?: AbortSignal
): Promise<MovieCandidate[]> {
  if (!query || !query.trim()) return [];

  const candidates: MovieCandidate[] = [];

  try {
    const searchUrl = `${WIKIPEDIA_API_URL}?action=query&list=search&srsearch=${encodeURIComponent(
      query.trim() + ' film'
    )}&format=json&origin=*`;

    const res = await fetch(searchUrl, {
      signal,
      headers: { 'User-Agent': 'KollywoodGame/1.0 (contact@kollywoodgame.com)' }
    });

    if (!res.ok) return [];
    const data = await res.json();
    const hits = (data.query?.search || []).slice(0, 8);

    for (const hit of hits) {
      const title = hit.title;
      const snippet = (hit.snippet || '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"');

      // Filter to relevant film results
      const isFilm =
        title.toLowerCase().includes('film') ||
        snippet.toLowerCase().includes('film') ||
        snippet.toLowerCase().includes('directed by') ||
        snippet.toLowerCase().includes('tamil');

      if (!isFilm) continue;

      // Extract QID
      const propUrl = `${WIKIPEDIA_API_URL}?action=query&titles=${encodeURIComponent(
        title
      )}&prop=pageprops&format=json&origin=*`;

      const propRes = await fetch(propUrl, {
        signal,
        headers: { 'User-Agent': 'KollywoodGame/1.0 (contact@kollywoodgame.com)' }
      });

      if (!propRes.ok) continue;
      const propData = await propRes.json();
      const pages = propData.query?.pages || {};

      let qid: string | undefined;
      for (const pid of Object.keys(pages)) {
        qid = pages[pid]?.pageprops?.wikibase_item;
      }

      if (qid && !candidates.some((c) => c.qid === qid)) {
        const yearMatch = title.match(/\b(19\d\d|20\d\d)\b/);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
        const cleanTitle = title.replace(/\s*\([^)]*film[^)]*\)/gi, '').trim();

        candidates.push({
          qid,
          title,
          cleanTitle,
          year,
          snippet: snippet.slice(0, 150)
        });
      }
    }
  } catch (err) {
    console.warn('Candidate search failed:', err);
  }

  return candidates;
}

/**
 * Fetches full structured movie details and cast with images and canonical/display names by Wikidata QID.
 */
export async function fetchFullMovieDetailsByQid(
  qid: string,
  titleHint?: string,
  signal?: AbortSignal
): Promise<FullMovieDetails | null> {
  try {
    const entityUrl = `${WIKIDATA_API_URL}?action=wbgetentities&ids=${qid}&props=claims|labels|sitelinks&languages=en&format=json&origin=*`;
    const res = await fetch(entityUrl, {
      signal,
      headers: { 'User-Agent': 'KollywoodGame/1.0 (contact@kollywoodgame.com)' }
    });

    if (!res.ok) return null;
    const data = await res.json();
    const entity = data.entities?.[qid];
    if (!entity) return null;

    const movieTitle = entity.labels?.en?.value || titleHint || 'Kollywood Film';
    const enwikiTitle = entity.sitelinks?.enwiki?.title;
    const claims = entity.claims || {};

    const directorQid = claims.P57?.[0]?.mainsnak?.datavalue?.value?.id;
    const musicQid = claims.P86?.[0]?.mainsnak?.datavalue?.value?.id;
    const genreQid = claims.P136?.[0]?.mainsnak?.datavalue?.value?.id;
    const pubDateStr = claims.P577?.[0]?.mainsnak?.datavalue?.value?.time;

    const year = pubDateStr
      ? parseInt(pubDateStr.match(/[0-9]{4}/)?.[0] || '2024', 10)
      : 2024;

    // Fetch official movie poster & plot summary directly from Wikidata & Wikipedia
    let posterUrl: string | undefined;
    let overview: string | undefined;

    try {
      const posterResult = await fetchWikidataMoviePoster(qid, enwikiTitle || titleHint || movieTitle, claims);
      if (posterResult?.posterUrl) posterUrl = posterResult.posterUrl;
      if (posterResult?.extract) overview = posterResult.extract;
    } catch (e) {
      console.warn('Wikidata poster lookup notice:', e);
    }

    const castClaims = claims.P161 || [];
    const castItems: { actorQid: string; charQualifier?: string }[] = [];
    for (const c of castClaims.slice(0, 15)) {
      const actorQid = c.mainsnak?.datavalue?.value?.id;
      if (!actorQid) continue;
      const charQualifier = c.qualifiers?.P453?.[0]?.datavalue?.value?.id;
      castItems.push({ actorQid, charQualifier });
    }

    const allIds = Array.from(
      new Set([
        directorQid,
        musicQid,
        genreQid,
        ...castItems.map((c) => c.actorQid),
        ...castItems.map((c) => c.charQualifier)
      ].filter(Boolean) as string[])
    );

    let entities: Record<string, any> = {};

    if (allIds.length > 0) {
      const batchUrl = `${WIKIDATA_API_URL}?action=wbgetentities&ids=${allIds.join(
        '|'
      )}&props=claims|labels&languages=en&format=json&origin=*`;

      const bRes = await fetch(batchUrl, {
        signal,
        headers: { 'User-Agent': 'KollywoodGame/1.0 (contact@kollywoodgame.com)' }
      });

      if (bRes.ok) {
        const bData = await bRes.json();
        entities = bData.entities || {};
      }
    }

    const director = directorQid ? entities[directorQid]?.labels?.en?.value : undefined;
    const musicDirector = musicQid ? entities[musicQid]?.labels?.en?.value : undefined;
    const genre = genreQid ? entities[genreQid]?.labels?.en?.value : 'Action / Drama';

    const fullCast: FullCastPerson[] = [];
    let detectedHero: FullCastPerson | null = null;
    let detectedHeroine: FullCastPerson | null = null;

    for (const item of castItems) {
      const ent = entities[item.actorQid];
      if (!ent) continue;
      const canonicalName = ent.labels?.en?.value;
      if (!canonicalName) continue;

      const charName = item.charQualifier ? entities[item.charQualifier]?.labels?.en?.value : undefined;
      const genderQid = ent.claims?.P21?.[0]?.mainsnak?.datavalue?.value?.id;
      const gender: 'male' | 'female' = genderQid === 'Q6581072' ? 'female' : 'male';

      const imageClaim = ent.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
      let imageUrl: string | undefined;
      if (imageClaim && typeof imageClaim === 'string') {
        imageUrl = `${WIKIMEDIA_COMMONS_URL}/${encodeURIComponent(
          imageClaim
        )}?width=300`;
      }

      const person: FullCastPerson = {
        id: item.actorQid,
        canonicalName,
        suggestedDisplayName: generateSuggestedDisplayName(canonicalName),
        character: charName,
        imageUrl,
        gender,
        wikidataUrl: `${WIKIDATA_WEB_URL}/${item.actorQid}`
      };

      fullCast.push(person);

      if (gender === 'male' && !detectedHero) {
        detectedHero = person;
      } else if (gender === 'female' && !detectedHeroine) {
        detectedHeroine = person;
      }
    }

    return {
      qid,
      movieTitle,
      suggestedDisplayTitle: movieTitle,
      year,
      director,
      musicDirector,
      genre,
      overview,
      posterUrl,
      backdropUrl: posterUrl,
      hero: detectedHero,
      heroine: detectedHeroine,
      cast: fullCast,
      source: 'wikidata'
    };
  } catch (err) {
    console.warn(`Failed to fetch movie details for QID ${qid}:`, err);
    return null;
  }
}

/**
 * Fetches movie poster image directly from Wikidata / Wikimedia Commons / Wikipedia page summary.
 */
export async function fetchWikidataMoviePoster(
  qid: string,
  wikiTitleHint?: string,
  existingClaims?: Record<string, any>
): Promise<{ posterUrl?: string; extract?: string } | undefined> {
  try {
    let claims = existingClaims;
    let enwikiTitle = wikiTitleHint;

    if (!claims) {
      const entityUrl = `${WIKIDATA_API_URL}?action=wbgetentities&ids=${qid}&props=claims|sitelinks&languages=en&format=json&origin=*`;
      const res = await fetch(entityUrl, {
        headers: { 'User-Agent': 'KollywoodGame/1.0 (contact@kollywoodgame.com)' }
      });
      if (res.ok) {
        const data = await res.json();
        const ent = data.entities?.[qid];
        claims = ent?.claims || {};
        if (!enwikiTitle) enwikiTitle = ent?.sitelinks?.enwiki?.title;
      }
    }

    // 1. Direct Wikidata claims: P3383 (film poster), P18 (image), P154 (logo image)
    const posterClaim = claims?.P3383?.[0]?.mainsnak?.datavalue?.value ||
                        claims?.P18?.[0]?.mainsnak?.datavalue?.value ||
                        claims?.P154?.[0]?.mainsnak?.datavalue?.value;

    let posterUrl: string | undefined;
    if (posterClaim && typeof posterClaim === 'string') {
      posterUrl = `${WIKIMEDIA_COMMONS_URL}/${encodeURIComponent(posterClaim)}?width=500`;
    }

    let extract: string | undefined;

    // 2. Wikipedia Lead Poster Image & Synopsis via REST Summary API
    if (enwikiTitle) {
      const summaryUrl = `${WIKIPEDIA_REST_URL}/page/summary/${encodeURIComponent(enwikiTitle)}`;
      const sRes = await fetch(summaryUrl, {
        headers: { 'User-Agent': 'KollywoodGame/1.0 (contact@kollywoodgame.com)' }
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        if (!posterUrl) {
          const leadImg = sData.originalimage?.source || sData.thumbnail?.source;
          if (leadImg && typeof leadImg === 'string') {
            posterUrl = leadImg;
          }
        }
        if (sData.extract && typeof sData.extract === 'string') {
          extract = sData.extract;
        }
      }
    }

    return { posterUrl, extract };
  } catch (err) {
    console.warn('Wikidata poster fetch error:', err);
  }
  return undefined;
}

/**
 * Reads from localStorage cache with 7-day TTL check
 */
function getFromLocalStorage(key: string): MovieCast | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MovieCast;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Saves to localStorage cache
 */
function saveToLocalStorage(key: string, data: MovieCast): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not cache movie cast to localStorage:', e);
  }
}

/**
 * Searches and resolves a movie to its Wikidata QID and Wikipedia title
 */
async function resolveMovieWikidataQid(
  movieName: string,
  inputYear?: number,
  director?: string,
  signal?: AbortSignal
): Promise<{ qid: string; title: string } | null> {
  const cleanMovieName = movieName.trim();
  const searchQueries = [
    `${cleanMovieName} ${inputYear || ''} film`.trim(),
    `${cleanMovieName} film`,
    `${cleanMovieName} ${director || ''} film`.trim(),
    cleanMovieName
  ];

  for (const q of searchQueries) {
    try {
      const searchUrl = `${WIKIPEDIA_API_URL}?action=query&list=search&srsearch=${encodeURIComponent(
        q
      )}&format=json&origin=*`;

      const res = await fetch(searchUrl, {
        signal,
        headers: { 'User-Agent': 'KollywoodGame/1.0 (contact@kollywoodgame.com)' }
      });

      if (!res.ok) continue;

      const data = await res.json();
      const hits = data.query?.search;
      if (!hits || hits.length === 0) continue;

      for (const hit of hits.slice(0, 3)) {
        const title = hit.title;
        const propUrl = `${WIKIPEDIA_API_URL}?action=query&titles=${encodeURIComponent(
          title
        )}&prop=pageprops&format=json&origin=*`;

        const propRes = await fetch(propUrl, {
          signal,
          headers: { 'User-Agent': 'KollywoodGame/1.0 (contact@kollywoodgame.com)' }
        });

        if (!propRes.ok) continue;
        const propData = await propRes.json();
        const pages = propData.query?.pages;
        if (!pages) continue;

        for (const pageId of Object.keys(pages)) {
          const qid = pages[pageId]?.pageprops?.wikibase_item;
          if (qid) {
            return { qid, title };
          }
        }
      }
    } catch {
      // Continue to next fallback query
    }
  }

  return null;
}

/**
 * Fetches cast members, roles, and profile images using the Wikidata Action API in a single batch.
 */
async function fetchCastFromWikidataEntity(
  qid: string,
  signal?: AbortSignal
): Promise<CastMember[]> {
  try {
    const details = await fetchFullMovieDetailsByQid(qid, undefined, signal);
    if (!details) return [];

    return details.cast.map((c) => ({
      id: c.id,
      name: c.suggestedDisplayName || c.canonicalName,
      character: c.character,
      image: c.imageUrl,
      wikidataUrl: c.wikidataUrl
    }));
  } catch {
    return [];
  }
}

/**
 * Main public entrypoint: Resolves and returns cast members with profile images for any movie.
 */
export async function fetchMovieCast(
  movieName: string,
  year?: number,
  director?: string
): Promise<CastMember[]> {
  if (!movieName || !movieName.trim()) return [];

  const normKey = normalizeKey(movieName);

  if (memoryCache.has(normKey)) {
    return memoryCache.get(normKey)!.members;
  }

  if (PRE_SEEDED_CASTS[normKey]) {
    const preSeeded: MovieCast = {
      movieName,
      year,
      members: PRE_SEEDED_CASTS[normKey],
      fetchedAt: Date.now()
    };
    memoryCache.set(normKey, preSeeded);
    saveToLocalStorage(normKey, preSeeded);
    return preSeeded.members;
  }

  const cached = getFromLocalStorage(normKey);
  if (cached && cached.members && cached.members.length > 0) {
    memoryCache.set(normKey, cached);
    return cached.members;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const match = await resolveMovieWikidataQid(
      movieName.trim(),
      year,
      director,
      controller.signal
    );

    if (match && match.qid) {
      const cast = await fetchCastFromWikidataEntity(match.qid, controller.signal);
      if (cast && cast.length > 0) {
        const result: MovieCast = {
          movieName,
          qid: match.qid,
          year,
          members: cast,
          fetchedAt: Date.now()
        };
        memoryCache.set(normKey, result);
        saveToLocalStorage(normKey, result);
        return cast;
      }
    }
  } catch (err) {
    console.warn(`Cast lookup failed for "${movieName}":`, err);
  } finally {
    clearTimeout(timeoutId);
  }

  return [];
}

/**
 * Intelligent 1-click Auto-Fill: Queries Wikipedia and Wikidata to extract
 * full film metadata, director, music composer, hero, heroine, and plot synopsis.
 */
export async function autoFillMovieFromWikidata(
  movieName: string,
  inputYear?: number
): Promise<MovieAutoFillData | null> {
  if (!movieName || !movieName.trim()) return null;

  try {
    const match = await resolveMovieWikidataQid(movieName.trim(), inputYear);
    if (!match || !match.qid) return null;

    const details = await fetchFullMovieDetailsByQid(match.qid, match.title);
    if (!details) return null;

    return {
      title: details.movieTitle,
      year: details.year,
      director: details.director,
      musicDirector: details.musicDirector,
      genre: details.genre,
      trivia: details.overview,
      heroName: details.hero?.suggestedDisplayName || details.hero?.canonicalName,
      heroineName: details.heroine?.suggestedDisplayName || details.heroine?.canonicalName,
      poster: details.posterUrl,
      cast: details.cast.map((c) => ({
        id: c.id,
        name: c.suggestedDisplayName || c.canonicalName,
        character: c.character,
        image: c.imageUrl,
        wikidataUrl: c.wikidataUrl
      }))
    };
  } catch (err) {
    console.warn('Wikidata auto-fill failed:', err);
    return null;
  }
}

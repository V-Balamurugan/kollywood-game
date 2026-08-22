/**
 * OMDB Tamil Cinema Movie & Poster Resolver Script
 * Only selects authentic Kollywood (Tamil language) films.
 * Usage: node scripts/resolve-omdb.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OMDB_API_KEY = process.env.VITE_OMDB_API_KEY || '140528bd';
const PUZZLES_PATH = path.join(__dirname, '../src/data/puzzles.json');

async function fetchOMDBMovie(title, year) {
  try {
    let url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
    if (year) url += `&y=${year}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === 'True') {
      // Strictly verify it's a Tamil film
      const isTamil = data.Language && data.Language.toLowerCase().includes('tamil');
      if (isTamil) {
        return data;
      } else {
        console.warn(`  ⚠️ Found "${data.Title}" (${data.Year}), but language is "${data.Language}" (not Tamil). Skipping.`);
      }
    } else {
      // Try search fallback
      const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(title)}&type=movie&apikey=${OMDB_API_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (searchData.Response === 'True' && searchData.Search && searchData.Search.length > 0) {
        for (const candidate of searchData.Search) {
          const detailRes = await fetch(`https://www.omdbapi.com/?i=${candidate.imdbID}&apikey=${OMDB_API_KEY}`);
          const detailData = await detailRes.json();
          if (detailData.Response === 'True' && detailData.Language && detailData.Language.toLowerCase().includes('tamil')) {
            return detailData;
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error querying OMDB for ${title}:`, err.message);
  }
  return null;
}

async function resolveTamilMovies() {
  console.log('🎬 Resolving Kollywood (Tamil) movie posters and metadata from OMDB...');
  const puzzles = JSON.parse(fs.readFileSync(PUZZLES_PATH, 'utf-8'));

  let updatedCount = 0;

  for (const puzzle of puzzles) {
    const movieTitle = puzzle.movie.name;
    const year = puzzle.year;

    console.log(`\n🔍 Checking OMDB for Tamil Film: "${movieTitle}" (${year || 'any'})`);
    const omdbData = await fetchOMDBMovie(movieTitle, year);

    if (omdbData) {
      if (omdbData.Poster && omdbData.Poster !== 'N/A') {
        puzzle.movie.imageUrl = omdbData.Poster;
        console.log(`  ✓ Poster: ${omdbData.Poster}`);
      }
      if (omdbData.Director && omdbData.Director !== 'N/A') {
        puzzle.director = omdbData.Director;
      }
      if (omdbData.Plot && omdbData.Plot !== 'N/A' && !puzzle.trivia) {
        puzzle.trivia = omdbData.Plot;
      }
      console.log(`  ✓ Verified Tamil Movie: ${omdbData.Title} | Director: ${puzzle.director} | Language: ${omdbData.Language}`);
      updatedCount++;
    } else {
      console.log(`  ℹ Retaining existing verified assets for ${movieTitle}`);
    }
  }

  fs.writeFileSync(PUZZLES_PATH, JSON.stringify(puzzles, null, 2), 'utf-8');
  console.log(`\n✨ Successfully processed ${puzzles.length} puzzles! Updated ${updatedCount} with OMDB Tamil data.`);
}

resolveTamilMovies();

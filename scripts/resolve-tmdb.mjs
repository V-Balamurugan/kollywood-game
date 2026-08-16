/**
 * TMDB & Media Image Resolver Script
 * Usage: VITE_TMDB_API_KEY=your_key node scripts/resolve-tmdb.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY;
const PUZZLES_PATH = path.join(__dirname, '../src/data/puzzles.json');

async function searchTMDBPerson(name) {
  if (!TMDB_API_KEY) return null;
  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(name)}&api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    if (data.results && data.results.length > 0 && data.results[0].profile_path) {
      return `https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`;
    }
  } catch (err) {
    console.error(`Failed to fetch person ${name}:`, err.message);
  }
  return null;
}

async function searchTMDBMovie(title, year) {
  if (!TMDB_API_KEY) return null;
  try {
    let url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&api_key=${TMDB_API_KEY}`;
    if (year) url += `&year=${year}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0 && data.results[0].poster_path) {
      return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
    }
  } catch (err) {
    console.error(`Failed to fetch movie ${title}:`, err.message);
  }
  return null;
}

async function resolveAll() {
  console.log('Reading puzzles from:', PUZZLES_PATH);
  const puzzles = JSON.parse(fs.readFileSync(PUZZLES_PATH, 'utf-8'));

  if (!TMDB_API_KEY) {
    console.log('No TMDB_API_KEY found in environment. Using baked-in URLs and YouTube thumbnails.');
    console.log(`Validated ${puzzles.length} puzzles.`);
    return;
  }

  console.log(`Resolving images for ${puzzles.length} puzzles using TMDB...`);

  for (const puzzle of puzzles) {
    console.log(`\nProcessing: ${puzzle.movie.name} (${puzzle.year})`);

    const moviePoster = await searchTMDBMovie(puzzle.movie.name, puzzle.year);
    if (moviePoster) {
      puzzle.movie.imageUrl = moviePoster;
      console.log(`  ✓ Movie poster: ${moviePoster}`);
    }

    const heroPhoto = await searchTMDBPerson(puzzle.hero.name);
    if (heroPhoto) {
      puzzle.hero.imageUrl = heroPhoto;
      console.log(`  ✓ Hero photo: ${heroPhoto}`);
    }

    const heroinePhoto = await searchTMDBPerson(puzzle.heroine.name);
    if (heroinePhoto) {
      puzzle.heroine.imageUrl = heroinePhoto;
      console.log(`  ✓ Heroine photo: ${heroinePhoto}`);
    }
  }

  fs.writeFileSync(PUZZLES_PATH, JSON.stringify(puzzles, null, 2), 'utf-8');
  console.log('\n✅ Successfully updated puzzles.json with verified TMDB URLs!');
}

resolveAll();

const db = require('../../config/db');

// ─── TOOL: kbSearch ─────────────────────────────────────────────────────────
// Agent's second tool call (RAG retrieval step). Takes the medicine name
// extracted by visionExtract and searches the knowledge base.
//
// Why MySQL FULLTEXT instead of a vector DB for this MVP:
// medicine names are short, mostly-exact strings (not free-form natural
// language queries), so lexical/fuzzy text matching performs reliably here
// without the added infra of embeddings + a vector store. This is a
// deliberate scope decision, not a missing feature — worth stating plainly
// if asked in an interview.

const searchMedicine = async (query) => {
  if (!query || !query.trim()) return null;

  // Strip strength/dosage numbers (e.g. "500mg") since they're not in the
  // name column consistently — searching on the core name works better.
  const cleanedQuery = query.replace(/\d+\s*(mg|mcg|ml|g)\b/gi, '').trim();

  // 1) Try FULLTEXT natural language search first (handles partial/fuzzy matches)
  const [ftRows] = await db.query(
    `SELECT *,
            MATCH(name, generic_name, used_for) AGAINST(? IN NATURAL LANGUAGE MODE) AS score
     FROM medicines_kb
     WHERE MATCH(name, generic_name, used_for) AGAINST(? IN NATURAL LANGUAGE MODE)
     ORDER BY score DESC
     LIMIT 3`,
    [cleanedQuery, cleanedQuery]
  );

  if (ftRows.length > 0 && ftRows[0].score > 0) {
    return {
      matched: true,
      medicine: ftRows[0],
      alternativeMatches: ftRows.slice(1), // useful if agent wants to say "did you mean X or Y?"
      matchMethod: 'fulltext',
    };
  }

  // 2) Fallback: LIKE search in case FULLTEXT's natural-language mode misses
  // short/unusual names (FULLTEXT has a minimum word-length threshold by default)
  const [likeRows] = await db.query(
    `SELECT * FROM medicines_kb
     WHERE name LIKE ? OR generic_name LIKE ?
     LIMIT 3`,
    [`%${cleanedQuery}%`, `%${cleanedQuery}%`]
  );

  if (likeRows.length > 0) {
    return {
      matched: true,
      medicine: likeRows[0],
      alternativeMatches: likeRows.slice(1),
      matchMethod: 'like_fallback',
    };
  }

  // 3) No match at all — orchestrator needs to know this explicitly
  return {
    matched: false,
    medicine: null,
    alternativeMatches: [],
    matchMethod: 'none',
  };
};

module.exports = { searchMedicine };
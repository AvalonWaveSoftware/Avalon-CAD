// Version-token rule (Master Chief engineering ruling, 2026-10-28, 3.0.0 bump): the `?v=<semver>` query that the build puts on
// SAME-ORIGIN asset URLs is a cache-busting token, not wording or look. It changes with every release (package.json "version"),
// so a baseline taken at an older release differs from the build only by that token. This is the ONLY difference ignored:
//   - the element is a <script src> or a <link href> (the attribute that carries the URL, nothing else);
//   - the URL is same-origin: no scheme (https:, data:, ...) and no leading "//";
//   - the whole query is exactly `?v=<semver>` (MAJOR.MINOR.PATCH, optional -prerelease / +build), no other query, no #fragment.
// Everything else still fails: another attribute, another path, another query, a non-semver token, a cross-origin URL.
// Used by tests/pixels.mjs (via checkCapture and the mask compare) and tests/perf/dom-baseline.mjs (static index.html check).
// Never touches a baseline: both sides are normalised in memory at compare time (compare only, no --update).
const SEMVER='\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?(?:\\+[0-9A-Za-z.-]+)?';
const TAG=/<(script|link)\b[^>]*>/gi;
const ATTR={script:'src',link:'href'};
// Calls fn(version) for each token and replaces it with the returned string.
function mapTokens(html,fn){return String(html).replace(TAG,(tag,name)=>{
 const re=new RegExp(`(\\s${ATTR[name.toLowerCase()]}=)(["'])((?!\\/\\/)(?![A-Za-z][A-Za-z0-9+.-]*:)[^"'?#\\s>]+)\\?v=(${SEMVER})\\2`,'i');
 return tag.replace(re,(m,pre,q,url,ver)=>`${pre}${q}${url}?v=${fn(ver)}${q}`);});}
export const normalizeVersionTokens=html=>mapTokens(html,()=>'{version}');
export const withVersionTokens=(html,version)=>mapTokens(html,()=>version);
export function versionTokens(html){const out=[];mapTokens(html,v=>(out.push(v),v));return out;}
export const normalizeDom=s=>s&&typeof s.html==='string'?{...s,html:normalizeVersionTokens(s.html)}:s;

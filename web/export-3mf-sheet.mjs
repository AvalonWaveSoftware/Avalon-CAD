// ADR-0001 F2a: the 3MF texts of the Export sheet. A lazy chunk: main.mjs imports it only when 3MF is chosen, so the
// STL sheet (the default) is unchanged and nothing loads at startup.
export const TITLE='Export a printable 3MF';
export const INTRO='The 3MF adds the completed layers together. Each layer\'s cutouts affect only that layer. Dimensions use millimeters. The build plane is never included in this file.';
export const BUILD='Build & save .3MF';
export const KIND='3MF · compressed · millimeters';
// ADR-0001 F2a option A: the parallel encoder rides in this lazy chunk too.
export {export3MF,dispose3MFPool,warm3MFPool,pool3MFWarm} from './export-3mf-pool.mjs';
// Option B step 2: main.mjs warms the pool whenever the sheet shows 3MF. The preview mesh cannot predict the export
// triangle count (a 524k mesh object previews at a few hundred triangles), so small projects warm it too, unused.

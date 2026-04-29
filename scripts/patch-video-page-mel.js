/**
 * patch-video-page-mel.js
 * Adds ID and EXTRA toggle columns to the custom Studio video page (studio_page: 69d7a78d28fe032bb252435c).
 * Same toggle pattern as /funifier/funifier-studio/app/views/studio/folder/list.html.
 *
 * Usage: node scripts/patch-video-page-mel.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';
const PAGE_ID = '69d7a78d28fe032bb252435c';

async function api(method, path, body) {
    const res = await fetch(BASE_URL + path, {
        method,
        headers: { 'Authorization': TOKEN, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.substring(0, 400)}`);
    try { return JSON.parse(text); } catch { return {}; }
}

// ─── Header: insert ID + EXTRA toggle TDs before OPERATIONS ───────────────────

const HEADER_ANCHOR = `\t\t\t<td>{{'OPERATIONS'|translate|uppercase}}</td>`;

const HEADER_INSERT = `\t\t\t<td ng-show="!showId" style="width: 15px">
\t\t\t\t<span class="fun-slash" ng-click="showId = !showId">ID</span>
\t\t\t</td>
\t\t\t<td ng-show="showId">
\t\t\t\t<span ng-click="showId = !showId">ID</span>
\t\t\t</td>
\t\t\t<td ng-show="!showExtra" style="width: 15px">
\t\t\t\t<span class="glyphicon glyphicon-eye-close" ng-click="showExtra = !showExtra"></span>
\t\t\t</td>
\t\t\t<td ng-show="showExtra">
\t\t\t\t<span class="glyphicon glyphicon-eye-open" ng-click="showExtra = !showExtra; $event.stopPropagation()"></span>
\t\t\t\tEXTRA
\t\t\t</td>
`;

// ─── Row: insert ID + EXTRA toggle TDs before operations button cell ──────────

const ROW_ANCHOR = `\t\t<td>\n\t\t\t<button type="button" class="btn btn-default" ng-click="remove(index, obj._id)">`;

const ROW_INSERT = `\t\t<td ng-show="!showId"></td>
\t\t<td ng-show="showId" style="line-break: anywhere; max-width: 200px">
\t\t\t{{obj._id | limitTo: 50}}{{obj._id.length > 50 ? '...' : ''}}
\t\t</td>
\t\t<td ng-show="!showExtra"></td>
\t\t<td ng-show="showExtra" style="line-break: anywhere; max-width: 200px">
\t\t\t{{obj.extra | limitTo: 150}}{{obj.extra && obj.extra.length > 150 ? '...' : ''}}
\t\t</td>
`;

async function main() {
    console.log(`Fetching studio_page: ${PAGE_ID}...`);
    const pages = await api('GET', `/v3/database/studio_page?q=_id:'${PAGE_ID}'`);
    if (!pages || pages.length === 0) throw new Error('Page not found');
    const page = pages[0];

    let html = page.html;

    // Guard: skip if already patched
    if (html.includes('showId') || html.includes('showExtra')) {
        console.log('⚠️  Page already contains toggle columns — aborting to avoid double-patch.');
        process.exit(0);
    }

    if (!html.includes(HEADER_ANCHOR)) throw new Error('Header anchor not found — HTML may have changed.');
    if (!html.includes(ROW_ANCHOR))    throw new Error('Row anchor not found — HTML may have changed.');

    html = html.replace(HEADER_ANCHOR, HEADER_INSERT + HEADER_ANCHOR);
    html = html.replace(ROW_ANCHOR,    ROW_INSERT    + ROW_ANCHOR);

    await api('PUT', '/v3/database/studio_page', { ...page, html });
    console.log('✅ Video page patched: ID and EXTRA toggle columns added.');
    console.log('   Access: /studio/custom/video/list');
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });

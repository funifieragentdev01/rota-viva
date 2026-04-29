/**
 * patch-video-page-id-reposition.js
 * Moves the ID toggle column to right after the checkbox column in the
 * custom Studio video page (studio_page: 69d7a78d28fe032bb252435c).
 *
 * Usage: node scripts/patch-video-page-id-reposition.js
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

const ID_HEADER_BLOCK =
    '\t\t\t<td ng-show="!showId" style="width: 15px">\n' +
    '\t\t\t\t<span class="fun-slash" ng-click="showId = !showId">ID</span>\n' +
    '\t\t\t</td>\n' +
    '\t\t\t<td ng-show="showId">\n' +
    '\t\t\t\t<span ng-click="showId = !showId">ID</span>\n' +
    '\t\t\t</td>\n';

const ID_ROW_BLOCK =
    '\t\t<td ng-show="!showId"></td>\n' +
    '\t\t<td ng-show="showId" style="line-break: anywhere; max-width: 200px">\n' +
    '\t\t\t{{obj._id | limitTo: 50}}{{obj._id.length > 50 ? \'...\' : \'\'}}\n' +
    '\t\t</td>\n';

async function main() {
    console.log(`Fetching studio_page: ${PAGE_ID}...`);
    const pages = await api('GET', `/v3/database/studio_page?q=_id:'${PAGE_ID}'`);
    if (!pages || pages.length === 0) throw new Error('Page not found');
    const page = pages[0];
    let html = page.html;

    // ── Header ────────────────────────────────────────────────────────────────
    // 1. Remove ID block from current position (before EXTRA)
    const HEADER_ID_BEFORE_EXTRA =
        ID_HEADER_BLOCK +
        '\t\t\t<td ng-show="!showExtra" style="width: 15px">';

    if (!html.includes(HEADER_ID_BEFORE_EXTRA)) {
        throw new Error('Header: ID block before EXTRA not found — HTML may have changed.');
    }
    html = html.replace(
        HEADER_ID_BEFORE_EXTRA,
        '\t\t\t<td ng-show="!showExtra" style="width: 15px">'
    );

    // 2. Insert ID block right after the header checkbox TD
    const HEADER_CHECKBOX =
        ' <td><input type="checkbox" ng-model="selectAll" ng-click="toggleSelectAll()" /></td>\n';

    if (!html.includes(HEADER_CHECKBOX)) {
        throw new Error('Header: checkbox TD not found — HTML may have changed.');
    }
    html = html.replace(
        HEADER_CHECKBOX,
        HEADER_CHECKBOX + ID_HEADER_BLOCK
    );

    // ── Row ───────────────────────────────────────────────────────────────────
    // 3. Remove ID block from current position (before EXTRA)
    const ROW_ID_BEFORE_EXTRA =
        ID_ROW_BLOCK +
        '\t\t<td ng-show="!showExtra"></td>';

    if (!html.includes(ROW_ID_BEFORE_EXTRA)) {
        throw new Error('Row: ID block before EXTRA not found — HTML may have changed.');
    }
    html = html.replace(
        ROW_ID_BEFORE_EXTRA,
        '\t\t<td ng-show="!showExtra"></td>'
    );

    // 4. Insert ID block right after the row checkbox TD (before title TD)
    const ROW_AFTER_CHECKBOX = '\t\t</td>\n<td>{{obj.title}}</td>';

    if (!html.includes(ROW_AFTER_CHECKBOX)) {
        throw new Error('Row: anchor after checkbox TD not found — HTML may have changed.');
    }
    html = html.replace(
        ROW_AFTER_CHECKBOX,
        '\t\t</td>\n' + ID_ROW_BLOCK + '<td>{{obj.title}}</td>'
    );

    await api('PUT', '/v3/database/studio_page', { ...page, html });
    console.log('✅ ID column repositioned: now right after the checkbox column.');
    console.log('   Access: /studio/custom/video/list');
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });

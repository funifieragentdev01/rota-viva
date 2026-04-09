/**
 * cleanup.js — v3
 * Limpa TODO o conteúdo das instâncias Mel e Pesca.
 * Mantém apenas o subject folder. Deleta todos os módulos, lições e conteúdo.
 * Renomeia o subject com o título correto.
 *
 * Endpoints corretos (lidos de FolderRest.java e DatabaseRest.java):
 *   DELETE /v3/folder/{id}                          — deleta folder
 *   DELETE /v3/database/{collection}?q=_id:'id'     — deleta documento
 *   PUT    /v3/database/{collection}                — upsert (inclui _id no body para update)
 *
 * Uso: node scripts/cleanup.js
 */

const BASE_URL = 'https://service2.funifier.com';

const ROUTES = [
    {
        name: 'Mel',
        token: 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==',
        subjectId: '69c9336fdf494d3199c2a6ba',
        newSubjectTitle: 'Rota do Mel'
    },
    {
        name: 'Pesca',
        token: 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==',
        subjectId: '69d28273505f02177b0d9658',
        newSubjectTitle: 'Rota da Pesca'
    }
];

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiReq(token, method, path, body) {
    const res = await fetch(BASE_URL + path, {
        method,
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.substring(0, 200)}`);
    try { return JSON.parse(text); } catch { return {}; }
}

// DELETE /v3/folder/{id}  — FolderRest, retorna 204
async function delFolder(token, id) {
    try {
        const r = await fetch(BASE_URL + '/v3/folder/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        process.stdout.write(` folder:${r.status}`);
    } catch(e) {
        console.warn(`\n  ⚠ delFolder ${id}: ${e.message}`);
    }
}

// DELETE /v3/database/{collection}?q=_id:'id'  — DatabaseRest, retorna 200
async function delDoc(token, collection, id) {
    try {
        const q = encodeURIComponent(`_id:'${id}'`);
        await fetch(BASE_URL + `/v3/database/${collection}?q=${q}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
    } catch(e) {
        // silencioso — doc pode não existir
    }
}

async function getAll(token, collection, query) {
    const url = `${BASE_URL}/v3/database/${collection}?limit=500&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Authorization': token } });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

// ─── Delete a folder and all its content ─────────────────────────────────────

async function deleteLessonContent(token, lessonId) {
    // Find folder_content linked to this lesson (may use 'parent' or 'folder' field)
    const fcs = [
        ...await getAll(token, 'folder_content', `parent:'${lessonId}'`),
        ...await getAll(token, 'folder_content', `folder:'${lessonId}'`)
    ];
    for (const fc of fcs) {
        if (fc.content) {
            // Delete questions if quiz-type
            const questions = await getAll(token, 'question', `quiz:'${fc.content}'`);
            for (const q of questions) await delDoc(token, 'question', q._id);
            // Try all content types
            await delDoc(token, 'quiz', fc.content);
            await delDoc(token, 'video__c', fc.content);
            await delDoc(token, 'reading__c', fc.content);
        }
        await delDoc(token, 'folder_content', fc._id);
    }
}

// ─── Main cleanup ─────────────────────────────────────────────────────────────

async function cleanRoute(route) {
    const { name, token, subjectId, newSubjectTitle } = route;
    console.log(`\n═══════════════════════════════════`);
    console.log(`Limpando Rota ${name}`);
    console.log(`═══════════════════════════════════`);

    // 1. GET all folders in this instance
    const allFolders = await fetch(BASE_URL + '/v3/database/folder?limit=500', {
        headers: { 'Authorization': token }
    }).then(r => r.json());

    // 2. Keep only the subject; delete everything else
    const toDelete = allFolders.filter(f => f._id !== subjectId);
    console.log(`  Folders a deletar: ${toDelete.length}`);

    // Delete lessons first (leaves), then modules
    const lessons = toDelete.filter(f => f.type === 'lesson' || (!f.type && (f.parent || f.folder) && f._id !== subjectId));
    const modules = toDelete.filter(f => f.type === 'module');
    const others  = toDelete.filter(f => !['lesson','module'].includes(f.type) && f._id !== subjectId);

    for (const lesson of lessons) {
        process.stdout.write(`\n  Lição "${(lesson.title||lesson.name||'?').substring(0,30)}"`);
        await deleteLessonContent(token, lesson._id);
        await delFolder(token, lesson._id);
    }
    for (const mod of modules) {
        process.stdout.write(`\n  Módulo "${(mod.title||mod.name||'?').substring(0,30)}"`);
        await delFolder(token, mod._id);
    }
    for (const other of others) {
        process.stdout.write(`\n  Outro "${(other.title||other.name||'?').substring(0,30)}"`);
        await deleteLessonContent(token, other._id);
        await delFolder(token, other._id);
    }

    // 3. Rename subject — GET current document, update title, PUT back
    const subjectArr = await getAll(token, 'folder', `_id:'${subjectId}'`);
    if (subjectArr.length > 0) {
        const current = subjectArr[0];
        current.title = newSubjectTitle;
        await apiReq(token, 'PUT', '/v3/database/folder', current);
        console.log(`\n  ✓ Subject renomeado para "${newSubjectTitle}"`);
    }

    console.log(`  ✅ Rota ${name} limpa!`);
}

async function main() {
    for (const route of ROUTES) {
        await cleanRoute(route);
    }
    console.log('\n✅ Cleanup concluído!');
}

main().catch(err => { console.error('\nERRO FATAL:', err.message); process.exit(1); });

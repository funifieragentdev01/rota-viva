/**
 * patch-select-missing-words.js
 * Corrige as questões SELECT_MISSING_WORDS:
 *   - Define question = model.missingWords.text (frase com [[b1]], [[b2]], ...)
 *   - title já está correto (pergunta legível ao usuário) — mantido
 *
 * Uso: node scripts/patch-select-missing-words.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';

async function api(method, path, body) {
    const res = await fetch(BASE_URL + path, {
        method,
        headers: { 'Authorization': TOKEN, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.substring(0, 300)}`);
    try { return JSON.parse(text); } catch { return {}; }
}

async function main() {
    console.log('Buscando questões SELECT_MISSING_WORDS...');
    const questions = await api('GET', '/v3/database/question?q=type:\'SELECT_MISSING_WORDS\'&limit=200');
    console.log(`Encontradas: ${questions.length} questões\n`);

    let fixed = 0, skipped = 0;

    for (const q of questions) {
        const mwText = q.model && q.model.missingWords && q.model.missingWords.text;

        if (!mwText) {
            console.log(`  SKIP ${q._id} — sem model.missingWords.text`);
            skipped++;
            continue;
        }

        if (q.question === mwText) {
            console.log(`  OK   ${q._id} — já correto`);
            skipped++;
            continue;
        }

        const patched = { ...q, question: mwText };
        await api('PUT', '/v3/database/question', patched);
        console.log(`  ✅   ${q._id} | question → "${mwText.substring(0, 70)}..."`);
        fixed++;
    }

    console.log(`\nConcluído: ${fixed} corrigidas, ${skipped} ignoradas.`);
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });

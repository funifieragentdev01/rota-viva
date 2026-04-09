/**
 * patch-dnd-questions.js
 * Corrige todas as questões DRAG_AND_DROP_INTO_TEXT do Rota Viva para o formato correto:
 *   - model.dragDropText.text (em vez de sentence), com [[N]] como placeholder
 *   - targets com id "1","2","3" (numérico string, sem "t")
 *   - targets com acceptedOptionIds (array com todos os IDs do pool) + correctOptionId
 *   - scoring: "all_or_nothing"
 *   - question field = sentence com [[N]] (para uso interno do Funifier)
 *   - title field mantido como está (pergunta legível ao usuário)
 *
 * Uso: node scripts/patch-dnd-questions.js
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

/**
 * Converts old sentence format to new format:
 *   "[1] → [2] → [3]"  →  "[[1]] → [[2]] → [[3]]"
 *   "Em local [1], [2]" → "Em local [[1]], [[2]]"
 */
function upgradeText(sentence) {
    return sentence.replace(/\[(\d+)\]/g, '[[$1]]');
}

/**
 * Converts old targets to new format:
 *   {id:"t1", text:"[1]", correctOptionId:"w2"} + poolIds
 *   → {id:"1", acceptedOptionIds:[...all], correctOptionId:"w2"}
 */
function upgradeTargets(targets, poolIds) {
    return targets.map(t => {
        const oldId = t.id; // "t1", "t2", ...
        const newId = oldId.replace(/^t/, ''); // "1", "2", ...
        return {
            id: newId,
            acceptedOptionIds: poolIds,
            correctOptionId: t.correctOptionId
        };
    });
}

async function patchQuestion(q) {
    const dd = q.model && q.model.dragDropText;
    if (!dd) { console.log(`  SKIP ${q._id} — sem dragDropText`); return; }

    const poolIds = (dd.optionsPool || []).map(o => o.id);
    const oldSentence = dd.sentence || dd.text || '';

    if (!oldSentence) { console.log(`  SKIP ${q._id} — sem sentence/text`); return; }

    // Already in correct format if text exists and targets use numeric IDs
    const alreadyFixed = dd.text && dd.targets && dd.targets[0] && !dd.targets[0].id.startsWith('t');
    if (alreadyFixed) { console.log(`  SKIP ${q._id} — já no formato correto`); return; }

    const newText = upgradeText(oldSentence);
    const newTargets = upgradeTargets(dd.targets || [], poolIds);

    const patched = {
        ...q,
        // question holds the sentence template for Funifier internal use
        question: newText,
        // title stays as the human-readable question for the user
        title: q.title || q.question,
        model: {
            ...q.model,
            dragDropText: {
                text: newText,
                targets: newTargets,
                optionsPool: dd.optionsPool,
                scoring: 'all_or_nothing'
                // sentence key removed
            }
        }
    };

    await api('PUT', '/v3/database/question', patched);
    console.log(`  ✅ PATCHED ${q._id} — "${q.title || q.question}"`);
    console.log(`     new text: "${newText}"`);
}

async function main() {
    console.log('Buscando questões DRAG_AND_DROP_INTO_TEXT...');
    const questions = await api('GET', '/v3/database/question?q=type:\'DRAG_AND_DROP_INTO_TEXT\'&limit=200');

    console.log(`Encontradas ${questions.length} questões DND.\n`);

    for (const q of questions) {
        console.log(`→ ${q._id} | ${q.title || q.question}`);
        await patchQuestion(q);
    }

    console.log('\nPatch concluído!');
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });

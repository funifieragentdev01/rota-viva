/**
 * seed-modulo-a-mel-v2.js
 * Adiciona 2 checkpoints cartoon ao Módulo A — Rota do Mel.
 * Cria Quiz CP1 + Quiz CP2 com questões e os folders cartoon.
 * Posicionamento manual via painel.
 *
 * Uso: node scripts/seed-modulo-a-mel-v2.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN    = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';
const MODULE_ID = '69d7ab7e28fe032bb2524454';

// ─── API helpers ──────────────────────────────────────────────────────────────

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

function getId(result) {
    if (result && result._id) return result._id;
    if (Array.isArray(result) && result[0] && result[0]._id) return result[0]._id;
    throw new Error('Sem _id: ' + JSON.stringify(result).substring(0, 200));
}

async function createQuiz(title, description) {
    const id = getId(await api('PUT', '/v3/database/quiz', { title, description: description || '' }));
    console.log(`  ⭐ quiz "${title}": ${id}`);
    return id;
}

async function createQuestion(quizId, position, q) {
    getId(await api('PUT', '/v3/database/question', { quiz: quizId, position, ...q }));
    process.stdout.write('.');
}

async function createCartoon(title, quizId) {
    const id = getId(await api('PUT', '/v3/database/folder', {
        title, type: 'lesson', parent: MODULE_ID
    }));
    console.log(`  🎭 cartoon folder "${title}": ${id}`);
    await api('PUT', '/v3/database/folder_content', {
        parent: id, content: quizId, type: 'cartoon', active: true
    });
    console.log(`     └─ folder_content (cartoon) linked`);
    return id;
}

// ─── Question builders ────────────────────────────────────────────────────────

const G1 = { grade: 1, extra: {} };
const G0 = { grade: 0, extra: {} };

function mc1(question, options, correctIndex) {
    return {
        type: 'MULTIPLE_CHOICE', select: 'one_answer', title: question, question,
        choices: options.map((text, i) => ({
            label: String.fromCharCode(65 + i), answer: text,
            ...(i === correctIndex ? G1 : G0)
        }))
    };
}

function vf(question, correct) {
    return { type: 'TRUE_FALSE', title: question, question, correctAnswer: correct, choices: [] };
}

// ─── Quiz CP1 — Direitos, CAF e PRONAF ───────────────────────────────────────

const QUIZ1_QUESTIONS = [
    mc1(
        'O CAF (Cadastro da Agricultura Familiar) serve para:',
        [
            'Registrar propriedades rurais no cartório',
            'Identificar agricultores familiares e dar acesso a políticas públicas',
            'Controlar a produção de mel para exportação',
            'Pagar impostos sobre a venda do mel'
        ], 1
    ),
    mc1(
        'O PRONAF é um programa de:',
        [
            'Distribuição gratuita de colmeias para apicultores',
            'Crédito rural para agricultores e apicultores familiares',
            'Controle fitossanitário das abelhas',
            'Certificação orgânica do mel'
        ], 1
    ),
    vf('Para acessar o PRONAF, o apicultor precisa ter o CAF.', true),
    mc1(
        'Qual documento comprova que você é agricultor familiar e dá acesso ao PRONAF?',
        ['RG e CPF', 'Nota Fiscal do mel', 'CAF — Cadastro da Agricultura Familiar', 'Alvará de funcionamento'],
        2
    ),
    mc1(
        'O PRONAF pode financiar:',
        [
            'Apenas maquinários pesados',
            'Equipamentos de apicultura, colmeias e infraestrutura',
            'Apenas terras novas',
            'Publicidade e marketing do mel'
        ], 1
    ),
    vf('O CAF é gratuito e pode ser feito no CRAS ou na Emater.', true),
];

// ─── Quiz CP2 — PAA, PNAE, ATER e Aplicação Prática ─────────────────────────

const QUIZ2_QUESTIONS = [
    mc1(
        'O PAA (Programa de Aquisição de Alimentos) permite que o apicultor:',
        [
            'Venda mel diretamente ao governo sem licitação',
            'Receba subsídio para comprar equipamentos',
            'Exporte mel sem impostos',
            'Receba treinamento gratuito do governo'
        ], 0
    ),
    mc1(
        'O PNAE garante que o mel da agricultura familiar seja comprado para:',
        [
            'Exportação para a Europa',
            'A merenda escolar das escolas públicas',
            'Hospitais e UPAs',
            'Supermercados locais'
        ], 1
    ),
    vf('Os municípios são obrigados por lei a comprar 30% da merenda de agricultores familiares.', true),
    mc1(
        'A ATER (Assistência Técnica e Extensão Rural) oferece ao apicultor:',
        [
            'Empréstimos sem juros',
            'Orientação técnica gratuita sobre produção e mercado',
            'Seguros contra morte de abelhas',
            'Licença de funcionamento da apiaria'
        ], 1
    ),
    mc1(
        'Para vender mel pelo PAA ou PNAE, o apicultor precisa estar:',
        [
            'Apenas com CPF em dia',
            'Cadastrado no CAF e em uma cooperativa ou associação',
            'Com alvará da prefeitura e CNPJ',
            'Registrado no Ministério da Agricultura'
        ], 1
    ),
    vf('A Emater pode ajudar o apicultor a se inscrever no CAF, PRONAF e PAA.', true),
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('=== Módulo A Mel v2 — Cartoon Checkpoints ===\n');

    console.log('1. Criando Quiz CP1 (Direitos, CAF e PRONAF)...');
    const quiz1Id = await createQuiz(
        'Checkpoint 1 — Módulo A Mel',
        'Teste seus conhecimentos sobre CAF, PRONAF e seus direitos como apicultor familiar.'
    );
    for (let i = 0; i < QUIZ1_QUESTIONS.length; i++) {
        await createQuestion(quiz1Id, i + 1, QUIZ1_QUESTIONS[i]);
    }
    console.log(' ✓');

    console.log('\n2. Criando Quiz CP2 (PAA, PNAE, ATER)...');
    const quiz2Id = await createQuiz(
        'Checkpoint 2 — Módulo A Mel',
        'Teste seus conhecimentos sobre PAA, PNAE, ATER e como acessar o mercado institucional.'
    );
    for (let i = 0; i < QUIZ2_QUESTIONS.length; i++) {
        await createQuestion(quiz2Id, i + 1, QUIZ2_QUESTIONS[i]);
    }
    console.log(' ✓');

    console.log('\n3. Criando cartoon checkpoints...');
    const cp1Id = await createCartoon('Checkpoint 1 — Módulo A', quiz1Id);
    const cp2Id = await createCartoon('Checkpoint 2 — Módulo A', quiz2Id);

    console.log('\n=== Concluído ===');
    console.log(`Quiz CP1 ID : ${quiz1Id}`);
    console.log(`Quiz CP2 ID : ${quiz2Id}`);
    console.log(`Cartoon CP1 : ${cp1Id}`);
    console.log(`Cartoon CP2 : ${cp2Id}`);
    console.log('\n⚠️  Ajuste as posições manualmente no painel para posicionar os cartoons na trilha.');
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

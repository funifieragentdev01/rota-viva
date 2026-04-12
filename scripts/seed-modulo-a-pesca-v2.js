/**
 * seed-modulo-a-pesca-v2.js
 * Adiciona 2 checkpoints cartoon ao Módulo A — Rota da Pesca.
 * Cria Quiz CP1 + Quiz CP2 com questões e os folders cartoon.
 * Posicionamento manual via painel.
 *
 * Uso: node scripts/seed-modulo-a-pesca-v2.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN    = 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==';
const MODULE_ID = '69d7ab9028fe032bb252449e';

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

// ─── Quiz CP1 — Direitos, RGP e Seguro-Defeso ────────────────────────────────

const QUIZ1_QUESTIONS = [
    mc1(
        'O RGP (Registro Geral da Pesca) é importante porque:',
        [
            'Permite pescar em qualquer rio sem fiscalização',
            'Identifica o pescador como profissional e dá acesso a direitos como o Seguro-Defeso',
            'Garante que o pescador não pague impostos',
            'Substitui a carteira de identidade'
        ], 1
    ),
    mc1(
        'O Seguro-Defeso é pago ao pescador durante o período de:',
        [
            'Férias anuais do pescador',
            'Proibição de pesca para proteção da reprodução dos peixes',
            'Estiagem dos rios',
            'Reforma dos barcos e redes'
        ], 1
    ),
    vf('Para receber o Seguro-Defeso, o pescador precisa ter o RGP ativo.', true),
    mc1(
        'Quem pode tirar o RGP?',
        [
            'Qualquer pessoa com 18 anos',
            'Somente pescadores com barco próprio',
            'Pescadores profissionais artesanais cadastrados no MPA',
            'Apenas quem tem colônia de pescadores'
        ], 2
    ),
    mc1(
        'A Colônia de Pescadores ajuda o pescador a:',
        [
            'Vender pescado no exterior',
            'Acessar direitos coletivos, representação e programas do governo',
            'Conseguir financiamento bancário direto',
            'Registrar marca do pescado'
        ], 1
    ),
    vf('O RGP precisa ser renovado periodicamente para manter os direitos ativos.', true),
];

// ─── Quiz CP2 — PRONAF Pesca, PAA, ATER e Aplicação Prática ─────────────────

const QUIZ2_QUESTIONS = [
    mc1(
        'O PRONAF Pesca pode ser usado pelo pescador artesanal para:',
        [
            'Construir casa de moradia na beira do rio',
            'Financiar barcos, motores, redes e equipamentos de pesca',
            'Pagar dívidas antigas',
            'Exportar pescado para outros países'
        ], 1
    ),
    mc1(
        'Para acessar o PRONAF Pesca, o pescador precisa ter:',
        [
            'CNPJ e alvará comercial',
            'RGP e estar inscrito no CAF ou DAP',
            'Escritura do barco',
            'Conta em banco público com movimentação mínima'
        ], 1
    ),
    vf('O PAA permite que o pescador venda pescado diretamente para entidades sociais sem licitação.', true),
    mc1(
        'A ATER (Assistência Técnica Rural) oferece ao pescador:',
        [
            'Salário mínimo garantido',
            'Orientação técnica gratuita sobre manejo, produção e acesso a mercados',
            'Equipamentos de pesca subsidiados',
            'Seguro de vida para acidentes no rio'
        ], 1
    ),
    mc1(
        'Para vender pescado pela merenda escolar (PNAE), o pescador precisa:',
        [
            'Apenas ter nota fiscal',
            'Estar em uma cooperativa ou associação e ter DAP/CAF ativo',
            'Ter CNPJ próprio',
            'Ter licença ambiental estadual'
        ], 1
    ),
    vf('A RURAP no Amapá pode orientar pescadores a acessar o PRONAF e programas de comercialização.', true),
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('=== Módulo A Pesca v2 — Cartoon Checkpoints ===\n');

    console.log('1. Criando Quiz CP1 (Direitos, RGP e Seguro-Defeso)...');
    const quiz1Id = await createQuiz(
        'Checkpoint 1 — Módulo A Pesca',
        'Teste seus conhecimentos sobre RGP, Seguro-Defeso e seus direitos como pescador artesanal.'
    );
    for (let i = 0; i < QUIZ1_QUESTIONS.length; i++) {
        await createQuestion(quiz1Id, i + 1, QUIZ1_QUESTIONS[i]);
    }
    console.log(' ✓');

    console.log('\n2. Criando Quiz CP2 (PRONAF, PAA, ATER)...');
    const quiz2Id = await createQuiz(
        'Checkpoint 2 — Módulo A Pesca',
        'Teste seus conhecimentos sobre PRONAF Pesca, PAA, PNAE e como acessar o mercado institucional.'
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

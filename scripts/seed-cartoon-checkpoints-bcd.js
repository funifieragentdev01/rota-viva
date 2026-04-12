/**
 * seed-cartoon-checkpoints-bcd.js
 * Cria 2 cartoon checkpoints (CP1 + CP2) nos módulos B, C e D
 * para as duas rotas (Mel e Pesca).
 * Não altera nem exclui nenhum conteúdo existente.
 * Posicionamento manual via painel.
 *
 * Uso: node scripts/seed-cartoon-checkpoints-bcd.js
 */

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BASE_URL   = 'https://service2.funifier.com';
const TOKEN_MEL  = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';
const TOKEN_PESC = 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==';

// ─── Module IDs ───────────────────────────────────────────────────────────────
const MODULES = {
    mel:  { B: '69d7aeb028fe032bb2524660', C: '69d7b0bd28fe032bb2524d49', D: '69d7d3b728fe032bb2527dd4' },
    pesc: { B: '69d7aec028fe032bb25246c0', C: '69d7b0cd28fe032bb2524da6', D: '69d7d3c728fe032bb2527e20' },
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function api(token, method, path, body) {
    const res = await fetch(BASE_URL + path, {
        method,
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.substring(0, 300)}`);
    try { return JSON.parse(text); } catch { return {}; }
}

function getId(r) {
    if (r && r._id) return r._id;
    if (Array.isArray(r) && r[0]?._id) return r[0]._id;
    throw new Error('Sem _id: ' + JSON.stringify(r).substring(0, 200));
}

async function createQuiz(token, title, description) {
    const id = getId(await api(token, 'PUT', '/v3/database/quiz', { title, description: description || '' }));
    console.log(`    ⭐ quiz "${title}": ${id}`);
    return id;
}

async function createQuestion(token, quizId, position, q) {
    getId(await api(token, 'PUT', '/v3/database/question', { quiz: quizId, position, ...q }));
    process.stdout.write('.');
}

async function createCartoon(token, moduleId, title, quizId) {
    const id = getId(await api(token, 'PUT', '/v3/database/folder', {
        title, type: 'lesson', parent: moduleId
    }));
    await api(token, 'PUT', '/v3/database/folder_content', {
        parent: id, content: quizId, type: 'cartoon', active: true
    });
    console.log(`    🎭 cartoon "${title}": ${id}`);
    return id;
}

// ─── Question builders ────────────────────────────────────────────────────────

const G1 = { grade: 1, extra: {} };
const G0 = { grade: 0, extra: {} };

const mc1 = (q, opts, ci) => ({
    type: 'MULTIPLE_CHOICE', select: 'one_answer', title: q, question: q,
    choices: opts.map((t, i) => ({ label: String.fromCharCode(65 + i), answer: t, ...(i === ci ? G1 : G0) }))
});
const vf = (q, c) => ({ type: 'TRUE_FALSE', title: q, question: q, correctAnswer: c, choices: [] });

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO B — Boas Práticas Produtivas
// ═══════════════════════════════════════════════════════════════════════════════

const B_MEL_Q1 = [
    mc1('O calendário apícola é importante porque:', [
        'Define o preço do mel no mercado',
        'Indica as épocas certas de manejo, colheita e descanso das abelhas',
        'Registra a quantidade de colmeias do apicultor',
        'Controla as vendas mensais'
    ], 1),
    mc1('O fumegador é usado no manejo para:', [
        'Matar pragas nas colmeias',
        'Acalmar as abelhas durante a inspeção',
        'Esterilizar os equipamentos de colheita',
        'Aquecer o mel para a extração'
    ], 1),
    vf('Durante o manejo das colmeias, é obrigatório usar vestimenta completa de proteção.', true),
    mc1('A Varroa é:', [
        'Uma doença causada por fungos no mel',
        'Um ácaro parasita que ataca as abelhas e deve ser monitorado',
        'Uma espécie de abelha invasora',
        'Uma praga que ataca apenas as flores'
    ], 1),
    mc1('Qual é a principal vantagem de seguir o calendário apícola?', [
        'Reduz o custo do equipamento de proteção',
        'Aumenta a produtividade e a qualidade do mel',
        'Elimina a necessidade de inspeção das colmeias',
        'Dispensa o uso do fumegador'
    ], 1),
    vf('O mel deve ser extraído em local limpo, coberto e longe de animais para garantir qualidade.', true),
];

const B_MEL_Q2 = [
    mc1('A traça da cera é uma praga que:', [
        'Contamina o mel com toxinas',
        'Destrói os favos e enfraquece a colmeia se não for controlada',
        'Ataca apenas colmeias novas',
        'Se alimenta do pólen e prejudica a polinização'
    ], 1),
    mc1('Qual o procedimento correto após a extração do mel?', [
        'Guardar imediatamente em qualquer recipiente disponível',
        'Filtrar, deixar decantar e armazenar em recipiente limpo e vedado',
        'Aquecer a mais de 70°C para eliminar bactérias',
        'Misturar com água para aumentar o volume'
    ], 1),
    vf('Mel com menos de 20% de umidade tem mais chance de fermentar.', false),
    mc1('A inspeção regular das colmeias serve para:', [
        'Aumentar a produção de cera',
        'Identificar a presença da rainha, pragas e a saúde da colmeia',
        'Reduzir o enxame de abelhas',
        'Melhorar o sabor do mel'
    ], 1),
    mc1('O que deve ser feito com colmeias muito populosas na entressafra?', [
        'Abandoná-las e começar novas colmeias',
        'Dividi-las para evitar enxameação e manter a produtividade',
        'Alimentá-las com mel industrializado',
        'Reduzir o tamanho da caixa'
    ], 1),
    vf('Boas práticas de manejo reduzem perdas e aumentam a vida útil das colmeias.', true),
];

const B_PESC_Q1 = [
    mc1('Respeitar o tamanho mínimo de captura dos peixes é importante porque:', [
        'Reduz o peso do pescado para transporte',
        'Garante que os peixes se reproduzam antes de serem capturados',
        'Facilita a fiscalização do IBAMA',
        'Aumenta o preço de venda'
    ], 1),
    mc1('O período de defeso serve para:', [
        'Renovar a licença de pesca do pescador',
        'Proteger a reprodução dos peixes e garantir estoque futuro',
        'Reduzir o número de pescadores no rio',
        'Limpar as redes e equipamentos'
    ], 1),
    vf('Usar malhas muito pequenas pode capturar peixes jovens e prejudicar o estoque do rio.', true),
    mc1('O descarte correto de capturas acidentais consiste em:', [
        'Guardar o peixe para vender depois',
        'Devolver o peixe vivo ao rio com cuidado',
        'Congelar e vender como isca',
        'Usar como adubo nas margens'
    ], 1),
    mc1('Qual prática demonstra responsabilidade ambiental na pesca?', [
        'Usar redes de malha fina para maximizar a captura',
        'Pescar apenas espécies e tamanhos permitidos pela legislação',
        'Pescar em áreas de reprodução durante o defeso',
        'Descartar redes velhas nos rios'
    ], 1),
    vf('Pescar de forma responsável hoje garante renda para o pescador no futuro.', true),
];

const B_PESC_Q2 = [
    mc1('A proporção correta de gelo para conservar o pescado a bordo é de:', [
        '1 parte de gelo para 3 de peixe',
        '1 parte de gelo para cada parte de peixe (1:1)',
        'Apenas cobrir o peixe com uma camada fina de gelo',
        'Usar apenas água gelada sem gelo'
    ], 1),
    mc1('A cadeia do frio na pesca artesanal garante que:', [
        'O pescado chegue ao consumidor com qualidade e segurança',
        'O peixe fique congelado durante a pescaria',
        'O barco consuma menos combustível',
        'O pescador pague menos impostos'
    ], 0),
    vf('Lavar as mãos e os equipamentos antes de manusear o pescado é uma boa prática de higiene.', true),
    mc1('A rastreabilidade do pescado permite:', [
        'Identificar a origem, o pescador e as condições de captura do produto',
        'Controlar o número de pescadores por rio',
        'Calcular automaticamente o preço de venda',
        'Emitir a licença de pesca automaticamente'
    ], 0),
    mc1('Para acessar mercados maiores como supermercados, o pescado precisa ter:', [
        'Apenas a nota fiscal do pescador',
        'Inspeção sanitária (SIM, SIE ou SIF) e rastreabilidade',
        'Certificação orgânica obrigatória',
        'Aprovação da colônia de pescadores'
    ], 1),
    vf('Peixe salgado e defumado são formas de conservação que aumentam o prazo de venda.', true),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO C — Qualidade e Certificação
// ═══════════════════════════════════════════════════════════════════════════════

const C_MEL_Q1 = [
    mc1('O mel de qualidade se diferencia principalmente por:', [
        'Ter cor mais escura e sabor mais forte',
        'Baixa umidade, ausência de adulterantes e boa procedência',
        'Ser produzido apenas por abelhas africanizadas',
        'Ter adição de açúcar para aumentar o volume'
    ], 1),
    mc1('O SIM (Serviço de Inspeção Municipal) habilita o apicultor a vender mel:', [
        'Para exportação internacional',
        'Apenas dentro do próprio município',
        'Para todo o Brasil',
        'Somente para o governo via PAA'
    ], 1),
    vf('Para vender mel em outros estados, é necessário ter o SIF (Serviço de Inspeção Federal).', true),
    mc1('O SIE (Serviço de Inspeção Estadual) permite vender mel:', [
        'Somente na cidade de produção',
        'Em todo o estado onde foi emitido',
        'Em qualquer país do Mercosul',
        'Apenas para supermercados de grande porte'
    ], 1),
    mc1('A adulteração do mel com açúcar é detectada por:', [
        'Análise visual da cor',
        'Análises laboratoriais de umidade e composição',
        'Cheiro do produto',
        'Teste de viscosidade artesanal'
    ], 1),
    vf('Mel com umidade acima de 20% tem maior risco de fermentação e perde qualidade.', true),
];

const C_MEL_Q2 = [
    mc1('A certificação orgânica do mel garante que:', [
        'O mel foi produzido sem agrotóxicos e em área livre de contaminação',
        'O mel tem mais vitaminas que o convencional',
        'O mel foi produzido por abelhas europeias',
        'O apicultor não precisa de inspeção sanitária'
    ], 0),
    mc1('O rótulo do mel deve obrigatoriamente conter:', [
        'Apenas o nome do apicultor e o preço',
        'Nome do produto, peso, procedência, validade e registro de inspeção',
        'Ingredientes e tabela nutricional detalhada',
        'Apenas o código de barras'
    ], 1),
    vf('Mel orgânico certificado alcança preços mais altos no mercado e atrai consumidores exigentes.', true),
    mc1('Para obter o SIF, o entreposto de mel precisa:', [
        'Apenas ter CNPJ regularizado',
        'Atender às normas do MAPA sobre instalações, higiene e controle de qualidade',
        'Ter produção mínima de 1 tonelada por mês',
        'Estar cadastrado na prefeitura municipal'
    ], 1),
    mc1('Quem pode ajudar o apicultor a obter a certificação orgânica?', [
        'Apenas laboratórios privados internacionais',
        'Organismos de Avaliação de Conformidade (OACs) credenciados pelo MAPA',
        'Qualquer associação rural do município',
        'O INSS mediante solicitação formal'
    ], 1),
    vf('A certificação orgânica do mel pode ser feita de forma coletiva por grupos de apicultores.', true),
];

const C_PESC_Q1 = [
    mc1('Pescado de qualidade é aquele que:', [
        'Foi capturado em grande quantidade',
        'Possui odor fresco, olhos brilhantes e guelras vermelhas',
        'Tem cor da carne mais escura',
        'Foi processado sem refrigeração'
    ], 1),
    mc1('O DIPOA é o departamento responsável por:', [
        'Registrar pescadores no RGP',
        'Fiscalizar a inspeção sanitária de produtos de origem animal, incluindo pescado',
        'Controlar os estoques de peixe nos rios',
        'Distribuir o Seguro-Defeso'
    ], 1),
    vf('O SIF permite que o pescado seja vendido em qualquer estado do Brasil.', true),
    mc1('O SIE do pescado é emitido pelo:', [
        'Governo Federal (MAPA)',
        'Governo Estadual (órgão de defesa agropecuária)',
        'Prefeitura municipal',
        'Colônia de pescadores'
    ], 1),
    mc1('Qual sinal indica que o pescado fresco está em boas condições?', [
        'Guelras acinzentadas e olhos opacos',
        'Cheiro forte de amônia',
        'Carne firme ao toque e odor suave de mar',
        'Escamas soltas e abdômen inchado'
    ], 2),
    vf('Para vender pescado em supermercados de outros estados, o SIM não é suficiente.', true),
];

const C_PESC_Q2 = [
    mc1('A rastreabilidade do pescado é importante para:', [
        'Calcular o preço de venda automaticamente',
        'Identificar a origem e as condições de captura do produto ao longo da cadeia',
        'Dispensar a necessidade de inspeção sanitária',
        'Reduzir o tempo de transporte'
    ], 1),
    mc1('O rótulo do pescado beneficiado deve conter:', [
        'Apenas o nome do pescador e a data',
        'Nome do produto, peso, data de validade, procedência e número de inspeção',
        'Somente o preço e o código de barras',
        'Lista de ingredientes de temperos adicionados'
    ], 1),
    vf('A certificação sustentável do pescado (como MSC) é um diferencial para exportação.', true),
    mc1('O pescado com selo de certificação sustentável:', [
        'É proibido de ser vendido no mercado nacional',
        'Demonstra que foi capturado de forma responsável e pode acessar mercados premium',
        'Não precisa de inspeção sanitária',
        'É produzido apenas em fazendas de aquicultura'
    ], 1),
    mc1('Para garantir rastreabilidade, o pescador deve registrar:', [
        'Apenas o peso total da captura',
        'Local, data, espécie, quantidade e condições de captura',
        'Somente o valor da venda',
        'O nome do comprador e o preço negociado'
    ], 1),
    vf('Cooperativas ajudam o pescador a acessar selos de qualidade e abrir novos mercados.', true),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO D — Venda Justa
// ═══════════════════════════════════════════════════════════════════════════════

const D_MEL_Q1 = [
    mc1('Para calcular o preço justo do mel, o apicultor deve considerar:', [
        'Apenas o preço praticado pelo vizinho',
        'Todos os custos de produção, mão de obra e uma margem de lucro',
        'Somente o custo das embalagens',
        'O preço sugerido pelos atravessadores'
    ], 1),
    mc1('Vender mel diretamente ao consumidor final é vantajoso porque:', [
        'Elimina a necessidade de nota fiscal',
        'O apicultor recebe um preço maior sem intermediários',
        'Não exige qualquer documentação',
        'Dispensa o uso de embalagens adequadas'
    ], 1),
    vf('Feiras livres e mercados locais são canais de venda que valorizam o mel artesanal.', true),
    mc1('O atravessador na cadeia do mel geralmente:', [
        'Ajuda o apicultor a obter melhores preços',
        'Fica com a maior parte da margem de lucro, reduzindo o ganho do apicultor',
        'Garante inspeção sanitária do produto',
        'Oferece crédito rural ao apicultor'
    ], 1),
    mc1('Associar-se a uma cooperativa de mel permite ao apicultor:', [
        'Vender sem nota fiscal',
        'Ter poder de negociação coletiva e acessar mercados maiores',
        'Dispensar o registro no CAF',
        'Produzir mel sem seguir boas práticas'
    ], 1),
    vf('O preço do mel orgânico certificado costuma ser maior do que o mel convencional.', true),
];

const D_MEL_Q2 = [
    mc1('A Nota Fiscal é obrigatória para:', [
        'Apenas vendas acima de R$ 10.000',
        'Qualquer venda formal de mel, inclusive para o governo via PAA e PNAE',
        'Somente vendas para supermercados',
        'Apenas exportação internacional'
    ], 1),
    mc1('O MEI (Microempreendedor Individual) permite ao apicultor:', [
        'Produzir mel sem inspeção sanitária',
        'Emitir nota fiscal e ter CNPJ com menos burocracia',
            'Acessar o PRONAF sem precisar do CAF',
        'Vender mel em outros países'
    ], 1),
    vf('A cooperativa pode emitir nota fiscal coletiva para os associados que vendem pelo grupo.', true),
    mc1('Qual canal de venda oferece o maior preço por kg de mel?', [
        'Atravessador',
        'Cooperativa repassando para atacado',
        'Venda direta ao consumidor final (feiras, lojas próprias, delivery)',
        'Supermercado via consignação'
    ], 2),
    mc1('Para vender mel pelo PNAE (merenda escolar), o apicultor precisa:', [
        'Apenas ter RG e CPF',
        'Ter CAF ativo, nota fiscal e estar em cooperativa ou associação',
        'Ter CNPJ com mais de 2 anos de atividade',
        'Ter SIF obrigatoriamente'
    ], 1),
    vf('Registrar os custos de produção ajuda o apicultor a negociar preços mais justos.', true),
];

const D_PESC_Q1 = [
    mc1('Para calcular o preço justo do pescado, o pescador deve considerar:', [
        'Apenas o preço do dia no mercado',
        'Custo do combustível, gelo, manutenção do barco, mão de obra e margem de lucro',
        'Somente o custo das redes',
        'O preço sugerido pelo atravessador'
    ], 1),
    mc1('Vender pescado diretamente ao restaurante ou consumidor é vantajoso porque:', [
        'Elimina a necessidade de conservação do produto',
        'O pescador recebe um preço maior sem intermediários',
        'Não exige documentação alguma',
        'Dispensa o uso de gelo'
    ], 1),
    vf('Feiras de pescado e entregas diretas aos restaurantes valorizam o trabalho do pescador artesanal.', true),
    mc1('O atravessador na cadeia do pescado geralmente:', [
        'Garante melhor preço ao pescador',
        'Fica com grande parte da margem, reduzindo o ganho do pescador',
        'Oferece crédito para compra de equipamentos',
        'Garante a inspeção sanitária do produto'
    ], 1),
    mc1('Participar de uma cooperativa de pesca permite ao pescador:', [
        'Pescar em áreas proibidas',
        'Ter poder de negociação coletiva e acessar mercados maiores com preços melhores',
        'Dispensar o RGP',
        'Produzir sem seguir boas práticas'
    ], 1),
    vf('Pescado com certificação de qualidade e rastreabilidade alcança preços maiores no mercado.', true),
];

const D_PESC_Q2 = [
    mc1('A Nota Fiscal é obrigatória para:', [
        'Apenas vendas acima de R$ 5.000',
        'Qualquer venda formal de pescado, inclusive para o governo via PAA e PNAE',
        'Somente vendas para supermercados',
        'Apenas exportação'
    ], 1),
    mc1('A Colônia de Pescadores pode ajudar o associado a:', [
        'Pescar durante o defeso sem punição',
        'Emitir documentação coletiva e acessar programas como o PNAE e PAA',
        'Obter financiamento sem o RGP',
        'Vender pescado sem inspeção'
    ], 1),
    vf('A cooperativa de pesca pode emitir nota fiscal coletiva para os associados.', true),
    mc1('Para vender pescado pelo PNAE (merenda escolar), o pescador precisa:', [
        'Apenas ter o RGP',
        'Ter DAP/CAF ativo, nota fiscal e estar em cooperativa ou associação',
        'Ter empresa com mais de 2 anos',
        'Ter SIF obrigatoriamente'
    ], 1),
    mc1('Qual canal de venda costuma oferecer o maior preço por kg de pescado?', [
        'Atravessador no porto',
        'Cooperativa repassando ao atacado',
        'Venda direta ao restaurante ou consumidor final',
        'Supermercado via consignação'
    ], 2),
    vf('Registrar os custos de cada pescaria ajuda o pescador a saber se está tendo lucro real.', true),
];

// ═══════════════════════════════════════════════════════════════════════════════
// Configuração de módulos
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIGS = [
    {
        label: 'Módulo B — Mel (Boas Práticas)',
        token: TOKEN_MEL,
        moduleId: MODULES.mel.B,
        cp1: { title: 'Checkpoint 1 — Módulo B', desc: 'Calendário apícola, manejo e segurança.', questions: B_MEL_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo B', desc: 'Extração, processamento e boas práticas no apiário.', questions: B_MEL_Q2 },
    },
    {
        label: 'Módulo B — Pesca (Boas Práticas)',
        token: TOKEN_PESC,
        moduleId: MODULES.pesc.B,
        cp1: { title: 'Checkpoint 1 — Módulo B', desc: 'Pesca responsável, seletividade e defeso.', questions: B_PESC_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo B', desc: 'Conservação do pescado, rastreabilidade e higiene.', questions: B_PESC_Q2 },
    },
    {
        label: 'Módulo C — Mel (Qualidade e Certificação)',
        token: TOKEN_MEL,
        moduleId: MODULES.mel.C,
        cp1: { title: 'Checkpoint 1 — Módulo C', desc: 'Qualidade do mel, umidade e inspeção sanitária.', questions: C_MEL_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo C', desc: 'Certificação orgânica, rotulagem e acesso a mercados.', questions: C_MEL_Q2 },
    },
    {
        label: 'Módulo C — Pesca (Qualidade e Certificação)',
        token: TOKEN_PESC,
        moduleId: MODULES.pesc.C,
        cp1: { title: 'Checkpoint 1 — Módulo C', desc: 'Qualidade do pescado e inspeção sanitária.', questions: C_PESC_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo C', desc: 'Rastreabilidade, rotulagem e certificação sustentável.', questions: C_PESC_Q2 },
    },
    {
        label: 'Módulo D — Mel (Venda Justa)',
        token: TOKEN_MEL,
        moduleId: MODULES.mel.D,
        cp1: { title: 'Checkpoint 1 — Módulo D', desc: 'Precificação justa e canais de venda do mel.', questions: D_MEL_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo D', desc: 'Nota fiscal, MEI, cooperativa e PNAE.', questions: D_MEL_Q2 },
    },
    {
        label: 'Módulo D — Pesca (Venda Justa)',
        token: TOKEN_PESC,
        moduleId: MODULES.pesc.D,
        cp1: { title: 'Checkpoint 1 — Módulo D', desc: 'Precificação justa e canais de venda do pescado.', questions: D_PESC_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo D', desc: 'Nota fiscal, colônia, cooperativa e PNAE.', questions: D_PESC_Q2 },
    },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

async function seedModule(cfg) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${cfg.label}`);
    console.log(`${'═'.repeat(60)}`);

    for (const [num, cp] of [[1, cfg.cp1], [2, cfg.cp2]]) {
        console.log(`\n  CP${num}: ${cp.title}`);
        const quizId = await createQuiz(cfg.token, cp.title, cp.desc);
        for (let i = 0; i < cp.questions.length; i++) {
            await createQuestion(cfg.token, quizId, i + 1, cp.questions[i]);
        }
        process.stdout.write(' ✓\n');
        await createCartoon(cfg.token, cfg.moduleId, cp.title, quizId);
    }
}

async function main() {
    console.log('=== Cartoon Checkpoints — Módulos B, C e D (Mel + Pesca) ===');
    for (const cfg of CONFIGS) {
        await seedModule(cfg);
    }
    console.log('\n\n✅ Tudo concluído! Ajuste as posições manualmente no painel.');
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

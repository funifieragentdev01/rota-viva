/**
 * seed-modulo-c-pesca.js
 * Cria o Módulo C — Qualidade e Certificação na Rota da Pesca.
 * Temas: inspeção sanitária (DIPOA/SIF/SIE), rastreabilidade, rotulagem, MSC
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-c-pesca.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==';
const SUBJECT_ID = '69d28273505f02177b0d9658'; // Rota da Pesca

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

function getId(r) {
    if (r && r._id) return r._id;
    if (Array.isArray(r) && r[0] && r[0]._id) return r[0]._id;
    throw new Error('Sem _id: ' + JSON.stringify(r).substring(0, 200));
}

async function createFolder(title, type, parentId) {
    const id = getId(await api('PUT', '/v3/database/folder', { title, type, parent: parentId }));
    console.log(`  📁 ${type} "${title}": ${id}`);
    return id;
}
async function createVideo(title, url, description) {
    const id = getId(await api('PUT', '/v3/database/video__c', { title, url, description: description || '' }));
    console.log(`  🎬 video "${title}": ${id}`);
    return id;
}
async function createReading(title, body) {
    const id = getId(await api('PUT', '/v3/database/reading__c', { title, body }));
    console.log(`  📖 reading "${title}": ${id}`);
    return id;
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
async function linkContent(lessonId, contentId, type, title) {
    await api('PUT', '/v3/database/folder_content', { parent: lessonId, content: contentId, type, title });
    console.log(`\n  🔗 ${type} → lesson OK`);
}

// ─── Question builders ────────────────────────────────────────────────────────

const G1 = { grade: 1, extra: {} };
const G0 = { grade: 0, extra: {} };

const mc1 = (question, options, ci) => ({
    type: 'MULTIPLE_CHOICE', select: 'one_answer', title: question, question,
    choices: options.map((text, i) => ({ label: String.fromCharCode(65 + i), answer: text, ...(i === ci ? G1 : G0) }))
});
const vf = (question, correct) => ({ type: 'TRUE_FALSE', title: question, question, correctAnswer: correct, choices: [] });
const listen = (speechText, question, options, ci) => ({
    type: 'LISTEN', title: question, question, speechText, extra: { speechText, ttsLang: 'pt-BR' },
    choices: options.map((text, i) => ({ label: String.fromCharCode(65 + i), answer: text, ...(i === ci ? G1 : G0) }))
});
const listenAndOrder = (speechText, question, items) => ({
    type: 'LISTEN_AND_ORDER', title: question, question, speechText, extra: { speechText, ttsLang: 'pt-BR' },
    choices: items.map((text, i) => ({ label: String.fromCharCode(65 + i), answer: text, ...G1 }))
});
const matching = (question, pairs) => {
    const left = pairs.map((p, i) => ({ id: `l${i+1}`, text: p.left }));
    const right = pairs.map((p, i) => ({ id: `r${i+1}`, text: p.right }));
    const solutions = {};
    pairs.forEach((_, i) => { solutions[`l${i+1}`] = `r${i+1}`; });
    return { type: 'MATCHING', title: question, question, choices: [], model: { matching: { left, right, solutions } } };
};
const smw = (question, text, blanks) => ({
    type: 'SELECT_MISSING_WORDS', title: question, question, choices: [],
    model: { missingWords: { text, blanks: blanks.map(b => ({
        id: b.id, correctOptionId: `opt_${b.id}_${b.ci}`,
        options: b.opts.map((t, i) => ({ id: `opt_${b.id}_${i}`, text: t }))
    })) } }
});
const dnd = (question, sentence, wordPool, correctOrder) => {
    const targets = correctOrder.map((w, i) => ({ id: `t${i+1}`, text: `[${i+1}]`, correctOptionId: `w${wordPool.indexOf(w)+1}` }));
    const optionsPool = wordPool.map((text, i) => ({ id: `w${i+1}`, text }));
    return { type: 'DRAG_AND_DROP_INTO_TEXT', title: question, question, choices: [], model: { dragDropText: { sentence, targets, optionsPool } } };
};
const shortAnswer = (question) => ({ type: 'SHORT_ANSWER', title: question, question, choices: [] });
const diy = (question, evidenceTypes, rubric) => ({ type: 'DIY_PROJECT', title: question, question, evidenceTypes, rubric: rubric || '', choices: [] });

// ─── Lessons ─────────────────────────────────────────────────────────────────

const LESSONS = [

// ── L01: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Pescado com Qualidade: O Que Isso Significa?',
    video: {
        title: 'Pescado com Qualidade: O Que Isso Significa?',
        url: 'https://www.youtube.com/watch?v=Q9kLkNYfHEA',
        description: 'Diferença entre venda informal e venda regularizada do pescado. Mercados que se abrem com inspeção sanitária: supermercado, restaurante, outras cidades, exportação. Por que qualidade = preço melhor — e como a cooperativa é o caminho mais prático.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Pescado com Qualidade',
    description: 'Teste o que você aprendeu sobre como a qualidade e a certificação determinam os mercados que o pescador artesanal pode acessar.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é a principal diferença prática entre vender pescado com inspeção sanitária e sem inspeção?',
            ['Com inspeção, o pescador paga mais impostos e tem custo operacional maior',
             'Com inspeção, o pescador acessa supermercados, restaurantes e outros estados — com preço até 2× maior que a venda informal',
             'Sem inspeção, o pescado é mais fresco porque não passa por processos burocrático demorados',
             'Não há diferença real — o consumidor não sabe e não se importa com inspeção sanitária'],
            1),
        mc1('Quais mercados são inacessíveis para o pescador sem nenhuma inspeção sanitária?',
            ['Apenas o mercado de exportação para Europa e Estados Unidos',
             'Supermercados, restaurantes formais, merenda escolar (PNAE) e venda em outros estados',
             'Somente feiras e mercados públicos municipais — que exigem inspeção desde 2022',
             'O mercado informal de rua e porta a porta — que exige cadastro municipal'],
            1),
        vf('O pescador artesanal que vende pescado sem inspeção sanitária para supermercados está sujeito a multa e apreensão do produto pela Vigilância Sanitária.', true),
        vf('A cooperativa com SIF não ajuda o pescador artesanal porque compra o peixe barato e fica com toda a margem de lucro.', false),
        listen(
            'Para vender pescado para restaurantes e supermercados do Amapá, o pescador precisa de SIE. Para vender em outros estados ou exportar, precisa de SIF. A cooperativa com SIF processa o pescado e vende em nome dos associados, repassando o valor líquido a cada pescador.',
            'O que o pescador precisa para vender para supermercados do Amapá e para outros estados, segundo o texto?',
            ['Apenas o RGP e a nota fiscal de produtor rural — sem necessidade de inspeção sanitária',
             'SIE para supermercados do Amapá; SIF para outros estados — via cooperativa é o caminho prático',
             'Certificação MSC obrigatória para qualquer venda fora da feira local',
             'CNPJ como pessoa jurídica e alvará federal de atividade pesqueira'],
            1),
        matching('Associe cada nível de inspeção sanitária com o mercado que ele abre para o pescado:', [
            { left: 'SIM (Municipal)', right: 'Vendas em feiras e estabelecimentos dentro do município' },
            { left: 'SIE (Estadual — ADAP)', right: 'Supermercados, restaurantes e PNAE no Amapá' },
            { left: 'SIF (Federal — DIPOA)', right: 'Venda em outros estados e exportação' },
            { left: 'MSC (Pesca Sustentável)', right: 'Mercados premium, exportação com preço diferenciado' }
        ]),
        mc1('Por que a cooperativa de pescadores com SIF é o caminho mais prático para o pescador artesanal acessar mercados maiores?',
            ['Porque o governo proibiu a venda individual de pescado acima de 10 kg por pescador',
             'Porque ter SIF individualmente exige câmara fria, laboratório e estrutura cara — a cooperativa divide esse custo entre os associados',
             'Porque o SIF individual foi extinto pelo MAPA em 2021 para pescadores artesanais',
             'Porque a cooperativa tem preços mais altos que qualquer outro comprador do mercado'],
            1),
        mc1('O que acontece com o pescado de melhor qualidade conservado no gelo que chega ao mercado formal com inspeção?',
            ['É confundido com peixe de aquicultura e perde valor por isso',
             'Acessa prateleiras de supermercado e restaurantes que pagam preço significativamente maior que o intermediário informal',
             'É redirecionado obrigatoriamente para o PAA antes de ser vendido ao consumidor final',
             'Precisa de laudos adicionais de laboratório para comprovar a qualidade ao comprador'],
            1),
        vf('A certificação MSC (Marine Stewardship Council) é uma forma de comprovar que o pescado vem de pesca sustentável — e abre mercados premium no Brasil e no exterior.', true),
        mc1('Qual é a consequência imediata para o pescador artesanal de vender pescado de qualidade com inspeção em vez de vender informal?',
            ['Mais burocracia e custo sem retorno financeiro real no curto prazo',
             'Acesso a preços 50-100% maiores em supermercados e restaurantes em relação à venda para o intermediário informal',
             'Perda da flexibilidade de negociação direta com o consumidor final na feira',
             'Obrigação de vender apenas pela cooperativa — sem poder vender direto ao consumidor'],
            1)
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Inspeção Sanitária do Pescado: DIPOA, SIF e SIE',
    video: {
        title: 'Inspeção Sanitária do Pescado: DIPOA, SIF e SIE',
        url: 'https://www.youtube.com/watch?v=bFdOvA1jA2c',
        description: 'DIPOA é o Departamento de Inspeção de Produtos de Origem Animal do MAPA. SIF para venda interestadual e exportação; SIE para venda dentro do Amapá. Como acessar o SIF via cooperativa de pescadores — e o papel do RURAP no processo.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Inspeção Sanitária do Pescado',
    description: 'Avalie o que você aprendeu sobre DIPOA, SIF e SIE e como o pescador artesanal pode regularizar o pescado.',
    fcType: 'quiz',
    questions: [
        mc1('O que é o DIPOA e qual seu papel na inspeção do pescado?',
            ['Departamento de Incentivos à Pesca Artesanal — distribui recursos para cooperativas de pescadores',
             'Departamento de Inspeção de Produtos de Origem Animal — vinculado ao MAPA, emite e fiscaliza o SIF do pescado',
             'Diretoria de Inspeção e Proteção dos Oceanos do Amapá — órgão estadual de controle pesqueiro',
             'Divisão de Infraestrutura e Porto do Amapá — administra o porto de Macapá'],
            1),
        matching('Associe cada sigla com o órgão que emite e o escopo de venda:', [
            { left: 'SIM', right: 'Prefeitura — venda apenas dentro do município' },
            { left: 'SIE', right: 'ADAP (Amapá) — venda em todo o estado' },
            { left: 'SIF via DIPOA', right: 'MAPA federal — venda em outros estados e exportação' },
            { left: 'Sem inspeção', right: 'Venda informal — sem acesso a supermercados ou programas do governo' }
        ]),
        listenAndOrder(
            'Primeiro, o pescador tira o RGP e se filia à cooperativa. Depois, a cooperativa solicita o SIF ao DIPOA com toda a documentação e plantas da instalação. Em seguida, um fiscal do MAPA faz a vistoria das instalações de processamento. Depois, o SIF é aprovado e a cooperativa pode processar e embalar o pescado. Por último, o pescador entrega o pescado fresco e a cooperativa vende com SIF em nome do grupo.',
            'Ouça e ordene os passos para o pescador acessar o SIF via cooperativa:',
            ['Tirar o RGP e se filiar à cooperativa',
             'Cooperativa solicita o SIF ao DIPOA com documentação',
             'Fiscal do MAPA faz vistoria das instalações',
             'SIF aprovado — cooperativa pode processar e embalar',
             'Pescador entrega o pescado e cooperativa vende com SIF']
        ),
        vf('O SIE (inspeção estadual) do pescado no Amapá é emitido pela ADAP — Agência de Defesa Agropecuária do Amapá.', true),
        vf('Para o pescador artesanal ter SIF individualmente, basta ter RGP e registrar o barco como pessoa jurídica.', false),
        mc1('O que a ADAP (Amapá) exige minimamente para emitir o SIE de uma cooperativa de pescadores?',
            ['Apenas o CNPJ da cooperativa e o RGP dos associados',
             'Instalações de processamento com câmara fria, piso lavável, controle de temperatura e responsável técnico',
             'Certificação MSC prévia e laudos de laboratório por 3 anos consecutivos',
             'O SIM municipal de todos os pescadores associados à cooperativa'],
            1),
        mc1('Qual é o papel do RURAP no processo de regularização sanitária do pescado no Amapá?',
            ['Emitir o SIF em nome dos pescadores artesanais sem necessidade de cooperativa',
             'Orientar pescadores e cooperativas sobre como adequar a infraestrutura e acessar o SIE ou SIF',
             'Fiscalizar e autuar pescadores que vendem pescado sem inspeção nas feiras de Macapá',
             'Comprar o pescado dos cooperados e revender com SIF próprio do governo estadual'],
            1),
        mc1('Por que o SIM (inspeção municipal) é o nível mais acessível para o pescador artesanal começar?',
            ['Porque dispensa inspeção física e é emitido automaticamente com o RGP',
             'Porque exige estrutura mínima avaliada pela prefeitura — menos requisitos que o SIE ou SIF',
             'Porque o governo federal subsidia 100% do custo do SIM para pescadores com RGP',
             'Porque o SIM tem validade vitalícia, enquanto SIE e SIF precisam ser renovados anualmente'],
            1),
        smw(
            'Complete sobre inspeção sanitária do pescado:',
            'O [[b1]] é vinculado ao MAPA e emite o [[b2]] para venda nacional e exportação. O [[b3]] permite vender em todo o Amapá. A [[b4]] orienta os pescadores no processo de regularização.',
            [
                { id: 'b1', opts: ['DIPOA', 'ADAP', 'RURAP', 'IBAMA'], ci: 0 },
                { id: 'b2', opts: ['SIF', 'SIE', 'SIM', 'RGP'], ci: 0 },
                { id: 'b3', opts: ['SIE', 'SIM', 'SIF', 'MSC'], ci: 0 },
                { id: 'b4', opts: ['RURAP', 'IBAMA', 'DIPOA', 'ADAP'], ci: 0 }
            ]
        ),
        vf('Um pescador artesanal que entrega o pescado a uma cooperativa com SIF pode acessar supermercados de outros estados mesmo sem ter SIF individualmente.', true)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'Rastreabilidade, Rotulagem e Certificação Sustentável',
    reading: {
        title: 'Rastreabilidade, Rotulagem e Certificação Sustentável',
        body: `<h2>Rastreabilidade, Rotulagem e Certificação Sustentável</h2>

<p>O supermercado, o restaurante e o importador europeu querem saber de onde vem o peixe que compram — e estão dispostos a pagar mais por quem responde a essa pergunta com documentos.</p>

<h3>O que é Rastreabilidade do Pescado</h3>

<p>Rastreabilidade é a capacidade de <strong>acompanhar o caminho do pescado</strong> desde a captura até o consumidor final. Para ser rastreável, o lote de pescado precisa ter registrado:</p>
<ul>
<li>Quem pescou — nome e número do RGP do pescador</li>
<li>Onde foi capturado — rio, lago ou área marítima</li>
<li>Quando foi capturado — data e hora</li>
<li>Espécie e quantidade</li>
<li>Como foi conservado — gelo, câmara fria, processado</li>
<li>Número do lote — para rastrear em caso de reclamação</li>
</ul>

<h3>Rotulagem Obrigatória do Pescado (IN MAPA nº 29)</h3>

<p>Todo pescado embalado e vendido formalmente no Brasil deve ter no rótulo:</p>
<ol>
<li>Nome científico e popular da espécie</li>
<li>Estado de conservação: <em>fresco, resfriado, congelado, salgado, defumado</em></li>
<li>Origem: município e estado onde foi capturado</li>
<li>Peso líquido</li>
<li>Data de captura ou processamento</li>
<li>Número do lote</li>
<li>Número do SIF ou SIE</li>
<li>Nome e CNPJ do responsável pela embalagem</li>
</ol>

<h3>MSC — Marine Stewardship Council</h3>

<p>O MSC é a principal certificação de <strong>pesca sustentável</strong> do mundo. O logo azul do MSC na embalagem indica que o peixe vem de uma pescaria que:</p>
<ul>
<li>Não esgota os estoques naturais</li>
<li>Respeita o ecossistema marinho e fluvial</li>
<li>Tem rastreabilidade comprovada da captura até a embalagem</li>
</ul>

<p><strong>Por que o MSC cresce no Brasil:</strong> redes de supermercados como Carrefour, Pão de Açúcar e Walmart já exigem MSC em algumas linhas de pescado. Restaurantes premium e hotéis também estão adotando. Para exportação para Europa e América do Norte, o MSC é cada vez mais requisito básico.</p>

<p><strong>Como o pescador artesanal acessa o MSC:</strong> individualmente é muito caro. O caminho é via <strong>cooperativa certificada pelo MSC</strong>, que audita a pescaria coletiva e divide o custo da certificação entre os associados.</p>

<h3>Primeiro Passo Prático</h3>

<ol>
<li><strong>Caderneta de bordo</strong> — registre cada saída: data, área, espécies, quantidades</li>
<li><strong>Nota Fiscal de Produtor Rural</strong> — via SEFAZ-AP com CPF + RGP</li>
<li><strong>Filiação à cooperativa com SIF</strong> — via colônia de pescadores ou RURAP</li>
<li><strong>Certificação MSC coletiva</strong> — objetivo de médio prazo via cooperativa estruturada</li>
</ol>

<p><em>Fonte: MAPA/DIPOA, MSC Brasil, ADAP-AP, RURAP-AP, Colônia de Pescadores Z-1 Macapá (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Rastreabilidade e Rotulagem',
    description: 'Teste seus conhecimentos sobre rastreabilidade do pescado, rotulagem obrigatória e certificação MSC.',
    fcType: 'quiz',
    questions: [
        mc1('O que é rastreabilidade do pescado?',
            ['Um código de barras impresso na embalagem que indica apenas o peso e o preço',
             'A capacidade de identificar quem pescou, onde, quando, como foi conservado e o número do lote — permite rastrear qualquer problema',
             'Um sistema de GPS instalado nas embarcações para monitorar as rotas de pesca em tempo real',
             'Um certificado emitido pelo IBAMA que comprova que a área de pesca não está degradada'],
            1),
        smw(
            'Complete as informações obrigatórias no rótulo do pescado conforme a IN MAPA nº 29:',
            'O rótulo deve ter o nome da [[b1]], a origem (município e [[b2]]), o [[b3]] do lote e o número do [[b4]] ou SIE.',
            [
                { id: 'b1', opts: ['espécie', 'cooperativa', 'pescador', 'embarcação'], ci: 0 },
                { id: 'b2', opts: ['estado', 'país', 'rio', 'porto'], ci: 0 },
                { id: 'b3', opts: ['número', 'peso', 'valor', 'código'], ci: 0 },
                { id: 'b4', opts: ['SIF', 'RGP', 'CAF', 'CPF'], ci: 0 }
            ]
        ),
        vf('O MSC (Marine Stewardship Council) é a principal certificação de pesca sustentável do mundo, reconhecida por supermercados e importadores internacionais.', true),
        vf('O pescador artesanal pode obter o MSC individualmente preenchendo um formulário no site da certificadora.', false),
        matching('Associe cada informação de rastreabilidade com o que ela comprova:', [
            { left: 'Nome e RGP do pescador', right: 'Identidade do produtor responsável pela captura' },
            { left: 'Área de captura', right: 'Origem geográfica do pescado e se a área é permitida' },
            { left: 'Data de captura', right: 'Frescor e prazo de validade do produto' },
            { left: 'Número do lote', right: 'Permite rastrear e recolher produtos com problema' }
        ]),
        mc1('Por que supermercados e restaurantes formais estão exigindo pescado com rastreabilidade?',
            ['Para cumprir obrigação legal da ANVISA que encareceu o processo de compra informal',
             'Para garantir ao consumidor que o peixe é de origem conhecida — e se proteger legalmente em caso de problema sanitário',
             'Porque a rastreabilidade reduz o imposto sobre circulação de mercadorias para estabelecimentos formais',
             'Apenas por modismo de marketing — não tem impacto real na segurança do produto'],
            1),
        mc1('O que o logo azul do MSC na embalagem de pescado indica ao consumidor?',
            ['Que o peixe foi criado em aquicultura — sem captura em rios ou mares',
             'Que o pescado vem de uma pescaria que não esgota estoques, respeita o ecossistema e tem rastreabilidade comprovada',
             'Que o produto tem inspeção do SIF e pode ser vendido em qualquer estado do Brasil',
             'Que a embalagem é biodegradável e aprovada pelo IBAMA para descarte no ambiente'],
            1),
        mc1('Como o pescador artesanal do Amapá pode acessar a certificação MSC de forma viável?',
            ['Individualmente — o custo é acessível para qualquer pescador com RGP',
             'Via cooperativa certificada pelo MSC que audita a pescaria coletiva e divide o custo entre os associados',
             'Através do RURAP que emite o MSC gratuitamente para pescadores filiados à colônia',
             'O MSC não está disponível para pesca artesanal — é exclusivo para grandes indústrias pesqueiras'],
            1),
        vf('A caderneta de bordo é o primeiro e mais simples documento de rastreabilidade que o pescador artesanal pode manter.', true),
        mc1('Qual rede de supermercados no Brasil já exige pescado com certificação MSC em algumas linhas de produto?',
            ['Apenas pequenas redes regionais sem presença nacional',
             'Redes como Carrefour, Pão de Açúcar e Walmart — alinhadas à demanda global por produtos sustentáveis',
             'O governo proibiu que supermercados exijam MSC — é considerado barreira comercial',
             'Somente supermercados de importações gourmet em São Paulo e Rio de Janeiro'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Situação com Qualidade',
    description: 'Conte sua situação atual com inspeção e certificação — as respostas ajudam o MDA a mapear as lacunas e apoiar os pescadores artesanais do Amapá.',
    fcType: 'listen',
    questions: [
        mc1('Seu pescado tem algum tipo de inspeção sanitária?',
            ['Sim, tenho SIE (inspeção estadual)', 'Sim, vendo por cooperativa com SIF',
             'Não tenho — vendo sem inspeção', 'Não sei o que é inspeção sanitária de pescado'], 0),
        mc1('Você vende pescado embalado com rótulo?',
            ['Sim, com rótulo completo conforme a lei', 'Sim, mas com rótulo simples sem todas as informações',
             'Não — vendo sem embalagem diretamente no porto ou feira', 'Vendo para atravessador que embala por conta dele'], 0),
        mc1('Você já ouviu falar em certificação MSC (pesca sustentável)?',
            ['Sim, já tenho ou minha cooperativa tem MSC', 'Sim, conheço mas não sei como obter',
             'Ouvi falar mas não sei o que é', 'Nunca ouvi falar em MSC'], 0),
        shortAnswer('Qual é o maior obstáculo para você ter inspeção sanitária no seu pescado hoje?'),
        mc1('Você faz parte de alguma cooperativa que processa ou vende pescado?',
            ['Sim, sou associado a uma cooperativa de pescadores', 'Não, mas quero entrar em uma cooperativa',
             'Existe cooperativa na região mas prefiro vender por conta', 'Não há cooperativa de pescadores na minha região'], 0)
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Pescado com Qualidade',
    description: 'Registre uma evidência de qualidade no seu pescado e ganhe um cristal — cada foto mostra que você pesca e vende com responsabilidade.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto que mostre qualidade no seu pescado: embalagem com etiqueta, pescado bem conservado no gelo, barco limpo e organizado, ou um rótulo que você criou. Se ainda não tem rótulo, tire uma foto do pescado e escreva o que você quer colocar nele.',
            ['photo'],
            'Foto de pescado embalado com etiqueta/rótulo, caixa com gelo bem organizada, barco limpo, petrechos organizados por tamanho, ou rascunho de rótulo que você quer criar.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo C',
    description: 'Revise todos os temas do Módulo C e consolide o que você aprendeu sobre inspeção sanitária, rotulagem e rastreabilidade do pescado.',
    fcType: 'review',
    questions: [
        mc1('Qual nível de inspeção sanitária permite ao pescador artesanal vender pescado em outros estados e exportar?',
            ['SIM — Serviço de Inspeção Municipal da prefeitura de Macapá',
             'SIE — emitido pela ADAP para venda dentro do Amapá',
             'SIF via DIPOA — nível federal que permite venda nacional e exportação',
             'MSC — certificação de sustentabilidade reconhecida internacionalmente'],
            2),
        vf('O SIE (inspeção estadual) do Amapá é emitido pela ADAP e permite vender pescado em todo o estado.', true),
        vf('O pescador artesanal pode obter o MSC individualmente a um custo acessível sem precisar de cooperativa.', false),
        matching('Associe cada sigla com o escopo de venda que ela permite:', [
            { left: 'SIM', right: 'Venda apenas dentro do município' },
            { left: 'SIE (ADAP)', right: 'Venda em todo o Amapá' },
            { left: 'SIF (DIPOA)', right: 'Outros estados e exportação' },
            { left: 'MSC', right: 'Mercados premium e exportação com preço diferenciado' }
        ]),
        mc1('O que é o DIPOA?',
            ['Departamento de Incentivos à Pesca Artesanal — distribui crédito para pescadores',
             'Departamento de Inspeção de Produtos de Origem Animal — emite e fiscaliza o SIF do pescado',
             'Diretoria de Infraestrutura dos Portos do Amapá — administra o cais de desembarque',
             'Divisão de Inspeção da Pesca Oceânica do Amapá — órgão estadual de controle'],
            1),
        matching('Associe cada informação com sua função na rastreabilidade do pescado:', [
            { left: 'RGP do pescador', right: 'Identifica o produtor responsável pela captura' },
            { left: 'Área de captura', right: 'Comprova a origem e se a área tem restrição de pesca' },
            { left: 'Número do lote', right: 'Permite rastrear e recolher lotes com problema de qualidade' },
            { left: 'Data de captura', right: 'Determina o frescor e o prazo de validade do produto' }
        ]),
        smw(
            'Complete sobre rotulagem obrigatória do pescado:',
            'O rótulo deve ter o nome da [[b1]], a [[b2]] de captura, o número do [[b3]] e o número do [[b4]] ou SIE.',
            [
                { id: 'b1', opts: ['espécie', 'cooperativa', 'embarcação', 'pescador'], ci: 0 },
                { id: 'b2', opts: ['data', 'quantidade', 'temperatura', 'rota'], ci: 0 },
                { id: 'b3', opts: ['lote', 'pedido', 'contrato', 'fornecedor'], ci: 0 },
                { id: 'b4', opts: ['SIF', 'RGP', 'CAF', 'CPF'], ci: 0 }
            ]
        ),
        mc1('Como o pescador artesanal do Amapá pode acessar o SIF sem ter estrutura industrial própria?',
            ['Solicitando licença temporária de SIF ao DIPOA mediante pagamento anual de taxa',
             'Através de uma cooperativa de pescadores que já possui SIF — a cooperativa processa e vende em nome do grupo',
             'Fazendo parceria informal com um frigorífico que divide o uso do SIF com pescadores locais',
             'O RURAP emite SIF provisório para pescadores artesanais sem necessidade de cooperativa'],
            1),
        mc1('O que o logo azul do MSC na embalagem de pescado garante ao comprador?',
            ['Que o peixe foi criado em aquicultura certificada — sem captura em ambientes naturais',
             'Que o pescado vem de uma pescaria sustentável com rastreabilidade comprovada, que respeita os estoques e o ecossistema',
             'Que o produto tem SIF e pode ser vendido em qualquer estado do Brasil',
             'Que a embalagem é 100% reciclável e aprovada pelo IBAMA'],
            1),
        mc1('Qual é o primeiro e mais simples passo de rastreabilidade que o pescador artesanal pode adotar hoje?',
            ['Instalar GPS na embarcação e conectar ao sistema federal de monitoramento',
             'Manter uma caderneta de bordo com data, área, espécies e quantidades capturadas a cada saída',
             'Contratar um contador para emitir nota fiscal eletrônica de empresa a cada venda',
             'Tirar o SIF individualmente antes de vender qualquer quantidade de pescado'],
            1)
    ]
}

]; // fim LESSONS

// ─── Seed ────────────────────────────────────────────────────────────────────

async function seedLesson(moduleId, lesson, idx) {
    console.log(`\n── Lição ${idx + 1}: ${lesson.title}`);
    const lessonId = await createFolder(lesson.title, 'lesson', moduleId);
    if (lesson.video) {
        const v = lesson.video;
        const vId = await createVideo(v.title, v.url, v.description);
        await linkContent(lessonId, vId, 'video', v.title);
    } else if (lesson.reading) {
        const r = lesson.reading;
        const rId = await createReading(r.title, r.body);
        await linkContent(lessonId, rId, 'reading', r.title);
    } else {
        const fcType = lesson.fcType || 'quiz';
        const quizId = await createQuiz(lesson.title, lesson.description);
        console.log('  Questões: ');
        for (let i = 0; i < lesson.questions.length; i++) await createQuestion(quizId, i + 1, lesson.questions[i]);
        await linkContent(lessonId, quizId, fcType, lesson.title);
    }
}

async function main() {
    console.log('🐟 Seed — Rota da Pesca: Módulo C — Qualidade e Certificação');
    console.log('================================================================\n');
    const moduleId = await createFolder('Módulo C — Qualidade e Certificação', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log('\n\n✅ Módulo C — Rota da Pesca criado!');
    console.log(`   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

/**
 * seed-modulo-b-pesca.js
 * Cria o Módulo B — Boas Práticas Produtivas na Rota da Pesca.
 * Temas: seletividade na captura, conservação do pescado a bordo, cadeia do frio, rastreabilidade
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-b-pesca.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==';
const SUBJECT_ID = '69d28273505f02177b0d9658'; // Rota da Pesca

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

function mc1(question, options, correctIndex) {
    return {
        type: 'MULTIPLE_CHOICE', select: 'one_answer', title: question, question,
        choices: options.map((text, i) => ({ label: String.fromCharCode(65 + i), answer: text, ...(i === correctIndex ? G1 : G0) }))
    };
}

function vf(question, correct) {
    return { type: 'TRUE_FALSE', title: question, question, correctAnswer: correct, choices: [] };
}

function listen(speechText, question, options, correctIndex) {
    return {
        type: 'LISTEN', title: question, question, speechText,
        extra: { speechText, ttsLang: 'pt-BR' },
        choices: options.map((text, i) => ({ label: String.fromCharCode(65 + i), answer: text, ...(i === correctIndex ? G1 : G0) }))
    };
}

function listenAndOrder(speechText, question, orderedItems) {
    return {
        type: 'LISTEN_AND_ORDER', title: question, question, speechText,
        extra: { speechText, ttsLang: 'pt-BR' },
        choices: orderedItems.map((text, i) => ({ label: String.fromCharCode(65 + i), answer: text, ...G1 }))
    };
}

function matching(question, pairs) {
    const left = pairs.map((p, i) => ({ id: `l${i + 1}`, text: p.left }));
    const right = pairs.map((p, i) => ({ id: `r${i + 1}`, text: p.right }));
    const solutions = {};
    pairs.forEach((_, i) => { solutions[`l${i + 1}`] = `r${i + 1}`; });
    return { type: 'MATCHING', title: question, question, choices: [], model: { matching: { left, right, solutions } } };
}

function selectMissingWords(question, text, blanks) {
    return {
        type: 'SELECT_MISSING_WORDS', title: question, question, choices: [],
        model: {
            missingWords: {
                text,
                blanks: blanks.map(b => ({
                    id: b.id,
                    correctOptionId: `opt_${b.id}_${b.ci}`,
                    options: b.opts.map((t, i) => ({ id: `opt_${b.id}_${i}`, text: t }))
                }))
            }
        }
    };
}

function dragAndDrop(question, sentence, wordPool, correctOrder) {
    const targets = correctOrder.map((word, i) => ({
        id: `t${i + 1}`, text: `[${i + 1}]`, correctOptionId: `w${wordPool.indexOf(word) + 1}`
    }));
    const optionsPool = wordPool.map((text, i) => ({ id: `w${i + 1}`, text }));
    return { type: 'DRAG_AND_DROP_INTO_TEXT', title: question, question, choices: [], model: { dragDropText: { sentence, targets, optionsPool } } };
}

function essay(question, rubric) {
    return { type: 'ESSAY', title: question, question, rubric: rubric || '', totalLines: 5, choices: [] };
}

function shortAnswer(question) {
    return { type: 'SHORT_ANSWER', title: question, question, choices: [] };
}

function diy(question, evidenceTypes, rubric) {
    return { type: 'DIY_PROJECT', title: question, question, evidenceTypes, rubric: rubric || '', choices: [] };
}

// ─── Lesson definitions ───────────────────────────────────────────────────────

const LESSONS = [

// ── L01: Vídeo ────────────────────────────────────────────────────────────────
{
    title: 'Pescando com Responsabilidade',
    video: {
        title: 'Pescando com Responsabilidade',
        url: 'https://www.youtube.com/watch?v=HzSCMVeWZL4',
        description: 'Seletividade na pesca artesanal: malhas corretas por espécie, tamanho mínimo de captura, respeito ao defeso e descarte correto de capturas acidentais. Por que pescar bem hoje garante renda amanhã.'
    }
},

// ── L02: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Pescando com Responsabilidade',
    description: 'Teste o que você aprendeu sobre seletividade, tamanho mínimo de captura e boas práticas ambientais na pesca artesanal.',
    fcType: 'quiz',
    questions: [
        matching('Associe cada espécie com seu tamanho mínimo de captura recomendado no Amapá:', [
            { left: 'Mapará', right: '20 cm — peixe jovem abaixo disso deve ser devolvido' },
            { left: 'Dourada', right: '60 cm — espécie de alto valor comercial com proteção específica' },
            { left: 'Camarão regional', right: '7 cm — camarão jovem abaixo disso deve ser descartado' },
            { left: 'Pescada branca', right: '35 cm — verificar portaria MAPA vigente' }
        ]),
        mc1('Por que o pescador artesanal deve respeitar o tamanho mínimo de captura de cada espécie?',
            ['Para obedecer uma lei que não tem impacto real na prática do dia a dia',
             'Para garantir que os peixes jovens cresçam, se reproduzam e mantenham o estoque — protegendo a renda futura do próprio pescador',
             'Para diminuir o peso capturado e reduzir os impostos sobre a venda do pescado',
             'Porque peixe pequeno tem preço mais baixo e não compensa o custo do combustível'],
            1),
        vf('Usar malhadeira com malha muito pequena (abaixo do permitido) é considerado pesca predatória e pode resultar em multa e apreensão dos petrechos.', true),
        vf('Peixes capturados acidentalmente fora do tamanho mínimo devem ser conservados no gelo e vendidos — não podem ser devolvidos ao rio.', false),
        listen(
            'A pesca seletiva usa petrechos com tamanho de malha adequado para cada espécie, permitindo que os peixes jovens escapem e continuem crescendo. Isso aumenta a produtividade do rio no longo prazo e garante que o pescador tenha peixes para capturar nos próximos anos.',
            'O que é pesca seletiva, segundo o texto?',
            ['Pesca exclusiva de uma única espécie para maximizar a renda em curto prazo',
             'Uso de petrechos com malha adequada para deixar peixes jovens escaparem e garantir produtividade futura',
             'Técnica de captura com redes de arrasto que varrem o fundo do rio sem desperdício',
             'Sistema de cotas onde cada pescador tem direito a uma quantidade máxima por safra'],
            1),
        mc1('Qual é o principal problema do uso de malhadeiras com malha muito pequena (predatória)?',
            ['Gasta mais combustível e tempo para recolher a rede cheia',
             'Captura peixes de todos os tamanhos, incluindo jovens que ainda não se reproduziram, esgotando o estoque em poucos anos',
             'A rede fica mais pesada e difícil de transportar na embarcação',
             'O IBAMA multa apenas quem usa rede abaixo de 2 cm de malha — acima disso está liberado'],
            1),
        mc1('O que o pescador deve fazer ao capturar acidentalmente uma espécie proibida ou fora do tamanho mínimo?',
            ['Guardar no gelo e vender discretamente para não perder a captura',
             'Devolver ao rio imediatamente com cuidado — a pesca acidental é tolerada quando o peixe é devolvido vivo',
             'Levar à colônia de pescadores para que ela decida o destino do animal',
             'Registrar na caderneta de bordo e entregar ao IBAMA no porto'],
            1),
        mc1('Por que a pesca durante o período de defeso é proibida?',
            ['Porque o governo precisa controlar o volume de pescado no mercado para não baixar o preço',
             'Porque é o período de reprodução das espécies — pescar nessa época elimina os adultos antes que se reproduzam',
             'Porque as embarcações precisam de manutenção anual obrigatória nesse período',
             'Porque a qualidade do peixe cai durante o defeso e o consumidor não quer comprar'],
            1),
        vf('O pescador que respeita o defeso e o tamanho mínimo de captura contribui para que os estoques pesqueiros do Amapá continuem produtivos para as próximas gerações.', true),
        mc1('Qual é o tamanho de malha mínimo da malhadeira para pesca de mapará no Amapá, segundo a regulamentação vigente?',
            ['1,5 cm entre nós — para capturar o máximo de peixes possível',
             '5 cm entre nós — permite que maparás jovens escapem e crescam',
             '10 cm entre nós — exclusivo para pesca de grandes espécies',
             'Não há regulamentação de malha para mapará no Amapá'],
            1)
    ]
},

// ── L03: Vídeo ────────────────────────────────────────────────────────────────
{
    title: 'Do Barco à Mesa — Conservação do Pescado',
    video: {
        title: 'Do Barco à Mesa — Conservação do Pescado',
        url: 'https://www.youtube.com/watch?v=9VQ3T1jvHFM',
        description: 'Higiene a bordo, proporção correta de peixe e gelo, acondicionamento no isopor, cadeia do frio até o mercado e alternativas de conservação: peixe salgado e defumado.'
    }
},

// ── L04: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Conservação do Pescado',
    description: 'Avalie o que você aprendeu sobre como conservar o pescado desde a captura até a venda, mantendo qualidade e segurança alimentar.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é a proporção correta de gelo para peixe recomendada para conservação a bordo?',
            ['1 parte de gelo para 3 partes de peixe — o gelo é caro e deve ser economizado',
             '1 parte de gelo para 1 parte de peixe (1:1) — garante temperatura de 0°C a 4°C',
             '3 partes de gelo para 1 parte de peixe — quanto mais gelo melhor',
             'Não precisa de gelo se o peixe for vendido no mesmo dia da captura'],
            1),
        listenAndOrder(
            'Primeiro, o peixe é capturado e colocado no porão com gelo imediatamente. Depois, ao chegar ao porto, o pescado é lavado em água limpa. Em seguida, é eviscerado e filetado se necessário. Depois, é embalado em caixas com gelo para transporte. Por último, chega ao mercado ou peixaria ainda frio, com qualidade garantida.',
            'Ouça e ordene os passos corretos de conservação do pescado da captura até a venda:',
            ['Capturar e colocar no gelo imediatamente a bordo',
             'Lavar o pescado em água limpa ao chegar ao porto',
             'Eviscerado e filé se necessário',
             'Embalar em caixas com gelo para transporte',
             'Chegar ao mercado ainda frio']
        ),
        vf('O peixe capturado que não vai ser conservado no gelo deve ser evisceirado imediatamente para reduzir a velocidade de deterioração.', true),
        vf('O peixe salgado e o peixe defumado são formas de conservação que dispensam completamente o uso de gelo ou refrigeração.', false),
        dragAndDrop(
            'Complete as boas práticas de higiene a bordo durante a pesca:',
            'Manter o [1] do barco limpo e sem resíduos. Usar [2] para conservar o peixe. Evitar [3] entre peixes de espécies diferentes. Lavar as [4] com água limpa antes de manipular o pescado.',
            ['porão', 'gelo', 'mistura', 'mãos', 'combustível', 'redes', 'contaminação'],
            ['porão', 'gelo', 'mistura', 'mãos']
        ),
        mc1('A que temperatura o pescado deve ser mantido para retardar ao máximo a decomposição?',
            ['Entre 15°C e 20°C — temperatura ambiente do Amapá sem necessidade de gelo',
             'Entre 0°C e 4°C — temperatura do gelo em fusão que inibe bactérias deteriorantes',
             'Abaixo de −10°C — congelamento imediato é obrigatório desde a captura',
             'A temperatura não importa se o peixe for vendido em menos de 4 horas da captura'],
            1),
        mc1('Qual é a vantagem do peixe salgado e defumado em relação ao peixe fresco para o pescador artesanal do Amapá?',
            ['O peixe processado tem preço sempre mais baixo que o fresco — vende mais volume',
             'Permite conservar o pescado por semanas ou meses sem refrigeração — ideal para regiões distantes de mercados',
             'O processamento elimina todos os parasitas e torna o peixe seguro para consumo cru',
             'O governo compra apenas peixe processado pelo PAA — o fresco não é aceito no programa'],
            1),
        mc1('O que acontece com o pescado quando não é conservado corretamente no gelo?',
            ['Perde apenas a aparência visual mas mantém qualidade nutricional e sabor',
             'Bactérias se multiplicam rapidamente, causando deterioração, cheiro ruim e risco de intoxicação alimentar',
             'O peixe seca naturalmente e fica parecido com peixe salgado — ainda pode ser vendido',
             'A carne endurece por rigor mortis e fica impossível de filetar'],
            1),
        mc1('Como o pescador deve higienizar as caixas de isopor e o porão do barco entre uma saída e outra?',
            ['Basta enxaguar com água do rio — o cloro natural do rio é suficiente',
             'Lavar com água e detergente, enxaguar com água limpa e desinfetar com solução de hipoclorito de sódio',
             'Não é necessário lavar — o gelo novo já esteriliza o ambiente na próxima saída',
             'Usar apenas cloro concentrado sem diluir para garantir desinfecção total'],
            1),
        vf('O peixe com olhos opacos, brânquias escuras e odor forte já está impróprio para consumo e não deve ser comercializado.', true)
    ]
},

// ── L05: Leitura ──────────────────────────────────────────────────────────────
{
    title: 'Rastreabilidade e Inspeção Sanitária',
    reading: {
        title: 'Rastreabilidade e Inspeção Sanitária',
        body: `<h2>Rastreabilidade e Inspeção Sanitária</h2>

<p>O supermercado, o restaurante e o governo querem saber de onde vem o peixe que compram. Quem consegue responder a essa pergunta com documentos em mãos acessa mercados maiores e preços melhores.</p>

<h3>O que é Rastreabilidade</h3>

<p>Rastreabilidade é a capacidade de <strong>seguir o caminho do pescado</strong> desde a captura até o consumidor final. Isso significa saber:</p>
<ul>
<li>Quem pescou — nome do pescador e número do RGP</li>
<li>Onde foi capturado — rio, lago ou área marítima</li>
<li>Quando foi capturado — data e hora</li>
<li>Como foi conservado — gelo, câmara fria, processado</li>
<li>Para quem foi vendido — nota fiscal ou recibo</li>
</ul>

<p>Com rastreabilidade, se aparecer um problema de qualidade, o mercado sabe exatamente de onde veio e quem envolver. Sem ela, o pescador é excluído de mercados exigentes.</p>

<h3>Inspeção Sanitária do Pescado</h3>

<p>Existem três níveis de inspeção sanitária no Brasil:</p>

<ul>
<li><strong>SIM (Serviço de Inspeção Municipal):</strong> permite vender somente dentro do município. Emitido pela prefeitura. Mais acessível para o pescador individual.</li>
<li><strong>SIE (Serviço de Inspeção Estadual):</strong> permite vender em todo o Amapá. Emitido pela ADAP (Agência de Defesa Agropecuária do Amapá). Exige estrutura mínima de processamento.</li>
<li><strong>SIF (Serviço de Inspeção Federal) via DIPOA:</strong> permite vender em outros estados e exportar. Exige instalações mais robustas — geralmente acessível via cooperativa.</li>
</ul>

<h3>A Cooperativa como Caminho Prático</h3>

<p>O pescador artesanal dificilmente vai ter SIF individualmente — mas pode acessar esse mercado através de uma <strong>cooperativa com SIF</strong>. A cooperativa:</p>
<ul>
<li>Recebe o pescado com qualidade do associado</li>
<li>Processa e embala com padrão sanitário</li>
<li>Vende com nota fiscal e SIF para supermercados e outros estados</li>
<li>Repassa o valor ao pescador — com desconto apenas da taxa de gestão</li>
</ul>

<h3>Primeiros Passos Para o Pescador do Amapá</h3>

<ol>
<li><strong>Ter RGP e CAF</strong> — base de tudo</li>
<li><strong>Manter caderneta de bordo</strong> — registro das saídas, espécies e quantidades capturadas</li>
<li><strong>Emitir Nota Fiscal de Produtor Rural</strong> — via SEFAZ-AP com CPF e RGP</li>
<li><strong>Filiar-se a uma cooperativa com SIF</strong> — via colônia de pescadores ou RURAP</li>
<li><strong>Solicitar orientação do RURAP</strong> sobre como adequar a embarcação e a manipulação do pescado para atender às normas sanitárias básicas</li>
</ol>

<h3>Caderneta de Bordo</h3>

<p>A caderneta de bordo é o documento mais simples de rastreabilidade. Nela o pescador registra data de saída, área de pesca, espécies e quantidades capturadas. Esse registro:</p>
<ul>
<li>Serve como prova para o seguro-defeso</li>
<li>Embase o projeto técnico para o PRONAF</li>
<li>É o primeiro passo para a rastreabilidade exigida por supermercados</li>
</ul>

<p><em>Fonte: MAPA/DIPOA, ADAP-AP, RURAP-AP, Colônia de Pescadores Z-1 Macapá (2024)</em></p>`
    }
},

// ── L06: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Rastreabilidade e Inspeção',
    description: 'Teste seus conhecimentos sobre rastreabilidade do pescado, níveis de inspeção sanitária e como acessar mercados maiores.',
    fcType: 'quiz',
    questions: [
        mc1('O que é rastreabilidade do pescado?',
            ['Um código de barras impresso na embalagem que indica o preço e o peso do produto',
             'A capacidade de identificar quem pescou, onde, quando e como o pescado foi conservado e vendido',
             'Um sistema de GPS instalado nas embarcações para monitorar as rotas de pesca',
             'O certificado emitido pelo IBAMA atestando que a área de pesca não está degradada'],
            1),
        matching('Associe cada nível de inspeção sanitária com o mercado que ele permite acessar:', [
            { left: 'SIM (Municipal)', right: 'Venda somente dentro do próprio município' },
            { left: 'SIE (Estadual)', right: 'Venda em todo o território do Amapá' },
            { left: 'SIF (Federal) via DIPOA', right: 'Venda em outros estados e exportação' },
            { left: 'Sem inspeção', right: 'Venda informal — sem acesso a supermercados ou governo' }
        ]),
        vf('O pescador artesanal pode acessar o SIF (inspeção federal) entrando em uma cooperativa que já tenha o certificado.', true),
        vf('A caderneta de bordo é um documento desnecessário — o pescador só precisa do RGP para comprovar sua atividade.', false),
        mc1('O que é a DIPOA e qual seu papel na inspeção do pescado?',
            ['Departamento de Inspeção de Produtos de Origem Animal — vinculado ao MAPA, fiscaliza e emite o SIF para pescado',
             'Divisão de Incentivos à Pesca Artesanal — órgão do MDA que distribui recursos para cooperativas',
             'Diretoria de Inspeção e Proteção de Oceanos do Amapá — órgão estadual de controle pesqueiro',
             'Departamento de Infraestrutura e Obras do Porto do Amapá — administra o porto de Macapá'],
            0),
        mc1('Por que um supermercado ou restaurante exige pescado com inspeção sanitária?',
            ['Para poder cobrar preço maior ao consumidor, justificando o custo do certificado',
             'Para garantir que o produto passou por controles de qualidade e segurança alimentar — protegendo o consumidor e o estabelecimento',
             'Porque o governo obriga todos os estabelecimentos a comprar apenas de fornecedores certificados pelo IBAMA',
             'Para ter exclusividade na compra — só quem tem SIF pode vender para grandes redes'],
            1),
        selectMissingWords(
            'Complete sobre rastreabilidade e inspeção:',
            'O SIM permite vender dentro do [[b1]]. O SIE permite vender em todo o [[b2]]. O SIF via [[b3]] permite vender em outros estados. A [[b4]] de bordo é o primeiro registro de rastreabilidade.',
            [
                { id: 'b1', opts: ['município', 'estado', 'país', 'mercado local'], ci: 0 },
                { id: 'b2', opts: ['Amapá', 'Brasil', 'Nordeste', 'Amazônia'], ci: 0 },
                { id: 'b3', opts: ['DIPOA', 'IBAMA', 'RURAP', 'ADAP'], ci: 0 },
                { id: 'b4', opts: ['caderneta', 'nota fiscal', 'certidão', 'apólice'], ci: 0 }
            ]
        ),
        mc1('Qual é o primeiro passo prático para o pescador do Amapá começar a ter rastreabilidade?',
            ['Contratar um contador para emitir nota fiscal eletrônica de empresa',
             'Manter uma caderneta de bordo com data, área de pesca, espécies e quantidades capturadas',
             'Instalar GPS na embarcação e conectar ao sistema de monitoramento do IBAMA',
             'Tirar o SIF individualmente antes de vender qualquer quantidade de pescado'],
            1),
        mc1('Como a cooperativa ajuda o pescador artesanal a acessar o mercado do SIF?',
            ['O pescador não precisa de qualidade — a cooperativa corrige tudo no processamento',
             'A cooperativa processa o pescado com padrão sanitário, vende com SIF e repassa o valor ao pescador com desconto apenas da taxa de gestão',
             'O pescador entrega o pescado e a cooperativa emite o RGP em nome coletivo do grupo',
             'A cooperativa compra o peixe barato do pescador e vende com SIF — o pescador não participa do preço final'],
            1),
        vf('O SIM (inspeção municipal) é emitido pela prefeitura e permite ao pescador vender em qualquer cidade do Amapá.', false)
    ]
},

// ── L07: Escuta Ativa ─────────────────────────────────────────────────────────
{
    title: 'Minhas Práticas na Pesca',
    description: 'Conte como você trabalha hoje — as respostas ajudam o MDA a entender as práticas reais dos pescadores artesanais do Amapá.',
    fcType: 'listen',
    questions: [
        mc1('Você usa gelo no barco durante a pescaria para conservar o pescado?',
            ['Sempre — levo gelo em quantidade suficiente em toda saída',
             'Às vezes — uso gelo quando a saída é longa, mas não sempre',
             'Raramente — só quando vou para longe',
             'Não uso gelo — vendo o peixe no mesmo dia'],
            0),
        mc1('Com que frequência você limpa o porão do barco e as caixas de isopor?',
            ['Após cada saída — lavo com água, detergente e hipoclorito',
             'A cada semana — uma limpeza por semana é suficiente',
             'Raramente — enxaguo com água do rio quando necessário',
             'Nunca precisei limpar — o gelo mantém limpo'],
            0),
        mc1('Você respeita o período de defeso das espécies que pesca?',
            ['Sempre — paro de pescar essas espécies durante o defeso',
             'Às vezes — depende da necessidade de renda no mês',
             'Raramente — o defeso não é fiscalizado na minha área',
             'Não sabia que existia defeso para as espécies que pesco'],
            0),
        vf('Você já perdeu pescado por falta de gelo ou problemas de conservação a bordo.', false),
        shortAnswer('Qual é a principal dificuldade no seu processo de conservação e venda do pescado hoje?')
    ]
},

// ── L08: Diário ───────────────────────────────────────────────────────────────
{
    title: 'Minha Prática de Hoje',
    description: 'Registre uma boa prática do seu dia a dia na pesca e ganhe um cristal — cada foto mostra que você pesca com responsabilidade.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto de uma boa prática real do seu trabalho: pescado conservado no gelo, barco limpo e organizado, petrechos separados por tamanho de malha, ou peixe sendo eviscerado com higiene. Qualquer momento de bom manejo conta.',
            ['photo'],
            'Foto do pescado no gelo no porão, caixa de isopor organizada, barco limpo, petrechos limpos e organizados, ou evisceração higiênica do peixe.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo B',
    description: 'Revise as boas práticas do Módulo B e consolide o que você aprendeu sobre captura responsável, conservação e rastreabilidade.',
    fcType: 'review',
    questions: [
        mc1('Por que o pescador artesanal deve respeitar o tamanho mínimo de captura das espécies?',
            ['Para cumprir uma lei sem impacto real na produção dos rios',
             'Para garantir que os peixes jovens cresçam e se reproduzam, mantendo o estoque e a renda futura do pescador',
             'Para diminuir a quantidade capturada e reduzir os impostos sobre a venda',
             'Porque peixe pequeno tem menor valor no mercado e não compensa o esforço'],
            1),
        vf('O pescado deve ser mantido entre 0°C e 4°C desde a captura para retardar a deterioração bacteriana.', true),
        vf('O SIM (inspeção municipal) permite ao pescador vender pescado em qualquer estado do Brasil.', false),
        matching('Associe cada nível de inspeção sanitária com o mercado acessível:', [
            { left: 'SIM', right: 'Venda dentro do próprio município' },
            { left: 'SIE', right: 'Venda em todo o Amapá' },
            { left: 'SIF via DIPOA', right: 'Outros estados e exportação' },
            { left: 'Cooperativa com SIF', right: 'Caminho prático para o pescador artesanal acessar o mercado federal' }
        ]),
        mc1('Qual é a proporção correta de gelo para peixe na conservação a bordo?',
            ['1 parte de gelo para 3 partes de peixe — quantidade mínima',
             '1 parte de gelo para 1 parte de peixe (1:1) — garante temperatura entre 0°C e 4°C',
             '3 partes de gelo para 1 parte de peixe — máximo de conservação',
             'Não há proporção padrão — cada espécie tem uma necessidade diferente'],
            1),
        matching('Associe cada boa prática com o benefício que ela traz ao pescador:', [
            { left: 'Usar gelo na proporção correta', right: 'Peixe fresco chega ao mercado com qualidade — preço melhor' },
            { left: 'Manter caderneta de bordo', right: 'Rastreabilidade básica — abre acesso a supermercados' },
            { left: 'Respeitar tamanho mínimo de captura', right: 'Estoque renovado — pesca sustentável no longo prazo' },
            { left: 'Filiar-se à cooperativa com SIF', right: 'Acesso ao mercado estadual e federal com preço justo' }
        ]),
        selectMissingWords(
            'Complete sobre conservação e rastreabilidade:',
            'O pescado deve ficar entre [[b1]] e [[b2]] graus Celsius desde a captura. A proporção de gelo e peixe deve ser [[b3]]. A [[b4]] de bordo é o primeiro documento de rastreabilidade.',
            [
                { id: 'b1', opts: ['0', '5', '10', '15'], ci: 0 },
                { id: 'b2', opts: ['4', '8', '12', '20'], ci: 0 },
                { id: 'b3', opts: ['1:1', '1:3', '3:1', '2:1'], ci: 0 },
                { id: 'b4', opts: ['caderneta', 'certidão', 'apólice', 'nota fiscal'], ci: 0 }
            ]
        ),
        mc1('O que é a caderneta de bordo e para que serve?',
            ['Um diário pessoal do pescador sobre a vida no rio — sem valor oficial',
             'Registro de saídas, áreas de pesca, espécies e quantidades — base de rastreabilidade e prova para o seguro-defeso',
             'Documento emitido pelo IBAMA que autoriza a pesca em áreas específicas',
             'Contrato de arrendamento da área de pesca firmado com a prefeitura'],
            1),
        mc1('Como o pescador artesanal pode acessar o mercado do SIF sem ter a inspeção individualmente?',
            ['Fazendo parceria informal com um frigorífico que já tem SIF',
             'Através de uma cooperativa de pescadores que tenha SIF — a cooperativa processa e vende em nome do grupo',
             'Solicitando licença temporária de SIF ao MAPA para cada lote de venda',
             'Registrando a embarcação como pessoa jurídica e contratando um fiscal veterinário particular'],
            1),
        mc1('Quais são os sinais de que um peixe não está mais fresco e não deve ser comercializado?',
            ['Carne firme, escamas brilhantes e olhos transparentes — sinal de boa qualidade',
             'Olhos opacos, brânquias escuras ou marrons, carne mole e odor forte de amônia',
             'Coloração mais viva e superfície úmida — o peixe está absorvendo água do gelo',
             'Rigidez muscular intensa — o rigor mortis indica que o peixe foi capturado há pouco tempo'],
            1)
    ]
}

]; // fim LESSONS

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seedLesson(moduleId, lesson, idx) {
    console.log(`\n── Lição ${idx + 1}: ${lesson.title}`);
    const lessonId = await createFolder(lesson.title, 'lesson', moduleId);

    if (lesson.video) {
        const vid = lesson.video;
        const vidId = await createVideo(vid.title, vid.url, vid.description);
        await linkContent(lessonId, vidId, 'video', vid.title);
    } else if (lesson.reading) {
        const r = lesson.reading;
        const rId = await createReading(r.title, r.body);
        await linkContent(lessonId, rId, 'reading', r.title);
    } else {
        const fcType = lesson.fcType || 'quiz';
        const quizId = await createQuiz(lesson.title, lesson.description);
        console.log('  Questões: ');
        for (let i = 0; i < lesson.questions.length; i++) {
            await createQuestion(quizId, i + 1, lesson.questions[i]);
        }
        await linkContent(lessonId, quizId, fcType, lesson.title);
    }
}

async function main() {
    console.log('🐟 Seed — Rota da Pesca: Módulo B — Boas Práticas Produtivas');
    console.log('===============================================================\n');

    const moduleId = await createFolder('Módulo B — Boas Práticas Produtivas', 'module', SUBJECT_ID);
    console.log('');

    for (let i = 0; i < LESSONS.length; i++) {
        await seedLesson(moduleId, LESSONS[i], i);
    }

    console.log('\n\n✅ Módulo B — Rota da Pesca criado!');
    console.log(`   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

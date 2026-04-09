/**
 * seed-modulo-a-pesca.js
 * Cria o Módulo A — Programas do Governo na Rota da Pesca.
 * Programas: RGP, Colônia de Pescadores, Seguro-Defeso, PRONAF Pesca, PAA, ATER/RURAP
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-a-pesca.js
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
    title: 'Seus Direitos Como Pescador',
    video: {
        title: 'Seus Direitos Como Pescador',
        url: 'https://www.youtube.com/watch?v=8zKbdX5NZHY',
        description: 'O RGP é a carteira profissional do pescador artesanal. Veja como ele abre acesso ao seguro-defeso, ao PRONAF e a outros programas do governo.'
    }
},

// ── L02: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Seus Direitos Como Pescador',
    description: 'Teste o que você aprendeu sobre os programas do governo para o pescador artesanal.',
    fcType: 'quiz',
    questions: [
        mc1('O que é o RGP (Registro Geral da Pesca)?',
            ['Um imposto sobre a venda do pescado para a prefeitura',
             'A carteira profissional do pescador artesanal — comprova a atividade e dá acesso a benefícios',
             'Um cadastro para participar de leilões de áreas de pesca no Amapá',
             'O registro da embarcação no Ministério da Marinha'],
            1),
        mc1('Qual órgão federal gerencia o RGP?',
            ['Ministério do Trabalho e Emprego (MTE)',
             'IBAMA (Instituto Brasileiro do Meio Ambiente)',
             'MAPA (Ministério da Agricultura, Pecuária e Abastecimento)',
             'Capitania dos Portos (Marinha do Brasil)'],
            2),
        vf('O RGP é obrigatório para o pescador artesanal solicitar o seguro-desemprego durante o período de defeso.', true),
        vf('O pescador pode trabalhar legalmente sem o RGP, desde que seja filiado à colônia de pescadores.', false),
        listen(
            'A colônia de pescadores é a entidade profissional que representa o pescador artesanal. Estar filiado à colônia facilita o acesso ao RGP, ao seguro-defeso, ao PRONAF e à assistência técnica do RURAP.',
            'Para que serve a filiação à colônia de pescadores, segundo o texto?',
            ['Apenas para participar de competições de pesca esportiva no Amapá',
             'Facilita o acesso ao RGP, ao seguro-defeso, ao PRONAF e à assistência técnica',
             'Substitui o RGP para pescadores com mais de 10 anos de atividade',
             'É exigida apenas para pescadores que vendem para outros estados'],
            1),
        matching('Associe cada programa com seu principal benefício para o pescador artesanal:', [
            { left: 'RGP', right: 'Identidade profissional — porta de entrada para os benefícios' },
            { left: 'Seguro-Defeso', right: 'Renda durante o período proibido de pesca' },
            { left: 'PRONAF Pesca', right: 'Crédito para comprar barco, motor e petrechos' },
            { left: 'RURAP', right: 'Assistência técnica gratuita no Amapá' }
        ]),
        mc1('Qual instituição oferece assistência técnica gratuita para pescadores artesanais no Amapá?',
            ['IBAMA — Instituto Brasileiro do Meio Ambiente',
             'Embrapa Pesca — Empresa Brasileira de Pesquisa em Aquicultura',
             'RURAP — Instituto de Desenvolvimento Rural do Amapá',
             'SENAR — Serviço Nacional de Aprendizagem Rural'],
            2),
        mc1('Para requerer o seguro-defeso, o pescador precisa de quais documentos básicos?',
            ['Apenas o CPF e a carteira de identidade',
             'RGP válido, filiação à colônia de pescadores e comprovante de que não exerceu outra atividade remunerada',
             'CNPJ da embarcação e alvará municipal para pesca comercial',
             'Declaração da prefeitura e registro de vendas do último ano'],
            1),
        matching('Associe cada benefício com a entidade responsável por concedê-lo:', [
            { left: 'Seguro-Defeso', right: 'INSS — com requerimento via Meu INSS ou banco' },
            { left: 'PRONAF Pesca', right: 'BNB ou Banco do Brasil — com RGP e CAF' },
            { left: 'RGP', right: 'MAPA — via colônia ou diretamente no sistema do governo' },
            { left: 'Assistência técnica ATER', right: 'RURAP — escritório regional do Amapá' }
        ]),
        mc1('Um pescador artesanal que não tem o RGP e perde a produção durante o defeso pode receber o seguro-defeso?',
            ['Sim, basta apresentar a carteira de identidade e o comprovante de residência',
             'Sim, a colônia de pescadores emite uma declaração que substitui o RGP',
             'Não — o RGP é obrigatório para acessar o seguro-defeso',
             'Sim, se a perda for superior a 70% da produção normal'],
            2)
    ]
},

// ── L03: Vídeo ────────────────────────────────────────────────────────────────
{
    title: 'RGP e o Seguro do Defeso',
    video: {
        title: 'RGP e o Seguro do Defeso',
        url: 'https://www.youtube.com/watch?v=Gp0M3VIYvks',
        description: 'Como tirar o RGP, quais espécies têm defeso no Amapá, como solicitar o seguro-desemprego durante o defeso e a importância da colônia de pescadores.'
    }
},

// ── L04: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: RGP e Defeso',
    description: 'Avalie o que você aprendeu sobre como tirar o RGP e acessar o seguro-defeso.',
    fcType: 'quiz',
    questions: [
        mc1('Onde o pescador artesanal do Amapá deve solicitar o RGP?',
            ['Na Capitania dos Portos de Macapá, com taxa de R$ 150',
             'No MAPA, diretamente pelo aplicativo do governo ou via colônia de pescadores credenciada',
             'Na Receita Federal com contador — exige CNPJ da embarcação',
             'No IBAMA com laudo de impacto ambiental da área de pesca'],
            1),
        mc1('O que é o período de defeso na pesca artesanal?',
            ['O período em que o pescador tem direito a férias pagas pelo governo',
             'O período em que a pesca de determinadas espécies é proibida por lei para proteger a reprodução',
             'O período em que o IBAMA fiscaliza e autua os pescadores irregulares',
             'O período de maior abundância de peixes — melhor momento para pescar'],
            1),
        listenAndOrder(
            'Primeiro, tire o RGP e se filie à colônia de pescadores. Depois, em período de defeso, requeira o benefício pelo Meu INSS ou pelo banco. Em seguida, apresente o RGP, comprovante da colônia e declaração de não exercer outra atividade. Depois, aguarde a análise do INSS. Por último, receba o seguro em parcelas mensais durante o defeso.',
            'Ouça e ordene os passos para solicitar o seguro-defeso:',
            ['Tirar o RGP e se filiar à colônia de pescadores',
             'Requerer o benefício pelo Meu INSS ou pelo banco',
             'Apresentar o RGP, comprovante da colônia e declaração de não exercer outra atividade',
             'Aguardar a análise do INSS',
             'Receber o seguro em parcelas mensais']
        ),
        matching('Associe cada espécie com seu período de defeso típico no Amapá:', [
            { left: 'Mapará e outras curimatãs', right: 'Novembro a fevereiro — período reprodutivo' },
            { left: 'Camarão regional', right: 'Março a maio — proteção dos alevinos' },
            { left: 'Dourada e surubim', right: 'Outubro a janeiro — piracema dos grandes bagres' },
            { left: 'Pescada branca', right: 'Portaria MAPA — verificar publicação anual' }
        ]),
        vf('Durante o defeso, o pescador não pode exercer nenhuma atividade remunerada fora da pesca se quiser receber o seguro-defeso.', true),
        vf('O pescador que usa barco a motor não tem direito ao RGP — o documento é apenas para quem pesca com canoa a remo.', false),
        mc1('Qual é o valor aproximado do seguro-defeso que o pescador artesanal recebe?',
            ['R$ 300 por mês — metade do salário mínimo',
             'Um salário mínimo por mês durante o período de defeso',
             'R$ 2.000 por mês — dois salários mínimos',
             'Um salário mínimo por ano — pago de uma vez'],
            1),
        selectMissingWords(
            'Complete sobre o RGP e o seguro-defeso:',
            'O [[b1]] comprova que você é pescador profissional. Para receber o [[b2]], precisa ter RGP válido e ser filiado à [[b3]]. O valor é de um [[b4]] por mês durante o período proibido.',
            [
                { id: 'b1', opts: ['RGP', 'CPF', 'CNPJ', 'CIR'], ci: 0 },
                { id: 'b2', opts: ['seguro-defeso', 'PRONAF', 'PAA', 'BPC'], ci: 0 },
                { id: 'b3', opts: ['colônia de pescadores', 'cooperativa de crédito', 'prefeitura', 'RURAP'], ci: 0 },
                { id: 'b4', opts: ['salário mínimo', 'terço de salário', 'valor fixo de R$500', 'salário e meio'], ci: 0 }
            ]
        ),
        mc1('O que o pescador deve fazer se o INSS negar o seguro-defeso indevidamente?',
            ['Aceitar a decisão — o INSS tem sempre razão nessas questões',
             'Recursar formalmente pelo Meu INSS ou buscar orientação na colônia de pescadores ou no CRAS',
             'Entrar com ação judicial imediatamente sem tentar recurso administrativo',
             'Devolver o RGP e registrar nova solicitação do zero'],
            1),
        mc1('Por que é importante renovar o RGP periodicamente?',
            ['Porque o governo cobra uma taxa anual para manter o registro ativo',
             'Para que o registro reflita dados atualizados e o pescador mantenha acesso ao seguro-defeso e ao PRONAF',
             'Para competir em licitações de áreas de pesca exclusiva no Amapá',
             'A renovação não é necessária — o RGP tem validade vitalícia após emissão'],
            1)
    ]
},

// ── L05: Leitura ──────────────────────────────────────────────────────────────
{
    title: 'PRONAF Pesca, PAA e ATER no Amapá',
    reading: {
        title: 'PRONAF Pesca, PAA e ATER no Amapá',
        body: `<h2>PRONAF Pesca, PAA e ATER no Amapá</h2>

<p>Você pesca para viver — mas o governo tem programas para ajudar você a pescar melhor, vender mais caro e ter renda garantida durante o defeso. Três programas fundamentais esperam por você.</p>

<h3>PRONAF Pesca — Crédito para Equipar seu Barco</h3>

<p>O PRONAF tem linhas específicas para o pescador artesanal financiar barco, motor, petrechos e equipamentos de conservação — com juros muito menores que os do mercado.</p>

<ul>
<li><strong>O que financia:</strong> embarcação, motor de popa, malhadeiras, tarrafas, espinhéis, caixa de isopor, gelo-seco, bomba d'água, GPS</li>
<li><strong>Limite:</strong> até R$ 150.000 no PRONAF Investimento para pescador artesanal</li>
<li><strong>Juros:</strong> de 4% a 6% ao ano — contra 15-25% no mercado</li>
<li><strong>Prazo:</strong> 5 a 10 anos com carência de até 2 anos</li>
<li><strong>Onde contratar:</strong> Banco do Nordeste (BNB) ou Banco do Brasil, com RGP + CAF + projeto técnico</li>
</ul>

<h3>PAA — Programa de Aquisição de Alimentos</h3>

<p>O governo compra pescado diretamente de pescadores artesanais com CAF e RGP, sem leilão e a preços justos, e distribui para bancos de alimentos, hospitais e creches no Amapá.</p>

<ul>
<li><strong>Limite por família:</strong> até R$ 9.000/ano (modalidade doação simultânea)</li>
<li><strong>Produtos aceitos:</strong> peixe fresco, camarão, peixe salgado e defumado</li>
<li><strong>Documentos:</strong> RGP + CAF + Nota Fiscal de Produtor (ou DAP/RGP para pescador)</li>
<li><strong>Como participar:</strong> CONAB regional do Amapá (Macapá) ou prefeitura parceira</li>
</ul>

<h3>ATER no Amapá — RURAP</h3>

<p>O <strong>RURAP (Instituto de Desenvolvimento Rural do Amapá)</strong> é a Emater do Amapá — oferece assistência técnica gratuita para pescadores artesanais em todo o estado.</p>

<ul>
<li><strong>O que o RURAP faz pelo pescador:</strong>
    <ul>
        <li>Orienta sobre boas práticas de conservação do pescado a bordo</li>
        <li>Ajuda a montar o projeto técnico para o PRONAF</li>
        <li>Apoia na organização de associações e cooperativas para acessar o PAA com volume maior</li>
        <li>Oferece cursos de gestão financeira e acesso a mercados</li>
    </ul>
</li>
<li><strong>Como solicitar:</strong> escritório do RURAP em Macapá ou município mais próximo — o atendimento é gratuito</li>
</ul>

<h3>Colônia de Pescadores — Sua Força Coletiva</h3>

<p>A colônia não é apenas burocracia. Ela é o <strong>elo entre o pescador e o governo</strong>. Com a colônia você:</p>

<ul>
<li>Tira o RGP com mais facilidade</li>
<li>Acessa o seguro-defeso coletivamente</li>
<li>Negocia o preço mínimo do pescado com os intermediários</li>
<li>Acessa o PAA como grupo (maior volume → mais dinheiro)</li>
<li>É representado nas negociações com o MAPA e o IBAMA sobre períodos de defeso</li>
</ul>

<h3>Nota Fiscal do Pescador</h3>

<p>Para vender pescado de forma formal — para o governo ou para restaurantes — você precisa de <strong>Nota Fiscal de Produtor Rural</strong>. No Amapá, é emitida pela SEFAZ-AP com o CPF + RGP + inscrição estadual (gratuita).</p>

<p><em>Fonte: MAPA, MDA, CONAB, RURAP-AP, SEFAZ-AP (2024)</em></p>`
    }
},

// ── L06: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: PRONAF Pesca, PAA e ATER',
    description: 'Teste seus conhecimentos sobre como acessar crédito, vender para o governo e usar a assistência técnica gratuita.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é o limite de financiamento do PRONAF Investimento para pescador artesanal?',
            ['R$ 15.000 — para comprar apenas petrechos básicos',
             'R$ 50.000 — para barco pequeno e motor',
             'R$ 150.000 — para embarcação, motor, petrechos e equipamentos de conservação',
             'Não há limite — o banco define conforme a capacidade de pagamento'],
            2),
        mc1('Quais documentos o pescador precisa para contratar o PRONAF no banco?',
            ['Apenas o CPF e um fiador com imóvel em nome próprio',
             'RGP válido, CAF e projeto técnico elaborado com apoio do RURAP ou colônia',
             'CNPJ da embarcação e alvará municipal de pesca comercial',
             'Declaração da prefeitura e histórico de venda dos últimos 3 anos em nota fiscal'],
            1),
        vf('O PAA compra pescado de pescadores artesanais sem licitação — o governo paga diretamente a um preço justo estabelecido pela CONAB.', true),
        vf('Para acessar o PAA, o pescador precisa ter CNPJ e emitir nota fiscal eletrônica de empresa.', false),
        dragAndDrop(
            'Ordene os passos para acessar o PRONAF Pesca:',
            '[1] → [2] → [3] → [4] → [5]',
            ['Assinar o contrato e receber o crédito', 'Tirar RGP e CAF', 'Elaborar projeto técnico com o RURAP', 'Ir ao BNB ou Banco do Brasil', 'Aguardar aprovação do banco'],
            ['Tirar RGP e CAF', 'Elaborar projeto técnico com o RURAP', 'Ir ao BNB ou Banco do Brasil', 'Aguardar aprovação do banco', 'Assinar o contrato e receber o crédito']
        ),
        matching('Associe cada necessidade com o programa mais adequado:', [
            { left: 'Comprar motor novo para o barco', right: 'PRONAF Investimento — crédito de longo prazo com juros baixos' },
            { left: 'Ter renda durante o período de defeso', right: 'Seguro-Defeso — via INSS com RGP e colônia' },
            { left: 'Vender peixe ao governo com preço justo', right: 'PAA — Programa de Aquisição de Alimentos via CONAB' },
            { left: 'Aprender a conservar melhor o pescado', right: 'ATER gratuita via RURAP no Amapá' }
        ]),
        mc1('Qual é a taxa de juros típica do PRONAF Investimento para pescador artesanal?',
            ['0% — o governo paga os juros totalmente via subvenção',
             '4% a 6% ao ano — muito abaixo do mercado financeiro comum',
             '15% ao ano — a mesma do crédito consignado para servidores',
             '25% ao ano — o mesmo do cartão de crédito'],
            1),
        mc1('O que o RURAP pode ajudar o pescador a fazer gratuitamente no Amapá?',
            ['Comprar embarcações com desconto do governo estadual',
             'Elaborar o projeto técnico para o PRONAF, orientar boas práticas e apoiar a formação de cooperativas',
             'Vender o pescado em nome do pescador nos mercados de Macapá',
             'Emitir o RGP e o seguro-defeso sem precisar ir ao INSS'],
            1),
        selectMissingWords(
            'Complete sobre o PAA para pescadores:',
            'O [[b1]] compra pescado de pescadores familiares a [[b2]] estabelecido pela CONAB. O limite por família é R$ [[b3]] por ano. É necessário ter [[b4]] e CAF para participar.',
            [
                { id: 'b1', opts: ['PAA', 'PNAE', 'PRONAF', 'BNB'], ci: 0 },
                { id: 'b2', opts: ['preço justo', 'preço mínimo de leilão', 'preço do atacado', 'preço de exportação'], ci: 0 },
                { id: 'b3', opts: ['9.000', '1.500', '50.000', '150.000'], ci: 0 },
                { id: 'b4', opts: ['RGP', 'CNPJ', 'SIF', 'CIR'], ci: 0 }
            ]
        ),
        mc1('Por que é vantajoso para o pescador acessar o PAA em grupo (via colônia ou associação) em vez de individualmente?',
            ['Porque o governo paga preço mais alto quando são grupos de mais de 10 pescadores',
             'Porque o limite por grupo é de R$ 6 milhões/ano — muito maior que o individual de R$ 9.000',
             'Porque o grupo soma volume, cumpre contratos maiores e tem mais poder de negociação',
             'Porque o INSS exige pelo menos 10 participantes para liberar o pagamento pelo PAA'],
            2)
    ]
},

// ── L07: Escuta Ativa ─────────────────────────────────────────────────────────
{
    title: 'Minha Situação com os Programas',
    description: 'Conte sua situação real — as respostas ajudam o MDA a melhorar o acesso dos pescadores aos programas do governo.',
    fcType: 'listen',
    questions: [
        mc1('Você tem RGP (Registro Geral da Pesca)?',
            ['Sim, tenho o RGP válido', 'Não tenho, mas quero tirar', 'Não sei o que é o RGP', 'Tentei tirar mas tive dificuldade'], 0),
        mc1('Você é filiado a alguma colônia de pescadores? Qual?',
            ['Sim, sou filiado — conheço minha colônia', 'Não sou filiado, mas quero me filiar', 'Não sei o que é colônia de pescadores', 'Já fui filiado mas não renovei'],
            0),
        mc1('Você já recebeu o seguro-desemprego durante o defeso?',
            ['Sim, já recebi o seguro-defeso', 'Nunca recebi — não sabia que tinha direito', 'Tentei mas o INSS negou', 'Não conheço esse benefício'],
            0),
        mc1('Você já acessou alguma linha do PRONAF para pescar?',
            ['Sim, já financiei equipamento pelo PRONAF', 'Não, mas quero saber como', 'Não sei o que é PRONAF', 'Tentei mas o banco não aprovou'],
            0),
        mc1('Qual programa você mais quer aprender a acessar primeiro?',
            ['RGP — preciso tirar o meu', 'Seguro-defeso — quero garantir minha renda no defeso',
             'PRONAF Pesca — quero crédito para melhorar meu barco', 'PAA — quero vender pescado para o governo'], 0)
    ]
},

// ── L08: Diário + Missão ──────────────────────────────────────────────────────
{
    title: 'Meu RGP',
    description: 'Registre sua situação com o RGP e ganhe um cristal — o RGP é o primeiro passo para garantir seus direitos.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto do seu RGP (Registro Geral da Pesca) ou dos documentos que você vai usar para tirar o seu. Se ainda não tem o RGP, registre o compromisso: escreva onde vai buscá-lo esta semana.',
            ['photo'],
            'Foto do RGP físico ou digital, ou dos documentos (RG, CPF, comprovante de atividade de pesca). Ou foto do escritório da colônia de pescadores ou RURAP que você vai visitar.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo A',
    description: 'Revise todos os programas do Módulo A e consolide o que você aprendeu sobre seus direitos como pescador artesanal.',
    fcType: 'review',
    questions: [
        mc1('O RGP (Registro Geral da Pesca) é a porta de entrada para quais benefícios?',
            ['Apenas para o seguro-defeso — os outros benefícios têm cadastro próprio separado',
             'Seguro-defeso, PRONAF Pesca, PAA e assistência técnica do RURAP',
             'Somente para programas estaduais do Amapá, não para programas federais',
             'Para o INSS rural — o RGP substitui a contribuição previdenciária do pescador'],
            1),
        vf('O RURAP oferece assistência técnica gratuita para pescadores artesanais no Amapá.', true),
        vf('Para vender pescado pelo PAA, o pescador precisa ter CNPJ e emitir nota fiscal eletrônica de empresa.', false),
        matching('Associe cada programa com seu principal objetivo para o pescador:', [
            { left: 'PRONAF Investimento', right: 'Financiar barco, motor e petrechos com juros baixos' },
            { left: 'Seguro-Defeso', right: 'Garantir renda mínima durante o período proibido de pesca' },
            { left: 'PAA', right: 'Vender pescado ao governo sem licitação, com preço justo' },
            { left: 'RURAP', right: 'Assistência técnica gratuita e apoio ao acesso a mercados' }
        ]),
        mc1('Qual é o valor do seguro-defeso que o pescador artesanal tem direito?',
            ['R$ 300 por mês — metade do salário mínimo',
             'Um salário mínimo por mês durante o período de defeso',
             'Dois salários mínimos por mês',
             'Um salário mínimo por ano, pago de uma vez'],
            1),
        matching('Associe cada documento com quando ele é necessário para o pescador:', [
            { left: 'RGP', right: 'Para qualquer programa federal de pesca artesanal' },
            { left: 'Filiação à colônia', right: 'Para solicitar o seguro-defeso e acessar o PAA coletivamente' },
            { left: 'Projeto técnico do RURAP', right: 'Para contratar o PRONAF Pesca no banco' },
            { left: 'CAF', right: 'Para confirmar condição de agricultor/pescador familiar nos programas MDA' }
        ]),
        selectMissingWords(
            'Complete sobre o acesso ao PRONAF Pesca:',
            'O pescador precisa de [[b1]] válido e [[b2]] para ir ao [[b3]] ou BNB. O banco exige um [[b4]] para aprovar o crédito.',
            [
                { id: 'b1', opts: ['RGP', 'CPF', 'SIF', 'CIR'], ci: 0 },
                { id: 'b2', opts: ['CAF', 'CNPJ', 'alvará', 'escritura'], ci: 0 },
                { id: 'b3', opts: ['Banco do Brasil', 'Banco Central', 'Caixa Econômica', 'Santander'], ci: 0 },
                { id: 'b4', opts: ['projeto técnico', 'laudo do IBAMA', 'certidão de pesca', 'apólice de seguro'], ci: 0 }
            ]
        ),
        mc1('O que é o período de defeso e por que o pescador não pode pescar nesse período?',
            ['É o período de maior oferta de peixe — mas o IBAMA controla o acesso para não afetar o preço',
             'É o período de reprodução das espécies — proibir a pesca garante que os peixes jovens cresçam e a pesca continue no futuro',
             'É o período de inspeção das embarcações — o pescador precisa esperar a vistoria',
             'É o período de exportação — o governo reserva o estoque para o mercado internacional'],
            1),
        mc1('Qual é o limite que um pescador pode receber vendendo pescado pelo PAA por ano?',
            ['R$ 3.000/ano', 'R$ 9.000/ano', 'R$ 30.000/ano', 'Não há limite'],
            1),
        mc1('Onde o pescador artesanal do Amapá deve ir para pedir assistência técnica gratuita?',
            ['IBAMA — Instituto Brasileiro do Meio Ambiente em Macapá',
             'SENAR — Serviço Nacional de Aprendizagem Rural',
             'RURAP — Instituto de Desenvolvimento Rural do Amapá',
             'Embrapa Pesca — Empresa Brasileira de Pesquisa em Aquicultura'],
            2)
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
    console.log('🐟 Seed — Rota da Pesca: Módulo A — Programas do Governo');
    console.log('==========================================================\n');

    const moduleId = await createFolder('Módulo A — Programas do Governo', 'module', SUBJECT_ID);
    console.log('');

    for (let i = 0; i < LESSONS.length; i++) {
        await seedLesson(moduleId, LESSONS[i], i);
    }

    console.log('\n\n✅ Módulo A — Rota da Pesca criado!');
    console.log(`   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

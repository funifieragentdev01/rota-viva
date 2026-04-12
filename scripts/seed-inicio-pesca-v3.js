/**
 * seed-inicio-pesca-v3.js
 * Recria o Módulo Início da Rota da Pesca no module existente.
 * Cria 11 lições + 2 checkpoints cartoon (pos 5 e 10).
 *
 * Uso: node scripts/seed-inicio-pesca-v3.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==';
const MODULE_ID = '69d7a4e228fe032bb25242e3'; // Módulo Início — Rota da Pesca (existente)
const QUIZ1_ID  = '69dba307d95d627e2bdbb60a'; // Quiz checkpoint 1 (pesca básico)
const QUIZ2_ID  = '69dba332d95d627e2bdbb7f5'; // Quiz checkpoint 2 (negócio do pescado)

// ─── API helpers ──────────────────────────────────────────────────────────────

async function api(method, path, body) {
    const res = await fetch(BASE_URL + path, {
        method,
        headers: { 'Authorization': TOKEN, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.substring(0,300)}`);
    try { return JSON.parse(text); } catch { return {}; }
}

function getId(result) {
    if (result && result._id) return result._id;
    if (Array.isArray(result) && result[0] && result[0]._id) return result[0]._id;
    throw new Error('Sem _id: ' + JSON.stringify(result).substring(0,200));
}

async function createFolder(title, type, parentId, position) {
    const body = { title, type, parent: parentId };
    if (position !== undefined) body.position = position;
    const id = getId(await api('PUT', '/v3/database/folder', body));
    console.log(`  📁 ${type} "${title}" [pos=${position}]: ${id}`);
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
    const body = { quiz: quizId, position, ...q };
    getId(await api('PUT', '/v3/database/question', body));
    process.stdout.write('.');
}

async function linkContent(lessonId, contentId, type, title) {
    await api('PUT', '/v3/database/folder_content', { parent: lessonId, content: contentId, type, title });
    console.log(`\n  🔗 ${type} → lesson OK`);
}

async function createCartoon(title, position, quizId) {
    const lessonId = await createFolder(title, 'lesson', MODULE_ID, position);
    await api('PUT', '/v3/database/folder_content', {
        parent: lessonId, content: quizId, type: 'cartoon', active: true
    });
    console.log(`  🎭 cartoon folder_content linked`);
    return lessonId;
}

// ─── Question builders ────────────────────────────────────────────────────────

const G1 = { grade: 1, extra: {} };
const G0 = { grade: 0, extra: {} };

function mc1(question, options, correctIndex) {
    return {
        type: 'MULTIPLE_CHOICE', select: 'one_answer', title: question, question,
        choices: options.map((text, i) => ({ label: String.fromCharCode(65+i), answer: text, ...(i===correctIndex?G1:G0) }))
    };
}

function vf(question, correct) {
    return { type: 'TRUE_FALSE', title: question, question, correctAnswer: correct, choices: [] };
}

function listen(speechText, question, options, correctIndex) {
    return {
        type: 'LISTEN', title: question, question, speechText,
        extra: { speechText, ttsLang: 'pt-BR' },
        choices: options.map((text, i) => ({ label: String.fromCharCode(65+i), answer: text, ...(i===correctIndex?G1:G0) }))
    };
}

function listenAndOrder(speechText, question, orderedItems) {
    return {
        type: 'LISTEN_AND_ORDER', title: question, question, speechText,
        extra: { speechText, ttsLang: 'pt-BR' },
        choices: orderedItems.map((text, i) => ({ label: String.fromCharCode(65+i), answer: text, ...G1 }))
    };
}

function matching(question, pairs) {
    const left = pairs.map((p, i) => ({ id: `l${i+1}`, text: p.left }));
    const right = pairs.map((p, i) => ({ id: `r${i+1}`, text: p.right }));
    const solutions = {};
    pairs.forEach((_, i) => { solutions[`l${i+1}`] = `r${i+1}`; });
    return { type: 'MATCHING', title: question, question, choices: [], model: { matching: { left, right, solutions } } };
}

function selectMissingWords(question, text, blanks) {
    return {
        type: 'SELECT_MISSING_WORDS', title: question, question, choices: [],
        model: { missingWords: { text, blanks: blanks.map(b => ({
            id: b.id,
            correctOptionId: `opt_${b.id}_${b.ci}`,
            options: b.opts.map((t, i) => ({ id: `opt_${b.id}_${i}`, text: t }))
        })) } }
    };
}

function dragAndDrop(question, sentence, wordPool, correctOrder) {
    const targets = correctOrder.map((word, i) => ({
        id: `t${i+1}`, text: `[${i+1}]`, correctOptionId: `w${wordPool.indexOf(word)+1}`
    }));
    const optionsPool = wordPool.map((text, i) => ({ id: `w${i+1}`, text }));
    return { type: 'DRAG_AND_DROP_INTO_TEXT', title: question, question, choices: [], model: { dragDropText: { sentence, targets, optionsPool } } };
}

function essay(question, rubric) {
    return { type: 'ESSAY', title: question, question, rubric: rubric||'', totalLines: 5, choices: [] };
}

function shortAnswer(question) {
    return { type: 'SHORT_ANSWER', title: question, question, choices: [] };
}

function diy(question, evidenceTypes, rubric) {
    return { type: 'DIY_PROJECT', title: question, question, evidenceTypes, rubric: rubric||'', choices: [] };
}

// ─── Lesson definitions ───────────────────────────────────────────────────────

const LESSONS = [

// ── L01 (pos 1): Vídeo ───────────────────────────────────────────────────────
{
    title: 'Os Rios do Amapá Dependem de Você',
    video: {
        title: 'Os Rios do Amapá Dependem de Você',
        url: 'https://www.youtube.com/watch?v=ZoscMQ2ojYY',
        description: 'Projeto Nossa Pesca: conhecer a origem para valorizar a pesca artesanal. Impacto da pesca artesanal na alimentação, renda e biodiversidade amazônica do Amapá.'
    }
},

// ── L02 (pos 2): Quiz ────────────────────────────────────────────────────────
{
    title: 'Avaliação: Os Rios do Amapá Dependem de Você',
    description: 'Teste o que você aprendeu sobre a importância da pesca artesanal para o Amapá e para as famílias ribeirinhas.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é a importância da pesca artesanal para as comunidades ribeirinhas do Amapá?',
            ['É apenas uma atividade de lazer sem impacto econômico', 'É a principal fonte de proteína e renda de milhares de famílias ribeirinhas', 'Compete negativamente com a pesca industrial', 'É uma atividade em extinção sem relevância atual'], 1),
        mc1('Com qual oceano o Amapá faz fronteira, facilitando a pesca em diferentes ambientes?',
            ['Oceano Índico', 'Oceano Atlântico', 'Oceano Pacífico', 'Mar do Caribe'], 1),
        vf('A pesca artesanal no Amapá é praticada tanto em rios de água doce quanto em estuários e costa marítima.', true),
        vf('A pesca artesanal é considerada predatória e contribui para a extinção dos peixes nos rios do Amapá.', false),
        mc1('Qual espécie tem grande importância econômica na pesca artesanal do Amapá?',
            ['Tilápia cultivada em viveiros', 'Mapará (Hypophthalmus marginatus)', 'Salmão importado', 'Sardinha do litoral'], 1),
        mc1('Por que o RGP (Registro Geral da Pesca) é importante para o pescador artesanal?',
            ['Para pescar em qualquer estado sem restrição', 'Para ter acesso a benefícios como seguro-defeso, PRONAF e programas do governo', 'Para receber equipamentos gratuitos do governo', 'Para não pagar impostos sobre a venda do pescado'], 1),
        dragAndDrop(
            'Complete a frase arrastando as palavras corretas:',
            'A pesca artesanal do Amapá contribui com [1], garante [2] para as famílias ribeirinhas e preserva o [3] tradicional da região.',
            ['segurança alimentar', 'renda', 'saber', 'degradação', 'desperdício', 'perigo'],
            ['segurança alimentar', 'renda', 'saber']
        ),
        listen(
            'A pesca artesanal no Amapá abastece feiras, mercados e restaurantes. O pescador artesanal usa embarcações pequenas e petrechos tradicionais, como malhadeiras, tarrafas e anzóis, para pescar de forma seletiva e sustentável.',
            'Como o pescador artesanal do Amapá pesca, segundo o texto?',
            ['Com barcos grandes e redes industriais de arrasto', 'Com embarcações pequenas e petrechos tradicionais de forma seletiva', 'Com explosivos e substâncias químicas', 'Com mergulho profundo em alto mar'], 1),
        mc1('O que significa "defeso" para os pescadores artesanais?',
            ['Um equipamento de pesca profissional subvencionado', 'O período em que a pesca de certas espécies é proibida para proteger a reprodução', 'Um tipo de embarcação usado em rios profundos', 'Uma cooperativa de pescadores do Amapá'], 1),
        mc1('Por que a pesca artesanal sustentável é importante para a renda futura do pescador?',
            ['Porque reduz a concorrência com outros pescadores', 'Porque respeitar os peixes jovens e o defeso garante a renovação do estoque e a pesca futura', 'Porque diminui os custos com combustível e petrechos', 'Porque permite pescar durante qualquer período do ano'], 1)
    ]
},

// ── L03 (pos 3): Vídeo ───────────────────────────────────────────────────────
{
    title: 'Como Funciona a Pesca Artesanal',
    video: {
        title: 'Como Funciona a Pesca Artesanal',
        url: 'https://www.youtube.com/watch?v=rY0OjC43x1M',
        description: 'PROTOCOLO PESCADOR PROFISSIONAL — petrechos de pesca, principais espécies do Amapá e período de defeso.'
    }
},

// ── L04 (pos 4): Quiz ────────────────────────────────────────────────────────
{
    title: 'Avaliação: Como Funciona a Pesca Artesanal',
    description: 'Avalie seus conhecimentos sobre petrechos, espécies e o dia a dia do pescador artesanal.',
    fcType: 'quiz',
    questions: [
        mc1('O que é uma "malhadeira" na pesca artesanal?',
            ['Um tipo de embarcação a remo usada em rios', 'Uma rede de emalhar com malhas de tamanho regulamentado', 'Um instrumento de medição do tamanho dos peixes', 'Uma armadilha fixada no fundo do rio'], 1),
        mc1('Qual petrecho é ideal para capturar peixes em cardumes na superfície e camarão?',
            ['Espinhel de fundo', 'Tarrafa', 'Malhadeira de fundo', 'Zagaia (arpão)'], 1),
        matching('Associe cada petrecho com o tipo de pesca para o qual é mais adequado:', [
            { left: 'Malhadeira', right: 'Peixes de médio e grande porte em rios e lagos' },
            { left: 'Tarrafa', right: 'Peixes em cardumes na superfície e camarão' },
            { left: 'Espinhel', right: 'Peixes de fundo como dourada e surubim' },
            { left: 'Covo/armadilha', right: 'Camarão de rio em áreas rasas' }
        ]),
        matching('Associe cada espécie com sua característica no Amapá:', [
            { left: 'Mapará', right: 'Peixe abundante, base da alimentação ribeirinha' },
            { left: 'Dourada', right: 'Alto valor comercial, exportado para outras regiões' },
            { left: 'Filhote (Piraíba)', right: 'Maior bagre da Amazônia, muito valorizado' },
            { left: 'Camarão da Amazônia', right: 'Produto de alto valor para feiras e exportação' }
        ]),
        vf('O espinhel é uma linha longa com vários anzóis usada para capturar peixes de fundo como dourada.', true),
        vf('Durante o defeso, o pescador pode continuar pescando livremente desde que não venda o produto.', false),
        listenAndOrder(
            'Primeiro o pescador sai antes do amanhecer. Depois lança os petrechos. Em seguida aguarda e verifica. Depois recolhe o pescado. Por último retorna ao porto para vender.',
            'Ouça e ordene as etapas de um dia de pesca artesanal:',
            ['Sair antes do amanhecer', 'Lançar os petrechos de pesca', 'Aguardar e verificar os petrechos', 'Recolher o pescado capturado', 'Retornar ao porto para venda']
        ),
        listenAndOrder(
            'Primeiro o pescado é capturado. Depois é lavado e eviscerado. Em seguida colocado no gelo. Depois transportado ao mercado. Por último vendido ao consumidor.',
            'Ouça e ordene o caminho do peixe da captura até o consumidor:',
            ['Captura no rio', 'Lavagem e evisceração', 'Acondicionamento no gelo', 'Transporte ao mercado', 'Venda ao consumidor']
        ),
        mc1('Por que o tamanho das malhas da malhadeira é regulamentado por lei?',
            ['Para que o pescador gaste menos rede e tenha mais lucro', 'Para garantir que peixes jovens escapem e a população se renove', 'Para facilitar o transporte da rede na embarcação', 'Para padronizar o tamanho médio dos peixes capturados'], 1),
        mc1('O que acontece com o pescador que pesca espécies em período de defeso?',
            ['Recebe multa, pode ter equipamentos apreendidos e perde o direito ao seguro-defeso', 'Recebe apenas uma advertência verbal na primeira vez', 'Precisa pagar uma taxa especial para continuar pescando', 'Não há consequências práticas para a pesca artesanal'], 0)
    ]
},

// ── [CARTOON 1 em pos 5 — criado separado] ───────────────────────────────────

// ── L05 (pos 6): Vídeo ───────────────────────────────────────────────────────
{
    title: 'Um Dia na Vida de Um Pescador Artesanal',
    video: {
        title: 'Um Dia na Vida de Um Pescador Artesanal',
        url: 'https://www.youtube.com/watch?v=vK5zh-MEbq0',
        description: 'Dia do trabalhador: rotina de um pescador artesanal — sair antes do amanhecer, pesca, retorno, venda. A liberdade e o saber tradicional no cotidiano do pescador.'
    }
},

// ── L06 (pos 7): Quiz ────────────────────────────────────────────────────────
{
    title: 'Avaliação: Um Dia na Vida de Um Pescador Artesanal',
    description: 'Verifique o que você aprendeu sobre a rotina e as boas práticas do pescador artesanal.',
    fcType: 'quiz',
    questions: [
        mc1('Por que os pescadores artesanais geralmente saem para pescar antes do amanhecer?',
            ['Para evitar o calor do sol durante o dia', 'Porque peixes são mais ativos nas horas frescas e o peixe conserva melhor no frio', 'Porque a legislação exige que a pesca ocorra à noite', 'Para não competir com embarcações maiores durante o dia'], 1),
        mc1('Qual é o principal desafio para manter a qualidade do pescado durante o dia?',
            ['Encontrar peixes em quantidade suficiente', 'Conservar o peixe no gelo para evitar a deterioração com o calor', 'Conseguir combustível para a embarcação', 'Obter autorização para pescar em diferentes trechos do rio'], 1),
        vf('O pescador artesanal pode melhorar sua renda vendendo pescado diretamente ao consumidor na feira.', true),
        vf('A pesca artesanal exige grandes embarcações motorizadas para ser eficiente nos rios do Amapá.', false),
        mc1('O que é uma "colônia de pescadores" e qual sua importância?',
            ['É uma associação que representa os pescadores e facilita acesso a benefícios e documentação', 'É um local físico onde os pescadores moram durante a temporada de pesca', 'É uma cooperativa que compra e distribui o pescado do estado', 'É um programa do governo para treinar novos pescadores'], 0),
        selectMissingWords(
            'Complete a rotina do pescador artesanal:',
            'O pescador sai de [[b1]] antes do sol nascer, lança os [[b2]] nas áreas de pesca, [[b3]] os petrechos, e retorna ao [[b4]] com o pescado conservado no [[b5]].',
            [
                { id: 'b1', opts: ['casa', 'feira', 'cooperativa', 'hospital'], ci: 0 },
                { id: 'b2', opts: ['petrechos', 'redes de arrasto', 'bombas', 'venenos'], ci: 0 },
                { id: 'b3', opts: ['recolhe', 'abandona', 'queima', 'vende'], ci: 0 },
                { id: 'b4', opts: ['porto', 'aeroporto', 'supermercado', 'açougue'], ci: 0 },
                { id: 'b5', opts: ['gelo', 'água quente', 'sal grosso', 'vinagre'], ci: 0 }
            ]
        ),
        selectMissingWords(
            'Complete sobre o seguro-defeso:',
            'Durante o [[b1]], quando a pesca de certas espécies é proibida, o pescador com [[b2]] pode receber o [[b3]], equivalente a um [[b4]] mínimo por mês.',
            [
                { id: 'b1', opts: ['defeso', 'verão', 'carnaval', 'inverno'], ci: 0 },
                { id: 'b2', opts: ['RGP', 'CPF', 'RG', 'título de eleitor'], ci: 0 },
                { id: 'b3', opts: ['seguro-desemprego', 'aposentadoria', 'auxílio moradia', 'bolsa pesca'], ci: 0 },
                { id: 'b4', opts: ['salário', 'dia de trabalho', 'semana', 'bônus'], ci: 0 }
            ]
        ),
        mc1('Qual é a vantagem de vender direto na feira em vez de para o intermediário?',
            ['O intermediário paga mais rápido facilitando o fluxo de caixa', 'Na feira o pescador recebe preço maior por ter contato direto com o consumidor final', 'O intermediário tem estrutura de conservação melhor e paga mais', 'Na feira o pescador trabalha mais por menos dinheiro'], 1),
        mc1('Por que o saber tradicional do pescador é tão valioso?',
            ['Permite pescar sem equipamentos modernos e economizar', 'Inclui conhecimento sobre comportamento dos peixes, épocas, correntes e locais — acumulado por gerações', 'Substitui completamente a necessidade de documentação', 'Garante que nenhum peixe escape das redes'], 1),
        essay(
            'Descreva como imagina um dia de trabalho como pescador artesanal no Amapá. O que faria de madrugada? Como escolheria onde pescar? O que faria com o pescado ao retornar?',
            'Reflexão livre — sem resposta errada.'
        )
    ]
},

// ── L07 (pos 8): Leitura ─────────────────────────────────────────────────────
{
    title: 'O Negócio do Pescado',
    reading: {
        title: 'O Negócio do Pescado',
        body: `<h2>O Negócio do Pescado</h2>

<p>A pesca artesanal no Amapá é muito mais do que subsistência. É um negócio completo que pode garantir renda digna e estável para milhares de famílias.</p>

<h3>O que você pode produzir e vender</h3>

<p><strong>Peixe fresco:</strong> O produto principal. O Amapá tem uma das pescarias artesanais mais ricas da Amazônia, com espécies valorizadas como dourada, filhote (piraíba), mapará e pescada amarela.</p>

<p><strong>Peixe seco e salgado:</strong> Conservação tradicional que permite vender em mercados mais distantes. O charque de peixe tem boa aceitação em cidades do Amapá e Pará.</p>

<p><strong>Peixe defumado:</strong> Produto de valor agregado. Defumação artesanal pode dobrar o preço em relação ao peixe fresco e tem demanda crescente em mercados gourmet.</p>

<p><strong>Camarão:</strong> Alta demanda e preço elevado. O camarão da Amazônia (seco, fresco ou congelado) é muito valorizado nas feiras e restaurantes. Pode alcançar R$ 30–50/kg limpo.</p>

<h3>Quanto ganha um pescador no Amapá</h3>

<p>Um pescador artesanal com embarcação adequada pode capturar <strong>200–500 kg por semana</strong> em temporada. Com preços médios:</p>

<ul>
<li>Peixe fresco para intermediário: R$ 5–8/kg</li>
<li>Venda direta na feira: R$ 12–20/kg</li>
<li>Camarão limpo ao consumidor: R$ 30–50/kg</li>
</ul>

<p>Isso representa <strong>R$ 2.000–4.000/mês</strong> em boa temporada vendendo na feira. Com o seguro-defeso, a renda é garantida o ano todo.</p>

<h3>Como aumentar a renda</h3>

<ul>
<li><strong>Vender na feira</strong> — eliminar o intermediário pode dobrar o preço</li>
<li><strong>Beneficiar o pescado</strong> — defumar, salgar ou congelar agrega valor</li>
<li><strong>Cooperativa</strong> — acessa supermercados, merenda escolar (PNAE) e programas do governo</li>
<li><strong>PRONAF Pesca</strong> — crédito subsidiado para comprar barco, motor ou petrechos</li>
</ul>

<p><em>Fonte: IBGE Pesca 2021, RURAP-AP, SEA-AP, cooperativas pesqueiras do Amapá (2023)</em></p>`
    }
},

// ── L08 (pos 9): Quiz ────────────────────────────────────────────────────────
{
    title: 'Avaliação: O Negócio do Pescado',
    description: 'Teste seus conhecimentos sobre como comercializar o pescado e melhorar a renda da família.',
    fcType: 'quiz',
    questions: [
        mc1('Além do peixe fresco, quais outros produtos o pescador pode produzir para agregar valor?',
            ['Apenas gelo e embalagens para transporte', 'Peixe defumado, salgado, camarão processado', 'Somente derivados de frutos do mar importados', 'Óleos e cosméticos derivados de peixes'], 1),
        mc1('Qual espécie do Amapá tem alto valor comercial e é frequentemente exportada?',
            ['Tilápia de viveiro', 'Dourada (Brachyplatystoma rousseauxii)', 'Sardinha enlatada', 'Peixe-boi amazônico'], 1),
        matching('Associe cada forma de beneficiamento com sua característica:', [
            { left: 'Peixe fresco', right: 'Menor preço, precisa ser vendido rápido' },
            { left: 'Peixe salgado/seco', right: 'Maior prazo de validade, acessa mercados distantes' },
            { left: 'Peixe defumado', right: 'Alto valor agregado, demanda em mercados gourmet' },
            { left: 'Camarão limpo', right: 'Maior preço por kg, alta demanda em feiras' }
        ]),
        matching('Associe cada canal de venda com sua característica:', [
            { left: 'Intermediário', right: 'Menor preço, porém venda imediata e sem esforço' },
            { left: 'Feira local', right: 'Preço mais alto, contato direto com consumidor' },
            { left: 'Cooperativa', right: 'Acessa supermercados, PNAE e programas do governo' },
            { left: 'Defumação artesanal', right: 'Dobra o preço e amplia o prazo de venda' }
        ]),
        mc1('O que é o PRONAF Pesca e como ajuda o pescador artesanal?',
            ['É um seguro contra acidentes durante a pesca', 'É uma linha de crédito subsidiado para financiar barco, motor, petrechos e estrutura de beneficiamento', 'É um programa de capacitação técnica gratuita', 'É um benefício pago durante o defeso'], 1),
        vf('Vender o pescado diretamente ao consumidor na feira pode render até o dobro comparado à venda para o intermediário.', true),
        vf('O defumado artesanal de peixe tem baixa demanda no mercado e não compensa o trabalho adicional.', false),
        shortAnswer('Quanto você acha que ganha por mês um pescador artesanal no Amapá que vende na feira diretamente ao consumidor?'),
        dragAndDrop(
            'Organize os produtos do pescador do menor para o maior preço médio por kg:',
            '[1] → [2] → [3] → [4]',
            ['Peixe para intermediário', 'Peixe fresco na feira', 'Peixe defumado artesanal', 'Camarão limpo direto ao consumidor'],
            ['Peixe para intermediário', 'Peixe fresco na feira', 'Peixe defumado artesanal', 'Camarão limpo direto ao consumidor']
        ),
        mc1('O que significa entrar em uma cooperativa de pescadores?',
            ['Perder a autonomia de vender quando e para quem quiser', 'Somar volume com outros pescadores para acessar mercados maiores com melhor preço', 'Pagar taxas altas sem benefícios concretos', 'Deixar de receber o seguro-defeso'], 1)
    ]
},

// ── [CARTOON 2 em pos 10 — criado separado] ──────────────────────────────────

// ── L09 (pos 11): Escuta Ativa ───────────────────────────────────────────────
{
    title: 'Escuta Ativa: Minha Trajetória na Pesca',
    description: 'Conte sua história — responda com sua própria experiência na pesca artesanal.',
    fcType: 'listen',
    questions: [
        essay('Como você aprendeu a pescar? Conte sua história — foi com a família, um vizinho, ou você mesmo se virou?',
            'Coleta de dados MDA: origem do conhecimento da pesca artesanal'),
        shortAnswer('Quantos quilos de peixe você pesca por semana em média? (Se ainda não pesca profissionalmente, escreva 0)'),
        mc1('Você vende o peixe que pesca para quem?',
            ['Direto ao consumidor em feira ou porta a porta', 'Para um intermediário que compra no porto', 'Para supermercado ou restaurante diretamente', 'Ainda não vendo — só consumo próprio e da família'], 0),
        mc1('Você está registrado na colônia de pescadores?',
            ['Sim, sou filiado', 'Não, mas quero me filiar', 'Não sabia que existia colônia de pescadores', 'Não tenho interesse em me filiar'], 0),
        shortAnswer('Qual é seu maior desafio hoje na pesca? (Ex: falta de gelo, distância do mercado, preço baixo...)')
    ]
},

// ── L10 (pos 12): Diário ─────────────────────────────────────────────────────
{
    title: 'Diário: Meu Pesqueiro no Mapa',
    description: 'Registre seu local de pesca e contribua com o mapeamento da pesca artesanal no Amapá.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto da sua embarcação, dos petrechos ou do pescado do dia, e compartilhe sua localização! O MDA vai mapear a pesca artesanal no Amapá — e você ganha um cristal.',
            ['photo', 'location'],
            'Foto da embarcação, dos petrechos, do porto ou do pescado. Se ainda não pesca profissionalmente, tire uma foto do rio que você conhece.'
        )
    ]
},

// ── L11 (pos 13): Revisão Geral ──────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo Início',
    description: 'Revise todos os temas do Módulo Início e consolide o que você aprendeu sobre pesca artesanal.',
    fcType: 'review',
    questions: [
        mc1('Qual é a importância da pesca artesanal para as famílias ribeirinhas do Amapá?',
            ['É apenas lazer sem impacto econômico significativo', 'É a principal fonte de proteína e renda de milhares de famílias', 'Compete negativamente com a pesca industrial sustentável', 'É uma atividade em extinção sem relevância econômica'], 1),
        mc1('O que é o período de defeso e qual seu objetivo?',
            ['Período de pesca liberada para recuperar a renda dos pescadores', 'Período de proibição da pesca de certas espécies para proteger a reprodução', 'Período de treinamento obrigatório para novos pescadores', 'Período de inspeção sanitária das embarcações'], 1),
        matching('Associe cada petrecho com seu uso principal:', [
            { left: 'Malhadeira', right: 'Captura peixes de médio e grande porte em rios' },
            { left: 'Tarrafa', right: 'Captura peixes em cardumes e camarão na superfície' },
            { left: 'Espinhel', right: 'Captura peixes de fundo como dourada e surubim' }
        ]),
        vf('O pescador artesanal com RGP tem direito ao seguro-desemprego durante o defeso.', true),
        vf('Vender peixe para o intermediário é sempre a melhor opção porque ele paga imediatamente.', false),
        matching('Associe cada produto com seu tipo de beneficiamento:', [
            { left: 'Peixe fresco', right: 'Sem beneficiamento, vendido imediatamente' },
            { left: 'Peixe defumado', right: 'Beneficiamento artesanal que dobra o preço' },
            { left: 'Camarão seco', right: 'Produto de alto valor, alta demanda em mercados' },
            { left: 'Peixe salgado', right: 'Conservação que permite venda em mercados distantes' }
        ]),
        selectMissingWords(
            'Complete sobre a documentação do pescador:',
            'O [[b1]] é o registro profissional do pescador. Com ele, durante o [[b2]], recebe o [[b3]]. Para crédito do [[b4]] também precisa do RGP.',
            [
                { id: 'b1', opts: ['RGP', 'CPF', 'CAF', 'CNPJ'], ci: 0 },
                { id: 'b2', opts: ['defeso', 'verão', 'natal', 'carnaval'], ci: 0 },
                { id: 'b3', opts: ['seguro-desemprego', 'aposentadoria', 'bolsa família', 'auxílio gás'], ci: 0 },
                { id: 'b4', opts: ['PRONAF', 'FGTS', 'INSS', 'IPTU'], ci: 0 }
            ]
        ),
        selectMissingWords(
            'Complete sobre a cooperativa de pescadores:',
            'Na cooperativa, os pescadores somam [[b1]] para acessar [[b2]] maiores. A cooperativa pode ter [[b3]] e inspeção sanitária, permitindo vender para [[b4]] e governo.',
            [
                { id: 'b1', opts: ['volume', 'dívidas', 'problemas', 'conflitos'], ci: 0 },
                { id: 'b2', opts: ['mercados', 'rios', 'barcos', 'redes'], ci: 0 },
                { id: 'b3', opts: ['câmara fria', 'aquário', 'piscina', 'secador'], ci: 0 },
                { id: 'b4', opts: ['supermercados', 'outros rios', 'países vizinhos', 'o próprio rio'], ci: 0 }
            ]
        ),
        mc1('Qual é o principal benefício de vender pescado diretamente ao consumidor na feira?',
            ['Menos trabalho e mais tempo livre', 'Preço mais alto — pode chegar ao dobro do valor pago pelo intermediário', 'Dispensa a necessidade de conservar o peixe no gelo', 'O consumidor aceita peixe de menor qualidade sem reclamar'], 1),
        mc1('Por que é importante respeitar o tamanho mínimo de captura das espécies?',
            ['Para economizar rede e reduzir custos operacionais', 'Para garantir que os peixes jovens cresçam e se reproduzam, mantendo a pesca viável no futuro', 'Porque o peixe pequeno tem preço mais baixo', 'Para atender exigência de mercado sobre tamanho do produto'], 1),
        mc1('O que é o RURAP e qual sua importância para o pescador artesanal do Amapá?',
            ['É o sindicato que cobra taxas dos pescadores registrados', 'É o serviço de assistência técnica do governo do Amapá que orienta o pescador gratuitamente', 'É um banco especial para financiar embarcações', 'É a cooperativa central de pescadores do Amapá'], 1)
    ]
}

]; // fim LESSONS

// ─── Position mapping: 11 lessons + 2 cartoons = 13 total ────────────────────
function lessonPosition(idx) {
    if (idx < 4) return idx + 1;
    if (idx < 8) return idx + 2;
    return idx + 3;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seedLesson(lesson, idx) {
    const pos = lessonPosition(idx);
    console.log(`\n── Lição ${idx+1} [pos=${pos}]: ${lesson.title}`);
    const lessonId = await createFolder(lesson.title, 'lesson', MODULE_ID, pos);

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
        process.stdout.write('  Questões: ');
        for (let i = 0; i < lesson.questions.length; i++) {
            await createQuestion(quizId, i+1, lesson.questions[i]);
        }
        await linkContent(lessonId, quizId, fcType, lesson.title);
    }
}

async function main() {
    console.log('🐟 Seed v3 — Rota da Pesca: Módulo Início');
    console.log('  Module ID:', MODULE_ID);
    console.log('==========================================\n');

    // L01–L04 (positions 1–4)
    for (let i = 0; i < 4; i++) {
        await seedLesson(LESSONS[i], i);
    }

    // Cartoon Checkpoint 1 (position 5)
    console.log('\n── 🎭 Cartoon Checkpoint 1 [pos=5]');
    await createCartoon('Checkpoint 1 — Início', 5, QUIZ1_ID);

    // L05–L08 (positions 6–9)
    for (let i = 4; i < 8; i++) {
        await seedLesson(LESSONS[i], i);
    }

    // Cartoon Checkpoint 2 (position 10)
    console.log('\n── 🎭 Cartoon Checkpoint 2 [pos=10]');
    await createCartoon('Checkpoint 2 — Início', 10, QUIZ2_ID);

    // L09–L11 (positions 11–13)
    for (let i = 8; i < 11; i++) {
        await seedLesson(LESSONS[i], i);
    }

    console.log('\n\n✅ Módulo Início — Rota da Pesca recriado com 13 itens!');
    console.log('   (11 lições + 2 cartoon checkpoints nas posições 5 e 10)');
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

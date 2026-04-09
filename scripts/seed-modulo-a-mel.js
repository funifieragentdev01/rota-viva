/**
 * seed-modulo-a-mel.js
 * Cria o Módulo A — Programas do Governo na Rota do Mel.
 * Programas: CAF, PRONAF, Garantia-Safra, PAA, PNAE, ATER/Emater-PI, Nota Fiscal
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-a-mel.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';
const SUBJECT_ID = '69c9336fdf494d3199c2a6ba'; // Rota do Mel

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
    title: 'Você Tem Direitos — Conheça os Programas',
    video: {
        title: 'Você Tem Direitos — Conheça os Programas',
        url: 'https://www.youtube.com/watch?v=NxKNwHkSCkI',
        description: 'MDA explica os principais programas do governo para a agricultura familiar: CAF, PRONAF, PAA, PNAE e ATER.'
    }
},

// ── L02: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Você Tem Direitos',
    description: 'Teste o que você aprendeu sobre os programas do governo para o agricultor familiar apicultor.',
    fcType: 'quiz',
    questions: [
        mc1('O que é o CAF (Cadastro do Agricultor Familiar)?',
            ['Uma linha de crédito do governo para comprar equipamentos apícolas',
             'O documento que comprova que você é agricultor familiar e abre acesso a crédito, assistência técnica e venda para o governo',
             'Um seguro contra perda de colmeias por causas climáticas',
             'O registro para exportar mel para outros países'],
            1),
        mc1('Qual é o limite de renda bruta anual para se enquadrar como agricultor familiar no CAF?',
            ['R$ 50.000/ano', 'R$ 500.000/ano', 'R$ 2.000.000/ano', 'Não há limite — basta trabalhar na terra'],
            1),
        vf('O CAF é obrigatório para acessar o PRONAF, o PAA e o PNAE.', true),
        vf('Para emitir o CAF, o apicultor precisa ter escritura registrada em cartório comprovando a propriedade da terra.', false),
        listen(
            'O Garantia-Safra é um programa que garante uma renda mínima ao agricultor familiar do Nordeste quando ocorre perda de produção por seca ou excesso de chuva.',
            'O que é o Garantia-Safra, segundo o texto?',
            ['Um seguro que cobre equipamentos agrícolas danificados por eventos climáticos',
             'Um programa que garante renda mínima ao agricultor nordestino em caso de perda de produção por clima',
             'Uma linha de crédito para reconstruir benfeitorias destruídas pela seca',
             'Um cadastro para receber assistência técnica gratuita da Embrapa'],
            1),
        matching('Associe cada programa com seu principal benefício:', [
            { left: 'CAF', right: 'Documento de acesso a todos os demais programas' },
            { left: 'PRONAF', right: 'Crédito rural com juros baixos para custeio e investimento' },
            { left: 'Garantia-Safra', right: 'Renda mínima em caso de perda de produção por clima' },
            { left: 'ATER', right: 'Assistência técnica e extensão rural gratuita' }
        ]),
        mc1('Qual organização oferece assistência técnica gratuita para apicultores no Piauí?',
            ['IBAMA (Instituto Brasileiro do Meio Ambiente)',
             'Embrapa Solos (Empresa Brasileira de Pesquisa Agropecuária)',
             'Emater-PI (Empresa de Assistência Técnica e Extensão Rural do Piauí)',
             'INCRA (Instituto Nacional de Colonização e Reforma Agrária)'],
            2),
        mc1('O PNAE obriga que pelo menos qual porcentagem da merenda escolar venha da agricultura familiar?',
            ['10%', '20%', '30%', '50%'],
            2),
        matching('Associe cada programa com quem o gerencia:', [
            { left: 'PRONAF', right: 'MDA em parceria com Banco do Brasil e BNB' },
            { left: 'PNAE', right: 'FNDE (Fundo Nacional de Desenvolvimento da Educação)' },
            { left: 'PAA', right: 'MDS e CONAB (Companhia Nacional de Abastecimento)' },
            { left: 'CAF', right: 'MDA com emissão via Emater, sindicato rural ou INCRA' }
        ]),
        mc1('Um apicultor que quer vender mel para a merenda escolar precisa primeiro obter qual documento?',
            ['Alvará municipal de funcionamento', 'CAF (Cadastro do Agricultor Familiar)',
             'CNPJ da propriedade rural', 'Laudo da Embrapa sobre a qualidade do mel'],
            1)
    ]
},

// ── L03: Vídeo ────────────────────────────────────────────────────────────────
{
    title: 'CAF e PRONAF: Como Acessar Crédito Rural',
    video: {
        title: 'CAF e PRONAF: Como Acessar Crédito Rural',
        url: 'https://www.youtube.com/watch?v=V2Zq7GzOvnI',
        description: 'Passo a passo para tirar o CAF e acessar as linhas de crédito do PRONAF para apicultura: documentos, bancos, prazos e valores.'
    }
},

// ── L04: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: CAF e PRONAF',
    description: 'Avalie o que você aprendeu sobre como tirar o CAF e acessar o crédito rural do PRONAF.',
    fcType: 'quiz',
    questions: [
        mc1('Onde o apicultor deve ir para emitir o CAF?',
            ['No Banco Central do Brasil ou em qualquer banco federal',
             'Na Receita Federal com o contador da fazenda',
             'Na Emater-PI, sindicato rural, INCRA ou entidade credenciada pelo MDA',
             'No cartório de registro de imóveis da cidade'],
            2),
        mc1('Qual linha do PRONAF é ideal para comprar colmeias, caixas novas e centrífuga?',
            ['PRONAF Custeio — para despesas da safra corrente',
             'PRONAF Investimento — para compra de equipamentos e infraestrutura',
             'PRONAF Agroindústria — exclusivo para processamento industrial',
             'PRONAF Mulher — apenas para produtoras rurais'],
            1),
        listenAndOrder(
            'Primeiro, reúna RG, CPF e comprovante de atividade rural. Depois, procure a Emater-PI ou o sindicato rural. Em seguida, preencha o formulário do CAF. Depois, aguarde a validação dos dados. Por último, receba o CAF digital pelo celular ou e-mail.',
            'Ouça e ordene os passos para tirar o CAF:',
            ['Reunir RG, CPF e comprovante de atividade rural',
             'Procurar a Emater-PI ou o sindicato rural',
             'Preencher o formulário do CAF',
             'Aguardar a validação dos dados',
             'Receber o CAF digital']
        ),
        matching('Associe cada documento com sua função no processo de acesso ao PRONAF:', [
            { left: 'CAF', right: 'Comprova condição de agricultor familiar — exigido pelo banco' },
            { left: 'Projeto técnico (ATER)', right: 'Descreve o investimento e justifica o valor do empréstimo' },
            { left: 'Declaração de IR ou DECORE', right: 'Comprova renda e capacidade de pagamento' },
            { left: 'Nota Fiscal de Produtor Rural', right: 'Formaliza a venda da produção para quitar a dívida' }
        ]),
        vf('O PRONAF tem taxas de juros menores que as do mercado comum — chegando a 4% ao ano nas linhas para pequenos produtores.', true),
        vf('O apicultor precisa quitar todo o PRONAF anterior para contratar uma nova linha de crédito.', false),
        mc1('Qual banco tem maior presença no Nordeste e costuma ser o principal parceiro do PRONAF para apicultores do Piauí?',
            ['Banco Santander', 'Banco do Nordeste do Brasil (BNB)', 'Caixa Econômica Federal', 'Banco BTG Pactual'],
            1),
        selectMissingWords(
            'Complete sobre o PRONAF para apicultura:',
            'O PRONAF [[b1]] financia a compra de colmeias e equipamentos. O [[b2]] financia insumos para a safra. A taxa de juros é [[b3]] que a do mercado. Para contratar, é obrigatório ter o [[b4]].',
            [
                { id: 'b1', opts: ['Investimento', 'Custeio', 'Agroindústria', 'Microcrédito'], ci: 0 },
                { id: 'b2', opts: ['PRONAF Custeio', 'PRONAF Mulher', 'PRONAF Jovem', 'PRONAF Eco'], ci: 0 },
                { id: 'b3', opts: ['menor', 'maior', 'igual', 'variável'], ci: 0 },
                { id: 'b4', opts: ['CAF', 'CNPJ', 'SIF', 'RG rural'], ci: 0 }
            ]
        ),
        mc1('O que acontece se o apicultor não conseguir pagar o PRONAF por causa de uma seca?',
            ['A dívida vai para cartório e ele perde as colmeias como garantia',
             'Pode solicitar renegociação ou acionar o Garantia-Safra, que cobre perdas por eventos climáticos',
             'O banco encerra o crédito e ele fica negativado na Receita Federal',
             'A Emater-PI paga a dívida automaticamente em nome do produtor'],
            1),
        mc1('Qual é o prazo de pagamento típico do PRONAF Investimento para apicultura?',
            ['6 meses a 1 ano', '2 a 4 anos', '5 a 10 anos', '20 anos como no crédito imobiliário'],
            2)
    ]
},

// ── L05: Leitura ──────────────────────────────────────────────────────────────
{
    title: 'Mel na Merenda: PAA, PNAE e ATER',
    reading: {
        title: 'Mel na Merenda: PAA, PNAE e ATER',
        body: `<h2>Mel na Merenda: PAA, PNAE e ATER</h2>

<p>O governo compra comida da sua mesa. Literalmente. Três programas estão prontos para colocar dinheiro no bolso do apicultor familiar piauiense — mas poucos sabem como acessá-los.</p>

<h3>PAA — Programa de Aquisição de Alimentos</h3>

<p>O PAA compra alimentos diretamente do agricultor familiar a <strong>preços justos</strong> — sem leilão, sem intermediário — e distribui para bancos de alimentos, cozinhas comunitárias, restaurantes populares e creches.</p>

<ul>
<li><strong>Quem pode participar:</strong> qualquer agricultor com CAF</li>
<li><strong>Limite por família:</strong> até R$ 9.000/ano (modalidade doação simultânea)</li>
<li><strong>Como funciona:</strong> você entrega o mel para a CONAB ou prefeitura parceira e recebe por transferência bancária</li>
<li><strong>Onde se inscrever:</strong> CONAB regional ou prefeitura (secretaria de agricultura)</li>
</ul>

<h3>PNAE — Programa Nacional de Alimentação Escolar</h3>

<p>A lei federal obriga que <strong>pelo menos 30% do dinheiro da merenda escolar</strong> venha de agricultores familiares. Isso significa que toda escola pública do Piauí precisa comprar da sua família.</p>

<ul>
<li><strong>Quem compra:</strong> a prefeitura (para escolas municipais) e o estado (para escolas estaduais)</li>
<li><strong>Como funciona:</strong> a prefeitura lança uma "chamada pública" e o apicultor apresenta proposta com preço e quantidade</li>
<li><strong>Vantagem do mel:</strong> produto de alto valor nutricional, aceito nas chamadas públicas do Piauí</li>
<li><strong>Documentos necessários:</strong> CAF + Nota Fiscal de Produtor Rural + SIM ou SIE para o mel</li>
</ul>

<h3>ATER — Assistência Técnica e Extensão Rural</h3>

<p>A Emater-PI oferece <strong>assistência técnica gratuita</strong> para apicultores do Piauí. O técnico vai até o apiário, orienta o manejo, ajuda a montar o projeto para o PRONAF e prepara a documentação para o PNAE.</p>

<ul>
<li><strong>Serviços disponíveis:</strong> manejo de colmeias, controle de doenças, processamento de mel, certificação, acesso a crédito</li>
<li><strong>Como solicitar:</strong> escritório da Emater-PI mais próximo ou pelo telefone 0800 do governo do Piauí</li>
<li><strong>Programas especiais:</strong> Emater apoia grupos de apicultores na formação de associações para acessar coletivamente o PNAE e o PAA com maior volume</li>
</ul>

<h3>Garantia-Safra</h3>

<p>Se a seca ou excesso de chuva destruir sua produção, o Garantia-Safra garante uma renda mínima. O apicultor que perdeu 50% ou mais da produção recebe parcelas mensais durante o período de escassez.</p>

<ul>
<li><strong>Quem pode participar:</strong> agricultores do Nordeste (inclui Piauí) com CAF e renda familiar de até 1,5 salário mínimo/mês</li>
<li><strong>Como aderir:</strong> no início de cada safra, procure a prefeitura ou Emater-PI para se cadastrar no programa</li>
</ul>

<h3>Nota Fiscal de Produtor Rural</h3>

<p>Para vender mel para o governo (PAA, PNAE) ou para supermercados, você precisa de <strong>Nota Fiscal de Produtor Rural</strong>. Ela é gratuita e emitida pela Secretaria de Fazenda do Piauí.</p>

<ul>
<li><strong>Como tirar:</strong> Sefaz-PI com CPF + CAF + inscrição estadual (gratuita)</li>
<li><strong>Para que serve:</strong> formalizar a venda, garantir que o comprador pague, e acumular histórico de produção para crédito futuro</li>
</ul>

<p><em>Fonte: MDA, FNDE, CONAB, Emater-PI, SEFAZ-PI (2024)</em></p>`
    }
},

// ── L06: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: PAA, PNAE e ATER',
    description: 'Teste seus conhecimentos sobre como vender mel para o governo e acessar a assistência técnica gratuita.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é o limite anual que um apicultor pode vender pelo PAA (modalidade doação simultânea)?',
            ['R$ 3.000/ano', 'R$ 9.000/ano', 'R$ 30.000/ano', 'Não há limite — quanto mais produzir, mais pode vender'],
            1),
        mc1('O PNAE exige que as prefeituras comprem da agricultura familiar por qual mecanismo?',
            ['Licitação com menor preço — o apicultor compite com qualquer fornecedor',
             'Chamada pública — um processo simplificado exclusivo para agricultores familiares com CAF',
             'Contrato direto com o FNDE sem envolvimento da prefeitura',
             'Cadastro no aplicativo do governo federal — automático após ter o CAF'],
            1),
        vf('O mel pode ser vendido pelo PNAE para as escolas públicas do Piauí.', true),
        vf('Para acessar o PAA, o apicultor precisa contratar um contador para emitir nota fiscal CNPJ.', false),
        dragAndDrop(
            'Ordene os passos para vender mel pelo PNAE:',
            '[1] → [2] → [3] → [4] → [5]',
            ['Entregar o mel na escola', 'Tirar o CAF', 'Apresentar proposta na chamada pública', 'Assinar contrato com a prefeitura', 'Aguardar a chamada pública da prefeitura'],
            ['Tirar o CAF', 'Aguardar a chamada pública da prefeitura', 'Apresentar proposta na chamada pública', 'Assinar contrato com a prefeitura', 'Entregar o mel na escola']
        ),
        matching('Associe cada programa com o destino do alimento comprado:', [
            { left: 'PAA', right: 'Bancos de alimentos, cozinhas comunitárias e creches' },
            { left: 'PNAE', right: 'Merenda das escolas públicas municipais e estaduais' },
            { left: 'Venda direta na feira', right: 'Consumidor final — maior preço, sem intermediário' },
            { left: 'Exportação via cooperativa', right: 'Mercado internacional com preço 40-60% maior' }
        ]),
        mc1('O que a Emater-PI pode ajudar o apicultor a fazer gratuitamente?',
            ['Comprar colmeias com desconto do governo',
             'Elaborar o projeto técnico para o PRONAF e orientar sobre manejo, certificação e acesso ao PNAE',
             'Vender o mel em nome do apicultor nas feiras regionais',
             'Emitir o CAF e a nota fiscal de produtor rural sem precisar ir ao cartório'],
            1),
        mc1('Qual documento adicional é necessário para vender mel pelo PNAE além do CAF?',
            ['Alvará da Vigilância Sanitária Municipal',
             'Nota Fiscal de Produtor Rural e inspeção sanitária do mel (SIM, SIE ou SIF)',
             'CNPJ como pessoa jurídica e contrato de prestação de serviços',
             'Laudo da Embrapa atestando a qualidade nutricional do mel'],
            1),
        selectMissingWords(
            'Complete sobre os programas de venda para o governo:',
            'O [[b1]] compra mel de apicultores familiares com CAF e distribui para creches. O [[b2]] garante que 30% da merenda escolar venha da agricultura familiar. A Emater-PI oferece [[b3]] gratuita. O [[b4]] garante renda em caso de seca.',
            [
                { id: 'b1', opts: ['PAA', 'PNAE', 'PRONAF', 'ATER'], ci: 0 },
                { id: 'b2', opts: ['PNAE', 'PAA', 'Garantia-Safra', 'PRONAF'], ci: 0 },
                { id: 'b3', opts: ['assistência técnica', 'crédito rural', 'certificação orgânica', 'nota fiscal'], ci: 0 },
                { id: 'b4', opts: ['Garantia-Safra', 'PRONAF', 'PAA', 'ATER'], ci: 0 }
            ]
        ),
        mc1('Quem emite a Nota Fiscal de Produtor Rural para o apicultor do Piauí?',
            ['A prefeitura municipal onde o apiário está localizado',
             'A Secretaria de Fazenda do Piauí (Sefaz-PI) — gratuita',
             'O sindicato rural mediante pagamento de anuidade',
             'A CONAB após confirmação da primeira venda pelo PAA'],
            1)
    ]
},

// ── L07: Escuta Ativa ─────────────────────────────────────────────────────────
{
    title: 'Minha Situação com os Programas',
    description: 'Conte sua situação real — as respostas ajudam o MDA a melhorar o acesso aos programas para apicultores do Piauí.',
    fcType: 'listen',
    questions: [
        mc1('Você já tem o CAF (Cadastro do Agricultor Familiar)?',
            ['Sim, já tenho o CAF', 'Não tenho, mas quero tirar', 'Não sei o que é o CAF', 'Tentei tirar mas tive dificuldade'], 0),
        mc1('Você já acessou alguma linha do PRONAF (crédito rural)?',
            ['Sim, já peguei crédito pelo PRONAF', 'Não, mas quero aprender como', 'Não sei como funciona o PRONAF', 'Tentei mas não consegui pelo banco'], 0),
        mc1('Você recebe assistência técnica da Emater-PI ou outro órgão?',
            ['Sim, recebo regularmente', 'Sim, mas raramente — uma vez ou outra', 'Não recebo — nunca fui procurar', 'Não existe Emater na minha região'], 0),
        vf('Você já vendeu mel para o governo (PAA, merenda escolar ou outro programa público).', false),
        mc1('Qual programa você mais quer aprender a acessar primeiro?',
            ['CAF — preciso tirar o meu', 'PRONAF — quero crédito para ampliar o apiário',
             'PAA ou PNAE — quero vender mel para o governo', 'ATER — quero assistência técnica gratuita'], 0)
    ]
},

// ── L08: Diário + Missão ──────────────────────────────────────────────────────
{
    title: 'Meu CAF',
    description: 'Registre sua situação com o CAF e ganhe um cristal — cada documento é um passo rumo à sua independência financeira.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto do seu CAF (Cadastro do Agricultor Familiar) ou dos documentos que você vai usar para tirar o seu. Se ainda não tem o CAF, registre o compromisso: escreva onde vai buscá-lo esta semana.',
            ['photo'],
            'Foto do CAF digital/impresso, ou dos documentos (RG, CPF, comprovante de atividade rural). Ou uma foto do escritório da Emater-PI que você vai visitar.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo A',
    description: 'Revise todos os programas do Módulo A e consolide o que você aprendeu sobre seus direitos como agricultor familiar.',
    fcType: 'review',
    questions: [
        mc1('O CAF é a porta de entrada para quais programas?',
            ['Apenas para o PRONAF — os outros programas têm cadastro próprio',
             'PRONAF, PAA, PNAE, Garantia-Safra e assistência técnica gratuita da Emater',
             'Somente para programas estaduais do Piauí, não para programas federais',
             'Para o INSS rural — o CAF substitui a contribuição previdenciária'],
            1),
        vf('A Emater-PI oferece assistência técnica gratuita para apicultores do Piauí.', true),
        vf('Para vender mel pelo PNAE, o apicultor precisa ter CNPJ e contratar um contador.', false),
        matching('Associe cada programa com seu principal objetivo:', [
            { left: 'PRONAF Investimento', right: 'Comprar colmeias, equipamentos e infraestrutura com crédito subsidiado' },
            { left: 'PAA', right: 'Vender mel para o governo sem licitação, com preço justo' },
            { left: 'PNAE', right: 'Fornecer mel para a merenda escolar das escolas públicas' },
            { left: 'Garantia-Safra', right: 'Receber renda mínima quando a seca destroça a produção' }
        ]),
        mc1('Quantos por cento da merenda escolar devem vir da agricultura familiar por lei federal?',
            ['10%', '20%', '30%', '50%'],
            2),
        matching('Associe cada documento com quando ele é necessário:', [
            { left: 'CAF', right: 'Para qualquer programa federal de agricultura familiar' },
            { left: 'Nota Fiscal de Produtor Rural', right: 'Para vender mel formalmente ao governo ou ao supermercado' },
            { left: 'Projeto técnico da Emater', right: 'Para contratar o PRONAF no banco' },
            { left: 'SIM ou SIE do mel', right: 'Para vender mel para o PNAE (merenda escolar)' }
        ]),
        selectMissingWords(
            'Complete sobre o processo de venda pelo PNAE:',
            'A prefeitura lança uma [[b1]] para comprar da agricultura familiar. O apicultor apresenta uma [[b2]] com preço e quantidade. Precisa ter [[b3]] e [[b4]] do mel.',
            [
                { id: 'b1', opts: ['chamada pública', 'licitação comum', 'leilão eletrônico', 'pregão presencial'], ci: 0 },
                { id: 'b2', opts: ['proposta', 'escritura', 'certidão', 'apólice'], ci: 0 },
                { id: 'b3', opts: ['CAF', 'CNPJ', 'SIF', 'DAP'], ci: 0 },
                { id: 'b4', opts: ['inspeção sanitária', 'certificação orgânica', 'alvará federal', 'SIF obrigatório'], ci: 0 }
            ]
        ),
        mc1('Qual linha do PRONAF um apicultor deve usar para comprar 20 novas colmeias e uma centrífuga?',
            ['PRONAF Custeio — para pagar as despesas da safra',
             'PRONAF Investimento — para adquirir bens duráveis e infraestrutura',
             'PRONAF Microcrédito Rural — exclusivo para emergências climáticas',
             'PRONAF Agroindústria — apenas para industrializar e processar produtos'],
            1),
        mc1('Onde o apicultor piauiense deve procurar para emitir o CAF?',
            ['Banco Central do Brasil em Teresina', 'Emater-PI, sindicato rural ou INCRA',
             'Receita Federal com contador', 'Cartório de registro de imóveis'],
            1),
        mc1('O que o PAA (Programa de Aquisição de Alimentos) faz com o mel comprado dos apicultores?',
            ['Revende nos supermercados federais com margem de lucro',
             'Distribui para bancos de alimentos, cozinhas comunitárias e creches',
             'Exporta como mel orgânico certificado pelo MAPA',
             'Armazena nos silos da CONAB para regular o preço de mercado'],
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
    console.log('🐝 Seed — Rota do Mel: Módulo A — Programas do Governo');
    console.log('=========================================================\n');

    const moduleId = await createFolder('Módulo A — Programas do Governo', 'module', SUBJECT_ID);
    console.log('');

    for (let i = 0; i < LESSONS.length; i++) {
        await seedLesson(moduleId, LESSONS[i], i);
    }

    console.log('\n\n✅ Módulo A — Rota do Mel criado!');
    console.log(`   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

/**
 * seed-modulo-c-mel.js
 * Cria o Módulo C — Qualidade e Certificação na Rota do Mel.
 * Temas: SIM/SIE/SIF, certificação orgânica (IBD, Ecocert), rotulagem MAPA, rastreabilidade
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-c-mel.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';
const SUBJECT_ID = '69c9336fdf494d3199c2a6ba'; // Rota do Mel

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
    title: 'O Mel de Qualidade Abre Portas',
    video: {
        title: 'O Mel de Qualidade Abre Portas',
        url: 'https://www.youtube.com/watch?v=3UEwbRmVQoI',
        description: 'O que diferencia mel artesanal de mel industrial: preço, certificação e acesso a mercados. Supermercados, farmácias e exportação exigem inspeção sanitária — e a cooperativa com SIF é o caminho mais viável para o apicultor familiar.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: O Mel de Qualidade Abre Portas',
    description: 'Teste o que você aprendeu sobre como a qualidade e a certificação determinam os mercados que o apicultor pode acessar.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é a principal diferença entre mel artesanal de qualidade e mel industrial no mercado?',
            ['O mel industrial tem mais vitaminas por ser pasteurizado e filtrado em alta temperatura',
             'O mel artesanal com certificação tem sabor, aroma e propriedades únicas — e acessa mercados com preço 2 a 3× maior',
             'O mel industrial é mais puro porque passa por controle de qualidade em laboratório',
             'Não há diferença real — o consumidor compra pelo preço mais baixo independentemente'],
            1),
        mc1('Quais mercados exigem que o mel tenha inspeção sanitária (SIM, SIE ou SIF)?',
            ['Apenas feiras livres e mercadinhos de bairro',
             'Supermercados, farmácias, exportação e venda para o PNAE (merenda escolar)',
             'Somente o mercado de exportação — o mercado interno não exige inspeção',
             'Apenas cooperativas — o apicultor individual pode vender sem inspeção em qualquer canal'],
            1),
        vf('Um apicultor com mel sem nenhuma inspeção sanitária pode vender livremente para supermercados regionais.', false),
        vf('O mel com SIF (inspeção federal) pode ser vendido em todo o Brasil e exportado — é o nível mais alto de certificação.', true),
        listen(
            'Para vender mel para o supermercado, o apicultor precisa de SIE ou SIF. Para exportar, precisa obrigatoriamente de SIF. A cooperativa com SIF processa e vende em nome do apicultor — o produtor entrega o mel a granel e recebe o valor líquido.',
            'O que o apicultor precisa para vender mel para o supermercado e para exportar, segundo o texto?',
            ['Apenas o CAF e a nota fiscal de produtor rural — sem necessidade de inspeção',
             'SIE ou SIF para supermercado; SIF obrigatório para exportar — via cooperativa é o caminho mais prático',
             'Registro no CNPJ e contrato com distribuidor — a inspeção é responsabilidade do comprador',
             'Certificação orgânica IBD — única aceita por supermercados e mercado externo'],
            1),
        matching('Associe cada nível de certificação com o mercado que ele abre para o mel:', [
            { left: 'SIM (Municipal)', right: 'Feiras e vendas dentro do município' },
            { left: 'SIE (Estadual)', right: 'Supermercados e PNAE dentro do Piauí' },
            { left: 'SIF (Federal)', right: 'Todo o Brasil, farmácias, exportação' },
            { left: 'Certificação Orgânica', right: 'Empórios premium, mercado natural e exportação com preço até 3× maior' }
        ]),
        mc1('Por que a cooperativa com SIF é o caminho mais prático para o apicultor familiar acessar o mercado nacional?',
            ['Porque o governo obriga que todo mel vendido no Brasil passe por cooperativas',
             'Porque ter SIF individualmente exige infraestrutura cara — a cooperativa já tem e divide o custo entre os associados',
             'Porque o SIF individual foi extinto pelo MAPA em 2020 para pequenos produtores',
             'Porque a cooperativa paga preço maior que qualquer outro comprador do mercado'],
            1),
        mc1('Qual é a vantagem concreta de ter mel com SIF em relação ao mel sem inspeção?',
            ['O preço recebido é sempre 10% mais alto por causa da tributação menor do SIF',
             'Acesso a supermercados, farmácias e exportação — mercados que pagam 50-100% a mais que a venda informal',
             'O INSS rural do apicultor é isento quando ele tem SIF',
             'O mel com SIF não precisa de prazo de validade porque a inspeção já garante a conservação'],
            1),
        vf('O mel orgânico certificado (IBD, Ecocert) tem preço de mercado significativamente superior ao mel convencional com a mesma inspeção sanitária.', true),
        mc1('O que acontece com o mel vendido informalmente sem inspeção sanitária se for flagrado pela Vigilância Sanitária?',
            ['O apicultor recebe uma advertência verbal sem consequências financeiras na primeira vez',
             'O produto é apreendido, o apicultor pode ser multado e a venda é embargada até regularização',
             'O mel é liberado mediante pagamento de taxa de regularização no local',
             'Apenas o comprador é responsabilizado — o produtor não tem culpa na venda informal'],
            1)
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Inspeção Sanitária: SIM, SIE e SIF',
    video: {
        title: 'Inspeção Sanitária: SIM, SIE e SIF',
        url: 'https://www.youtube.com/watch?v=kFpwMJJqhUo',
        description: 'SIM é municipal, SIE é estadual e SIF é federal — cada um abre um conjunto diferente de mercados. Quem fiscaliza cada nível, o que exige de infraestrutura e como acessar o SIF via cooperativa apícola com SIF.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Inspeção Sanitária do Mel',
    description: 'Avalie o que você aprendeu sobre os três níveis de inspeção sanitária do mel e como acessá-los.',
    fcType: 'quiz',
    questions: [
        mc1('O que significa SIM na inspeção sanitária do mel?',
            ['Sistema Integrado de Mel — cadastro federal de todos os apicultores brasileiros',
             'Serviço de Inspeção Municipal — emitido pela prefeitura, permite venda apenas dentro do município',
             'Selo de Identidade do Mel — certificação de autenticidade do MAPA para mel artesanal',
             'Serviço de Inspeção Misto — combina inspeção estadual e federal para pequenos produtores'],
            1),
        matching('Associe cada sigla com o órgão responsável por emitir e fiscalizar:', [
            { left: 'SIM', right: 'Prefeitura municipal — Vigilância Sanitária local' },
            { left: 'SIE', right: 'Governo estadual — ADAPI no Piauí' },
            { left: 'SIF', right: 'Governo federal — MAPA (Ministério da Agricultura)' },
            { left: 'Certificação Orgânica', right: 'Certificadoras privadas acreditadas: IBD, Ecocert, IMO' }
        ]),
        listenAndOrder(
            'Primeiro, o apicultor tira o CAF e se filia à cooperativa. Depois, a cooperativa solicita o SIF ao MAPA com toda a documentação. Em seguida, um médico veterinário do MAPA faz a vistoria das instalações. Depois, o SIF é aprovado e a cooperativa pode processar e embalar. Por último, o apicultor entrega o mel a granel e a cooperativa vende com nota fiscal e SIF em nome do grupo.',
            'Ouça e ordene os passos para o apicultor acessar o SIF via cooperativa:',
            ['Tirar o CAF e se filiar à cooperativa',
             'A cooperativa solicita o SIF ao MAPA com documentação',
             'Médico veterinário do MAPA faz vistoria das instalações',
             'SIF aprovado — cooperativa pode processar e embalar',
             'Apicultor entrega mel a granel e cooperativa vende com SIF']
        ),
        vf('O SIE (inspeção estadual) do Piauí é emitido pela ADAPI (Agência de Defesa Agropecuária do Piauí).', true),
        vf('Para ter SIM, o apicultor precisa de uma casa de mel com estrutura equivalente à de uma indústria alimentícia.', false),
        mc1('O que é necessário para o apicultor obter o SIM (inspeção municipal)?',
            ['CNPJ como microempresa e alvará federal de funcionamento',
             'Casa de mel com piso lavável, paredes lisas, tela nas janelas e BPF documentada — avaliada pela prefeitura',
             'SIE prévio — o SIM só é emitido após aprovação estadual',
             'Certificação orgânica prévia de pelo menos 3 anos de produção'],
            1),
        mc1('Qual nível de inspeção o apicultor deve buscar primeiro se quiser vender mel para a merenda escolar (PNAE) do Piauí?',
            ['SIF obrigatório — o PNAE federal exige inspeção federal em todos os estados',
             'SIM ou SIE — a legislação do PNAE aceita qualquer nível de inspeção para venda municipal e estadual',
             'Certificação orgânica IBD — o FNDE exige mel orgânico na merenda escolar',
             'O PNAE não compra mel — o programa se restringe a frutas, verduras e grãos'],
            1),
        mc1('Qual órgão federal é responsável pelo SIF do mel e pela fiscalização do cumprimento das normas?',
            ['ANVISA (Agência Nacional de Vigilância Sanitária)',
             'IBAMA (Instituto Brasileiro do Meio Ambiente)',
             'MAPA — Ministério da Agricultura, Pecuária e Abastecimento',
             'EMBRAPA — Empresa Brasileira de Pesquisa Agropecuária'],
            2),
        smw(
            'Complete sobre os níveis de inspeção sanitária do mel:',
            'O [[b1]] é emitido pela prefeitura. O [[b2]] permite vender em todo o estado. O [[b3]] permite exportar. A [[b4]] acredita certificadoras como IBD e Ecocert para mel orgânico.',
            [
                { id: 'b1', opts: ['SIM', 'SIE', 'SIF', 'CAF'], ci: 0 },
                { id: 'b2', opts: ['SIE', 'SIM', 'SIF', 'ADAPI'], ci: 0 },
                { id: 'b3', opts: ['SIF', 'SIM', 'SIE', 'MAPA'], ci: 0 },
                { id: 'b4', opts: ['MAPA', 'ANVISA', 'IBAMA', 'Embrapa'], ci: 0 }
            ]
        ),
        vf('Um apicultor com SIF pode vender mel para qualquer estado do Brasil e também exportar diretamente.', true)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'Certificação Orgânica e Rotulagem do Mel',
    reading: {
        title: 'Certificação Orgânica e Rotulagem do Mel',
        body: `<h2>Certificação Orgânica e Rotulagem do Mel</h2>

<p>Mel orgânico certificado chega a custar <strong>3 vezes mais</strong> que o mel convencional nas farmácias e empórios. E o Piauí tem tudo para produzir mel orgânico de classe mundial — vegetação nativa do cerrado e da caatinga, longe de agrotóxicos.</p>

<h3>O que é Mel Orgânico</h3>

<p>Para ser orgânico, o mel precisa atender três critérios principais:</p>
<ul>
<li><strong>Área de voo livre de agrotóxicos:</strong> num raio de pelo menos 3 km das colmeias, não pode haver lavouras tratadas com pesticidas ou herbicidas</li>
<li><strong>Sem antibióticos nas colmeias:</strong> o manejo sanitário deve ser feito com produtos naturais (ácido oxálico, timol)</li>
<li><strong>Manejo naturalista:</strong> alimentação artificial somente com mel ou xarope orgânico; material das colmeias sem tinta ou madeira tratada quimicamente</li>
</ul>

<h3>Certificadoras Acreditadas pelo MAPA</h3>

<table>
<tr><th>Certificadora</th><th>Origem</th><th>Acesso</th></tr>
<tr><td><strong>IBD Certificações</strong></td><td>Brasileira</td><td>ibdcertificacoes.com.br</td></tr>
<tr><td><strong>Ecocert Brasil</strong></td><td>Francesa</td><td>ecocert.com/br</td></tr>
<tr><td><strong>IMO Brazil</strong></td><td>Suíça</td><td>imo.ch</td></tr>
</table>

<p>O custo da certificação para grupos de apicultores via associação ou cooperativa pode ser <strong>diluído entre os membros</strong> — tornando viável para pequenos produtores. A Emater-PI pode orientar sobre editais de apoio à certificação coletiva.</p>

<h3>Rotulagem Obrigatória — Instrução Normativa MAPA nº 11</h3>

<p>Todo mel embalado e vendido no Brasil deve ter no rótulo, obrigatoriamente:</p>
<ol>
<li>Nome do produto: <em>"Mel"</em> ou <em>"Mel Silvestre"</em></li>
<li>Marca do produtor ou cooperativa</li>
<li>Peso líquido em gramas ou quilogramas</li>
<li>Nome e endereço do produtor ou responsável</li>
<li>Número de registro (SIM, SIE ou SIF)</li>
<li>Número do lote</li>
<li>Data de fabricação e prazo de validade (ou "validade indeterminada — mel não fermenta se armazenado corretamente")</li>
<li>País de origem: <em>"Brasil"</em></li>
</ol>

<p>Se for mel orgânico: adicionar <strong>o selo da certificadora</strong> e a expressão <em>"Produto Orgânico"</em>.</p>

<h3>Rastreabilidade: O que é e por que importa</h3>

<p>Rastreabilidade é saber exatamente de onde veio cada pote de mel. Para o apicultor, isso significa:</p>
<ul>
<li>Registrar data de colheita, colmeia de origem e quantidade por lote</li>
<li>Anotar o número do lote no pote e no livro de controle</li>
<li>Se houver reclamação, saber exatamente de qual colmeia e qual data veio o mel</li>
</ul>

<p>Supermercados e redes de farmácias exigem rastreabilidade como condição para comprar. Com ela, o apicultor responde com confiança: <em>"Esse mel veio do apiário X, colhido em março, lote 2024-03"</em>.</p>

<p><em>Fonte: MAPA — IN 11/2000, IBD Certificações, Emater-PI, SEBRAE-PI (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Certificação Orgânica e Rotulagem',
    description: 'Teste seus conhecimentos sobre o que é mel orgânico, as certificadoras e as informações obrigatórias no rótulo do mel.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é o raio mínimo de área de voo livre de agrotóxicos exigido para certificação orgânica do mel?',
            ['500 metros — distância dos apiários à lavoura mais próxima',
             '3 quilômetros — área de coleta habitual das abelhas ao redor das colmeias',
             '10 quilômetros — área de segurança definida pelo IBAMA',
             'Não há raio definido — basta que o apicultor não use agrotóxicos nas próprias colmeias'],
            1),
        vf('Para certificação orgânica, o apicultor pode usar antibióticos nas colmeias desde que respeite o período de carência antes da colheita.', false),
        vf('O custo da certificação orgânica pode ser dividido entre vários apicultores quando feita coletivamente via associação ou cooperativa.', true),
        smw(
            'Complete as informações obrigatórias no rótulo do mel conforme a IN MAPA nº 11:',
            'O rótulo deve ter o [[b1]] do produto, o [[b2]] líquido, o número de [[b3]] (SIM, SIE ou SIF) e o número do [[b4]].',
            [
                { id: 'b1', opts: ['nome', 'código', 'sabor', 'tipo'], ci: 0 },
                { id: 'b2', opts: ['peso', 'volume', 'valor', 'teor'], ci: 0 },
                { id: 'b3', opts: ['registro', 'cadastro', 'alvará', 'CNPJ'], ci: 0 },
                { id: 'b4', opts: ['lote', 'pedido', 'contrato', 'fornecedor'], ci: 0 }
            ]
        ),
        dnd(
            'Ordene os passos para implementar rastreabilidade básica no mel:',
            '[1] → [2] → [3] → [4]',
            ['Anotar o número do lote no pote e no livro de controle', 'Registrar data de colheita e colmeia de origem', 'Definir número de lote para cada colheita', 'Guardar o livro de controle para consulta em caso de reclamação'],
            ['Registrar data de colheita e colmeia de origem', 'Definir número de lote para cada colheita', 'Anotar o número do lote no pote e no livro de controle', 'Guardar o livro de controle para consulta em caso de reclamação']
        ),
        mc1('Quais certificadoras orgânicas são acreditadas pelo MAPA para certificar mel no Brasil?',
            ['Apenas organismos públicos como Embrapa e MAPA diretamente',
             'IBD Certificações, Ecocert Brasil e IMO Brazil — entre outras acreditadas',
             'Somente a IBD — as demais não têm reconhecimento federal',
             'Qualquer empresa pode emitir certificado orgânico desde que registrada na Receita Federal'],
            1),
        mc1('O que deve constar no rótulo de mel orgânico além das informações padrão?',
            ['Código QR com rastreamento em tempo real das colmeias',
             'Selo da certificadora orgânica e a expressão "Produto Orgânico"',
             'Assinatura do médico veterinário responsável pela inspeção das colmeias',
             'Número do CPF do apicultor e data da última inspeção da Vigilância Sanitária'],
            1),
        mc1('Por que supermercados e redes de farmácias exigem rastreabilidade do mel?',
            ['Por obrigação legal da ANVISA que impede a venda de produtos sem código QR',
             'Para saber exatamente de onde veio o produto e poder rastrear a origem em caso de reclamação ou contaminação',
             'Para garantir que o mel foi produzido exclusivamente por abelhas Apis mellifera',
             'Porque a rastreabilidade reduz o imposto sobre circulação de mercadorias'],
            1),
        vf('Mel em pote sem rótulo pode ser vendido legalmente em feiras livres desde que o apicultor esteja presente para informar a procedência.', false),
        mc1('Qual certificadora orgânica brasileira é a mais conhecida para mel e possui ampla aceitação no mercado de exportação?',
            ['SEBRAE Certifica — braço de certificação do Serviço Brasileiro de Apoio às Micro e Pequenas Empresas',
             'IBD Certificações — a maior certificadora orgânica da América Latina, reconhecida internacionalmente',
             'EMBRAPA Qualidade — laboratório de certificação de mel da empresa pública',
             'INMETRO Orgânicos — divisão do Instituto Nacional de Metrologia para produtos agropecuários'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Situação com Qualidade',
    description: 'Conte sua situação atual com inspeção e certificação — as respostas ajudam o MDA a mapear as lacunas e apoiar os apicultores piauienses.',
    fcType: 'listen',
    questions: [
        mc1('Seu mel tem algum tipo de inspeção sanitária?',
            ['Sim, tenho SIM (inspeção municipal)', 'Sim, tenho SIE (inspeção estadual)',
             'Sim, tenho SIF (inspeção federal)', 'Não tenho nenhum tipo de inspeção'], 0),
        mc1('Você vende mel embalado com rótulo?',
            ['Sim, com rótulo completo conforme a lei', 'Sim, mas com rótulo simples sem todas as informações',
             'Não — vendo a granel em pote sem rótulo', 'Não vendo mel embalado'], 0),
        mc1('Você já ouviu falar em certificação orgânica para mel?',
            ['Sim, já tenho certificação orgânica', 'Sim, conheço mas não sei como obter',
             'Ouvi falar mas não sei o que é', 'Nunca ouvi falar em mel orgânico certificado'], 0),
        shortAnswer('Qual é o maior obstáculo para você ter inspeção sanitária no seu mel hoje?'),
        mc1('Você faz parte de alguma cooperativa que processa ou vende mel?',
            ['Sim, sou associado a uma cooperativa apícola', 'Não, mas quero entrar em uma cooperativa',
             'Existe cooperativa na região mas prefiro vender por conta', 'Não há cooperativa apícola na minha região'], 0)
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Mel tem Qualidade',
    description: 'Registre uma evidência de qualidade do seu mel e ganhe um cristal — cada foto mostra que você produz com responsabilidade.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto que mostre qualidade no seu mel: pote com rótulo correto, extração higiênica, mel sendo filtrado ou decantado, ou a casa de mel organizada. Se ainda não tem rótulo, tire uma foto do mel e escreva o que você quer colocar nele.',
            ['photo'],
            'Foto de pote de mel com rótulo, extração higiênica, filtragem, decantação, casa de mel organizada, ou rascunho do rótulo que você quer criar.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo C',
    description: 'Revise todos os temas do Módulo C e consolide o que você aprendeu sobre inspeção sanitária, certificação orgânica e rotulagem do mel.',
    fcType: 'review',
    questions: [
        mc1('Qual nível de inspeção sanitária permite ao apicultor vender mel em todo o Brasil e exportar?',
            ['SIM — Serviço de Inspeção Municipal emitido pela prefeitura',
             'SIE — Serviço de Inspeção Estadual emitido pelo governo do Piauí',
             'SIF — Serviço de Inspeção Federal emitido pelo MAPA',
             'Certificação IBD — reconhecida internacionalmente pelo mercado orgânico'],
            2),
        vf('O SIM permite ao apicultor vender mel apenas dentro do próprio município onde está registrado.', true),
        vf('Para mel orgânico, o apicultor pode usar qualquer antibiótico veterinário disponível no mercado.', false),
        matching('Associe cada nível de inspeção com o mercado que ele abre:', [
            { left: 'SIM', right: 'Feiras e vendas locais dentro do município' },
            { left: 'SIE', right: 'Supermercados e PNAE no estado do Piauí' },
            { left: 'SIF', right: 'Todo o Brasil, farmácias e exportação' },
            { left: 'Orgânico + SIF', right: 'Empórios premium, mercado natural e exportação com preço 3× maior' }
        ]),
        mc1('Qual é o raio mínimo de área de voo livre de agrotóxicos para certificação orgânica do mel?',
            ['500 metros', '1 quilômetro', '3 quilômetros', '10 quilômetros'],
            2),
        matching('Associe cada certificadora com sua origem e reconhecimento:', [
            { left: 'IBD Certificações', right: 'Brasileira — maior da América Latina, reconhecida na exportação' },
            { left: 'Ecocert Brasil', right: 'Francesa — ampla aceitação no mercado europeu' },
            { left: 'IMO Brazil', right: 'Suíça — reconhecida nos mercados norte-americano e europeu' },
            { left: 'MAPA', right: 'Órgão federal que acredita as certificadoras e gerencia o SIF' }
        ]),
        smw(
            'Complete sobre rotulagem obrigatória do mel:',
            'O rótulo deve ter o [[b1]] do produto, o [[b2]] líquido, o número do [[b3]] sanitário e o número do [[b4]] de produção.',
            [
                { id: 'b1', opts: ['nome', 'código', 'registro', 'sabor'], ci: 0 },
                { id: 'b2', opts: ['peso', 'volume', 'valor', 'teor'], ci: 0 },
                { id: 'b3', opts: ['registro', 'alvará', 'CNPJ', 'CAF'], ci: 0 },
                { id: 'b4', opts: ['lote', 'pedido', 'fornecedor', 'contrato'], ci: 0 }
            ]
        ),
        mc1('Como o apicultor familiar pode acessar o SIF sem ter infraestrutura industrial própria?',
            ['Solicitando licença temporária anual de SIF ao MAPA mediante pagamento de taxa',
             'Através de uma cooperativa que já possui SIF — o apicultor entrega mel a granel e a cooperativa processa, embala e vende',
             'Fazendo parceria com uma grande indústria que divide o SIF com pequenos fornecedores',
             'O MAPA criou o SIF simplificado para apicultores com menos de 100 colmeias'],
            1),
        mc1('O que é rastreabilidade do mel e para que serve?',
            ['Um código de barras obrigatório em todos os produtos alimentícios desde 2020',
             'A capacidade de identificar data de colheita, colmeia de origem e lote de cada pote — permite rastrear problemas e é exigida por supermercados',
             'Um sistema GPS instalado nas colmeias para monitorar a produção em tempo real',
             'Certificado de autenticidade emitido pela Embrapa que comprova que o mel é puro'],
            1),
        mc1('Qual órgão é responsável por emitir o SIF para o mel no Brasil?',
            ['ANVISA — Agência Nacional de Vigilância Sanitária',
             'INMETRO — Instituto Nacional de Metrologia, Qualidade e Tecnologia',
             'MAPA — Ministério da Agricultura, Pecuária e Abastecimento',
             'EMBRAPA — Empresa Brasileira de Pesquisa Agropecuária'],
            2)
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
    console.log('🐝 Seed — Rota do Mel: Módulo C — Qualidade e Certificação');
    console.log('==============================================================\n');
    const moduleId = await createFolder('Módulo C — Qualidade e Certificação', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log('\n\n✅ Módulo C — Rota do Mel criado!');
    console.log(`   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

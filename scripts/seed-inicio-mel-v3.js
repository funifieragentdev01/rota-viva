/**
 * seed-inicio-mel-v3.js
 * Recria o Módulo Início da Rota do Mel no module existente.
 * Cria 11 lições + 2 checkpoints cartoon (pos 5 e 10).
 *
 * Uso: node scripts/seed-inicio-mel-v3.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';
const MODULE_ID = '69d7a4ca28fe032bb2524289'; // Módulo Início — Rota do Mel (existente)
const QUIZ1_ID  = '69dba243d95d627e2bdbb5f8'; // Quiz checkpoint 1 (abelhas básico)
const QUIZ2_ID  = '69dba304d95d627e2bdbb609'; // Quiz checkpoint 2 (negócio do mel)

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
    title: 'O Mundo Depende de Você',
    video: {
        title: 'O Mundo Depende de Você',
        url: 'https://www.youtube.com/watch?v=_PDJpMhwai4',
        description: 'ABELHAS Episódio 6 — Polinização agrícola: as abelhas e a produção de alimentos.'
    }
},

// ── L02 (pos 2): Quiz ────────────────────────────────────────────────────────
{
    title: 'Avaliação: O Mundo Depende de Você',
    description: 'Teste o que você aprendeu sobre o papel das abelhas na agricultura e na alimentação humana.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é o papel principal das abelhas na natureza além de produzir mel?',
            ['Decompor matéria orgânica', 'Polinizar plantas e culturas agrícolas', 'Controlar pragas de insetos', 'Produzir cera para a indústria'], 1),
        mc1('Qual porcentagem aproximada dos alimentos que consumimos depende da polinização por abelhas?',
            ['10%', '30%', '70%', '95%'], 2),
        vf('A polinização feita pelas abelhas aumenta a produtividade de culturas como maçã, morango e maracujá.', true),
        vf('As abelhas só são úteis para a produção de mel — sua ausência não afeta a agricultura.', false),
        mc1('O que acontece com a produção agrícola quando a população de abelhas diminui drasticamente?',
            ['A produção aumenta porque há menos competição por alimento', 'A produção cai porque menos flores são polinizadas', 'A produção se mantém porque os agricultores usam fertilizantes', 'A produção muda de produto mas se mantém igual'], 1),
        mc1('Qual destes alimentos NÃO depende da polinização por abelhas para ser produzido?',
            ['Maracujá', 'Abacate', 'Arroz', 'Melão'], 2),
        dragAndDrop(
            'Complete a frase arrastando as palavras corretas:',
            'As abelhas polinizam as [1], permitindo que se formem os [2], garantindo a [3] da agricultura.',
            ['flores', 'frutos', 'segurança alimentar', 'raízes', 'pragas', 'veneno'],
            ['flores', 'frutos', 'segurança alimentar']
        ),
        listen(
            'A apicultura no Piauí combina geração de renda com preservação ambiental, pois as abelhas polinizam a vegetação nativa do cerrado e da caatinga.',
            'O que a apicultura no Piauí combina, segundo o texto?',
            ['Produção industrial e exportação', 'Geração de renda e preservação ambiental', 'Turismo rural e agricultura familiar', 'Mel orgânico e cosméticos naturais'], 1),
        mc1('Por que a apicultura é considerada uma atividade sustentável?',
            ['Porque usa muita água e terra para produzir', 'Porque as abelhas ajudam a preservar o ambiente ao polinizar plantas nativas', 'Porque gera empregos apenas nas cidades', 'Porque compete com outras atividades agropecuárias'], 1),
        mc1('Qual cultura agrícola do Nordeste brasileiro depende intensamente da polinização por abelhas?',
            ['Cana-de-açúcar', 'Soja', 'Maracujá e melão', 'Milho e trigo'], 2)
    ]
},

// ── L03 (pos 3): Vídeo ───────────────────────────────────────────────────────
{
    title: 'Como Funciona Uma Colmeia',
    video: {
        title: 'Como Funciona Uma Colmeia',
        url: 'https://www.youtube.com/watch?v=umKpJligre0',
        description: 'CICLO de VIDA das ABELHAS — Rainhas, Operárias e Zangões.'
    }
},

// ── L04 (pos 4): Quiz ────────────────────────────────────────────────────────
{
    title: 'Avaliação: Como Funciona Uma Colmeia',
    description: 'Avalie seus conhecimentos sobre a organização, as castas e o ciclo de vida dentro da colmeia.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é a função principal da abelha rainha na colmeia?',
            ['Coletar néctar e pólen nas flores', 'Defender a colmeia de predadores', 'Pôr ovos para garantir o crescimento da colônia', 'Produzir mel e cera'], 2),
        mc1('Quantas rainhas existem normalmente em uma colmeia saudável?',
            ['Nenhuma — a colmeia é governada pelas operárias mais velhas', 'Uma única rainha', 'Duas rainhas que se revezam', 'Entre três e cinco rainhas'], 1),
        matching('Associe cada tipo de abelha com sua função principal na colmeia:', [
            { left: 'Rainha', right: 'Postura de ovos e reprodução' },
            { left: 'Operária', right: 'Coleta de néctar, defesa e produção de mel' },
            { left: 'Zangão', right: 'Fecundação da rainha durante o voo nupcial' }
        ]),
        matching('Associe cada fase do desenvolvimento da abelha com a descrição:', [
            { left: 'Ovo', right: 'Dura 3 dias, depositado pela rainha na célula' },
            { left: 'Larva', right: 'Alimentada com geleia real e mel, cresce rapidamente' },
            { left: 'Pupa', right: 'Fase de metamorfose dentro da célula opercularizada' },
            { left: 'Adulta', right: 'Abelha formada, assume funções de acordo com a idade' }
        ]),
        vf('Os zangões são abelhas macho cuja única função é fecundar a rainha durante o voo nupcial.', true),
        vf('Após o período de escassez, os zangões continuam na colmeia ajudando na coleta de néctar.', false),
        listenAndOrder(
            'Primeiro o ovo. Depois a larva. Em seguida a pupa. Por fim a abelha adulta emerge da célula.',
            'Ouça e ordene as fases do ciclo de vida da abelha:',
            ['Ovo', 'Larva', 'Pupa', 'Abelha adulta']
        ),
        listenAndOrder(
            'A abelha jovem começa trabalhando dentro da colmeia. Com o tempo passa a guardar a entrada. Depois começa a explorar flores. Por último vira abelha coletora.',
            'Ouça e ordene as fases do trabalho de uma operária ao longo da vida:',
            ['Abelha de câmara — dentro da colmeia', 'Abelha guardiã — entrada da colmeia', 'Abelha exploradora', 'Abelha coletora']
        ),
        mc1('O que é a "enxameação" na apicultura?',
            ['Um ataque de abelhas a predadores externos', 'A divisão natural da colônia quando a rainha sai com parte das abelhas para formar nova colmeia', 'O processo de colheita do mel pelo apicultor', 'Uma doença que mata as abelhas operárias'], 1),
        mc1('Qual substância especial alimenta a rainha e as larvas reais?',
            ['Própolis', 'Cera de abelha', 'Geleia real', 'Mel florado'], 2)
    ]
},

// ── [CARTOON 1 em pos 5 — criado separado] ───────────────────────────────────

// ── L05 (pos 6): Vídeo ───────────────────────────────────────────────────────
{
    title: 'Um Dia na Vida de Um Apicultor',
    video: {
        title: 'Um Dia na Vida de Um Apicultor',
        url: 'https://www.youtube.com/watch?v=yth-9XhIaRw',
        description: 'Vida de Uma Apicultora — Manejo Entressafra (Alice Borges). Rotina real: madrugada, campo, colheita, venda.'
    }
},

// ── L06 (pos 7): Quiz ────────────────────────────────────────────────────────
{
    title: 'Avaliação: Um Dia na Vida de Um Apicultor',
    description: 'Verifique o que você aprendeu sobre a rotina e as boas práticas do apicultor no campo.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é o principal equipamento de proteção do apicultor durante o manejo?',
            ['Luvas de borracha e avental de couro', 'Macacão apícola, véu e luvas de couro', 'Óculos de segurança e capacete', 'Roupa de chuva e botas de borracha'], 1),
        mc1('Para que serve o fumegador na apicultura?',
            ['Para limpar as colmeias de parasitas', 'Para acalmar as abelhas durante o manejo', 'Para aquecer as colmeias no inverno', 'Para atrair enxames selvagens'], 1),
        vf('O apicultor deve abrir as colmeias durante o dia com sol forte, pois as abelhas estão mais calmas.', false),
        vf('A apicultura permite ao produtor rural ter renda adicional sem abandonar outras atividades.', true),
        mc1('Na entressafra, o que o apicultor deve fazer para manter as colmeias saudáveis?',
            ['Abandonar as colmeias até a próxima florada', 'Fazer manejo regular, verificar a rainha e oferecer alimentação artificial se necessário', 'Transferir todas as colmeias para outra cidade', 'Colher todo o mel para liberar espaço nas caixas'], 1),
        selectMissingWords(
            'Complete as etapas da rotina do apicultor durante a colheita:',
            'O apicultor usa o [[b1]] para acalmar as abelhas, remove os [[b2]] com mel maduro, leva para a [[b3]] e [[b4]] o mel centrifugado.',
            [
                { id: 'b1', opts: ['fumegador', 'borrifador de água', 'soprador', 'veneno'], ci: 0 },
                { id: 'b2', opts: ['quadros', 'favos de cria', 'caixas vazias', 'zangões'], ci: 0 },
                { id: 'b3', opts: ['casa de mel', 'feira', 'cozinha de casa', 'garagem'], ci: 0 },
                { id: 'b4', opts: ['filtra', 'fermenta', 'aquece', 'vende imediatamente'], ci: 0 }
            ]
        ),
        selectMissingWords(
            'Complete a frase sobre o mel de qualidade:',
            'O mel de qualidade deve ser [[b1]] com umidade abaixo de [[b2]]%, armazenado em recipientes [[b3]] e longe de [[b4]].',
            [
                { id: 'b1', opts: ['maduro', 'aquecido', 'fermentado', 'diluído'], ci: 0 },
                { id: 'b2', opts: ['20', '50', '80', '10'], ci: 0 },
                { id: 'b3', opts: ['limpos e fechados', 'abertos para ventilar', 'plásticos coloridos', 'de alumínio'], ci: 0 },
                { id: 'b4', opts: ['calor e luz solar', 'sombra e frescor', 'geladeira', 'outros alimentos'], ci: 0 }
            ]
        ),
        mc1('Qual é o período mais indicado para abrir as colmeias?',
            ['De madrugada, antes do sol nascer', 'Início da manhã ou fim da tarde, com tempo bom e sem chuva', 'Meio do dia com sol forte', 'À noite quando as abelhas dormem'], 1),
        mc1('O que indica que um quadro de mel está pronto para ser colhido?',
            ['A cor do mel ficou escura e viscosa', 'As células estão operculadas (tamponadas com cera)', 'O quadro está muito pesado e difícil de levantar', 'As abelhas pararam de visitar aquele quadro'], 1),
        essay(
            'Descreva como seria um dia de trabalho como apicultor na sua região. O que faria de manhã? Como cuidaria das colmeias? O que faria com o mel?',
            'Reflexão livre — sem resposta errada. Avalie conexão com a realidade local.'
        )
    ]
},

// ── L07 (pos 8): Leitura ─────────────────────────────────────────────────────
{
    title: 'O Negócio do Mel',
    reading: {
        title: 'O Negócio do Mel',
        body: `<h2>O Negócio do Mel</h2>

<p>O mel é apenas o começo. A apicultura é um negócio completo que pode transformar a vida de uma família rural no Piauí.</p>

<h3>O que você pode produzir e vender</h3>

<p><strong>Mel:</strong> O produto principal. O Brasil é um dos maiores exportadores de mel do mundo, e o Piauí é o <strong>terceiro maior produtor nacional</strong>. O mel do Piauí tem sabor e aroma únicos por causa da vegetação nativa do cerrado e da caatinga.</p>

<p><strong>Própolis:</strong> Resina coletada pelas abelhas. Tem alto valor no mercado de saúde natural — extrato de própolis chega a R$ 80–120 por 30ml. Um apicultor com 30 colmeias pode extrair até 1kg de própolis por mês.</p>

<p><strong>Cera de abelha:</strong> Usada em cosméticos, velas, pomadas. Vale entre R$ 15–25 por kg e é gerada naturalmente durante o manejo.</p>

<p><strong>Geleia real:</strong> Superfood de alto valor. Mais difícil de produzir, mas chega a R$ 200–400 por 100g no mercado premium.</p>

<p><strong>Serviço de polinização:</strong> Agricultores de frutas e hortaliças pagam para ter colmeias em suas propriedades. Renda adicional sem trabalho extra.</p>

<h3>Quanto ganha um apicultor no Piauí</h3>

<p>Um apicultor familiar com <strong>50 colmeias</strong> bem manejadas pode colher 1.000–1.500 kg de mel por ano. Com o preço médio de R$ 12–18/kg para o atacadista (e R$ 25–35/kg na venda direta):</p>

<ul>
<li>Venda para atacadista: R$ 12.000–27.000/ano</li>
<li>Venda direta (feiras, cooperativa, merenda escolar): R$ 25.000–52.500/ano</li>
</ul>

<p>Com própolis e cera, o rendimento total pode ser <strong>20–30% maior</strong>.</p>

<h3>Onde vender</h3>

<ul>
<li><strong>Feiras locais e estaduais</strong> — melhor preço, contato direto com consumidor</li>
<li><strong>Cooperativa</strong> — acessa supermercados e exportação com volume</li>
<li><strong>Merenda escolar (PNAE/PAA)</strong> — preço garantido pelo governo</li>
<li><strong>Exportação</strong> — exige SIF via cooperativa, preço 40–60% maior</li>
</ul>

<p><em>Fonte: SEBRAE-PI, MAPA, cooperativas apícolas do Piauí (2023)</em></p>`
    }
},

// ── L08 (pos 9): Quiz ────────────────────────────────────────────────────────
{
    title: 'Avaliação: O Negócio do Mel',
    description: 'Teste seus conhecimentos sobre os produtos apícolas, os preços e os canais de venda do mel.',
    fcType: 'quiz',
    questions: [
        mc1('Além do mel, quais outros produtos podem ser obtidos na apicultura?',
            ['Apenas cera e veneno', 'Própolis, cera, geleia real e serviço de polinização', 'Somente própolis e mel processado', 'Mel e açúcar de cana'], 1),
        mc1('Qual é a posição do Piauí na produção de mel no Brasil?',
            ['Primeiro maior produtor', 'Segundo maior produtor', 'Terceiro maior produtor', 'Quinto maior produtor'], 2),
        matching('Associe cada produto apícola com seu principal mercado:', [
            { left: 'Mel florado', right: 'Alimentação, culinária e exportação' },
            { left: 'Própolis', right: 'Saúde natural, farmácias e lojas naturais' },
            { left: 'Cera de abelha', right: 'Cosméticos, velas e pomadas' },
            { left: 'Geleia real', right: 'Suplemento premium e cosmética de luxo' }
        ]),
        matching('Associe cada canal de venda com sua característica:', [
            { left: 'Feira local', right: 'Melhor preço, contato direto com consumidor' },
            { left: 'Cooperativa', right: 'Acessa supermercados e exportação com volume' },
            { left: 'PNAE/PAA', right: 'Programa do governo com preço garantido' },
            { left: 'Exportação', right: 'Preço 40-60% maior, exige SIF' }
        ]),
        mc1('Qual é a vantagem de vender mel pela cooperativa?',
            ['O preço pago ao produtor é mais baixo', 'O produtor perde contato com os consumidores', 'A cooperativa soma volume e dá acesso a mercados que sozinho seria difícil', 'O produtor tem menos trabalho mas recebe menos'], 2),
        vf('Um apicultor com 50 colmeias bem manejadas pode faturar mais de R$ 25.000/ano vendendo mel direto.', true),
        vf('Para exportar mel, o apicultor precisa ter SIF individualmente, sem precisar de cooperativa.', false),
        shortAnswer('Quanto você acha que ganha por mês um apicultor com 50 colmeias no Piauí vendendo mel na feira?'),
        dragAndDrop(
            'Organize os canais de venda do menor para o maior preço recebido pelo apicultor:',
            '[1] → [2] → [3] → [4]',
            ['Exportação via cooperativa', 'Atacadista local', 'PNAE/PAA governo', 'Feira e venda direta'],
            ['Atacadista local', 'PNAE/PAA governo', 'Feira e venda direta', 'Exportação via cooperativa']
        ),
        mc1('O mel do Piauí tem características especiais por causa de qual fator?',
            ['Do processo industrial de pasteurização', 'Da vegetação nativa do cerrado e da caatinga que as abelhas polinizam', 'Do clima frio e úmido que favorece a produção', 'Da raça especial de abelha do Piauí'], 1)
    ]
},

// ── [CARTOON 2 em pos 10 — criado separado] ──────────────────────────────────

// ── L09 (pos 11): Escuta Ativa ───────────────────────────────────────────────
{
    title: 'Escuta Ativa: Minha Trajetória na Apicultura',
    description: 'Conte sua história — responda com sua própria experiência na apicultura.',
    fcType: 'listen',
    questions: [
        essay('Como você aprendeu sobre apicultura? Conte sua história — foi com a família, um vizinho, um curso, ou você mesmo se virou?',
            'Coleta de dados MDA: origem do conhecimento apícola'),
        shortAnswer('Quantas colmeias sua família tem hoje? (Se ainda não tem, escreva 0)'),
        mc1('O que mais te interessa na apicultura?',
            ['Renda extra para a família', 'Preservação das abelhas e do ambiente', 'Produzir mel para consumo próprio', 'Entrar em cooperativas e ter acesso a novos mercados'], 0),
        shortAnswer('Você já vendeu mel? Se sim, para quem você vende?'),
        shortAnswer('Qual é seu maior desafio hoje na apicultura?')
    ]
},

// ── L10 (pos 12): Diário ─────────────────────────────────────────────────────
{
    title: 'Diário: Meu Apiário no Mapa',
    description: 'Registre seu apiário e contribua com o mapeamento da apicultura familiar no Piauí.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto das suas colmeias e compartilhe sua localização! Isso ajuda o MDA a mapear a apicultura familiar no Piauí — e você ganha um cristal.',
            ['photo', 'location'],
            'Foto do apiário ou das colmeias. Se ainda não tem, tire uma foto do local onde pretende instalar.'
        )
    ]
},

// ── L11 (pos 13): Revisão Geral ──────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo Início',
    description: 'Revise todos os temas do Módulo Início e consolide o que você aprendeu sobre apicultura.',
    fcType: 'review',
    questions: [
        mc1('Qual é o papel das abelhas para a produção de alimentos?',
            ['Elas produzem mel que alimenta insetos e pássaros', 'Elas polinizam cerca de 70% das culturas alimentares consumidas por humanos', 'Elas controlam pragas nas lavouras', 'Elas transformam néctar em adubo natural'], 1),
        mc1('Qual é a função da abelha rainha?',
            ['Coletar néctar e defender a entrada', 'Produzir mel e cera para a colônia', 'Pôr ovos e garantir o crescimento da colônia', 'Alimentar as larvas com geleia real'], 2),
        matching('Associe cada tipo de abelha com sua função:', [
            { left: 'Rainha', right: 'Postura de ovos' },
            { left: 'Operária', right: 'Coleta de néctar e defesa' },
            { left: 'Zangão', right: 'Fecundação da rainha' }
        ]),
        vf('O Piauí é o terceiro maior produtor de mel do Brasil.', true),
        vf('O mel deve ser colhido com células abertas, antes de ser operculado, para ter melhor qualidade.', false),
        matching('Associe cada produto apícola com seu uso:', [
            { left: 'Mel', right: 'Alimentação e exportação' },
            { left: 'Própolis', right: 'Saúde natural e farmácia' },
            { left: 'Cera', right: 'Cosméticos e velas' },
            { left: 'Geleia real', right: 'Suplemento premium' }
        ]),
        selectMissingWords(
            'Complete sobre a colmeia:',
            'A colmeia tem uma [[b1]] que põe ovos, muitas [[b2]] que trabalham, e poucos [[b3]] que fecundam a rainha.',
            [
                { id: 'b1', opts: ['rainha', 'operária chefe', 'zangão fêmea', 'larva mestra'], ci: 0 },
                { id: 'b2', opts: ['operárias', 'rainhas', 'zangões', 'larvas'], ci: 0 },
                { id: 'b3', opts: ['zangões', 'rainhas velhas', 'guardas', 'exploradores'], ci: 0 }
            ]
        ),
        selectMissingWords(
            'Complete sobre venda do mel:',
            'Vender pela [[b1]] dá acesso a supermercados e [[b2]]. O preço mais alto é na [[b3]] direta. O governo compra pelo programa [[b4]].',
            [
                { id: 'b1', opts: ['cooperativa', 'feira', 'internet', 'farmácia'], ci: 0 },
                { id: 'b2', opts: ['exportação', 'merenda', 'atacado', 'feira livre'], ci: 0 },
                { id: 'b3', opts: ['venda', 'cooperativa', 'exportação', 'internet'], ci: 0 },
                { id: 'b4', opts: ['PNAE/PAA', 'PRONAF', 'CAF', 'Bolsa Família'], ci: 0 }
            ]
        ),
        mc1('Por que é importante usar macacão, véu e luvas durante o manejo?',
            ['Para impressionar os vizinhos', 'Para proteção contra ferroadas durante a inspeção das colmeias', 'Porque a legislação exige para vender o mel', 'Para evitar que o suor contamine o mel'], 1),
        mc1('O que acontece quando uma colmeia "enxameia"?',
            ['As abelhas atacam em massa para defender a colmeia', 'A rainha velha sai com parte das abelhas para formar nova colônia', 'Todas as abelhas morrem por falta de alimento', 'A colmeia produz mel em excesso que transborda'], 1)
    ]
}

]; // fim LESSONS

// ─── Position mapping: 11 lessons + 2 cartoons = 13 total ────────────────────
// idx 0-3 → pos 1-4, cartoon pos 5, idx 4-7 → pos 6-9, cartoon pos 10, idx 8-10 → pos 11-13
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
            await createQuestion(quizId, i + 1, lesson.questions[i]);
        }
        await linkContent(lessonId, quizId, fcType, lesson.title);
    }
}

async function main() {
    console.log('🐝 Seed v3 — Rota do Mel: Módulo Início');
    console.log('  Module ID:', MODULE_ID);
    console.log('=========================================\n');

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

    console.log('\n\n✅ Módulo Início — Rota do Mel recriado com 13 itens!');
    console.log('   (11 lições + 2 cartoon checkpoints nas posições 5 e 10)');
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

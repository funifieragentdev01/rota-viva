/**
 * seed-modulo-b-mel.js
 * Cria o Módulo B — Boas Práticas Produtivas na Rota do Mel.
 * Temas: calendário apícola, manejo seguro, extração/processamento, armazenamento, BPF
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-b-mel.js
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
    title: 'O Calendário Apícola — Quando Fazer o Quê',
    video: {
        title: 'O Calendário Apícola — Quando Fazer o Quê',
        url: 'https://www.youtube.com/watch?v=EuBhNBRCVCc',
        description: 'Calendário apícola do Piauí: floradas do cerrado e caatinga, épocas de manejo, colheita e entressafra. Por que seguir o calendário garante mel de melhor qualidade e maior produtividade.'
    }
},

// ── L02: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: O Calendário Apícola',
    description: 'Teste o que você aprendeu sobre as estações apícolas do Piauí e quando realizar cada atividade no apiário.',
    fcType: 'quiz',
    questions: [
        listenAndOrder(
            'Primeiro, no período das chuvas, as flores abrem e o néctar é abundante — é a florada principal. Depois, no final das chuvas, o apicultor faz a revisão completa das colmeias. Em seguida, na estiagem, vem a colheita do mel maduro. Depois, na entressafra seca, o apicultor oferece alimentação artificial. Por último, com as primeiras chuvas, o ciclo recomeça com nova florada.',
            'Ouça e ordene as estações do calendário apícola do Piauí:',
            ['Florada principal — período das chuvas',
             'Revisão completa das colmeias — final das chuvas',
             'Colheita do mel maduro — estiagem',
             'Alimentação artificial — entressafra seca',
             'Nova florada — primeiras chuvas']
        ),
        mc1('Qual é o principal período de florada para as abelhas no Piauí?',
            ['Junho a agosto — inverno do Sul do Brasil',
             'Janeiro a abril — período chuvoso do Nordeste, com floradas do cerrado e caatinga',
             'Setembro a novembro — primavera do Sul',
             'O Piauí tem florada contínua durante todo o ano'],
            1),
        vf('O mel deve ser colhido apenas quando as células estão operculadas (tampadas com cera), indicando que o mel está maduro com baixa umidade.', true),
        vf('Na entressafra seca, o apicultor deve colher todo o mel restante das colmeias para evitar fermentação.', false),
        matching('Associe cada época do ano com a principal atividade apícola no Piauí:', [
            { left: 'Período chuvoso (jan–abr)', right: 'Florada — abelhas coletam néctar intensamente' },
            { left: 'Final das chuvas (maio)', right: 'Revisão das colmeias e preparo para colheita' },
            { left: 'Estiagem (jun–set)', right: 'Colheita do mel maduro e operculado' },
            { left: 'Entressafra seca (out–dez)', right: 'Alimentação artificial e fortalecimento das colônias' }
        ]),
        mc1('Por que o mel colhido antes de estar operculado tem qualidade inferior?',
            ['Porque as abelhas ainda não adicionaram própolis ao mel para conservá-lo',
             'Porque tem umidade alta acima de 20%, favorecendo a fermentação e reduzindo o prazo de validade',
             'Porque as células abertas permitem a entrada de pragas como a traça da cera',
             'Porque o mel cru sem opérculo não pode ser comercializado por lei'],
            1),
        mc1('O que é "alimentação artificial" na apicultura e quando é usada?',
            ['Mel industrializado dado às abelhas para aumentar a produção durante a florada',
             'Solução de açúcar e água (xarope) ou proteína oferecida às abelhas na entressafra quando o alimento natural é escasso',
             'Ração veterinária à base de pólen sintético administrada mensalmente',
             'Antibióticos diluídos no mel para prevenir doenças durante a seca'],
            1),
        mc1('Qual planta do cerrado piauiense tem uma das floradas mais importantes para a apicultura regional?',
            ['Caju (Anacardium occidentale) — florada de setembro a novembro',
             'Eucalipto plantado — florada contínua o ano todo',
             'Palma forrageira — florada exclusiva da época chuvosa',
             'Milho híbrido — maior fonte de pólen do Nordeste'],
            0),
        vf('O apicultor deve fazer manejo das colmeias sempre no horário de pico de sol (11h–14h), quando as abelhas estão mais ativas fora da colmeia.', false),
        selectMissingWords(
            'Complete sobre o calendário apícola piauiense:',
            'A principal florada ocorre no período [[b1]]. O mel é colhido na [[b2]], quando as células estão [[b3]]. Na entressafra, o apicultor oferece [[b4]] para manter as colônias fortes.',
            [
                { id: 'b1', opts: ['chuvoso', 'seco', 'de inverno', 'de primavera'], ci: 0 },
                { id: 'b2', opts: ['estiagem', 'florada', 'primavera', 'entressafra'], ci: 0 },
                { id: 'b3', opts: ['operculadas', 'abertas', 'fermentadas', 'vazias'], ci: 0 },
                { id: 'b4', opts: ['alimentação artificial', 'antibióticos', 'mel industrializado', 'água com sal'], ci: 0 }
            ]
        )
    ]
},

// ── L03: Vídeo ────────────────────────────────────────────────────────────────
{
    title: 'Manejo das Colmeias com Segurança',
    video: {
        title: 'Manejo das Colmeias com Segurança',
        url: 'https://www.youtube.com/watch?v=0wN9bDFBDpI',
        description: 'Como fazer inspeção segura das colmeias: vestimenta completa, uso do fumegador, reconhecimento da rainha, controle de Varroa e traça da cera. Boas práticas de manejo para o apicultor familiar.'
    }
},

// ── L04: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Manejo das Colmeias',
    description: 'Avalie o que você aprendeu sobre como fazer o manejo das colmeias com segurança e eficiência.',
    fcType: 'quiz',
    questions: [
        matching('Associe cada equipamento de manejo com sua função principal:', [
            { left: 'Macacão apícola', right: 'Proteção total do corpo contra ferroadas durante a inspeção' },
            { left: 'Fumegador', right: 'Acalmar as abelhas pela fumaça, que simula sinal de incêndio' },
            { left: 'Formão apícola', right: 'Desgrudar quadros e tampas colados com própolis' },
            { left: 'Véu apícola', right: 'Proteger o rosto e o pescoço sem comprometer a visão' }
        ]),
        mc1('Por que a fumaça do fumegador acalma as abelhas durante o manejo?',
            ['A fumaça tem substâncias químicas que paralisam temporariamente os nervos das abelhas',
             'A fumaça simula um sinal de incêndio: as abelhas enchem o estômago de mel para fugir e ficam menos agressivas',
             'A fumaça quente aquece a colmeia e faz as abelhas entrarem em letargia',
             'A fumaça elimina os feromônios de alarme emitidos pelas abelhas-guardiãs'],
            1),
        vf('O apicultor deve usar equipamento de proteção completo em todas as inspeções, mesmo nas colmeias mais calmas.', true),
        vf('A Varroa destructor é uma praga que ataca exclusivamente as larvas, sem afetar as abelhas adultas.', false),
        dragAndDrop(
            'Ordene os passos de uma inspeção segura da colmeia:',
            '[1] → [2] → [3] → [4] → [5]',
            ['Verificar a presença da rainha e estado das crias', 'Vestir o equipamento completo', 'Fechar a colmeia e registrar as observações', 'Acender o fumegador e aguardar a fumaça estabilizar', 'Aplicar fumaça na entrada e sob a tampa antes de abrir'],
            ['Vestir o equipamento completo',
             'Acender o fumegador e aguardar a fumaça estabilizar',
             'Aplicar fumaça na entrada e sob a tampa antes de abrir',
             'Verificar a presença da rainha e estado das crias',
             'Fechar a colmeia e registrar as observações']
        ),
        mc1('O que é a Varroa destructor e qual o principal dano que causa à colmeia?',
            ['Um fungo que contamina o mel durante a extração, causando fermentação precoce',
             'Um ácaro parasita que se alimenta da hemolinfa das abelhas e das larvas, enfraquecendo a colônia',
             'Uma espécie de vespa que invade as colmeias para roubar o mel durante a estiagem',
             'Uma bactéria que destrói os alvéolos de cera, impedindo a postura da rainha'],
            1),
        mc1('Como o apicultor identifica infestação de traça da cera na colmeia?',
            ['As abelhas ficam mais agressivas e aumentam a produção de própolis',
             'Aparecem teias de seda nos favos, larvas da mariposa e galeria destruindo a cera',
             'O mel fica com gosto amargo e muda de cor para escuro',
             'A rainha para de pôr ovos e a colônia diminui rapidamente'],
            1),
        mc1('Com que frequência o apicultor deve fazer revisão completa das colmeias durante a florada?',
            ['Diariamente — para monitorar a produção hora a hora',
             'A cada 7 a 15 dias — para acompanhar a rainha, avaliar espaço e detectar pragas precocemente',
             'Mensalmente — a inspeção frequente estressas as abelhas e reduz a produção',
             'Somente na época da colheita — antes disso não é necessário abrir'],
            1),
        listen(
            'Na alimentação artificial de entressafra, o apicultor prepara um xarope com uma parte de açúcar cristal para uma parte de água quente. Mistura bem até dissolver e oferece às abelhas em alimentador dentro da colmeia, evitando derramamentos que atraiam abelhas de outras colmeias.',
            'Como o apicultor prepara a alimentação artificial para as abelhas, segundo o texto?',
            ['Mistura mel industrializado com água fria na proporção de 2 para 1',
             'Prepara xarope de açúcar cristal e água quente na proporção 1:1 e oferece em alimentador dentro da colmeia',
             'Usa ração proteica à base de soja e pólen sintético diluída em mel puro',
             'Dissolve açúcar mascavo em suco de caju e serve em bebedouro externo próximo à colmeia'],
            1),
        vf('Durante a entressafra seca, se a colmeia estiver fraca, o apicultor pode unir duas colônias fracas para formar uma colônia mais forte e produtiva.', true)
    ]
},

// ── L05: Leitura ──────────────────────────────────────────────────────────────
{
    title: 'Extração e Processamento com Qualidade',
    reading: {
        title: 'Extração e Processamento com Qualidade',
        body: `<h2>Extração e Processamento com Qualidade</h2>

<p>O mel que sai da colmeia é perfeito. O que estraga a qualidade é o que acontece depois — nas mãos do apicultor. Higiene, temperatura e técnica correta são o que separa o mel premiado do mel recusado pelo comprador.</p>

<h3>O Fluxo Correto de Extração</h3>

<p>Siga esta sequência em todas as extrações:</p>

<ol>
<li><strong>Desoperculação:</strong> Retire os opérculos de cera com garfo ou faca desoperculadora limpa e esterilizada. Faça isso sobre a bacia de desoperculação para aproveitar o mel que cai.</li>
<li><strong>Centrifugação:</strong> Coloque os quadros desoperculados na centrífuga. Gire em velocidade progressiva para não quebrar os favos. O mel escoa pelas paredes e cai no fundo.</li>
<li><strong>Filtragem:</strong> Passe o mel por filtros de malha fina (200–400 microns) para remover cera, abelhas e impurezas. Não use calor para filtrar — destrói enzimas e aroma.</li>
<li><strong>Decantação:</strong> Deixe o mel repousar em decantador por 24 a 72 horas. A cera e bolhas sobem; mel limpo fica no fundo, pronto para envase.</li>
<li><strong>Envase:</strong> Use recipientes limpos e secos — potes de vidro ou baldes de polietileno alimentício. Nunca use recipientes de metal que possam oxidar.</li>
</ol>

<h3>Higiene é Regra Básica</h3>

<p>Toda superfície que toca o mel deve ser lavada com água e sabão e enxaguada com água fervente antes do uso:</p>
<ul>
<li>Centrífuga, baldes, filtros, espátulas e formões</li>
<li>Mesa de desoperculação</li>
<li>Mãos do apicultor — use luvas descartáveis durante o envase</li>
<li>O ambiente da casa de mel deve estar limpo, sem insetos ou animais</li>
</ul>

<h3>Umidade: O Inimigo do Mel</h3>

<p>O mel com <strong>umidade acima de 20%</strong> fermenta e perde qualidade rapidamente. Para garantir mel seco:</p>
<ul>
<li>Colha apenas favos operculados (abelhas já evaporaram a água)</li>
<li>Nunca extraia mel em dias de chuva intensa ou com umidade relativa do ar acima de 70%</li>
<li>Use refratômetro para medir a umidade antes do envase — disponível na Emater-PI</li>
</ul>

<h3>Armazenamento Correto</h3>

<ul>
<li><strong>Temperatura ideal:</strong> 20–25°C — longe de fogão, janelas com sol e fontes de calor</li>
<li><strong>Recipientes:</strong> potes de vidro com tampa hermética ou baldes de polietileno alimentício</li>
<li><strong>Nunca use:</strong> latas de metal, plástico reciclado, recipientes que já armazenaram outro produto</li>
<li><strong>Cristalização:</strong> mel cristalizado não está estragado — é sinal de pureza. Para liquefazer, aqueça em banho-maria a máximo 40°C</li>
</ul>

<h3>BPF — Boas Práticas de Fabricação</h3>

<p>A BPF exige que a casa de mel tenha piso lavável, paredes lisas, tela nas janelas e ralos com proteção. Com BPF documentada, o apicultor pode solicitar o SIM (inspeção municipal) e acessar o PNAE.</p>

<p><em>Fonte: Embrapa Meio-Norte, MAPA — Instrução Normativa 11/2000, Emater-PI (2024)</em></p>`
    }
},

// ── L06: Quiz ─────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Extração e Processamento',
    description: 'Teste seus conhecimentos sobre como extrair, processar e armazenar mel com qualidade e higiene.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é a sequência correta de processamento do mel após a retirada dos quadros da colmeia?',
            ['Envase → filtragem → centrifugação → desoperculação',
             'Desoperculação → centrifugação → filtragem → decantação → envase',
             'Centrifugação → desoperculação → decantação → filtragem → envase',
             'Filtragem → desoperculação → centrifugação → envase → decantação'],
            1),
        vf('Mel com umidade acima de 20% está propenso à fermentação e não deve ser comercializado.', true),
        vf('Para filtrar o mel mais rapidamente, o apicultor pode aquecê-lo a 60°C — o calor não afeta a qualidade.', false),
        selectMissingWords(
            'Complete as etapas de extração do mel:',
            'O apicultor remove os [[b1]] de cera com garfo ou faca. Em seguida, coloca os quadros na [[b2]]. O mel passa por [[b3]] de malha fina para remover impurezas. Por último, repousa no [[b4]] por 24 a 72 horas.',
            [
                { id: 'b1', opts: ['opérculos', 'favos', 'quadros', 'abelhas'], ci: 0 },
                { id: 'b2', opts: ['centrífuga', 'decantadora', 'filtradora', 'batedeira'], ci: 0 },
                { id: 'b3', opts: ['filtros', 'tecidos', 'peneiras grossas', 'caixas'], ci: 0 },
                { id: 'b4', opts: ['decantador', 'congelador', 'filtro', 'balde aberto'], ci: 0 }
            ]
        ),
        matching('Associe cada erro de processamento com a consequência para a qualidade do mel:', [
            { left: 'Colher mel de células abertas (não operculado)', right: 'Umidade alta acima de 20% — risco de fermentação' },
            { left: 'Aquecer mel acima de 40°C para filtrar', right: 'Destruição de enzimas e perda de aroma e sabor' },
            { left: 'Usar recipiente de metal para armazenar', right: 'Oxidação e sabor metálico no mel' },
            { left: 'Armazenar mel em local quente e úmido', right: 'Aceleração da fermentação e perda de validade' }
        ]),
        mc1('O que significa mel cristalizado e como o apicultor deve reagir?',
            ['O mel estragou por excesso de umidade — deve ser descartado imediatamente',
             'É sinal de pureza e alto teor de glicose — pode ser liquefeito em banho-maria a máximo 40°C',
             'O mel foi adulterado com açúcar comum — precisa ser testado no laboratório',
             'A colmeia estava infestada de Varroa — o mel não pode ser consumido'],
            1),
        mc1('Qual instrumento o apicultor usa para medir a umidade do mel antes do envase?',
            ['Termômetro de precisão calibrado para alimentos',
             'Refratômetro — equipamento que mede o índice de refração do mel',
             'Higrômetro de parede instalado na casa de mel',
             'Densímetro de vidro mergulhado diretamente no mel'],
            1),
        mc1('O que é a BPF (Boas Práticas de Fabricação) e para que serve na apicultura?',
            ['Um conjunto de regras sobre o uso de antibióticos nas colmeias para prevenir doenças',
             'Um protocolo de higiene e infraestrutura da casa de mel que permite ao apicultor solicitar o SIM e acessar o PNAE',
             'Um certificado emitido pela Embrapa que garante a origem orgânica do mel',
             'Um manual de manejo das colmeias publicado pelo MAPA para apicultores do Nordeste'],
            1),
        vf('O mel deve ser envasado em potes de vidro ou baldes de polietileno alimentício — nunca em recipientes de metal.', true),
        mc1('Em que condição climática o apicultor DEVE evitar extrair mel?',
            ['Em dias frios abaixo de 20°C — o mel fica muito espesso para centrifugar',
             'Em dias de forte chuva ou umidade do ar acima de 70% — o mel absorve umidade e pode fermentar',
             'Em dias de vento forte — as abelhas ficam agitadas e a colmeia perde temperatura',
             'Em dias de sol forte acima de 35°C — o mel evapora e perde peso durante a extração'],
            1)
    ]
},

// ── L07: Escuta Ativa ─────────────────────────────────────────────────────────
{
    title: 'Minhas Práticas no Apiário',
    description: 'Conte como você trabalha hoje — as respostas ajudam o MDA a entender as práticas reais dos apicultores piauienses.',
    fcType: 'listen',
    questions: [
        mc1('Com que frequência você realiza o manejo das colmeias?',
            ['Semanalmente — visito todas as colmeias toda semana',
             'A cada 15 dias — manejo regular quinzenal',
             'Mensalmente — só entro uma vez por mês',
             'Só na época da colheita — não faço manejo regular'],
            0),
        mc1('Você usa equipamento de proteção completo (macacão, véu e luvas) durante o manejo?',
            ['Sempre — uso o equipamento completo em toda inspeção',
             'Às vezes — uso somente o véu ou as luvas',
             'Raramente — trabalho sem proteção na maioria das vezes',
             'Nunca precisei — minhas abelhas são muito calmas'],
            0),
        shortAnswer('Como você armazena o mel após a colheita? (Descreva o recipiente, local e temperatura)'),
        vf('Você já perdeu mel por problemas de armazenamento, fermentação ou qualidade ruim.', false),
        shortAnswer('Qual é a principal dificuldade no seu processo de extração ou processamento do mel hoje?')
    ]
},

// ── L08: Diário ───────────────────────────────────────────────────────────────
{
    title: 'Meu Manejo de Hoje',
    description: 'Registre uma prática real do seu apiário e ganhe um cristal — cada foto é evidência do seu conhecimento aplicado.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto de uma atividade real do seu apiário hoje: inspeção de colmeia, uso do fumegador, extração de mel, filtragem ou armazenamento. Qualquer momento real do seu trabalho conta.',
            ['photo'],
            'Foto de inspeção de colmeia com equipamento de proteção, quadro de mel operculado, extração com centrífuga, filtragem do mel ou potes de mel armazenados corretamente.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo B',
    description: 'Revise as boas práticas do Módulo B e consolide o que você aprendeu sobre calendário, manejo e processamento.',
    fcType: 'review',
    questions: [
        mc1('Qual é o período de principal florada apícola no Piauí e por que?',
            ['Junho a agosto — estação seca com plantas resistentes à seca em flor',
             'Janeiro a abril — período chuvoso, quando as plantas do cerrado e caatinga florescem',
             'Setembro a novembro — primavera com temperaturas amenas favorecendo as abelhas',
             'O Piauí tem florada uniforme ao longo do ano sem sazonalidade'],
            1),
        vf('O mel deve ser colhido somente quando as células estão operculadas (tampadas com cera), garantindo umidade abaixo de 20%.', true),
        vf('Aquecimento do mel acima de 60°C é recomendado para facilitar a filtragem sem perda de qualidade.', false),
        matching('Associe cada equipamento com sua função no manejo apícola:', [
            { left: 'Fumegador', right: 'Acalmar as abelhas simulando sinal de incêndio' },
            { left: 'Formão apícola', right: 'Desgrudar quadros e tampas colados com própolis' },
            { left: 'Refratômetro', right: 'Medir a umidade do mel antes do envase' },
            { left: 'Centrífuga', right: 'Extrair o mel dos quadros por força centrífuga' }
        ]),
        mc1('Qual é o limite máximo de umidade que o mel pode ter para ser comercializado com qualidade?',
            ['10%', '15%', '20%', '30%'],
            2),
        matching('Associe cada erro com sua consequência na qualidade do mel:', [
            { left: 'Colher mel não operculado', right: 'Umidade alta — risco de fermentação' },
            { left: 'Aquecer acima de 40°C', right: 'Perda de enzimas, aroma e sabor' },
            { left: 'Armazenar em metal', right: 'Oxidação e sabor metálico' },
            { left: 'Extrair em dia chuvoso', right: 'Absorção de umidade do ar — fermentação acelerada' }
        ]),
        selectMissingWords(
            'Complete o fluxo correto de extração:',
            'O apicultor [[b1]] os opérculos, coloca na [[b2]], passa pelo [[b3]] e deixa no [[b4]] por 24 a 72 horas antes de envasar.',
            [
                { id: 'b1', opts: ['desopercular', 'aquece', 'filtra', 'decanta'], ci: 0 },
                { id: 'b2', opts: ['centrífuga', 'decantadora', 'filtradora', 'estufa'], ci: 0 },
                { id: 'b3', opts: ['filtro de malha fina', 'pano grosso', 'peneira de areia', 'papel filtro'], ci: 0 },
                { id: 'b4', opts: ['decantador', 'congelador', 'forno', 'recipiente aberto'], ci: 0 }
            ]
        ),
        mc1('O que o apicultor deve fazer durante a entressafra seca para manter as colônias fortes?',
            ['Reduzir o número de colmeias para economizar insumos na estiagem',
             'Oferecer alimentação artificial com xarope de açúcar e proteína substituta de pólen',
             'Colher todo o mel restante para liberar espaço nas caixas',
             'Fechar completamente as colmeias para protegê-las do calor da seca'],
            1),
        mc1('Qual é o recipiente mais adequado para armazenar mel após a extração?',
            ['Lata de metal reciclada de tinta — resistente e impermeável',
             'Saco plástico comum, bem amarrado para evitar contato com o ar',
             'Pote de vidro com tampa hermética ou balde de polietileno alimentício',
             'Qualquer recipiente disponível — o mel não estraga mesmo em contato com o ar'],
            2),
        mc1('Qual é o maior parasita que ameaça as colmeias no Brasil hoje?',
            ['Traça da cera (Galleria mellonella) — destrói os favos durante a estiagem',
             'Varroa destructor — ácaro que parasita abelhas adultas e larvas, enfraquecendo a colônia',
             'Loque americana — bactéria que mata as larvas e tem cheiro fétido',
             'Pequeno besouro das colmeias (Aethina tumida) — presente em toda colmeia brasileira'],
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
    console.log('🐝 Seed — Rota do Mel: Módulo B — Boas Práticas Produtivas');
    console.log('=============================================================\n');

    const moduleId = await createFolder('Módulo B — Boas Práticas Produtivas', 'module', SUBJECT_ID);
    console.log('');

    for (let i = 0; i < LESSONS.length; i++) {
        await seedLesson(moduleId, LESSONS[i], i);
    }

    console.log('\n\n✅ Módulo B — Rota do Mel criado!');
    console.log(`   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

/**
 * seed-modulo-e-pesca.js
 * Cria o Módulo E — Guardiões dos Rios na Rota da Pesca.
 * Temas: pesca seletiva (malhas, tamanhos mínimos, espécies protegidas), qualidade sanitária do pescado, acordos de pesca e RESEX
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-e-pesca.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==';
const SUBJECT_ID = '69d28273505f02177b0d9658';

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
    console.log(`  📁 ${type} "${title}": ${id}`); return id;
}
async function createVideo(title, url, description) {
    const id = getId(await api('PUT', '/v3/database/video__c', { title, url, description: description || '' }));
    console.log(`  🎬 video "${title}": ${id}`); return id;
}
async function createReading(title, body) {
    const id = getId(await api('PUT', '/v3/database/reading__c', { title, body }));
    console.log(`  📖 reading "${title}": ${id}`); return id;
}
async function createQuiz(title, description) {
    const id = getId(await api('PUT', '/v3/database/quiz', { title, description: description || '' }));
    console.log(`  ⭐ quiz "${title}": ${id}`); return id;
}
async function createQuestion(quizId, position, q) {
    getId(await api('PUT', '/v3/database/question', { quiz: quizId, position, ...q }));
    process.stdout.write('.');
}
async function linkContent(lessonId, contentId, type, title) {
    await api('PUT', '/v3/database/folder_content', { parent: lessonId, content: contentId, type, title });
    console.log(`\n  🔗 ${type} → lesson OK`);
}

const G1 = { grade: 1, extra: {} }, G0 = { grade: 0, extra: {} };
const mc1 = (q, opts, ci) => ({ type: 'MULTIPLE_CHOICE', select: 'one_answer', title: q, question: q, choices: opts.map((t, i) => ({ label: String.fromCharCode(65+i), answer: t, ...(i===ci?G1:G0) })) });
const vf = (q, c) => ({ type: 'TRUE_FALSE', title: q, question: q, correctAnswer: c, choices: [] });
const listen = (s, q, opts, ci) => ({ type: 'LISTEN', title: q, question: q, speechText: s, extra: { speechText: s, ttsLang: 'pt-BR' }, choices: opts.map((t, i) => ({ label: String.fromCharCode(65+i), answer: t, ...(i===ci?G1:G0) })) });
const listenAndOrder = (s, q, items) => ({ type: 'LISTEN_AND_ORDER', title: q, question: q, speechText: s, extra: { speechText: s, ttsLang: 'pt-BR' }, choices: items.map((t, i) => ({ label: String.fromCharCode(65+i), answer: t, ...G1 })) });
const matching = (q, pairs) => { const left = pairs.map((p,i)=>({id:`l${i+1}`,text:p.left})), right = pairs.map((p,i)=>({id:`r${i+1}`,text:p.right})), solutions = {}; pairs.forEach((_,i)=>{solutions[`l${i+1}`]=`r${i+1}`;}); return { type:'MATCHING', title:q, question:q, choices:[], model:{matching:{left,right,solutions}} }; };
const smw = (q, text, blanks) => ({ type: 'SELECT_MISSING_WORDS', title: q, question: q, choices: [], model: { missingWords: { text, blanks: blanks.map(b => ({ id: b.id, correctOptionId: `opt_${b.id}_${b.ci}`, options: b.opts.map((t,i) => ({ id: `opt_${b.id}_${i}`, text: t })) })) } } });
const dnd = (q, sentence, pool, order) => { const targets = order.map((w,i)=>({id:`t${i+1}`,text:`[${i+1}]`,correctOptionId:`w${pool.indexOf(w)+1}`})), optionsPool = pool.map((t,i)=>({id:`w${i+1}`,text:t})); return { type:'DRAG_AND_DROP_INTO_TEXT', title:q, question:q, choices:[], model:{dragDropText:{sentence,targets,optionsPool}} }; };
const shortAnswer = (q) => ({ type: 'SHORT_ANSWER', title: q, question: q, choices: [] });
const diy = (q, et, rubric) => ({ type: 'DIY_PROJECT', title: q, question: q, evidenceTypes: et, rubric: rubric||'', choices: [] });

// ─── Lessons ─────────────────────────────────────────────────────────────────

const LESSONS = [

// ── L01: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Pesca Seletiva: Malhas, Tamanhos Mínimos e Espécies Protegidas',
    video: {
        title: 'Pesca Seletiva: Malhas, Tamanhos Mínimos e Espécies Protegidas',
        url: 'https://www.youtube.com/watch?v=JlFiAhG7X_A',
        description: 'Por que respeitar o tamanho mínimo de captura e o tamanho de malha garante a pesca futura. Espécies protegidas no Amapá: pirarucu, quelônios, boto-cor-de-rosa, peixe-boi. Manejo comunitário do pirarucu como modelo de pesca sustentável. Período de defeso — respeitar hoje para pescar amanhã.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Pesca Seletiva e Espécies Protegidas',
    description: 'Teste seus conhecimentos sobre tamanho mínimo de captura, tamanho de malha permitido, espécies protegidas do Amapá e manejo comunitário do pirarucu.',
    fcType: 'quiz',
    questions: [
        mc1('Por que redes com malha menor que o permitido por lei são proibidas no Amapá?',
            ['Porque a malha pequena captura muito pescado de uma vez — a legislação protege os pequenos pescadores da concorrência dos grandes',
             'Porque capturam peixes jovens antes de reproduzirem — retirando os filhotes antes da primeira desova, o estoque pesqueiro colapsa em poucos anos',
             'Porque a malha pequena danifica o ecossistema aquático e mata corais e espécies de fundo',
             'Porque a lei federal fixou um padrão único de malha para facilitar a fiscalização do IBAMA'],
            1),
        mc1('Qual é o tamanho mínimo de captura do mapará (Hypophthalmus edentatus) para pesca comercial legal?',
            ['15 cm — qualquer peixe acima disso pode ser capturado',
             '20 cm — abaixo disso o peixe ainda não se reproduziu ao menos uma vez',
             '30 cm — o MAPA definiu esse tamanho para preservar adultos reprodutores',
             'Não há tamanho mínimo para o mapará — é uma espécie de pesca livre'],
            1),
        vf('Redes com malha menor que o permitido por lei são proibidas porque capturam peixes jovens antes de reproduzirem — retirando os filhotes do ciclo reprodutivo.', true),
        mc1('O pirarucu (Arapaima gigas) é a maior espécie de peixe de escama de água doce do Brasil. Qual é a forma legal de pescá-lo no Amapá?',
            ['O pirarucu é espécie proibida de captura em todo o Brasil — qualquer pesca é crime ambiental',
             'Pode ser pescado livremente o ano todo desde que o pescador tenha RGP ativo',
             'Através de planos de manejo comunitários aprovados pelo IBAMA — a comunidade define cotas anuais com base no monitoramento do estoque',
             'Apenas por empresas com licença especial do MAPA — pescador artesanal não pode capturar pirarucu'],
            2),
        vf('O boto-cor-de-rosa (Inia geoffrensis) é um mamífero aquático protegido por lei — capturar, ferir ou matar boto é crime ambiental com pena de prisão.', true),
        mc1('O que é o período de defeso e qual sua importância para a pesca artesanal?',
            ['É o período em que o pescador pode pescar à noite sem limitação de quantidade — compensa a restrição diurna',
             'É o período de proibição da pesca de determinadas espécies durante a reprodução — protege os estoques pesqueiros para garantir pesca futura',
             'É o período em que o IBAMA fecha os rios para manutenção e limpeza — sem relação com reprodução dos peixes',
             'É o período em que as colônias de pescadores organizam as feiras de pescado — defeso significa "pesca garantida"'],
            1),
        listen(
            'João usa redes com malha de 30mm onde a lei exige pelo menos 50mm para a espécie que ele pesca. Ele argumenta que captura mais peixe por saída e que isso compensa o preço baixo. Mas nos últimos anos a produção por saída caiu 40%.',
            'Por que a produção de João está caindo apesar de usar redes com malha menor?',
            ['Porque a malha pequena afasta os peixes adultos que aprendem a evitar as redes',
             'Porque a malha menor captura os filhotes antes de reproduzirem — o estoque está diminuindo progressivamente pela retirada contínua dos jovens',
             'Porque os peixes migraram para outras partes do rio por causa do calor nos últimos anos',
             'Porque outros pescadores com tecnologia melhor estão capturando os peixes antes de João'],
            1),
        mc1('Quais espécies do Amapá têm proteção especial e exigem manejo comunitário regulamentado?',
            ['Mapará e dourada — as espécies mais capturadas precisam de cota anual',
             'Pirarucu (manejo comunitário regulado), quelônios (tartarugas e tracajás) e mamíferos aquáticos (boto, peixe-boi)',
             'Apenas espécies exóticas introduzidas — espécies nativas do Amapá podem ser pescadas livremente',
             'Camarão e lagosta — crustáceos têm proteção especial diferente de peixes'],
            1),
        vf('Respeitar o tamanho mínimo de captura beneficia o próprio pescador — peixes maiores valem mais por kg e estoques saudáveis garantem pesca nas próximas décadas.', true),
        smw(
            'Complete sobre pesca seletiva e sustentabilidade:',
            'Redes com malha [[b1]] que o permitido capturam peixes jovens antes de [[b2]], reduzindo o estoque pesqueiro. O período de [[b3]] protege as espécies durante a reprodução. O pirarucu só pode ser pescado legalmente por meio de planos de [[b4]] comunitários aprovados pelo IBAMA.',
            [
                { id: 'b1', opts: ['menor', 'maior', 'igual', 'diferente'], ci: 0 },
                { id: 'b2', opts: ['reproduzirem', 'crescerem', 'migrarem', 'engordarem'], ci: 0 },
                { id: 'b3', opts: ['defeso', 'safra', 'pesca', 'manejo'], ci: 0 },
                { id: 'b4', opts: ['manejo', 'pesca', 'coleta', 'extração'], ci: 0 }
            ]
        )
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Qualidade do Pescado: Do Barco à Mesa',
    video: {
        title: 'Qualidade do Pescado: Do Barco à Mesa',
        url: 'https://www.youtube.com/watch?v=h3PAVXi9w-Y',
        description: 'Como identificar peixe fresco pela aparência: olhos brilhantes e salientes, brânquias vermelhas, escamas aderentes, carne firme, odor de mar. Boas práticas no barco: matar rapidamente, eviscerar, lavar, cobrir com gelo em proporção 1:1. Por que não misturar pescado de dias diferentes prejudica toda a produção.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Qualidade Sanitária do Pescado',
    description: 'Teste seus conhecimentos sobre os sinais de pescado fresco, boas práticas de conservação a bordo e higiene no ponto de venda.',
    fcType: 'quiz',
    questions: [
        matching('Associe cada sinal com o que ele indica sobre a qualidade do pescado:', [
            { left: 'Olhos brilhantes, salientes e com pupila escura', right: 'Peixe fresco — colhido há poucas horas' },
            { left: 'Olhos opacos, afundados e leitosos', right: 'Peixe em deterioração — não deve ser vendido' },
            { left: 'Brânquias vermelhas e úmidas', right: 'Indicador de frescor — sangue ainda oxigenado' },
            { left: 'Brânquias marrons ou cinzas e com odor forte', right: 'Início de decomposição — qualidade comprometida' }
        ]),
        vf('Guardar peixe novo junto com peixe pescado no dia anterior na mesma caixa é uma boa prática de conservação.', false),
        listenAndOrder(
            'As boas práticas no barco para conservar o pescado começam com higienizar o porão antes de sair para a pesca. Depois matar o peixe rapidamente para reduzir o sofrimento e preservar a textura. Em seguida eviscerar o peixe no barco. Depois lavar com água limpa. Por último cobrir com gelo na proporção de 1 kg de gelo para cada 1 kg de peixe.',
            'Ouça e ordene as boas práticas de conservação do pescado a bordo:',
            ['Higienizar o porão antes de sair',
             'Matar o peixe rapidamente',
             'Eviscerar no barco',
             'Lavar com água limpa',
             'Cobrir com gelo (proporção 1:1)']
        ),
        mc1('Por que matar o peixe rapidamente logo após a captura melhora a qualidade do produto?',
            ['Porque peixes mortos rapidamente não soltam a gosma que escorrega e dificulta o manuseio',
             'Porque o estresse reduz o glicogênio muscular — matar rapidamente preserva a textura, retarda a deterioração e garante carne mais firme e saborosa',
             'Porque peixes vivos no barco consomem oxigênio e contaminam os outros com CO₂',
             'Porque a legislação da ANVISA exige abate imediato de todos os animais capturados para venda'],
            1),
        mc1('Qual é o sinal de odor que indica que o peixe está fresco e próprio para consumo?',
            ['Odor forte de peixe — quanto mais intenso o cheiro, mais fresco',
             'Odor neutro ou levemente marinho/fluvial — peixe fresco não tem cheiro forte',
             'Odor de amônia leve — indica que o processo de maturação está correto',
             'Ausência total de odor — peixe sem cheiro é sinal de que foi congelado imediatamente'],
            1),
        mc1('Por que eviscerar (retirar as vísceras) o peixe ainda no barco melhora a conservação?',
            ['Porque o peixe eviscerado pesa menos e economiza gelo no transporte',
             'Porque as vísceras contêm bactérias e enzimas que aceleram a decomposição da carne — retirá-las no barco reduz drasticamente a velocidade de deterioração',
             'Porque a legislação da ANVISA proíbe a venda de peixe inteiro sem evisceração prévia em todo o Brasil',
             'Porque o peixe eviscerado absorve melhor o gelo e fica mais frio mais rápido'],
            1),
        vf('Carne de peixe fresco deve ser firme e elástica — ao pressionar com o dedo, a marca some rapidamente.', true),
        mc1('Qual é a proporção correta de gelo por kg de pescado para conservação adequada durante a pescaria e o transporte?',
            ['0,3 kg de gelo para cada 1 kg de peixe — gelo em excesso "queima" o peixe',
             '1 kg de gelo para cada 1 kg de peixe (proporção 1:1) — mantém a temperatura abaixo de 4°C e preserva a qualidade',
             '3 kg de gelo para cada 1 kg de peixe — quanto mais gelo, melhor',
             'Não há proporção definida — basta cobrir o peixe com gelo suficiente para não ver o pescado'],
            1),
        dnd(
            'Complete as exigências mínimas de higiene no ponto de venda do pescado:',
            '[1] limpa, [2] suficiente, [3] separado por espécie, sem misturar com [4] de dias anteriores.',
            ['pescado', 'caixa', 'gelo', 'pescado'],
            ['caixa', 'gelo', 'pescado', 'pescado']
        ),
        mc1('Por que o peixe com olhos opacos, afundados e leitosos não deve ser vendido?',
            ['Porque olhos opacos indicam que o peixe é de espécie protegida e não pode ser comercializado',
             'Porque é sinal de deterioração avançada — o peixe está em decomposição e seu consumo pode causar intoxicação alimentar',
             'Porque olhos opacos significam que o peixe morreu de doença natural e não foi capturado — é proibido vender peixe que morreu sem ser pescado',
             'Porque a ANVISA classifica peixes com olhos opacos como "categoria B" e exige embalagem especial para venda'],
            1)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'Acordos de Pesca e as RESEX no Amapá',
    reading: {
        title: 'Acordos de Pesca e as RESEX no Amapá',
        body: `<h2>Acordos de Pesca e as RESEX no Amapá</h2>

<p>O pescador artesanal do Amapá tem na legislação ambiental um aliado — não apenas um fiscalizador. As RESEX (Reservas Extrativistas) e os Acordos de Pesca são instrumentos criados para garantir que as comunidades tradicionais tenham direito exclusivo e duradouro sobre os recursos pesqueiros de seu território.</p>

<h3>O que é um Acordo de Pesca?</h3>

<p>Um Acordo de Pesca é uma norma criada pela própria comunidade de pescadores para regular o uso dos recursos pesqueiros locais. Ele define:</p>

<ul>
<li>Quais espécies podem ser capturadas e em quais quantidades</li>
<li>Quais petrechos são permitidos (redes, tamanho de malha, anzóis)</li>
<li>Quem pode pescar na área (pescadores locais × externos)</li>
<li>Como o acordo é fiscalizado pelos próprios comunitários</li>
</ul>

<p><strong>Como é criado:</strong> a comunidade se reúne, discute as regras com apoio do IBAMA e do RURAP, formaliza o texto e apresenta à autoridade competente. O Acordo de Pesca tem força legal e pode impedir a entrada de barcos de fora na área.</p>

<h3>Manejo Comunitário do Pirarucu</h3>

<p>O pirarucu (Arapaima gigas) é o maior peixe de escama de água doce do Brasil — pode chegar a 3 metros e 200 kg. Durante décadas foi pescado predatoriamente e entrou em risco de extinção. Hoje, no Amapá e na Amazônia, o modelo de manejo comunitário regulado pelo IBAMA permite:</p>

<ul>
<li>Monitoramento anual do estoque pela própria comunidade (contagem dos pirarucus)</li>
<li>Definição de cota anual de captura com base no monitoramento (geralmente 30% do total contado)</li>
<li>Pesca exclusiva pela comunidade local — pesca ilegal de fora é crime ambiental</li>
<li>Venda com rastreabilidade — cada pirarucu tem documentação de origem</li>
</ul>

<h3>RESEX no Amapá</h3>

<p>O Amapá tem Reservas Extrativistas que garantem o direito das comunidades tradicionais sobre os recursos naturais de seu território:</p>

<ul>
<li><strong>RESEX Beija-Flor e Brilho de Fogo</strong> (Rio Anauerapucu) — pesca artesanal e extrativismo vegetal. Pescadores associados têm direito exclusivo de uso dos recursos pesqueiros dentro da reserva.</li>
<li><strong>RESEX do Rio Cajari</strong> (sul do Amapá) — castanha-do-pará e pesca artesanal. Uso sustentável com plano de gestão.</li>
</ul>

<p><strong>O que a RESEX garante ao pescador:</strong></p>
<ul>
<li>Direito de uso exclusivo dos recursos pesqueiros dentro da área demarcada</li>
<li>Proteção legal contra invasão de barcos de outras regiões ou de pesca predatória</li>
<li>Acesso prioritário a políticas públicas: crédito, ATER, Seguro-Defeso</li>
<li>Participação na gestão da reserva — os moradores integram o Conselho Deliberativo</li>
</ul>

<h3>Pescador como Guardião dos Rios</h3>

<p>O pescador artesanal que conhece os rios, os ciclos dos peixes e os acordos de pesca da sua comunidade é o principal guardião dos recursos pesqueiros do Amapá. Sem o conhecimento e a vigilância do pescador local, a fiscalização do IBAMA sozinha não consegue proteger os rios.</p>

<p>Práticas que o pescador guardião adota:</p>
<ul>
<li>Respeita os tamanhos mínimos e o defeso — mesmo quando outros não respeitam</li>
<li>Avisa o IBAMA ou a colônia quando vê pesca ilegal na área</li>
<li>Participa do monitoramento comunitário dos estoques pesqueiros</li>
<li>Registra no app Rota Viva a redução de espécies observadas</li>
</ul>

<p><em>Fonte: IBAMA, ICMBio, RURAP-AP, MPA (Ministério da Pesca e Aquicultura), Colônia Z-3 Macapá (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Acordos de Pesca e RESEX',
    description: 'Teste seus conhecimentos sobre Acordos de Pesca comunitários, manejo do pirarucu, RESEX do Amapá e o papel do pescador como guardião dos rios.',
    fcType: 'quiz',
    questions: [
        mc1('O que é um Acordo de Pesca e quem o cria?',
            ['É um contrato firmado com atravessadores para garantir preço mínimo ao pescador artesanal',
             'É uma norma criada pela própria comunidade de pescadores para regular o uso dos recursos pesqueiros locais — petrechos, espécies, quantidades e quem pode pescar na área',
             'É uma lei federal que define o tamanho mínimo de captura para cada espécie em todo o Brasil',
             'É um acordo entre a colônia de pescadores e o IBAMA para definir as cotas anuais de captura por pescador'],
            1),
        vf('Um Acordo de Pesca criado pela comunidade tem força legal e pode impedir a entrada de barcos de fora na área delimitada.', true),
        mc1('Como funciona o manejo comunitário do pirarucu no Amapá?',
            ['A comunidade captura todo o pirarucu que encontrar e distribui igualmente entre os moradores ao final do ano',
             'A comunidade monitora anualmente o estoque (conta os pirarucus), define uma cota de captura de 30% do total e faz a pesca exclusiva pelos moradores com rastreabilidade',
             'O IBAMA define a cota anual com base em satélite e distribui licenças individuais de pesca para cada pescador cadastrado',
             'O pirarucu só pode ser capturado por cooperativas com SIF — pescadores individuais não podem participar do manejo'],
            1),
        vf('A RESEX (Reserva Extrativista) garante ao pescador artesanal o direito de uso exclusivo dos recursos pesqueiros dentro da área demarcada — excluindo a pesca predatória de barcos externos.', true),
        mc1('Qual RESEX do Amapá combina pesca artesanal e castanha-do-pará como fontes de renda tradicionais?',
            ['RESEX Beija-Flor e Brilho de Fogo — localizada no Rio Anauerapucu',
             'RESEX do Rio Cajari — localizada no sul do Amapá, integrando pesca e extrativismo vegetal',
             'RESEX Maracá-Jipioca — localizada no litoral norte, foco exclusivo na pesca marinha',
             'RESEX do Lago do Amapá — localizada próxima a Macapá, foco na aquicultura'],
            1),
        listen(
            'Pedro é pescador na comunidade ribeirinha do Rio Anauerapucu. Barcos de outras cidades entraram na área onde a comunidade tem Acordo de Pesca registrado e estão pescando sem autorização. O estoque de dourada está caindo visivelmente.',
            'O que Pedro pode fazer para proteger os recursos pesqueiros da sua comunidade?',
            ['Nada — o Acordo de Pesca não tem poder para impedir barcos de fora, apenas recomenda',
             'Acionar o IBAMA informando a localização e identificação dos barcos invasores — o Acordo de Pesca dá base legal para fiscalização e apreensão',
             'Negociar diretamente com os barcos invasores para dividir o pescado capturado na área',
             'Suspender a pesca na área até os barcos irem embora — é mais seguro não entrar em conflito'],
            1),
        mc1('Por que o modelo de manejo comunitário do pirarucu é considerado um exemplo de sucesso de conservação pesqueira?',
            ['Porque eliminou totalmente a pesca do pirarucu no Amapá — sem pesca, o estoque se recuperou',
             'Porque combina conservação com geração de renda — a comunidade monitora o estoque, pesca dentro de uma cota sustentável e recebe mais pelo produto rastreável',
             'Porque o IBAMA assumiu toda a responsabilidade pelo pirarucu e proibiu a pesca artesanal para proteger a espécie',
             'Porque o pirarucu foi introduzido em tanques de aquicultura e não precisa mais ser pescado nos rios naturais'],
            1),
        matching('Associe cada instrumento de gestão pesqueira com sua principal função:', [
            { left: 'Acordo de Pesca comunitário', right: 'Regula o uso dos recursos locais — define quem pesca, o quê e como' },
            { left: 'RESEX (Reserva Extrativista)', right: 'Garante direito territorial exclusivo das comunidades tradicionais sobre os recursos' },
            { left: 'Período de defeso', right: 'Proíbe a pesca durante a reprodução das espécies para proteger os estoques' },
            { left: 'Plano de manejo do pirarucu', right: 'Monitoramento anual do estoque + cota de captura sustentável pela comunidade' }
        ]),
        vf('O pescador artesanal que denuncia a pesca ilegal em sua área ao IBAMA é um guardião dos rios — sua ação protege o estoque que garante sua renda futura.', true),
        mc1('Qual é a cota de captura geralmente adotada no manejo comunitário do pirarucu para garantir sustentabilidade?',
            ['10% do total contado no monitoramento anual — cota muito conservadora para recuperar o estoque',
             '30% do total contado no monitoramento anual — equilibra conservação com geração de renda para a comunidade',
             '50% do total contado — divide igualmente entre o que é pescado e o que permanece para reprodução',
             '70% do total contado — quanto mais pesca, mais renda para a comunidade e mais incentivo ao manejo'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Relação com os Rios e os Recursos',
    description: 'Conte como você cuida dos rios e dos recursos pesqueiros — suas respostas ajudam o MDA a entender o cenário ambiental da pesca artesanal no Amapá.',
    fcType: 'listen',
    questions: [
        mc1('Você respeita o tamanho mínimo de captura e o tamanho de malha permitido nas suas pescarias?',
            ['Sempre — respeito todas as normas de pesca seletiva', 'Na maioria das vezes, mas nem sempre é possível',
             'Às vezes — depende da demanda e do preço do pescado', 'Não conheço as normas de tamanho mínimo e malha da minha região'],
            0),
        mc1('Você já observou redução de alguma espécie nos rios da sua região nos últimos anos?',
            ['Sim, já notei redução clara de uma ou mais espécies', 'Tenho a impressão de que reduziu mas não tenho certeza',
             'Não notei redução — os estoques parecem estáveis', 'Nunca prestei atenção nisso'],
            0),
        mc1('Existe algum Acordo de Pesca ou regra comunitária de uso dos recursos pesqueiros na sua região?',
            ['Sim, existe Acordo de Pesca formalizado e registrado', 'Existe uma regra informal entre os pescadores locais',
             'Não existe nenhum acordo ou regra na minha área', 'Não sei se existe'],
            0),
        shortAnswer('Qual espécie de peixe você já observou redução nos rios da sua região? Quando começou essa redução?'),
        shortAnswer('O que você faria diferente na sua prática de pesca para proteger os recursos para as próximas gerações?')
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Registro de Boas Práticas',
    description: 'Registre uma prática de cuidado com o pescado ou com o rio e ganhe um cristal — cada ação consciente contribui para a sustentabilidade da pesca artesanal.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto que mostre cuidado com a qualidade ou com o ambiente: caixas de pescado com gelo adequado, peixe fresco na caixa, barco limpo e organizado, ou um rio ou área de pesca que você protege. Se quiser, escreva uma prática que você já adota para proteger os recursos pesqueiros da sua região.',
            ['photo'],
            'Foto de caixas de gelo com pescado fresco, barco organizado, área de pesca preservada, ou ação de cuidado com os rios da região.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo E',
    description: 'Revise todos os temas do Módulo E: pesca seletiva, qualidade sanitária do pescado, Acordos de Pesca e RESEX no Amapá.',
    fcType: 'review',
    questions: [
        mc1('Por que respeitar o tamanho mínimo de captura é fundamental para o futuro da pesca?',
            ['Para obedecer à legislação e evitar multas do IBAMA — a questão é apenas legal',
             'Para garantir que os peixes se reproduzam ao menos uma vez antes de serem capturados — estoques saudáveis garantem pesca nas próximas décadas',
             'Para melhorar o preço do produto — peixe maior vale mais, então o pescador ganha mais ao esperar crescer',
             'Para facilitar o transporte — peixes maiores são mais fáceis de manusear e conservar'],
            1),
        vf('Guardar peixe novo junto com peixe pescado no dia anterior na mesma caixa é uma prática segura e econômica.', false),
        matching('Associe cada sinal visual com a condição do peixe:', [
            { left: 'Olhos brilhantes, salientes, pupila escura', right: 'Peixe fresco — próprio para consumo e venda' },
            { left: 'Brânquias vermelhas e úmidas', right: 'Frescor — sangue ainda oxigenado, deterioração não iniciada' },
            { left: 'Odor forte de amônia', right: 'Deterioração avançada — não deve ser comercializado' },
            { left: 'Carne flácida que não retorna após pressão', right: 'Início de decomposição — qualidade comprometida' }
        ]),
        mc1('Qual é a proporção correta de gelo por kg de pescado para conservação?',
            ['0,5 kg de gelo para cada 1 kg de peixe', '1 kg de gelo para cada 1 kg de peixe (proporção 1:1)',
             '2 kg de gelo para cada 1 kg de peixe', 'Sem proporção definida — basta o peixe estar coberto'],
            1),
        mc1('O que é um Acordo de Pesca comunitário?',
            ['Um contrato com atacadistas para garantir preço mínimo ao pescador durante o defeso',
             'Uma norma criada pela própria comunidade para regular quem pesca, o quê, com que petrecho e em quais quantidades na área local',
             'Uma lei federal que define cotas anuais de captura por espécie para cada estado',
             'Um acordo entre a colônia de pescadores e o IBAMA para reduzir conflitos com a fiscalização'],
            1),
        vf('O pirarucu pode ser pescado legalmente no Amapá através de planos de manejo comunitários aprovados pelo IBAMA — com monitoramento anual e cota de 30% do estoque contado.', true),
        mc1('Qual é o sinal de que o peixe está fresco e próprio para consumo e venda?',
            ['Odor forte e característico de peixe — quanto mais intenso, mais fresco',
             'Olhos brilhantes e salientes, brânquias vermelhas, escamas aderentes, carne firme e odor neutro ou levemente fluvial',
             'Barriga levemente inchada e cor da pele mais intensa — sinal de peixe bem nutrido',
             'Peixe que ainda se move dentro da caixa — apenas peixes vivos são considerados frescos para venda'],
            1),
        smw(
            'Complete sobre boas práticas no barco:',
            'Após capturar o peixe, matar [[b1]], eviscerar no [[b2]], lavar com água [[b3]] e cobrir com [[b4]] na proporção 1:1. Nunca misturar pescado de dias [[b5]].',
            [
                { id: 'b1', opts: ['rapidamente', 'lentamente', 'com sal', 'com gelo'], ci: 0 },
                { id: 'b2', opts: ['barco', 'porto', 'mercado', 'rio'], ci: 0 },
                { id: 'b3', opts: ['limpa', 'salgada', 'quente', 'do rio'], ci: 0 },
                { id: 'b4', opts: ['gelo', 'sal', 'água', 'gelo picado'], ci: 0 },
                { id: 'b5', opts: ['diferentes', 'iguais', 'frescos', 'frios'], ci: 0 }
            ]
        ),
        mc1('O que a RESEX (Reserva Extrativista) garante ao pescador artesanal do Amapá?',
            ['Renda mensal garantida pelo governo durante todo o ano, inclusive no defeso',
             'Direito de uso exclusivo dos recursos pesqueiros dentro da área demarcada, com proteção legal contra invasão de barcos externos',
             'Isenção total de impostos sobre a venda do pescado capturado dentro da reserva',
             'Licença especial para capturar espécies protegidas dentro da reserva sem precisar do IBAMA'],
            1),
        mc1('Por que o pescador artesanal é considerado o principal guardião dos rios do Amapá?',
            ['Porque recebe salário do governo para fiscalizar o cumprimento das normas pesqueiras',
             'Porque conhece os ciclos dos peixes, os acordos de pesca e observa diariamente o que acontece nos rios — sua vigilância é insubstituível para a fiscalização do IBAMA',
             'Porque tem poder legal para prender barcos que pescam ilegalmente na sua área',
             'Porque é o único autorizado a pescar no Amapá — todos os outros precisam de licença especial'],
            1)
    ]
}

];

async function seedLesson(moduleId, lesson, idx) {
    console.log(`\n── Lição ${idx + 1}: ${lesson.title}`);
    const lessonId = await createFolder(lesson.title, 'lesson', moduleId);
    if (lesson.video) {
        const v = lesson.video;
        await linkContent(lessonId, await createVideo(v.title, v.url, v.description), 'video', v.title);
    } else if (lesson.reading) {
        await linkContent(lessonId, await createReading(lesson.reading.title, lesson.reading.body), 'reading', lesson.reading.title);
    } else {
        const fcType = lesson.fcType || 'quiz';
        const quizId = await createQuiz(lesson.title, lesson.description);
        console.log('  Questões: ');
        for (let i = 0; i < lesson.questions.length; i++) await createQuestion(quizId, i + 1, lesson.questions[i]);
        await linkContent(lessonId, quizId, fcType, lesson.title);
    }
}

async function main() {
    console.log('🐟 Seed — Rota da Pesca: Módulo E — Guardiões dos Rios\n');
    const moduleId = await createFolder('Módulo E — Guardiões dos Rios', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log(`\n\n✅ Módulo E — Rota da Pesca criado!\n   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

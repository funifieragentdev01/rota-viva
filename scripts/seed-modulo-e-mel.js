/**
 * seed-modulo-e-mel.js
 * Cria o Módulo E — Cuide da Colmeia, Cuide do Planeta na Rota do Mel.
 * Temas: saúde das abelhas (varroa, loque, medicamentos), boas práticas na casa de mel, flora apícola da Caatinga
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-e-mel.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';
const SUBJECT_ID = '69c9336fdf494d3199c2a6ba';

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
    title: 'Saúde das Colmeias: Varroa, Loque e Medicamentos',
    video: {
        title: 'Saúde das Colmeias: Varroa, Loque e Medicamentos',
        url: 'https://www.youtube.com/watch?v=JlFiAhG7X_A',
        description: 'As principais ameaças à saúde das colmeias no Piauí: Varroa destructor (ácaro externo), loque americana e europeia (doenças bacterianas). Como identificar sinais precoces, quando e como tratar, quais medicamentos são permitidos e o que é período de carência.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Saúde das Colmeias',
    description: 'Teste seus conhecimentos sobre Varroa destructor, loque americana, loque europeia e o uso correto de medicamentos veterinários apícolas.',
    fcType: 'quiz',
    questions: [
        mc1('O que é a Varroa destructor e por que é considerada a maior ameaça à apicultura mundial?',
            ['É um fungo que destrói os favos de mel — o colmeal perde a produção em uma safra',
             'É um ácaro externo que parasita abelhas adultas e pupas, enfraquecendo a colmeia e transmitindo vírus como o Vírus da Asa Deformada',
             'É uma bactéria que contamina o mel e provoca intoxicação alimentar nos consumidores',
             'É uma vespa invasora que ataca e mata as abelhas na entrada das colmeias'],
            1),
        vf('A Varroa destructor se reproduz dentro das células operculadas (fechadas) das pupas — por isso o tratamento deve eliminar tanto ácaros em abelhas adultas quanto em pupas.', true),
        mc1('Qual é o sinal mais visível de infestação grave por Varroa nas colmeias?',
            ['Mel com cheiro azedo e coloração escura — a varroa fermenta o néctar',
             'Abelhas adultas com asas deformadas ou incompletas saindo das células — sintoma do Vírus da Asa Deformada transmitido pela varroa',
             'Favos com larvas negras e odor podre — a varroa mata as larvas antes de opercularem',
             'Rainha parando de botar ovos repentinamente — a varroa ataca preferencialmente a rainha'],
            1),
        mc1('Qual é o momento correto para tratar a Varroa na colmeia?',
            ['Quando o apicultor já perdeu mais da metade das abelhas — antes disso o tratamento não é necessário',
             'Quando a infestação superar o nível de dano econômico (geralmente 2–3% das abelhas adultas infestadas) — prevenir o colapso',
             'Sempre, o ano todo, de forma preventiva — a varroa está sempre presente e o tratamento nunca faz mal',
             'Nunca — a Apis mellifera africanizada do Brasil resistiu à varroa e não precisa de tratamento'],
            1),
        vf('A loque americana (Paenibacillus larvae) é uma doença bacteriana de notificação obrigatória ao MAPA — o apicultor que detectar deve comunicar imediatamente ao serviço veterinário oficial.', true),
        mc1('Como diferenciar a loque americana da loque europeia em campo?',
            ['A loque americana ataca colmeias fracas no inverno; a europeia ataca colmeias fortes no verão',
             'Na loque americana as larvas morrem após operculação — o favo tem tampas afundadas e perfuradas; na europeia as larvas morrem antes de opercularem, com odor azedo',
             'A loque americana é causada por vírus; a europeia por ácaro — o tratamento é o mesmo para as duas',
             'Não há diferença prática — as duas doenças têm o mesmo aspecto visual e o mesmo tratamento'],
            1),
        listen(
            'Carlos abriu a colmeia e notou que algumas células operculadas tinham tampas afundadas e escuras. Ao puxar com um palito, a larva formou um fio elástico — como borracha. O cheiro era forte e desagradável.',
            'O que Carlos provavelmente encontrou na colmeia e o que deve fazer imediatamente?',
            ['Sinal de loque europeia — deve alimentar as abelhas com xarope de açúcar para fortalecer a colmeia',
             'Sinal clássico de loque americana — deve isolar a colmeia, comunicar ao serviço veterinário e nunca reutilizar o material contaminado',
             'Colmeia sem rainha — a rainha morreu e as operárias botaram ovos que desenvolveram anormalmente',
             'Sinal de varroa grave — a varroa está destruindo as pupas antes de completarem o desenvolvimento'],
            1),
        mc1('O que é "período de carência" no uso de medicamentos apícolas e por que é fundamental respeitá-lo?',
            ['É o tempo mínimo que o medicamento leva para fazer efeito na colmeia — tratar antes não funciona',
             'É o intervalo após o tratamento durante o qual o mel NÃO pode ser colhido — resíduos do medicamento ainda estão presentes e contaminariam o produto',
             'É o período anual em que o MAPA proíbe qualquer tratamento apícola para preservar a qualidade do mel nacional',
             'É o tempo de validade do medicamento — usar após a data de validade não tem efeito sobre a varroa'],
            1),
        vf('Qualquer antibiótico pode ser usado nas colmeias durante a produção de mel para prevenir doenças bacterianas — o MAPA permite o uso preventivo.', false),
        mc1('Qual prática previne a entrada de loque americana em colmeias saudáveis?',
            ['Alimentar artificialmente as colmeias com xarope de açúcar o ano todo para manter as abelhas fortes',
             'Nunca reutilizar caixas, quadros ou favos de colmeias doentes em colmeias saudáveis — o esporo da loque americana sobrevive décadas no material',
             'Usar antibióticos preventivamente na alimentação artificial a cada 30 dias durante o verão',
             'Pintar as colmeias com cal todos os anos para eliminar esporos na superfície externa'],
            1),
        smw(
            'Complete sobre o manejo sanitário das colmeias:',
            'A Varroa destructor é um [[b1]] que se reproduz nas células [[b2]] das abelhas. A loque americana é uma [[b3]] de notificação obrigatória ao MAPA. O uso de medicamentos sem prescrição pode deixar [[b4]] no mel, contaminando o produto.',
            [
                { id: 'b1', opts: ['ácaro', 'fungo', 'bactéria', 'vírus'], ci: 0 },
                { id: 'b2', opts: ['operculadas', 'abertas', 'rainha', 'mel'], ci: 0 },
                { id: 'b3', opts: ['doença', 'praga', 'ácaro', 'vespa'], ci: 0 },
                { id: 'b4', opts: ['resíduos', 'esporos', 'ácaros', 'fungos'], ci: 0 }
            ]
        )
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Boas Práticas na Casa de Mel',
    video: {
        title: 'Boas Práticas na Casa de Mel',
        url: 'https://www.youtube.com/watch?v=h3PAVXi9w-Y',
        description: 'Como extrair, processar e armazenar mel com qualidade: EPI limpo, ambiente fechado, equipamentos higienizados, desoperculação correta, centrifugação, coagem, decantação de 24–48h e envase. Por que a cristalização não é defeito e como armazenar para evitar fermentação.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Boas Práticas na Casa de Mel',
    description: 'Teste seus conhecimentos sobre a sequência correta de extração higiênica, armazenamento do mel e as condições que causam fermentação e cristalização.',
    fcType: 'quiz',
    questions: [
        listenAndOrder(
            'O processo correto de extração higiênica do mel começa com lavar as mãos e os equipamentos. Depois usar EPI limpo — roupa, luvas e véu. Em seguida desopercular os favos em ambiente fechado, longe de poeira e outras abelhas. Então centrifugar. Depois coar o mel para retirar cera e impurezas. Então decantar por 24 a 48 horas para as impurezas subirem à superfície. Por último envasar nos potes limpos e rotulados.',
            'Ouça e ordene o processo correto de extração higiênica do mel:',
            ['Lavar mãos e equipamentos',
             'Usar EPI limpo (roupa, luvas, véu)',
             'Desopercular em ambiente fechado',
             'Centrifugar',
             'Coar',
             'Decantar 24–48h',
             'Envasar nos potes limpos']
        ),
        vf('O mel pode ser extraído ao ar livre em dias de vento forte — a exposição ao ambiente não prejudica a qualidade do produto.', false),
        mc1('Qual é a temperatura ideal para armazenar mel e manter sua qualidade por mais tempo?',
            ['Abaixo de 0°C (refrigerado) — o frio elimina esporos e bactérias que deterioram o mel',
             'Entre 18°C e 24°C em local seco, arejado e longe da luz solar direta',
             'Qualquer temperatura ambiente — o mel não estraga por ser naturalmente conservante',
             'Acima de 40°C para manter o mel sempre líquido e fácil de envasar'],
            1),
        vf('O mel cristalizado é mel estragado e deve ser descartado — a cristalização é sinal de contaminação por açúcar.', false),
        mc1('O que causa a fermentação do mel e como prevenir?',
            ['A fermentação é causada por abelhas doentes — mel de colmeia saudável nunca fermenta',
             'A fermentação ocorre quando o mel tem umidade acima de 20% — colher mel maduro (com ao menos 80% das células operculadas) e armazenar em recipientes bem fechados',
             'A fermentação é causada pelo contato com metal — usar sempre potes de vidro, nunca baldes metálicos',
             'A fermentação não tem como ser prevenida — é um processo natural que ocorre após 6 meses de armazenamento'],
            1),
        mc1('Como reverter a cristalização do mel sem perder suas propriedades?',
            ['Ferver o mel por 5 minutos — o calor dissolve os cristais sem alterar a qualidade',
             'Aquecer em banho-maria a no máximo 40°C — dissolve os cristais sem destruir enzimas e propriedades do mel',
             'Adicionar água e misturar bem — o mel absorve a umidade e volta ao estado líquido naturalmente',
             'A cristalização é irreversível — o mel cristalizado deve ser processado industrialmente ou descartado'],
            1),
        matching('Associe cada prática de BPF na casa de mel com seu objetivo:', [
            { left: 'Decantar 24–48h antes de envasar', right: 'Impurezas e cera sobem à superfície e são retiradas' },
            { left: 'Extrair em ambiente fechado e telado', right: 'Evita contaminação por poeira, moscas e outras abelhas' },
            { left: 'Usar EPI limpo na extração', right: 'Previne contaminação por cabelos, suor e microrganismos' },
            { left: 'Coar com peneira fina após centrifugar', right: 'Remove fragmentos de cera e pólen grosso do mel' }
        ]),
        vf('O EPI (véu, roupa, luvas) usado na extração do mel deve estar limpo e higienizado — resíduos de manejo podem contaminar o produto.', true),
        mc1('Por que o mel com umidade acima de 20% corre risco de fermentar?',
            ['Porque a umidade alta ativa as enzimas naturais do mel, que transformam os açúcares em álcool',
             'Porque leveduras osmofílicas naturalmente presentes no mel se multiplicam em alta umidade e fermentam os açúcares, acidificando e deteriorando o produto',
             'Porque a água acima de 20% dilui o mel e reduz a concentração de antibióticos naturais que impedem a fermentação',
             'Porque o mel com mais de 20% de umidade reage com o oxigênio do ar e oxida — gerando sabor e odor ruins'],
            1),
        dnd(
            'Complete a regra de ouro do armazenamento do mel:',
            'Armazenar em local [1], [2] e [3], em recipientes bem [4], longe de [5] e produtos com odor forte.',
            ['fechados', 'fresco', 'seco', 'escuro', 'luz solar direta'],
            ['fresco', 'seco', 'escuro', 'fechados', 'luz solar direta']
        ),
        mc1('Qual é o sinal de que o favo está maduro e o mel pronto para ser colhido?',
            ['A cor do mel mudou de âmbar claro para âmbar escuro — o mel escuro é sinal de maturidade completa',
             'Pelo menos 80% das células do favo estão operculadas (tampadas com cera branca) — as abelhas tampar quando o mel atingiu umidade adequada',
             'As abelhas começam a sair em grande número da colmeia — sinal de que a colmeia está cheia e o mel está pronto',
             'O mel começa a escorrer pelos quadros — indica que a umidade baixou o suficiente para extração'],
            1)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'O Apicultor como Guardião da Caatinga',
    reading: {
        title: 'O Apicultor como Guardião da Caatinga',
        body: `<h2>O Apicultor como Guardião da Caatinga</h2>

<p>O apicultor piauiense não é só produtor de mel — é guardião de um ecossistema único: a Caatinga. A relação entre as abelhas e a vegetação nativa é de dependência mútua. Sem flores nativas, sem mel. Sem abelhas, as plantas não se reproduzem.</p>

<h3>Flora Apícola Nativa do Piauí</h3>

<p>As principais plantas melíferas da Caatinga piauiense são:</p>

<ul>
<li><strong>Jurema-preta (Mimosa tenuiflora):</strong> floresce de agosto a outubro — período crítico para a apicultura no Piauí. Mel de jurema tem coloração âmbar escuro e sabor intenso.</li>
<li><strong>Angico (Anadenanthera colubrina):</strong> floresce de setembro a novembro. Importante fonte de pólen proteico para criação da cria.</li>
<li><strong>Marmeleiro (Croton sonderianus):</strong> floresce quase o ano todo — uma das mais importantes para a manutenção das colmeias na entressafra.</li>
<li><strong>Velame (Croton campestris):</strong> floresce de outubro a janeiro. Mel de velame tem coloração clara e sabor suave.</li>
<li><strong>Cipó-uva (Cissus sp.):</strong> floresce de novembro a fevereiro — importante na florada de verão do semiárido.</li>
<li><strong>Catingueira (Poincianella pyramidalis):</strong> floresce de setembro a novembro. Alta produção de néctar — considerada a "rainha das floradas" em anos de boa chuva.</li>
</ul>

<h3>Abelhas como Polinizadoras da Caatinga</h3>

<p>As abelhas polinizam mais de 70% das espécies vegetais da Caatinga. Sem polinização, as plantas não produzem frutos e sementes — sem frutos, não há regeneração da vegetação nativa. Manter colmeias saudáveis é manter a Caatinga viva.</p>

<h3>Apicultura Migratória: Adaptação às Secas</h3>

<p>Em anos de seca prolongada, o apicultor pode migrar as colmeias para regiões com florada disponível — isso se chama apicultura migratória. No Piauí, os fluxos migratórios comuns são:</p>

<ul>
<li>Sertão → Cerrado piauiense (florada do murici, barbatimão)</li>
<li>Caatinga seca → Vale do Parnaíba (maior umidade, florada mais longa)</li>
</ul>

<h3>Impacto das Mudanças Climáticas</h3>

<p>As secas prolongadas no Nordeste estão aumentando em frequência e intensidade. Impactos na apicultura:</p>

<ul>
<li>Floradas mais curtas e imprevisíveis — calendário apícola instável</li>
<li>Aumento de episódios de pilhagem entre colmeias enfraquecidas</li>
<li>Maior pressão da varroa em colmeias estressadas por falta de alimento</li>
<li>Necessidade de alimentação artificial com xarope de açúcar por mais meses no ano</li>
</ul>

<h3>O Apicultor que Protege a Caatinga</h3>

<p>Práticas que o apicultor pode adotar para ser guardião do ecossistema:</p>

<ul>
<li><strong>Não derrubar vegetação nativa</strong> ao redor dos apiários — cada planta melífera é alimento para as abelhas</li>
<li><strong>Plantar mudas nativas</strong> (jurema, marmeleiro, catingueira) — em parceria com a Emater-PI e o MAPA</li>
<li><strong>Não queimar</strong> — a queimada destrói a matéria orgânica do solo, elimina flores e enfraquece o banco de sementes da Caatinga</li>
<li><strong>Participar do calendário apícola regional</strong> — registrar as floradas no app Rota Viva ajuda o MDA a mapear a saúde da Caatinga</li>
</ul>

<p><em>Fonte: Embrapa Meio-Norte, Emater-PI, SEBRAE Apicultura, CONAB (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Apicultor e a Caatinga',
    description: 'Teste seus conhecimentos sobre flora apícola nativa do Piauí, a relação entre abelhas e a Caatinga e as estratégias de adaptação às mudanças climáticas.',
    fcType: 'quiz',
    questions: [
        mc1('Qual planta da Caatinga piauiense é considerada fundamental para a apicultura e floresce de agosto a outubro — período crítico de produção?',
            ['Babaçu (Attalea speciosa) — palmeira que produz néctar abundante no verão',
             'Jurema-preta (Mimosa tenuiflora) — uma das principais fontes de néctar da apicultura piauiense na entressafra',
             'Mandacaru (Cereus jamacaru) — cactus que floresce à noite e só é visitado por morcegos',
             'Carnaúba (Copernicia prunifera) — usada apenas para cera, não produz néctar para as abelhas'],
            1),
        vf('As abelhas são responsáveis pela polinização de mais de 70% das espécies vegetais da Caatinga — sem abelhas, a regeneração natural da vegetação nativa seria gravemente comprometida.', true),
        mc1('O que é apicultura migratória e por que é uma estratégia contra a seca?',
            ['É a criação de abelhas nativas (meliponíneos) no lugar de Apis mellifera durante períodos de seca',
             'É o deslocamento das colmeias para regiões com florada disponível quando a região de origem está seca — garante alimentação natural para as abelhas e produção contínua',
             'É a migração do apicultor para outro estado durante a seca e deixar as colmeias vazias até as chuvas',
             'É o transporte do mel colhido antes da seca para armazéns refrigerados em outras regiões'],
            1),
        listen(
            'Ana cria abelhas no sertão do Piauí. Nos últimos 3 anos as chuvas atrasaram e a florada da jurema e catingueira ficou muito curta — menos de 30 dias de néctar abundante. As colmeias estão perdendo peso entre uma florada e outra e ela notou aumento de pilhagem.',
            'Que estratégias Ana pode adotar para enfrentar os impactos da seca prolongada nas colmeias?',
            ['Reduzir o número de colmeias pela metade para que as abelhas restantes tenham mais alimento disponível',
             'Combinar apicultura migratória (buscar florada em outra região), alimentação artificial nos períodos críticos e plantio de mudas nativas ao redor do apiário',
             'Instalar colmeias em locais mais elevados onde a temperatura é mais baixa e as abelhas gastam menos energia',
             'Trocar as rainhas anualmente por rainhas de linhagem importada mais resistente à seca'],
            1),
        mc1('Como o desmatamento da Caatinga afeta diretamente a produção de mel no Piauí?',
            ['Não afeta — as abelhas conseguem buscar flores em até 10 km de distância, compensando a falta de vegetação perto do apiário',
             'Reduz as fontes de néctar e pólen disponíveis — com menos flores, a produção por colmeia cai, os enxames enfraquecem e a pressão de doenças aumenta',
             'Aumenta a produção porque as abelhas ficam mais concentradas em poucas plantas e a competição melhora o néctar produzido',
             'Não há relação direta — a produção de mel depende mais do manejo do apicultor do que da vegetação ao redor'],
            1),
        vf('A queimada da vegetação nativa ao redor do apiário é uma prática que o apicultor deve evitar — destrói flores, mata abelhas e empobrece o solo que alimenta as plantas melíferas.', true),
        matching('Associe cada planta melífera com sua principal característica na apicultura piauiense:', [
            { left: 'Marmeleiro (Croton sonderianus)', right: 'Floresce quase o ano todo — sustenta colmeias na entressafra' },
            { left: 'Catingueira (Poincianella pyramidalis)', right: 'Alta produção de néctar em anos de boa chuva — a "rainha das floradas"' },
            { left: 'Angico (Anadenanthera colubrina)', right: 'Fonte de pólen proteico para criação da cria — setembro a novembro' },
            { left: 'Velame (Croton campestris)', right: 'Mel de coloração clara e sabor suave — floresce de outubro a janeiro' }
        ]),
        mc1('De que forma manter colmeias saudáveis contribui para a preservação da Caatinga?',
            ['As colmeias produzem cera que impermeabiliza o solo da Caatinga, reduzindo a evapotranspiração',
             'As abelhas polinizam as plantas nativas, garantindo a produção de frutos e sementes para regeneração natural da vegetação',
             'O mel produzido atrai animais silvestres que dispersam sementes de plantas da Caatinga pelo território',
             'O som das colmeias afasta pragas que atacam as plantas nativas, reduzindo a necessidade de agrotóxicos'],
            1),
        smw(
            'Complete sobre a relação entre abelhas e a Caatinga:',
            'As abelhas polinizam mais de [[b1]] das espécies vegetais da Caatinga. Sem polinização, as plantas não produzem [[b2]] e sementes, comprometendo a [[b3]] natural da vegetação. O apicultor que planta mudas [[b4]] e não queima protege o ecossistema que sustenta sua produção.',
            [
                { id: 'b1', opts: ['70%', '30%', '50%', '90%'], ci: 0 },
                { id: 'b2', opts: ['frutos', 'flores', 'néctar', 'pólen'], ci: 0 },
                { id: 'b3', opts: ['regeneração', 'produção', 'proteção', 'irrigação'], ci: 0 },
                { id: 'b4', opts: ['nativas', 'frutíferas', 'exóticas', 'forrageiras'], ci: 0 }
            ]
        ),
        mc1('Qual prática concreta o apicultor pode adotar para contribuir com a recuperação da Caatinga degradada ao redor do apiário?',
            ['Aplicar herbicida nas ervas daninhas ao redor das colmeias para reduzir a competição com as plantas melíferas',
             'Plantar mudas de espécies nativas melíferas (jurema, marmeleiro, catingueira) em parceria com a Emater-PI — cada nova planta é alimento futuro para as abelhas',
             'Construir cercas altas ao redor do apiário para proteger as abelhas de predadores e do vento seco da seca',
             'Instalar sistemas de irrigação no apiário para que as abelhas tenham acesso a água durante a seca'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Relação com as Colmeias e o Ambiente',
    description: 'Conte como você cuida das suas colmeias e da Caatinga ao redor — suas respostas ajudam o MDA a entender o cenário sanitário e ambiental da apicultura piauiense.',
    fcType: 'listen',
    questions: [
        mc1('Você já observou sinais de Varroa ou loque nas suas colmeias?',
            ['Sim, já tive problema confirmado e tratei', 'Já vi sinais suspeitos mas não confirmei',
             'Nunca observei nenhum sinal de doença nas colmeias', 'Não sei identificar os sinais dessas doenças'],
            0),
        mc1('Como você extrai o mel — em que tipo de ambiente?',
            ['Em ambiente fechado e higienizado (casa de mel ou local adequado)', 'Em ambiente semi-aberto (alpendre, galpão sem tela)',
             'Ao ar livre, no próprio apiário', 'Ainda não faço extração — vendo o mel em cera'],
            0),
        mc1('Como você avalia o estado da vegetação nativa ao redor das suas colmeias nos últimos anos?',
            ['Preservada — bastante vegetação nativa', 'Parcialmente preservada — houve algum desmatamento ou queimada',
             'Bastante degradada — pouca vegetação nativa restante', 'Não sei avaliar'],
            0),
        shortAnswer('Qual planta melífera é mais importante para as suas abelhas na sua região? Ela ainda existe em abundância?'),
        shortAnswer('Como a seca ou as mudanças do clima afetaram sua produção de mel nos últimos anos?')
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Registro de Manejo Sanitário',
    description: 'Registre sua casa de mel ou o interior de uma colmeia saudável e ganhe um cristal — documentar o manejo é o primeiro passo para melhorar a qualidade.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto que mostre cuidado sanitário na sua apicultura: a casa de mel limpa e organizada, quadros de cria saudável com abelhas, equipamentos higienizados prontos para extração, ou plantas melíferas nativas ao redor do apiário. Se ainda não tem casa de mel, fotografe o local de extração e escreva o que você quer melhorar.',
            ['photo'],
            'Foto da casa de mel limpa, quadros com cria saudável, EPI organizado, ou vegetação nativa próxima ao apiário.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo E',
    description: 'Revise todos os temas do Módulo E: saúde das colmeias, boas práticas na casa de mel e a relação do apicultor com a Caatinga.',
    fcType: 'review',
    questions: [
        mc1('O que é a Varroa destructor e qual o sinal mais visível de infestação grave?',
            ['É um fungo dos favos — sinal visível é mel escuro e cristalizado fora de época',
             'É um ácaro parasita das abelhas — sinal mais visível é abelhas adultas com asas deformadas saindo das células',
             'É uma bactéria da cria — sinal mais visível é larvas negras com odor podre e tampas afundadas',
             'É uma vespa invasora — sinal mais visível é entradas das colmeias cheias de abelhas mortas'],
            1),
        vf('A loque americana é uma doença bacteriana de notificação obrigatória ao MAPA — o apicultor deve comunicar imediatamente ao serviço veterinário oficial ao detectar.', true),
        mc1('O que é "período de carência" no uso de medicamentos apícolas?',
            ['O tempo mínimo que o medicamento leva para eliminar a varroa completamente',
             'O intervalo após o tratamento durante o qual o mel NÃO pode ser colhido — resíduos ainda estão presentes',
             'O período em que o MAPA proíbe tratamentos para garantir mel sem resíduos no mercado',
             'O tempo de validade do medicamento depois de aberto'],
            1),
        listenAndOrder(
            'O processo correto de extração higiênica: primeiro lavar mãos e equipamentos, depois usar EPI limpo, em seguida desopercular em ambiente fechado, então centrifugar, depois coar, então decantar 24 a 48 horas, e por último envasar.',
            'Ordene o processo correto de extração higiênica do mel:',
            ['Lavar mãos e equipamentos',
             'Usar EPI limpo',
             'Desopercular em ambiente fechado',
             'Centrifugar',
             'Coar',
             'Decantar 24–48h',
             'Envasar']
        ),
        vf('O mel cristalizado é um defeito de qualidade — significa que o mel foi adulterado com açúcar.', false),
        mc1('Qual é o indicador de que o favo está maduro e o mel pronto para ser colhido?',
            ['A cor do mel ficou âmbar escuro dentro das células',
             'Pelo menos 80% das células estão operculadas (tampadas com cera branca pelas abelhas)',
             'As abelhas saem em massa da colmeia porque está cheia demais',
             'O mel começa a escorrer pelos quadros'],
            1),
        matching('Associe cada ameaça sanitária com sua característica principal:', [
            { left: 'Varroa destructor', right: 'Ácaro — transmite vírus e causa asas deformadas nas abelhas adultas' },
            { left: 'Loque americana', right: 'Bactéria — larvas morrem após operculação, fio elástico no palito, notificação obrigatória' },
            { left: 'Loque europeia', right: 'Bactéria — larvas morrem antes de opercularem, odor azedo, tampas não afundadas' },
            { left: 'Fermentação do mel', right: 'Ocorre quando umidade do mel supera 20% — leveduras osmofílicas se multiplicam' }
        ]),
        mc1('Como as mudanças climáticas e as secas prolongadas afetam a apicultura piauiense?',
            ['Não afetam — as abelhas africanizadas são nativas do ambiente semiárido e já se adaptaram',
             'Tornam as floradas mais curtas e imprevisíveis, enfraquecem as colmeias por falta de alimento e aumentam a pressão de doenças como a varroa',
             'Aumentam a produção porque o calor acelera o metabolismo das abelhas e a produção de néctar das plantas',
             'Beneficiam a apicultura porque o aquecimento reduz a ocorrência de doenças causadas pelo frio'],
            1),
        mc1('Qual planta melífera da Caatinga é considerada a mais importante para sustentar as colmeias durante a entressafra no Piauí?',
            ['Jurema-preta — floresce de agosto a outubro, período crítico de produção',
             'Marmeleiro — floresce quase o ano todo e sustenta colmeias mesmo nos períodos mais secos',
             'Catingueira — a maior produção de néctar em anos de boa chuva',
             'Angico — principal fonte de pólen proteico para criação de cria'],
            1),
        smw(
            'Complete sobre a relação do apicultor com a Caatinga:',
            'As abelhas são responsáveis pela [[b1]] de mais de 70% das espécies vegetais da Caatinga. O apicultor que [[b2]] a vegetação nativa e planta [[b3]] protege o ecossistema que sustenta sua produção. A [[b4]] das colmeias para regiões com florada disponível é uma estratégia de adaptação à seca.',
            [
                { id: 'b1', opts: ['polinização', 'reprodução', 'proteção', 'irrigação'], ci: 0 },
                { id: 'b2', opts: ['preserva', 'derruba', 'queima', 'planta'], ci: 0 },
                { id: 'b3', opts: ['mudas nativas', 'pastagens', 'eucaliptos', 'frutíferas'], ci: 0 },
                { id: 'b4', opts: ['migração', 'divisão', 'reunião', 'eliminação'], ci: 0 }
            ]
        ),
        mc1('Por que o apicultor não deve reutilizar caixas ou quadros de colmeias com loque americana em colmeias saudáveis?',
            ['Porque os esporos da loque americana sobrevivem décadas no material contaminado e podem infectar colmeias saudáveis imediatamente',
             'Porque a loque americana contamina a madeira com um pigmento marrom que não sai nem com fogo e alerta as abelhas saudáveis',
             'Porque a legislação proíbe a reutilização de qualquer material apícola independentemente da situação sanitária da colmeia',
             'Porque o odor do material contaminado atrai a varroa de colmeias próximas, aumentando a infestação na região'],
            0)
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
    console.log('🐝 Seed — Rota do Mel: Módulo E — Cuide da Colmeia, Cuide do Planeta\n');
    const moduleId = await createFolder('Módulo E — Cuide da Colmeia, Cuide do Planeta', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log(`\n\n✅ Módulo E — Rota do Mel criado!\n   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

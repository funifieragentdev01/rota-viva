/**
 * seed-modulo-d-pesca.js
 * Cria o Módulo D — Venda Justa na Rota da Pesca.
 * Temas: custo de pesca, precificação por espécie, canais de venda, nota fiscal SEFAZ-AP, colônia/cooperativa
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-d-pesca.js
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
    title: 'Quanto Vale o Seu Pescado?',
    video: {
        title: 'Quanto Vale o Seu Pescado?',
        url: 'https://www.youtube.com/watch?v=JlFiAhG7X_A',
        description: 'Por que pescadores vendem barato: falta de cálculo do custo real da pescaria. O que entra no custo: combustível, gelo, petrechos, manutenção do barco, tempo do pescador. Como calcular o preço mínimo por kg para não ter prejuízo.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Quanto Vale o Seu Pescado?',
    description: 'Teste o que você aprendeu sobre custo de produção na pesca e como calcular o preço justo por kg de pescado.',
    fcType: 'quiz',
    questions: [
        mc1('Por que muitos pescadores vendem o pescado por um preço que não cobre o custo real da pescaria?',
            ['Porque o pescado é perecível e o pescador é obrigado a vender rápido a qualquer preço',
             'Porque não calculam o custo da pescaria e não sabem qual é o preço mínimo para não ter prejuízo',
             'Porque a colônia tabelou o preço máximo de venda e o pescador não pode cobrar mais',
             'Porque o MAPA fixou o preço do pescado fresco em todo o território nacional'],
            1),
        mc1('Quais itens entram no custo de uma saída de pesca no Amapá?',
            ['Apenas o combustível do motor de popa',
             'Combustível, gelo (proporção 1:1 com o pescado), petrechos (anzol, linha, rede), manutenção do barco, alimentação e depreciação dos equipamentos',
             'Somente o valor do barco dividido pela produção anual',
             'O custo da pesca não pode ser calculado porque depende das condições do rio e do mar'],
            1),
        vf('A depreciação do barco, motor e petrechos (redes, anzóis, linhas) deve ser incluída no custo de produção do pescado.', true),
        vf('Se o pescador não paga salário a si mesmo, o seu tempo de trabalho não precisa ser contado no custo da pescaria.', false),
        listen(
            'Pedro tem um barco de 7 metros e faz 3 saídas por semana no rio Amazonas. Em cada saída gasta R$ 80 em combustível e R$ 40 em gelo. Traz em média 40 kg de mapará e vende a R$ 4/kg. Pedro acha que está ganhando, mas esqueceu de contar a depreciação do barco, os petrechos e seu próprio trabalho.',
            'Por que Pedro pode estar tendo prejuízo mesmo achando que está lucrando?',
            ['Porque 40 kg de mapará por saída é pouca produção para um barco de 7 metros',
             'Porque não incluiu a depreciação do barco, os petrechos e seu próprio trabalho no custo — o custo real pode ser maior que R$ 4/kg',
             'Porque o preço de R$ 4/kg está acima do mercado e ele vai perder clientes para outros pescadores',
             'Porque ele deveria vender o mapará defumado e não fresco para ter mais valor'],
            1),
        smw(
            'Complete o raciocínio de precificação do pescado:',
            'O preço mínimo de venda deve cobrir todos os [[b1]] da pescaria mais uma [[b2]] de lucro. Se o custo for R$ 5/kg e a margem desejada for 40%, o preço de venda deve ser no mínimo R$ [[b3]]/kg. Vender abaixo do custo gera [[b4]].',
            [
                { id: 'b1', opts: ['custos', 'impostos', 'descontos', 'lucros'], ci: 0 },
                { id: 'b2', opts: ['margem', 'desconto', 'taxa', 'tabela'], ci: 0 },
                { id: 'b3', opts: ['7,00', '5,00', '4,00', '10,00'], ci: 0 },
                { id: 'b4', opts: ['prejuízo', 'lucro', 'capital', 'receita'], ci: 0 }
            ]
        ),
        mc1('Qual é a proporção recomendada de gelo por kg de pescado para conservação adequada durante a pescaria?',
            ['0,5 kg de gelo para cada 1 kg de pescado',
             '1 kg de gelo para cada 1 kg de pescado (proporção 1:1)',
             '2 kg de gelo para cada 1 kg de pescado',
             'O gelo só é necessário quando a temperatura passa de 35°C'],
            1),
        mc1('O que é a depreciação do barco e dos petrechos no custo da pesca?',
            ['O desconto que o comprador pede quando compra grande volume de pescado',
             'O valor que o pescador reserva para substituir equipamentos que se desgastam com o uso (barco, motor, redes, anzóis)',
             'A perda de valor do pescado quando fica em gelo por mais de 24 horas',
             'O custo com reparos emergenciais quando o barco quebra em alto mar'],
            1),
        vf('Um pescador que vende mapará a R$ 5/kg com custo de R$ 4,50/kg está tendo margem de lucro de 11% — insuficiente para cobrir imprevistos e reinvestir no barco.', true),
        mc1('Como o pescador calcula corretamente o custo por kg de pescado produzido?',
            ['Divide o valor do barco pela produção do primeiro mês',
             'Some todos os custos da saída (combustível, gelo, petrechos, alimentação, depreciação) e divida pelo total de kg pescados',
             'Pesquisa o preço do peixe na feira e desconta 30%',
             'Pergunta para outros pescadores da colônia quanto cobram e adota o mesmo preço'],
            1)
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Onde e Para Quem Vender o Pescado',
    video: {
        title: 'Onde e Para Quem Vender o Pescado',
        url: 'https://www.youtube.com/watch?v=h3PAVXi9w-Y',
        description: 'Comparativo dos canais de venda do pescado no Amapá: feira do peixe, restaurantes, supermercados, PAA, peixaria própria, cooperativa. Qual canal paga mais e o que exige. Por que diversificar compradores protege o pescador da dependência do atravessador.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Onde e Para Quem Vender',
    description: 'Avalie o que você aprendeu sobre os canais de venda do pescado, os requisitos de cada um e a estratégia de diversificação de compradores.',
    fcType: 'quiz',
    questions: [
        mc1('Qual canal de venda geralmente paga o maior preço ao pescador por kg de pescado?',
            ['Atravessador — compra tudo em volume mas paga o menor preço',
             'Venda direta ao consumidor final (feira do peixe, entrega domiciliar, WhatsApp) — sem intermediários',
             'Cooperativa de exportação — preço alto mas só aceita grandes volumes com SIF',
             'Supermercado regional — paga mais que o atravessador mas menos que a feira'],
            1),
        matching('Associe cada canal de venda com o requisito mínimo para o pescador participar:', [
            { left: 'Feira do peixe local', right: 'RGP + caixas de gelo adequadas + rótulo básico' },
            { left: 'PAA (aquisição governamental)', right: 'CAF + RGP + documentação RURAP + nota fiscal' },
            { left: 'Supermercado estadual', right: 'SIE ou SIF + nota fiscal + embalagem rastreável' },
            { left: 'Restaurante ou peixaria', right: 'RGP + nota fiscal + conservação adequada na entrega' }
        ]),
        listenAndOrder(
            'O atravessador paga o menor preço. Depois vem o intermediário local. Em seguida o supermercado pelo preço de fornecedor. Depois a feira do peixe com venda direta. Por último o restaurante ou peixaria especializada, que paga o maior preço por kg de pescado fresco de qualidade.',
            'Ouça e ordene os canais de venda do menor para o maior preço recebido pelo pescador:',
            ['Atravessador — menor preço',
             'Intermediário local',
             'Supermercado — preço de fornecedor',
             'Feira do peixe — venda direta',
             'Restaurante ou peixaria especializada — maior preço']
        ),
        vf('Depender de um único atravessador deixa o pescador vulnerável — se o atravessador sumir ou baixar o preço, toda a renda desaparece.', true),
        vf('O pescado vendido pelo PAA (Programa de Aquisição de Alimentos) precisa ter SIF obrigatório — RGP e CAF não são suficientes.', false),
        mc1('Por que restaurantes e peixarias especializadas pagam mais pelo pescado do que supermercados comuns?',
            ['Porque são obrigados por lei a comprar de pescadores com certificação MSC',
             'Porque seu cliente exige frescor, rastreabilidade e qualidade superior — pescado com origem conhecida e conservação impecável tem valor agregado',
             'Porque recebem subsídio do governo para pagar mais caro pelos produtos da pesca artesanal',
             'Porque têm estoque menor e precisam repor mais vezes — pagam mais pela conveniência do fornecedor próximo'],
            1),
        mc1('O que significa "diversificar os canais de venda" na prática para o pescador?',
            ['Vender para o maior número possível de atravessadores ao mesmo tempo para garantir escoamento',
             'Ter mais de um tipo de comprador — parte na feira, parte para restaurante, parte para o PAA — para não depender de um único cliente',
             'Mudar de canal a cada safra para encontrar sempre o melhor preço disponível',
             'Exportar 100% da produção e não vender nada no mercado local'],
            1),
        mc1('Para vender pescado para supermercados do Amapá, qual é o nível mínimo de inspeção sanitária necessário?',
            ['Nenhum — supermercados do interior do Amapá aceitam pescado sem inspeção',
             'Apenas o RGP (Registro Geral da Pesca) — basta estar regularizado no MAPA',
             'SIE (estadual) ou SIF (federal) com nota fiscal e embalagem rastreável',
             'Certificação MSC — supermercados do Amapá só compram pescado sustentável'],
            2),
        vf('O PAA (Programa de Aquisição de Alimentos) pode comprar pescado diretamente do pescador familiar com CAF, sem licitação, por chamada pública.', true),
        mc1('Qual é a principal desvantagem de vender todo o pescado para um único atravessador?',
            ['O atravessador paga mais caro por exigir exclusividade na compra',
             'O pescador perde poder de negociação — sem alternativa, aceita o preço que o atravessador oferece, geralmente abaixo do valor real',
             'A legislação proíbe contratos exclusivos entre pescadores e atravessadores no Amapá',
             'O atravessador exige SIF que a maioria dos pescadores artesanais não tem'],
            1)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'Nota Fiscal, Colônia e a Cooperativa como Parceira',
    reading: {
        title: 'Nota Fiscal, Colônia e a Cooperativa como Parceira',
        body: `<h2>Nota Fiscal, Colônia e a Cooperativa como Parceira</h2>

<p>Vender pescado com nota fiscal não é burocracia — é a diferença entre ser um pescador invisível para o mercado e ser um fornecedor confiável para restaurantes, supermercados e o governo.</p>

<h3>Nota Fiscal de Produtor Rural — Pescador</h3>

<p>A Nota Fiscal de Produtor Rural é o documento que formaliza a venda do pescado. Sem ela, o pescador não consegue vender para o PAA, supermercados nem acessar financiamentos formais.</p>

<ul>
<li><strong>Como tirar:</strong> na Secretaria de Fazenda do Amapá (SEFAZ-AP) — gratuita, com CPF, CAF, RGP e inscrição estadual de produtor</li>
<li><strong>Para que serve:</strong> comprovar a venda, garantir o pagamento formal, acumular histórico de produção para crédito rural</li>
<li><strong>Validade:</strong> o talonário tem prazo — renove antes de vencer ou use a emissão digital pelo portal da SEFAZ-AP</li>
<li><strong>Nota fiscal eletrônica:</strong> a SEFAZ-AP permite emissão digital para produtores rurais — mais prático e seguro</li>
</ul>

<h3>MEI — Microempreendedor Individual Pescador</h3>

<p>O MEI é para o pescador que quer vender para empresas, emitir nota fiscal de serviço ou ter CNPJ sem complicação.</p>

<ul>
<li><strong>Faturamento máximo:</strong> R$ 81.000/ano (atualizado em 2024)</li>
<li><strong>Contribuição mensal:</strong> R$ 70,60/mês — inclui INSS e cobertura previdenciária</li>
<li><strong>Vantagens:</strong> CNPJ, nota fiscal, aposentadoria, auxílio-doença, acesso a crédito empresarial</li>
<li><strong>Atenção:</strong> MEI e CAF podem coexistir — ter CNPJ não cancela o acesso ao PRONAF como pescador artesanal</li>
<li><strong>Como abrir:</strong> portal gov.br/mei — gratuito, em menos de 10 minutos</li>
</ul>

<h3>Colônia de Pescadores: Mais que uma Associação</h3>

<p>A colônia de pescadores é a entidade representativa do pescador artesanal no Brasil. Diferente de uma simples associação, a colônia tem papel legal no Seguro-Defeso e na formalização da atividade pesqueira.</p>

<p><strong>O que a colônia faz por você:</strong></p>
<ul>
<li>Emite a declaração para o Seguro-Defeso (auxílio durante o período proibido)</li>
<li>Representa coletivamente na negociação com compradores e órgãos públicos</li>
<li>Intermedia o acesso ao RURAP (assistência técnica) e ao PRONAF Pesca</li>
<li>Organiza o registro e a documentação dos associados junto ao MAPA</li>
</ul>

<h3>Cooperativa de Pesca: Como Ela Vende por Você</h3>

<p>A cooperativa de pesca recebe o pescado dos associados, processa, embala com SIE ou SIF e vende para supermercados, restaurantes e o governo. O pescador recebe o valor líquido depois da taxa de gestão.</p>

<p><strong>Vantagens reais:</strong></p>
<ul>
<li>Acessa SIE/SIF sem precisar ter planta industrial individual</li>
<li>Vende para clientes que exigem volume constante e rastreabilidade</li>
<li>Compra gelo, combustível e petrechos coletivamente a preço menor</li>
<li>Acessa o PRONAF coletivo com limite maior do que individualmente</li>
</ul>

<h3>Colônia vs. Cooperativa vs. Atravessador</h3>

<table>
<tr><th></th><th>Atravessador</th><th>Colônia</th><th>Cooperativa</th></tr>
<tr><td>Quem decide o preço?</td><td>Ele decide</td><td>Negocia em grupo</td><td>O mercado + custo real</td></tr>
<tr><td>Você sabe para onde vai o pescado?</td><td>Não</td><td>Parcialmente</td><td>Sim — transparência</td></tr>
<tr><td>Você participa do resultado?</td><td>Não</td><td>Indiretamente</td><td>Sim — sobras anuais</td></tr>
<tr><td>Investe em sua formação?</td><td>Não</td><td>Sim — ATER, Seguro-Defeso</td><td>Sim — serviços coletivos</td></tr>
</table>

<p><em>Fonte: SEFAZ-AP, gov.br/mei, RURAP-AP, MAPA, OCB-AP (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Nota Fiscal, Colônia e Cooperativa',
    description: 'Teste seus conhecimentos sobre nota fiscal de produtor rural para pescador, MEI, colônia de pescadores e cooperativa de pesca.',
    fcType: 'quiz',
    questions: [
        mc1('O que é a Nota Fiscal de Produtor Rural e por que o comprador exige?',
            ['É um documento decorativo sem valor legal para vendas informais na feira do peixe',
             'É o documento que formaliza a venda — comprovante para o comprador e proteção fiscal para o pescador',
             'É um certificado de qualidade emitido pelo IBAMA que comprova a origem sustentável do pescado',
             'É um cadastro opcional que o pescador faz na prefeitura para participar de feiras municipais'],
            1),
        vf('A Nota Fiscal de Produtor Rural no Amapá é emitida pela SEFAZ-AP e é gratuita para o pescador artesanal com CAF e RGP.', true),
        vf('Abrir o MEI cancela automaticamente o CAF — o pescador perde o acesso ao PRONAF como pescador artesanal.', false),
        dnd(
            'Ordene os passos para emitir a Nota Fiscal de Produtor Rural no Amapá:',
            '[1] → [2] → [3] → [4]',
            ['Emitir a nota no talonário ou portal digital a cada venda', 'Tirar a inscrição estadual de produtor rural na SEFAZ-AP', 'Reunir CPF, CAF, RGP e comprovante de atividade pesqueira', 'Solicitar o talonário ou acesso ao sistema digital da SEFAZ-AP'],
            ['Reunir CPF, CAF, RGP e comprovante de atividade pesqueira',
             'Tirar a inscrição estadual de produtor rural na SEFAZ-AP',
             'Solicitar o talonário ou acesso ao sistema digital da SEFAZ-AP',
             'Emitir a nota no talonário ou portal digital a cada venda']
        ),
        matching('Associe cada figura jurídica com sua principal vantagem para o pescador:', [
            { left: 'CAF + RGP (pescador artesanal)', right: 'Acesso ao PRONAF Pesca, Seguro-Defeso, PAA e ATER gratuita' },
            { left: 'Nota Fiscal de Produtor Rural', right: 'Formaliza a venda — permite vender para governo e supermercado' },
            { left: 'MEI (Microempreendedor)', right: 'CNPJ, nota fiscal de serviço, previdência e crédito empresarial' },
            { left: 'Cooperativa de pesca', right: 'SIE/SIF coletivo, acesso a grandes mercados e divisão de sobras' }
        ]),
        mc1('Qual é o faturamento máximo anual do MEI em 2024?',
            ['R$ 36.000/ano', 'R$ 60.000/ano', 'R$ 81.000/ano', 'R$ 144.000/ano'],
            2),
        mc1('Qual é o papel específico da colônia de pescadores que a diferencia de uma simples associação?',
            ['A colônia tem poder de fiscalizar o tamanho mínimo dos peixes capturados pelos seus associados',
             'A colônia tem papel legal na emissão da declaração para o Seguro-Defeso e na representação institucional do pescador artesanal',
             'A colônia é responsável por registrar os barcos e motores dos pescadores junto ao MAPA',
             'A colônia cobra taxa mensal dos pescadores para distribuir como renda extra na entressafra'],
            1),
        vf('O pescador pode ter CAF, RGP e MEI ao mesmo tempo — os três cadastros se complementam sem cancelar um ao outro.', true),
        mc1('Qual é a principal diferença entre vender para um atravessador e vender pela cooperativa de pesca?',
            ['O atravessador paga sempre mais caro porque precisa do pescado com urgência',
             'Na cooperativa o pescador conhece o destino do produto, participa das decisões e recebe as sobras — no atravessador o preço é imposto sem transparência',
             'O atravessador exige nota fiscal e SIF; a cooperativa aceita pescado sem documentação',
             'A cooperativa paga o pescador com insumos (gelo, combustível) em vez de dinheiro'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Situação na Venda do Pescado',
    description: 'Conte como você vende seu pescado hoje — as respostas ajudam o MDA a entender os desafios reais de comercialização dos pescadores artesanais do Amapá.',
    fcType: 'listen',
    questions: [
        mc1('Para quem você vende seu pescado hoje?',
            ['Direto ao vizinho ou amigo sem documento', 'Feira do peixe com ou sem nota fiscal',
             'Atravessador que busca no porto ou trapiche', 'Colônia, cooperativa ou associação de pescadores'],
            0),
        mc1('Você sabe qual é o custo para produzir 1 kg do seu pescado?',
            ['Sim, calculo todos os custos de cada saída', 'Tenho uma ideia aproximada mas não calculo formalmente',
             'Não sei calcular — nunca fiz essa conta', 'Não acho necessário calcular'],
            0),
        shortAnswer('Qual o preço médio que você recebe por kg de pescado hoje? (Informe a principal espécie que vende)'),
        mc1('Você emite nota fiscal ou recibo na venda do pescado?',
            ['Sempre — emito nota fiscal em todas as vendas', 'Às vezes — só quando o comprador pede',
             'Nunca — todas as vendas são informais', 'Não sei como emitir nota fiscal'],
            0),
        shortAnswer('Qual é o maior obstáculo para você vender mais pescado e por melhor preço?')
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Registro de Venda',
    description: 'Registre uma venda real e ganhe um cristal — cada venda formalizada é um passo rumo à independência do atravessador.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto de uma venda realizada: caixas de pescado prontas para entrega, nota fiscal emitida, barraca na feira do peixe, ou entrega para um restaurante. Se ainda não vendeu formalmente, tire uma foto do pescado conservado em gelo e escreva para quem você quer vender.',
            ['photo'],
            'Foto de venda na feira do peixe, entrega de pescado com nota fiscal, embalagem com preço e rótulo, ou caixas de gelo prontas para venda.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo D',
    description: 'Revise todos os temas do Módulo D e consolide o que você aprendeu sobre precificação do pescado, canais de venda e regularização fiscal.',
    fcType: 'review',
    questions: [
        mc1('Por que calcular o custo real da pescaria é fundamental antes de definir o preço de venda do pescado?',
            ['Para justificar o preço alto aos clientes e evitar reclamações na feira',
             'Para saber o preço mínimo que cobre todos os custos — vender abaixo disso gera prejuízo mesmo que o pescador não perceba',
             'Para calcular os impostos corretos e evitar problemas com a Receita Federal',
             'Para comparar com o preço do concorrente e cobrar exatamente o mesmo valor'],
            1),
        vf('A venda direta ao consumidor (feira do peixe, entrega domiciliar, WhatsApp) geralmente paga o maior preço ao pescador por kg de pescado.', true),
        vf('Para vender pescado para o PAA, o pescador não precisa de nota fiscal — basta o RGP e uma declaração da colônia.', false),
        matching('Associe cada canal de venda com o requisito mínimo de documentação:', [
            { left: 'Feira do peixe local', right: 'RGP + caixas de gelo adequadas + rótulo básico' },
            { left: 'PAA (aquisição governamental)', right: 'CAF + RGP + nota fiscal + chamada pública' },
            { left: 'Supermercado estadual', right: 'SIE ou SIF + nota fiscal + embalagem rastreável' },
            { left: 'Restaurante ou peixaria', right: 'RGP + nota fiscal + conservação adequada na entrega' }
        ]),
        mc1('Qual é o faturamento máximo anual do MEI (Microempreendedor Individual) em 2024?',
            ['R$ 36.000', 'R$ 60.000', 'R$ 81.000', 'R$ 144.000'],
            2),
        matching('Associe cada figura jurídica com o principal benefício que ela traz ao pescador:', [
            { left: 'CAF + RGP', right: 'Acesso ao PRONAF Pesca, Seguro-Defeso, PAA e ATER gratuita' },
            { left: 'Nota Fiscal de Produtor Rural', right: 'Formaliza a venda para o governo e supermercado' },
            { left: 'MEI', right: 'CNPJ, previdência, nota fiscal de serviço e crédito empresarial' },
            { left: 'Cooperativa de pesca', right: 'SIE/SIF coletivo, grandes mercados e divisão de sobras anuais' }
        ]),
        smw(
            'Complete sobre precificação do pescado:',
            'O preço mínimo deve cobrir todos os [[b1]] da pescaria mais uma margem de [[b2]]. Se o custo for R$ 5/kg e a margem for 40%, o preço mínimo é R$ [[b3]]/kg. Vender abaixo do custo gera [[b4]] mesmo que o pescador não perceba.',
            [
                { id: 'b1', opts: ['custos', 'impostos', 'lucros', 'descontos'], ci: 0 },
                { id: 'b2', opts: ['lucro', 'imposto', 'desconto', 'subvenção'], ci: 0 },
                { id: 'b3', opts: ['7,00', '5,00', '6,50', '4,00'], ci: 0 },
                { id: 'b4', opts: ['prejuízo', 'lucro', 'capital', 'receita'], ci: 0 }
            ]
        ),
        mc1('Qual é o papel específico da colônia de pescadores no Seguro-Defeso?',
            ['A colônia paga diretamente o Seguro-Defeso aos pescadores com recursos próprios',
             'A colônia emite a declaração que comprova o exercício da pesca artesanal — documento obrigatório para acessar o benefício',
             'A colônia fiscaliza se o pescador realmente para de pescar durante o período proibido',
             'A colônia é apenas simbólica — o RGP no MAPA é suficiente para acessar o Seguro-Defeso'],
            1),
        mc1('Por que diversificar os canais de venda protege o pescador?',
            ['Porque o governo exige pelo menos dois canais para emitir a nota fiscal de produtor rural',
             'Porque se um comprador sumir ou baixar o preço, o pescador ainda tem outros canais gerando renda — não fica refém de ninguém',
             'Porque a cooperativa cobra taxa extra quando o associado vende apenas por um canal',
             'Porque a legislação ambiental limita a quantidade que pode ser vendida para um único comprador'],
            1),
        mc1('Onde o pescador artesanal do Amapá pode abrir o MEI gratuitamente?',
            ['Na Junta Comercial do Amapá — necessário agendamento e taxa de R$ 50',
             'No portal gov.br/mei — em menos de 10 minutos, sem custo',
             'Na Receita Federal com contador — exige declaração de início de atividade',
             'No RURAP presencialmente — o processo leva até 30 dias'],
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
    console.log('🐟 Seed — Rota da Pesca: Módulo D — Venda Justa\n');
    const moduleId = await createFolder('Módulo D — Venda Justa', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log(`\n\n✅ Módulo D — Rota da Pesca criado!\n   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

/**
 * seed-modulo-d-mel.js
 * Cria o Módulo D — Venda Justa na Rota do Mel.
 * Temas: custo de produção, precificação, canais de venda, nota fiscal, MEI, cooperativa
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-d-mel.js
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
    title: 'Quanto Vale o Seu Mel?',
    video: {
        title: 'Quanto Vale o Seu Mel?',
        url: 'https://www.youtube.com/watch?v=JlFiAhG7X_A',
        description: 'Por que apicultores vendem barato: falta de cálculo do custo real. O que entra no custo de produção do mel: insumos, tempo, transporte, embalagem, depreciação. Como calcular o preço mínimo e a margem saudável.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Quanto Vale o Seu Mel?',
    description: 'Teste o que você aprendeu sobre custo de produção e como calcular o preço justo do mel.',
    fcType: 'quiz',
    questions: [
        mc1('Por que muitos apicultores vendem mel por um preço que não cobre o custo real de produção?',
            ['Porque o mel é um produto de baixo valor e não tem como ser precificado mais alto',
             'Porque não calculam o custo de produção e não sabem qual é o preço mínimo para não ter prejuízo',
             'Porque a cooperativa define o preço e o apicultor não tem poder de negociação',
             'Porque o MAPA tabelou o preço máximo do mel artesanal em todo o Brasil'],
            1),
        mc1('Quais itens entram no custo de produção de 1 kg de mel?',
            ['Apenas o valor das colmeias compradas na última safra',
             'Insumos (cera, alimentação artificial), tempo do apicultor, combustível, embalagem, depreciação dos equipamentos e transporte',
             'Somente o preço pago por colmeia dividido pela produção anual',
             'O custo do mel não pode ser calculado porque depende da natureza — sol, chuva e flores'],
            1),
        vf('A depreciação das colmeias e equipamentos (centrífuga, indumentária) deve ser incluída no custo de produção do mel.', true),
        vf('Se o apicultor não paga salário a si mesmo, o seu tempo de trabalho não precisa ser contado no custo de produção.', false),
        listen(
            'João tem 30 colmeias e produz 600 kg de mel por ano. Seus custos com insumos, embalagens, transporte e manutenção são de R$ 4.800 por ano. Ele vende a R$ 10 por kg. João acha que está tendo lucro — mas esqueceu de contar seu próprio trabalho e a depreciação das colmeias.',
            'Por que João pode estar tendo prejuízo mesmo achando que tem lucro?',
            ['Porque 600 kg de mel é pouca produção para 30 colmeias',
             'Porque não incluiu seu próprio trabalho e a depreciação dos equipamentos no custo — o preço real pode ser maior que R$ 10/kg',
             'Porque o preço de R$ 10/kg está acima do mercado e ele vai perder clientes',
             'Porque ele deveria vender a granel para atacadistas e não embalado'],
            1),
        smw(
            'Complete o raciocínio de precificação do mel:',
            'O preço mínimo de venda deve cobrir todos os [[b1]] de produção mais uma [[b2]] de lucro. Se o custo for R$ 12/kg e a margem desejada for 40%, o preço de venda deve ser no mínimo R$ [[b3]]/kg. Vender abaixo do custo gera [[b4]].',
            [
                { id: 'b1', opts: ['custos', 'impostos', 'descontos', 'lucros'], ci: 0 },
                { id: 'b2', opts: ['margem', 'desconto', 'taxa', 'tabela'], ci: 0 },
                { id: 'b3', opts: ['16,80', '12,00', '10,00', '20,00'], ci: 0 },
                { id: 'b4', opts: ['prejuízo', 'lucro', 'capital', 'receita'], ci: 0 }
            ]
        ),
        mc1('Qual é a margem de lucro mínima recomendada para uma atividade agropecuária ser considerada sustentável no longo prazo?',
            ['5% — qualquer lucro já é suficiente para continuar',
             '20% a 30% — cobre imprevistos, investimentos futuros e remuneração justa do produtor',
             '100% — o apicultor deve dobrar o valor gasto em cada kg de mel',
             'A margem não importa — o importante é vender tudo para não perder a produção'],
            1),
        mc1('O que é a depreciação de equipamentos no custo do mel?',
            ['O desconto que o comprador pede quando compra em grande volume',
             'O valor que o apicultor reserva mensalmente para substituir equipamentos que se desgastam com o uso (colmeias, centrífuga, indumentária)',
             'A perda de valor do mel quando fica estocado por mais de 6 meses',
             'O custo com veterinários para tratar doenças nas colmeias durante a safra'],
            1),
        vf('Um apicultor que vende mel a R$ 15/kg com custo de R$ 13/kg está tendo margem de lucro de 15% — suficiente para reinvestir no negócio.', false),
        mc1('Como o apicultor calcula corretamente o custo por quilo de mel produzido?',
            ['Divide o valor total das colmeias pela produção do primeiro ano',
             'Some todos os custos anuais (insumos, tempo, transporte, embalagem, depreciação) e divida pela produção total em kg',
             'Pesquisa o preço do mel no supermercado e desconta 30%',
             'Pergunta para outros apicultores da região quanto cobram e adota o mesmo preço'],
            1)
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Onde e Para Quem Vender o Mel',
    video: {
        title: 'Onde e Para Quem Vender o Mel',
        url: 'https://www.youtube.com/watch?v=h3PAVXi9w-Y',
        description: 'Comparativo dos canais de venda do mel: feira livre, venda direta, PAA/PNAE, supermercado, farmácia/empório, exportação via cooperativa. Qual canal exige qual certificação — e por que diversificar os compradores protege o apicultor.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Onde e Para Quem Vender',
    description: 'Avalie o que você aprendeu sobre os canais de venda do mel, os requisitos de cada um e a estratégia de diversificação.',
    fcType: 'quiz',
    questions: [
        mc1('Qual canal de venda geralmente paga o maior preço ao apicultor por kg de mel?',
            ['Atacadista ou agroindústria — compra grande volume mas paga o menor preço',
             'Venda direta ao consumidor final (feira, loja própria, WhatsApp) — sem intermediários',
             'Cooperativa de exportação — o preço é alto mas só aceita grandes volumes',
             'Supermercado regional — paga mais que a cooperativa e menos que a feira'],
            1),
        matching('Associe cada canal de venda com o requisito mínimo para o apicultor participar:', [
            { left: 'Feira livre', right: 'SIM (inspeção municipal) + rótulo básico' },
            { left: 'PNAE (merenda escolar)', right: 'CAF + SIM ou SIE + chamada pública' },
            { left: 'Supermercado estadual', right: 'SIE ou SIF + nota fiscal + rótulo completo' },
            { left: 'Exportação', right: 'SIF via cooperativa + rastreabilidade completa' }
        ]),
        listenAndOrder(
            'A venda para o atravessador paga o menor preço. Depois vem a venda para o atacadista. Em seguida a cooperativa que acessa supermercados. Depois a feira livre com venda direta. Por último a farmácia ou empório gourmet, que paga o maior preço por kg.',
            'Ouça e ordene os canais de venda do menor para o maior preço recebido pelo apicultor:',
            ['Atravessador — menor preço',
             'Atacadista local',
             'Cooperativa — supermercados',
             'Feira livre — venda direta',
             'Farmácia ou empório gourmet — maior preço']
        ),
        vf('Depender de um único comprador (como um atravessador) deixa o apicultor vulnerável — se o comprador sumir, toda a renda some junto.', true),
        vf('O mel vendido pelo PAA (Programa de Aquisição de Alimentos) precisa ter SIF obrigatório — SIM e SIE não são aceitos.', false),
        mc1('Por que farmácias e empórios gourmet pagam mais pelo mel do que supermercados comuns?',
            ['Porque são obrigados por lei a comprar de apicultores com certificação orgânica',
             'Porque seu cliente busca produtos premium de alta qualidade — mel artesanal com origem, história e certificação tem valor agregado',
             'Porque recebem subsídio do governo para pagar mais caro pelos produtos da agricultura familiar',
             'Porque têm estoque menor e precisam repor mais vezes — pagam mais pela conveniência'],
            1),
        mc1('O que significa "diversificar os canais de venda" na prática para o apicultor?',
            ['Vender para o maior número possível de atravessadores ao mesmo tempo para garantir volume',
             'Ter mais de um tipo de comprador — parte na feira, parte para o PNAE, parte para farmácia — para não depender de um único cliente',
             'Mudar de canal a cada safra para encontrar sempre o melhor preço disponível',
             'Exportar 100% da produção e não vender nada no mercado interno'],
            1),
        mc1('Para vender mel para supermercados do Piauí, qual é o nível mínimo de inspeção sanitária necessário?',
            ['Nenhum — supermercados do interior do Piauí aceitam mel sem inspeção',
             'SIM (municipal) — basta a prefeitura aprovar a casa de mel',
             'SIE (estadual) ou SIF (federal) com rótulo completo e nota fiscal',
             'Certificação orgânica — supermercados só compram mel premium'],
            2),
        vf('O PAA (Programa de Aquisição de Alimentos) compra mel por meio de chamada pública, sem licitação, diretamente do apicultor familiar com CAF.', true),
        mc1('Qual é a principal desvantagem de vender todo o mel para um único atravessador?',
            ['O atravessador paga mais caro por exigir exclusividade na compra',
             'O apicultor perde poder de negociação — sem opção, aceita o preço que o atravessador oferece, geralmente abaixo do valor real',
             'A legislação proíbe contratos exclusivos entre apicultores e atravessadores',
             'O atravessador exige certificação SIF que a maioria dos apicultores não tem'],
            1)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'Nota Fiscal, MEI e a Cooperativa como Parceira',
    reading: {
        title: 'Nota Fiscal, MEI e a Cooperativa como Parceira',
        body: `<h2>Nota Fiscal, MEI e a Cooperativa como Parceira</h2>

<p>Vender mel com nota fiscal não é burocracia — é a diferença entre ser um produtor invisível e ser um fornecedor confiável para supermercados, governo e exportação.</p>

<h3>Nota Fiscal de Produtor Rural</h3>

<p>A Nota Fiscal de Produtor Rural (NFPR) é o documento que formaliza a venda do mel. Sem ela, o apicultor não consegue vender para o PNAE, supermercados nem acessar o PAA.</p>

<ul>
<li><strong>Como tirar:</strong> na Secretaria de Fazenda do Piauí (SEFAZ-PI) — gratuita, com CPF, CAF e inscrição estadual (também gratuita)</li>
<li><strong>Para que serve:</strong> comprovar a venda, garantir o pagamento formal, acumular histórico de produção para crédito</li>
<li><strong>Validade:</strong> o talonário tem prazo — renove antes de vencer</li>
<li><strong>Nota fiscal eletrônica:</strong> a SEFAZ-PI já permite emissão digital para produtores rurais</li>
</ul>

<h3>MEI — Microempreendedor Individual Apicultor</h3>

<p>O MEI é para o apicultor que quer vender para empresas, emitir nota fiscal de serviço ou ter CNPJ sem complicação.</p>

<ul>
<li><strong>Faturamento máximo:</strong> R$ 81.000/ano (atualizado em 2024)</li>
<li><strong>Contribuição mensal:</strong> R$ 70,60/mês — inclui INSS e cobertura previdenciária</li>
<li><strong>Vantagens:</strong> CNPJ, nota fiscal, aposentadoria, auxílio-doença, acesso a crédito empresarial</li>
<li><strong>Atenção:</strong> MEI e CAF podem coexistir — ter CNPJ não cancela o acesso ao PRONAF como agricultor familiar</li>
<li><strong>Como abrir:</strong> portal gov.br/mei — gratuito, em menos de 10 minutos</li>
</ul>

<h3>Cooperativa: Como Ela Vende por Você</h3>

<p>A cooperativa apícola recebe o mel a granel dos associados, processa, embala com SIF e vende para supermercados, farmácias e exportação. O apicultor recebe o valor líquido depois de descontada a taxa de gestão da cooperativa.</p>

<p><strong>Vantagens reais:</strong></p>
<ul>
<li>Acessa o SIF sem precisar ter infraestrutura industrial</li>
<li>Vende para clientes que exigem volume constante (grandes redes)</li>
<li>Compra insumos coletivamente (cera, embalagens, medicamentos) a preço menor</li>
<li>Acessa o PRONAF coletivo com limite maior do que individualmente</li>
</ul>

<h3>Cooperativa vs. Atravessador</h3>

<table>
<tr><th></th><th>Atravessador</th><th>Cooperativa</th></tr>
<tr><td>Quem decide o preço?</td><td>Ele decide</td><td>O mercado + custo real</td></tr>
<tr><td>Você sabe para onde vai o mel?</td><td>Não</td><td>Sim — transparência</td></tr>
<tr><td>Você participa do resultado?</td><td>Não</td><td>Sim — sobras anuais</td></tr>
<tr><td>Ele investe em você?</td><td>Não</td><td>Sim — serviços coletivos</td></tr>
</table>

<p><em>Fonte: SEFAZ-PI, gov.br/mei, OCB-PI, SEBRAE-PI (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Nota Fiscal, MEI e Cooperativa',
    description: 'Teste seus conhecimentos sobre nota fiscal de produtor, MEI apicultor e o papel da cooperativa como parceira de venda.',
    fcType: 'quiz',
    questions: [
        mc1('O que é a Nota Fiscal de Produtor Rural e por que o comprador exige?',
            ['É um documento decorativo sem valor legal para vendas informais na feira',
             'É o documento que formaliza a venda — comprovante para o comprador e proteção fiscal para o apicultor',
             'É um certificado de qualidade emitido pela Embrapa que comprova a pureza do mel',
             'É um cadastro opcional que o apicultor faz na prefeitura para participar de feiras municipais'],
            1),
        vf('A Nota Fiscal de Produtor Rural no Piauí é emitida pela SEFAZ-PI e é gratuita para o agricultor familiar com CAF.', true),
        vf('Abrir o MEI cancela automaticamente o CAF — o apicultor perde o acesso ao PRONAF como agricultor familiar.', false),
        dnd(
            'Ordene os passos para emitir a Nota Fiscal de Produtor Rural no Piauí:',
            '[1] → [2] → [3] → [4]',
            ['Emitir a nota no talonário ou portal digital a cada venda', 'Tirar a inscrição estadual de produtor rural na SEFAZ-PI', 'Reunir CPF, CAF e comprovante de atividade rural', 'Solicitar o talonário ou acesso ao sistema digital da SEFAZ-PI'],
            ['Reunir CPF, CAF e comprovante de atividade rural',
             'Tirar a inscrição estadual de produtor rural na SEFAZ-PI',
             'Solicitar o talonário ou acesso ao sistema digital da SEFAZ-PI',
             'Emitir a nota no talonário ou portal digital a cada venda']
        ),
        matching('Associe cada figura jurídica com sua principal vantagem para o apicultor:', [
            { left: 'CAF (agricultor familiar)', right: 'Acesso ao PRONAF, PAA, PNAE e assistência técnica gratuita' },
            { left: 'Nota Fiscal de Produtor Rural', right: 'Formaliza a venda — permite vender para governo e supermercado' },
            { left: 'MEI (Microempreendedor)', right: 'CNPJ, nota fiscal de serviço, previdência e crédito empresarial' },
            { left: 'Cooperativa apícola', right: 'SIF coletivo, acesso a grandes mercados, divisão de sobras' }
        ]),
        mc1('Qual é o faturamento máximo anual do MEI em 2024?',
            ['R$ 36.000/ano', 'R$ 60.000/ano', 'R$ 81.000/ano', 'R$ 144.000/ano'],
            2),
        mc1('O que são as "sobras" da cooperativa e como beneficiam o apicultor associado?',
            ['São os potes de mel que não foram vendidos na safra e são devolvidos ao apicultor',
             'São os lucros líquidos da cooperativa ao final do exercício, distribuídos proporcionalmente entre os cooperados conforme a produção entregue',
             'São os recursos que a cooperativa guarda para emergências — nunca distribuídos aos associados',
             'São descontos dados pela cooperativa nos insumos comprados pelos apicultores'],
            1),
        vf('O apicultor pode ter CAF e MEI ao mesmo tempo — os dois cadastros se complementam sem cancelar um ao outro.', true),
        mc1('Qual é a principal diferença entre vender para um atravessador e vender pela cooperativa?',
            ['O atravessador paga sempre mais caro porque precisa do mel com urgência',
             'Na cooperativa o apicultor conhece o destino do mel, participa das decisões e recebe as sobras — no atravessador o preço é imposto e não há transparência',
             'O atravessador exige nota fiscal e SIF; a cooperativa aceita mel sem documentação',
             'A cooperativa paga o apicultor com produtos (cera, embalagem) em vez de dinheiro'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Situação na Venda do Mel',
    description: 'Conte como você vende seu mel hoje — as respostas ajudam o MDA a entender os desafios reais de comercialização dos apicultores piauienses.',
    fcType: 'listen',
    questions: [
        mc1('Para quem você vende seu mel hoje?',
            ['Direto ao vizinho ou amigo sem documento', 'Feira livre com ou sem nota fiscal',
             'Atravessador que busca no apiário', 'Cooperativa ou associação apícola',
             ], 0),
        mc1('Você sabe qual é o custo para produzir 1 kg do seu mel?',
            ['Sim, calculo direitinho todos os custos', 'Tenho uma ideia aproximada mas não calculo formalmente',
             'Não sei calcular — nunca fiz essa conta', 'Não acho necessário calcular'], 0),
        shortAnswer('Qual o preço médio que você recebe por kg de mel hoje?'),
        mc1('Você emite nota fiscal ou recibo na venda do mel?',
            ['Sempre — emito nota fiscal em todas as vendas', 'Às vezes — só quando o comprador pede',
             'Nunca — todas as vendas são informais', 'Não sei como emitir nota fiscal'], 0),
        shortAnswer('Qual é o maior obstáculo para você vender mais mel e por melhor preço?')
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Registro de Venda',
    description: 'Registre uma venda real e ganhe um cristal — cada venda formalizada é um passo rumo à independência do atravessador.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto de uma venda realizada: potes de mel prontos para entrega, nota fiscal emitida, barraca na feira, ou entrega para um cliente. Se ainda não vendeu formalmente, tire uma foto dos potes prontos e escreva para quem você quer vender.',
            ['photo'],
            'Foto de venda na feira, entrega de mel com nota fiscal, embalagem com preço e rótulo, ou potes prontos para venda.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo D',
    description: 'Revise todos os temas do Módulo D e consolide o que você aprendeu sobre precificação, canais de venda e regularização fiscal.',
    fcType: 'review',
    questions: [
        mc1('Por que calcular o custo real de produção do mel é fundamental antes de definir o preço de venda?',
            ['Para justificar o preço alto aos clientes e evitar reclamações',
             'Para saber o preço mínimo que cobre todos os custos — vender abaixo disso gera prejuízo mesmo que o apicultor não perceba',
             'Para calcular os impostos corretos e evitar problemas com a Receita Federal',
             'Para comparar com o preço do concorrente e cobrar exatamente o mesmo valor'],
            1),
        vf('A venda direta ao consumidor (feira, WhatsApp, entrega domiciliar) geralmente paga o maior preço ao apicultor por kg de mel.', true),
        vf('Para vender mel para o PNAE, o apicultor não precisa de nota fiscal — basta o CAF e uma declaração da prefeitura.', false),
        matching('Associe cada canal de venda com o requisito mínimo de documentação:', [
            { left: 'Feira livre local', right: 'SIM (inspeção municipal) e rótulo básico' },
            { left: 'PNAE (merenda escolar)', right: 'CAF + SIM ou SIE + nota fiscal + chamada pública' },
            { left: 'Supermercado estadual', right: 'SIE ou SIF + nota fiscal + rótulo completo' },
            { left: 'Exportação', right: 'SIF via cooperativa + rastreabilidade + nota fiscal' }
        ]),
        mc1('Qual é o faturamento máximo anual do MEI (Microempreendedor Individual) em 2024?',
            ['R$ 36.000', 'R$ 60.000', 'R$ 81.000', 'R$ 144.000'],
            2),
        matching('Associe cada figura jurídica com o principal benefício que ela traz ao apicultor:', [
            { left: 'CAF', right: 'Acesso ao PRONAF, PAA, PNAE e ATER gratuita' },
            { left: 'Nota Fiscal de Produtor Rural', right: 'Formaliza a venda para o governo e supermercado' },
            { left: 'MEI', right: 'CNPJ, previdência, nota fiscal de serviço e crédito empresarial' },
            { left: 'Cooperativa apícola', right: 'SIF coletivo, grandes mercados e divisão de sobras anuais' }
        ]),
        smw(
            'Complete sobre precificação do mel:',
            'O preço mínimo deve cobrir todos os [[b1]] mais uma margem de [[b2]]. Se o custo for R$ 10/kg e a margem for 30%, o preço mínimo é R$ [[b3]]/kg. Vender abaixo do custo gera [[b4]] mesmo que o apicultor não perceba.',
            [
                { id: 'b1', opts: ['custos', 'impostos', 'lucros', 'descontos'], ci: 0 },
                { id: 'b2', opts: ['lucro', 'imposto', 'desconto', 'subvenção'], ci: 0 },
                { id: 'b3', opts: ['13,00', '10,00', '15,00', '8,00'], ci: 0 },
                { id: 'b4', opts: ['prejuízo', 'lucro', 'capital', 'receita'], ci: 0 }
            ]
        ),
        mc1('O que são as "sobras" distribuídas pela cooperativa apícola ao final do ano?',
            ['Os potes de mel que sobram no estoque e são devolvidos ao apicultor',
             'Os lucros líquidos da cooperativa divididos entre os cooperados proporcionalmente à produção entregue',
             'Os recursos guardados para emergências — nunca distribuídos aos associados',
             'Os descontos dados nos insumos coletivos comprados pela cooperativa'],
            1),
        mc1('Por que diversificar os canais de venda protege o apicultor?',
            ['Porque o governo exige pelo menos dois canais para emitir a nota fiscal de produtor rural',
             'Porque se um comprador sumir ou baixar o preço, o apicultor ainda tem outros canais gerando renda — não fica refém de ninguém',
             'Porque a cooperativa cobra taxa extra quando o associado vende apenas por um canal',
             'Porque a legislação ambiental limita a quantidade que pode ser vendida para um único comprador'],
            1),
        mc1('Onde o apicultor piauiense pode abrir o MEI gratuitamente?',
            ['Na Junta Comercial do Piauí — necessário agendamento e taxa de R$ 50',
             'No portal gov.br/mei — em menos de 10 minutos, sem custo',
             'Na Receita Federal com contador — exige declaração de início de atividade',
             'No SEBRAE-PI presencialmente — o processo leva até 30 dias'],
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
    console.log('🐝 Seed — Rota do Mel: Módulo D — Venda Justa\n');
    const moduleId = await createFolder('Módulo D — Venda Justa', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log(`\n\n✅ Módulo D — Rota do Mel criado!\n   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

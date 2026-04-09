/**
 * seed-modulo-f-pesca.js
 * Cria o Módulo F — Sua Voz Vale: Liderança e Participação na Rota da Pesca.
 * Temas: CMDR/CMPA, FEPA-AP, colônias de pescadores, audiências públicas, Rota Viva como fonte de política pública
 * Referências: RURAP, FEPA-AP, COOPESCA-AP, BASA, Colônias Z-1/Z-3
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-f-pesca.js
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
    title: 'Sua Voz nos Rios: Colônia, FEPA-AP e Conselhos',
    video: {
        title: 'Sua Voz nos Rios: Colônia, FEPA-AP e Conselhos',
        url: 'https://www.youtube.com/watch?v=JlFiAhG7X_A',
        description: 'O papel da Colônia de Pescadores além do Seguro-Defeso: representação política, participação no CMDR e no Conselho Municipal de Pesca e Aquicultura. FEPA-AP (Federação dos Pescadores do Amapá): o que é, como representa o pescador artesanal no estado. Por que a participação coletiva amplia o poder de negociação do pescador perante o governo e as empresas.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Colônia, FEPA-AP e Participação Coletiva',
    description: 'Teste seus conhecimentos sobre o papel da Colônia de Pescadores, da FEPA-AP e dos conselhos municipais na representação política do pescador artesanal do Amapá.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é o papel da Colônia de Pescadores além de emitir a declaração para o Seguro-Defeso?',
            ['A colônia não tem outro papel — sua função é exclusivamente administrativa (documentação do Seguro-Defeso)',
             'Representar politicamente os pescadores, participar do CMDR municipal, negociar coletivamente com compradores e órgãos públicos e intermediar o acesso ao PRONAF e ao RURAP',
             'Fiscalizar se os pescadores associados estão cumprindo as normas do IBAMA sobre tamanho mínimo de captura',
             'Comprar e revender insumos (gelo, combustível, petrechos) para os associados com lucro para a colônia'],
            1),
        mc1('O que é a FEPA-AP (Federação dos Pescadores do Amapá) e qual sua função?',
            ['É uma cooperativa estadual de beneficiamento de pescado com sede em Macapá',
             'É a entidade que representa coletivamente todas as colônias de pescadores do Amapá no nível estadual — leva as demandas dos pescadores artesanais ao governo do estado e ao governo federal',
             'É um órgão do governo estadual responsável por regulamentar a pesca artesanal no Amapá',
             'É uma empresa mista de comercialização de pescado entre o estado do Amapá e o governo federal'],
            1),
        vf('O pescador artesanal que participa ativamente da colônia representa não apenas a si mesmo, mas toda a categoria de pescadores artesanais do município.', true),
        mc1('Qual é a diferença prática entre a Colônia de Pescadores e o CMDR?',
            ['A colônia representa apenas pescadores; o CMDR reúne todos os produtores rurais e o poder público para definir as prioridades de investimento de todo o setor rural do município',
             'Não há diferença — ambos fazem a mesma coisa com nomes diferentes no Amapá',
             'A colônia é para quem pesca nos rios; o CMDR é para quem pesca no mar — a distinção é geográfica',
             'O CMDR substituiu as colônias de pescadores no Amapá — quem é do CMDR não precisa mais da colônia'],
            0),
        listen(
            'O município de Santana, no Amapá, vai investir R$ 180 mil do fundo municipal de desenvolvimento em infraestrutura pesqueira ou rural. O CMDR vai votar. Os pescadores artesanais representam 60% dos produtores rurais do município, mas só têm um representante no conselho de 12 membros.',
            'O que os pescadores de Santana deveriam fazer para garantir que o investimento atenda suas necessidades?',
            ['Esperar a votação e aceitar o resultado — um representante já é suficiente para apresentar as demandas',
             'Mobilizar mais pescadores para participar das reuniões abertas do CMDR, apresentar dados concretos das necessidades (trapiche, câmara fria, gelo) e propor aumento de vagas para a pesca no conselho',
             'Entrar com ação judicial para bloquear a votação até que os pescadores tenham representação proporcional',
             'Solicitar ao IBAMA que intervenha no CMDR para garantir que as decisões considerem os pescadores'],
            1),
        mc1('Com que frequência costumam acontecer as reuniões ordinárias do CMDR nos municípios do Amapá?',
            ['Diariamente — o conselho funciona como escritório permanente', 'Mensalmente — com possibilidade de reuniões extraordinárias quando necessário',
             'Uma vez por ano — apenas para aprovar o plano anual', 'A cada quatro anos — coincide com as eleições municipais'],
            1),
        vf('A colônia de pescadores pode apresentar as demandas coletivas da categoria no CMDR municipal — sua presença no conselho é mais eficaz que reivindicações individuais.', true),
        matching('Associe cada entidade com sua principal função na representação do pescador artesanal do Amapá:', [
            { left: 'Colônia de Pescadores (Z-1, Z-3)', right: 'Representação municipal — Seguro-Defeso, CMDR e acesso ao RURAP' },
            { left: 'FEPA-AP', right: 'Representação estadual — leva demandas dos pescadores ao governo do Amapá e ao federal' },
            { left: 'COOPESCA-AP', right: 'Cooperativa de produção e comercialização — acesso a SIE/SIF e mercados formais' },
            { left: 'CMDR', right: 'Conselho municipal que decide prioridades de investimento rural público' }
        ]),
        vf('Participar de conselhos e da colônia não é perda de tempo — é o caminho para transformar demandas individuais em políticas públicas que beneficiam toda a categoria.', true),
        smw(
            'Complete sobre as entidades que representam o pescador artesanal:',
            'A [[b1]] de pescadores representa a categoria no município e emite a declaração do [[b2]]. A [[b3]] representa as colônias no nível estadual. O [[b4]] reúne produtores rurais e poder público para decidir investimentos municipais. A COOPESCA-AP dá acesso ao [[b5]] para comercialização.',
            [
                { id: 'b1', opts: ['Colônia', 'Cooperativa', 'Federação', 'Associação'], ci: 0 },
                { id: 'b2', opts: ['Seguro-Defeso', 'PRONAF', 'RGP', 'PAA'], ci: 0 },
                { id: 'b3', opts: ['FEPA-AP', 'RURAP', 'IBAMA', 'BASA'], ci: 0 },
                { id: 'b4', opts: ['CMDR', 'PRONAF', 'PAA', 'SIF'], ci: 0 },
                { id: 'b5', opts: ['SIE/SIF', 'RGP', 'CAF', 'PRONAF'], ci: 0 }
            ]
        )
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Audiências Públicas e Como a Voz do Pescador Chega ao Governo',
    video: {
        title: 'Audiências Públicas e Como a Voz do Pescador Chega ao Governo',
        url: 'https://www.youtube.com/watch?v=h3PAVXi9w-Y',
        description: 'O que é uma audiência pública, quem pode participar e como se inscrever para falar. Como preparar um depoimento de 3 minutos direto e eficaz. Exemplos de pescadores artesanais do Amapá que apresentaram demandas em audiências e obtiveram resultados: ampliação do Seguro-Defeso, instalação de câmaras frias em trapiches, ação do RURAP para assistência técnica.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Audiências Públicas e Incidência Política',
    description: 'Teste seus conhecimentos sobre como participar de audiências públicas, preparar um depoimento eficaz e usar os canais de participação para levar as demandas da pesca artesanal ao governo.',
    fcType: 'quiz',
    questions: [
        mc1('O que é uma audiência pública e quem tem direito de participar?',
            ['É uma reunião restrita a especialistas e técnicos — pescadores não têm acesso sem convite formal',
             'É um mecanismo de participação social onde qualquer cidadão pode assistir e, mediante inscrição, fazer uso da palavra para apresentar demandas e opiniões',
             'É uma sessão judicial aberta ao público para julgamento de casos de pesca ilegal',
             'É uma reunião de câmara municipal exclusiva para vereadores e secretários municipais'],
            1),
        listenAndOrder(
            'Para falar em uma audiência pública, primeiro saiba a data, o local e o tema da audiência com antecedência. Segundo, faça sua inscrição para usar a palavra — geralmente com antecedência mínima de 24 horas. Terceiro, prepare seu depoimento com no máximo 3 minutos, sendo direto e usando dados concretos da sua realidade. Quarto, apresente-se: nome, município e atividade. Por último, apresente o problema e a solução de forma objetiva.',
            'Ouça e ordene os passos para participar com eficácia de uma audiência pública:',
            ['Saiba a data, local e tema com antecedência',
             'Faça sua inscrição para usar a palavra',
             'Prepare depoimento de até 3 minutos com dados concretos',
             'Apresente-se: nome, município e atividade',
             'Apresente o problema e a solução de forma objetiva']
        ),
        vf('Em uma audiência pública, o pescador deve falar de forma genérica sobre todos os problemas da pesca artesanal — quanto mais temas cobrir, mais impacto terá.', false),
        mc1('Por que dados concretos tornam um depoimento em audiência pública mais eficaz?',
            ['Porque os organizadores só registram falas com dados numéricos — sem números o depoimento não é transcrito na ata',
             'Porque números específicos (quantos pescadores afetados, qual a queda de renda, qual o investimento necessário) transformam reclamações em demandas objetivas que os gestores conseguem atender',
             'Porque os dados impressionam o público presente e aumentam o apoio popular ao pescador',
             'Porque a lei exige que todo depoimento em audiência pública seja acompanhado de laudo técnico com dados'],
            1),
        mc1('Qual é o tempo máximo que cada participante geralmente tem para falar em uma audiência pública?',
            ['30 minutos — tempo suficiente para explicar toda a realidade da pesca artesanal',
             '3 minutos — é preciso ser direto, concreto e objetivo',
             '15 minutos — desde que a audiência tenha menos de 10 inscritos para falar',
             '1 minuto — audiências são muito concorridas e o tempo é dividido igualmente entre todos'],
            1),
        listen(
            'Ana é pescadora artesanal de Santana e quer falar na audiência pública do Plano Safra do Amapá. Tem 3 minutos. Está em dúvida se fala sobre todos os problemas da pesca local ou foca em uma demanda específica.',
            'Qual é a melhor estratégia para Ana usar seus 3 minutos com máximo impacto?',
            ['Falar de todos os problemas rapidamente — quanto mais temas, mais o governo vai entender a situação geral',
             'Escolher uma demanda urgente e específica, apresentar dados concretos (ex.: "210 pescadores sem câmara fria no trapiche de Santana") e propor uma solução objetiva e viável',
             'Agradecer ao governo pelos programas existentes antes de qualquer demanda — a cortesia abre portas',
             'Ler um texto escrito por um advogado da colônia — o discurso técnico tem mais peso que o testemunho pessoal'],
            1),
        mc1('Quais canais o pescador artesanal do Amapá pode usar para levar suas demandas ao governo além das audiências públicas?',
            ['Apenas audiências públicas — é o único canal oficial reconhecido pelo MPA',
             'CMDR municipal, colônia de pescadores, FEPA-AP, reunião com deputado estadual ou federal, ouvidoria do MPA, app Rota Viva e carta ao Ministério da Pesca e Aquicultura',
             'Apenas o SEBRAE — tem canal direto com o governo para demandas do setor pesqueiro',
             'Apenas o sindicato rural — sem filiação sindical o pescador não tem representação formal no governo'],
            1),
        vf('O pescador que apresenta uma demanda em audiência pública faz mais do que reclamar — alimenta o sistema de informação do governo com dados reais da realidade da pesca artesanal.', true),
        matching('Associe cada demanda da pesca artesanal com o canal mais adequado para apresentá-la:', [
            { left: 'Falta de câmara fria e gelo nos trapiches municipais', right: 'CMDR — prioridade de infraestrutura de apoio à pesca no município' },
            { left: 'Dificuldade de acesso ao PRONAF Pesca', right: 'Audiência pública do Plano Safra ou reunião com agente do BASA' },
            { left: 'Falta de assistência técnica do RURAP', right: 'Reunião com secretaria de agricultura/pesca do estado ou CMDR' },
            { left: 'Irregularidade no Seguro-Defeso', right: 'Ouvidoria do MPA ou colônia de pescadores — canal oficial de denúncia' }
        ]),
        mc1('O que o pescador deve fazer após participar de uma audiência pública para garantir que sua demanda não seja esquecida?',
            ['Nada — após a fala o governo é responsável por tomar providências sem acompanhamento',
             'Acompanhar a ata, cobrar respostas dos gestores, registrar o andamento na colônia e manter a demanda viva nas próximas reuniões do CMDR',
             'Publicar o depoimento nas redes sociais para pressionar o governo com a opinião pública',
             'Contratar um advogado para converter a demanda em ação judicial caso não haja resposta em 30 dias'],
            1)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'Rota Viva: O Pescador como Fonte de Política Pública',
    reading: {
        title: 'Rota Viva: O Pescador como Fonte de Política Pública',
        body: `<h2>Rota Viva: O Pescador como Fonte de Política Pública</h2>

<p>Cada resposta que você dá no app Rota Viva não é só uma nota ou um ponto no ranking. É um dado. E esse dado vai para o MDA (Ministério do Desenvolvimento Agrário) e para o MPA (Ministério da Pesca e Aquicultura) — influencia decisões que afetam toda a pesca artesanal do Amapá.</p>

<h3>Como Seus Dados Chegam ao Governo</h3>

<p>O sistema de Escuta Ativa do Rota Viva coleta informações sobre:</p>
<ul>
<li>Quantos pescadores têm acesso a cada programa (Seguro-Defeso, PRONAF, PAA)</li>
<li>Quais são os principais obstáculos de quem ainda não acessou o Seguro-Defeso ou o PRONAF Pesca</li>
<li>Como a sazonalidade e a redução dos estoques estão afetando a renda dos pescadores por região</li>
<li>Qual é o preço médio recebido e qual é o canal de venda mais usado na região</li>
<li>Que tipo de assistência técnica do RURAP está chegando (ou não chegando) às comunidades ribeirinhas</li>
</ul>

<p>Esses dados são consolidados pela equipe do projeto e apresentados ao MDA e ao MPA em relatórios periódicos. Quando um gestor vê que 72% dos pescadores artesanais do Amapá ainda não têm câmara fria acessível nos trapiches, isso vira uma meta do Plano Safra da Pesca.</p>

<h3>O Que é Liderança Comunitária na Pesca Artesanal</h3>

<p>Liderança não exige cargo. O pescador que:</p>
<ul>
<li>Explica para o vizinho como tirar o RGP ou regularizar o CAF</li>
<li>Convida o grupo para participar da reunião da colônia ou do CMDR</li>
<li>Registra no app as demandas da sua comunidade pesqueira</li>
<li>Representa a colônia em uma audiência pública</li>
</ul>

<p>...já é um líder comunitário. Esse pescador multiplica o impacto do projeto para além de si mesmo.</p>

<h3>A Pirâmide de Participação</h3>

<p>A transformação da realidade da pesca artesanal acontece em camadas:</p>

<ol>
<li><strong>Individual:</strong> o pescador regulariza RGP e CAF, aprende, produz e conserva melhor</li>
<li><strong>Comunitário:</strong> a colônia negocia coletivamente, representa no CMDR, acessa PRONAF e RURAP</li>
<li><strong>Municipal:</strong> o CMDR direciona investimentos públicos — trapiches, câmaras frias, gelo subsidiado</li>
<li><strong>Estadual/Federal:</strong> os dados do Rota Viva e das audiências públicas embasam o Plano Safra da Pesca e as políticas do MPA</li>
</ol>

<p>Você está no primeiro nível. Mas cada ação que você toma — aprender, participar, registrar, falar — sobe na pirâmide e muda o que acontece nos níveis acima.</p>

<h3>Jovem Multiplicador — Guardião dos Rios</h3>

<p>O programa de Jovens Multiplicadores do Rota Viva forma pescadores jovens (18–35 anos) para serem facilitadores nas comunidades ribeirinhas do Amapá. O Jovem Multiplicador:</p>
<ul>
<li>Recebe formação complementar no app e em sessões presenciais</li>
<li>Facilita grupos de aprendizagem com pescadores mais experientes e jovens da comunidade</li>
<li>É reconhecido com o badge "Guardião dos Rios" — a conquista mais prestigiosa da Rota da Pesca</li>
<li>Tem nome registrado no relatório do MDA como agente de transformação no território</li>
</ul>

<h3>Instituições de Referência no Amapá</h3>

<ul>
<li><strong>RURAP:</strong> Instituto de Desenvolvimento Rural do Amapá — assistência técnica e extensão rural</li>
<li><strong>FEPA-AP:</strong> Federação dos Pescadores do Amapá — representação estadual da pesca artesanal</li>
<li><strong>COOPESCA-AP:</strong> Cooperativa de pesca de referência — comercialização com SIE/SIF</li>
<li><strong>BASA:</strong> Banco da Amazônia — principal agente do PRONAF Pesca no Amapá</li>
<li><strong>Colônias Z-1 e Z-3:</strong> representam pescadores de Macapá e Santana — as duas maiores colônias do estado</li>
</ul>

<p><em>Fonte: MPA, MDA, RURAP-AP, FEPA-AP, IBAMA, Programa Rota Viva (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Liderança, Participação e Rota Viva',
    description: 'Teste seus conhecimentos sobre como o Rota Viva usa os dados do pescador para política pública, liderança comunitária e participação nas instâncias que decidem o futuro da pesca artesanal no Amapá.',
    fcType: 'quiz',
    questions: [
        mc1('O que acontece com as respostas que o pescador dá no app Rota Viva?',
            ['São usadas apenas para personalizar o conteúdo do app — nenhum dado sai do sistema',
             'São consolidadas e apresentadas ao MDA e ao MPA em relatórios periódicos — embasam o Plano Safra da Pesca e as políticas de apoio à pesca artesanal',
             'São vendidas para empresas de insumos pesqueiros que usam os dados para fazer campanhas de marketing',
             'São usadas apenas para calcular a pontuação e o ranking dos participantes no sistema de gamificação'],
            1),
        vf('As respostas do pescador no app Rota Viva são dados reais que chegam ao MPA e ao MDA — cada informação registrada tem impacto nas políticas que chegam às comunidades ribeirinhas.', true),
        mc1('O que caracteriza um líder comunitário na pesca artesanal — segundo o enfoque do Rota Viva?',
            ['É o pescador eleito presidente da colônia — apenas quem tem cargo formal é considerado líder',
             'É quem explica para o vizinho como regularizar o RGP, convida o grupo para reuniões, registra demandas e representa a comunidade — liderança não exige cargo',
             'É o pescador com maior produção — a liderança vem da competência técnica demonstrada no rio',
             'É o pescador mais antigo da comunidade — a experiência acumulada é o principal critério de liderança'],
            1),
        matching('Associe cada nível da pirâmide de participação com o que acontece nele:', [
            { left: 'Nível individual', right: 'Pescador regulariza RGP e CAF, aprende e conserva melhor o pescado' },
            { left: 'Nível comunitário', right: 'A colônia negocia coletivamente, representa no CMDR e acessa PRONAF/RURAP' },
            { left: 'Nível municipal', right: 'CMDR direciona investimentos — trapiches, câmaras frias, gelo subsidiado' },
            { left: 'Nível federal', right: 'Dados do Rota Viva e audiências embasam o Plano Safra da Pesca' }
        ]),
        mc1('O que é o programa de Jovens Multiplicadores do Rota Viva para pescadores?',
            ['Um programa de bolsas para pescadores jovens cursarem engenharia de pesca ou aquicultura',
             'Uma formação que capacita pescadores jovens (18–35 anos) a facilitar sessões presenciais nas comunidades ribeirinhas, multiplicando o impacto do projeto no território',
             'Um ranking de produção entre jovens pescadores do Amapá com premiação em equipamentos de pesca',
             'Um programa do SEBRAE de aceleração de negócios para pescadores que querem exportar pescado'],
            1),
        listen(
            'O município de Laranjal do Jari vai receber R$ 120 mil para investir em infraestrutura de apoio à pesca. O CMDR vai votar entre três projetos: câmara fria no trapiche, reforma da feira do peixe, e compra de equipamentos para a escola rural. Os pescadores representam 55% dos produtores, mas não têm representante no conselho.',
            'O que os pescadores de Laranjal do Jari deveriam fazer imediatamente para influenciar a votação?',
            ['Esperar a votação e aceitar o resultado — sem representante no conselho não há o que fazer',
             'Organizar reunião de emergência da colônia, eleger um representante para o CMDR e apresentar dados concretos (quantos pescadores seriam beneficiados, impacto na renda) antes da votação',
             'Fazer petição online com assinaturas para pressionar a prefeitura a escolher o projeto da câmara fria',
             'Solicitar ao IBAMA que bloqueie a votação até que os pescadores tenham representação proporcional'],
            1),
        vf('Quando o pescador explica para o vizinho como tirar o RGP ou acessar o Seguro-Defeso, ele já está exercendo liderança comunitária — mesmo sem cargo na colônia.', true),
        mc1('Por que é importante que o pescador registre suas dificuldades e demandas no app Rota Viva mesmo quando parecem pequenas?',
            ['Para acumular pontos extras — cada registro vale 50 pontos no sistema de gamificação',
             'Porque dados individuais somados de centenas de pescadores formam um diagnóstico preciso — o que parece pequeno individualmente se torna urgente quando é a realidade de 400 pescadores',
             'Para que o RURAP saiba quem visitar — os técnicos priorizam pescadores com mais registros no app',
             'Para provar ao BASA que está engajado no projeto e ter mais chances de aprovação no PRONAF Pesca'],
            1),
        smw(
            'Complete sobre o papel do pescador como agente de transformação:',
            'As respostas do pescador no Rota Viva chegam ao [[b1]] e ao MPA como dados de política pública. O pescador que participa da [[b2]] e do CMDR influencia onde o dinheiro público é aplicado. A [[b3]] comunitária não exige cargo — começa com ações simples. O Jovem Multiplicador recebe o badge [[b4]].',
            [
                { id: 'b1', opts: ['MDA', 'SEBRAE', 'IBAMA', 'MAPA'], ci: 0 },
                { id: 'b2', opts: ['colônia', 'cooperativa', 'federação', 'câmara'], ci: 0 },
                { id: 'b3', opts: ['liderança', 'cooperativa', 'associação', 'parceria'], ci: 0 },
                { id: 'b4', opts: ['Guardião dos Rios', 'Pescador de Ouro', 'Mestre da Pesca', 'Rio Vivo'], ci: 0 }
            ]
        ),
        mc1('Qual é o badge mais prestigioso da Rota da Pesca e quem pode recebê-lo?',
            ['Badge "Pescador de Ouro" — entregue ao pescador com maior produção do Amapá no ano',
             'Badge "Guardião dos Rios" — recebido pelo Jovem Multiplicador formado para facilitar sessões nas comunidades ribeirinhas',
             'Badge "Rio Limpo" — entregue ao pescador que mais denúncias de pesca ilegal registrou no IBAMA',
             'Badge "Mestre da Pesca" — conquistado ao concluir todas as trilhas com 100% de aproveitamento'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Voz e Minha Comunidade',
    description: 'Conte sua relação com os espaços de participação da sua comunidade — suas respostas ajudam o MDA e o MPA a entender quão conectados estão os pescadores artesanais do Amapá com as instâncias de decisão.',
    fcType: 'listen',
    questions: [
        mc1('Você participa ativamente da sua Colônia de Pescadores?',
            ['Sim, participo das reuniões e contribuo com demandas', 'Sou associado mas raramente participo',
             'Já participei mas me afastei por conflito ou decepção', 'Não sou associado a nenhuma colônia'],
            0),
        mc1('Você sabe se existe um CMDR ativo no seu município?',
            ['Sim, sei que existe e já participei de pelo menos uma reunião', 'Sei que existe mas nunca participei',
             'Não sei se existe CMDR no meu município', 'Sei que não existe CMDR ativo na minha cidade'],
            0),
        mc1('Você já participou de alguma audiência pública, reunião com o poder público ou evento de participação social relacionado à pesca?',
            ['Sim, já falei ou apresentei demanda em audiência ou reunião', 'Já participei como ouvinte',
             'Nunca participei mas tenho interesse', 'Nunca participei e não tenho interesse'],
            0),
        shortAnswer('Se você pudesse falar diretamente para o Ministério da Pesca e Aquicultura, qual seria a demanda mais urgente dos pescadores artesanais do seu município?'),
        shortAnswer('Existe algum jovem da sua comunidade ou família que você acha que deveria aprender a pescar de forma profissional e sustentável? Como você poderia ajudá-lo?')
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Compromisso de Participação',
    description: 'Registre um espaço de participação coletiva da sua comunidade e ganhe um cristal — cada pescador que se engaja multiplica a voz da pesca artesanal do Amapá.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto de um espaço de participação coletiva: reunião da colônia de pescadores, sede da cooperativa, evento do CMDR ou da FEPA-AP, evento do RURAP, ou qualquer encontro coletivo relacionado à pesca artesanal. Se não tiver foto, tire uma foto do trapiche, do porto ou do ponto de encontro dos pescadores da sua comunidade e escreva qual demanda você levaria ao CMDR se fosse amanhã.',
            ['photo'],
            'Foto de reunião de colônia, sede de cooperativa, evento do CMDR, trapiche comunitário ou espaço coletivo relacionado à pesca artesanal.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo F',
    description: 'Revise todos os temas do Módulo F: colônia de pescadores, FEPA-AP, audiências públicas, CMDR e o papel do pescador como fonte de política pública no Rota Viva.',
    fcType: 'review',
    questions: [
        mc1('Qual é o papel da Colônia de Pescadores além do Seguro-Defeso?',
            ['A colônia não tem outro papel além de emitir a declaração do Seguro-Defeso',
             'Representar politicamente os pescadores, participar do CMDR, negociar coletivamente e intermediar acesso ao PRONAF Pesca e ao RURAP',
             'Fiscalizar se os pescadores associados estão cumprindo as normas do IBAMA',
             'Comprar e revender insumos para os associados com lucro para reinvestir na colônia'],
            1),
        vf('A FEPA-AP representa as colônias de pescadores do Amapá no nível estadual — leva as demandas dos pescadores artesanais ao governo do estado e ao governo federal.', true),
        listenAndOrder(
            'Para participar de uma audiência pública com eficácia: primeiro saiba a data, local e tema. Segundo, faça sua inscrição. Terceiro, prepare seu depoimento de até 3 minutos com dados concretos. Quarto, apresente-se com nome, município e atividade. Por último, apresente o problema e a solução objetivamente.',
            'Ordene os passos para participar com eficácia de uma audiência pública:',
            ['Saiba a data, local e tema',
             'Faça sua inscrição para falar',
             'Prepare depoimento de até 3 minutos com dados concretos',
             'Apresente-se: nome, município e atividade',
             'Apresente o problema e a solução objetivamente']
        ),
        mc1('O que acontece com as respostas que o pescador dá no app Rota Viva?',
            ['São usadas apenas para personalizar o conteúdo e calcular a pontuação',
             'São consolidadas e apresentadas ao MDA e ao MPA — embasam o Plano Safra da Pesca e políticas nacionais de apoio à pesca artesanal',
             'São compartilhadas com o SEBRAE para identificar pescadores para programas de capacitação',
             'São dados anônimos que ninguém lê — servem apenas para estatísticas internas'],
            1),
        vf('Liderança comunitária na pesca não exige cargo — o pescador que explica, convida e representa já está exercendo liderança.', true),
        mc1('Por que dados concretos tornam um depoimento em audiência pública mais eficaz?',
            ['Porque os organizadores só transcrevem falas com dados numéricos na ata oficial',
             'Porque transformam reclamações em demandas objetivas — números mostram a real dimensão do problema e permitem que os gestores tomem ações concretas',
             'Porque impressionam o público e aumentam o apoio popular ao pescador',
             'Porque a lei exige laudo técnico com dados para que o depoimento tenha validade'],
            1),
        matching('Associe cada entidade com sua principal função para o pescador artesanal do Amapá:', [
            { left: 'Colônia de Pescadores (Z-1/Z-3)', right: 'Representação municipal — Seguro-Defeso, CMDR, acesso ao RURAP' },
            { left: 'FEPA-AP', right: 'Representação estadual — leva demandas ao governo do Amapá e ao federal' },
            { left: 'BASA', right: 'Principal agente do PRONAF Pesca no Amapá' },
            { left: 'COOPESCA-AP', right: 'Cooperativa de pesca — comercialização com SIE/SIF e acesso a mercados formais' }
        ]),
        mc1('O que é o programa de Jovens Multiplicadores do Rota Viva para pescadores?',
            ['Programa de bolsas para jovens cursarem engenharia de pesca',
             'Formação de pescadores jovens (18–35 anos) para facilitar sessões nas comunidades ribeirinhas e multiplicar o projeto no território — recebem o badge Guardião dos Rios',
             'Ranking de produção entre jovens pescadores com premiação em equipamentos',
             'Programa de aceleração de negócios para pescadores que querem exportar'],
            1),
        smw(
            'Complete sobre participação e liderança na pesca artesanal:',
            'A [[b1]] representa os pescadores no município e tem papel no Seguro-Defeso e no CMDR. A [[b2]] leva as demandas ao nível estadual e federal. As respostas no Rota Viva chegam ao [[b3]] como dados de política pública. O Jovem Multiplicador recebe o badge [[b4]], a conquista mais prestigiosa da Rota da Pesca.',
            [
                { id: 'b1', opts: ['colônia', 'cooperativa', 'federação', 'câmara'], ci: 0 },
                { id: 'b2', opts: ['FEPA-AP', 'RURAP', 'BASA', 'COOPESCA-AP'], ci: 0 },
                { id: 'b3', opts: ['MDA e MPA', 'SEBRAE', 'IBAMA', 'MAPA'], ci: 0 },
                { id: 'b4', opts: ['Guardião dos Rios', 'Pescador de Ouro', 'Mestre da Pesca', 'Rio Vivo'], ci: 0 }
            ]
        ),
        mc1('Qual é a forma mais eficaz de o pescador garantir que as demandas da pesca artesanal sejam incluídas no plano de investimento municipal?',
            ['Enviar um ofício diretamente ao prefeito com assinaturas de todos os pescadores do município',
             'Ter representante ativo no CMDR que apresente dados concretos e propostas específicas (câmara fria, trapiche, gelo) nas reuniões mensais',
             'Contratar um advogado para representar a categoria em reuniões com a prefeitura',
             'Publicar as demandas nas redes sociais para pressionar o prefeito com a opinião pública'],
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
    console.log('🐟 Seed — Rota da Pesca: Módulo F — Sua Voz Vale\n');
    const moduleId = await createFolder('Módulo F — Sua Voz Vale: Liderança e Participação', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log(`\n\n✅ Módulo F — Rota da Pesca criado!\n   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

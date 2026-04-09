/**
 * seed-modulo-f-mel.js
 * Cria o Módulo F — Sua Voz Vale: Liderança e Participação na Rota do Mel.
 * Temas: CMDR, associações e cooperativas, audiências públicas, Rota Viva como fonte de política pública
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-f-mel.js
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
    title: 'Sua Voz no Campo: CMDR, Associações e Conselhos',
    video: {
        title: 'Sua Voz no Campo: CMDR, Associações e Conselhos',
        url: 'https://www.youtube.com/watch?v=JlFiAhG7X_A',
        description: 'O que é o Conselho Municipal de Desenvolvimento Rural (CMDR): composição, competências e como o apicultor pode participar. Diferença entre associação, cooperativa e conselho. Por que a participação coletiva amplia o poder de negociação do produtor rural perante o poder público municipal.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: CMDR, Associações e Participação Coletiva',
    description: 'Teste seus conhecimentos sobre o Conselho Municipal de Desenvolvimento Rural, o papel das associações e por que a participação coletiva transforma a realidade do campo.',
    fcType: 'quiz',
    questions: [
        mc1('O que é o Conselho Municipal de Desenvolvimento Rural (CMDR) e qual seu principal poder?',
            ['É um sindicato de trabalhadores rurais com poder de organizar greves e paralisações no campo',
             'É um órgão colegiado que reúne produtores rurais, prefeitura e entidades — define prioridades de investimento rural no município e influencia políticas locais',
             'É uma câmara legislativa específica para o campo com poder de aprovar leis municipais de agricultura',
             'É um comitê do governo federal para distribuir recursos do PRONAF nos municípios'],
            1),
        vf('O CMDR é composto exclusivamente por representantes do governo — agricultores familiares e apicultores não podem ser membros do conselho.', false),
        mc1('Qual é a diferença prática entre participar de uma associação de apicultores e participar do CMDR?',
            ['A associação cuida de interesses do grupo de apicultores; o CMDR influencia políticas públicas de todo o município rural',
             'Não há diferença — associação e CMDR fazem exatamente a mesma coisa com nomes diferentes',
             'A associação é para quem produz; o CMDR é apenas para técnicos e gestores públicos',
             'O CMDR substitui a associação — quem participa do conselho não precisa mais da associação'],
            0),
        listen(
            'Maria é apicultora no município de Picos, Piauí. O CMDR local vai votar o plano de uso do fundo municipal de desenvolvimento rural — são R$ 200 mil para investir em infraestrutura produtiva. Ela soube que há vagas para representantes da agricultura familiar no conselho.',
            'Por que é importante que Maria se candidate como representante dos apicultores no CMDR?',
            ['Para ganhar uma remuneração extra do município por participar das reuniões mensais',
             'Para garantir que as necessidades dos apicultores — casas de mel, acesso a água, assistência técnica — sejam incluídas nas prioridades de investimento do município',
             'Para fiscalizar se outros agricultores estão cumprindo as normas sanitárias do MAPA',
             'Para obter acesso privilegiado ao PRONAF com taxas de juros menores que os demais produtores'],
            1),
        mc1('Com que frequência costumam acontecer as reuniões do CMDR nos municípios?',
            ['Diariamente — o conselho funciona como um escritório permanente na prefeitura',
             'Mensalmente — reuniões ordinárias mensais com possibilidade de reuniões extraordinárias quando necessário',
             'Uma vez por ano — apenas para aprovar o plano anual de desenvolvimento rural',
             'A cada quatro anos — coincide com o calendário eleitoral municipal'],
            1),
        vf('O apicultor que participa do CMDR representa não apenas a si mesmo, mas todos os apicultores do município — sua voz tem peso coletivo nas decisões de política pública local.', true),
        mc1('O que o apicultor pode apresentar em uma reunião do CMDR para fortalecer sua demanda?',
            ['Apenas documentos oficiais emitidos pelo MAPA — opiniões pessoais não têm valor em reuniões do conselho',
             'Dados concretos da produção local — quantidade de apiários, produção em kg, renda gerada, empregos, dificuldades e propostas específicas',
             'Uma petição assinada por pelo menos 500 produtores — sem esse quórum a demanda não é aceita',
             'O resultado de pesquisas científicas da Embrapa — dados empíricos são os únicos aceitos no conselho'],
            1),
        matching('Associe cada instância de participação com sua principal função para o apicultor:', [
            { left: 'Associação de apicultores', right: 'Representação coletiva, compras em grupo, acesso a programas e certificações' },
            { left: 'CMDR', right: 'Influência nas prioridades de investimento do município — onde o dinheiro público rural vai' },
            { left: 'Sindicato rural (CONTAG/STR)', right: 'Defesa de direitos trabalhistas, assessoria jurídica e negociação com governo' },
            { left: 'Câmara Municipal', right: 'Aprovação de leis e orçamento municipal — onde se vota o Plano de Desenvolvimento Rural' }
        ]),
        vf('Participar de conselhos e associações não é perda de tempo — é o caminho para transformar demandas individuais em políticas públicas que beneficiam toda a comunidade apícola.', true),
        mc1('O que acontece quando o CMDR não tem representantes da agricultura familiar?',
            ['O conselho fica paralisado — sem produtores rurais o quórum não é atingido e as reuniões são canceladas',
             'As decisões são tomadas apenas pelo poder público e entidades patronais — os interesses do pequeno produtor ficam sem representação',
             'O governo federal intervém diretamente no município e define as prioridades de investimento sem consulta local',
             'Nada muda — as decisões do CMDR são apenas consultivas e a prefeitura decide sozinha de qualquer forma'],
            1),
        smw(
            'Complete sobre participação no CMDR:',
            'O CMDR é um órgão [[b1]] que reúne produtores rurais e poder público para definir [[b2]] de investimento no município. O apicultor que participa representa a [[b3]] dos apicultores locais. As reuniões acontecem [[b4]] e as decisões influenciam onde o dinheiro público [[b5]] vai ser aplicado.',
            [
                { id: 'b1', opts: ['colegiado', 'executivo', 'judicial', 'legislativo'], ci: 0 },
                { id: 'b2', opts: ['prioridades', 'recursos', 'programas', 'projetos'], ci: 0 },
                { id: 'b3', opts: ['categoria', 'empresa', 'cooperativa', 'associação'], ci: 0 },
                { id: 'b4', opts: ['mensalmente', 'anualmente', 'semanalmente', 'diariamente'], ci: 0 },
                { id: 'b5', opts: ['rural', 'federal', 'estadual', 'cooperativo'], ci: 0 }
            ]
        )
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Audiências Públicas e Como Fazer Sua Voz Chegar ao Governo',
    video: {
        title: 'Audiências Públicas e Como Fazer Sua Voz Chegar ao Governo',
        url: 'https://www.youtube.com/watch?v=h3PAVXi9w-Y',
        description: 'O que é uma audiência pública, quem pode participar e como se inscrever para falar. Passo a passo para preparar um depoimento de 3 minutos que seja direto, concreto e eficaz. Exemplos de apicultores do Piauí que apresentaram demandas em audiências e obtiveram resultados: abertura de casas de mel municipais, acesso a editais do PAA, ação da Emater-PI.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Audiências Públicas e Incidência Política',
    description: 'Teste seus conhecimentos sobre como participar de audiências públicas, preparar um depoimento eficaz e usar os canais de participação para levar as demandas da apicultura ao governo.',
    fcType: 'quiz',
    questions: [
        mc1('O que é uma audiência pública e quem tem direito de participar?',
            ['É uma reunião restrita a especialistas e técnicos — produtores rurais não têm acesso sem convite formal',
             'É um mecanismo de participação social onde qualquer cidadão pode assistir e, mediante inscrição, fazer uso da palavra para apresentar demandas e opiniões',
             'É uma sessão judicial aberta ao público para julgamento de casos que envolvem direitos rurais',
             'É uma reunião de câmara municipal exclusiva para vereadores e secretários municipais'],
            1),
        listenAndOrder(
            'Para falar em uma audiência pública, primeiro saiba a data, o local e o tema da audiência com antecedência. Segundo, faça sua inscrição para usar a palavra — geralmente com antecedência mínima de 24 horas. Terceiro, prepare seu depoimento com no máximo 3 minutos, sendo direto e usando exemplos concretos da sua realidade. Quarto, apresente-se, fale seu nome, município e atividade. Por último, apresente o problema e a solução que você propõe de forma objetiva.',
            'Ouça e ordene os passos para participar com eficácia de uma audiência pública:',
            ['Saiba a data, local e tema com antecedência',
             'Faça sua inscrição para usar a palavra',
             'Prepare depoimento de até 3 minutos com exemplos concretos',
             'Apresente-se: nome, município e atividade',
             'Apresente o problema e a solução de forma objetiva']
        ),
        vf('Em uma audiência pública, o apicultor deve falar de forma genérica sobre os problemas da agricultura familiar — quanto mais abrangente, mais impacto.', false),
        mc1('Por que dados concretos tornam um depoimento em audiência pública mais eficaz?',
            ['Porque os organizadores só registram falas com dados numéricos — sem números o depoimento não é transcrito na ata',
             'Porque números específicos (quantos apiários, quantos kg produzidos, qual a queda de renda, qual o investimento necessário) transformam reclamações em demandas objetivas que os gestores conseguem atender',
             'Porque os dados impressionam o público presente e aumentam o apoio popular ao produtor',
             'Porque a lei exige que todo depoimento em audiência pública seja acompanhado de relatório técnico com dados'],
            1),
        mc1('Qual é o tempo máximo que cada participante geralmente tem para falar em uma audiência pública?',
            ['30 minutos — tempo suficiente para apresentar todo o contexto do problema',
             '3 minutos — é preciso ser direto, concreto e objetivo',
             '15 minutos — desde que a audiência tenha menos de 10 inscritos',
             '1 minuto — audiências públicas são muito concorridas e o tempo é dividido igualmente'],
            1),
        listen(
            'João quer falar na audiência pública sobre o Plano Safra do Piauí. Ele tem 3 minutos. Está em dúvida se fala sobre todos os problemas da apicultura ou se foca em um tema específico.',
            'Qual é a melhor estratégia para João usar seus 3 minutos com máximo impacto?',
            ['Falar de todos os problemas rapidamente — quanto mais temas cobrir, mais o governo vai entender a situação',
             'Escolher uma demanda específica e urgente, apresentar dados concretos (ex.: "72 apicultores sem acesso a casa de mel municipal") e propor uma solução objetiva',
             'Agradecer ao governo pelos programas existentes antes de apresentar qualquer demanda — a cortesia abre portas',
             'Ler um texto escrito por um advogado ou técnico — o discurso técnico tem mais peso que o testemunho pessoal'],
            1),
        mc1('Quais canais o apicultor piauiense pode usar para levar suas demandas ao governo além das audiências públicas?',
            ['Apenas audiências públicas — é o único canal oficial reconhecido pelo MIDR',
             'CMDR municipal, associação/cooperativa, reuniões com o deputado estadual ou federal, ouvidoria do MIDR, app Rota Viva e carta ao Ministério da Agricultura',
             'Apenas o SEBRAE — a instituição tem canal direto com o governo para demandas do agronegócio familiar',
             'Apenas o sindicato rural — sem filiação sindical o produtor não tem representação no governo'],
            1),
        vf('O apicultor que apresenta uma demanda em audiência pública faz mais do que reclamar — ele alimenta o sistema de informação do governo com dados reais da realidade do campo.', true),
        matching('Associe cada tipo de demanda apícola com o canal mais adequado para apresentá-la:', [
            { left: 'Falta de casa de mel municipal no município', right: 'CMDR — prioridade de investimento municipal' },
            { left: 'Dificuldade de acesso ao PRONAF Apicultura', right: 'Audiência pública do Plano Safra ou reunião com agente do BASA/Banco do Brasil' },
            { left: 'Falta de assistência técnica da Emater-PI', right: 'Reunião com secretaria de agricultura do estado ou CMDR' },
            { left: 'Irregularidade no pagamento do PAA', right: 'Ouvidoria do MIDR ou CONAB — canal oficial de denúncia e reclamação' }
        ]),
        mc1('O que o apicultor deve fazer após participar de uma audiência pública para garantir que sua demanda não seja esquecida?',
            ['Nada — após a fala o governo é responsável por tomar providências sem necessidade de acompanhamento',
             'Acompanhar a ata da reunião, cobrar respostas dos gestores, registrar o andamento na associação e manter a demanda viva nas próximas reuniões do CMDR',
             'Publicar o depoimento nas redes sociais para pressionar o governo com opinião pública',
             'Contratar um advogado para converter a demanda em ação judicial caso não haja resposta em 30 dias'],
            1)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'Rota Viva: Você é Fonte de Política Pública',
    reading: {
        title: 'Rota Viva: Você é Fonte de Política Pública',
        body: `<h2>Rota Viva: Você é Fonte de Política Pública</h2>

<p>Cada resposta que você dá no app Rota Viva não é só uma nota ou um ponto no ranking. É um dado. E esse dado vai para o MDA (Ministério do Desenvolvimento Agrário) e influencia decisões que afetam toda a apicultura piauiense.</p>

<h3>Como Seus Dados Chegam ao Governo</h3>

<p>O sistema de Escuta Ativa do Rota Viva coleta informações sobre:</p>
<ul>
<li>Quantos apicultores têm acesso a cada programa do governo</li>
<li>Quais são os principais obstáculos de quem ainda não acessou o PRONAF ou o PAA</li>
<li>Como a seca está afetando as colmeias por região</li>
<li>Qual é o preço médio recebido e qual é o canal de venda mais usado</li>
<li>Que tipo de assistência técnica está chegando (ou não chegando) ao campo</li>
</ul>

<p>Esses dados são consolidados pela equipe do projeto e apresentados ao MDA em relatórios periódicos. Quando um gestor vê que 68% dos apicultores piauienses ainda não têm acesso à casa de mel municipal, isso vira uma meta do Plano Safra.</p>

<h3>O Que é Liderança Comunitária na Apicultura</h3>

<p>Liderança não exige cargo. O apicultor que:</p>
<ul>
<li>Explica para o vizinho como tirar o CAF</li>
<li>Convida o grupo para participar da reunião do CMDR</li>
<li>Registra no app as demandas da sua comunidade</li>
<li>Representa a associação em uma audiência pública</li>
</ul>

<p>...já é um líder comunitário. Esse apicultor multiplica o impacto do projeto para além de si mesmo.</p>

<h3>A Pirâmide de Participação</h3>

<p>A transformação da realidade do campo acontece em camadas:</p>

<ol>
<li><strong>Individual:</strong> o apicultor regulariza seus documentos, aprende, produz melhor</li>
<li><strong>Comunitário:</strong> a associação negocia coletivamente, acessa programas, representa no CMDR</li>
<li><strong>Municipal:</strong> o CMDR direciona investimentos públicos para onde o produtor precisa</li>
<li><strong>Estadual/Federal:</strong> os dados do Rota Viva e das audiências públicas embasam o Plano Safra e as políticas nacionais</li>
</ol>

<p>Você está no primeiro nível. Mas cada ação que você toma — aprender, participar, registrar, falar — sobe na pirâmide e muda o que acontece nos níveis acima.</p>

<h3>Liderança Jovem na Apicultura Piauiense</h3>

<p>O programa de Jovens Multiplicadores do Rota Viva forma apicultores jovens (18–35 anos) para serem facilitadores nas suas comunidades. O Jovem Multiplicador:</p>
<ul>
<li>Recebe formação complementar no app</li>
<li>Facilita sessões presenciais com grupos de apicultores</li>
<li>É reconhecido com o badge "Abelha-Rainha" — a conquista mais prestigiosa do sistema</li>
<li>Tem nome registrado no relatório do MDA como agente de transformação no território</li>
</ul>

<p><em>Fonte: MIDR, MDA, Emater-PI, SEBRAE-PI, Programa Rota Viva (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Liderança, Participação e Rota Viva',
    description: 'Teste seus conhecimentos sobre como o Rota Viva usa seus dados para política pública, o que é liderança comunitária e como a participação em diferentes níveis transforma a realidade do campo.',
    fcType: 'quiz',
    questions: [
        mc1('O que acontece com as respostas que o apicultor dá no app Rota Viva?',
            ['São usadas apenas para personalizar o conteúdo do app — nenhum dado sai do sistema',
             'São consolidadas e apresentadas ao MDA em relatórios periódicos — embasam decisões de política pública como o Plano Safra e os editais do PAA',
             'São vendidas para empresas de insumos agrícolas que usam os dados para fazer campanhas de marketing',
             'São usadas apenas para calcular a pontuação e o ranking dos participantes no jogo do app'],
            1),
        vf('As respostas que o apicultor dá no app Rota Viva são usadas para embasar decisões de política pública — cada dado registrado tem impacto real nas políticas que chegam ao campo.', true),
        mc1('O que caracteriza um líder comunitário na apicultura — segundo o enfoque do Rota Viva?',
            ['É o apicultor eleito presidente da associação — apenas quem tem cargo formal é considerado líder',
             'É quem explica para o vizinho como regularizar documentos, convida o grupo para reuniões, registra demandas e representa a comunidade — liderança não exige cargo',
             'É o apicultor com maior produção de mel — a liderança vem da competência técnica demonstrada em campo',
             'É o apicultor mais antigo da comunidade — a experiência acumulada é o principal critério de liderança'],
            1),
        matching('Associe cada nível da pirâmide de participação com o que acontece nele:', [
            { left: 'Nível individual', right: 'O apicultor regulariza documentos, aprende e melhora a produção' },
            { left: 'Nível comunitário', right: 'A associação negocia coletivamente e representa no CMDR' },
            { left: 'Nível municipal', right: 'O CMDR direciona investimentos públicos rurais com base nas demandas' },
            { left: 'Nível estadual/federal', right: 'Dados do Rota Viva e audiências embasam o Plano Safra e políticas nacionais' }
        ]),
        mc1('O que é o programa de Jovens Multiplicadores do Rota Viva?',
            ['Um programa de bolsas para apicultores jovens cursarem faculdade de Zootecnia ou Agronomia',
             'Uma formação que capacita apicultores jovens (18–35 anos) a facilitar sessões presenciais nas comunidades, multiplicando o impacto do projeto no território',
             'Um ranking de produção entre apicultores jovens do Piauí com premiação em equipamentos apícolas',
             'Um programa do SEBRAE de aceleração de negócios para apicultores que querem exportar mel'],
            1),
        listen(
            'O município de Floriano vai receber R$ 150 mil do fundo estadual de desenvolvimento rural. A secretaria de agricultura pediu ao CMDR que votasse em três prioridades. Os apicultores do município representam 40% dos produtores rurais, mas não têm representante no conselho.',
            'O que os apicultores de Floriano deveriam fazer imediatamente para garantir que suas necessidades sejam incluídas nas prioridades de investimento?',
            ['Esperar a próxima eleição municipal para tentar eleger um vereador simpático à apicultura',
             'Organizar uma reunião de emergência da associação, eleger um representante para o CMDR e apresentar uma proposta concreta de investimento (ex.: casa de mel municipal) antes da votação',
             'Fazer uma petição online com assinaturas de apicultores para pressionar a secretaria de agricultura',
             'Entrar com recurso no Tribunal de Contas do Estado alegando que os apicultores foram excluídos do processo'],
            1),
        vf('Quando o apicultor explica para o vizinho como tirar o CAF ou acessa o PRONAF, ele já está exercendo liderança comunitária — mesmo sem ter cargo em nenhuma associação.', true),
        mc1('Por que é importante que o apicultor registre suas dificuldades e demandas no app Rota Viva mesmo quando parecem pequenas?',
            ['Para acumular pontos extras no sistema de gamificação do app — cada registro vale 50 pontos',
             'Porque dados individuais somados de centenas de apicultores formam um diagnóstico preciso da realidade — o que parece pequeno individualmente se torna uma demanda urgente quando é a realidade de 500 produtores',
             'Para provar para o banco que está engajado no projeto e ter mais chances de aprovação no PRONAF',
             'Para que a Emater-PI saiba quem visitar — os técnicos priorizam apicultores com mais registros no app'],
            1),
        smw(
            'Complete sobre o papel do apicultor como agente de transformação:',
            'As respostas do apicultor no Rota Viva chegam ao [[b1]] como dados de política pública. O apicultor que participa do [[b2]] influencia onde o dinheiro público rural é aplicado. A [[b3]] comunitária começa com ações simples: explicar, convidar, representar. O Jovem [[b4]] multiplica o projeto no território e recebe o badge Abelha-Rainha.',
            [
                { id: 'b1', opts: ['MDA', 'SEBRAE', 'IBAMA', 'MAPA'], ci: 0 },
                { id: 'b2', opts: ['CMDR', 'PRONAF', 'PAA', 'PNAE'], ci: 0 },
                { id: 'b3', opts: ['liderança', 'cooperativa', 'associação', 'parceria'], ci: 0 },
                { id: 'b4', opts: ['Multiplicador', 'Apicultor', 'Líder', 'Cooperado'], ci: 0 }
            ]
        ),
        mc1('Qual é o badge mais prestigioso do sistema Rota Viva e quem pode recebê-lo?',
            ['Badge "Mel de Ouro" — entregue ao apicultor com maior produção de mel do Piauí no ano',
             'Badge "Abelha-Rainha" — recebido pelo Jovem Multiplicador formado para facilitar sessões comunitárias no território',
             'Badge "Guardião da Caatinga" — entregue ao apicultor que plantar mais mudas de plantas melíferas nativas',
             'Badge "Mestre Apicultor" — conquistado ao concluir todas as trilhas A–G com 100% de aproveitamento'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Voz e Minha Comunidade',
    description: 'Conte sua relação com os espaços de participação da sua comunidade — suas respostas ajudam o MDA a entender quão conectados estão os apicultores piauienses com as instâncias de decisão.',
    fcType: 'listen',
    questions: [
        mc1('Você participa de alguma associação, cooperativa ou sindicato rural?',
            ['Sim, sou associado/cooperado ativo e participo das reuniões', 'Sou associado mas raramente participo',
             'Já participei mas saí — tive decepção ou conflito', 'Nunca participei de nenhuma entidade coletiva'],
            0),
        mc1('Você sabe se existe um CMDR ativo no seu município?',
            ['Sim, sei que existe e já participei de pelo menos uma reunião', 'Sei que existe mas nunca participei',
             'Não sei se existe CMDR no meu município', 'Sei que não existe CMDR ativo na minha cidade'],
            0),
        mc1('Você já participou de alguma audiência pública, reunião com o poder público ou evento de participação social?',
            ['Sim, já falei ou apresentei demanda em audiência ou reunião', 'Já participei como ouvinte',
             'Nunca participei mas tenho interesse', 'Nunca participei e não tenho interesse'],
            0),
        shortAnswer('Se você pudesse falar diretamente para o Ministério do Desenvolvimento Agrário, qual seria a demanda mais urgente dos apicultores do seu município?'),
        shortAnswer('Existe algum jovem da sua comunidade ou família que você acha que deveria aprender apicultura? Como você poderia ajudá-lo a começar?')
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Compromisso de Participação',
    description: 'Registre um espaço de participação coletiva da sua comunidade e ganhe um cristal — cada apicultor que se engaja multiplica a voz da apicultura piauiense.',
    fcType: 'chest',
    questions: [
        diy(
            'Tire uma foto de um espaço de participação coletiva: reunião de associação de apicultores, sede da cooperativa, CMDR do seu município, evento da Emater-PI, ou qualquer encontro coletivo relacionado à apicultura ou ao campo. Se não tiver foto, tire uma foto do lugar onde esse encontro acontece e escreva qual demanda você levaria ao CMDR se fosse amanhã.',
            ['photo'],
            'Foto de reunião de associação, sede de cooperativa, evento do CMDR, ou espaço comunitário relacionado à apicultura.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo F',
    description: 'Revise todos os temas do Módulo F: CMDR, participação coletiva, audiências públicas e o papel do apicultor como fonte de política pública no Rota Viva.',
    fcType: 'review',
    questions: [
        mc1('O que é o CMDR e qual é seu principal poder no município?',
            ['É um sindicato rural que organiza greves e negociações coletivas com o agronegócio',
             'É um órgão colegiado que reúne produtores e poder público para definir prioridades de investimento rural municipal',
             'É uma câmara legislativa do campo que aprova leis de proteção à agricultura familiar',
             'É um comitê do governo federal para distribuir recursos do PRONAF nos municípios'],
            1),
        vf('O CMDR é composto exclusivamente por representantes do governo — agricultores familiares não podem ser membros.', false),
        listenAndOrder(
            'Para participar de uma audiência pública: primeiro saiba a data, local e tema. Segundo, faça sua inscrição. Terceiro, prepare seu depoimento de até 3 minutos com dados concretos. Quarto, apresente-se com nome, município e atividade. Por último, apresente o problema e a solução de forma objetiva.',
            'Ordene os passos para participar com eficácia de uma audiência pública:',
            ['Saiba a data, local e tema',
             'Faça sua inscrição para falar',
             'Prepare depoimento de até 3 minutos com dados concretos',
             'Apresente-se: nome, município e atividade',
             'Apresente o problema e a solução objetivamente']
        ),
        mc1('O que acontece com as respostas que o apicultor dá no app Rota Viva?',
            ['São usadas apenas para personalizar o conteúdo e calcular a pontuação no ranking',
             'São consolidadas e apresentadas ao MDA como dados de política pública — embasam o Plano Safra e as políticas nacionais de apoio à apicultura',
             'São compartilhadas com o SEBRAE para identificar apicultores para programas de capacitação',
             'São dados anônimos que ninguém lê — servem apenas para estatísticas internas do app'],
            1),
        vf('Liderança comunitária na apicultura não exige cargo — o apicultor que explica, convida e representa já está exercendo liderança.', true),
        mc1('Por que dados concretos tornam um depoimento em audiência pública mais eficaz?',
            ['Porque os organizadores só transcrevem falas com dados numéricos na ata oficial',
             'Porque transformam reclamações em demandas objetivas que gestores conseguem atender — números específicos mostram a real dimensão do problema',
             'Porque impressionam o público presente e aumentam o apoio popular ao produtor',
             'Porque a lei exige relatório técnico com dados para que o depoimento tenha validade legal'],
            1),
        matching('Associe cada nível de participação com o que acontece nele:', [
            { left: 'Nível individual', right: 'Regularizar documentos, aprender, produzir melhor' },
            { left: 'Nível comunitário', right: 'Associação negocia coletivamente e representa no CMDR' },
            { left: 'Nível municipal', right: 'CMDR direciona investimentos públicos rurais' },
            { left: 'Nível federal', right: 'Dados do Rota Viva embasam o Plano Safra e políticas nacionais' }
        ]),
        mc1('O que é o programa de Jovens Multiplicadores do Rota Viva?',
            ['Programa de bolsas para jovens cursarem zootecnia',
             'Formação de apicultores jovens (18–35 anos) para facilitar sessões presenciais nas comunidades e multiplicar o projeto no território',
             'Ranking de produção entre jovens apicultores com premiação em equipamentos',
             'Programa de aceleração de negócios para apicultores que querem exportar mel'],
            1),
        smw(
            'Complete sobre participação e liderança:',
            'O CMDR define [[b1]] de investimento rural no município. O apicultor que participa representa a [[b2]] dos produtores locais. As respostas no Rota Viva chegam ao [[b3]] como dados de política pública. O Jovem Multiplicador recebe o badge [[b4]], a conquista mais prestigiosa do sistema.',
            [
                { id: 'b1', opts: ['prioridades', 'recursos', 'programas', 'projetos'], ci: 0 },
                { id: 'b2', opts: ['categoria', 'empresa', 'cooperativa', 'região'], ci: 0 },
                { id: 'b3', opts: ['MDA', 'SEBRAE', 'IBAMA', 'MAPA'], ci: 0 },
                { id: 'b4', opts: ['Abelha-Rainha', 'Mel de Ouro', 'Guardião', 'Mestre'], ci: 0 }
            ]
        ),
        mc1('Qual é a forma mais eficaz de o apicultor garantir que as demandas da apicultura sejam incluídas no plano de investimento municipal?',
            ['Enviar um ofício diretamente ao prefeito com assinatura de todos os apicultores do município',
             'Ter representante ativo no CMDR que apresente dados concretos e propostas específicas nas reuniões mensais',
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
    console.log('🐝 Seed — Rota do Mel: Módulo F — Sua Voz Vale\n');
    const moduleId = await createFolder('Módulo F — Sua Voz Vale: Liderança e Participação', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log(`\n\n✅ Módulo F — Rota do Mel criado!\n   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

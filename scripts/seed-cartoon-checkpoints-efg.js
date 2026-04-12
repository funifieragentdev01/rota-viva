/**
 * seed-cartoon-checkpoints-efg.js
 * Cria 2 cartoon checkpoints (CP1 + CP2) nos módulos E, F e G
 * para as duas rotas (Mel e Pesca).
 * Não altera nem exclui nenhum conteúdo existente.
 * Posicionamento manual via painel.
 *
 * Uso: node scripts/seed-cartoon-checkpoints-efg.js
 */

const BASE_URL   = 'https://service2.funifier.com';
const TOKEN_MEL  = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';
const TOKEN_PESC = 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==';

const MODULES = {
    mel:  { E: '69d7d74928fe032bb2527efa', F: '69d7db2f28fe032bb25284b7', G: '69d7e8fc28fe032bb2529c4f' },
    pesc: { E: '69d7d75928fe032bb2527f4d', F: '69d7db3f28fe032bb2528504', G: '69d7e90e28fe032bb2529c9b' },
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function api(token, method, path, body) {
    const res = await fetch(BASE_URL + path, {
        method,
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.substring(0, 300)}`);
    try { return JSON.parse(text); } catch { return {}; }
}

function getId(r) {
    if (r && r._id) return r._id;
    if (Array.isArray(r) && r[0]?._id) return r[0]._id;
    throw new Error('Sem _id: ' + JSON.stringify(r).substring(0, 200));
}

async function createQuiz(token, title, description) {
    const id = getId(await api(token, 'PUT', '/v3/database/quiz', { title, description: description || '' }));
    console.log(`    ⭐ quiz "${title}": ${id}`);
    return id;
}

async function createQuestion(token, quizId, position, q) {
    getId(await api(token, 'PUT', '/v3/database/question', { quiz: quizId, position, ...q }));
    process.stdout.write('.');
}

async function createCartoon(token, moduleId, title, quizId) {
    const id = getId(await api(token, 'PUT', '/v3/database/folder', {
        title, type: 'lesson', parent: moduleId
    }));
    await api(token, 'PUT', '/v3/database/folder_content', {
        parent: id, content: quizId, type: 'cartoon', active: true
    });
    console.log(`    🎭 cartoon "${title}": ${id}`);
    return id;
}

// ─── Question builders ────────────────────────────────────────────────────────

const G1 = { grade: 1, extra: {} };
const G0 = { grade: 0, extra: {} };
const mc1 = (q, opts, ci) => ({
    type: 'MULTIPLE_CHOICE', select: 'one_answer', title: q, question: q,
    choices: opts.map((t, i) => ({ label: String.fromCharCode(65 + i), answer: t, ...(i === ci ? G1 : G0) }))
});
const vf = (q, c) => ({ type: 'TRUE_FALSE', title: q, question: q, correctAnswer: c, choices: [] });

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO E MEL — Cuide da Colmeia, Cuide do Planeta
// ═══════════════════════════════════════════════════════════════════════════════

const E_MEL_Q1 = [
    mc1('A Varroa é um ácaro que:', [
        'Melhora a qualidade do mel ao parasitar as abelhas',
        'Parasita as abelhas e enfraquece a colmeia se não for controlado',
        'Ataca apenas colmeias velhas e abandonadas',
        'É inofensivo em pequenas quantidades'
    ], 1),
    mc1('A Loque Americana é uma doença grave porque:', [
        'Reduz a produção de cera da colmeia',
        'É altamente contagiosa e pode destruir colmeias inteiras sem tratamento',
        'Afeta apenas as abelhas rainhas',
        'Causa escurecimento do mel sem danos à colmeia'
    ], 1),
    vf('Medicamentos veterinários para abelhas só devem ser usados conforme orientação técnica.', true),
    mc1('O que deve ser feito com uma colmeia diagnosticada com Loque Americana?', [
        'Transferir as abelhas para outra caixa imediatamente',
        'Notificar o serviço veterinário e seguir o protocolo de controle oficial',
        'Apenas reduzir a alimentação das abelhas',
        'Vender o mel produzido antes do tratamento'
    ], 1),
    mc1('Boas práticas na casa do mel incluem:', [
        'Usar roupas comuns sem proteção',
        'Superfícies limpas, equipamentos higienizados e ambiente ventilado',
        'Guardar o mel em recipientes usados sem lavar',
        'Misturar mel de diferentes apiários sem controle'
    ], 1),
    vf('A higiene na extração do mel é fundamental para evitar contaminação e garantir qualidade.', true),
];

const E_MEL_Q2 = [
    mc1('O apicultor contribui para o meio ambiente porque:', [
        'Produz mel sem impacto ambiental algum',
        'As abelhas polinizam plantas nativas e cultivadas, essenciais para o equilíbrio ecológico',
        'Consome pouca água no processo produtivo',
        'Usa apenas produtos orgânicos na apiaria'
    ], 1),
    mc1('A Caatinga é importante para a apicultura piauiense porque:', [
        'É o único bioma onde abelhas conseguem sobreviver',
        'Oferece floradas diversificadas durante o ano que garantem produção de mel',
        'Tem solo ideal para plantio de eucaliptos para as abelhas',
        'É área de preservação sem qualquer uso produtivo'
    ], 1),
    vf('Desmatar áreas de Caatinga prejudica diretamente a produção de mel e a vida das abelhas.', true),
    mc1('O apicultor pode ajudar a preservar a Caatinga:', [
        'Usando agrotóxicos para eliminar pragas nas flores',
        'Evitando queimadas e incentivando o plantio de espécies nativas',
        'Aumentando o número de colmeias sem limite',
        'Deslocando colmeias para áreas urbanas'
    ], 1),
    mc1('Por que o mel da Caatinga tem valor especial no mercado?', [
        'Por ser produzido em maior quantidade que outros méis',
        'Pela diversidade floral única da Caatinga que confere sabor e composição diferenciados',
        'Por ser mais barato de produzir',
        'Por não precisar de inspeção sanitária'
    ], 1),
    vf('Abelhas saudáveis em apiários bem manejados contribuem para a biodiversidade local.', true),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO E PESCA — Guardiões dos Rios
// ═══════════════════════════════════════════════════════════════════════════════

const E_PESC_Q1 = [
    mc1('Respeitar o tamanho mínimo de captura das espécies é importante porque:', [
        'Facilita o transporte do pescado',
        'Garante que os peixes se reproduzam antes de serem capturados, protegendo o estoque',
        'Reduz o custo das redes',
        'Aumenta o preço de venda imediatamente'
    ], 1),
    mc1('O uso de redes de malha inadequada (muito fina) causa:', [
        'Melhora na qualidade do pescado capturado',
        'Captura de peixes jovens que ainda não se reproduziram, esgotando o estoque',
        'Redução do tempo de pesca',
        'Nenhum impacto ambiental significativo'
    ], 1),
    vf('Espécies protegidas por lei não podem ser capturadas, independente do tamanho.', true),
    mc1('A qualidade sanitária do pescado começa:', [
        'No supermercado onde é vendido',
        'No momento da captura, com higiene e conservação adequada a bordo',
        'Na cooperativa de pescadores',
        'Na inspeção do MAPA'
    ], 1),
    mc1('Para manter o pescado fresco a bordo, o pescador deve:', [
        'Deixar o peixe ao sol para secar naturalmente',
        'Usar gelo na proporção correta e manter higiene no compartimento de porão',
        'Apenas cobrir com lonas plásticas',
        'Salgar imediatamente após a captura'
    ], 1),
    vf('Peixes com olhos opacos, guelras escurecidas e cheiro forte são sinais de deterioração.', true),
];

const E_PESC_Q2 = [
    mc1('Os Acordos de Pesca são instrumentos que:', [
        'Proíbem a pesca em toda a bacia hidrográfica',
        'Estabelecem regras coletivas de uso dos recursos pesqueiros definidas pelas próprias comunidades',
        'Substituem o RGP para pescadores artesanais',
        'São impostos pelo governo sem participação dos pescadores'
    ], 1),
    mc1('As RESEX (Reservas Extrativistas) no Amapá beneficiam o pescador porque:', [
        'Proíbem qualquer atividade produtiva na área',
        'Garantem território de uso exclusivo para comunidades tradicionais com gestão sustentável',
        'Aumentam o valor das terras para venda',
        'Obrigam o pescador a mudar de atividade'
    ], 1),
    vf('Pescadores que vivem em RESEX têm direito a participar da gestão da reserva.', true),
    mc1('O pescador artesanal é guardião dos rios porque:', [
        'Tem autoridade legal sobre todos os recursos aquáticos',
        'Conhece o comportamento dos peixes e pode alertar sobre mudanças no ecossistema',
        'É responsável pela fiscalização do IBAMA',
        'Tem poder de conceder licenças de pesca'
    ], 1),
    mc1('O que caracteriza uma pesca sustentável?', [
        'Maximizar a captura em todas as saídas',
        'Capturar apenas o necessário, respeitando os limites das espécies e o período de defeso',
        'Usar tecnologia avançada para localizar cardumes',
        'Pescar em áreas de proteção durante o defeso'
    ], 1),
    vf('Acordos de pesca bem cumpridos aumentam o estoque de peixes e a renda do pescador no longo prazo.', true),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO F MEL — Sua Voz Vale: Liderança e Participação
// ═══════════════════════════════════════════════════════════════════════════════

const F_MEL_Q1 = [
    mc1('O CMDR (Conselho Municipal de Desenvolvimento Rural) serve para:', [
        'Registrar propriedades rurais',
        'Garantir que agricultores e apicultores participem das decisões sobre políticas rurais do município',
        'Distribuir crédito rural diretamente',
        'Fiscalizar o cumprimento do calendário apícola'
    ], 1),
    mc1('Participar de uma associação de apicultores permite:', [
        'Vender mel sem nota fiscal',
        'Ter representação coletiva, acesso a programas e poder de negociação maior',
        'Dispensar o CAF',
        'Produzir mel sem seguir boas práticas'
    ], 1),
    vf('Apicultores organizados em associações ou cooperativas têm mais poder de influência nas políticas públicas.', true),
    mc1('Uma audiência pública é uma oportunidade para o apicultor:', [
        'Vender mel diretamente ao governo',
        'Apresentar suas demandas e influenciar decisões sobre políticas agrícolas',
        'Registrar sua propriedade rural',
        'Obter o CAF sem burocracia'
    ], 1),
    mc1('Para que a voz do apicultor chegue ao governo, ele pode:', [
        'Apenas votar nas eleições municipais',
        'Participar de conselhos, associações, audiências públicas e usar o Rota Viva',
        'Enviar cartas ao Ministério da Agricultura',
        'Contratar um advogado para representá-lo'
    ], 1),
    vf('O Rota Viva coleta informações dos apicultores que ajudam o governo a criar políticas mais eficientes.', true),
];

const F_MEL_Q2 = [
    mc1('O apicultor é "fonte de política pública" porque:', [
        'Tem formação acadêmica em políticas agrárias',
        'Suas respostas e dados no Rota Viva informam decisões do governo sobre a cadeia do mel',
        'Participa diretamente da elaboração de leis federais',
        'Pode vetar programas governamentais que não atendam suas necessidades'
    ], 1),
    mc1('A liderança comunitária do apicultor se expressa quando ele:', [
        'Produz mais mel que os vizinhos',
        'Compartilha conhecimento, organiza o grupo e representa a comunidade nas decisões',
        'Obtém o maior preço de venda do mel na região',
        'Tem o maior apiário do município'
    ], 1),
    vf('Um apicultor que participa do CMDR pode influenciar a destinação de recursos para a apicultura local.', true),
    mc1('Qual a importância de completar as atividades de escuta ativa no Rota Viva?', [
        'Serve apenas para ganhar pontos no aplicativo',
        'Gera dados reais que o governo usa para conhecer e apoiar os apicultores',
        'É obrigatório para manter o CAF ativo',
        'Dá direito a benefícios financeiros imediatos'
    ], 1),
    mc1('A participação coletiva dos apicultores fortalece:', [
        'Apenas a produção individual de cada apicultor',
        'A cadeia produtiva como um todo, melhorando preços, acesso a mercados e políticas públicas',
        'Somente as cooperativas de grande porte',
        'A fiscalização do IBAMA sobre a produção'
    ], 1),
    vf('Quanto mais apicultores participam e registram suas experiências, mais forte fica a representação do setor.', true),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO F PESCA — Sua Voz Vale: Liderança e Participação
// ═══════════════════════════════════════════════════════════════════════════════

const F_PESC_Q1 = [
    mc1('A Colônia de Pescadores é importante porque:', [
        'Emite o RGP diretamente ao pescador',
        'Representa os pescadores coletivamente e facilita o acesso a direitos e programas',
        'Substitui a necessidade de cooperativa',
        'Garante preço mínimo para o pescado'
    ], 1),
    mc1('A FEPA-AP (Federação dos Pescadores do Amapá) serve para:', [
        'Fiscalizar o cumprimento do defeso',
        'Representar e articular os interesses dos pescadores artesanais em nível estadual',
        'Distribuir o Seguro-Defeso diretamente',
        'Emitir licenças de pesca estaduais'
    ], 1),
    vf('Pescadores organizados em colônias e federações têm mais força para negociar com o governo.', true),
    mc1('Uma audiência pública sobre a pesca é uma oportunidade para o pescador:', [
        'Registrar suas redes e embarcações',
        'Apresentar demandas e influenciar políticas sobre o setor pesqueiro',
        'Obter o RGP sem burocracia',
        'Vender pescado diretamente ao governo'
    ], 1),
    mc1('Para participar das decisões sobre recursos pesqueiros, o pescador pode:', [
        'Apenas votar nas eleições estaduais',
        'Participar de conselhos, colônia, audiências públicas e usar o Rota Viva',
        'Enviar petições ao IBAMA',
        'Contratar um representante jurídico'
    ], 1),
    vf('O Rota Viva coleta dados dos pescadores que ajudam o governo a criar políticas pesqueiras mais eficazes.', true),
];

const F_PESC_Q2 = [
    mc1('O pescador é "fonte de política pública" porque:', [
        'Tem conhecimento técnico sobre oceanografia',
        'Suas respostas e dados no Rota Viva informam decisões do governo sobre a pesca artesanal',
        'Participa diretamente da elaboração de leis federais',
        'Pode vetar acordos de pesca que não o atendam'
    ], 1),
    mc1('A liderança do pescador na comunidade se expressa quando ele:', [
        'Captura mais peixe que todos os outros',
        'Compartilha conhecimento, organiza o grupo e representa a comunidade nas decisões',
        'Tem a embarcação mais moderna da região',
        'Pesca em mais locais que os outros pescadores'
    ], 1),
    vf('Um pescador que participa do conselho de gestão da RESEX pode influenciar as regras de uso do território.', true),
    mc1('Qual a importância de completar as atividades de escuta ativa no Rota Viva?', [
        'Serve apenas para ganhar pontos no aplicativo',
        'Gera dados reais que o governo usa para conhecer e apoiar os pescadores artesanais',
        'É obrigatório para renovar o RGP',
        'Dá direito a benefícios financeiros imediatos'
    ], 1),
    mc1('A participação coletiva dos pescadores fortalece:', [
        'Apenas a produção individual de cada pescador',
        'A cadeia pesqueira como um todo, melhorando preços, acesso a mercados e políticas públicas',
        'Somente as cooperativas de grande porte',
        'A fiscalização do IBAMA sobre a pesca'
    ], 1),
    vf('Quanto mais pescadores participam e registram suas experiências, mais forte fica a representação do setor.', true),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO G — Integridade e Cidadania (idêntico para mel e pesca)
// ═══════════════════════════════════════════════════════════════════════════════

const G_Q1 = [
    mc1('Como participante do Rota Viva, o produtor tem direito a:', [
        'Receber salário do governo por participar do app',
        'Acesso a informações sobre programas públicos, privacidade dos seus dados e suporte do programa',
        'Aprovar ou reprovar políticas públicas diretamente',
        'Dispensar qualquer documentação para acessar programas'
    ], 1),
    mc1('A privacidade dos dados informados no Rota Viva é garantida porque:', [
        'Os dados são publicados abertamente na internet',
        'O programa segue a LGPD e usa os dados apenas para fins de política pública',
        'Qualquer empresa pode acessar as informações dos produtores',
        'Os dados são compartilhados com todos os municípios automaticamente'
    ], 1),
    vf('O produtor tem direito a saber como seus dados serão usados antes de fornecê-los.', true),
    mc1('Se um produtor identificar irregularidades em programas do governo, ele pode:', [
        'Apenas ignorar, pois não é sua responsabilidade',
        'Denunciar pelos canais oficiais como a Ouvidoria, CGU ou Ministério Público',
        'Publicar nas redes sociais sem registrar formalmente',
        'Comunicar apenas ao atravessador ou intermediário'
    ], 1),
    mc1('O sigilo do denunciante em casos de irregularidades é garantido por:', [
        'Acordo informal com o servidor público',
        'Lei de Proteção ao Denunciante (Lei 13.964/2019 — Pacote Anticrime)',
        'Regulamento interno da cooperativa',
        'Decisão do prefeito municipal'
    ], 1),
    vf('Denunciar irregularidades no uso de recursos públicos é um ato de cidadania e protege toda a comunidade.', true),
];

const G_Q2 = [
    mc1('Usar recursos públicos (crédito, subsídios, programas) de forma correta significa:', [
        'Aplicar o dinheiro apenas no que foi aprovado e prestar contas quando solicitado',
        'Usar os recursos da forma que achar melhor, sem necessidade de comprovação',
        'Compartilhar o crédito com familiares sem vínculo com a atividade',
        'Não precisar devolver em caso de má aplicação'
    ], 0),
    mc1('A prestação de contas de recursos recebidos via PRONAF ou PAA é:', [
        'Opcional, a critério do produtor',
        'Obrigatória e o descumprimento pode gerar suspensão e devolução dos recursos',
        'Feita automaticamente pelo banco sem envolvimento do produtor',
        'Necessária apenas para valores acima de R$ 50.000'
    ], 1),
    vf('Desviar recursos públicos destinados à agricultura familiar é crime e pode resultar em prisão.', true),
    mc1('O compromisso com a integridade no Rota Viva significa:', [
        'Informar apenas os dados que favorecem o produtor',
        'Fornecer informações verdadeiras que ajudem o governo a criar políticas eficazes',
        'Participar apenas das atividades que oferecem recompensas',
        'Compartilhar a senha do aplicativo com outros produtores'
    ], 1),
    mc1('Qual atitude demonstra cidadania ativa do produtor rural?', [
        'Aguardar passivamente que o governo resolva todos os problemas',
        'Participar de conselhos, denunciar irregularidades e usar os canais de voz disponíveis',
        'Recusar todos os programas governamentais por desconfiança',
        'Votar apenas nas eleições e não se envolver em outros processos'
    ], 1),
    vf('Um produtor íntegro fortalece a confiança no programa e garante que os recursos cheguem a quem precisa.', true),
];

// ═══════════════════════════════════════════════════════════════════════════════
// Configuração dos módulos
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIGS = [
    {
        label: 'Módulo E — Mel (Cuide da Colmeia, Cuide do Planeta)',
        token: TOKEN_MEL, moduleId: MODULES.mel.E,
        cp1: { title: 'Checkpoint 1 — Módulo E', desc: 'Saúde das colmeias, pragas e higiene na casa do mel.', questions: E_MEL_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo E', desc: 'Apicultura e preservação da Caatinga.', questions: E_MEL_Q2 },
    },
    {
        label: 'Módulo E — Pesca (Guardiões dos Rios)',
        token: TOKEN_PESC, moduleId: MODULES.pesc.E,
        cp1: { title: 'Checkpoint 1 — Módulo E', desc: 'Pesca seletiva, espécies protegidas e qualidade do pescado.', questions: E_PESC_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo E', desc: 'Acordos de pesca, RESEX e guardiões dos rios.', questions: E_PESC_Q2 },
    },
    {
        label: 'Módulo F — Mel (Liderança e Participação)',
        token: TOKEN_MEL, moduleId: MODULES.mel.F,
        cp1: { title: 'Checkpoint 1 — Módulo F', desc: 'CMDR, associações e participação coletiva.', questions: F_MEL_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo F', desc: 'Liderança, audiências públicas e Rota Viva como voz do apicultor.', questions: F_MEL_Q2 },
    },
    {
        label: 'Módulo F — Pesca (Liderança e Participação)',
        token: TOKEN_PESC, moduleId: MODULES.pesc.F,
        cp1: { title: 'Checkpoint 1 — Módulo F', desc: 'Colônia, FEPA-AP e participação coletiva.', questions: F_PESC_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo F', desc: 'Liderança, audiências públicas e Rota Viva como voz do pescador.', questions: F_PESC_Q2 },
    },
    {
        label: 'Módulo G — Mel (Integridade e Cidadania)',
        token: TOKEN_MEL, moduleId: MODULES.mel.G,
        cp1: { title: 'Checkpoint 1 — Módulo G', desc: 'Direitos do participante, privacidade e canais de denúncia.', questions: G_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo G', desc: 'Uso correto dos recursos públicos e compromisso com a integridade.', questions: G_Q2 },
    },
    {
        label: 'Módulo G — Pesca (Integridade e Cidadania)',
        token: TOKEN_PESC, moduleId: MODULES.pesc.G,
        cp1: { title: 'Checkpoint 1 — Módulo G', desc: 'Direitos do participante, privacidade e canais de denúncia.', questions: G_Q1 },
        cp2: { title: 'Checkpoint 2 — Módulo G', desc: 'Uso correto dos recursos públicos e compromisso com a integridade.', questions: G_Q2 },
    },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

async function seedModule(cfg) {
    console.log(`\n${'═'.repeat(62)}`);
    console.log(`  ${cfg.label}`);
    console.log(`${'═'.repeat(62)}`);
    for (const [num, cp] of [[1, cfg.cp1], [2, cfg.cp2]]) {
        console.log(`\n  CP${num}: ${cp.title}`);
        const quizId = await createQuiz(cfg.token, cp.title, cp.desc);
        for (let i = 0; i < cp.questions.length; i++) {
            await createQuestion(cfg.token, quizId, i + 1, cp.questions[i]);
        }
        process.stdout.write(' ✓\n');
        await createCartoon(cfg.token, cfg.moduleId, cp.title, quizId);
    }
}

async function main() {
    console.log('=== Cartoon Checkpoints — Módulos E, F e G (Mel + Pesca) ===');
    for (const cfg of CONFIGS) await seedModule(cfg);
    console.log('\n\n✅ Tudo concluído! Ajuste as posições manualmente no painel.');
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

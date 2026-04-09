/**
 * seed-modulo-g-mel.js
 * Cria o Módulo G — Integridade e Cidadania na Rota do Mel.
 * Temas: direitos do participante, o que o Rota Viva pode/não pode fazer, canais de denúncia, uso correto de recursos públicos
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-g-mel.js
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
    title: 'Seus Direitos como Participante do Rota Viva',
    video: {
        title: 'Seus Direitos como Participante do Rota Viva',
        url: 'https://www.youtube.com/watch?v=JlFiAhG7X_A',
        description: 'O que o projeto Rota Viva promete e o que não promete: acesso gratuito ao conteúdo, certificado ao concluir, proteção dos seus dados. O que o app não pode fazer: não garante automaticamente acesso ao PAA, não substitui regularização, não distribui dinheiro. Como o participante pode verificar se o projeto está sendo executado corretamente.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Seus Direitos como Participante',
    description: 'Teste seus conhecimentos sobre o que o projeto Rota Viva pode e não pode fazer, seus direitos como participante e como seus dados são protegidos.',
    fcType: 'quiz',
    questions: [
        mc1('Quais são os direitos garantidos ao participante do projeto Rota Viva?',
            ['Receber dinheiro mensalmente por participar e acessar crédito do PRONAF automaticamente',
             'Acessar o conteúdo gratuitamente, receber certificado ao concluir as trilhas, ter seus dados protegidos e ser consultado sobre o projeto',
             'Ter assistência técnica presencial da Emater-PI toda semana e acesso garantido ao PAA',
             'Receber equipamentos apícolas gratuitos ao concluir todas as trilhas do app'],
            1),
        vf('O app Rota Viva garante automaticamente o acesso ao PAA para qualquer apicultor que se cadastrar na plataforma.', false),
        mc1('O que o Rota Viva FAZ de verdade pelo apicultor?',
            ['Distribui recursos do PRONAF diretamente no aplicativo, sem necessidade de ir ao banco',
             'Ensina como acessar os programas, quais documentos são necessários e como se regularizar — o acesso aos programas depende da regularização do próprio produtor',
             'Garante que a Emater-PI visite o apiário do apicultor em até 30 dias após o cadastro',
             'Conecta o apicultor diretamente com compradores de mel certificado em todo o Brasil'],
            1),
        vf('Seus dados pessoais no app Rota Viva são protegidos pela LGPD (Lei Geral de Proteção de Dados) — o projeto não pode compartilhá-los sem sua autorização.', true),
        mc1('O que acontece se um apicultor se cadastrar no Rota Viva mas não tiver CAF e nem RGP?',
            ['Ele é automaticamente bloqueado do app até regularizar os documentos',
             'Ele pode aprender normalmente no app, mas não conseguirá acessar os programas (PRONAF, PAA, PNAE) enquanto não regularizar os documentos necessários',
             'O app envia os documentos do CAF automaticamente para a prefeitura pelo sistema digital',
             'Ele recebe o certificado igual mas com uma marcação de "apicultor em regularização"'],
            1),
        listen(
            'Pedro ouviu de um vizinho que "quem se cadastrar no Rota Viva recebe kit apícola do governo com colmeias e indumentária". Ele se cadastrou esperando receber o kit. Mas o kit nunca chegou.',
            'O que está errado no entendimento de Pedro e o que o Rota Viva realmente oferece?',
            ['Pedro tinha razão — o kit deveria ter chegado; provavelmente houve erro no sistema do governo',
             'O vizinho passou informação errada — o Rota Viva é uma plataforma de aprendizado gratuita, não distribui kits ou equipamentos; Pedro deve denunciar quem prometeu o kit',
             'O kit só chega para apicultores que completam 100% das trilhas — Pedro deve continuar estudando',
             'O kit existe mas é distribuído apenas pela Emater-PI presencialmente após a conclusão das trilhas'],
            1),
        mc1('Quais informações o app Rota Viva coleta dos participantes e para que são usadas?',
            ['Dados bancários e CPF — para transferir recursos do PRONAF diretamente na conta do participante',
             'Respostas das atividades, localização aproximada (município) e dados de progresso nas trilhas — usados para melhorar o app e gerar relatórios de política pública para o MDA',
             'Dados biométricos (foto, impressão digital) — para verificar se a pessoa realmente é o apicultor cadastrado',
             'Histórico de produção completo e notas fiscais emitidas — para calcular automaticamente os impostos devidos'],
            1),
        vf('O participante tem o direito de ser consultado sobre o projeto Rota Viva — as pesquisas de satisfação e a Escuta Ativa são formas legítimas de exercer esse direito.', true),
        matching('Associe cada afirmação com o que é VERDADEIRO ou FALSO sobre o Rota Viva:', [
            { left: 'O app ensina como acessar o PRONAF e o PAA', right: 'VERDADEIRO — orienta o processo, não substitui a regularização' },
            { left: 'O app distribui dinheiro mensalmente aos participantes', right: 'FALSO — o Rota Viva é plataforma educacional gratuita' },
            { left: 'O participante recebe certificado ao concluir as trilhas', right: 'VERDADEIRO — direito garantido a todo participante' },
            { left: 'O app garante acesso automático ao PAA ao se cadastrar', right: 'FALSO — o acesso depende de documentação e regularização' }
        ]),
        mc1('O que o apicultor deve fazer se alguém pedir dinheiro em troca de cadastro no Rota Viva ou de acesso privilegiado aos programas do governo?',
            ['Pagar se o valor for pequeno — é comum pagar taxas de cadastro em programas governamentais',
             'Recusar imediatamente — o cadastro no Rota Viva é gratuito e ninguém tem direito de cobrar para intermediar o acesso a programas públicos. Denunciar à ouvidoria do MIDR.',
             'Negociar o valor — se o programa realmente valer a pena, um pequeno pagamento pode ser justificável',
             'Pagar e depois tentar recuperar o dinheiro pela Receita Federal na declaração do imposto de renda'],
            1),
        smw(
            'Complete sobre os direitos do participante do Rota Viva:',
            'O participante tem direito de acessar o conteúdo [[b1]], receber [[b2]] ao concluir as trilhas e ter seus dados protegidos pela [[b3]]. O app [[b4]] garante acesso automático ao PAA — o acesso depende de [[b5]] do produtor.',
            [
                { id: 'b1', opts: ['gratuitamente', 'mensalmente', 'anualmente', 'semanalmente'], ci: 0 },
                { id: 'b2', opts: ['certificado', 'dinheiro', 'kit', 'equipamento'], ci: 0 },
                { id: 'b3', opts: ['LGPD', 'PRONAF', 'MAPA', 'CAF'], ci: 0 },
                { id: 'b4', opts: ['não', 'sempre', 'às vezes', 'raramente'], ci: 0 },
                { id: 'b5', opts: ['regularização', 'cadastro', 'pagamento', 'indicação'], ci: 0 }
            ]
        )
    ]
},

// ── L03: Vídeo ───────────────────────────────────────────────────────────────
{
    title: 'Como Denunciar Irregularidades — Seus Canais de Proteção',
    video: {
        title: 'Como Denunciar Irregularidades — Seus Canais de Proteção',
        url: 'https://www.youtube.com/watch?v=h3PAVXi9w-Y',
        description: 'Os canais oficiais de denúncia do Governo Federal: Ouvidoria do MIDR (0800 729 0350), e-OUV (falabr.cgu.gov.br), ouvidoria do MAPA. Como fazer uma denúncia anônima. O que pode ser denunciado: cobrança indevida, desvio de recursos, exclusão irregular de beneficiários, favorecimento. O que acontece com a denúncia após o registro.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Canais de Denúncia e Proteção',
    description: 'Teste seus conhecimentos sobre os canais oficiais de denúncia de irregularidades em programas governamentais e como o apicultor pode proteger seus direitos.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é o canal oficial do Governo Federal para denúncias de irregularidades em programas como PRONAF, PAA e PNAE?',
            ['Delegacia de Polícia — todas as denúncias contra o governo devem ser registradas como boletim de ocorrência',
             'Ouvidoria do MIDR / CGU (falabr.cgu.gov.br ou 0800 729 0350) — canal gratuito para reclamações, denúncias e elogios sobre programas do governo federal',
             'Rádio comunitária local — a publicidade é a melhor forma de pressionar o governo a agir',
             'Câmara Municipal — apenas os vereadores têm legitimidade para questionar programas federais'],
            1),
        vf('Uma denúncia de irregularidade em programa governamental pode ser feita de forma anônima pela ouvidoria — o denunciante não precisa se identificar.', true),
        mc1('Quais situações justificam uma denúncia à ouvidoria do governo?',
            ['Apenas crimes comprovados com documentação — sem provas concretas a denúncia não tem efeito',
             'Cobrança de dinheiro para acessar programas gratuitos, exclusão irregular de beneficiários, desvio de recursos públicos ou favorecimento indevido',
             'Apenas situações que prejudicam diretamente o denunciante — problemas de terceiros não devem ser denunciados',
             'Somente quando o valor desviado supera R$ 10.000 — denúncias de pequeno valor não são investigadas'],
            1),
        listen(
            'Maria soube que o técnico responsável pelo PAA na sua região está cobrando R$ 200 de cada apicultor para incluir na lista de fornecedores. Ela tem medo de fazer a denúncia e perder o acesso ao programa.',
            'O que Maria deveria fazer e quais são seus direitos nessa situação?',
            ['Pagar os R$ 200 — é uma taxa informal que todo técnico cobra e é melhor não arrumar confusão',
             'Fazer a denúncia anônima na ouvidoria do MIDR — a cobrança é ilegal, ela não pode perder o acesso por denunciar e sua identidade pode ser protegida',
             'Conversar com o técnico e negociar um valor menor — R$ 100 é mais razoável',
             'Desistir do PAA — não vale arrumar confusão com técnico do governo por causa de um programa'],
            1),
        mc1('O que acontece com a denúncia após ser registrada na ouvidoria do governo?',
            ['Nada — as ouvidorias recebem denúncias mas raramente as investigam na prática',
             'A ouvidoria registra, encaminha para o órgão responsável para investigação e deve dar uma resposta ao denunciante dentro do prazo legal (geralmente 30 dias)',
             'A denúncia vai direto para a polícia que instaura inquérito imediatamente',
             'A denúncia fica arquivada por 5 anos antes de ser analisada — o prazo de resposta é muito longo'],
            1),
        vf('O apicultor que denuncia uma irregularidade está exercendo sua cidadania — não é delação, é proteção dos recursos públicos que pertencem a toda a sociedade.', true),
        mc1('Como acessar a plataforma federal de ouvidorias para registrar uma denúncia ou reclamação?',
            ['Apenas presencialmente nas sedes regionais do MIDR em cada estado',
             'Pelo site falabr.cgu.gov.br ou pelo telefone 162 (Fala.BR) — gratuito, disponível 24h, com opção de anonimato',
             'Pelo aplicativo Rota Viva, usando o botão de denúncia na tela principal do app',
             'Apenas por carta registrada endereçada diretamente ao Ministro do Desenvolvimento Agrário'],
            1),
        mc1('O que é o "sigilo do denunciante" na ouvidoria do governo e por que é importante?',
            ['É a obrigação do denunciante de manter em sigilo o nome do funcionário denunciado até a conclusão da investigação',
             'É a proteção legal que impede que a identidade do denunciante seja revelada ao acusado — protege de retaliações e incentiva que irregularidades sejam reportadas',
             'É a classificação sigilosa da denúncia que impede o público de saber que ela foi feita',
             'É um acordo informal entre o denunciante e o ouvidor — não tem respaldo legal, apenas ético'],
            1),
        matching('Associe cada tipo de irregularidade com o canal mais adequado para denunciar:', [
            { left: 'Técnico cobrando dinheiro para incluir no PAA', right: 'Ouvidoria do MIDR — cobrança indevida em programa federal' },
            { left: 'Cooperativa desviando recursos do PRONAF coletivo', right: 'Ouvidoria do MIDR / CGU + Ministério Público Federal' },
            { left: 'Prefeitura excluindo apicultores da chamada pública do PNAE sem justificativa', right: 'Ouvidoria do MIDR + FNDE (Fundo Nacional de Desenvolvimento da Educação)' },
            { left: 'Técnico da Emater-PI cobrando por visita que deveria ser gratuita', right: 'Ouvidoria da Emater-PI e Secretaria de Agricultura do Piauí' }
        ]),
        vf('Uma denúncia sem provas documentais não pode ser registrada na ouvidoria — é obrigatório apresentar documentos antes de qualquer registro.', false),
        mc1('Qual é a diferença entre uma "reclamação" e uma "denúncia" na ouvidoria do governo?',
            ['Não há diferença — são termos sinônimos usados indistintamente nas ouvidorias',
             'Reclamação é sobre insatisfação com atendimento ou serviço público; denúncia é sobre possível crime, irregularidade ou desvio que prejudica o interesse público',
             'Reclamação é para casos graves; denúncia é para insatisfações menores que não constituem crime',
             'Reclamação exige identificação; denúncia pode ser anônima — essa é a única diferença prática'],
            1)
    ]
},

// ── L05: Leitura ─────────────────────────────────────────────────────────────
{
    title: 'Uso Correto dos Recursos Públicos: Seu Compromisso com a Integridade',
    reading: {
        title: 'Uso Correto dos Recursos Públicos: Seu Compromisso com a Integridade',
        body: `<h2>Uso Correto dos Recursos Públicos: Seu Compromisso com a Integridade</h2>

<p>Recursos públicos — PRONAF, PAA, PNAE, Seguro-Defeso — são dinheiro de todos os brasileiros. Quando um produtor usa esses recursos corretamente, ele fortalece a categoria e abre caminho para os próximos. Quando os desvia, prejudica todos.</p>

<h3>O PRONAF e a Finalidade Declarada</h3>

<p>O PRONAF é um crédito com finalidade específica: você declara para que vai usar (equipamentos apícolas, colmeias, casa de mel, capital de giro) e o banco libera com juros subsidiados.</p>

<p><strong>Usar o dinheiro para outra finalidade é fraude contratual:</strong></p>
<ul>
<li>O banco pode exigir devolução imediata do valor total com multa e juros de mercado</li>
<li>O produtor pode ser bloqueado para novos créditos rurais por anos</li>
<li>Em casos graves, pode responder criminalmente por estelionato ou fraude contra o Sistema Financeiro Nacional</li>
</ul>

<p><strong>O que fazer se tiver dificuldade em usar o crédito para a finalidade?</strong> Falar com o gerente do banco antes de desviar. Há mecanismos de renegociação e mudança de finalidade com aprovação prévia — é muito melhor que a alternativa.</p>

<h3>O PAA e a Veracidade da Produção</h3>

<p>No PAA (Programa de Aquisição de Alimentos), o apicultor declara quanto produz e entrega esse volume ao programa. Entregar menos do que o contratado ou declarar produção que não existe é fraude:</p>

<ul>
<li>Suspensão do programa por até 2 anos</li>
<li>Devolução dos valores recebidos sem entrega</li>
<li>Comunicação ao MPF (Ministério Público Federal) em casos de valor significativo</li>
</ul>

<h3>A Cooperativa e a Transparência Obrigatória</h3>

<p>Cooperativas apícolas são obrigadas por lei a:</p>
<ul>
<li>Apresentar balanço anual aos cooperados</li>
<li>Convocar assembleia geral para aprovação das contas</li>
<li>Permitir auditoria pelos associados quando solicitada</li>
<li>Publicar as sobras e como foram calculadas</li>
</ul>

<p>O cooperado que não recebe as informações financeiras tem o direito — e o dever — de exigir transparência ou denunciar à OCB (Organização das Cooperativas Brasileiras) e ao MIDR.</p>

<h3>O Apicultor como Guardião da Integridade</h3>

<p>Ser guardião da integridade não é ser vigilante dos outros — é ser exemplo. O apicultor íntegro:</p>
<ul>
<li>Usa o PRONAF para o que declarou</li>
<li>Entrega ao PAA o que produziu de verdade</li>
<li>Cobra transparência da cooperativa</li>
<li>Denuncia quando vê irregularidades — por si e por todos os que virão depois</li>
</ul>

<p>Cada recurso público bem usado é um argumento para o governo aumentar os programas no próximo ano. Cada desvio é um argumento para cortá-los.</p>

<p><em>Fonte: CGU, TCU, Banco Central, MAPA, Lei nº 11.326/2006, Lei nº 5.764/1971 (Cooperativas), Lei nº 13.709/2018 (LGPD) (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Integridade e Uso dos Recursos Públicos',
    description: 'Teste seus conhecimentos sobre o uso correto do PRONAF, do PAA e da cooperativa apícola — e por que a integridade do produtor protege toda a categoria.',
    fcType: 'quiz',
    questions: [
        mc1('João recebeu crédito do PRONAF para comprar colmeias e equipamentos apícolas. Um amigo pede emprestado R$ 5.000 do crédito para reformar a casa, prometendo devolver em 3 meses. O que João deve fazer?',
            ['Emprestar — um amigo sempre paga e o valor não é grande',
             'Usar todo o crédito para a finalidade declarada no contrato do PRONAF — emprestar é desvio de finalidade e pode resultar em cobrança integral com multa',
             'Emprestar metade e usar a outra metade nas colmeias — um meio-termo equilibrado',
             'Devolver o crédito ao banco e pedir um novo depois que o amigo devolver o dinheiro'],
            1),
        vf('Usar o crédito PRONAF para finalidade diferente da declarada no contrato é uma fraude que pode resultar em devolução imediata, bloqueio para novos créditos e, em casos graves, processo criminal.', true),
        mc1('Ana assinou contrato no PAA para fornecer 300 kg de mel por ano. Na safra ruim, só produziu 180 kg. O que Ana deve fazer?',
            ['Comprar 120 kg de mel de outros apicultores e vender como se fosse o próprio para cumprir o contrato',
             'Comunicar à CONAB ou ao gestor local do PAA antes do vencimento, informar a produção real e negociar a quantidade — entregar o que produziu com transparência',
             'Entregar os 300 kg declarados mesmo que parte seja de qualidade inferior — o programa não fiscaliza a origem',
             'Não entregar nada e esperar ser notificado — o governo não tem como saber o quanto você produziu'],
            1),
        mc1('O que a cooperativa apícola é obrigada por lei a fazer em relação à transparência financeira com os cooperados?',
            ['Apenas informar verbalmente o total de mel comercializado — demonstrativos escritos não são obrigatórios',
             'Apresentar balanço anual, convocar assembleia para aprovação das contas, permitir auditoria e publicar o cálculo das sobras',
             'Enviar extrato mensal por WhatsApp — a legislação cooperativista modernizou as exigências para canais digitais',
             'Contratar contador externo independente — a transparência é obrigação do contador, não da diretoria'],
            1),
        listen(
            'Carlos é cooperado de uma cooperativa apícola e não recebe extrato nem é convocado para assembleia há 2 anos. A diretoria diz que "não deu sobra nenhuma" mas não apresenta o balanço. Carlos tem suspeitas de irregularidade.',
            'O que Carlos tem o direito — e o dever — de fazer nessa situação?',
            ['Aceitar a explicação da diretoria — ela conhece melhor a situação financeira da cooperativa',
             'Exigir formalmente o balanço e a convocação da assembleia. Se negado, denunciar à OCB e ao MIDR — a transparência financeira é um direito legal de todo cooperado',
             'Sair da cooperativa silenciosamente — não vale arrumar confusão com a diretoria',
             'Contratar um advogado particular para entrar com ação contra a cooperativa antes de qualquer outra medida'],
            1),
        vf('O apicultor que usa corretamente os recursos públicos (PRONAF, PAA) fortalece toda a categoria — cada recurso bem usado é um argumento para o governo ampliar os programas no próximo ciclo.', true),
        mc1('Quais são as consequências para o apicultor que declara produção falsa no PAA para receber mais do que produziu?',
            ['Apenas advertência informal — o programa é tolerante com pequenas diferenças de quantidade',
             'Suspensão do programa por até 2 anos, devolução dos valores recebidos sem entrega e comunicação ao MPF em casos de valor significativo',
             'Multa de 10% do valor contratado — única penalidade prevista para irregularidades no PAA',
             'Exclusão permanente do PAA mas mantém acesso ao PNAE e ao PRONAF sem restrição'],
            1),
        matching('Associe cada situação com a consequência correta:', [
            { left: 'PRONAF usado para finalidade diferente da declarada', right: 'Devolução imediata + multa + bloqueio para novos créditos rurais' },
            { left: 'PAA — entregar menos do que o contratado sem avisar', right: 'Suspensão do programa + devolução dos valores recebidos' },
            { left: 'Cooperativa sem transparência financeira', right: 'Direito do cooperado exigir balanço + denúncia à OCB e ao MIDR' },
            { left: 'Técnico cobrando para incluir no PAA', right: 'Denúncia à ouvidoria do MIDR — cobrança ilegal em programa público' }
        ]),
        vf('Se o apicultor tiver dificuldade em usar o crédito PRONAF para a finalidade declarada, ele pode conversar com o banco antes de desviar — há mecanismos de renegociação e mudança de finalidade com aprovação prévia.', true),
        mc1('Por que a integridade individual do apicultor afeta toda a categoria?',
            ['Não afeta — cada produtor responde apenas pelos seus próprios atos sem impacto nos demais',
             'Cada desvio individual é usado pelo governo como justificativa para reduzir ou encerrar programas — e cada uso correto é argumento para ampliar os benefícios para toda a categoria',
             'Afeta apenas a cooperativa da qual o apicultor faz parte — não tem impacto nos programas federais',
             'Afeta apenas o município — irregularidades individuais resultam em suspensão do programa no município, não no estado'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Experiência com os Programas do Governo',
    description: 'Conte sua experiência com os programas públicos — suas respostas ajudam o MDA a identificar irregularidades e melhorar a execução dos programas na região.',
    fcType: 'listen',
    questions: [
        mc1('Você já acessou algum programa público como PRONAF, PAA ou PNAE?',
            ['Sim, acesso e estou satisfeito com o processo', 'Sim, mas tive dificuldades ou irregularidades',
             'Nunca consegui acessar, embora tenha tentado', 'Nunca tentei acessar esses programas'],
            0),
        mc1('Você já viu ou soube de alguma irregularidade em programa governamental na sua região (cobrança indevida, desvio, exclusão injusta)?',
            ['Sim, vi ou soube e denunciei ao canal competente', 'Sim, vi ou soube mas não sabia o que fazer',
             'Não sei de nenhuma irregularidade na minha região', 'Prefiro não responder'],
            0),
        mc1('Você sabe qual é o canal oficial para denunciar irregularidades em programas federais?',
            ['Sim, sei e já usei (ouvidoria do MIDR, falabr.cgu.gov.br ou 162)', 'Sei que existe mas não sei como usar',
             'Não sabia que existia um canal oficial para isso', 'Não tenho interesse em usar canais de denúncia'],
            0),
        shortAnswer('Você já teve alguma experiência negativa com um programa do governo (PRONAF, PAA, PNAE, ATER)? O que aconteceu e como poderia ter sido diferente?'),
        shortAnswer('O que você faria diferente se soubesse que algum recurso público destinado a apicultores da sua região estava sendo desviado?')
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Compromisso com a Integridade',
    description: 'Registre seu compromisso com o uso correto dos recursos públicos e ganhe um cristal — cada apicultor íntegro fortalece toda a categoria.',
    fcType: 'chest',
    questions: [
        diy(
            'Escreva (pode ser um texto curto digitado) ou tire uma foto de algo que representa seu compromisso com a integridade: um documento que mostra que você usa os recursos corretamente (nota fiscal, contrato do PRONAF bem utilizado, comprovante de entrega no PAA), ou simplesmente escreva: "Meu compromisso é usar os recursos públicos corretamente e denunciar quando vejo irregularidades, porque cada recurso bem usado abre portas para toda a apicultura piauiense."',
            ['photo'],
            'Foto de documento de uso correto de recurso público (contrato, nota fiscal, comprovante de entrega), ou texto com compromisso pessoal de integridade.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo G',
    description: 'Revise todos os temas do Módulo G: direitos do participante, canais de denúncia e uso correto dos recursos públicos — o apicultor como guardião da integridade do projeto.',
    fcType: 'review',
    questions: [
        mc1('Quais são os direitos garantidos ao participante do projeto Rota Viva?',
            ['Receber kit apícola ao completar as trilhas e acesso automático ao PAA',
             'Acessar o conteúdo gratuitamente, receber certificado ao concluir, ter dados protegidos e ser consultado sobre o projeto',
             'Assistência técnica semanal da Emater-PI e crédito PRONAF pré-aprovado',
             'Renda mensal do governo durante o período de aprendizado nas trilhas'],
            1),
        vf('O app Rota Viva garante automaticamente o acesso ao PAA para todo apicultor cadastrado.', false),
        mc1('Qual é o canal federal gratuito para denunciar irregularidades em programas do governo?',
            ['Delegacia de Polícia — todas as denúncias contra funcionários públicos exigem boletim de ocorrência',
             'Ouvidoria do MIDR / plataforma Fala.BR (falabr.cgu.gov.br ou 162) — gratuito, disponível 24h, com opção de anonimato',
             'Câmara Municipal — apenas vereadores têm legitimidade para questionar programas federais',
             'Rádio comunitária — a publicidade é a melhor forma de pressionar o governo a investigar'],
            1),
        vf('Uma denúncia de irregularidade em programa governamental pode ser feita de forma anônima — o denunciante não precisa se identificar.', true),
        mc1('João recebeu PRONAF para comprar colmeias e usou parte para pagar dívida pessoal. Quais são as consequências?',
            ['Advertência informal — o banco é tolerante com pequenos desvios de finalidade',
             'Devolução imediata do valor total com multa, bloqueio para novos créditos rurais e, em casos graves, processo criminal por fraude',
             'Multa de 5% do valor — única penalidade prevista para desvio de finalidade do PRONAF',
             'Apenas comunicação ao CMDR do município — o banco não toma outras providências'],
            1),
        mc1('O que Ana deve fazer se contratou 300 kg no PAA mas só produziu 200 kg por causa da seca?',
            ['Comprar 100 kg de outro apicultor e vender como próprio para cumprir o contrato',
             'Comunicar à CONAB antes do vencimento, informar a produção real e negociar — transparência protege o produtor',
             'Não entregar nada e esperar a notificação — o programa não tem como fiscalizar',
             'Entregar os 300 kg com qualidade inferior sem avisar — quantidade é o que importa no contrato'],
            1),
        matching('Associe cada situação com a ação correta do apicultor:', [
            { left: 'Alguém cobra dinheiro para incluir no PAA', right: 'Recusar e denunciar na ouvidoria do MIDR — cobrança é ilegal' },
            { left: 'Cooperativa não apresenta balanço há 2 anos', right: 'Exigir formalmente o balanço; se negado, denunciar à OCB e ao MIDR' },
            { left: 'PRONAF recebido — amigo pede dinheiro emprestado', right: 'Recusar — usar o crédito para a finalidade declarada no contrato' },
            { left: 'Safra menor que o contratado no PAA', right: 'Comunicar à CONAB antes do prazo e entregar o que produziu' }
        ]),
        vf('O apicultor que usa corretamente os recursos públicos e denuncia irregularidades está protegendo toda a categoria — cada recurso bem usado é argumento para ampliar os programas.', true),
        smw(
            'Complete sobre integridade no uso de recursos públicos:',
            'O PRONAF deve ser usado para a [[b1]] declarada no contrato. O PAA exige entrega do que foi [[b2]] de verdade. A cooperativa é obrigada a apresentar [[b3]] anual. Denúncias podem ser feitas [[b4]] pela ouvidoria do governo, sem revelar a [[b5]] do denunciante.',
            [
                { id: 'b1', opts: ['finalidade', 'origem', 'data', 'cooperativa'], ci: 0 },
                { id: 'b2', opts: ['produzido', 'declarado', 'comprado', 'vendido'], ci: 0 },
                { id: 'b3', opts: ['balanço', 'extrato', 'relatório', 'certidão'], ci: 0 },
                { id: 'b4', opts: ['anonimamente', 'pessoalmente', 'advogado', 'testemunhas'], ci: 0 },
                { id: 'b5', opts: ['identidade', 'denúncia', 'prova', 'valor'], ci: 0 }
            ]
        ),
        mc1('Qual é a postura do apicultor guardião da integridade?',
            ['Ignorar irregularidades que não o afetam diretamente — cada um cuida do seu',
             'Usar os recursos públicos corretamente, cobrar transparência da cooperativa, denunciar quando vê irregularidades e ser exemplo para toda a comunidade apícola',
             'Denunciar qualquer suspeita sem provas — é melhor denunciar em excesso do que deixar passar',
             'Aguardar que o governo descubra as irregularidades sozinho — não é papel do produtor fiscalizar programas públicos'],
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
    console.log('🐝 Seed — Rota do Mel: Módulo G — Integridade e Cidadania\n');
    const moduleId = await createFolder('Módulo G — Integridade e Cidadania', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log(`\n\n✅ Módulo G — Rota do Mel criado!\n   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

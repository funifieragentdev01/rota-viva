/**
 * seed-modulo-g-pesca.js
 * Cria o Módulo G — Integridade e Cidadania na Rota da Pesca.
 * Temas: direitos do participante, canais de denúncia, uso correto do PRONAF/PAA/Seguro-Defeso
 * Referências: MPA, MIDR, CGU, Fala.BR (162), ouvidoria do Seguro-Defeso
 * Estrutura: 2 vídeos + 2 quizzes + 1 leitura + 1 quiz + Escuta + Diário + Revisão
 *
 * Uso: node scripts/seed-modulo-g-pesca.js
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
    title: 'Seus Direitos como Participante do Rota Viva',
    video: {
        title: 'Seus Direitos como Participante do Rota Viva',
        url: 'https://www.youtube.com/watch?v=JlFiAhG7X_A',
        description: 'O que o projeto Rota Viva promete e o que não promete: conteúdo gratuito, certificado ao concluir, proteção dos seus dados. O que o app não pode fazer: não garante automaticamente acesso ao PAA ou ao Seguro-Defeso, não substitui regularização do RGP e CAF, não distribui dinheiro. Como o participante pode verificar se o projeto está sendo executado corretamente.'
    }
},

// ── L02: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Seus Direitos como Participante',
    description: 'Teste seus conhecimentos sobre o que o projeto Rota Viva pode e não pode fazer, seus direitos como participante e como seus dados são protegidos.',
    fcType: 'quiz',
    questions: [
        mc1('Quais são os direitos garantidos ao participante do projeto Rota Viva?',
            ['Receber dinheiro mensalmente e ter acesso ao Seguro-Defeso automaticamente ao se cadastrar',
             'Acessar o conteúdo gratuitamente, receber certificado ao concluir as trilhas, ter seus dados protegidos e ser consultado sobre o projeto',
             'Ter assistência técnica presencial do RURAP toda semana e PRONAF Pesca pré-aprovado',
             'Receber equipamentos de pesca gratuitos (rede, caixa de gelo) ao concluir todas as trilhas'],
            1),
        vf('O app Rota Viva garante automaticamente o acesso ao PAA e ao Seguro-Defeso para qualquer pescador que se cadastrar na plataforma.', false),
        mc1('O que o Rota Viva FAZ de verdade pelo pescador artesanal?',
            ['Distribui recursos do PRONAF Pesca diretamente no aplicativo, sem necessidade de ir ao BASA',
             'Ensina como acessar os programas, quais documentos são necessários e como se regularizar — o acesso efetivo depende da regularização do próprio pescador',
             'Garante que o RURAP visite a comunidade ribeirinha em até 30 dias após o cadastro',
             'Conecta o pescador diretamente com restaurantes e supermercados que compram pescado certificado'],
            1),
        vf('Seus dados pessoais no app Rota Viva são protegidos pela LGPD (Lei Geral de Proteção de Dados) — o projeto não pode compartilhá-los com terceiros sem sua autorização.', true),
        mc1('O que acontece se um pescador se cadastrar no Rota Viva mas ainda não tiver CAF e RGP regularizados?',
            ['É automaticamente bloqueado do app até regularizar os documentos exigidos',
             'Pode aprender normalmente no app, mas não conseguirá acessar os programas (PRONAF, PAA, Seguro-Defeso) enquanto não regularizar os documentos necessários',
             'O app envia automaticamente o pedido de RGP para o MAPA pelo sistema digital integrado',
             'Recebe o certificado igual, mas marcado como "pescador em regularização" no sistema'],
            1),
        listen(
            'Pedro ouviu que "quem se cadastrar no Rota Viva recebe motor de popa novo do governo". Ele se cadastrou esperando receber o motor. Mas o motor nunca chegou e ele está decepcionado.',
            'O que está errado no entendimento de Pedro e o que o Rota Viva realmente oferece?',
            ['Pedro tinha razão — o motor deveria ter chegado; provavelmente houve erro no sistema do governo',
             'A informação foi errada — o Rota Viva é uma plataforma de aprendizado gratuita, não distribui equipamentos; Pedro deve denunciar quem prometeu o motor',
             'O motor só chega para pescadores que completam 100% das trilhas com nota máxima',
             'O motor existe mas é distribuído pelo RURAP presencialmente após a conclusão das trilhas'],
            1),
        mc1('Quais informações o app Rota Viva coleta dos participantes e para que são usadas?',
            ['Dados bancários e CPF — para transferir recursos do PRONAF Pesca diretamente na conta',
             'Respostas das atividades, município e progresso nas trilhas — usados para melhorar o app e gerar relatórios de política pública para o MDA e o MPA',
             'Dados biométricos (foto do rosto e digital) — para confirmar que a pessoa é o pescador cadastrado',
             'Histórico de captura e notas fiscais — para calcular automaticamente os impostos devidos ao fisco'],
            1),
        vf('O participante tem o direito de ser consultado sobre o projeto Rota Viva — as pesquisas de satisfação e a Escuta Ativa são formas legítimas de exercer esse direito.', true),
        matching('Associe cada afirmação com o que é VERDADEIRO ou FALSO sobre o Rota Viva:', [
            { left: 'O app ensina como acessar o PRONAF Pesca e o Seguro-Defeso', right: 'VERDADEIRO — orienta o processo, não substitui a regularização' },
            { left: 'O app distribui dinheiro ou equipamentos aos participantes', right: 'FALSO — o Rota Viva é plataforma educacional gratuita' },
            { left: 'O participante recebe certificado ao concluir as trilhas', right: 'VERDADEIRO — direito garantido a todo participante' },
            { left: 'O app garante acesso automático ao PAA ao se cadastrar', right: 'FALSO — o acesso depende de documentação e regularização' }
        ]),
        mc1('O que o pescador deve fazer se alguém pedir dinheiro em troca de cadastro no Rota Viva ou de acesso privilegiado ao Seguro-Defeso?',
            ['Pagar se o valor for pequeno — é comum pagar taxas de cadastro em programas governamentais',
             'Recusar imediatamente — o cadastro é gratuito e ninguém pode cobrar para intermediar acesso a programas públicos. Denunciar à ouvidoria do MPA.',
             'Negociar o valor — se o programa valer a pena, um pequeno pagamento pode ser aceitável',
             'Pagar e tentar recuperar depois pela Receita Federal na declaração anual'],
            1),
        smw(
            'Complete sobre os direitos do participante do Rota Viva:',
            'O participante tem direito de acessar o conteúdo [[b1]], receber [[b2]] ao concluir as trilhas e ter seus dados protegidos pela [[b3]]. O app [[b4]] garante acesso automático ao Seguro-Defeso — isso depende de [[b5]] do pescador.',
            [
                { id: 'b1', opts: ['gratuitamente', 'mensalmente', 'anualmente', 'semanalmente'], ci: 0 },
                { id: 'b2', opts: ['certificado', 'dinheiro', 'equipamento', 'motor'], ci: 0 },
                { id: 'b3', opts: ['LGPD', 'PRONAF', 'MAPA', 'RGP'], ci: 0 },
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
        description: 'Os canais oficiais de denúncia para programas da pesca: Ouvidoria do MPA, plataforma Fala.BR (falabr.cgu.gov.br ou 162), ouvidoria do INSS (Seguro-Defeso). Como fazer denúncia anônima. O que pode ser denunciado: cobrança indevida para acessar o Seguro-Defeso, desvio de recursos do PRONAF Pesca, pescador pescando ilegalmente durante o defeso. O que acontece após o registro da denúncia.'
    }
},

// ── L04: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Canais de Denúncia e Proteção',
    description: 'Teste seus conhecimentos sobre os canais oficiais de denúncia de irregularidades em programas da pesca artesanal e como o pescador pode proteger seus direitos.',
    fcType: 'quiz',
    questions: [
        mc1('Qual é o canal oficial do Governo Federal para denunciar irregularidades em programas como PRONAF Pesca, PAA e Seguro-Defeso?',
            ['Delegacia de Polícia — todas as denúncias contra o governo devem ser registradas como boletim de ocorrência',
             'Plataforma Fala.BR (falabr.cgu.gov.br ou telefone 162) — canal gratuito da CGU para denúncias, reclamações e elogios sobre programas federais',
             'Rádio comunitária local — a publicidade é a melhor forma de pressionar o governo a agir',
             'Câmara Municipal — apenas vereadores têm legitimidade para questionar programas federais'],
            1),
        vf('Uma denúncia de irregularidade em programa governamental pode ser feita de forma anônima pela ouvidoria — o denunciante não precisa se identificar.', true),
        mc1('Quais situações justificam uma denúncia à ouvidoria do governo na área da pesca?',
            ['Apenas crimes comprovados com documentação — sem provas concretas a denúncia não tem efeito',
             'Cobrança de dinheiro para processar o Seguro-Defeso, desvio de recursos do PRONAF Pesca, exclusão irregular de beneficiários, favorecimento indevido em programas públicos',
             'Apenas situações que prejudicam diretamente o denunciante — problemas de terceiros não devem ser denunciados',
             'Somente quando o valor desviado supera R$ 50.000 — denúncias de pequeno valor não são investigadas'],
            1),
        listen(
            'Maria soube que o agente da colônia está cobrando R$ 150 de cada pescador para processar a documentação do Seguro-Defeso — um serviço que deveria ser gratuito. Ela tem medo de fazer a denúncia e perder o benefício.',
            'O que Maria deveria fazer e quais são seus direitos nessa situação?',
            ['Pagar os R$ 150 — é uma taxa de serviço que o agente tem direito de cobrar pelo trabalho',
             'Fazer a denúncia anônima na ouvidoria do MPA ou do INSS — a cobrança é ilegal, ela não pode perder o Seguro-Defeso por denunciar, e sua identidade pode ser protegida',
             'Conversar com o agente e negociar um valor menor — R$ 50 é mais razoável para o serviço',
             'Desistir do Seguro-Defeso — não vale arrumar confusão com o agente da colônia'],
            1),
        mc1('O que acontece com a denúncia após ser registrada na plataforma Fala.BR?',
            ['Nada — o Fala.BR recebe denúncias mas raramente as encaminha para investigação',
             'A CGU registra, encaminha para o órgão responsável para apuração e deve dar resposta ao denunciante no prazo legal (geralmente 30 dias)',
             'A denúncia vai direto para a Polícia Federal que instaura inquérito imediatamente',
             'A denúncia fica arquivada por 5 anos antes de ser analisada — o prazo de resposta é muito longo'],
            1),
        vf('O pescador que denuncia cobrança indevida pelo Seguro-Defeso está exercendo sua cidadania — não é delação, é proteção dos recursos públicos que pertencem a toda a categoria.', true),
        mc1('Como acessar a plataforma federal Fala.BR para registrar uma denúncia ou reclamação?',
            ['Apenas presencialmente na sede do MPA em Brasília ou nas superintendências estaduais',
             'Pelo site falabr.cgu.gov.br ou pelo telefone 162 — gratuito, disponível 24h, com opção de anonimato',
             'Pelo aplicativo Rota Viva, usando o botão de denúncia na tela principal',
             'Apenas por carta registrada endereçada ao Ministro da Pesca e Aquicultura'],
            1),
        mc1('O que é o "sigilo do denunciante" e por que é importante para o pescador artesanal?',
            ['É a obrigação do denunciante de manter em sigilo o nome do acusado até a conclusão da investigação',
             'É a proteção legal que impede a revelação da identidade do denunciante ao acusado — protege de retaliações na comunidade e incentiva que irregularidades sejam reportadas',
             'É a classificação sigilosa que impede o público de saber que a denúncia foi feita',
             'É um acordo informal entre o denunciante e o ouvidor — sem respaldo legal, apenas ético'],
            1),
        matching('Associe cada tipo de irregularidade na pesca com o canal mais adequado para denunciar:', [
            { left: 'Agente cobrando dinheiro para processar o Seguro-Defeso', right: 'Ouvidoria do MPA + INSS — cobrança indevida em benefício federal' },
            { left: 'PRONAF Pesca usado para finalidade diferente da declarada', right: 'BASA + CGU (Fala.BR) — fraude contratual em crédito rural' },
            { left: 'Pescador pescando durante o período de defeso', right: 'IBAMA + colônia de pescadores — infração ambiental e prejuízo coletivo' },
            { left: 'Cooperativa sem transparência financeira aos associados', right: 'OCB + MPA — violação dos direitos do cooperado' }
        ]),
        vf('Uma denúncia sem provas documentais não pode ser registrada no Fala.BR — é obrigatório apresentar documentos antes de qualquer registro.', false),
        mc1('Qual é a diferença entre uma "reclamação" e uma "denúncia" na plataforma Fala.BR?',
            ['Não há diferença — são termos sinônimos usados indistintamente',
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

<p>Recursos públicos — PRONAF Pesca, PAA, Seguro-Defeso — são dinheiro de todos os brasileiros. Quando um pescador usa esses recursos corretamente, ele fortalece a categoria e abre caminho para os próximos. Quando os desvia, prejudica toda a pesca artesanal.</p>

<h3>O Seguro-Defeso e a Veracidade da Declaração</h3>

<p>O Seguro-Defeso é um benefício do governo federal pago durante o período proibido de pesca para garantir a renda do pescador artesanal. Para recebê-lo, o pescador declara que:</p>
<ul>
<li>É pescador artesanal com RGP ativo</li>
<li>A pesca é sua principal fonte de renda</li>
<li>Está respeitando o defeso — não está pescando a espécie protegida durante o período proibido</li>
</ul>

<p><strong>Continuar pescando durante o defeso e receber o benefício ao mesmo tempo é fraude:</strong></p>
<ul>
<li>Devolução de todos os valores recebidos indevidamente com correção monetária</li>
<li>Cancelamento do Seguro-Defeso por tempo indeterminado</li>
<li>Processo criminal por estelionato previdenciário (Lei nº 9.784/1999)</li>
<li>Multa ambiental do IBAMA pela infração ao defeso</li>
</ul>

<h3>O PRONAF Pesca e a Finalidade Declarada</h3>

<p>O PRONAF Pesca é um crédito subsidiado com finalidade específica: o pescador declara o que vai comprar (motor de popa, rede, barco, caixa de gelo) e o BASA libera com juros menores que o mercado.</p>

<p><strong>Desviar o crédito para outra finalidade é fraude contratual:</strong></p>
<ul>
<li>O banco pode exigir devolução imediata do valor total com multa e juros de mercado</li>
<li>O pescador pode ser bloqueado para novos créditos rurais por anos</li>
<li>Em casos graves, pode responder criminalmente por estelionato ou fraude contra o Sistema Financeiro</li>
</ul>

<h3>O PAA e a Veracidade da Produção</h3>

<p>No PAA, o pescador declara quanto produz e entrega esse volume. Declarar produção que não existe ou entregar produto de origem duvidosa é fraude:</p>
<ul>
<li>Suspensão do PAA por até 2 anos</li>
<li>Devolução dos valores recebidos sem entrega real</li>
<li>Comunicação ao MPF em casos de valor significativo</li>
</ul>

<h3>A Cooperativa e a Transparência Obrigatória</h3>

<p>Cooperativas de pesca são obrigadas por lei a:</p>
<ul>
<li>Apresentar balanço anual aos cooperados em assembleia</li>
<li>Publicar as sobras e como foram calculadas</li>
<li>Permitir auditoria pelos associados quando solicitada</li>
</ul>

<h3>O Pescador como Guardião da Integridade</h3>

<p>O pescador íntegro:</p>
<ul>
<li>Respeita o defeso — mesmo quando outros pescam ilegalmente</li>
<li>Usa o PRONAF para o que declarou</li>
<li>Entrega ao PAA o que produziu de verdade</li>
<li>Denuncia quando vê fraude no Seguro-Defeso — quem frauda prejudica todos os que precisam do benefício</li>
</ul>

<p>Cada recurso público bem usado é um argumento para o governo manter e ampliar os programas da pesca artesanal. Cada desvio é um argumento para reduzi-los ou encerrá-los.</p>

<p><em>Fonte: MPA, MDA, CGU, TCU, INSS, IBAMA, Lei nº 10.779/2003 (Seguro-Defeso), Lei nº 13.709/2018 (LGPD) (2024)</em></p>`
    }
},

// ── L06: Quiz ────────────────────────────────────────────────────────────────
{
    title: 'Avaliação: Integridade e Uso dos Recursos Públicos',
    description: 'Teste seus conhecimentos sobre o uso correto do Seguro-Defeso, PRONAF Pesca e PAA — e por que a integridade do pescador protege toda a categoria.',
    fcType: 'quiz',
    questions: [
        mc1('João recebeu crédito do PRONAF Pesca para comprar motor de popa e rede. Um amigo pede emprestado R$ 4.000 do crédito para reformar a casa, prometendo devolver. O que João deve fazer?',
            ['Emprestar — um amigo sempre paga e o valor não é muito grande',
             'Usar todo o crédito para a finalidade declarada no contrato — emprestar é desvio de finalidade e pode resultar em cobrança integral com multa pelo BASA',
             'Emprestar metade e comprar o motor com o restante — um meio-termo equilibrado',
             'Devolver o crédito ao BASA e pedir um novo depois que o amigo devolver o dinheiro'],
            1),
        vf('Continuar pescando durante o período de defeso e receber o Seguro-Defeso ao mesmo tempo é fraude previdenciária — pode resultar em devolução de todos os valores, cancelamento do benefício e processo criminal.', true),
        mc1('Pedro recebeu Seguro-Defeso durante o período proibido mas continuou pescando o tambaqui às escondidas. Quais são as consequências se for descoberto?',
            ['Apenas advertência informal da colônia — o governo é tolerante com pequenas infrações durante o defeso',
             'Devolução de todos os valores recebidos, cancelamento do Seguro-Defeso, multa ambiental do IBAMA e processo criminal por estelionato previdenciário',
             'Multa de 10% do valor do benefício — única penalidade prevista para infração ao defeso',
             'Suspensão do Seguro-Defeso apenas para o próximo período — sem outras penalidades'],
            1),
        mc1('Ana contratou 200 kg de mapará no PAA mas na safra ruim só pescou 120 kg. O que Ana deve fazer?',
            ['Comprar 80 kg de mapará de outro pescador e vender como se fosse o próprio para cumprir o contrato',
             'Comunicar ao gestor local do PAA antes do vencimento, informar a produção real e negociar — transparência protege o pescador',
             'Não entregar nada e esperar ser notificada — o programa não tem como saber o quanto você pescou',
             'Entregar os 200 kg misturando outras espécies sem avisar — quantidade é o que importa no contrato'],
            1),
        listen(
            'Carlos é cooperado da COOPESCA-AP e não recebe extrato nem é convocado para assembleia há 2 anos. A diretoria diz que "não deu sobra nenhuma" mas não apresenta o balanço. Carlos tem suspeitas de irregularidade na gestão.',
            'O que Carlos tem o direito — e o dever — de fazer nessa situação?',
            ['Aceitar a explicação da diretoria — ela conhece melhor a situação financeira da cooperativa',
             'Exigir formalmente o balanço e a convocação da assembleia. Se negado, denunciar à OCB e ao MPA — a transparência é um direito legal de todo cooperado',
             'Sair da cooperativa silenciosamente — não vale criar confusão com a diretoria',
             'Contratar um advogado antes de qualquer outra medida para entrar com ação contra a cooperativa'],
            1),
        vf('O pescador que usa corretamente os recursos públicos (PRONAF, PAA, Seguro-Defeso) fortalece toda a categoria — cada recurso bem usado é argumento para o governo ampliar os programas da pesca artesanal.', true),
        mc1('Quais são as consequências para o pescador que declara produção falsa no PAA para receber mais do que produziu?',
            ['Apenas advertência informal — o programa é tolerante com pequenas diferenças',
             'Suspensão do PAA por até 2 anos, devolução dos valores recebidos e comunicação ao MPF em casos de valor significativo',
             'Multa de 10% do valor contratado — única penalidade prevista para irregularidades no PAA',
             'Exclusão do PAA mas mantém acesso ao Seguro-Defeso e ao PRONAF sem restrição'],
            1),
        matching('Associe cada situação com a consequência correta:', [
            { left: 'PRONAF Pesca usado para finalidade diferente', right: 'Devolução imediata + multa + bloqueio para novos créditos no BASA' },
            { left: 'Pescar durante o defeso e receber o Seguro-Defeso', right: 'Devolução do benefício + multa do IBAMA + processo criminal' },
            { left: 'PAA — não entregar o volume contratado sem avisar', right: 'Suspensão do programa + devolução dos valores recebidos' },
            { left: 'Cooperativa sem transparência financeira', right: 'Direito do cooperado exigir balanço + denúncia à OCB e ao MPA' }
        ]),
        vf('Se o pescador tiver dificuldade em usar o crédito PRONAF para a finalidade declarada, ele pode conversar com o BASA antes de desviar — há mecanismos de renegociação com aprovação prévia, muito melhor que a alternativa.', true),
        mc1('Por que a integridade individual do pescador afeta toda a categoria?',
            ['Não afeta — cada produtor responde apenas pelos seus próprios atos sem impacto nos demais',
             'Cada desvio individual é usado como justificativa para reduzir ou encerrar programas — e cada uso correto é argumento para ampliar os benefícios para toda a pesca artesanal',
             'Afeta apenas a cooperativa da qual o pescador faz parte — sem impacto nos programas federais',
             'Afeta apenas o município — irregularidades resultam em suspensão local, não estadual'],
            1)
    ]
},

// ── L07: Escuta Ativa ────────────────────────────────────────────────────────
{
    title: 'Minha Experiência com os Programas do Governo',
    description: 'Conte sua experiência com os programas públicos da pesca — suas respostas ajudam o MDA e o MPA a identificar irregularidades e melhorar a execução dos programas no Amapá.',
    fcType: 'listen',
    questions: [
        mc1('Você já acessou algum programa público como PRONAF Pesca, PAA ou Seguro-Defeso?',
            ['Sim, acesso e estou satisfeito com o processo', 'Sim, mas tive dificuldades ou irregularidades',
             'Nunca consegui acessar, embora tenha tentado', 'Nunca tentei acessar esses programas'],
            0),
        mc1('Você já viu ou soube de alguma irregularidade em programa da pesca na sua região (cobrança indevida, desvio, exclusão injusta, fraude no Seguro-Defeso)?',
            ['Sim, vi ou soube e denunciei ao canal competente', 'Sim, vi ou soube mas não sabia o que fazer',
             'Não sei de nenhuma irregularidade na minha região', 'Prefiro não responder'],
            0),
        mc1('Você sabe qual é o canal oficial para denunciar irregularidades em programas federais da pesca?',
            ['Sim, sei e já usei (Fala.BR, falabr.cgu.gov.br ou 162)', 'Sei que existe mas não sei como usar',
             'Não sabia que existia um canal oficial para isso', 'Não tenho interesse em usar canais de denúncia'],
            0),
        shortAnswer('Você já teve alguma experiência negativa com um programa do governo (PRONAF, PAA, Seguro-Defeso, RURAP)? O que aconteceu e como poderia ter sido diferente?'),
        shortAnswer('O que você faria diferente se soubesse que algum recurso público destinado a pescadores da sua comunidade estava sendo desviado?')
    ]
},

// ── L08: Diário ──────────────────────────────────────────────────────────────
{
    title: 'Meu Compromisso com a Integridade',
    description: 'Registre seu compromisso com o uso correto dos recursos públicos e ganhe um cristal — cada pescador íntegro fortalece toda a pesca artesanal do Amapá.',
    fcType: 'chest',
    questions: [
        diy(
            'Escreva (pode ser um texto curto digitado) ou tire uma foto de algo que representa seu compromisso com a integridade: um documento que mostra que você usa os recursos corretamente (contrato do PRONAF bem utilizado, comprovante de entrega no PAA, comprovante do Seguro-Defeso legítimo), ou escreva: "Meu compromisso é usar os recursos públicos corretamente, respeitar o defeso e denunciar quando vejo irregularidades — porque cada recurso bem usado abre portas para toda a pesca artesanal do Amapá."',
            ['photo'],
            'Foto de documento de uso correto de recurso público (contrato, comprovante de entrega, nota fiscal), ou texto com compromisso pessoal de integridade.'
        )
    ]
},

// ── L09: Revisão Geral ────────────────────────────────────────────────────────
{
    title: 'Revisão Geral: Módulo G',
    description: 'Revise todos os temas do Módulo G: direitos do participante, canais de denúncia e uso correto dos recursos públicos — o pescador como guardião da integridade do projeto.',
    fcType: 'review',
    questions: [
        mc1('Quais são os direitos garantidos ao participante do projeto Rota Viva?',
            ['Receber equipamentos de pesca e ter acesso automático ao Seguro-Defeso ao se cadastrar',
             'Acessar o conteúdo gratuitamente, receber certificado ao concluir, ter dados protegidos e ser consultado sobre o projeto',
             'Assistência técnica semanal do RURAP e PRONAF Pesca pré-aprovado pelo BASA',
             'Renda mensal do governo durante o período de aprendizado nas trilhas'],
            1),
        vf('O app Rota Viva garante automaticamente o acesso ao Seguro-Defeso e ao PAA para todo pescador cadastrado.', false),
        mc1('Qual é o canal federal gratuito para denunciar irregularidades em programas da pesca?',
            ['Delegacia de Polícia — todas as denúncias contra funcionários públicos exigem boletim de ocorrência',
             'Plataforma Fala.BR (falabr.cgu.gov.br ou telefone 162) — gratuito, 24h, com opção de anonimato',
             'Câmara Municipal — apenas vereadores têm legitimidade para questionar programas federais',
             'Rádio comunitária — a publicidade é a melhor forma de pressionar o governo a investigar'],
            1),
        vf('Uma denúncia de irregularidade em programa governamental pode ser feita de forma anônima — o denunciante não precisa se identificar.', true),
        mc1('João recebeu PRONAF Pesca para comprar motor e rede mas usou parte para pagar dívida pessoal. Quais as consequências?',
            ['Advertência informal — o BASA é tolerante com pequenos desvios de finalidade',
             'Devolução imediata do valor com multa, bloqueio para novos créditos no BASA e, em casos graves, processo criminal',
             'Multa de 5% do valor — única penalidade prevista para desvio de finalidade do PRONAF',
             'Apenas comunicação ao CMDR do município — o banco não toma outras providências'],
            1),
        mc1('O que é fraude no Seguro-Defeso e quais são suas consequências?',
            ['Entregar a documentação fora do prazo — resulta em atraso no pagamento do benefício',
             'Continuar pescando a espécie protegida durante o defeso enquanto recebe o benefício — resulta em devolução, cancelamento, multa do IBAMA e processo criminal',
             'Não renovar o RGP no prazo — resulta em suspensão temporária do Seguro-Defeso',
             'Usar o benefício para comprar equipamentos de pesca — desvio de finalidade do Seguro-Defeso'],
            1),
        matching('Associe cada situação com a ação correta do pescador:', [
            { left: 'Agente cobra dinheiro para processar o Seguro-Defeso', right: 'Recusar e denunciar na ouvidoria do MPA — cobrança é ilegal' },
            { left: 'Cooperativa não apresenta balanço há 2 anos', right: 'Exigir formalmente o balanço; se negado, denunciar à OCB e ao MPA' },
            { left: 'PRONAF recebido — amigo pede dinheiro emprestado', right: 'Recusar — usar o crédito para a finalidade declarada no contrato' },
            { left: 'Safra menor que o volume contratado no PAA', right: 'Comunicar ao gestor do PAA antes do prazo e entregar o que produziu' }
        ]),
        vf('O pescador que usa corretamente os recursos públicos e denuncia irregularidades está protegendo toda a categoria — cada recurso bem usado é argumento para ampliar os programas da pesca artesanal.', true),
        smw(
            'Complete sobre integridade no uso de recursos públicos da pesca:',
            'O PRONAF Pesca deve ser usado para a [[b1]] declarada no contrato. O Seguro-Defeso exige que o pescador [[b2]] durante o período proibido. A cooperativa é obrigada a apresentar [[b3]] anual. Denúncias podem ser feitas [[b4]] pela plataforma [[b5]] do governo federal.',
            [
                { id: 'b1', opts: ['finalidade', 'origem', 'data', 'cooperativa'], ci: 0 },
                { id: 'b2', opts: ['pare de pescar', 'continue pescando', 'venda o pescado', 'registre a produção'], ci: 0 },
                { id: 'b3', opts: ['balanço', 'extrato', 'relatório', 'certidão'], ci: 0 },
                { id: 'b4', opts: ['anonimamente', 'pessoalmente', 'com advogado', 'com testemunhas'], ci: 0 },
                { id: 'b5', opts: ['Fala.BR', 'Rota Viva', 'MAPA', 'IBAMA'], ci: 0 }
            ]
        ),
        mc1('Qual é a postura do pescador guardião da integridade?',
            ['Ignorar irregularidades que não o afetam diretamente — cada um cuida do seu negócio',
             'Usar os recursos públicos corretamente, respeitar o defeso, cobrar transparência da cooperativa e denunciar quando vê irregularidades — sendo exemplo para toda a comunidade',
             'Denunciar qualquer suspeita sem provas — é melhor denunciar em excesso do que deixar passar',
             'Aguardar que o governo descubra as irregularidades sozinho — não é papel do pescador fiscalizar programas públicos'],
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
    console.log('🐟 Seed — Rota da Pesca: Módulo G — Integridade e Cidadania\n');
    const moduleId = await createFolder('Módulo G — Integridade e Cidadania', 'module', SUBJECT_ID);
    console.log('');
    for (let i = 0; i < LESSONS.length; i++) await seedLesson(moduleId, LESSONS[i], i);
    console.log(`\n\n✅ Módulo G — Rota da Pesca criado!\n   Module ID: ${moduleId}`);
}

main().catch(err => { console.error('\n❌ ERRO:', err.message); process.exit(1); });

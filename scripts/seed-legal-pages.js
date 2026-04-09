/**
 * seed-legal-pages.js
 * 1. Cria as páginas customizadas no Funifier Studio para gerenciar legal__c
 * 2. Sobe os textos reais de Termos de Uso e Política de Privacidade
 *
 * Uso: node scripts/seed-legal-pages.js
 */

const BASE_URL = 'https://service2.funifier.com';
const TOKEN = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';

async function api(method, path, body) {
    const res = await fetch(BASE_URL + path, {
        method,
        headers: { 'Authorization': TOKEN, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.substring(0, 400)}`);
    try { return JSON.parse(text); } catch { return {}; }
}

// ─── Studio Pages ──────────────────────────────────────────────────────────────

const listPage = {
    _id: 'legal_list_page',
    title: 'Termos e Privacidade',
    slug: 'studio/custom/legal/list',
    display: true,
    script: `
$scope.all = [];
$scope.range = { request: "items=0-20" };

$scope.create = function () { $location.path("/studio/custom/legal/form/new"); };
$scope.edit   = function (id) { $location.path("/studio/custom/legal/form/" + id); };

$scope.remove = function (index, id) {
    if (confirm("Deseja excluir este documento legal?")) {
        var req = {
            method: 'DELETE',
            url: Marketplace.auth.getService() + "/v3/database/legal__c?q=_id:'" + id + "'",
            headers: { "Authorization": Marketplace.auth.getAuthorization(), "content-type": "application/json" }
        };
        $http(req).then(function () { $scope.list(); }, function (err) { console.log(err); });
    }
};

$scope.list = function () {
    var req = {
        method: 'GET',
        url: Marketplace.auth.getService() + '/v3/database/legal__c?sort=slug:1',
        headers: { "Authorization": Marketplace.auth.getAuthorization(), "Range": $scope.range.request, "content-type": "application/json" }
    };
    $http(req).then(function (data) {
        $scope.all = data.data;
        $scope.range = Marketplace.range.parse(data.headers(["content-range"]));
    }, function (err) { console.log(err); });
};
$scope.list();
`.trim(),
    html: `
<div class="title-block">
    <h4>Termos e Privacidade</h4>
    <p class="help-block">Gerencia os textos de Termos de Uso e Política de Privacidade exibidos no app Rota Viva.</p>
    <a class="btn btn-warning" ng-click="create()">
        <span class="glyphicon glyphicon-plus"></span> Novo
    </a>
</div>

<table class="table table-striped table-bordered">
    <thead>
        <tr>
            <td>Slug</td>
            <td>Título</td>
            <td>Operações</td>
        </tr>
    </thead>
    <tr ng-repeat="obj in all">
        <td><code>{{obj.slug}}</code></td>
        <td>{{obj.title}}</td>
        <td>
            <button type="button" class="btn btn-default" ng-click="remove($index, obj._id)">
                <span class="glyphicon glyphicon-trash"></span>
            </button>
            <button type="button" class="btn btn-default" ng-click="edit(obj._id)">
                <span class="glyphicon glyphicon-pencil"></span>
            </button>
        </td>
    </tr>
</table>
`.trim()
};

const formPage = {
    _id: 'legal_form_page',
    title: 'Termos e Privacidade (Form)',
    slug: 'studio/custom/legal/form/:id',
    display: false,
    script: `
$scope.obj = {};

$scope.back = function () { $location.path("/studio/custom/legal/list"); };

$scope.save = function () {
    if (!$scope.obj.created) $scope.obj.created = { $date: new Date().getTime() };
    $scope.obj.updated = { $date: new Date().getTime() };
    var req = {
        method: 'PUT',
        url: Marketplace.auth.getService() + '/v3/database/legal__c',
        headers: { "Authorization": Marketplace.auth.getAuthorization(), "content-type": "application/json" },
        data: $scope.obj
    };
    $http(req).then(function () { $location.path("/studio/custom/legal/list"); }, function (err) { console.log(err); });
};

$scope.load = function () {
    var id = $routeParams.id;
    if (id === "new") { $scope.isNew = true; return; }
    $http({
        method: 'GET',
        url: Marketplace.auth.getService() + "/v3/database/legal__c?strict=true&q=_id:'" + id + "'",
        headers: { "Authorization": Marketplace.auth.getAuthorization(), "content-type": "application/json" }
    }).then(function (data) { $scope.obj = data.data[0]; }, function (err) { console.log(err); });
};
$scope.load();
`.trim(),
    html: `
<div class="title-block">
    <h4>Termos e Privacidade</h4>
    <a class="btn btn-default" ng-click="back()">Voltar</a>
</div>

<div class="row"><div class="col-md-12">

<label>Slug <small>(ex: terms · privacy)</small></label>
<input ng-model="obj.slug" type="text" class="form-control" placeholder="terms" ng-readonly="!isNew" /><br/>

<label>Título</label>
<input ng-model="obj.title" type="text" class="form-control" placeholder="Termos de Uso" /><br/>

<label>Conteúdo (HTML)</label>
<textarea ng-model="obj.body" class="form-control" rows="20" placeholder="&lt;p&gt;Texto...&lt;/p&gt;"></textarea><br/>

<label>ID (gerado automaticamente)</label>
<input ng-model="obj._id" type="text" class="form-control" ng-readonly="!isNew" /><br/>

</div></div>

<button ng-click="back()" class="btn btn-default">Cancelar</button>
<button ng-click="save()" class="btn btn-primary">Salvar</button>
`.trim()
};

// ─── Legal content ─────────────────────────────────────────────────────────────

const termsContent = `<h2>Termos de Uso — Rota Viva</h2>
<p><em>Última atualização: abril de 2025</em></p>

<h3>1. Sobre o aplicativo</h3>
<p>O Rota Viva é uma plataforma educacional de aprendizagem gamificada voltada a produtores rurais do Brasil, com foco em apicultores da Região do Semiárido e pescadores artesanais do Amapá. O app oferece trilhas de conhecimento sobre boas práticas produtivas, acesso a políticas públicas e cidadania rural.</p>

<h3>2. Aceite dos termos</h3>
<p>Ao criar uma conta e utilizar o Rota Viva, você confirma que leu, entendeu e concorda com estes Termos de Uso e com nossa Política de Privacidade. Se não concordar com qualquer parte, não utilize o aplicativo.</p>

<h3>3. Cadastro e conta</h3>
<p>Para usar o app você precisa informar: nome completo, CPF, senha e, opcionalmente, e-mail e telefone. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas em sua conta.</p>

<h3>4. Uso correto do aplicativo</h3>
<p>Você se compromete a:</p>
<ul>
<li>Usar o aplicativo apenas para fins educacionais.</li>
<li>Não compartilhar sua conta com terceiros.</li>
<li>Não enviar conteúdo falso, ofensivo ou ilegal.</li>
<li>Garantir que fotos, vídeos e outros materiais enviados por você são de sua autoria ou que você tem permissão para compartilhá-los.</li>
</ul>

<h3>5. Conteúdo enviado pelo usuário (Galeria dos Saberes)</h3>
<p>Ao completar uma atividade de "Diário de Campo" e marcar a opção de compartilhamento, você autoriza expressamente que o Rota Viva utilize, armazene e publique o conteúdo enviado — incluindo <strong>fotos, vídeos, textos e localização geográfica</strong> — na Galeria dos Saberes do aplicativo e em materiais de divulgação do projeto, com o objetivo de inspirar outros produtores rurais.</p>
<p>Esse conteúdo poderá ser visualizado por outros usuários cadastrados no app. Você pode optar por não compartilhar desmarcando a opção de publicação na tela de envio.</p>

<h3>6. Propriedade intelectual</h3>
<p>Todo o conteúdo educacional do Rota Viva (textos, vídeos, perguntas, trilhas) é de propriedade dos realizadores do projeto. Você não pode reproduzir, distribuir ou comercializar esse conteúdo sem autorização prévia.</p>

<h3>7. Disponibilidade</h3>
<p>O Rota Viva é oferecido sem garantia de disponibilidade ininterrupta. Podemos realizar manutenções, atualizações ou encerrar o serviço a qualquer momento, com aviso prévio sempre que possível.</p>

<h3>8. Exclusão de conta</h3>
<p>Você pode excluir sua conta a qualquer momento pela tela de Perfil. Após a exclusão, seus dados pessoais serão removidos dos servidores em até 30 dias, exceto quando a lei exigir retenção por prazo maior.</p>

<h3>9. Alterações nestes termos</h3>
<p>Podemos atualizar estes Termos de Uso periodicamente. Notificaremos você por e-mail ou notificação no app sobre mudanças relevantes.</p>

<h3>10. Contato</h3>
<p>Dúvidas sobre estes termos? Entre em contato pelo e-mail: <strong>rotaviva@funifier.com</strong></p>`;

const privacyContent = `<h2>Política de Privacidade — Rota Viva</h2>
<p><em>Última atualização: abril de 2025</em></p>

<h3>1. Quem somos</h3>
<p>O Rota Viva é um aplicativo educacional desenvolvido para capacitar produtores rurais brasileiros — apicultores do Semiárido e pescadores artesanais do Amapá. Esta Política descreve como coletamos, usamos, armazenamos e compartilhamos suas informações pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>.</p>

<h3>2. Dados que coletamos</h3>
<p><strong>a) Dados de cadastro</strong></p>
<ul>
<li>Nome completo</li>
<li>CPF (usado como identificador único)</li>
<li>E-mail (opcional)</li>
<li>Telefone (opcional)</li>
<li>Perfil de produtor (apicultor ou pescador)</li>
</ul>

<p><strong>b) Dados de uso e progresso</strong></p>
<ul>
<li>Histórico de lições assistidas e quizzes respondidos</li>
<li>Pontuações, conquistas e nível na trilha de aprendizagem</li>
<li>Data e horário de acesso ao aplicativo</li>
</ul>

<p><strong>c) Conteúdo enviado pelo usuário</strong></p>
<ul>
<li><strong>Fotos e imagens</strong> tiradas ou selecionadas da galeria do dispositivo, enviadas como evidência nas atividades de Diário de Campo</li>
<li><strong>Vídeos</strong> gravados ou selecionados para comprovação de atividades práticas</li>
<li><strong>Localização geográfica (GPS)</strong> capturada para registro de atividades de campo (latitude, longitude e precisão)</li>
<li><strong>Textos e relatos</strong> escritos pelo usuário nas atividades abertas</li>
</ul>

<p><strong>d) Dados técnicos</strong></p>
<ul>
<li>Tipo e versão do dispositivo e sistema operacional</li>
<li>Endereço IP (coletado automaticamente pelo servidor)</li>
</ul>

<h3>3. Como usamos seus dados</h3>
<ul>
<li>Criar e gerenciar sua conta no aplicativo</li>
<li>Registrar e exibir seu progresso nas trilhas educacionais</li>
<li>Publicar conteúdo enviado (fotos, vídeos, relatos, localização) na <strong>Galeria dos Saberes</strong>, quando você autorizar expressamente no momento do envio</li>
<li>Usar conteúdo publicado em materiais educacionais e de divulgação do projeto, sempre com a identificação do produtor (primeiro nome)</li>
<li>Melhorar o aplicativo com base em dados de uso agregados e anonimizados</li>
<li>Enviar comunicações relacionadas ao aplicativo (se você forneceu e-mail)</li>
</ul>

<h3>4. Compartilhamento de dados</h3>
<p>Seus dados pessoais <strong>não são vendidos</strong> a terceiros. Podemos compartilhá-los com:</p>
<ul>
<li><strong>Funifier</strong> — plataforma tecnológica que hospeda o aplicativo e armazena os dados</li>
<li><strong>Parceiros do projeto</strong> (entidades governamentais ou ONGs vinculadas ao Rota Viva) — apenas dados anonimizados ou agregados sobre uso e impacto do programa</li>
<li><strong>Autoridades</strong> — quando exigido por lei ou ordem judicial</li>
</ul>

<h3>5. Armazenamento e segurança</h3>
<p>Seus dados são armazenados em servidores seguros com criptografia em trânsito (HTTPS/TLS). O acesso é restrito por autenticação e os servidores são mantidos pela Funifier no Brasil. Adotamos medidas técnicas e organizacionais adequadas para proteger suas informações.</p>

<h3>6. Seus direitos (LGPD)</h3>
<p>Como titular dos dados, você tem direito a:</p>
<ul>
<li>Confirmar a existência de tratamento dos seus dados</li>
<li>Acessar os dados que temos sobre você</li>
<li>Corrigir dados incompletos ou desatualizados</li>
<li>Solicitar a exclusão dos seus dados (excluir a conta via app ou por e-mail)</li>
<li>Revogar o consentimento dado para publicação de conteúdo na Galeria dos Saberes</li>
</ul>
<p>Para exercer seus direitos, entre em contato: <strong>rotaviva@funifier.com</strong></p>

<h3>7. Retenção de dados</h3>
<p>Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, seus dados são removidos em até 30 dias, exceto logs de uso que podem ser mantidos por até 12 meses de forma anonimizada para fins estatísticos.</p>

<h3>8. Cookies e rastreamento</h3>
<p>O aplicativo usa armazenamento local (localStorage) no seu dispositivo para manter a sessão autenticada e salvar preferências de tema. Não utilizamos cookies de rastreamento publicitário.</p>

<h3>9. Alterações nesta política</h3>
<p>Podemos atualizar esta Política periodicamente. A versão mais recente estará sempre disponível no aplicativo com a data de atualização indicada.</p>

<h3>10. Contato e encarregado de dados</h3>
<p>Responsável pela proteção de dados: <strong>rotaviva@funifier.com</strong></p>`;

async function main() {
    console.log('Criando páginas customizadas no Studio...');

    // Create list page
    await api('PUT', '/v3/database/studio_page', listPage);
    console.log('✅ Página criada: Termos e Privacidade (List)');

    // Create form page
    await api('PUT', '/v3/database/studio_page', formPage);
    console.log('✅ Página criada: Termos e Privacidade (Form)');

    console.log('\nSobindo textos legais em legal__c...');

    // Seed Terms of Use
    await api('PUT', '/v3/database/legal__c', {
        _id: 'terms',
        slug: 'terms',
        title: 'Termos de Uso',
        body: termsContent
    });
    console.log('✅ Termos de Uso criados (slug: terms)');

    // Seed Privacy Policy
    await api('PUT', '/v3/database/legal__c', {
        _id: 'privacy',
        slug: 'privacy',
        title: 'Política de Privacidade',
        body: privacyContent
    });
    console.log('✅ Política de Privacidade criada (slug: privacy)');

    console.log('\nTudo pronto! Acesse no Studio: /studio/custom/legal/list');
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });

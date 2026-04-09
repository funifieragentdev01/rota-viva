/**
 * patch-quiz-descriptions.js
 * Adiciona description em cada quiz do Módulo Início (Mel e Pesca).
 * Busca os quizzes pelo título, faz PUT com o doc completo + description.
 *
 * Uso: node scripts/patch-quiz-descriptions.js
 */

const BASE_URL = 'https://service2.funifier.com';

const ROUTES = [
    {
        name: 'Mel',
        token: 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==',
        descriptions: {
            'Avaliação: O Mundo Depende de Você':
                'Teste o que você aprendeu sobre o papel das abelhas na agricultura e na alimentação humana.',
            'Avaliação: Como Funciona Uma Colmeia':
                'Avalie seus conhecimentos sobre a organização, as castas e o ciclo de vida dentro da colmeia.',
            'Avaliação: Um Dia na Vida de Um Apicultor':
                'Verifique o que você aprendeu sobre a rotina e as boas práticas do apicultor no campo.',
            'Avaliação: O Negócio do Mel':
                'Teste seus conhecimentos sobre os produtos apícolas, os preços e os canais de venda do mel.',
            'Escuta Ativa: Minha Trajetória na Apicultura':
                'Conte sua história — responda com sua própria experiência na apicultura.',
            'Diário: Meu Apiário no Mapa':
                'Registre seu apiário e contribua com o mapeamento da apicultura familiar no Piauí.',
            'Revisão Geral: Módulo Início':
                'Revise todos os temas do Módulo Início e consolide o que você aprendeu sobre apicultura.'
        }
    },
    {
        name: 'Pesca',
        token: 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==',
        descriptions: {
            'Avaliação: Os Rios do Amapá Dependem de Você':
                'Teste o que você aprendeu sobre a importância da pesca artesanal para o Amapá e para as famílias ribeirinhas.',
            'Avaliação: Como Funciona a Pesca Artesanal':
                'Avalie seus conhecimentos sobre petrechos, espécies e o dia a dia do pescador artesanal.',
            'Avaliação: Um Dia na Vida de Um Pescador Artesanal':
                'Verifique o que você aprendeu sobre a rotina e as boas práticas do pescador artesanal.',
            'Avaliação: O Negócio do Pescado':
                'Teste seus conhecimentos sobre como comercializar o pescado e melhorar a renda da família.',
            'Escuta Ativa: Minha Trajetória na Pesca':
                'Conte sua história — responda com sua própria experiência na pesca artesanal.',
            'Diário: Meu Pesqueiro no Mapa':
                'Registre seu local de pesca e contribua com o mapeamento da pesca artesanal no Amapá.',
            'Revisão Geral: Módulo Início':
                'Revise todos os temas do Módulo Início e consolide o que você aprendeu sobre pesca artesanal.'
        }
    }
];

async function getAll(token, collection) {
    const res = await fetch(`${BASE_URL}/v3/database/${collection}?limit=200`, {
        headers: { 'Authorization': token }
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

async function putDoc(token, collection, doc) {
    const res = await fetch(`${BASE_URL}/v3/database/${collection}`, {
        method: 'PUT',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`PUT /${collection} → ${res.status}: ${text.substring(0, 200)}`);
}

async function patchRoute(route) {
    const { name, token, descriptions } = route;
    console.log(`\n═══════════════════════════════════`);
    console.log(`Rota ${name}`);
    console.log(`═══════════════════════════════════`);

    const quizzes = await getAll(token, 'quiz');
    console.log(`  ${quizzes.length} quizzes encontrados`);

    let updated = 0;
    for (const quiz of quizzes) {
        const desc = descriptions[quiz.title];
        if (!desc) {
            console.log(`  ⏭  Sem description mapeada: "${quiz.title}"`);
            continue;
        }
        if (quiz.description === desc) {
            console.log(`  ✓  Já OK: "${quiz.title}"`);
            continue;
        }
        await putDoc(token, 'quiz', { ...quiz, description: desc });
        console.log(`  ✅ Atualizado: "${quiz.title}"`);
        updated++;
    }

    console.log(`  ${updated} quizzes atualizados.`);
}

async function main() {
    for (const route of ROUTES) {
        await patchRoute(route);
    }
    console.log('\n✅ Patch concluído!');
}

main().catch(err => { console.error('\nERRO FATAL:', err.message); process.exit(1); });

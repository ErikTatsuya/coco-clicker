# Forno do Cosmos

Jogo incremental de cookies feito com Next.js App Router, React e Tailwind CSS. O jogo roda no navegador e não precisa de servidor de aplicação, banco de dados ou autenticação.

## Executar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Para validar a versão de produção:

```bash
npm run lint
npm run build
npm start
```

## Mecânicas

- Clique no cookie para produzir e use os edifícios para gerar cookies automaticamente.
- Compre edifícios individualmente, em lotes de 10 ou no máximo permitido pelo saldo.
- Desbloqueie melhorias por cliques, cookies produzidos e quantidade de edifícios; efeitos manuais, globais e por edifício são aplicados ao cálculo de produção.
- Conquistas são registradas automaticamente. O progresso offline é calculado a partir do último save e respeita o limite configurável de 8, 24 ou 48 horas.
- O progresso é salvo em `localStorage` em intervalos, ao sair da página e ao iniciar. Use as configurações para exportar, importar ou reiniciar o save.

## Organização

- `lib/gameData.ts`: edifícios, melhorias e conquistas.
- `lib/gameLogic.ts`: preços, produção, compras, progresso offline e desbloqueios.
- `lib/saveManager.ts`: validação e persistência local dos saves.
- `components/`: cookie interativo, loja, melhorias, conquistas e recompensa offline.
- `app/page.tsx`: estado e composição da experiência interativa.

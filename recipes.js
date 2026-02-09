// recipes.js
// Exporta: window.DEFAULT_RECIPES (120 receitas)
// IMPORTANTE: image fica "" para o script.js buscar foto correta (Wikipédia / cache)

(() => {
  const block = (title, steps, note = "") => ({
    title,
    steps,
    ...(note ? { note } : {})
  });

  const mk = (data) => ({
    ...data,
    image: "" // <- deixa vazio (o script.js busca foto)
  });

  // =========================
  // TEMPLATES (para as receitas geradas automaticamente)
  // Super guiados para iniciantes
  // =========================

  const templateSavory = (title) => ([
    block(
      "Preparar ingredientes (antes de ligar o fogo)",
      [
        "Lave e seque os ingredientes (se for legumes/verduras).",
        "Pique 1 cebola em cubos pequenos e amasse/pique 2 dentes de alho (se usar).",
        "Separe os temperos (sal, pimenta, caril/páprica, folhas aromáticas) e deixe tudo ao alcance.",
        "Se tiver carne/frango/peixe: lave, escorra e tempere com uma pitada de sal e limão (opcional)."
      ],
      "Deixar tudo pronto evita queimar alho/cebola e torna a receita mais fácil."
    ),
    block(
      "Base de sabor (refogado)",
      [
        "Aqueça uma panela em fogo médio por 30 segundos.",
        "Adicione 1–2 colheres (sopa) de óleo/azeite (um fio generoso).",
        "Coloque a cebola e refogue 3–5 minutos, mexendo, até ficar macia e levemente dourada.",
        "Junte o alho e mexa por 20–30 segundos (não deixe escurecer).",
        "Se tiver tomate: adicione picado e cozinhe 2–3 minutos até começar a desmanchar."
      ],
      "Cebola dourada dá sabor; alho queimado amarga."
    ),
    block(
      "Cozinhar (o principal)",
      [
        "Adicione o ingrediente principal (carne/frango/feijão/legumes) e misture bem no refogado.",
        "Se precisar de líquido (caldo/água/leite de coco), adicione aos poucos e mexa.",
        "Cozinhe em fogo baixo/médio até ficar no ponto, mexendo de vez em quando para não pegar no fundo.",
        "Prove e ajuste o tempero: coloque sal aos poucos e finalize com pimenta/limão/ervas."
      ],
      "Dica: ajuste o sal no final — é mais fácil corrigir."
    ),
    block(
      "Finalizar e servir",
      [
        "Desligue o fogo e deixe descansar 2 minutos.",
        "Finalize com cheiro-verde/coentro (opcional).",
        "Sirva quente com arroz, xima, pão ou salada (conforme combinar)."
      ]
    )
  ]);

  const templateSweet = (title) => ([
    block(
      "Preparar antes de começar",
      [
        "Separe todos os ingredientes medidos (isso evita erros).",
        "Se for bolo: pré-aqueça o forno a 180°C e unte a forma com óleo/manteiga e farinha.",
        "Se for sobremesa gelada: separe taças/forma e espaço na geladeira.",
        "Quebre os ovos numa tigela à parte (para evitar cair casca na massa)."
      ],
      "Organização é o segredo para dar certo na primeira tentativa."
    ),
    block(
      "Misturar a base",
      [
        "Misture primeiro os ingredientes líquidos (ovos, leite, óleo, sucos).",
        "Adicione açúcar e misture até ficar homogêneo.",
        "Se houver farinha: adicione aos poucos e mexa com calma para não empelotar."
      ],
      "Não precisa bater muito — mexer o suficiente já funciona."
    ),
    block(
      "Cozinhar / assar / firmar",
      [
        "Se for forno: leve para assar e evite abrir nos primeiros 30 minutos.",
        "Se for panela: cozinhe em fogo baixo e mexa sempre que começar a engrossar.",
        "Faça o teste do ponto (palito no bolo / colher no creme)."
      ],
      "Fogo baixo ajuda a não queimar e dá textura melhor."
    ),
    block(
      "Finalizar e servir",
      [
        "Deixe esfriar (morno antes de cortar / gelar antes de desenformar).",
        "Finalize com cobertura/calda (opcional).",
        "Sirva e guarde o que sobrar na geladeira em recipiente fechado."
      ]
    )
  ]);

  // Um “detector” simples para escolher template melhor
  function smartSteps(title, category) {
    const t = String(title || "").toLowerCase();
    if (category === "doce") return templateSweet(title);

    // salgados: se parecer fritura/rolinho
    if (t.includes("rol") || t.includes("spring") || t.includes("samosa") || t.includes("chamussa") || t.includes("riss") || t.includes("cox")) {
      return [
        block(
          "Preparar o recheio",
          [
            "Pique cebola e alho.",
            "Refogue cebola com um fio de óleo até dourar levemente.",
            "Junte o ingrediente principal do recheio (carne/frango/legumes) e tempere.",
            "Cozinhe até ficar sequinho (recheio molhado rasga a massa).",
            "Deixe o recheio esfriar completamente."
          ],
          "Recheio frio e seco = não abre na fritura."
        ),
        block(
          "Preparar a massa / folhas",
          [
            "Se usar massa pronta (folhas): separe e mantenha coberta com pano para não ressecar.",
            "Se for massa caseira: misture farinha + sal + óleo e água aos poucos até formar massa lisa.",
            "Deixe descansar 15–20 minutos antes de abrir (fica mais elástica)."
          ]
        ),
        block(
          "Montar (dobrar e selar)",
          [
            "Coloque uma porção pequena do recheio (não exagere).",
            "Dobre firme e sele a borda com água (ou água + farinha).",
            "Aperte bem as pontas para não entrar óleo."
          ],
          "Fechar bem evita que a fritura estoure."
        ),
        block(
          "Fritar / assar",
          [
            "Aqueça óleo em fogo médio (óleo muito quente queima por fora e fica cru por dentro).",
            "Frite até dourar, virando para dourar por igual.",
            "Escorra em papel e sirva."
          ],
          "Se preferir: asse a 200°C pincelando óleo para dourar."
        )
      ];
    }

    // default salgado
    return templateSavory(title);
  }

  // =========================
  // 🇲🇿 Moçambique (receitas base reais + fill)
  // =========================

  const MZ_CORE = [
    mk({
      id: 5001,
      title: "Matapa",
      origin: "mz",
      category: "salgado",
      time: "1h 10 min",
      yield: "6 porções",
      difficulty: "Médio",
      ingredients: [
        "Folhas de mandioca: 250 g (bem picadas/piladas)",
        "Amendoim: 300–500 g (pilado/moído)",
        "Alho: 4–5 dentes (amassados)",
        "Cebola: 1 pequena (em cubos)",
        "Coco: 1 (ralado) ou leite de coco (aprox. 400–500 ml)",
        "Sal: a gosto",
        "Opcional: caranguejo/camarão/peixe (para versão com marisco)"
      ],
      stepsBlocks: [
        block(
          "Preparar o leite de coco e o amendoim",
          [
            "Se for coco fresco: rale o coco e misture com água morna; esprema num pano/peneira para tirar o leite. Reserve.",
            "Moa/pile o amendoim até virar uma farinha grossa.",
            "Misture o amendoim com água e mexa até formar um 'leite' (fica esbranquiçado)."
          ],
          "A base da Matapa é leite de coco + amendoim, que engrossa e dá sabor. :contentReference[oaicite:1]{index=1}"
        ),
        block(
          "Cozinhar as folhas (sem água)",
          [
            "Pique/pile as folhas de mandioca bem fininhas (quanto mais finas, mais macias ficam).",
            "Coloque as folhas numa panela (sem adicionar água) e cozinhe em fogo baixo por cerca de 25–35 minutos, mexendo às vezes.",
            "Quando começar a secar, mexa bem para não pegar no fundo."
          ],
          "Cozinhar as folhas antes evita gosto 'cru' e deixa a Matapa bem macia. :contentReference[oaicite:2]{index=2}"
        ),
        block(
          "Adicionar alho, leite e engrossar",
          [
            "Junte o alho amassado e uma pitada de sal; mexa por 1 minuto.",
            "Adicione o leite de coco e mexa.",
            "Acrescente o leite de amendoim aos poucos, mexendo sempre.",
            "Cozinhe mais 15–25 minutos em fogo baixo, mexendo para não grudar, até ficar cremoso."
          ],
          "Mexer sempre é essencial: amendoim gruda fácil no fundo. :contentReference[oaicite:3]{index=3}"
        ),
        block(
          "Finalizar e servir",
          [
            "Prove e ajuste o sal.",
            "Se quiser versão com marisco/peixe: adicione já cozido e deixe mais 5–10 minutos para pegar sabor.",
            "Sirva com arroz branco ou xima."
          ],
          "A Matapa tradicional pode levar marisco/peixe dependendo da região. :contentReference[oaicite:4]{index=4}"
        )
      ],
      tips: [
        "Para iniciante: faça primeiro a versão simples (sem marisco) para dominar o ponto cremoso.",
        "Se estiver muito grosso, pingue água quente aos poucos e mexa."
      ]
    }),

    mk({
      id: 5002,
      title: "Caril de Amendoim (frango)",
      origin: "mz",
      category: "salgado",
      time: "1h 10 min",
      yield: "4–5 porções",
      difficulty: "Médio",
      ingredients: [
        "Frango: 1 kg (em pedaços)",
        "Amendoim: 300–500 g (sem pele, moído/pilado)",
        "Tomate: 4–6 (maduros, picados) ou molho simples",
        "Cebola: 1–2 (picadas)",
        "Alho: 2 dentes (amassados)",
        "Sal e pimenta/piri-piri: a gosto",
        "Água: o suficiente para o molho",
        "Opcional: leite de coco (para versão com coco)"
      ],
      stepsBlocks: [
        block(
          "Preparar o 'leite' de amendoim",
          [
            "Moa/pile o amendoim até virar uma farinha.",
            "Misture com água e mexa bem.",
            "Coe (opcional) para um molho mais liso, ou use direto para ficar mais rústico."
          ],
          "Esse leite engrossa quando ferve — mexa sempre para não pegar. :contentReference[oaicite:5]{index=5}"
        ),
        block(
          "Base do molho (cebola + tomate)",
          [
            "Numa panela, aqueça 1–2 colheres de óleo em fogo médio.",
            "Refogue a cebola 3–5 minutos até murchar e dourar levemente.",
            "Adicione o alho e mexa 20–30 segundos.",
            "Junte o tomate picado (ou molho) e cozinhe 5–8 minutos até virar um molho bem apurado."
          ],
          "Molho apurado (tomate bem cozido) deixa o caril mais saboroso. :contentReference[oaicite:6]{index=6}"
        ),
        block(
          "Cozinhar o frango",
          [
            "Adicione o frango ao molho de tomate e misture para envolver.",
            "Tempere com sal e piri-piri/pimenta (aos poucos).",
            "Adicione água quente só até cobrir parcialmente o frango.",
            "Cozinhe 25–35 minutos em fogo médio/baixo até o frango ficar macio."
          ],
          "Cozinhar antes ajuda o frango a pegar sabor e ficar macio."
        ),
        block(
          "Adicionar amendoim e engrossar",
          [
            "Abaixe o fogo (importante).",
            "Adicione o leite/pasta de amendoim aos poucos, mexendo sempre.",
            "Cozinhe mais 15–20 minutos em fogo baixo até engrossar (mexendo para não grudar).",
            "Prove e ajuste o sal. Se ficar muito grosso, pingue água quente aos poucos."
          ],
          "Amendoim gruda fácil: fogo baixo + mexer sempre. :contentReference[oaicite:7]{index=7}"
        )
      ],
      tips: [
        "Sirva com arroz branco, xima ou mucapata.",
        "Se quiser mais cremoso: pode adicionar um pouco de leite de coco no final (opcional)."
      ]
    }),

    mk({
      id: 5003,
      title: "Frango à Zambeziana",
      origin: "mz",
      category: "salgado",
      time: "1h",
      yield: "4 porções",
      difficulty: "Médio",
      ingredients: [
        "Frango: 1 inteiro cortado (ou 1–1,2 kg em pedaços)",
        "Alho: 2 colheres (chá) (amassado) ou 3–4 dentes",
        "Folha de louro: 2",
        "Limão: 1 (suco)",
        "Sal e pimenta/piri-piri: a gosto",
        "Leite de coco: 400–500 ml (caseiro ou de pacote)"
      ],
      stepsBlocks: [
        block(
          "Temperar e marinar",
          [
            "Lave o frango, escorra bem e faça pequenos cortes na carne (ajuda a entrar o tempero).",
            "Tempere com alho amassado, sal, pimenta/piri-piri e folhas de louro.",
            "Regue com o suco de limão e misture bem.",
            "Adicione metade do leite de coco por cima e deixe marinar 30 minutos."
          ],
          "Marinar deixa o frango bem saboroso e com aroma do coco. :contentReference[oaicite:8]{index=8}"
        ),
        block(
          "Dourar o frango (para ficar bonito e saboroso)",
          [
            "Aqueça uma panela larga (ou frigideira) com um fio de óleo.",
            "Doure o frango de ambos os lados (2–4 minutos por lado), só para ganhar cor.",
            "Retire e reserve (se estiver usando a mesma panela)."
          ],
          "Dourar antes dá sabor (reação de Maillard) e melhora a aparência."
        ),
        block(
          "Cozinhar no leite de coco",
          [
            "Volte o frango para a panela.",
            "Adicione o restante leite de coco.",
            "Cozinhe em fogo baixo por 25–35 minutos, mexendo/virando o frango às vezes.",
            "Se o molho secar muito, pingue um pouco de água quente (aos poucos)."
          ],
          "Fogo baixo evita talhar o leite de coco e deixa o frango macio. :contentReference[oaicite:9]{index=9}"
        ),
        block(
          "Finalizar",
          [
            "Prove o molho e ajuste sal/piri-piri.",
            "Desligue o fogo e deixe descansar 5 minutos.",
            "Sirva com mucapata, arroz branco ou xima."
          ],
          "Acompanhamentos comuns: mucapata/arroz. :contentReference[oaicite:10]{index=10}"
        )
      ],
      tips: [
        "Se usar leite de coco de pacote, mexa bem antes de colocar.",
        "Se quiser molho mais espesso, deixe reduzir alguns minutos no final (fogo baixo)."
      ]
    })
  ];

  // Fill de MZ (o teu arquivo gerava mais 57 para fechar 60)
  const MZ_FILL = [];
  const MZ_TOTAL = 60;

  for (let i = MZ_CORE.length; i < MZ_TOTAL; i++) {
    const id = 5001 + i;
    const category = (i % 5 === 0) ? "doce" : "salgado";
    const title = category === "doce" ? `Doce tradicional #${i + 1}` : `Prato moçambicano #${i + 1}`;
    MZ_FILL.push(mk({
      id,
      title,
      origin: "mz",
      category,
      time: category === "doce" ? "40–70 min" : "20–60 min",
      yield: category === "doce" ? "8 porções" : "4 porções",
      difficulty: (i % 3 === 0) ? "Médio" : "Fácil",
      ingredients: [
        "Base: cebola/alho ou temperos",
        "Sal e pimenta",
        "Óleo/azeite",
        "Ingrediente principal",
        "Ervas/Especiarias (opcional)"
      ],
      stepsBlocks: smartSteps(title, category),
      tips: [
        "Siga os passos com calma e prove no final para ajustar o tempero.",
        "Se estiver a aprender, faça 1 vez anotando o que gostou e melhore na próxima."
      ]
    }));
  }

  const MZ = [...MZ_CORE, ...MZ_FILL].slice(0, 60);

  // =========================
  // 🌍 Internacionais (receitas base reais + fill)
  // =========================

  const INTL_CORE = [
    mk({
      id: 6001,
      title: "Spring roll",
      origin: "intl",
      category: "salgado",
      time: "40–60 min",
      yield: "12 unidades",
      difficulty: "Médio",
      ingredients: [
        "Folhas/massa para spring roll (ou massa fina)",
        "Repolho: fatiado fino",
        "Cenoura: em tiras finas",
        "Cebolinha: picada",
        "Gengibre e alho (opcional)",
        "Molho de soja (shoyu): a gosto",
        "Óleo para refogar e fritar"
      ],
      stepsBlocks: [
        block(
          "Preparar o recheio (seco e crocante)",
          [
            "Corte os legumes bem fininhos (repolho e cenoura).",
            "Aqueça uma panela em fogo alto com um fio de óleo.",
            "Refogue primeiro a cenoura por 1 minuto.",
            "Adicione o repolho e mexa 2–3 minutos só até murchar (não cozinhe demais).",
            "Tempere com shoyu aos poucos e finalize com cebolinha.",
            "Desligue e deixe o recheio esfriar."
          ],
          "Recheio muito molhado rasga a massa e estoura na fritura. :contentReference[oaicite:11]{index=11}"
        ),
        block(
          "Montar (dobrar e selar)",
          [
            "Abra uma folha de massa e mantenha as outras cobertas para não ressecar.",
            "Coloque 1–2 colheres do recheio (não exagere).",
            "Dobre as laterais para dentro e enrole firme.",
            "Sele a ponta com um pouco de água (ou água + farinha)."
          ],
          "Enrolar firme evita entrar óleo e ajuda a ficar crocante. :contentReference[oaicite:12]{index=12}"
        ),
        block(
          "Fritar (ou assar)",
          [
            "Aqueça óleo em fogo médio (não muito forte).",
            "Frite os rolinhos até dourar, virando para dourar por igual.",
            "Escorra em papel e sirva."
          ],
          "Se preferir: asse a 200°C pincelando óleo para dourar."
        ),
        block(
          "Servir",
          [
            "Sirva com molho agridoce, shoyu ou molho picante.",
            "Coma ainda quente para manter crocância."
          ]
        )
      ],
      tips: [
        "Se a massa rachar, está seca: cubra com pano levemente úmido enquanto monta."
      ]
    }),

    mk({
      id: 6002,
      title: "Samosa",
      origin: "intl",
      category: "salgado",
      time: "1h 10 min",
      yield: "12 unidades",
      difficulty: "Médio",
      ingredients: [
        "Massa: farinha + sal + óleo (e água aos poucos)",
        "Recheio: batata cozida (ou frango/carne) + temperos",
        "Cebola, alho, gengibre (opcional)",
        "Especiarias: cominho/curry/garam masala (opcional)",
        "Óleo para fritar"
      ],
      stepsBlocks: [
        block(
          "Fazer a massa (fica crocante)",
          [
            "Misture a farinha com sal.",
            "Adicione óleo e esfregue com os dedos até virar uma farofa (isso dá crocância).",
            "Adicione água aos poucos e amasse até formar uma massa firme e lisa.",
            "Cubra e deixe descansar 20–30 minutos."
          ],
          "Descansar a massa ajuda a abrir sem rasgar. :contentReference[oaicite:13]{index=13}"
        ),
        block(
          "Preparar o recheio",
          [
            "Cozinhe batatas até ficarem macias e amasse grosseiramente (ou prepare o recheio escolhido).",
            "Refogue cebola com um fio de óleo até dourar levemente.",
            "Adicione alho/gengibre (opcional) e as especiarias.",
            "Misture a batata e ajuste sal/pimenta.",
            "Deixe o recheio esfriar (muito importante)."
          ],
          "Recheio frio ajuda a fechar e não molha a massa. :contentReference[oaicite:14]{index=14}"
        ),
        block(
          "Modelar (formar o triângulo)",
          [
            "Abra a massa em discos finos e corte ao meio (vira 2 semicírculos).",
            "Forme um cone com o semicírculo e sele a borda com água.",
            "Coloque o recheio dentro (sem encher demais).",
            "Feche a abertura e sele bem todas as pontas."
          ],
          "Selar bem evita abrir durante a fritura. :contentReference[oaicite:15]{index=15}"
        ),
        block(
          "Fritar (sem queimar)",
          [
            "Aqueça óleo em fogo médio/baixo (óleo muito quente escurece fora e fica cru dentro).",
            "Frite aos poucos, virando, até dourar por igual.",
            "Escorra em papel e sirva."
          ]
        )
      ],
      tips: [
        "Se aparecerem bolhas na massa, o óleo estava muito quente — abaixe o fogo."
      ]
    }),

    mk({
      id: 6003,
      title: "Gulab jamun",
      origin: "intl",
      category: "doce",
      time: "1h 10 min",
      yield: "18–22 unidades",
      difficulty: "Difícil",
      ingredients: [
        "Bolinhas: leite em pó + um pouco de farinha",
        "Bolinhas: ghee/manteiga + leite (aos poucos)",
        "Calda: açúcar + água",
        "Aromas: cardamomo e água de rosas (opcional)"
      ],
      stepsBlocks: [
        block(
          "Fazer a calda (tem que ficar morna)",
          [
            "Numa panela, coloque água e açúcar e aqueça em fogo médio até dissolver.",
            "Depois que ferver, deixe ferver alguns minutos para formar uma calda leve (não precisa engrossar muito).",
            "Aromatize com cardamomo e, se tiver, um pouco de água de rosas.",
            "Desligue e mantenha a calda morna (não fervendo forte)."
          ],
          "Calda morna ajuda os bolinhos a absorver sem endurecer. :contentReference[oaicite:16]{index=16}"
        ),
        block(
          "Fazer a massa das bolinhas (macia e sem rachar)",
          [
            "Misture leite em pó com um pouco de farinha (e fermento/bicarbonato se sua receita usar).",
            "Adicione ghee/manteiga e misture.",
            "Adicione leite aos poucos até formar uma massa macia (não sove demais).",
            "Modele bolinhas lisas, pequenas, sem rachaduras."
          ],
          "Se a bolinha rachar, entrou pouca umidade — pingue mais leite e remodele. :contentReference[oaicite:17]{index=17}"
        ),
        block(
          "Fritar em fogo baixo (para cozinhar por dentro)",
          [
            "Aqueça óleo em fogo baixo/médio-baixo.",
            "Frite as bolinhas mexendo de leve para dourar por igual (sem pressa).",
            "Quando estiverem douradas e uniformes, retire e escorra rapidamente."
          ],
          "Fogo alto doura fora e deixa cru dentro. :contentReference[oaicite:18]{index=18}"
        ),
        block(
          "Mergulhar na calda (o segredo)",
          [
            "Coloque as bolinhas ainda quentes dentro da calda morna.",
            "Deixe descansar 30–60 minutos para absorver.",
            "Sirva morno ou em temperatura ambiente."
          ],
          "O tempo na calda é o que deixa o gulab jamun macio e doce. :contentReference[oaicite:19]{index=19}"
        )
      ],
      tips: [
        "Não faça bolinhas grandes — elas crescem e absorvem melhor quando pequenas.",
        "Se a calda estiver fria, não absorve; se estiver fervendo forte, endurece."
      ]
    })
  ];

  // Fill internacionais (para fechar 60)
  const INTL_FILL = [];
  const INTL_TOTAL = 60;

  for (let i = INTL_CORE.length; i < INTL_TOTAL; i++) {
    const id = 6001 + i;
    const category = (i % 4 === 0) ? "doce" : "salgado";
    const title = category === "doce" ? `Sobremesa internacional #${i + 1}` : `Prato internacional #${i + 1}`;

    INTL_FILL.push(mk({
      id,
      title,
      origin: "intl",
      category,
      time: category === "doce" ? "40–70 min" : "20–60 min",
      yield: category === "doce" ? "8 porções" : "4 porções",
      difficulty: (i % 3 === 0) ? "Médio" : "Fácil",
      ingredients: [
        "Base: cebola/alho ou temperos",
        "Sal e pimenta",
        "Óleo/azeite",
        "Ingrediente principal",
        "Ervas/Especiarias (opcional)"
      ],
      stepsBlocks: smartSteps(title, category),
      tips: [
        "Siga os passos com calma e prove no final para ajustar sabor.",
        "Se for a primeira vez, faça em fogo mais baixo — é mais seguro."
      ]
    }));
  }

  const INTL = [...INTL_CORE, ...INTL_FILL].slice(0, 60);

  // Export final
  window.DEFAULT_RECIPES = [...MZ, ...INTL];
})();

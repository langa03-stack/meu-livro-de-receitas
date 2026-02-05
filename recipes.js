// recipes.js
// Exporta: window.DEFAULT_RECIPES (120 receitas)
// IMPORTANTE: image fica "" para o script.js buscar foto correta na Wikipédia

(() => {
  const block = (title, steps, note = "") => ({
    title,
    steps,
    ...(note ? { note } : {})
  });

  const mk = (data) => ({
    ...data,
    image: "" // <- deixa vazio (sem picsum/unsplash)
  });

  // 🇲🇿 Moçambique (60)
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
        "Folhas de mandioca picadas",
        "Leite de coco",
        "Amendoim torrado moído",
        "Alho",
        "Sal",
        "Camarão seco (opcional)"
      ],
      stepsBlocks: [
        block("Cozinhar", ["Cozinhe as folhas até ficarem macias.", "Tempere com alho e sal.", "Mexa para não pegar."]),
        block("Finalizar", ["Junte amendoim moído e cozinhe para engrossar.", "Adicione leite de coco.", "Apure 10 min."])
      ],
      tips: ["Sirva com arroz branco e peixe grelhado."]
    }),
    mk({
      id: 5002,
      title: "Caril de Amendoim (frango)",
      origin: "mz",
      category: "salgado",
      time: "55 min",
      yield: "5 porções",
      difficulty: "Médio",
      ingredients: ["Frango", "Cebola", "Alho", "Tomate", "Amendoim moído", "Sal e caril"],
      stepsBlocks: [
        block("Base", ["Refogue cebola e alho.", "Junte tomate e faça um molho.", "Tempere com caril."]),
        block("Cozinhar", ["Adicione frango.", "Junte creme de amendoim.", "Cozinhe até encorpar."])
      ],
      tips: ["Se engrossar, ajuste com água quente."]
    }),
    mk({
      id: 5003,
      title: "Frango à Zambeziana",
      origin: "mz",
      category: "salgado",
      time: "1h",
      yield: "4 porções",
      difficulty: "Médio",
      ingredients: ["Frango", "Leite de coco", "Alho", "Limão", "Sal e pimenta"],
      stepsBlocks: [
        block("Marinar", ["Tempere frango com alho, limão, sal e pimenta.", "Descanse 20 min."]),
        block("Cozinhar", ["Doure o frango.", "Junte leite de coco.", "Cozinhe até reduzir."])
      ],
      tips: ["Finalize com raspas de limão."]
    })
  ];

  const MZ_LIST = [
    "Peixe grelhado", "Frango piri-piri", "Xima", "Badjia", "Caril de batata", "Caril de feijão",
    "Arroz de coco", "Salada de tomate e cebola", "Mandioca cozida", "Banana frita",
    "Chamussas de frango", "Chamussas de carne", "Rissóis de frango", "Rissóis de camarão",
    "Coxinhas", "Empadão de frango", "Caril de quiabo", "Caril de abóbora",
    "Arroz doce", "Pudim", "Bolo de coco", "Bolo de banana", "Biscoitos"
  ];

  const MZ_FILL = Array.from({ length: 60 - MZ_CORE.length }, (_, i) => {
    const id = 5100 + i;
    const base = MZ_LIST[i % MZ_LIST.length];
    const title = `${base}`;
    const isDoce = /arroz doce|pudim|bolo|biscoito/i.test(title);

    return mk({
      id,
      title,
      origin: "mz",
      category: isDoce ? "doce" : "salgado",
      time: isDoce ? "40–70 min" : "20–60 min",
      yield: isDoce ? "8 porções" : "4 porções",
      difficulty: "Fácil",
      ingredients: isDoce
        ? ["Açúcar", "Farinha (se for bolo)", "Ovos", "Leite/creme (opcional)", "Aroma (canela/baunilha)"]
        : ["Cebola", "Alho", "Sal", "Óleo", "Ingrediente principal", "Tempero (opcional)"],
      stepsBlocks: isDoce
        ? [block("Preparar", ["Misture ingredientes.", "Prepare forma/panela.", "Leve ao forno/fogo."]),
           block("Finalizar", ["Cozinhe/asse até firmar.", "Deixe amornar.", "Sirva."])]
        : [block("Base", ["Refogue cebola e alho.", "Tempere.", "Adicione ingrediente principal."]),
           block("Finalizar", ["Cozinhe até ficar no ponto.", "Ajuste tempero.", "Sirva."])],
      tips: ["Ajuste ao seu gosto."]
    });
  });

  const MZ = [...MZ_CORE, ...MZ_FILL].slice(0, 60);

  // 🌍 Internacionais (60)
  const INTL_CORE = [
    mk({
      id: 6001,
      title: "Spring roll",
      origin: "intl",
      category: "salgado",
      time: "40 min",
      yield: "12 unidades",
      difficulty: "Médio",
      ingredients: ["Massa para rolinhos", "Repolho", "Cenoura", "Shoyu", "Óleo"],
      stepsBlocks: [
        block("Recheio", ["Salteie os legumes rapidamente.", "Tempere com shoyu.", "Esfrie."]),
        block("Enrolar", ["Enrole firme e sele.", "Frite/asse até dourar."])
      ],
      tips: ["Evite recheio úmido."]
    }),
    mk({
      id: 6002,
      title: "Samosa",
      origin: "intl",
      category: "salgado",
      time: "1h 15 min",
      yield: "14 unidades",
      difficulty: "Médio",
      ingredients: ["Farinha", "Óleo", "Sal", "Batata", "Ervilhas", "Curry/garam masala"],
      stepsBlocks: [
        block("Recheio", ["Refogue especiarias.", "Junte batata e ervilhas.", "Esfrie."]),
        block("Montagem", ["Recheie e feche.", "Frite em óleo médio."])
      ],
      tips: ["Recheio seco deixa mais crocante."]
    }),
    mk({
      id: 6003,
      title: "Gulab jamun",
      origin: "intl",
      category: "doce",
      time: "1h 10 min",
      yield: "20 unidades",
      difficulty: "Difícil",
      ingredients: ["Leite em pó", "Farinha", "Manteiga/ghi", "Leite (aos poucos)", "Açúcar+água (calda)"],
      stepsBlocks: [
        block("Calda", ["Ferva açúcar+água.", "Mantenha morna."]),
        block("Bolinhas", ["Modele sem rachaduras.", "Frite em fogo baixo.", "Mergulhe na calda."])
      ],
      tips: ["Fogo baixo é essencial."]
    })
  ];

  const INTL_LIST = [
    "Thai curry", "Lasagna", "Pizza", "Spaghetti bolognese", "Carbonara", "Tacos", "Burrito",
    "Quesadilla", "Hamburger", "Ramen", "Yakissoba", "Quiche", "Falafel", "Hummus",
    "Shakshuka", "Paella", "Risotto", "Gyoza",
    "Flan", "Cheesecake", "Tiramisu", "Panna cotta", "Creme brulee",
    "Chocolate cake", "Carrot cake", "Banana bread", "Orange cake",
    "Brownie", "Chocolate chip cookie", "Butter cookies", "Passion fruit mousse", "Chocolate mousse",
    "Rice pudding", "Churros"
  ];

  const INTL_FILL = Array.from({ length: 60 - INTL_CORE.length }, (_, i) => {
    const id = 6100 + i;
    const title = INTL_LIST[i % INTL_LIST.length];
    const isDoce =
      /flan|cheese|tiramisu|panna|brulee|cake|bread|brownie|cookie|mousse|pudding|churros/i.test(title);

    return mk({
      id,
      title,
      origin: "intl",
      category: isDoce ? "doce" : "salgado",
      time: isDoce ? "35–80 min" : "20–70 min",
      yield: isDoce ? "8 porções" : "4 porções",
      difficulty: "Fácil",
      ingredients: isDoce
        ? ["Base doce", "Açúcar", "Ovos", "Leite/creme", "Aroma (opcional)"]
        : ["Base de tempero", "Sal e pimenta", "Óleo/azeite", "Ingrediente principal", "Ervas/especiarias"],
      stepsBlocks: isDoce
        ? [block("Preparar", ["Misture ingredientes.", "Prepare forma.", "Asse/gele até firmar."]),
           block("Servir", ["Deixe esfriar.", "Porcione.", "Sirva."])]
        : [block("Base", ["Prepare temperos.", "Cozinhe ingrediente principal.", "Ajuste sabor."]),
           block("Servir", ["Finalize.", "Ajuste sal.", "Sirva."])],
      tips: ["Ajuste ao seu gosto."]
    });
  });

  const INTL = [...INTL_CORE, ...INTL_FILL].slice(0, 60);

  window.DEFAULT_RECIPES = [...MZ, ...INTL];
})();

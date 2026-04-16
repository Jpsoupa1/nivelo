export type Language = 'en' | 'pt'

const STRINGS = {
  en: {
    sidebar: {
      liquidBalance: 'Liquid Balance',
      processing: 'AI processing',
      nav: {
        dashboard: { label: 'Dashboard',    description: 'Overview & analytics' },
        chat:      { label: 'AI Assistant', description: 'Natural language finance' },
        categories:{ label: 'Categories',   description: 'Budget envelopes' },
      },
      footer: 'Internal / Confidential',
    },

    dashboard: {
      liquidBalance: 'Liquid Balance',
      allAccounts:   'All accounts',
      lastTx:        'Last Transaction',
      monthlyIncome: 'Monthly Income',
      thisMonth:     'This month',
      topSpend:      (name: string) => `${name} — Top Spend`,
      nobudget:      'No budgeted categories',
      ofBudget:      (formatted: string) => `of ${formatted} budget`,
    },

    ledger: {
      title:       'Smart Ledger',
      search:      'Search transactions...',
      noMatch:     'No transactions match your filter.',
      allCats:     'All Categories',
      cols:        ['', 'Date', 'Description', 'Category', 'Source', 'Amount'],
    },

    allocation: {
      title:       'Budget Envelopes',
      unbudgeted:  'Unbudgeted',
      overBudget:  (amount: string) => `${amount} over budget`,
      remaining:   (amount: string) => `${amount} remaining`,
    },

    categories: {
      title:        'Categories',
      subtitle:     'Manage budget envelopes and spending categories',
      add:          'Add Category',
      namePlaceholder: 'Display name',
      keyPlaceholder:  'AUTO',
      count:        (n: number) => `${n} categor${n === 1 ? 'y' : 'ies'}`,
      autoCount:    (n: number) => `${n} auto-created by AI`,
      cols:         ['Color', 'Name', 'Key', 'Monthly Budget', 'Icon', '', ''],
    },

    chat: {
      title:      'AXIS AI Assistant',
      subtitle:   'Natural language finance — powered by n8n',
      processing: 'Processing',
      pipeline:   'Processing via n8n pipeline',
      placeholder:'Tell me about your finances...',
      welcome:    'Hello. I am AXIS AI — your autonomous finance assistant. Tell me about your transactions or ask about your finances.\n\nTry: "Spent 50 on lunch" · "Received 3000 salary" · "How much do I have?"',
      suggestions:['Spent 85 on groceries', 'Received 3000 salary', 'How much do I have?', 'Spent 30 on Housa', 'How much on food this month?'],
    },

    // Responses returned by the NLP parser / AICommandBar
    nlp: {
      fetchingBalance:     'Fetching your current balance...',
      aggregatingSpend:    (name: string) => `Aggregating spending for ${name}...`,
      updatingBudget:      (name: string, amount: string) => `Updating ${name} budget to ${amount}...`,
      updatingBudgetBlank: 'Updating budget...',
      processingIncome:    (amount: string) => `Processing income of ${amount}...`,
      processingIncomeBlank: 'Processing income...',
      loggingExpense:      (amount: string, name: string) => `Logging ${amount} in ${name}...`,
      loggingExpenseBlank: 'Logging expense...',
      unknown:             "I didn't catch that. Try: \"Spent 50 on lunch\" or \"Received 3000 salary\".",

      balance:             (amount: string) => `Your current liquid balance is **${amount}**.`,
      spendWithBudget:     (spent: string, budget: string, name: string) =>
        `You've spent **${spent}** of your **${budget}** ${name} budget this month.`,
      spendNoBudget:       (spent: string, name: string) =>
        `You've spent **${spent}** on ${name} this month (no budget set).`,
      noCatFound:          (name: string) => `No category found for "${name}".`,
      debit:               (amount: string, cat: string) =>
        `Debit of **${amount}** recorded in **${cat}**. Balance updated.`,
      credit:              (amount: string, cat: string) =>
        `Credit of **${amount}** recorded in **${cat}**. Balance updated.`,
      noAmount:            'I couldn\'t parse an amount. Try: "Spent $50 on lunch".',
      budgetSet:           (name: string, amount: string) =>
        `Budget for **${name}** set to **${amount}**. Head to Categories to review.`,
      budgetNoAmount:      'Please include an amount — e.g. "Set food budget to 500".',
      autoCatCreated:      (name: string) =>
        `\n\nNew category "**${name}**" was created automatically.`,
      autoCatHint:         (name: string) =>
        `\n\nCategory "${name}" was not found — I created it automatically. You can customize it in the Categories view.`,
    },
  },

  pt: {
    sidebar: {
      liquidBalance: 'Saldo Líquido',
      processing: 'IA processando',
      nav: {
        dashboard: { label: 'Painel',        description: 'Visão geral e análises' },
        chat:      { label: 'Assistente IA', description: 'Finanças em linguagem natural' },
        categories:{ label: 'Categorias',    description: 'Envelopes de orçamento' },
      },
      footer: 'Interno / Confidencial',
    },

    dashboard: {
      liquidBalance: 'Saldo Líquido',
      allAccounts:   'Todas as contas',
      lastTx:        'Última Transação',
      monthlyIncome: 'Renda Mensal',
      thisMonth:     'Este mês',
      topSpend:      (name: string) => `${name} — Maior Gasto`,
      nobudget:      'Nenhuma categoria orçada',
      ofBudget:      (formatted: string) => `de ${formatted} orçados`,
    },

    ledger: {
      title:       'Extrato Inteligente',
      search:      'Buscar transações...',
      noMatch:     'Nenhuma transação encontrada.',
      allCats:     'Todas as Categorias',
      cols:        ['', 'Data', 'Descrição', 'Categoria', 'Origem', 'Valor'],
    },

    allocation: {
      title:       'Envelopes de Orçamento',
      unbudgeted:  'Sem orçamento',
      overBudget:  (amount: string) => `${amount} acima do orçamento`,
      remaining:   (amount: string) => `${amount} restante`,
    },

    categories: {
      title:        'Categorias',
      subtitle:     'Gerencie envelopes de orçamento e categorias de gastos',
      add:          'Adicionar Categoria',
      namePlaceholder: 'Nome de exibição',
      keyPlaceholder:  'AUTO',
      count:        (n: number) => `${n} categoria${n === 1 ? '' : 's'}`,
      autoCount:    (n: number) => `${n} criada${n === 1 ? '' : 's'} automaticamente pela IA`,
      cols:         ['Cor', 'Nome', 'Chave', 'Orçamento Mensal', 'Ícone', '', ''],
    },

    chat: {
      title:      'AXIS Assistente IA',
      subtitle:   'Finanças em linguagem natural — via n8n',
      processing: 'Processando',
      pipeline:   'Processando via pipeline n8n',
      placeholder:'Me fale sobre suas finanças...',
      welcome:    'Olá. Eu sou o AXIS AI — seu assistente financeiro autônomo. Me conte sobre suas transações ou pergunte sobre suas finanças.\n\nTente: "Gastei 50 no almoço" · "Recebi 3000 de salário" · "Quanto tenho?"',
      suggestions:['Gastei 85 em mercado', 'Recebi 3000 de salário', 'Quanto tenho?', 'Gastei 30 em casa', 'Quanto gastei em comida?'],
    },

    nlp: {
      fetchingBalance:     'Buscando seu saldo atual...',
      aggregatingSpend:    (name: string) => `Calculando gastos em ${name}...`,
      updatingBudget:      (name: string, amount: string) => `Atualizando orçamento de ${name} para ${amount}...`,
      updatingBudgetBlank: 'Atualizando orçamento...',
      processingIncome:    (amount: string) => `Processando entrada de ${amount}...`,
      processingIncomeBlank: 'Processando entrada...',
      loggingExpense:      (amount: string, name: string) => `Registrando ${amount} em ${name}...`,
      loggingExpenseBlank: 'Registrando despesa...',
      unknown:             'Não entendi. Tente: "Gastei 50 no almoço" ou "Recebi 3000 de salário".',

      balance:             (amount: string) => `Seu saldo líquido atual é **${amount}**.`,
      spendWithBudget:     (spent: string, budget: string, name: string) =>
        `Você gastou **${spent}** de **${budget}** orçados em ${name} neste mês.`,
      spendNoBudget:       (spent: string, name: string) =>
        `Você gastou **${spent}** em ${name} neste mês (sem orçamento definido).`,
      noCatFound:          (name: string) => `Nenhuma categoria encontrada para "${name}".`,
      debit:               (amount: string, cat: string) =>
        `Débito de **${amount}** registrado em **${cat}**. Saldo atualizado.`,
      credit:              (amount: string, cat: string) =>
        `Crédito de **${amount}** registrado em **${cat}**. Saldo atualizado.`,
      noAmount:            'Não consegui identificar o valor. Tente: "Gastei R$50 no almoço".',
      budgetSet:           (name: string, amount: string) =>
        `Orçamento de **${name}** definido para **${amount}**. Acesse Categorias para revisar.`,
      budgetNoAmount:      'Inclua um valor — ex: "Definir orçamento de comida para 500".',
      autoCatCreated:      (name: string) =>
        `\n\nNova categoria "**${name}**" criada automaticamente.`,
      autoCatHint:         (name: string) =>
        `\n\nCategoria "${name}" não encontrada — criei automaticamente. Personalize em Categorias.`,
    },
  },
} as const

export type Strings = typeof STRINGS['en']

export function t(lang: Language): Strings {
  return STRINGS[lang] as Strings
}

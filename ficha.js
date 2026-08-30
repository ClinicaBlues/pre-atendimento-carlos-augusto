/* ============================================================================
   FICHA DE PRÉ-ATENDIMENTO — Dr. Carlos Augusto de Albuquerque Damasceno
   Neurologia Clínica
   ----------------------------------------------------------------------------
   Não é necessário editar este arquivo. Os ajustes do dia a dia ficam em config.js
   ========================================================================== */
(function () {
'use strict';

var CFG = window.FICHA_CONFIG || {};
var STORE_KEY = 'ficha_carlos_v3';
var A = {};            // respostas
var step = 0;
var SUM = null;        // modelo do resumo
var sending = false;

/* ==========================================================================
   1. CONTEÚDO DA FICHA
   ========================================================================== */

var SF_LABELS = ['Nada', 'Pouco', 'Mais ou menos', 'Muito', 'Extremamente'];
var CEF_FREQ  = ['Esporadicamente', 'Quase toda semana', 'Quase todos os dias', 'Praticamente todos os dias'];

var ZONAS = [
  { id:'topo',    label:'Topo da cabeça',    cx:166, cy:52,  r:24 },
  { id:'testa',   label:'Testa',             cx:120, cy:92,  r:24 },
  { id:'tempora', label:'Têmpora (lateral)', cx:134, cy:143, r:22 },
  { id:'olho',    label:'Em volta do olho',  cx:86,  cy:162, r:22 },
  { id:'atras',   label:'Atrás da cabeça',   cx:226, cy:128, r:26 },
  { id:'nuca',    label:'Nuca / pescoço',    cx:212, cy:248, r:24 },
  { id:'rosto',   label:'Rosto / mandíbula', cx:108, cy:252, r:23 },
  { id:'toda',    label:'A cabeça inteira',  noMap:true }
];

/* portas de entrada dos blocos por queixa */
function cef(a)   { return a.cefGate  === 'Sim'; }
function cog(a)   { return a.cogGate  === 'Sim'; }
function epi(a)   { return a.epiGate  === 'Sim'; }
function park(a)  { return a.parkGate === 'Sim'; }
function emDx(a)  { return a.emGate === 'Sim — já tenho o diagnóstico e estou em tratamento'; }
function emInv(a) { return a.emGate === 'Sim — ainda não tenho diagnóstico, mas suspeito e busco orientação'; }

var STEPS = [

/* ---------- 0 · abertura ---------------------------------------------- */
{
  kind: 'intro'
},

/* ---------- 1 · identificação ------------------------------------------ */
{
  num: '1', title: 'Vamos começar pelo básico',
  sub: 'Dados de identificação e contato. Leva menos de um minuto.',
  fields: [
    { id:'quemPreenche', t:'radio', req:true, label:'Quem está preenchendo esta ficha?',
      opts:['O próprio paciente','Acompanhante ou familiar'] },
    { id:'acompanhante', t:'text', label:'Seu nome e o seu grau de parentesco',
      ph:'Ex.: Maria Souza — filha', req:true,
      showIf:function(a){ return a.quemPreenche === 'Acompanhante ou familiar'; } },
    { id:'nome', t:'text', req:true, label:'Nome completo do paciente', ph:'Nome e sobrenome' },
    { id:'nasc', t:'date', label:'Data de nascimento', half:true },
    { id:'idade', t:'number', req:true, label:'Idade', ph:'anos', half:true },
    { id:'sexo', t:'radio', label:'Sexo', opts:['Feminino','Masculino','Prefiro não informar'] },
    { id:'tel', t:'tel', req:true, label:'Telefone / WhatsApp', ph:'(32) 99999-9999', half:true },
    { id:'email', t:'email', label:'E-mail (se tiver)', ph:'nome@email.com', half:true },
    { id:'cidade', t:'text', label:'Cidade e estado', ph:'Ex.: Juiz de Fora — MG', half:true },
    { id:'profissao', t:'text', label:'Profissão', ph:'O que você faz hoje', half:true },
    { id:'trabalho', t:'radio', label:'Situação de trabalho',
      opts:['Ativo','Afastado','Aposentado','Desempregado','Estudante','Do lar'] },
    { id:'plano', t:'text', label:'Plano de saúde', hint:'Se houver — usado apenas para exames.', ph:'Ex.: Unimed / Não tenho' },
    { id:'jaPaciente', t:'radio', req:true,
      label:'Você já é paciente do Dr. Carlos Augusto?',
      opts:['Sim, já sou paciente','Não, esta é a minha primeira consulta'] }
  ]
},

/* ---------- 2 · motivo da consulta -------------------------------------- */
{
  num: '2', title: 'O motivo da sua consulta',
  sub: 'Esta é a parte mais importante da ficha. Escreva com as suas palavras — não existe resposta errada.',
  fields: [
    { id:'queixa', t:'textarea', req:true,
      label:'Em suas palavras, o que trouxe você aqui?',
      hint:'Se forem várias queixas, comece pela que mais incomoda. Escreva livremente.',
      ph:'Ex.: Há uns 8 meses venho tendo dor de cabeça quase toda semana, e nos últimos dias começou a dar formigamento no braço direito…' },
    { id:'expectativa', t:'check', other:true,
      label:'Qual é a sua principal expectativa com esta consulta?',
      hint:'Pode marcar mais de uma.',
      opts:['Ter um diagnóstico claro','Iniciar um tratamento','Uma segunda opinião',
            'Ajustar ou reduzir medicação','Acompanhamento contínuo do meu quadro',
            'Relatório ou laudo','Entender se o que sinto é grave'] },
    { id:'tempoConvive', t:'radio', req:true, label:'Há quanto tempo você convive com esse problema?',
      opts:['Menos de 1 mês','1 a 6 meses','6 a 12 meses','1 a 5 anos','Mais de 5 anos'] },
    { id:'outrosProf', t:'radio', label:'Você já procurou outros profissionais por causa disso?',
      opts:['Não','Sim'] },
    { id:'outrosQtd', t:'number', label:'Quantos profissionais, aproximadamente?', ph:'Ex.: 3', half:true,
      showIf:function(a){ return a.outrosProf === 'Sim'; } },
    { id:'outrosEsp', t:'text', label:'Quais especialidades?', ph:'Ex.: clínico, ortopedista, psiquiatra', half:true,
      showIf:function(a){ return a.outrosProf === 'Sim'; } }
  ]
},

/* ---------- 3 · dor de cabeça ------------------------------------------- */
{
  num: '3', title: 'Dor de cabeça',
  sub: 'Se dor de cabeça não é um problema para você, responda “Não” e siga adiante.',
  fields: [
    { id:'cefGate', t:'radio', req:true, label:'A dor de cabeça é uma das suas queixas?',
      opts:['Sim','Não'] },

    { id:'cefLocal', t:'headmap', label:'Onde dói?',
      hint:'Toque no desenho ou nos nomes ao lado. Pode marcar mais de um lugar.',
      showIf:cef },

    { id:'cefLados', t:'radio', label:'A dor pega um lado só ou os dois lados da cabeça?',
      opts:['Um lado só','Os dois lados','Varia — às vezes um, às vezes os dois'], showIf:cef },

    { id:'cefTipo', t:'check', other:true, label:'Como é a dor?',
      hint:'Pode marcar mais de uma.',
      opts:['Um peso ou um aperto, como se apertasse a cabeça',
            'Uma pulsação, que lateja junto com o coração',
            'Uma fisgada, como uma pontada rápida',
            'Uma queimação'], showIf:cef },

    { id:'cefRepouso', t:'radio', label:'A dor melhora quando você descansa ou deita?',
      opts:['Sim, melhora','Não tem relação com o descanso'], showIf:cef },

    { id:'cefImpede', t:'radio', label:'A dor impede as suas atividades?',
      opts:['Sim','Não'], showIf:cef },

    { id:'cefLuzSom', t:'radio', label:'A dor piora com claridade (luz) ou com barulho?',
      opts:['Sim','Não'], showIf:cef },

    { id:'cefEnjoo', t:'radio', label:'Tem enjoo ou vômito junto com a dor?',
      opts:['Sim','Não'], showIf:cef },

    { id:'cefFreq', t:'scale1', label:'No último mês, com que frequência você teve essa dor?',
      hint:'Não precisa ser exato — escolha o que mais se parece com a sua realidade.',
      labels:CEF_FREQ, showIf:cef },

    { id:'cefDuracao', t:'radio', label:'Quanto tempo costuma durar cada crise de dor?',
      opts:['Poucos segundos','Alguns minutos','Algumas horas','Mais de um dia'], showIf:cef },

    { id:'cefAura', t:'check', other:true, excl:'Nenhum desses',
      label:'Antes da dor começar, você sente algum destes sintomas?',
      opts:['Formigamento','Dificuldade para falar','Flashes de luz na visão','Nenhum desses'],
      showIf:cef },

    { id:'cefGatilho', t:'check', excl:'Não há relação',
      label:'Você percebe algo que provoca ou piora essa dor?',
      hint:'Pode marcar mais de uma.',
      opts:['Algum alimento específico','Menstruação','Esforço físico','Estresse ou nervosismo','Não há relação'],
      showIf:cef },
    { id:'cefGatilhoAlim', t:'text', label:'Qual alimento?', ph:'Ex.: queijo, vinho, chocolate',
      showIf:function(a){ return cef(a) && inArr(a.cefGatilho, 'Algum alimento específico'); } },

    { id:'cefAssoc', t:'check', excl:'Nada disso acontece',
      label:'Durante a dor, acontece alguma destas coisas?',
      hint:'Pode marcar mais de uma.',
      opts:['O olho lacrimeja','O olho fica vermelho','O nariz entope',
            'O nariz escorre','A pálpebra cai — um olho parece fechar sozinho',
            'Nada disso acontece'], showIf:cef },

    { id:'cefRemedio', t:'textarea', label:'Quais remédios ou analgésicos aliviam a sua dor?',
      ph:'Ex.: dipirona, Neosaldina, ibuprofeno…', showIf:cef },

    { id:'cefFreqAnalg', t:'radio', label:'Quantas vezes por semana você usa analgésico?',
      opts:['Mais de 2x por semana','Menos de 2x por semana'], showIf:cef }
  ]
},

/* ---------- 4 · memória e cognição --------------------------------------- */
{
  num: '4', title: 'Memória e cognição',
  sub: 'Se um familiar estiver ajudando a preencher, a percepção dele também conta.',
  fields: [
    { id:'cogGate', t:'radio', req:true,
      label:'A memória ou a concentração é uma das suas queixas?', opts:['Sim','Não'] },

    { id:'cogTempo', t:'text', label:'Há quanto tempo começou a perceber essa alteração?',
      ph:'Ex.: há mais ou menos 2 anos', showIf:cog },

    { id:'cogQuemPercebeu', t:'radio', label:'A alteração da memória foi percebida:',
      opts:['Por mim mesmo(a)','Somente por um familiar','Pelos dois — eu e um familiar'], showIf:cog },

    { id:'cogEvolucao', t:'radio', label:'Em relação a esse problema:',
      opts:['Vem piorando com o tempo','Está estável'], showIf:cog },

    { id:'cogItens', t:'check', excl:'Nenhuma dessas',
      label:'Marque o que acontece com você:', hint:'Pode marcar mais de uma.',
      opts:['Esqueço fatos recentes',
            'Repito as mesmas coisas nas conversas',
            'Me perco ou me confundo em lugares conhecidos',
            'Me confundo com datas, dias da semana ou horários',
            'Tenho dificuldade com contas, remédios, dinheiro ou compras',
            'Confundo pessoas da família',
            'Mudei de comportamento — fiquei mais agitado(a), inquieto(a) ou irritado(a)',
            'Tenho dificuldade em tarefas simples do dia a dia (tomar banho, me vestir, calçar o sapato)',
            'Tenho dificuldade para dar conta da minha vida pessoal ou do trabalho',
            'Falo ou faço coisas fora de hora, sem o freio de antes',
            'Perdi o interesse e a vontade de fazer as coisas',
            'Nenhuma dessas'], showIf:cog }
  ]
},

/* ---------- 5 · desmaios e crises ----------------------------------------- */
{
  num: '5', title: 'Desmaios, “apagões” ou crises',
  sub: 'Se um familiar presenciou os episódios, a descrição dele é muito valiosa aqui.',
  fields: [
    { id:'epiGate', t:'radio', req:true,
      label:'Desmaios, alterações de consciência ou crises são uma das suas queixas?',
      opts:['Sim','Não'] },

    { id:'epiAntes', t:'textarea',
      label:'Antes do desmaio você sente alguma coisa, ou vem de repente?',
      hint:'Escreva com poucas palavras.',
      ph:'Ex.: sinto uma tonteira e quando vejo já estou no chão. / Não sinto nada, vem do nada.',
      showIf:epi },

    { id:'epiDuracao', t:'radio', label:'Quanto tempo dura o desmaio?',
      opts:['Segundos','Poucos minutos','Algumas horas'], showIf:epi },

    { id:'epiCarac', t:'check', excl:'Nenhuma dessas',
      label:'O que acontece durante o episódio?',
      hint:'Marque tudo o que você ou quem estava junto percebeu.',
      opts:['O corpo fica rígido, duro',
            'O corpo fica todo mole',
            'Há abalos musculares — fico me debatendo',
            'Mordo a língua',
            'Faço ronco ou barulhos',
            'Babo bastante',
            'Perco o controle da urina ou das fezes',
            'Chego a me machucar com a queda',
            'Percebo tudo o que acontece em volta, mesmo durante o episódio',
            'Fico pálido(a)',
            'Fico suado(a)',
            'Nenhuma dessas'], showIf:epi },

    { id:'epiAusencia', t:'radio',
      label:'Você já teve alguma crise em que não desmaia, mas fica “ausente” por um tempo?',
      opts:['Sim','Não'], showIf:epi },

    { id:'epiApos', t:'check', excl:'Nada disso — já acordo normal',
      label:'Depois do episódio, o que você sente?', hint:'Pode marcar mais de uma.',
      opts:['Dor de cabeça','Dor no corpo','Confusão mental','Nada disso — já acordo normal'],
      showIf:epi }
  ]
},

/* ---------- 6 · parkinson e tremores -------------------------------------- */
{
  num: '6', title: 'Tremores e lentidão dos movimentos',
  sub: 'Se um familiar estiver ajudando a preencher, a percepção dele também conta.',
  fields: [
    { id:'parkGate', t:'radio', req:true,
      label:'Tremor, lentidão dos movimentos ou doença de Parkinson é uma das suas queixas?',
      opts:['Sim','Não'] },

    { id:'parkTremor', t:'radio', label:'Você apresenta tremor?', opts:['Sim','Não'], showIf:park },

    { id:'parkTremorLocal', t:'text',
      label:'Onde é o tremor? É de um lado só ou dos dois lados?',
      ph:'Ex.: na mão direita apenas / nas duas mãos',
      showIf:function(a){ return park(a) && a.parkTremor === 'Sim'; } },

    { id:'parkTremorQuando', t:'check', excl:'Não percebo nada que piore',
      label:'O tremor aparece mais:', hint:'Pode marcar mais de uma.',
      opts:['Quando estou parado(a), em repouso',
            'Quando vou fazer alguma tarefa com as mãos',
            'Quando estou nervoso(a) ou estressado(a)',
            'Não percebo nada que piore'],
      showIf:function(a){ return park(a) && a.parkTremor === 'Sim'; } },

    { id:'parkTremorAlivio', t:'check', excl:'Não percebo nada que alivie',
      label:'O tremor alivia:', hint:'Pode marcar mais de uma.',
      opts:['Quando descanso','Quando bebo bebida alcoólica','Não percebo nada que alivie'],
      showIf:function(a){ return park(a) && a.parkTremor === 'Sim'; } },

    { id:'parkMarcha', t:'radio',
      label:'Tem dificuldade para caminhar, como se as pernas travassem?',
      opts:['Sim','Não'], showIf:park },

    { id:'parkEquilibrio', t:'radio', label:'Tem dificuldade de equilíbrio, com quedas?',
      opts:['Sim','Não'], showIf:park },

    { id:'parkLentidao', t:'radio',
      label:'Tem notado os seus movimentos mais lentos?',
      hint:'Como abotoar uma camisa, calçar um sapato, escovar os dentes — coisas do dia a dia que ficaram demoradas.',
      opts:['Sim','Não'], showIf:park },

    { id:'parkTonteira', t:'radio', label:'Tem sentido tonteira ou sensação de que vai desmaiar?',
      opts:['Sim','Não'], showIf:park },

    { id:'parkOlfato', t:'radio', label:'Tem perdido o olfato — o cheiro das coisas?',
      opts:['Sim','Não'], showIf:park }
  ]
},

/* ---------- 7 · esclerose múltipla ---------------------------------------- */
{
  num: '7', title: 'Esclerose múltipla e doenças desmielinizantes',
  sub: 'Inclui mielite e neurite óptica. Se não for o seu caso, marque a primeira opção e siga.',
  fields: [
    { id:'emGate', t:'radiobig', req:true, label:'Este é o seu caso?',
      opts:[
        { v:'Não é a minha queixa', d:'Nunca tive esse diagnóstico e não é o que me traz aqui.' },
        { v:'Sim — já tenho o diagnóstico e estou em tratamento',
          d:'Venho para o acompanhamento do meu quadro.' },
        { v:'Sim — ainda não tenho diagnóstico, mas suspeito e busco orientação',
          d:'Tive sintomas que me preocupam e quero investigar.' }
      ] },

    /* --- caminho I: já diagnosticado --- */
    { id:'emTolera', t:'radio', label:'Você está tolerando bem o medicamento que usa?',
      opts:['Sim','Não'], showIf:emDx },
    { id:'emToleraDesc', t:'text', label:'Quais efeitos colaterais você tem sentido?',
      ph:'Descreva em poucas palavras',
      showIf:function(a){ return emDx(a) && a.emTolera === 'Não'; } },

    { id:'emNovo', t:'radio', label:'Desde a última consulta, apareceu algum sintoma novo?',
      opts:['Não','Sim'], showIf:emDx },
    { id:'emNovoDesc', t:'text', label:'Quais sintomas novos?', ph:'Descreva em poucas palavras',
      showIf:function(a){ return emDx(a) && a.emNovo === 'Sim'; } },

    { id:'emSequela', t:'radio', label:'Você tem sintomas que ficaram como sequela de surtos anteriores?',
      opts:['Não','Sim'], showIf:emDx },
    { id:'emSequelaDesc', t:'text', label:'Quais sequelas e como elas atrapalham o seu dia?',
      ph:'Descreva em poucas palavras',
      showIf:function(a){ return emDx(a) && a.emSequela === 'Sim'; } },

    { id:'emMarcha', t:'radio', label:'Como está a sua caminhada hoje?',
      hint:'Escolha a opção que mais se parece com a sua realidade.',
      opts:['Longas distâncias, sem apoio e sem precisar descansar',
            'Longas distâncias, mas com apoio ou parando para descansar',
            'Médias distâncias, sem apoio e sem descansar',
            'Médias distâncias, mas com apoio ou parando para descansar',
            'Curtas distâncias, sem apoio e sem descansar',
            'Curtas distâncias, mas com apoio ou parando para descansar',
            'Não tenho conseguido caminhar'], showIf:emDx },

    { id:'emEmocional', t:'radio', label:'Do ponto de vista emocional:',
      opts:['Estou bem','Não estou bem'], showIf:emDx },
    { id:'emEmocionalDesc', t:'text', label:'Se quiser, conte o porquê', ph:'Opcional',
      showIf:function(a){ return emDx(a) && a.emEmocional === 'Não estou bem'; } },

    { id:'emCognicao', t:'radio', label:'Sua memória, atenção e capacidade de executar tarefas:',
      opts:['Está normal','Está comprometida'], showIf:emDx },
    { id:'emCognicaoDesc', t:'text', label:'Se quiser, conte um pouco mais', ph:'Opcional',
      showIf:function(a){ return emDx(a) && a.emCognicao === 'Está comprometida'; } },

    /* --- caminho II: investigando --- */
    { id:'emSintNeuro', t:'check', excl:'Nenhum desses',
      label:'Você já apresentou algum destes sintomas neurológicos?',
      hint:'Pode marcar mais de um — mesmo que tenha sido há muito tempo.',
      opts:['Dor no olho com a visão embaçada',
            'Dormência, formigamento ou perda de sensibilidade em alguma parte do corpo',
            'Perda de força em alguma parte do corpo',
            'Tonteira ou vertigem',
            'Visão dupla',
            'Perda do controle da urina ou do intestino',
            'Tremor ou falta de coordenação em algum membro',
            'Cansaço extremo, fora do normal',
            'Dificuldades sexuais',
            'Nenhum desses'], showIf:emInv },

    { id:'emSintGerais', t:'check', excl:'Nenhum desses',
      label:'E algum destes sintomas gerais?', hint:'Pode marcar mais de um.',
      opts:['Lesões de pele','Dores nas articulações','Perda de audição',
            'Aftas que voltam sempre, na boca ou na região genital',
            'Sinusite ou pneumonia com frequência','Nenhum desses'], showIf:emInv }
  ]
},

/* ---------- 8 · histórico de saúde --------------------------------------- */
{
  num: '8', title: 'Seu histórico de saúde',
  sub: 'Marque as condições que algum médico já disse que você tem.',
  fields: [
    { id:'doencas', t:'check', excl:'Nenhuma', label:'Doenças já diagnosticadas',
      opts:['Pressão alta','Diabetes','Colesterol alto','Tireoide','Obesidade',
            'Doença cardíaca','AVC ou isquemia','Doença autoimune','Doença renal',
            'Doença pulmonar','Enxaqueca','Depressão ou ansiedade em tratamento',
            'Apneia do sono','Câncer','Nenhuma'] },
    { id:'doencasOutras', t:'text', label:'Outras condições que não estão na lista', ph:'Opcional' },
    { id:'cirurgias', t:'textarea', label:'Cirurgias e internações',
      hint:'O que foi e mais ou menos quando.', ph:'Ex.: vesícula em 2019; internação por pneumonia em 2023' },
    { id:'alergias', t:'radio', label:'Alergia a medicamentos ou contrastes',
      opts:['Nenhuma conhecida','Sim'] },
    { id:'alergiasQuais', t:'text', req:true, label:'Quais e o que aconteceu?',
      ph:'Ex.: dipirona — manchas no corpo',
      showIf:function(a){ return a.alergias === 'Sim'; } }
  ]
},

/* ---------- 9 · medicamentos --------------------------------------------- */
{
  num: '9', title: 'Medicamentos em uso',
  sub: 'Inclua tudo — remédios, vitaminas, fitoterápicos e o que você toma "só quando precisa".',
  note: 'Se ficar mais fácil, pegue agora as caixas dos remédios. Preencha com o máximo de detalhe que souber: o <b>nome</b> e a <b>dosagem</b> são as informações mais importantes para o Dr. Carlos.',
  fields: [
    { id:'meds', t:'meds', label:'Lista de medicamentos' },
    { id:'medsParou', t:'textarea',
      label:'Medicamentos que você já usou para esta queixa e interrompeu',
      hint:'E, se lembrar, por que parou.', ph:'Ex.: amitriptilina — parei porque me deixava muito sonolento',
      showIf:function(a){ return !a.semMed; } }
  ]
},

/* ---------- 10 · exames e família ---------------------------------------- */
{
  num: '10', title: 'Exames e histórico familiar',
  sub: 'Se você já tem exames feitos, leve os laudos e as imagens no dia da consulta.',
  fields: [
    { id:'exames', t:'check', excl:'Nenhum desses', label:'Exames que você já realizou',
      opts:['Ressonância de crânio','Ressonância de coluna','Tomografia',
            'Eletroencefalograma','Eletroneuromiografia','Punção lombar (líquor)',
            'Exames de sangue','Teste neuropsicológico','Nenhum desses'] },
    { id:'familia', t:'check', excl:'Nada relevante', label:'Alguém na família teve',
      opts:['AVC','Demência ou Alzheimer','Parkinson','Epilepsia','Enxaqueca',
            'Esclerose múltipla','Doença autoimune','Doença neuromuscular','Diabetes',
            'Doença cardíaca','Pressão alta','Doença renal','Doença pulmonar',
            'Doenças psiquiátricas','Câncer','Nada relevante'] },
    { id:'familiaQuem', t:'text', label:'Quem (parentesco) e com que idade começou',
      ph:'Ex.: minha mãe, AVC aos 62 anos' }
  ]
},

/* ---------- 11 · hábitos e rotina ---------------------------------------- */
{
  num: '11', title: 'Hábitos e rotina',
  sub: 'Respostas rápidas — um toque em cada linha.',
  fields: [
    { id:'horasSono', t:'radio', label:'Horas de sono por noite',
      opts:['Menos de 5','5 a 6','7 a 8','Mais de 8'] },
    { id:'insonia', t:'radio', label:'Você sofre de insônia?', opts:['Sim','Não'] },
    { id:'insoniaTipo', t:'radio', label:'A dificuldade para dormir é:',
      opts:['No início do sono — demoro a pegar no sono',
            'No meio do sono — acordo durante a noite',
            'Desperto cedo demais e não volto a dormir'],
      showIf:function(a){ return a.insonia === 'Sim'; } },
    { id:'ronco', t:'radio', label:'Você ronca a ponto de incomodar quem dorme por perto?',
      opts:['Sim','Não'] },
    { id:'cochilo', t:'radio', label:'Você cochila facilmente durante o dia?', opts:['Sim','Não'] },

    { id:'intestino', t:'radio', label:'Como funciona o seu intestino?',
      opts:['Normal','Tende a diarreia','Tende a prisão de ventre (intestino preso)',
            'Perco o controle da evacuação'] },
    { id:'urinario', t:'radio', label:'E a urina?',
      opts:['Normal','Sinto vontade urgente e às vezes escapa',
            'Perco urina sem sentir (incontinência)',
            'Tenho dificuldade para urinar (urina presa)'] },

    { id:'atividade', t:'radio', label:'Atividade física',
      opts:['Nenhuma','1 a 2x por semana','3 a 4x por semana','5x ou mais'] },
    { id:'cafe', t:'radio', label:'Café ou energéticos por dia',
      opts:['Nenhum','1 a 2','3 a 4','5 ou mais'] },
    { id:'alcool', t:'radio', label:'Álcool', opts:['Não bebo','Social','Semanal','Diário'] },
    { id:'tabaco', t:'radio', label:'Tabaco', opts:['Nunca fumei','Ex-fumante','Fumo atualmente'] },
    { id:'substancias', t:'radio', label:'Outras substâncias', opts:['Não','Sim'] },
    { id:'substanciasQuais', t:'text', label:'Quais?', ph:'Opcional',
      showIf:function(a){ return a.substancias === 'Sim'; } },
    { id:'estresse', t:'radio', label:'Nível de estresse no dia a dia',
      opts:['Baixo','Moderado','Alto','Muito alto'] },
    { id:'alimentacao', t:'check', label:'Alimentação e hidratação',
      opts:['Regular','Irregular','Pulo refeições','Bebo pouca água'] },
    { id:'dirige', t:'radio', label:'Você dirige?', opts:['Não','Sim','Sim, profissionalmente'] }
  ]
},

/* ---------- 12 · impacto (SF-36) ----------------------------------------- */
{
  num: '12', title: 'Como isso afeta a sua vida',
  sub: 'Pensando nas ÚLTIMAS 4 SEMANAS, o quanto cada item foi afetado pelo seu problema de saúde.',
  note: 'Este bloco segue os princípios do <b>SF-36</b>, um instrumento internacional de qualidade de vida. Ele mostra ao Dr. Carlos o peso real do seu quadro no dia a dia — e será repetido ao longo do acompanhamento para medir a sua evolução.',
  fields: [
    { id:'sf', t:'scale', labels:SF_LABELS, req:true, items:[
      { id:'sf1', label:'Capacidade física', hint:'Subir escadas, caminhar, carregar peso, tarefas de casa' },
      { id:'sf2', label:'Trabalho e estudo', hint:'Rendimento, faltas, ter que reduzir o ritmo ou o tipo de tarefa' },
      { id:'sf3', label:'Dor', hint:'O quanto a dor atrapalhou o seu trabalho e as tarefas do dia' },
      { id:'sf4', label:'Saúde geral', hint:'O quanto você sente que a sua saúde está pior do que deveria' },
      { id:'sf5', label:'Energia e disposição', hint:'Cansaço, esgotamento, falta de vitalidade' },
      { id:'sf6', label:'Vida social e familiar', hint:'Visitas, encontros, passeios, convívio com quem você gosta' },
      { id:'sf7', label:'Emoções', hint:'O quanto nervosismo, desânimo ou preocupação atrapalharam suas tarefas' },
      { id:'sf8', label:'Bem-estar mental', hint:'Sensação de paz, tranquilidade e felicidade no período' }
    ]},
    { id:'sf9', t:'radio', label:'Comparando com 12 meses atrás, como está a sua saúde hoje?',
      opts:['Muito melhor','Um pouco melhor','Igual','Um pouco pior','Muito pior'] }
  ]
},

/* ---------- 13 · o que está em jogo -------------------------------------- */
{
  num: '13', title: 'O que está em jogo para você',
  sub: 'As perguntas abaixo não são sobre sintoma — são sobre a sua vida. Elas orientam o Dr. Carlos a construir um plano proporcional ao que o seu caso exige.',
  fields: [
    { id:'deixouFazer', t:'check', other:true, excl:'Nada mudou',
      label:'Nos últimos 12 meses, o que você deixou de fazer por causa desse problema?',
      opts:['Faltei ao trabalho ou perdi rendimento','Deixei de dirigir','Deixei de viajar',
            'Parei de me exercitar','Evitei compromissos sociais','Passei a depender de alguém',
            'Mudei de função, reduzi jornada ou parei de trabalhar',
            'Deixei de cuidar da minha família como gostaria','Nada mudou'] },
    { id:'tempoBusca', t:'text',
      label:'Há quanto tempo você busca uma resposta?', ph:'Ex.: uns 3 anos' },
    { id:'recursos', t:'check', label:'Quanto você já dedicou tentando resolver isso?',
      opts:['Consultas com outros profissionais','Exames repetidos','Medicações que não funcionaram',
            'Terapias e tratamentos alternativos','Idas ao pronto-socorro','Afastamentos do trabalho'] },
    { id:'afetados', t:'check', label:'Quem mais é afetado pelo seu quadro?',
      opts:['Cônjuge ou companheiro(a)','Filhos','Pais','Equipe de trabalho','Ninguém além de mim'] },
    { id:'afetadosComo', t:'text', label:'De que forma?', ph:'Opcional' },
    { id:'imagina', t:'textarea',
      label:'Como você imagina a sua vida se esse problema estiver controlado daqui a um ano?',
      ph:'Escreva livremente.' },
    { id:'prontidao', t:'scale11', label:'O quanto você se sente pronto para iniciar um tratamento agora?',
      hint:'0 = não estou pronto · 10 = quero começar hoje' },
    { id:'prontidaoSubir', t:'text', label:'O que faria esse número subir?', ph:'Opcional' },
    { id:'conducao', t:'radiobig', label:'De que forma você prefere ser conduzido?',
      opts:[
        { v:'Resolver o essencial', d:'Quero focar no problema principal, com o mínimo necessário de exames e retornos.' },
        { v:'Plano direcionado', d:'Quero tratar e ser acompanhado por alguns meses até o quadro estabilizar.' },
        { v:'Avaliação completa', d:'Quero investigar a fundo e ter acompanhamento próximo, com metas e reavaliações.' },
        { v:'Acompanhamento integral', d:'Meu caso é crônico ou complexo e quero ser acompanhado ao longo do ano, de forma coordenada.' },
        { v:'Ainda não sei', d:'Prefiro ouvir a orientação do Dr. Carlos e decidir na consulta.' }
      ] },
    { id:'decideCom', t:'radio', other:true, label:'Quem decide sobre o seu tratamento junto com você?',
      opts:['Só eu','Eu e meu cônjuge ou família','Um filho ou filha'] },
    { id:'decidePresente', t:'radio', label:'Essa pessoa estará presente na consulta?',
      opts:['Sim','Não','Por telefone ou vídeo'],
      showIf:function(a){ return a.decideCom && a.decideCom !== 'Só eu'; } }
  ]
},

/* ---------- 14 · para finalizar ------------------------------------------- */
{
  num: '14', title: 'Para finalizar',
  sub: 'Duas ou três perguntas e a sua ficha está completa.',
  fields: [
    { id:'origem', t:'radio', other:true, label:'Como você chegou até o Dr. Carlos Augusto?',
      opts:['Indicação de outro médico','Indicação de paciente ou amigo','Google','Instagram',
            'Convênio ou empresa'],
      showIf:function(a){ return a.jaPaciente === 'Não, esta é a minha primeira consulta'; } },
    { id:'umaCoisa', t:'textarea',
      label:'Se você pudesse resolver UMA coisa nesta consulta, qual seria?',
      ph:'Ex.: Voltar a dormir a noite inteira.' },
    { id:'algoMais', t:'textarea',
      label:'Há algo que você gostaria que o Dr. Carlos soubesse antes de te ver?',
      ph:'Qualquer coisa. Este espaço é seu.' }
  ]
},

/* ---------- 15 · autorizações --------------------------------------------- */
{
  num: '15', title: 'Autorizações',
  sub: 'Últimos toques antes de enviar.',
  fields: [
    { id:'consent', t:'check', label:'Eu autorizo:',
      opts:['O envio de resultados, orientações e lembretes por WhatsApp e e-mail, ciente dos riscos dos meios eletrônicos.',
            'O contato da secretaria para acompanhamento pós-consulta e reagendamentos.',
            'O uso de imagem, voz e registros audiovisuais para uso interno, no acompanhamento da evolução do tratamento.'] },
    { id:'__lgpd', t:'html', html:
      '<div class="safe"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2F9E6A" stroke-width="2">' +
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/></svg>' +
      '<div>Os dados desta ficha são usados apenas para o seu atendimento médico, integram o seu prontuário ' +
      'e são protegidos por sigilo profissional e pela LGPD. Nada é compartilhado com terceiros.</div></div>' }
  ]
},

/* ---------- 16 · conferência final ----------------------------------------- */
{ kind:'review' },

/* ---------- 17 · fim ------------------------------------------------------- */
{ kind:'done' }
];

var TOTAL_ETAPAS = 15;

/* ==========================================================================
   2. UTILITÁRIOS
   ========================================================================== */

function $(s, r) { return (r || document).querySelector(s); }
function el(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function has(v) { return !!(v && v.length); }
function inArr(arr, val) { return !!(arr && arr.indexOf(val) >= 0); }
function anyOf(arr, list) {
  if (!arr) return false;
  for (var i = 0; i < list.length; i++) if (arr.indexOf(list[i]) >= 0) return true;
  return false;
}
function countOf(arr, list) {
  var n = 0; if (!arr) return 0;
  for (var i = 0; i < list.length; i++) if (arr.indexOf(list[i]) >= 0) n++;
  return n;
}
function clean(arr, excl) {
  if (!arr) return [];
  return arr.filter(function (x) { return x && x !== excl; });
}
function join(arr) { return clean(arr).join(' · '); }
var CHK = '<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#2F9E6A" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ==========================================================================
   3. RENDERIZAÇÃO
   ========================================================================== */

function rerender() {          // redesenha sem perder a posição da tela
  var y = window.scrollY;
  render(true);
  window.scrollTo(0, y);
}

function render(keepScroll) {
  var main = $('#main');
  main.innerHTML = '';
  if (step < 0) step = 0;
  if (step > STEPS.length - 1) step = STEPS.length - 1;
  var S = STEPS[step];

  if (S.kind === 'intro')         { main.appendChild(viewIntro()); }
  else if (S.kind === 'review')   { main.appendChild(viewReview()); }
  else if (S.kind === 'done')     { main.appendChild(viewDone()); }
  else                            { main.appendChild(viewForm(S)); }

  var total = STEPS.length - 1;
  $('#bar').style.width = Math.round((step / total) * 100) + '%';
  $('#btnBack').classList.toggle('hide', step === 0 || S.kind === 'done');
  var nx = $('#btnNext');
  nx.disabled = false;
  if (S.kind === 'intro')         { nx.textContent = 'Começar a ficha'; nx.classList.remove('hide'); }
  else if (S.kind === 'review')   { nx.innerHTML = 'Concluir pré-atendimento'; nx.classList.remove('hide'); }
  else if (S.kind === 'done')     { nx.classList.add('hide'); }
  else                            { nx.textContent = 'Continuar'; nx.classList.remove('hide'); }
  $('#nav').classList.toggle('hide', S.kind === 'done');
  $('#stepNo').textContent = (S.num ? 'Etapa ' + S.num + ' de ' + TOTAL_ETAPAS : '');
  if (!keepScroll) window.scrollTo(0, 0);
}

/* ---------- abertura ------------------------------------------------------ */
function viewIntro() {
  var w = el('div', 'step on');
  w.innerHTML =
    '<div class="eyebrow"><span class="dot"></span>Avaliação neurológica estruturada</div>' +
    '<h1>Ficha de pré-atendimento</h1>' +
    '<p class="lead">Estas perguntas são o começo da sua consulta. Elas permitem que o ' +
    '<b>Dr. Carlos Augusto</b> chegue ao seu caso já conhecendo parte da sua história, e use o ' +
    'tempo do encontro para examinar, explicar e decidir com você o melhor caminho do tratamento.</p>' +
    '<div class="note" style="margin-bottom:18px">' +
      '<b>Leva de 10 a 15 minutos.</b> Pode ser preenchida pelo paciente ou por um acompanhante. ' +
      'Suas respostas são salvas automaticamente neste aparelho: se precisar parar, é só voltar ' +
      'a abrir este link no mesmo celular ou computador e continuar de onde parou.</div>' +
    '<div class="safe" style="margin-bottom:18px">' +
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2F9E6A" stroke-width="2">' +
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/></svg>' +
      '<div>Ao final, um resumo com os pontos principais do seu caso é enviado diretamente ao ' +
      'Dr. Carlos. Nada é compartilhado com terceiros — sigilo médico e LGPD.</div></div>' +
    '<div class="note" style="border-left-color:#DFEDE5;background:#fff">' +
      '<b>Antes de começar, se puder:</b> tenha por perto as caixas dos seus remédios e os laudos ' +
      'de exames recentes. Não é obrigatório — você pode preencher sem isso.</div>';
  var d = localStorage.getItem(STORE_KEY);
  if (d) {
    var box = el('div', 'note');
    box.style.borderLeftColor = '#2F9E6A';
    box.innerHTML = '<b>Encontramos uma ficha começada neste aparelho.</b> Ao tocar em “Começar”, ' +
      'você continua de onde parou.';
    var btn = el('button', 'btn gho', 'Apagar e começar do zero');
    btn.style.marginTop = '10px';
    btn.onclick = function () {
      if (confirm('Apagar tudo o que já foi preenchido?')) {
        localStorage.removeItem(STORE_KEY); A = {}; step = 0; render();
      }
    };
    box.appendChild(btn);
    w.appendChild(box);
  }
  return w;
}

/* ---------- formulário ---------------------------------------------------- */
function viewForm(S) {
  var w = el('div', 'step on');
  w.innerHTML =
    '<div class="eyebrow"><span class="dot"></span>Parte ' + S.num + '</div>' +
    '<h2>' + esc(S.title) + '</h2>' +
    (S.sub ? '<p class="sub">' + S.sub + '</p>' : '') +
    (S.note ? '<div class="note">' + S.note + '</div>' : '');

  var pend = null;
  S.fields.forEach(function (f) {
    if (f.showIf && !f.showIf(A)) return;
    var node = field(f);
    if (f.half) {
      if (pend) { pend.appendChild(node); w.appendChild(pend); pend = null; }
      else { pend = el('div', 'grid2'); pend.appendChild(node); }
    } else {
      if (pend) { w.appendChild(pend); pend = null; }
      w.appendChild(node);
    }
  });
  if (pend) w.appendChild(pend);
  return w;
}

function field(f) {
  var q = el('div', 'q');
  q.dataset.fid = f.id;

  if (f.t === 'html') { q.innerHTML = f.html; q.style.marginBottom = '22px'; return q; }

  var lab = '<label class="qt" for="i_' + f.id + '">' + esc(f.label) +
            (f.req ? ' <span class="req">*</span>' : '') + '</label>' +
            (f.hint ? '<div class="qh">' + f.hint + '</div>' : '');
  q.innerHTML = lab;

  /* --- texto / número / data --- */
  if (['text','tel','email','number','date','textarea'].indexOf(f.t) >= 0) {
    var i = document.createElement(f.t === 'textarea' ? 'textarea' : 'input');
    if (f.t !== 'textarea') i.type = f.t;
    i.id = 'i_' + f.id;
    if (f.ph) i.placeholder = f.ph;
    if (f.t === 'number') { i.min = 0; i.inputMode = 'numeric'; }
    if (f.t === 'tel') i.inputMode = 'tel';
    i.value = A[f.id] == null ? '' : A[f.id];
    i.oninput = function () {
      A[f.id] = i.value;
      q.classList.remove('bad');
      if (f.id === 'nasc') autoIdade(i.value);
      save();
    };
    q.appendChild(i);
  }

  /* --- radio / check em chips --- */
  else if (f.t === 'radio' || f.t === 'check') {
    var multi = f.t === 'check';
    var box = el('div', 'chips');
    var cur = multi ? (A[f.id] || []) : A[f.id];
    f.opts.forEach(function (o) {
      var c = el('label', 'chip' + (multi ? '' : ' radio'));
      var on = multi ? inArr(cur, o) : cur === o;
      if (on) c.classList.add('sel');
      c.innerHTML = '<span class="bx">' + CHK + '</span><span>' + esc(o) + '</span>';
      c.onclick = function (ev) {
        ev.preventDefault();
        if (multi) {
          var v = (A[f.id] || []).slice();
          var k = v.indexOf(o);
          if (k >= 0) v.splice(k, 1); else v.push(o);
          if (f.excl) {
            if (o === f.excl && k < 0) v = [f.excl];
            else if (o !== f.excl) v = v.filter(function (x) { return x !== f.excl; });
          }
          A[f.id] = v;
        } else {
          A[f.id] = (A[f.id] === o) ? '' : o;
          if (A[f.id]) delete A[f.id + '_o'];
        }
        q.classList.remove('bad');
        save(); rerender();
      };
      box.appendChild(c);
    });
    if (f.other) {
      var oc = el('label', 'chip' + (multi ? '' : ' radio') + (A[f.id + '_o'] != null ? ' sel' : ''));
      oc.innerHTML = '<span class="bx">' + CHK + '</span><span>Outro</span>';
      oc.onclick = function (ev) {
        ev.preventDefault();
        if (A[f.id + '_o'] != null) delete A[f.id + '_o'];
        else { A[f.id + '_o'] = ''; if (!multi) A[f.id] = ''; }
        save(); rerender();
      };
      box.appendChild(oc);
    }
    q.appendChild(box);
    if (A[f.id + '_o'] != null) {
      var ot = el('div', 'otherbox');
      var oi = document.createElement('input');
      oi.type = 'text'; oi.placeholder = 'Escreva aqui';
      oi.value = A[f.id + '_o'];
      oi.oninput = function () { A[f.id + '_o'] = oi.value; save(); };
      ot.appendChild(oi); q.appendChild(ot);
    }
  }

  /* --- radio com descrição (cards) --- */
  else if (f.t === 'radiobig') {
    var b2 = el('div', 'chips stack');
    f.opts.forEach(function (o) {
      var c = el('label', 'chip radio' + (A[f.id] === o.v ? ' sel' : ''));
      c.innerHTML = '<span class="bx">' + CHK + '</span><span class="big"><b>' + esc(o.v) +
                    '</b><span>' + esc(o.d) + '</span></span>';
      c.onclick = function (ev) { ev.preventDefault(); A[f.id] = (A[f.id] === o.v ? '' : o.v); save(); rerender(); };
      b2.appendChild(c);
    });
    q.appendChild(b2);
  }

  /* --- escala matricial --- */
  else if (f.t === 'scale') {
    var n = f.labels.length;
    A[f.id] = A[f.id] || {};
    f.items.forEach(function (it) {
      var r = el('div', 'scaleq');
      r.innerHTML = '<div class="st">' + esc(it.label) + (it.hint ? '<em>' + esc(it.hint) + '</em>' : '') + '</div>';
      var g = el('div', 'scale n' + n);
      f.labels.forEach(function (L, ix) {
        var s = el('div', 'sc' + (A[f.id][it.id] === ix ? ' sel' : ''));
        s.innerHTML = '<span class="num"></span><span>' + esc(L) + '</span>';
        s.onclick = function () { A[f.id][it.id] = ix; q.classList.remove('bad'); save(); rerender(); };
        g.appendChild(s);
      });
      r.appendChild(g);
      q.appendChild(r);
    });
  }

  /* --- escala de uma linha só --- */
  else if (f.t === 'scale1') {
    var g1 = el('div', 'scale n' + f.labels.length);
    f.labels.forEach(function (L, ix) {
      var s = el('div', 'sc' + (A[f.id] === ix ? ' sel' : ''));
      s.innerHTML = '<span class="num"></span><span>' + esc(L) + '</span>';
      s.onclick = function () { A[f.id] = ix; q.classList.remove('bad'); save(); rerender(); };
      g1.appendChild(s);
    });
    q.appendChild(g1);
  }

  /* --- escala 0 a 10 --- */
  else if (f.t === 'scale11') {
    var g11 = el('div', 'scale n11');
    for (var k = 0; k <= 10; k++) (function (k) {
      var s = el('div', 'sc' + (A[f.id] === k ? ' sel' : ''));
      s.innerHTML = '<span>' + k + '</span>';
      s.onclick = function () { A[f.id] = k; save(); rerender(); };
      g11.appendChild(s);
    })(k);
    q.appendChild(g11);
    q.appendChild(el('div', 'scale-legend', '<span>Não estou pronto</span><span>Quero começar hoje</span>'));
  }

  /* --- mapa da cabeça --- */
  else if (f.t === 'headmap') {
    var sel = A[f.id] || [];
    var toggle = function (id) {
      var v = (A[f.id] || []).slice();
      var k = v.indexOf(id);
      if (k >= 0) v.splice(k, 1); else v.push(id);
      if (id === 'toda' && k < 0) v = ['toda'];
      else if (id !== 'toda') v = v.filter(function (x) { return x !== 'toda'; });
      A[f.id] = v; save(); rerender();
    };

    var wrap = el('div', 'headwrap');
    var svg = '<svg class="headsvg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M168 22 C104 22 60 70 60 128 C60 148 48 158 39 170 C32 180 40 188 49 190 ' +
      'C56 192 57 196 55 202 C50 213 55 221 65 222 C69 223 70 227 69 233 ' +
      'C67 249 80 260 100 262 L100 300 L238 300 L238 252 C238 214 264 190 264 138 ' +
      'C264 72 228 22 168 22 Z" fill="#F1F8F4" stroke="#C9E2D5" stroke-width="2.5"/>';
    ZONAS.forEach(function (z) {
      if (z.noMap) return;
      var on = sel.indexOf(z.id) >= 0;
      svg += '<circle class="zone' + (on ? ' on' : '') + '" data-z="' + z.id + '" cx="' + z.cx +
             '" cy="' + z.cy + '" r="' + z.r + '"></circle>';
    });
    svg += '</svg>';
    var svgBox = el('div', 'headsvgbox', svg);
    wrap.appendChild(svgBox);

    var list = el('div', 'chips stack headlist');
    ZONAS.forEach(function (z) {
      var c = el('label', 'chip' + (sel.indexOf(z.id) >= 0 ? ' sel' : ''));
      c.innerHTML = '<span class="bx">' + CHK + '</span><span>' + esc(z.label) + '</span>';
      c.onclick = function (ev) { ev.preventDefault(); toggle(z.id); };
      list.appendChild(c);
    });
    wrap.appendChild(list);
    q.appendChild(wrap);

    setTimeout(function () {
      var nodes = q.querySelectorAll('.zone');
      for (var i2 = 0; i2 < nodes.length; i2++) {
        (function (nd) {
          nd.onclick = function () { toggle(nd.getAttribute('data-z')); };
        })(nodes[i2]);
      }
    }, 0);
  }

  /* --- medicações --- */
  else if (f.t === 'meds') {
    var none = el('div', 'chips');
    none.style.marginBottom = '16px';
    var nc = el('label', 'chip' + (A.semMed ? ' sel' : ''));
    nc.innerHTML = '<span class="bx">' + CHK + '</span><span>Não uso nenhum medicamento</span>';
    nc.onclick = function (ev) {
      ev.preventDefault();
      A.semMed = !A.semMed;
      if (A.semMed) A.meds = [{ n:'', d:'', f:'', p:'' }];
      save(); rerender();
    };
    none.appendChild(nc);
    q.appendChild(none);

    if (!A.semMed) {
      if (!A.meds || !A.meds.length) A.meds = [{ n:'', d:'', f:'', p:'' }];
      q.appendChild(el('div', 'medhead',
        '<div>Medicamento</div><div>Dose</div><div>Vezes ao dia</div><div>Desde quando / para quê</div><div></div>'));
      A.meds.forEach(function (m, ix) {
        var r = el('div', 'medrow');
        [['n','Nome do remédio'],['d','Ex.: 50 mg'],['f','Ex.: 2x'],['p','Ex.: há 2 anos, para pressão']]
          .forEach(function (c) {
            var i2 = document.createElement('input');
            i2.type = 'text'; i2.placeholder = c[1]; i2.value = m[c[0]] || '';
            i2.oninput = function () { A.meds[ix][c[0]] = i2.value; save(); };
            r.appendChild(i2);
          });
        var del = el('button', 'del', '&times;');
        del.type = 'button';
        del.onclick = function () {
          A.meds.splice(ix, 1);
          if (!A.meds.length) A.meds = [{ n:'', d:'', f:'', p:'' }];
          save(); rerender();
        };
        r.appendChild(del);
        q.appendChild(r);
      });
      var add = el('button', 'addbtn', '+ Adicionar outro medicamento');
      add.type = 'button';
      add.onclick = function () { A.meds.push({ n:'', d:'', f:'', p:'' }); save(); rerender(); };
      q.appendChild(add);
    }
  }

  var e = el('div', 'err', '<span>&#9888;</span><span>Por favor, responda para continuar.</span>');
  q.appendChild(e);
  return q;
}

function autoIdade(v) {
  if (!v) return;
  var d = new Date(v);
  if (isNaN(d)) return;
  var t = new Date(), age = t.getFullYear() - d.getFullYear();
  var m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  if (age >= 0 && age < 130) { A.idade = String(age); var i = $('#i_idade'); if (i) i.value = age; }
}

/* ==========================================================================
   4. VALIDAÇÃO E NAVEGAÇÃO
   ========================================================================== */

function validate() {
  var S = STEPS[step];
  if (!S.fields) return true;
  var ok = true, first = null;
  S.fields.forEach(function (f) {
    if (!f.req) return;
    if (f.showIf && !f.showIf(A)) return;
    var bad = false, v = A[f.id];
    if (f.t === 'check') bad = !has(v);
    else if (f.t === 'scale') {
      bad = f.items.some(function (it) { return !(v && typeof v[it.id] === 'number'); });
    }
    else bad = !(v && String(v).trim());
    if (bad) {
      ok = false;
      var q = document.querySelector('[data-fid="' + f.id + '"]');
      if (q) { q.classList.add('bad'); var e = $('.err', q); if (e) e.classList.add('on'); if (!first) first = q; }
    }
  });
  if (first) first.scrollIntoView({ behavior:'smooth', block:'center' });
  return ok;
}

function next() {
  if (step >= STEPS.length - 1) return;
  var S = STEPS[step];
  if (S.kind === 'review') { submit(); return; }
  if (!validate()) return;
  if (S.kind !== 'intro') save();
  step++;
  if (STEPS[step] && STEPS[step].kind === 'review') SUM = buildSummary();
  render();
}
function back() { if (step > 0) { step--; render(); } }

var saveT = null;
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ a: A, s: step, t: Date.now() }));
    clearTimeout(saveT);
    $('#savePill').classList.add('on');
    saveT = setTimeout(function () { $('#savePill').classList.remove('on'); }, 1600);
  } catch (e) {}
}
function load() {
  try {
    var d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (d && d.a) { A = d.a; step = Math.min(d.s || 0, STEPS.length - 3); }
  } catch (e) {}
}

/* ==========================================================================
   5. O RESUMO CLÍNICO
   ========================================================================== */

function sfScore() {
  var v = A.sf || {}, ids = ['sf1','sf2','sf3','sf4','sf5','sf6','sf7','sf8'], s = 0, n = 0;
  ids.forEach(function (i) { if (typeof v[i] === 'number') { s += v[i]; n++; } });
  return { sum:s, n:n, pct: n ? Math.round((s / (n * 4)) * 100) : null };
}
function sfBand(p) {
  if (p == null) return '';
  if (p <= 20) return 'impacto leve';
  if (p <= 40) return 'impacto moderado';
  if (p <= 60) return 'impacto importante';
  return 'impacto grave';
}
function medList() {
  if (A.semMed) return [];
  return (A.meds || []).filter(function (m) { return m && (m.n || '').trim(); });
}
function zonaLabels() {
  var sel = A.cefLocal || [];
  return ZONAS.filter(function (z) { return sel.indexOf(z.id) >= 0; })
              .map(function (z) { return z.label; });
}
function queixasAtivas() {
  var q = [];
  if (cef(A))   q.push('Cefaleia');
  if (cog(A))   q.push('Cognição');
  if (epi(A))   q.push('Crises / desmaios');
  if (park(A))  q.push('Parkinsonismo / tremor');
  if (emDx(A))  q.push('EM em tratamento');
  if (emInv(A)) q.push('Suspeita desmielinizante');
  return q;
}

function buildSummary() {
  var flags = [], explore = [];
  function F(lvl, tit, det) { flags.push({ lvl:lvl, t:tit, d:det || '' }); }

  var sf = sfScore(), meds = medList();
  var doe = clean(A.doencas, 'Nenhuma');
  var fam = clean(A.familia, 'Nada relevante');
  var exa = clean(A.exames, 'Nenhum desses');
  var deixou = clean(A.deixouFazer, 'Nada mudou');
  var dirige = (A.dirige === 'Sim' || A.dirige === 'Sim, profissionalmente');

  /* ---- 1. CEFALEIA ------------------------------------------------------ */
  if (cef(A)) {
    var cefAssoc = clean(A.cefAssoc, 'Nada disso acontece');
    var cefAura  = clean(A.cefAura, 'Nenhum desses');

    if (A.cefFreqAnalg === 'Mais de 2x por semana') {
      F('w', 'Analgésico em mais de 2x por semana',
        'Suspeitar de cefaleia por uso excessivo de medicação.' +
        (A.cefRemedio ? ' Usa: ' + A.cefRemedio : ''));
      explore.push('Quantificar dias de analgésico por mês e discutir desmame — risco de cefaleia por uso excessivo.');
    }
    if (A.cefFreq >= 2) {
      F('w', 'Cefaleia ' + CEF_FREQ[A.cefFreq].toLowerCase(),
        'Padrão de alta frequência — considerar profilaxia.');
      explore.push('Cefaleia de alta frequência: montar diário de dor e definir profilaxia.');
    }
    if (cefAssoc.length) {
      F('w', 'Cefaleia com sintomas autonômicos',
        cefAssoc.join(' · ') + '. Considerar cefaleia trigêmino-autonômica (cluster e afins).');
      explore.push('Sintomas autonômicos com a dor — caracterizar duração, periodicidade e agitação motora (diferencial de cluster).');
    }
    if (cefAura.length) {
      F('w', 'Sintomas de aura antes da dor',
        cefAura.join(' · ') + (A.cefAura_o ? ' · ' + A.cefAura_o : ''));
      explore.push('Aura relatada — caracterizar duração e marcha dos sintomas; rever risco vascular e anticoncepcional se aplicável.');
    }
    if (A.cefImpede === 'Sim') F('w', 'A dor impede as atividades', 'Cefaleia incapacitante.');
    if (A.cefDuracao === 'Mais de um dia')
      F('w', 'Crises com duração maior que 24 horas', 'Avaliar status migranoso e uso de resgate.');
    if (A.cefDuracao === 'Poucos segundos' && inArr(A.cefTipo, 'Uma fisgada, como uma pontada rápida'))
      F('i', 'Dor em pontadas de poucos segundos', 'Padrão sugestivo de cefaleia primária em facada.');
    if (inArr(A.cefGatilho, 'Esforço físico'))
      explore.push('Dor desencadeada por esforço — avaliar necessidade de imagem para excluir causa secundária.');
    if (A.cefRepouso === 'Não tem relação com o descanso' && A.cefFreq >= 2)
      explore.push('Dor frequente que não alivia com repouso — revisar diagnóstico e comorbidades (sono, humor, medicação).');
  }

  /* ---- 2. COGNIÇÃO ------------------------------------------------------ */
  if (cog(A)) {
    var cogI = clean(A.cogItens, 'Nenhuma dessas');
    var avdBasica = inArr(cogI, 'Tenho dificuldade em tarefas simples do dia a dia (tomar banho, me vestir, calçar o sapato)');
    var avdInstr = anyOf(cogI, ['Tenho dificuldade com contas, remédios, dinheiro ou compras',
                                'Tenho dificuldade para dar conta da minha vida pessoal ou do trabalho']);
    if (avdBasica) {
      F('c', 'Comprometimento de atividades básicas do dia a dia',
        'Dificuldade para banho, vestir-se ou higiene — indica dependência funcional já instalada.');
      explore.push('Dependência em AVD básica: estadiar a demência, avaliar segurança domiciliar e sobrecarga do cuidador.');
    } else if (avdInstr) {
      F('w', 'Comprometimento de atividades instrumentais',
        'Dificuldade com contas, remédios, dinheiro ou trabalho.');
    }
    if (A.cogQuemPercebeu === 'Somente por um familiar')
      F('w', 'Queixa cognitiva percebida apenas por terceiros',
        'O paciente não percebe o próprio déficit — anosognosia é sinal de alerta.');
    if (A.cogEvolucao === 'Vem piorando com o tempo')
      F('w', 'Quadro cognitivo em piora progressiva', (A.cogTempo ? 'Evolução: ' + A.cogTempo : ''));
    if (anyOf(cogI, ['Falo ou faço coisas fora de hora, sem o freio de antes',
                     'Perdi o interesse e a vontade de fazer as coisas',
                     'Mudei de comportamento — fiquei mais agitado(a), inquieto(a) ou irritado(a)'])) {
      F('w', 'Alterações de comportamento e desinibição',
        'Considerar padrão frontotemporal no diagnóstico diferencial.');
      explore.push('Sintomas comportamentais proeminentes — investigar variante frontotemporal e checar impacto familiar.');
    }
    if (anyOf(cogI, ['Me perco ou me confundo em lugares conhecidos', 'Confundo pessoas da família']))
      F('w', 'Desorientação espacial ou confusão de pessoas', 'Marcador de comprometimento mais avançado.');
    if (cogI.length)
      explore.push('Cognição: aplicar rastreio (MEEM/MoCA), colher história com informante e rastrear causas reversíveis (TSH, B12, D, função renal/hepática, sono, medicações).');
    if (dirige && cogI.length)
      F('w', 'Queixa cognitiva em paciente que dirige', 'Avaliar aptidão para a direção.');
  }

  /* ---- 3. CRISES E DESMAIOS -------------------------------------------- */
  if (epi(A)) {
    var ec = clean(A.epiCarac, 'Nenhuma dessas');
    var toniclonico = countOf(ec, ['Há abalos musculares — fico me debatendo','Mordo a língua',
      'Perco o controle da urina ou das fezes','O corpo fica rígido, duro']) >= 2;
    var posIctal = anyOf(clean(A.epiApos, 'Nada disso — já acordo normal'),
      ['Confusão mental','Dor no corpo','Dor de cabeça']);
    var sincope = countOf(ec, ['Fico pálido(a)','Fico suado(a)','O corpo fica todo mole']) >= 2;

    if (toniclonico) {
      F('c', 'Episódio com características de crise tônico-clônica',
        ec.join(' · ') + (posIctal ? '. Com sintomas pós-ictais.' : ''));
      explore.push('Crise convulsiva provável: solicitar EEG e RM de crânio, e orientar sobre segurança (direção, altura, água, fogo).');
    } else if (sincope) {
      F('w', 'Episódio com características de síncope',
        ec.join(' · ') + '. Considerar causa cardiovascular ou vasovagal.');
      explore.push('Padrão sincopal: avaliar ECG, pressão em ortostase e causas cardiogênicas antes de rotular como epilepsia.');
    }
    if (inArr(ec, 'Percebo tudo o que acontece em volta, mesmo durante o episódio'))
      F('w', 'Consciência preservada durante o episódio',
        'Considerar crise focal perceptiva ou evento não epiléptico no diferencial.');
    if (A.epiAusencia === 'Sim') {
      F('w', 'Episódios de “ausência” sem desmaio', 'Investigar crises focais ou ausências típicas.');
      explore.push('Episódios de ausência — caracterizar duração, automatismos e gatilhos; EEG com hiperventilação.');
    }
    if (inArr(ec, 'Chego a me machucar com a queda'))
      F('w', 'Trauma associado às quedas', 'Risco físico relevante.');
    if (dirige)
      F('c', 'Perda de consciência em paciente que dirige' +
        (A.dirige === 'Sim, profissionalmente' ? ' profissionalmente' : ''),
        'Orientação de segurança e implicação legal para a direção.');
  }

  /* ---- 4. PARKINSONISMO ------------------------------------------------ */
  if (park(A)) {
    var repouso = inArr(A.parkTremorQuando, 'Quando estou parado(a), em repouso');
    var acao    = inArr(A.parkTremorQuando, 'Quando vou fazer alguma tarefa com as mãos');
    var alcool  = inArr(A.parkTremorAlivio, 'Quando bebo bebida alcoólica');

    if (repouso && A.parkLentidao === 'Sim') {
      F('w', 'Tremor de repouso associado a bradicinesia',
        (A.parkTremorLocal ? A.parkTremorLocal + '. ' : '') + 'Padrão sugestivo de parkinsonismo.');
      explore.push('Exame dirigido para parkinsonismo (bradicinesia, rigidez, tremor de repouso) e revisão de fármacos bloqueadores dopaminérgicos.');
    }
    if (acao && alcool && !repouso) {
      F('i', 'Tremor de ação com alívio pelo álcool',
        'Padrão que sugere tremor essencial no diagnóstico diferencial.');
      explore.push('Diferencial tremor essencial × parkinsoniano: checar história familiar e resposta ao álcool.');
    }
    if (A.parkMarcha === 'Sim')
      F('w', 'Dificuldade de marcha com sensação de travamento', 'Avaliar freezing e risco de queda.');
    if (A.parkEquilibrio === 'Sim') {
      F('w', 'Instabilidade postural com quedas', 'Quedas precoces sugerem parkinsonismo atípico.');
      explore.push('Quedas: avaliar instabilidade postural, revisar medicações sedativas e checar vitamina D.');
    }
    if (A.parkTonteira === 'Sim')
      F('w', 'Tonteira ou pré-síncope', 'Investigar hipotensão ortostática / disautonomia.');
    if (A.parkOlfato === 'Sim')
      F('i', 'Perda de olfato', 'Marcador prodrômico de doença de Parkinson.');
  }

  /* ---- 5. ESCLEROSE MÚLTIPLA ------------------------------------------- */
  if (emDx(A)) {
    if (A.emNovo === 'Sim') {
      F('c', 'Sintoma novo desde a última consulta',
        (A.emNovoDesc || '') + ' — avaliar atividade de doença / surto.');
      explore.push('Sintoma novo em EM: definir se é surto, pseudo-surto ou progressão; considerar RM com contraste.');
    }
    if (A.emTolera === 'Não') {
      F('c', 'Intolerância ao medicamento em uso',
        (A.emToleraDesc || '') + ' — risco de má adesão ou necessidade de troca.');
      explore.push('Rever tolerância e adesão ao tratamento modificador de doença; discutir troca se necessário.');
    }
    if (A.emMarcha === 'Não tenho conseguido caminhar')
      F('c', 'Perda da deambulação', 'Grau elevado de incapacidade.');
    else if (A.emMarcha && A.emMarcha.indexOf('Curtas') === 0)
      F('w', 'Limitação importante da marcha', A.emMarcha);
    if (A.emEmocional === 'Não estou bem')
      F('w', 'Sofrimento emocional relatado', A.emEmocionalDesc || '');
    if (A.emCognicao === 'Está comprometida')
      F('w', 'Cognição comprometida na EM', A.emCognicaoDesc || '');
    if (A.emSequela === 'Sim')
      F('i', 'Sequelas de surtos anteriores', A.emSequelaDesc || '');
  }
  if (emInv(A)) {
    var sn = clean(A.emSintNeuro, 'Nenhum desses');
    var sg = clean(A.emSintGerais, 'Nenhum desses');
    if (inArr(sn, 'Dor no olho com a visão embaçada')) {
      F('c', 'Episódio compatível com neurite óptica',
        'Dor ocular com turvação visual — bandeira de doença desmielinizante.');
      explore.push('Neurite óptica prévia: datar o episódio, avaliar recuperação e solicitar RM de crânio e órbitas com contraste.');
    }
    if (sn.length >= 2) {
      F('w', 'Múltiplos sintomas neurológicos prévios', sn.join(' · '));
      explore.push('Vários sintomas neurológicos em tempos diferentes — investigar disseminação no tempo e no espaço (RM de crânio e medula, líquor com bandas oligoclonais).');
    } else if (sn.length === 1) {
      F('i', 'Sintoma neurológico prévio isolado', sn.join(' · '));
    }
    if (sg.length) {
      F('w', 'Sintomas sistêmicos associados',
        sg.join(' · ') + ' — ampliar investigação para causas inflamatórias e autoimunes sistêmicas.');
      explore.push('Sintomas sistêmicos presentes: rastrear doenças autoimunes no diferencial (Behçet, sarcoidose, lúpus).');
    }
  }

  /* ---- 6. SONO E DISAUTONOMIA ------------------------------------------ */
  if (A.ronco === 'Sim' && A.cochilo === 'Sim') {
    F('w', 'Rastreio positivo para apneia obstrutiva do sono',
      'Ronco que incomoda + sonolência diurna' + (A.horasSono ? ' · dorme ' + A.horasSono + ' horas' : '') + '.');
    explore.push('Apneia do sono: aplicar Epworth/STOP-Bang e considerar polissonografia — impacta cefaleia, cognição e risco vascular.');
  }
  if (A.insonia === 'Sim') F('w', 'Insônia', A.insoniaTipo || '');
  if (dirige && A.cochilo === 'Sim')
    F('w', 'Sonolência diurna em paciente que dirige', 'Orientar sobre risco ao volante.');
  if (A.urinario && A.urinario !== 'Normal')
    F(A.urinario === 'Perco urina sem sentir (incontinência)' ? 'w' : 'i',
      'Alteração urinária: ' + A.urinario, 'Avaliar componente neurogênico.');
  if (A.intestino === 'Perco o controle da evacuação')
    F('c', 'Perda do controle da evacuação',
      'Associada a queixa neurológica, exige exclusão de lesão medular ou de cauda equina.');
  else if (A.intestino && A.intestino !== 'Normal')
    F('i', 'Alteração do hábito intestinal: ' + A.intestino, '');
  if (A.urinario === 'Perco urina sem sentir (incontinência)' && A.intestino === 'Perco o controle da evacuação')
    explore.push('Incontinência dupla — exame neurológico dirigido e imagem de medula.');

  /* ---- 7. GERAIS -------------------------------------------------------- */
  if (A.alergias === 'Sim' && A.alergiasQuais) F('c', 'Alergia medicamentosa', A.alergiasQuais);
  if (meds.length >= 5) F('w', 'Polifarmácia — ' + meds.length + ' medicamentos em uso', 'Revisar interações e iatrogenia.');
  if (!meds.length && !A.semMed) F('i', 'Lista de medicamentos não preenchida', 'Confirmar uso de medicações na consulta.');

  var vasc = countOf(doe, ['Pressão alta','Diabetes','Colesterol alto','Doença cardíaca','AVC ou isquemia','Obesidade']) +
             (A.tabaco === 'Fumo atualmente' ? 1 : 0);
  if (vasc >= 3) {
    F('w', 'Perfil de risco cerebrovascular elevado',
      doe.filter(function (d) { return ['Pressão alta','Diabetes','Colesterol alto','Doença cardíaca','AVC ou isquemia','Obesidade'].indexOf(d) >= 0; })
        .concat(A.tabaco === 'Fumo atualmente' ? ['Tabagismo ativo'] : []).join(' · '));
    explore.push('Fatores de risco vascular somados — alinhar prevenção e metas (PA, LDL, HbA1c, tabagismo).');
  }

  if (sf.pct != null && sf.pct >= 61)
    F('w', 'Índice de impacto (SF-36 adaptado) = ' + sf.pct + '% — impacto grave',
      'O quadro está comprometendo de forma importante a vida do paciente.');
  if (A.trabalho === 'Afastado' || inArr(deixou, 'Mudei de função, reduzi jornada ou parei de trabalhar'))
    F('w', 'Repercussão laboral',
      'Paciente afastado ou com mudança de função — pode demandar relatório, laudo ou orientação previdenciária.');
  if (typeof A.prontidao === 'number' && A.prontidao <= 4)
    F('w', 'Baixa prontidão para iniciar tratamento (' + A.prontidao + '/10)',
      (A.prontidaoSubir ? 'O que faria subir: ' + A.prontidaoSubir : 'Alinhar expectativa antes de propor plano longo.'));

  if (A.outrosProf === 'Sim' && Number(A.outrosQtd) >= 3)
    F('i', 'Peregrinação diagnóstica — ' + A.outrosQtd + ' profissionais consultados',
      (A.outrosEsp ? 'Especialidades: ' + A.outrosEsp + '. ' : '') +
      'Nomear o que já foi descartado costuma ser terapêutico.');
  if (inArr(A.expectativa, 'Uma segunda opinião'))
    F('i', 'Vem em busca de segunda opinião', 'Trazer laudos anteriores e explicitar concordâncias e divergências.');
  if (A.decideCom && A.decideCom !== 'Só eu')
    F('i', 'Decisão compartilhada', 'Decide com: ' + A.decideCom +
      (A.decidePresente ? ' — presença na consulta: ' + A.decidePresente : ''));
  if (A.quemPreenche === 'Acompanhante ou familiar')
    F('i', 'Ficha preenchida por acompanhante', A.acompanhante || '');
  if (A.jaPaciente === 'Sim, já sou paciente')
    F('i', 'Paciente de retorno', 'Já acompanha com o Dr. Carlos.');

  if (!queixasAtivas().length)
    F('i', 'Nenhum bloco de queixa neurológica assinalado',
      'O paciente respondeu “não” aos cinco blocos dirigidos — conduzir pela queixa livre.');

  if (exa.length) explore.push('Pedir que traga laudos e imagens dos exames já realizados: ' + exa.join(', ') + '.');
  if (meds.length) explore.push('Conferir na consulta a lista de ' + meds.length + ' medicação(ões) trazida(s) pelo paciente.');

  flags.sort(function (a, b) {
    var o = { c:0, w:1, i:2 };
    return o[a.lvl] - o[b.lvl];
  });

  /* ---- seções do resumo -------------------------------------------------- */
  var secs = [];

  secs.push({ title:'Identificação', items:[
    kv('Paciente', A.nome),
    kv('Idade', A.idade ? A.idade + ' anos' : ''),
    kv('Sexo', A.sexo),
    kv('Contato', [A.tel, A.email].filter(Boolean).join(' · ')),
    kv('Cidade', A.cidade),
    kv('Profissão', [A.profissao, A.trabalho].filter(Boolean).join(' — ')),
    kv('Plano de saúde', A.plano),
    kv('Vínculo', A.jaPaciente),
    kv('Origem', [A.origem, A.origem_o].filter(Boolean).join(' · ')),
    kv('Ficha preenchida por', A.quemPreenche === 'Acompanhante ou familiar'
        ? 'Acompanhante — ' + (A.acompanhante || '') : 'O próprio paciente')
  ]});

  secs.push({ title:'Motivo da consulta', items:[
    free('Nas palavras do paciente', A.queixa),
    kv('Tempo de evolução', A.tempoConvive),
    kv('Já procurou outros profissionais', A.outrosProf === 'Sim'
        ? 'Sim — ' + (A.outrosQtd || '?') + ' profissional(is)' + (A.outrosEsp ? ' (' + A.outrosEsp + ')' : '')
        : A.outrosProf),
    tags('Expectativa com a consulta', clean(A.expectativa).concat(A.expectativa_o ? [A.expectativa_o] : [])),
    free('Se pudesse resolver uma coisa', A.umaCoisa)
  ]});

  if (cef(A)) {
    secs.push({ title:'Queixa dirigida · Cefaleia', items:[
      tags('Localização da dor', zonaLabels(), true),
      kv('Lateralidade', A.cefLados),
      tags('Tipo de dor', clean(A.cefTipo).concat(A.cefTipo_o ? [A.cefTipo_o] : [])),
      kv('Frequência no último mês', typeof A.cefFreq === 'number' ? CEF_FREQ[A.cefFreq] : ''),
      kv('Duração da crise', A.cefDuracao),
      kv('Melhora com repouso', A.cefRepouso),
      kv('Impede atividades', A.cefImpede),
      kv('Piora com luz ou som', A.cefLuzSom),
      kv('Enjoo ou vômito', A.cefEnjoo),
      tags('Aura / sintomas prévios', clean(A.cefAura, 'Nenhum desses').concat(A.cefAura_o ? [A.cefAura_o] : [])),
      tags('Gatilhos', clean(A.cefGatilho, 'Não há relação')
            .concat(A.cefGatilhoAlim ? ['Alimento: ' + A.cefGatilhoAlim] : [])),
      tags('Sintomas autonômicos', clean(A.cefAssoc, 'Nada disso acontece'), true),
      free('Medicações que aliviam', A.cefRemedio),
      kv('Frequência de analgésico', A.cefFreqAnalg)
    ]});
  }

  if (cog(A)) {
    secs.push({ title:'Queixa dirigida · Memória e cognição', items:[
      kv('Tempo de evolução', A.cogTempo),
      kv('Percebido por', A.cogQuemPercebeu),
      kv('Evolução', A.cogEvolucao),
      tags('Sintomas relatados', clean(A.cogItens, 'Nenhuma dessas'), true)
    ]});
  }

  if (epi(A)) {
    secs.push({ title:'Queixa dirigida · Crises e desmaios', items:[
      free('O que sente antes do episódio', A.epiAntes),
      kv('Duração', A.epiDuracao),
      tags('Durante o episódio', clean(A.epiCarac, 'Nenhuma dessas'), true),
      kv('Episódios de ausência', A.epiAusencia),
      tags('Depois do episódio', clean(A.epiApos, 'Nada disso — já acordo normal'))
    ]});
  }

  if (park(A)) {
    secs.push({ title:'Queixa dirigida · Tremor e parkinsonismo', items:[
      kv('Apresenta tremor', A.parkTremor),
      kv('Localização do tremor', A.parkTremorLocal),
      tags('O tremor piora', clean(A.parkTremorQuando, 'Não percebo nada que piore')),
      tags('O tremor alivia', clean(A.parkTremorAlivio, 'Não percebo nada que alivie')),
      kv('Marcha travada', A.parkMarcha),
      kv('Quedas / desequilíbrio', A.parkEquilibrio),
      kv('Lentidão dos movimentos', A.parkLentidao),
      kv('Tonteira / pré-síncope', A.parkTonteira),
      kv('Perda de olfato', A.parkOlfato)
    ]});
  }

  if (emDx(A)) {
    secs.push({ title:'Queixa dirigida · Esclerose múltipla em tratamento', items:[
      kv('Tolera o medicamento', A.emTolera === 'Não' ? 'Não — ' + (A.emToleraDesc || '') : A.emTolera),
      kv('Sintoma novo desde a última consulta', A.emNovo === 'Sim' ? 'Sim — ' + (A.emNovoDesc || '') : A.emNovo),
      kv('Sequelas de surtos anteriores', A.emSequela === 'Sim' ? 'Sim — ' + (A.emSequelaDesc || '') : A.emSequela),
      kv('Capacidade de marcha', A.emMarcha),
      kv('Estado emocional', A.emEmocional === 'Não estou bem'
          ? 'Não está bem' + (A.emEmocionalDesc ? ' — ' + A.emEmocionalDesc : '') : A.emEmocional),
      kv('Cognição', A.emCognicao === 'Está comprometida'
          ? 'Comprometida' + (A.emCognicaoDesc ? ' — ' + A.emCognicaoDesc : '') : A.emCognicao)
    ]});
  }
  if (emInv(A)) {
    secs.push({ title:'Queixa dirigida · Suspeita de doença desmielinizante', items:[
      tags('Sintomas neurológicos prévios', clean(A.emSintNeuro, 'Nenhum desses'), true),
      tags('Sintomas sistêmicos', clean(A.emSintGerais, 'Nenhum desses'), true)
    ]});
  }

  secs.push({ title:'Histórico de saúde', items:[
    tags('Comorbidades', doe.concat(A.doencasOutras ? [A.doencasOutras] : [])),
    kv('Alergias', A.alergias === 'Sim' ? (A.alergiasQuais || 'Sim') : A.alergias),
    free('Cirurgias e internações', A.cirurgias),
    tags('Exames já realizados', exa),
    tags('História familiar', fam),
    kv('Familiares acometidos', A.familiaQuem)
  ]});

  secs.push({ title:'Medicações em uso', items:[
    meds.length
      ? { t:'table', head:['Medicamento','Dose','Frequência','Desde quando / para quê'],
          rows: meds.map(function (m) { return [m.n, m.d, m.f, m.p]; }) }
      : kv('Medicações', A.semMed ? 'Nenhuma em uso (informado pelo paciente)' : 'Não informado'),
    free('Já usou e interrompeu', A.medsParou)
  ]});

  secs.push({ title:'Hábitos, sono e disautonomia', items:[
    kv('Sono por noite', A.horasSono),
    kv('Insônia', A.insonia === 'Sim' ? 'Sim — ' + (A.insoniaTipo || '') : A.insonia),
    kv('Ronco', A.ronco),
    kv('Cochila durante o dia', A.cochilo),
    kv('Hábito intestinal', A.intestino),
    kv('Hábito urinário', A.urinario),
    kv('Atividade física', A.atividade),
    kv('Café / energéticos', A.cafe),
    kv('Álcool', A.alcool),
    kv('Tabaco', A.tabaco),
    kv('Outras substâncias', A.substancias === 'Sim' ? (A.substanciasQuais || 'Sim') : A.substancias),
    kv('Estresse', A.estresse),
    kv('Alimentação', join(A.alimentacao)),
    kv('Dirige', A.dirige)
  ]});

  var sfRows = [];
  if (A.sf) {
    var sfNames = { sf1:'Capacidade física', sf2:'Trabalho e estudo', sf3:'Dor', sf4:'Saúde geral',
      sf5:'Energia', sf6:'Vida social e familiar', sf7:'Emoções', sf8:'Bem-estar mental' };
    Object.keys(sfNames).forEach(function (k) {
      if (typeof A.sf[k] === 'number') sfRows.push([sfNames[k], SF_LABELS[A.sf[k]] + ' (' + A.sf[k] + ')']);
    });
  }
  secs.push({ title:'Impacto na vida — SF-36 adaptado', items:[
    kv('Soma dos 8 itens', sf.n ? sf.sum + ' / 32' : ''),
    kv('Índice de impacto', sf.pct != null ? sf.pct + '% — ' + sfBand(sf.pct) : ''),
    kv('Comparado a 12 meses atrás', A.sf9),
    sfRows.length ? { t:'table', head:['Domínio','Resposta'], rows:sfRows } : null
  ]});

  secs.push({ title:'O que está em jogo', items:[
    tags('Deixou de fazer', deixou.concat(A.deixouFazer_o ? [A.deixouFazer_o] : [])),
    kv('Há quanto tempo busca resposta', A.tempoBusca),
    tags('Recursos já investidos', clean(A.recursos)),
    kv('Quem mais é afetado', join(A.afetados) + (A.afetadosComo ? ' — ' + A.afetadosComo : '')),
    free('Como imagina a vida em 1 ano', A.imagina),
    kv('Prontidão para tratar', typeof A.prontidao === 'number' ? A.prontidao + ' / 10' : ''),
    kv('O que faria esse número subir', A.prontidaoSubir),
    kv('Condução preferida', A.conducao),
    kv('Decide com', [A.decideCom, A.decideCom_o].filter(Boolean).join(' · ') +
        (A.decidePresente ? ' — presente na consulta: ' + A.decidePresente : '')),
    free('Recado ao Dr. Carlos', A.algoMais)
  ]});

  secs.push({ title:'Autorizações', items:[
    tags('Autorizado pelo paciente', clean(A.consent).length ? clean(A.consent) : ['Nenhuma autorização assinalada'])
  ]});

  /* limpa itens vazios */
  secs.forEach(function (s) {
    s.items = s.items.filter(function (it) {
      if (!it) return false;
      if (it.t === 'kv')    return !!(it.v && String(it.v).trim() && String(it.v).trim() !== '—');
      if (it.t === 'tags')  return it.items && it.items.length;
      if (it.t === 'free')  return !!(it.text && it.text.trim());
      if (it.t === 'table') return it.rows && it.rows.length;
      return true;
    });
  });
  secs = secs.filter(function (s) { return s.items.length; });

  var crit = flags.filter(function (f) { return f.lvl === 'c'; }).length;
  var warn = flags.filter(function (f) { return f.lvl === 'w'; }).length;
  var qa = queixasAtivas();

  return {
    nome: A.nome || 'Paciente sem nome',
    idade: A.idade || '',
    tel: A.tel || '',
    email: A.email || '',
    data: new Date().toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' }),
    flags: flags, crit: crit, warn: warn,
    queixas: qa,
    explore: explore,
    scores: [
      { l:'Foco da consulta', n: qa.length ? String(qa.length) : '—',
        d: qa.length ? qa.join(' · ') : 'nenhum bloco dirigido', alert: false },
      { l:'Impacto (SF-36)', n: sf.pct != null ? sf.pct + '%' : '—', d: sfBand(sf.pct) || 'não respondido',
        alert: sf.pct != null && sf.pct >= 61 },
      { l:'Prontidão', n: typeof A.prontidao === 'number' ? A.prontidao + '/10' : '—',
        d: A.conducao || 'condução não definida', alert: typeof A.prontidao === 'number' && A.prontidao <= 4 },
      { l:'Alertas', n: crit ? String(crit) + ' crítico' + (crit > 1 ? 's' : '') : String(warn),
        d: crit ? warn + ' de atenção' : (warn ? 'de atenção' : 'sem alertas'), alert: crit > 0 }
    ],
    sections: secs
  };
}

function kv(k, v)      { return { t:'kv', k:k, v: v == null ? '' : v }; }
function free(k, text) { return { t:'free', k:k, text: text == null ? '' : text }; }
function tags(k, items, hot) {
  return { t:'tags', k:k, items: (items || []).filter(Boolean), hot: !!hot };
}

/* ==========================================================================
   6. RENDERIZAÇÃO DO RESUMO (tela / e-mail / texto)
   ========================================================================== */

function screenSummary(S) {
  var h = '';
  h += '<div class="sumwrap"><div class="sumhead">' +
       '<div class="t">' + esc(S.nome) + (S.idade ? ', ' + esc(S.idade) + ' anos' : '') + '</div>' +
       '<div class="s">Ficha de pré-atendimento · ' + esc(S.data) +
       (S.tel ? ' · ' + esc(S.tel) : '') + '</div></div><div class="sumbody">';

  h += '<div class="sumsec"><h4>Leitura rápida</h4><div class="scores">';
  S.scores.forEach(function (s) {
    h += '<div class="score' + (s.alert ? ' alert' : '') + '"><div class="l">' + esc(s.l) +
         '</div><div class="n">' + esc(s.n) + '</div><div class="d">' + esc(s.d) + '</div></div>';
  });
  h += '</div></div>';

  if (S.flags.length) {
    h += '<div class="sumsec"><h4>Pontos críticos para o Dr. Carlos ' +
         (S.crit ? '· ' + S.crit + ' crítico(s)' : '') + (S.warn ? ' · ' + S.warn + ' de atenção' : '') +
         '</h4>';
    S.flags.forEach(function (f) {
      h += '<div class="flag ' + f.lvl + '"><span class="ic">' +
           (f.lvl === 'c' ? 'CRÍTICO' : f.lvl === 'w' ? 'ATENÇÃO' : 'NOTA') +
           '</span><span><b>' + esc(f.t) + '</b>' + (f.d ? '<br>' + esc(f.d) : '') + '</span></div>';
    });
    h += '</div>';
  }

  if (S.explore.length) {
    h += '<div class="sumsec"><h4>Roteiro sugerido para a consulta</h4><ul style="padding-left:18px;font-size:14.3px;line-height:1.65;color:#1E2A24">';
    S.explore.forEach(function (e) { h += '<li style="margin-bottom:5px">' + esc(e) + '</li>'; });
    h += '</ul></div>';
  }

  S.sections.forEach(function (sec) {
    h += '<div class="sumsec"><h4>' + esc(sec.title) + '</h4>';
    sec.items.forEach(function (it) {
      if (it.t === 'kv') h += '<div class="kv"><div class="k">' + esc(it.k) + '</div><div class="v">' + esc(it.v) + '</div></div>';
      else if (it.t === 'tags') {
        h += '<div style="padding:7px 0"><div style="font-size:13px;color:#61726A;margin-bottom:5px">' + esc(it.k) + '</div><div class="taglist">';
        it.items.forEach(function (t) { h += '<span class="tag' + (it.hot ? ' hot' : '') + '">' + esc(t) + '</span>'; });
        h += '</div></div>';
      }
      else if (it.t === 'free')
        h += '<div style="padding:7px 0"><div style="font-size:13px;color:#61726A;margin-bottom:5px">' + esc(it.k) + '</div><div class="free">' + esc(it.text) + '</div></div>';
      else if (it.t === 'table') {
        h += '<table class="med"><thead><tr>';
        it.head.forEach(function (x) { h += '<th>' + esc(x) + '</th>'; });
        h += '</tr></thead><tbody>';
        it.rows.forEach(function (r) {
          h += '<tr>';
          r.forEach(function (c) { h += '<td>' + esc(c || '—') + '</td>'; });
          h += '</tr>';
        });
        h += '</tbody></table>';
      }
    });
    h += '</div>';
  });

  h += '</div></div>';
  return h;
}

/* e-mail: HTML com estilos embutidos (para Gmail) */
function emailHTML(S) {
  var G = '#2F9E6A', GD = '#1E7A50', L = '#DFEDE5', SOFT = '#61726A', INK = '#1E2A24';
  var h = '<div style="font-family:Arial,Helvetica,sans-serif;color:' + INK + ';max-width:720px;margin:0 auto;padding:8px">';

  h += '<div style="border-bottom:2px solid ' + G + ';padding-bottom:10px;margin-bottom:16px">' +
       '<div style="font-size:11px;letter-spacing:2px;color:' + SOFT + ';text-transform:uppercase">Ficha de pré-atendimento</div>' +
       '<div style="font-size:21px;color:' + GD + ';font-weight:bold;margin-top:4px">' + esc(S.nome) +
       (S.idade ? ', ' + esc(S.idade) + ' anos' : '') + '</div>' +
       '<div style="font-size:12px;color:' + SOFT + ';margin-top:3px">' + esc(S.data) +
       (S.tel ? ' · ' + esc(S.tel) : '') + (S.email ? ' · ' + esc(S.email) : '') + '</div></div>';

  h += '<table width="100%" cellpadding="0" cellspacing="6" style="margin-bottom:14px"><tr>';
  S.scores.forEach(function (s) {
    var bg = s.alert ? '#FDF1EF' : '#F5FBF7', bd = s.alert ? '#F2D5D0' : L, nc = s.alert ? '#C0392B' : GD;
    h += '<td width="25%" style="background:' + bg + ';border:1px solid ' + bd + ';border-radius:8px;padding:9px 11px;vertical-align:top">' +
         '<div style="font-size:9.5px;letter-spacing:1px;color:' + SOFT + ';text-transform:uppercase">' + esc(s.l) + '</div>' +
         '<div style="font-size:18px;color:' + nc + ';font-weight:bold;margin:3px 0">' + esc(s.n) + '</div>' +
         '<div style="font-size:11px;color:' + SOFT + '">' + esc(s.d) + '</div></td>';
  });
  h += '</tr></table>';

  if (S.flags.length) {
    h += '<div style="font-size:11px;letter-spacing:2px;color:' + G + ';text-transform:uppercase;font-weight:bold;border-bottom:1px solid ' + L + ';padding-bottom:5px;margin:20px 0 10px">Pontos críticos</div>';
    S.flags.forEach(function (f) {
      var c = f.lvl === 'c' ? { bg:'#FDF1EF', bd:'#F2D5D0', tx:'#C0392B', lb:'CRÍTICO' }
            : f.lvl === 'w' ? { bg:'#FDF8EC', bd:'#F2E4C4', tx:'#B7791F', lb:'ATENÇÃO' }
            :                 { bg:'#F5FBF7', bd:L,          tx:GD,        lb:'NOTA' };
      h += '<div style="background:' + c.bg + ';border:1px solid ' + c.bd + ';border-radius:7px;padding:9px 12px;margin-bottom:6px;font-size:13.5px;line-height:1.5">' +
           '<span style="color:' + c.tx + ';font-weight:bold;font-size:10.5px;letter-spacing:1px">' + c.lb + '</span> &nbsp;' +
           '<b>' + esc(f.t) + '</b>' + (f.d ? '<br><span style="color:' + SOFT + '">' + esc(f.d) + '</span>' : '') + '</div>';
    });
  }

  if (S.explore.length) {
    h += '<div style="font-size:11px;letter-spacing:2px;color:' + G + ';text-transform:uppercase;font-weight:bold;border-bottom:1px solid ' + L + ';padding-bottom:5px;margin:20px 0 10px">Roteiro sugerido para a consulta</div><ul style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.6">';
    S.explore.forEach(function (e) { h += '<li style="margin-bottom:4px">' + esc(e) + '</li>'; });
    h += '</ul>';
  }

  S.sections.forEach(function (sec) {
    h += '<div style="font-size:11px;letter-spacing:2px;color:' + G + ';text-transform:uppercase;font-weight:bold;border-bottom:1px solid ' + L + ';padding-bottom:5px;margin:20px 0 8px">' + esc(sec.title) + '</div>';
    sec.items.forEach(function (it) {
      if (it.t === 'kv')
        h += '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:13.5px;border-bottom:1px solid #F4F8F6"><tr>' +
             '<td width="38%" style="color:' + SOFT + ';padding:5px 8px 5px 0;vertical-align:top">' + esc(it.k) + '</td>' +
             '<td style="padding:5px 0;font-weight:bold">' + esc(it.v) + '</td></tr></table>';
      else if (it.t === 'tags') {
        h += '<div style="padding:6px 0"><div style="font-size:12px;color:' + SOFT + ';margin-bottom:4px">' + esc(it.k) + '</div><div style="font-size:13px;line-height:1.9">';
        it.items.forEach(function (t) {
          var bg = it.hot ? '#FDF1EF' : '#EAF5EF', tx = it.hot ? '#7C2B22' : GD, bd = it.hot ? '#F2D5D0' : L;
          h += '<span style="background:' + bg + ';border:1px solid ' + bd + ';color:' + tx + ';border-radius:20px;padding:3px 9px;margin-right:4px;white-space:nowrap">' + esc(t) + '</span> ';
        });
        h += '</div></div>';
      }
      else if (it.t === 'free')
        h += '<div style="padding:6px 0"><div style="font-size:12px;color:' + SOFT + ';margin-bottom:4px">' + esc(it.k) + '</div>' +
             '<div style="background:#F5FBF7;border:1px solid ' + L + ';border-radius:7px;padding:10px 12px;font-size:13.5px;line-height:1.6;white-space:pre-wrap">' + esc(it.text) + '</div></div>';
      else if (it.t === 'table') {
        h += '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse;margin:6px 0"><tr>';
        it.head.forEach(function (x) {
          h += '<th align="left" style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:' + SOFT + ';border-bottom:1px solid ' + L + ';padding:0 8px 5px 0">' + esc(x) + '</th>';
        });
        h += '</tr>';
        it.rows.forEach(function (r) {
          h += '<tr>';
          r.forEach(function (c) { h += '<td style="padding:6px 8px 6px 0;border-bottom:1px solid #F4F8F6;vertical-align:top">' + esc(c || '—') + '</td>'; });
          h += '</tr>';
        });
        h += '</table>';
      }
    });
  });

  h += '<div style="margin-top:26px;padding-top:12px;border-top:1px solid ' + L + ';font-size:10.5px;color:#8A9A92;line-height:1.7;text-align:center">' +
       esc(CFG.doctorName || '') + '<br>' + esc(CFG.address || '') + ' · ' + esc(CFG.phones || '') +
       '<br>Documento gerado automaticamente pela ficha de pré-atendimento. Integra o prontuário do paciente.</div></div>';
  return h;
}

function textSummary(S) {
  var t = 'FICHA DE PRÉ-ATENDIMENTO\n' + S.nome + (S.idade ? ', ' + S.idade + ' anos' : '') +
          '\n' + S.data + (S.tel ? ' · ' + S.tel : '') + '\n';
  if (S.queixas.length) t += 'Foco: ' + S.queixas.join(' · ') + '\n';
  t += '\n— LEITURA RÁPIDA —\n';
  S.scores.forEach(function (s) { t += s.l + ': ' + s.n + ' (' + s.d + ')\n'; });
  if (S.flags.length) {
    t += '\n— PONTOS CRÍTICOS —\n';
    S.flags.forEach(function (f) {
      t += '[' + (f.lvl === 'c' ? 'CRÍTICO' : f.lvl === 'w' ? 'ATENÇÃO' : 'NOTA') + '] ' + f.t + (f.d ? ' — ' + f.d : '') + '\n';
    });
  }
  if (S.explore.length) {
    t += '\n— ROTEIRO SUGERIDO —\n';
    S.explore.forEach(function (e) { t += '• ' + e + '\n'; });
  }
  S.sections.forEach(function (sec) {
    t += '\n— ' + sec.title.toUpperCase() + ' —\n';
    sec.items.forEach(function (it) {
      if (it.t === 'kv') t += it.k + ': ' + it.v + '\n';
      else if (it.t === 'tags') t += it.k + ': ' + it.items.join(', ') + '\n';
      else if (it.t === 'free') t += it.k + ': ' + it.text + '\n';
      else if (it.t === 'table') it.rows.forEach(function (r) { t += '  · ' + r.filter(Boolean).join(' | ') + '\n'; });
    });
  });
  return t;
}

/* ==========================================================================
   7. CONFERÊNCIA E CONFIRMAÇÃO
   --------------------------------------------------------------------------
   O paciente NÃO vê o resumo clínico. Ele confere os dados de contato,
   conclui, e recebe apenas a confirmação. O resumo e o PDF vão somente
   para o Dr. Carlos.
   ========================================================================== */

function viewReview() {
  if (!SUM) SUM = buildSummary();
  var w = el('div', 'step on');
  var contato = [];
  if (A.nome)  contato.push(['Paciente', A.nome + (A.idade ? ', ' + A.idade + ' anos' : '')]);
  if (A.tel)   contato.push(['Telefone / WhatsApp', A.tel]);
  if (A.email) contato.push(['E-mail', A.email]);
  if (A.quemPreenche === 'Acompanhante ou familiar' && A.acompanhante)
    contato.push(['Preenchido por', A.acompanhante]);

  var linhas = contato.map(function (c) {
    return '<div class="kv"><div class="k">' + esc(c[0]) + '</div><div class="v">' + esc(c[1]) + '</div></div>';
  }).join('');

  w.innerHTML =
    '<div class="eyebrow"><span class="dot"></span>Última etapa</div>' +
    '<h2>Tudo pronto</h2>' +
    '<p class="sub">Confira se o seu contato está correto — é por ele que o consultório fala com você. ' +
    'Se precisar corrigir alguma resposta, use o botão “Voltar”.</p>' +
    '<div class="sumwrap"><div class="sumhead">' +
      '<div class="t">Seus dados de contato</div>' +
      '<div class="s">Confira antes de concluir</div>' +
    '</div><div class="sumbody">' + linhas + '</div></div>' +
    '<div class="note" style="margin-top:20px">Ao concluir, a sua ficha é enviada diretamente ao ' +
    '<b>Dr. Carlos Augusto</b>, que vai lê-la antes da sua consulta. As informações são ' +
    'protegidas por sigilo médico e integram o seu prontuário.</div>';
  return w;
}

function viewDone() {
  var w = el('div', 'step on');
  var first = (A.nome || '').trim().split(' ')[0] || '';
  var ok = A.__sent === true;

  if (!ok) {
    var zap = (CFG.supportWhatsapp || '').replace(/\D/g, '');
    w.innerHTML =
      '<div class="okwrap">' +
      '<div class="okico" style="background:var(--crit-w)">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2.2" ' +
        'stroke-linecap="round"><path d="M12 8v5"/><path d="M12 17h.01"/>' +
        '<path d="M10.3 3.6L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.6a2 2 0 00-3.4 0z" stroke-linejoin="round"/></svg>' +
      '</div>' +
      '<h2>Não conseguimos concluir o envio</h2>' +
      '<p class="lead" style="margin:10px auto 0">Tudo o que você preencheu está salvo neste aparelho — ' +
      'nada foi perdido. Verifique a sua conexão com a internet e tente novamente.</p>' +
      '<div class="okbtns">' +
        '<button class="btn pri" id="btnRetry" style="flex:0">Tentar enviar novamente</button>' +
        (zap ? '<a class="btn sec" href="https://wa.me/' + zap + '" target="_blank" rel="noopener">Falar com a recepção</a>' : '') +
      '</div></div>';
    setTimeout(function () {
      var r = $('#btnRetry');
      if (r) r.onclick = function () { step = STEPS.length - 2; render(); submit(); };
    }, 30);
    return w;
  }

  var okIco = '<div class="okico"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2F9E6A" ' +
    'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>';

  w.innerHTML =
    '<div class="okwrap">' + okIco +
    '<div class="eyebrow" style="justify-content:center">Pré-atendimento concluído com sucesso</div>' +
    '<h2>Obrigado' + (first ? ', ' + esc(first) : '') + '.</h2>' +
    '<p class="lead" style="margin:12px auto 0">Você acaba de dar o <b>primeiro passo</b> de um ' +
    'tratamento de verdade: uma linha de cuidado construída para o seu caso, e não uma consulta ' +
    'solta.</p>' +
    '<p class="lead" style="margin:14px auto 0">O <b>Dr. Carlos Augusto</b> vai ler a sua história ' +
    'antes de você entrar no consultório. Na prática, isso quer dizer que o tempo que vocês vão ' +
    'passar juntos será usado para o que realmente importa — examinar, esclarecer as suas dúvidas ' +
    'e decidir o seu plano de cuidado.</p>' +
    '<div class="note" style="text-align:left;margin-top:26px">' +
      '<b>No dia da consulta, leve:</b> os laudos e as imagens dos exames que você já fez, as caixas ' +
      'dos remédios em uso e, se possível, um acompanhante — principalmente se houver queixa de ' +
      'memória.</div>' +
    '<div class="safe" style="text-align:left;margin-top:14px">' +
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2F9E6A" stroke-width="2">' +
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/></svg>' +
      '<div>As suas respostas foram enviadas somente ao Dr. Carlos e integram o seu prontuário. ' +
      'Você já pode fechar esta página.</div></div>' +
    '</div>';
  return w;
}

function mailSubject(S) {
  var tag = S.crit ? '[' + S.crit + ' CRÍTICO' + (S.crit > 1 ? 'S' : '') + '] '
          : S.warn ? '[' + S.warn + ' atenção] ' : '';
  var foco = S.queixas.length ? ' · ' + S.queixas.join(' + ') : '';
  return 'Pré-consulta ' + tag + '· ' + S.nome + (S.idade ? ', ' + S.idade + 'a' : '') + foco;
}

/* mensagem do WhatsApp — o detalhe completo vai no PDF anexo */
function whatsText(S) {
  var t = '*PRÉ-ATENDIMENTO RECEBIDO*\n';
  t += (S.crit ? '🔴 ' + S.crit + ' ponto(s) crítico(s)'
      : S.warn ? '🟡 ' + S.warn + ' ponto(s) de atenção'
      : '🟢 sem alertas') + '\n\n';
  t += '*' + S.nome + '*' + (S.idade ? ', ' + S.idade + ' anos' : '') + '\n';
  if (S.tel) t += S.tel + '\n';
  t += S.data + '\n\n';
  if (S.queixas.length) t += '*Foco:* ' + S.queixas.join(' · ') + '\n\n';
  t += '*Leitura rápida*\n';
  S.scores.forEach(function (s) { t += '• ' + s.l + ': ' + s.n + ' (' + s.d + ')\n'; });
  var graves = S.flags.filter(function (f) { return f.lvl !== 'i'; });
  var top = graves.slice(0, 8);
  if (top.length) {
    t += '\n*Pontos críticos*\n';
    top.forEach(function (f) { t += (f.lvl === 'c' ? '🔴 ' : '🟡 ') + f.t + '\n'; });
    if (graves.length > top.length) t += '_… e mais ' + (graves.length - top.length) + ' no PDF._\n';
  }
  if (S.explore.length) {
    t += '\n*Roteiro sugerido*\n';
    S.explore.slice(0, 5).forEach(function (e) { t += '• ' + e + '\n'; });
  }
  t += '\n📄 Ficha completa no PDF.';
  return t;
}

/* ==========================================================================
   8. ENVIO
   ========================================================================== */

function submit() {
  if (sending) return;
  SUM = buildSummary();
  var btn = $('#btnNext');

  var payload = {
    action: 'ficha',
    key: CFG.writeKey || '',
    subject: mailSubject(SUM),
    html: emailHTML(SUM),
    text: textSummary(SUM),
    whats: whatsText(SUM),
    patient: { nome:SUM.nome, idade:SUM.idade, tel:SUM.tel, email:SUM.email },
    row: {
      data: SUM.data, nome: SUM.nome, idade: SUM.idade, tel: SUM.tel, email: SUM.email,
      cidade: A.cidade || '', origem: A.origem || A.origem_o || '',
      queixa: (A.queixa || '').slice(0, 500), tempo: A.tempoConvive || '',
      criticos: SUM.crit, atencao: SUM.warn,
      alertas: SUM.flags.filter(function (f) { return f.lvl === 'c'; }).map(function (f) { return f.t; }).join(' | '),
      foco: SUM.queixas.join(' | '),
      impacto: SUM.scores[1].n, prontidao: SUM.scores[2].n, conducao: A.conducao || ''
    }
  };

  if (!CFG.endpointUrl) {
    try { localStorage.setItem('ficha_carlos_pendente', JSON.stringify(payload)); } catch (e) {}
    A.__sent = false;
    step++; save(); render();
    return;
  }

  sending = true;
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  var done = false;
  var finish = function (ok) {
    if (done) return; done = true;
    sending = false;
    A.__sent = ok;
    step++;
    if (ok) {
      try {
        localStorage.removeItem(STORE_KEY);
        localStorage.removeItem('ficha_carlos_pendente');
      } catch (e) {}
      render();
    } else {
      try { localStorage.setItem('ficha_carlos_pendente', JSON.stringify(payload)); } catch (e) {}
      save(); render();
    }
  };

  var falhou = setTimeout(function () { finish(false); }, 25000);

  try {
    fetch(CFG.endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
    .then(function (r) { return r.text(); })
    .then(function (t) { clearTimeout(falhou); finish(t.indexOf('"ok":true') >= 0); })
    .catch(function () { clearTimeout(falhou); finish(false); });
  } catch (e) { clearTimeout(falhou); finish(false); }
}

/* ==========================================================================
   9. INÍCIO
   ========================================================================== */

function boot() {
  $('#fName').textContent   = CFG.doctorName || '';
  $('#fT1').textContent     = CFG.doctorTitle1 || '';
  $('#fT2').textContent     = CFG.doctorTitle2 || '';
  $('#fAddr').textContent   = CFG.address || '';
  $('#fPhones').textContent = CFG.phones || '';

  load();

  try {
    var p = new URLSearchParams(location.search);
    if (p.get('nome') && !A.nome) A.nome = p.get('nome');
    if (p.get('tel') && !A.tel)  A.tel  = p.get('tel');
  } catch (e) {}

  $('#btnNext').onclick = next;
  $('#btnBack').onclick = back;
  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();

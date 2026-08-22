/* ============================================================================
   FICHA DE PRÉ-ATENDIMENTO — Dr. Carlos Augusto de Albuquerque Damasceno
   Neurologia Clínica
   ----------------------------------------------------------------------------
   Não é necessário editar este arquivo. Os ajustes do dia a dia ficam em config.js
   ========================================================================== */
(function () {
'use strict';

var CFG = window.FICHA_CONFIG || {};
var STORE_KEY = 'ficha_carlos_v2';
var A = {};            // respostas
var step = 0;
var SUM = null;        // modelo do resumo
var sending = false;

/* ==========================================================================
   1. CONTEÚDO DA FICHA
   ========================================================================== */

var SF_LABELS  = ['Nada', 'Pouco', 'Mais ou menos', 'Muito', 'Extremamente'];
var PHQ_LABELS = ['Nenhum dia', 'Vários dias', 'Mais da metade dos dias', 'Quase todos os dias'];

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
    { id:'origem', t:'radio', other:true, label:'Como você chegou até o Dr. Carlos Augusto?',
      opts:['Indicação de outro médico','Indicação de paciente ou amigo','Google','Instagram',
            'Convênio ou empresa','Já era paciente'] }
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
    { id:'umaCoisa', t:'textarea',
      label:'Se você pudesse resolver UMA coisa nesta consulta, qual seria?',
      ph:'Ex.: Voltar a dormir a noite inteira.' },
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

/* ---------- 3 · rastreio: dor de cabeça ---------------------------------- */
{
  num: '3', title: 'Dor de cabeça',
  sub: 'Marque tudo o que você apresentou nos últimos 12 meses — mesmo que pareça não ter relação com a sua queixa principal.',
  fields: [
    { id:'cefaleia', t:'check', excl:'Nenhuma dessas', label:'Nos últimos 12 meses eu tive:',
      opts:['Dor de cabeça recorrente','Dor forte que impede minhas atividades',
            'Enjoo ou vômito junto com a dor','Incômodo com luz ou som',
            'Aura (luzes, pontos ou formigamento antes da dor)','Dor de cabeça já ao acordar',
            'Uso analgésico mais de 10 dias por mês','Dor que piora ao tossir, abaixar ou fazer força',
            'Nenhuma dessas'] },
    { id:'cefaleiaDias', t:'number', label:'Em um mês comum, quantos dias você tem dor de cabeça?',
      ph:'Ex.: 8', half:true,
      showIf:function(a){ return has(a.cefaleia) && !only(a.cefaleia,'Nenhuma dessas'); } },
    { id:'cefaleiaRemedio', t:'text', label:'O que você toma quando a dor vem?',
      ph:'Ex.: dipirona, Neosaldina…', half:true,
      showIf:function(a){ return has(a.cefaleia) && !only(a.cefaleia,'Nenhuma dessas'); } }
  ]
},

/* ---------- 4 · força, sensibilidade, equilíbrio ------------------------- */
{
  num: '4', title: 'Força, sensibilidade e equilíbrio',
  sub: 'Continue marcando o que aconteceu nos últimos 12 meses.',
  fields: [
    { id:'forca', t:'check', excl:'Nenhuma dessas', label:'Nos últimos 12 meses eu tive:',
      opts:['Fraqueza em braço ou perna','Formigamento ou dormência','Queimação ou choques',
            'Perda de equilíbrio','Tontura ou vertigem','Quedas','Tremor',
            'Dificuldade para andar','Rigidez ou lentidão dos movimentos',
            'Movimentos involuntários','Nenhuma dessas'] }
  ]
},

/* ---------- 5 · visão, fala, episódios ----------------------------------- */
{
  num: '5', title: 'Visão, fala e episódios súbitos',
  sub: 'Mesmo que tenha acontecido uma única vez, marque.',
  fields: [
    { id:'visaoFala', t:'check', excl:'Nenhuma dessas', label:'Nos últimos 12 meses eu tive:',
      opts:['Visão dupla ou embaçada','Perda visual de um olho','Dor ao mover o olho',
            'Dificuldade para falar ou achar palavras','Boca torta','Engasgos frequentes',
            'Desmaio','Convulsão ou crise','Episódio de ausência ou apagão',
            'Confusão súbita','Nenhuma dessas'] }
  ]
},

/* ---------- 6 · memória e comportamento ---------------------------------- */
{
  num: '6', title: 'Memória, concentração e comportamento',
  sub: 'Se um familiar estiver ajudando a preencher, a percepção dele também conta.',
  fields: [
    { id:'memoria', t:'check', excl:'Nenhuma dessas', label:'Nos últimos 12 meses eu percebi:',
      opts:['Esquecimento de fatos recentes','Repetir as mesmas perguntas',
            'Perder-se em lugares conhecidos','Dificuldade de concentração',
            'Dificuldade com contas, remédios ou dinheiro','Trocar nomes ou palavras',
            'Mudança de comportamento ou personalidade',
            'Familiares notaram algo antes de mim','Nenhuma dessas'] },
    { id:'quemPercebeu', t:'radio', label:'Quem percebeu primeiro?',
      opts:['Eu mesmo','Um familiar','No trabalho'],
      showIf:function(a){ return has(a.memoria) && !only(a.memoria,'Nenhuma dessas'); } }
  ]
},

/* ---------- 7 · sono ------------------------------------------------------ */
{
  num: '7', title: 'Sono e sintomas do dia a dia',
  sub: 'O sono muda o rumo de muitos diagnósticos neurológicos — por isso este bloco.',
  fields: [
    { id:'sono', t:'check', excl:'Nenhuma dessas', label:'Nos últimos 12 meses eu tive:',
      opts:['Ronco alto','Paradas de respiração no sono (alguém relatou)','Sono não reparador',
            'Sonolência durante o dia','Insônia','Pernas inquietas ao deitar',
            'Falar ou agitar-se dormindo','Urgência ou perda de urina',
            'Intestino preso importante','Tontura ao levantar','Nenhuma dessas'] }
  ]
},

/* ---------- 8 · sinais de atenção ---------------------------------------- */
{
  num: '8', title: 'Sinais de atenção',
  sub: 'Leia com calma. Estes itens não significam gravidade — servem para o Dr. Carlos priorizar o que investigar primeiro.',
  fields: [
    { id:'alerta', t:'check', excl:'Nenhum dos acima', label:'Aconteceu com você:',
      opts:['A dor de cabeça mais forte da minha vida, que começou em segundos',
            'Febre com rigidez de nuca','Perda súbita de força ou da fala',
            'Perda de peso sem explicação','Traumatismo de cabeça recente',
            'Câncer atual ou anterior','Uso de remédio que baixa a imunidade',
            'Nenhum dos acima'] }
  ]
},

/* ---------- 9 · histórico de saúde --------------------------------------- */
{
  num: '9', title: 'Seu histórico de saúde',
  sub: 'Marque as condições que algum médico já disse que você tem.',
  fields: [
    { id:'doencas', t:'check', excl:'Nenhuma', label:'Doenças já diagnosticadas',
      opts:['Pressão alta','Diabetes','Colesterol alto','Tireoide','Obesidade',
            'Doença cardíaca','AVC ou isquemia','Doença autoimune','Doença renal',
            'Doença pulmonar','Epilepsia','Enxaqueca','Esclerose múltipla ou desmielinizante',
            'Parkinson','Demência','Depressão ou ansiedade em tratamento','Apneia do sono',
            'Câncer','Nenhuma'] },
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

/* ---------- 10 · medicamentos -------------------------------------------- */
{
  num: '10', title: 'Medicamentos em uso',
  sub: 'Inclua tudo — remédios, vitaminas, fitoterápicos e o que você toma "só quando precisa".',
  note: 'Se ficar mais fácil, pegue as caixas dos remédios agora. Se não souber a dose, deixe em branco — o importante é o nome.',
  fields: [
    { id:'meds', t:'meds', label:'Lista de medicamentos' },
    { id:'medsParou', t:'textarea',
      label:'Medicamentos que você já usou para esta queixa e interrompeu',
      hint:'E, se lembrar, por que parou.', ph:'Ex.: amitriptilina — parei porque me deixava muito sonolento' }
  ]
},

/* ---------- 11 · exames e família ---------------------------------------- */
{
  num: '11', title: 'Exames e histórico familiar',
  sub: 'Se você já tem exames feitos, leve os laudos e as imagens no dia da consulta.',
  fields: [
    { id:'exames', t:'check', excl:'Nenhum desses', label:'Exames que você já realizou',
      opts:['Ressonância de crânio','Ressonância de coluna','Tomografia',
            'Eletroencefalograma','Eletroneuromiografia','Punção lombar (líquor)',
            'Exames de sangue','Teste neuropsicológico','Nenhum desses'] },
    { id:'examesObs', t:'text', label:'Quando e onde foram feitos, se lembrar', ph:'Ex.: ressonância em 03/2025, no HU' },
    { id:'familia', t:'check', excl:'Nada relevante', label:'Alguém na família teve',
      opts:['AVC','Demência ou Alzheimer','Parkinson','Epilepsia','Enxaqueca',
            'Esclerose múltipla','Doença autoimune','Doença neuromuscular','Diabetes',
            'Doença cardíaca','Pressão alta','Doença renal','Doença pulmonar',
            'Doenças psiquiátricas','Câncer','Nada relevante'] },
    { id:'familiaQuem', t:'text', label:'Quem (parentesco) e com que idade começou',
      ph:'Ex.: minha mãe, AVC aos 62 anos' }
  ]
},

/* ---------- 12 · hábitos --------------------------------------------------*/
{
  num: '12', title: 'Hábitos e rotina',
  sub: 'Respostas rápidas — um toque em cada linha.',
  fields: [
    { id:'horasSono', t:'radio', label:'Horas de sono por noite',
      opts:['Menos de 5','5 a 6','7 a 8','Mais de 8'] },
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

/* ---------- 13 · impacto (SF-36) ----------------------------------------- */
{
  num: '13', title: 'Como isso afeta a sua vida',
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

/* ---------- 14 · PHQ-9 ---------------------------------------------------- */
{
  num: '14', title: 'Energia, sono e estado emocional',
  sub: 'Nas ÚLTIMAS 2 SEMANAS, com que frequência você foi incomodado por:',
  note: 'Bloco construído sobre os princípios do <b>PHQ-9</b>, rastreio validado internacionalmente. Sintomas neurológicos e estado emocional se influenciam — avaliar os dois juntos muda a conduta e o resultado do tratamento. <b>As respostas são sigilosas</b> e integram o prontuário.',
  fields: [
    { id:'ph', t:'scale', labels:PHQ_LABELS, req:true, items:[
      { id:'ph1', label:'Pouco interesse ou pouco prazer em fazer as coisas' },
      { id:'ph2', label:'Sentir-se para baixo, deprimido ou sem perspectiva' },
      { id:'ph3', label:'Dificuldade para pegar no sono, dormir sem interrupções ou dormir demais' },
      { id:'ph4', label:'Sentir-se cansado ou com pouca energia' },
      { id:'ph5', label:'Falta de apetite ou comer demais' },
      { id:'ph6', label:'Sentir-se mal consigo mesmo, um fracasso, ou ter decepcionado a família' },
      { id:'ph7', label:'Dificuldade de se concentrar em coisas como ler ou ver televisão' },
      { id:'ph8', label:'Lentidão para se mover ou falar — ou, ao contrário, muita agitação e inquietude' },
      { id:'ph9', label:'Pensar em se ferir de alguma maneira ou que seria melhor não estar vivo' }
    ]},
    { id:'ph10', t:'radio', label:'Se você marcou algum item acima, o quanto isso dificultou o seu dia a dia?',
      opts:['Nada','Um pouco','Muito','Extremamente'] },
    { id:'__crisis', t:'html', html:
      '<div class="crisis"><b>Se você está pensando em se machucar ou em não estar vivo, procure ajuda agora.</b><br>' +
      'CVV — ligue <b>188</b> (24 horas, gratuito) ou acesse cvv.org.br. Em emergência, SAMU <b>192</b>. ' +
      'Avise também o consultório: essa informação chega ao Dr. Carlos e a sua consulta pode ser antecipada.</div>',
      showIf:function(a){ return (a.ph && a.ph.ph9 > 0); } }
  ]
},

/* ---------- 15 · o que está em jogo -------------------------------------- */
{
  num: '15', title: 'O que está em jogo para você',
  sub: 'As perguntas abaixo não são sobre sintoma — são sobre a sua vida. Elas orientam o Dr. Carlos a construir um plano proporcional ao que o seu caso exige.',
  fields: [
    { id:'deixouFazer', t:'check', other:true, excl:'Nada mudou',
      label:'Nos últimos 12 meses, o que você deixou de fazer por causa desse problema?',
      opts:['Faltei ao trabalho ou perdi rendimento','Deixei de dirigir','Deixei de viajar',
            'Parei de me exercitar','Evitei compromissos sociais','Passei a depender de alguém',
            'Mudei de função, reduzi jornada ou parei de trabalhar',
            'Deixei de cuidar da minha família como gostaria','Nada mudou'] },
    { id:'diasPerdidos', t:'number', half:true,
      label:'Nos últimos 3 meses, quantos dias você deixou de fazer suas atividades por causa disso?', ph:'Ex.: 12' },
    { id:'tempoBusca', t:'text', half:true,
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
      hint:'Não existe escolha certa. O Dr. Carlos vai apresentar as opções adequadas ao seu caso — incluindo sempre a mais simples — e a decisão final é sua.',
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
      showIf:function(a){ return a.decideCom && a.decideCom !== 'Só eu'; } },
    { id:'algoMais', t:'textarea',
      label:'Há algo que você gostaria que o Dr. Carlos soubesse antes de te ver?',
      ph:'Qualquer coisa. Este espaço é seu.' }
  ]
},

/* ---------- 16 · autorizações --------------------------------------------- */
{
  num: '16', title: 'Autorizações',
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

/* ---------- 17 · conferencia final ----------------------------------------- */
{ kind:'review' },

/* ---------- 18 · fim ------------------------------------------------------- */
{ kind:'done' }
];

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
function only(arr, val) { return !!(arr && arr.length === 1 && arr[0] === val); }
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

  if (S.kind === 'intro')        { main.appendChild(viewIntro()); }
  else if (S.kind === 'review')   { main.appendChild(viewReview()); }
  else if (S.kind === 'done')    { main.appendChild(viewDone()); }
  else                           { main.appendChild(viewForm(S)); }

  // navegação
  var total = STEPS.length - 1;
  $('#bar').style.width = Math.round((step / total) * 100) + '%';
  $('#btnBack').classList.toggle('hide', step === 0 || S.kind === 'done');
  var nx = $('#btnNext');
  nx.disabled = false;
  if (S.kind === 'intro')        { nx.textContent = 'Começar a ficha'; nx.classList.remove('hide'); }
  else if (S.kind === 'review')   { nx.innerHTML = 'Concluir pré-atendimento'; nx.classList.remove('hide'); }
  else if (S.kind === 'done')    { nx.classList.add('hide'); }
  else                           { nx.textContent = 'Continuar'; nx.classList.remove('hide'); }
  $('#nav').classList.toggle('hide', S.kind === 'done');
  $('#stepNo').textContent = (S.num ? 'Etapa ' + S.num + ' de 16' : '');
  if (!keepScroll) window.scrollTo(0, 0);
}

/* ---------- abertura ------------------------------------------------------ */
function viewIntro() {
  var w = el('div', 'step on');
  w.innerHTML =
    '<div class="eyebrow"><span class="dot"></span>Avaliação neurológica estruturada</div>' +
    '<h1>Ficha de pré-atendimento</h1>' +
    '<p class="lead">Estas perguntas são o começo da sua consulta. Elas permitem que o ' +
    '<b>Dr. Carlos Augusto</b> chegue ao seu caso já conhecendo a sua história — e use o tempo do ' +
    'encontro para examinar, explicar e decidir com você.</p>' +
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

  /* --- medicações --- */
  else if (f.t === 'meds') {
    if (!A.meds || !A.meds.length) A.meds = [{ n:'', d:'', f:'', p:'' }];
    var head = el('div', 'medhead',
      '<div>Medicamento</div><div>Dose</div><div>Vezes ao dia</div><div>Desde quando / para quê</div><div></div>');
    q.appendChild(head);
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
      del.onclick = function () { A.meds.splice(ix, 1); if (!A.meds.length) A.meds = [{n:'',d:'',f:'',p:''}]; save(); rerender(); };
      r.appendChild(del);
      q.appendChild(r);
    });
    var add = el('button', 'addbtn', '+ Adicionar outro medicamento');
    add.type = 'button';
    add.onclick = function () { A.meds.push({ n:'', d:'', f:'', p:'' }); save(); rerender(); };
    q.appendChild(add);
    var none = el('div', 'chips');
    none.style.marginTop = '12px';
    var nc = el('label', 'chip' + (A.semMed ? ' sel' : ''));
    nc.innerHTML = '<span class="bx">' + CHK + '</span><span>Não uso nenhum medicamento</span>';
    nc.onclick = function (ev) { ev.preventDefault(); A.semMed = !A.semMed; if (A.semMed) A.meds = [{n:'',d:'',f:'',p:''}]; save(); rerender(); };
    none.appendChild(nc);
    q.appendChild(none);
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
function phqScore() {
  var v = A.ph || {}, s = 0, n = 0;
  for (var i = 1; i <= 9; i++) { var k = 'ph' + i; if (typeof v[k] === 'number') { s += v[k]; n++; } }
  return { sum:s, n:n, item9: (typeof v.ph9 === 'number' ? v.ph9 : null) };
}
function phqBand(s) {
  if (s == null) return '';
  if (s <= 4) return 'mínimo';
  if (s <= 9) return 'leve';
  if (s <= 14) return 'moderado';
  if (s <= 19) return 'moderadamente grave';
  return 'grave';
}
function medList() {
  if (A.semMed) return [];
  return (A.meds || []).filter(function (m) { return m && (m.n || '').trim(); });
}

function buildSummary() {
  var flags = [], explore = [];
  function F(lvl, tit, det) { flags.push({ lvl:lvl, t:tit, d:det || '' }); }

  var sf = sfScore(), phq = phqScore(), meds = medList();
  var alerta = clean(A.alerta, 'Nenhum dos acima');
  var cef = clean(A.cefaleia, 'Nenhuma dessas');
  var forca = clean(A.forca, 'Nenhuma dessas');
  var vis = clean(A.visaoFala, 'Nenhuma dessas');
  var mem = clean(A.memoria, 'Nenhuma dessas');
  var son = clean(A.sono, 'Nenhuma dessas');
  var doe = clean(A.doencas, 'Nenhuma');
  var fam = clean(A.familia, 'Nada relevante');
  var exa = clean(A.exames, 'Nenhum desses');
  var deixou = clean(A.deixouFazer, 'Nada mudou');

  /* ---- 1. bandeiras vermelhas --------------------------------------- */
  if (alerta.length) {
    F('c', 'Sinais de alerta assinalados pelo paciente', alerta.join(' · '));
    if (inArr(alerta, 'A dor de cabeça mais forte da minha vida, que começou em segundos'))
      explore.push('Cefaleia em trovoada relatada — caracterizar início, pico e contexto; considerar investigação de hemorragia subaracnóidea se episódio recente.');
    if (inArr(alerta, 'Febre com rigidez de nuca'))
      explore.push('Febre com rigidez de nuca relatada — datar o episódio e checar se houve avaliação em pronto-socorro.');
    if (inArr(alerta, 'Perda súbita de força ou da fala'))
      explore.push('Déficit neurológico súbito relatado — datar, duração e se houve investigação vascular (imagem, carótidas, ECG).');
    if (inArr(alerta, 'Traumatismo de cabeça recente'))
      explore.push('TCE recente — relacionar temporalmente com o início dos sintomas.');
    if (inArr(alerta, 'Câncer atual ou anterior') || inArr(alerta, 'Uso de remédio que baixa a imunidade') ||
        inArr(alerta, 'Perda de peso sem explicação'))
      explore.push('Contexto de imunossupressão / neoplasia / perda ponderal — ampliar diagnóstico diferencial (secundário, infeccioso, paraneoplásico).');
  }

  /* ---- 2. risco emocional -------------------------------------------- */
  if (phq.item9 != null && phq.item9 > 0) {
    F('c', 'PHQ-9 item 9 positivo — pensamentos de autolesão ou de morte',
      'Resposta: “' + PHQ_LABELS[phq.item9] + '”. Avaliar risco antes ou no início da consulta.');
    explore.push('Avaliar risco suicida (ideação, plano, intenção, meios, suporte) — item 9 do PHQ-9 positivo.');
  }
  if (phq.n === 9) {
    if (phq.sum >= 20) F('c', 'PHQ-9 = ' + phq.sum + '/27 — faixa grave', 'Rastreio compatível com quadro depressivo grave.');
    else if (phq.sum >= 15) F('w', 'PHQ-9 = ' + phq.sum + '/27 — moderadamente grave', 'Considerar abordagem conjunta do humor.');
    else if (phq.sum >= 10) F('w', 'PHQ-9 = ' + phq.sum + '/27 — moderado', 'Sintomas emocionais podem estar amplificando a queixa neurológica.');
    if (phq.sum >= 10) explore.push('Humor: PHQ-9 em faixa ' + phqBand(phq.sum) + ' — definir se trata em conjunto, encaminha ou apenas monitora.');
  }

  /* ---- 3. impacto ------------------------------------------------------ */
  if (sf.pct != null && sf.pct >= 61)
    F('w', 'Índice de impacto (SF-36 adaptado) = ' + sf.pct + '% — impacto grave',
      'O quadro está comprometendo de forma importante a vida do paciente.');
  if (A.diasPerdidos && Number(A.diasPerdidos) >= 15)
    F('w', Number(A.diasPerdidos) + ' dias de atividades perdidos nos últimos 3 meses', 'Perda funcional relevante.');
  if (A.trabalho === 'Afastado' || inArr(deixou, 'Mudei de função, reduzi jornada ou parei de trabalhar'))
    F('w', 'Repercussão laboral', 'Paciente afastado ou com mudança de função — pode demandar relatório, laudo ou orientação previdenciária.');

  /* ---- 4. cefaleia ----------------------------------------------------- */
  if (inArr(cef, 'Uso analgésico mais de 10 dias por mês')) {
    F('w', 'Uso de analgésico em mais de 10 dias por mês', 'Suspeitar de cefaleia por uso excessivo de medicação.');
    explore.push('Quantificar dias de analgésico/mês e discutir desmame — risco de cefaleia por uso excessivo.');
  }
  if (anyOf(cef, ['Dor que piora ao tossir, abaixar ou fazer força', 'Dor de cabeça já ao acordar']))
    F('w', 'Padrão de cefaleia que pede atenção', 'Dor ao acordar e/ou piora com manobra de Valsalva — avaliar necessidade de imagem.');
  if (cef.length >= 3 && A.cefaleiaDias && Number(A.cefaleiaDias) >= 15)
    F('w', 'Cefaleia em ' + A.cefaleiaDias + ' dias por mês', 'Padrão crônico — considerar profilaxia.');

  /* ---- 5. neuro-oftalmológico ------------------------------------------ */
  if (countOf(vis, ['Perda visual de um olho', 'Dor ao mover o olho']) === 2) {
    F('c', 'Perda visual monocular com dor ao movimentar o olho', 'Quadro compatível com neurite óptica — investigar causa desmielinizante.');
    explore.push('Neurite óptica: datar episódio, avaliar recuperação, solicitar RM de crânio/órbitas com contraste.');
  }
  if (anyOf(vis, ['Desmaio', 'Convulsão ou crise', 'Episódio de ausência ou apagão'])) {
    var ep = vis.filter(function (x) { return ['Desmaio','Convulsão ou crise','Episódio de ausência ou apagão'].indexOf(x) >= 0; });
    if (A.dirige === 'Sim' || A.dirige === 'Sim, profissionalmente') {
      F('c', 'Episódio de perda de consciência em paciente que dirige' +
        (A.dirige === 'Sim, profissionalmente' ? ' profissionalmente' : ''),
        ep.join(' · ') + '. Orientação de segurança e implicação legal para a direção.');
    } else {
      F('w', 'Episódio de perda de consciência ou crise', ep.join(' · '));
    }
    explore.push('Caracterizar o(s) episódio(s) paroxístico(s) com testemunha: pródromo, duração, abalos, liberação esfincteriana, pós-ictal.');
  }

  /* ---- 6. cognição ------------------------------------------------------ */
  if (mem.length) {
    var informante = inArr(mem, 'Familiares notaram algo antes de mim') ||
                     (A.quemPercebeu && A.quemPercebeu !== 'Eu mesmo');
    if (informante)
      F('w', 'Queixa cognitiva percebida primeiro por terceiros',
        (A.quemPercebeu ? 'Percebido por: ' + A.quemPercebeu + '. ' : '') + mem.join(' · '));
    else if (mem.length >= 3)
      F('i', 'Queixa cognitiva múltipla', mem.join(' · '));
    explore.push('Cognição: aplicar rastreio (MEEM/MoCA), colher história com informante e rastrear causas reversíveis (TSH, B12, D, função renal/hepática, sono, medicações).');
  }

  /* ---- 7. sono ---------------------------------------------------------- */
  if (countOf(son, ['Ronco alto', 'Paradas de respiração no sono (alguém relatou)', 'Sonolência durante o dia']) >= 2) {
    F('w', 'Rastreio positivo para apneia obstrutiva do sono', son.join(' · '));
    explore.push('Apneia do sono: aplicar Epworth/STOP-Bang e considerar polissonografia — impacta cefaleia, cognição e risco vascular.');
  }
  if (inArr(son, 'Falar ou agitar-se dormindo') && (Number(A.idade) >= 50 || anyOf(forca, ['Tremor','Rigidez ou lentidão dos movimentos'])))
    F('w', 'Possível transtorno comportamental do sono REM', 'Agitação durante o sono associada a sinais parkinsonianos ou idade acima de 50 — marcador prodrômico relevante.');
  if ((A.dirige === 'Sim' || A.dirige === 'Sim, profissionalmente') && inArr(son, 'Sonolência durante o dia'))
    F('w', 'Sonolência diurna em paciente que dirige', 'Orientar sobre risco ao volante.');

  /* ---- 8. quedas e marcha ---------------------------------------------- */
  if (inArr(forca, 'Quedas') && anyOf(forca, ['Dificuldade para andar', 'Perda de equilíbrio'])) {
    F('w', 'Risco de queda', 'Quedas associadas a alteração de marcha ou equilíbrio.');
    explore.push('Marcha e equilíbrio: avaliar risco de queda, revisar medicações sedativas e checar vitamina D / neuropatia.');
  }
  if (anyOf(forca, ['Tremor', 'Rigidez ou lentidão dos movimentos', 'Movimentos involuntários']))
    explore.push('Sinais extrapiramidais relatados — exame dirigido para parkinsonismo e revisão de fármacos bloqueadores dopaminérgicos.');

  /* ---- 9. medicações ---------------------------------------------------- */
  if (meds.length >= 5) F('w', 'Polifarmácia — ' + meds.length + ' medicamentos em uso', 'Revisar interações e iatrogenia.');
  if (A.alergias === 'Sim' && A.alergiasQuais) F('c', 'Alergia medicamentosa', A.alergiasQuais);
  if (!meds.length && !A.semMed) F('i', 'Lista de medicamentos não preenchida', 'Confirmar uso de medicações na consulta.');

  /* ---- 10. risco vascular ----------------------------------------------- */
  var vasc = countOf(doe, ['Pressão alta','Diabetes','Colesterol alto','Doença cardíaca','AVC ou isquemia','Obesidade']) +
             (A.tabaco === 'Fumo atualmente' ? 1 : 0);
  if (vasc >= 3) {
    F('w', 'Perfil de risco cerebrovascular elevado',
      clean(doe).filter(function (d) { return ['Pressão alta','Diabetes','Colesterol alto','Doença cardíaca','AVC ou isquemia','Obesidade'].indexOf(d) >= 0; })
        .concat(A.tabaco === 'Fumo atualmente' ? ['Tabagismo ativo'] : []).join(' · '));
    explore.push('Fatores de risco vascular somados — alinhar prevenção secundária e metas (PA, LDL, HbA1c, tabagismo).');
  }
  if (inArr(doe, 'Esclerose múltipla ou desmielinizante'))
    F('i', 'Doença desmielinizante já diagnosticada', 'Levantar tratamento atual, última RM e histórico de surtos.');

  /* ---- 11. jornada e decisão -------------------------------------------- */
  if (A.outrosProf === 'Sim' && Number(A.outrosQtd) >= 3)
    F('i', 'Peregrinação diagnóstica — ' + A.outrosQtd + ' profissionais consultados',
      (A.outrosEsp ? 'Especialidades: ' + A.outrosEsp + '. ' : '') +
      'Paciente com histórico de busca prolongada: nomear o que já foi descartado costuma ser terapêutico.');
  if ((A.tempoConvive === 'Mais de 5 anos' || A.tempoConvive === '1 a 5 anos') && inArr(A.expectativa, 'Uma segunda opinião'))
    F('i', 'Vem em busca de segunda opinião', 'Trazer laudos anteriores e explicitar concordâncias e divergências.');
  if (typeof A.prontidao === 'number' && A.prontidao <= 4)
    F('w', 'Baixa prontidão para iniciar tratamento (' + A.prontidao + '/10)',
      (A.prontidaoSubir ? 'O que faria subir: ' + A.prontidaoSubir : 'Alinhar expectativa antes de propor plano longo.'));
  if (A.decideCom && A.decideCom !== 'Só eu')
    F('i', 'Decisão compartilhada', 'Decide com: ' + A.decideCom +
      (A.decidePresente ? ' — presença na consulta: ' + A.decidePresente : ''));
  if (A.quemPreenche === 'Acompanhante ou familiar')
    F('i', 'Ficha preenchida por acompanhante', A.acompanhante || '');

  /* ---- 12. nada marcado -------------------------------------------------- */
  if (!alerta.length && !cef.length && !forca.length && !vis.length && !mem.length && !son.length)
    F('i', 'Rastreio neurológico sem sintomas assinalados', 'Nenhum item marcado nos seis domínios de rastreio.');

  /* ---- roteiro genérico -------------------------------------------------- */
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

  secs.push({ title:'Rastreio neurológico por domínio', items:[
    tags('Sinais de alerta', alerta, true),
    tags('Cefaleia', cef.concat(A.cefaleiaDias ? [A.cefaleiaDias + ' dias/mês'] : [])
        .concat(A.cefaleiaRemedio ? ['Usa: ' + A.cefaleiaRemedio] : [])),
    tags('Força, sensibilidade e equilíbrio', forca),
    tags('Visão, fala e episódios súbitos', vis),
    tags('Memória e comportamento', mem.concat(A.quemPercebeu ? ['Percebido por: ' + A.quemPercebeu] : [])),
    tags('Sono e disautonomia', son)
  ]});

  secs.push({ title:'Histórico de saúde', items:[
    tags('Comorbidades', doe.concat(A.doencasOutras ? [A.doencasOutras] : [])),
    kv('Alergias', A.alergias === 'Sim' ? (A.alergiasQuais || 'Sim') : A.alergias),
    free('Cirurgias e internações', A.cirurgias),
    tags('Exames já realizados', exa.concat(A.examesObs ? [A.examesObs] : [])),
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

  secs.push({ title:'Hábitos e rotina', items:[
    kv('Sono por noite', A.horasSono),
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

  var phRows = [];
  if (A.ph) {
    var phNames = ['Interesse/prazer','Humor deprimido','Sono','Energia','Apetite',
      'Autoimagem','Concentração','Lentidão/agitação','Ideação de autolesão ou morte'];
    for (var i = 1; i <= 9; i++) {
      var k2 = 'ph' + i;
      if (typeof A.ph[k2] === 'number')
        phRows.push([i + '. ' + phNames[i-1], PHQ_LABELS[A.ph[k2]] + ' (' + A.ph[k2] + ')']);
    }
  }
  secs.push({ title:'Rastreio emocional — PHQ-9', items:[
    kv('Pontuação total', phq.n ? phq.sum + ' / 27 — ' + phqBand(phq.sum) : ''),
    kv('Item 9 (autolesão / morte)', phq.item9 == null ? '' :
        (phq.item9 > 0 ? 'POSITIVO — ' + PHQ_LABELS[phq.item9] : 'Negativo')),
    kv('Dificuldade no dia a dia', A.ph10),
    phRows.length ? { t:'table', head:['Item','Resposta'], rows:phRows } : null
  ]});

  secs.push({ title:'O que está em jogo', items:[
    tags('Deixou de fazer', deixou.concat(A.deixouFazer_o ? [A.deixouFazer_o] : [])),
    kv('Dias perdidos em 3 meses', A.diasPerdidos),
    kv('Há quanto tempo busca resposta', A.tempoBusca),
    tags('Recursos já investidos', clean(A.recursos)),
    kv('Quem mais é afetado', join(A.afetados) + (A.afetadosComo ? ' — ' + A.afetadosComo : '')),
    free('Como imagina a vida em 1 ano', A.imagina),
    kv('Prontidão para tratar', typeof A.prontidao === 'number' ? A.prontidao + ' / 10' : ''),
    kv('O que faria esse número subir', A.prontidaoSubir),
    kv('Condução preferida', A.conducao),
    kv('Decide com', (A.decideCom || A.decideCom_o || '') +
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

  return {
    nome: A.nome || 'Paciente sem nome',
    idade: A.idade || '',
    tel: A.tel || '',
    email: A.email || '',
    data: new Date().toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' }),
    flags: flags, crit: crit, warn: warn,
    explore: explore,
    scores: [
      { l:'Impacto (SF-36)', n: sf.pct != null ? sf.pct + '%' : '—', d: sfBand(sf.pct) || 'não respondido',
        alert: sf.pct != null && sf.pct >= 61 },
      { l:'PHQ-9', n: phq.n ? phq.sum + '/27' : '—', d: phq.n ? phqBand(phq.sum) : 'não respondido',
        alert: phq.n && phq.sum >= 15 },
      { l:'Item 9 do PHQ-9', n: phq.item9 == null ? '—' : (phq.item9 > 0 ? 'POSITIVO' : 'Negativo'),
        d: phq.item9 > 0 ? 'avaliar risco' : 'sem ideação relatada', alert: phq.item9 > 0 },
      { l:'Prontidão', n: typeof A.prontidao === 'number' ? A.prontidao + '/10' : '—',
        d: A.conducao || 'condução não definida', alert: typeof A.prontidao === 'number' && A.prontidao <= 4 }
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
         '<div style="font-size:19px;color:' + nc + ';font-weight:bold;margin:3px 0">' + esc(s.n) + '</div>' +
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
   para o Dr. Carlos (e-mail + WhatsApp).
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
    'e decidir o seu plano de cuidado — e não para preencher papel.</p>' +
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
  return 'Pré-consulta ' + tag + '· ' + S.nome + (S.idade ? ', ' + S.idade + 'a' : '');
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
      phq9: SUM.scores[1].n, phq9item9: SUM.scores[2].n, impacto: SUM.scores[0].n,
      prontidao: SUM.scores[3].n, conducao: A.conducao || ''
    }
  };

  if (!CFG.endpointUrl) {
    // Robô ainda não configurado: guarda a ficha e avisa. Não expõe o resumo.
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
      // ficha entregue: limpa o rascunho para o próximo paciente
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
  // rodapé com os dados do consultório
  $('#fName').textContent  = CFG.doctorName || '';
  $('#fT1').textContent    = CFG.doctorTitle1 || '';
  $('#fT2').textContent    = CFG.doctorTitle2 || '';
  $('#fAddr').textContent  = CFG.address || '';
  $('#fPhones').textContent = CFG.phones || '';

  load();

  // pré-preenchimento por link: ?nome=Fulano&tel=32999999999
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

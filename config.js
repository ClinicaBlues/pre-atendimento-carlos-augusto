/* ============================================================================
   DR. CARLOS AUGUSTO DE ALBUQUERQUE DAMASCENO — Neurologia Clínica
   FICHA DE PRÉ-ATENDIMENTO ONLINE — Arquivo de configuração
   ----------------------------------------------------------------------------
   Este é o ÚNICO arquivo que precisa ser editado no dia a dia.
   Altere apenas o que está entre aspas.
   ========================================================================== */

window.FICHA_CONFIG = {

  /* --------------------------------------------------------------------------
     1) PARA ONDE VAI A FICHA
     --------------------------------------------------------------------------
     O resumo e o PDF vão APENAS para o Dr. Carlos — por e-mail e por WhatsApp.
     O paciente não vê o resumo em momento algum: ele só recebe a confirmação
     de que o pré-atendimento foi concluído.

     Os destinos (e-mail e WhatsApp) ficam guardados dentro do robô
     (apps-script/Code.gs), e não aqui, por segurança.
     -------------------------------------------------------------------------- */

  // URL do robô que envia o e-mail + WhatsApp e guarda a ficha na planilha.
  // (Google Apps Script — instruções em LEIA-ME.md)
  // ATENÇÃO: sem esta URL o envio automático não acontece.
  endpointUrl: "https://script.google.com/macros/s/AKfycbxzBxa-KPv0aL7SKlzfJLLACLkW13rQfL82kPhk4Nare_nzzrgdDFDzQ5QlFIpVfNXV2A/exec",

  // Senha simples que o site usa para falar com o robô.
  // Precisa ser IGUAL à constante WRITE_KEY dentro do Code.gs.
  writeKey: "carlos-neuro-2026",

  /* --------------------------------------------------------------------------
     2) CONSULTÓRIO (aparece no rodapé da página e no PDF)
     -------------------------------------------------------------------------- */

  doctorName: "Dr. Carlos Augusto de Albuquerque Damasceno",
  doctorTitle1: "Neurologista Coordenador do Centro de Esclerose Múltipla do Hospital Universitário da UFJF",
  doctorTitle2: "Membro da Academia Brasileira de Neurologia",
  address: "Av. Rio Branco, 2985 — sala 1405 — Juiz de Fora / MG",
  phones: "(32) 3237.9002 · 99103.4019 · 98841.5761",

  // Telefone que o paciente usa para falar com a recepção, se tiver algum
  // problema no envio. Só dígitos: 55 + DDD + número.
  supportWhatsapp: "5532991034019",

  // Link da política de privacidade (LGPD). Deixe "" se não houver.
  privacyUrl: ""
};

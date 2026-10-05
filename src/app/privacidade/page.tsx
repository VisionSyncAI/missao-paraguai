import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { PRIVACY_VERSION } from "@/modules/leads/status";

export const metadata = {
  title: "Política de Privacidade | PROVISION — Imersão Sem Fronteiras",
  description: "Como a PROVISION trata os dados pessoais em missaoparaguai.com, no atendimento e na imersão.",
  alternates: { canonical: "/privacidade" },
};

const WHATSAPP = "https://wa.me/5551997164254";

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1 pl-5">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

function Table({ headers, rows }: { headers: [string, string, string]; rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left text-[14px]">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-white/20 py-2 pr-4 font-medium text-[#c9a96a]">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className="border-b border-white/10 py-3 pr-4 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Describes the treatment the product actually performs: captureInterest, consents,
 *  ip_lead / ip_participant cookies, localStorage, hashed IP, anonymous funnel events. */
export default function PrivacidadePage() {
  return (
    <LegalPage
      kicker="Política de Privacidade"
      title="Política de Privacidade"
      version={PRIVACY_VERSION}
    >
      <p>
        Esta política explica como a PROVISION — Imersão Sem Fronteiras trata dados pessoais em missaoparaguai.com, no atendimento comercial e, quando há contratação, na execução da imersão de 16 a 21 de novembro de 2026.
      </p>
      <p>
        O tratamento observa a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD) e as resoluções da Autoridade Nacional de Proteção de Dados (ANPD) aplicáveis.
      </p>

      <LegalSection title="1. Quem trata os dados">
        <p>
          A PROVISION é realizada pela PROCEIT, organizadora no Paraguai, e pela Vision Cybero AI, organizadora no Brasil. Para os dados coletados neste site e usados no atendimento, na contratação e na execução da imersão, as duas organizadoras definem juntas as finalidades do tratamento e atuam como controladoras.
        </p>
        <p>
          A Vision Cybero AI opera o site, o CRM e as comunicações digitais. A PROCEIT recebe os dados necessários para organizar a experiência em Asunción: agenda, encontros, deslocamentos e a recepção no território.
        </p>
        <p>
          A razão social e o CNPJ constam do contrato de participação. Quem pedir pelo canal desta política recebe essa identificação.
        </p>
        <p>
          O contato para direitos do titular e para assuntos de privacidade é o WhatsApp{" "}
          <a className="text-white underline underline-offset-4" href={WHATSAPP} target="_blank" rel="noopener noreferrer">+55 51 99716-4254</a>.
          Esse é o canal público das organizadoras, inclusive para a comunicação prevista na Resolução CD/ANPD nº 2/2022.
        </p>
      </LegalSection>

      <LegalSection title="2. A quem esta política se aplica">
        <p>Aplica-se a quem visita o site, envia uma manifestação de interesse, agenda uma conversa, baixa a apresentação executiva, contrata a participação ou usa a área do participante.</p>
        <p>O envio do formulário registra o interesse. A vaga e a relação contratual nascem do contrato assinado e do pagamento, nos termos publicados em /termos.</p>
      </LegalSection>

      <LegalSection title="3. Quais dados tratamos">
        <p><b>3.1. Manifestação de interesse.</b> O formulário pede nome, empresa, cargo, WhatsApp, e-mail, o que a empresa está avaliando no Paraguai e o aceite desta política, dos Termos de Participação e do contato. Se você tiver respondido o diagnóstico ou a pergunta “Antes de decidir” na home, essas respostas entram no mesmo registro.</p>
        <p>O sistema também guarda a origem da visita, os parâmetros de campanha (UTM), a versão dos documentos aceitos, um resumo criptográfico (hash SHA-256) do endereço IP e a identificação do navegador, limitada a 240 caracteres. O endereço IP em claro fica só no momento do envio, para limitar abusos. O CRM ainda calcula um score interno de atendimento a partir do que foi informado.</p>
        <p><b>3.2. Conversa e apresentação.</b> Data, horário e consultor da reunião, e o registro de que a apresentação executiva foi baixada.</p>
        <p><b>3.3. Contratação.</b> Quando a empresa decide participar, passam a ser tratados os dados do contrato e do pagamento: condição comercial, valores, status do pedido e a referência do meio de pagamento. O número completo de cartão não é armazenado neste site. O pagamento ocorre por PIX, transferência, cartão ou link, sempre no canal oficial informado pela organização.</p>
        <p>CPF, quando exigido nessa etapa, é guardado como hash e últimos quatro dígitos. O CNPJ da empresa contratante fica restrito aos papéis administrativo e financeiro.</p>
        <p><b>3.4. Execução da imersão.</b> Na área do participante podem ser tratados notas de chegada e saída, interesses de networking, documentos enviados para a operação (com nome do arquivo e status) e observações de alimentação. A ficha alimentar é opcional. Quando a observação revelar dado de saúde, o uso fica limitado às refeições e à logística da edição.</p>
        <p><b>3.5. Uso do site.</b> Eventos de navegação do funil — por exemplo, etapa do formulário ou clique no mapa — são gravados sem nome, e-mail ou telefone. Podem incluir a página, a etapa e os parâmetros de campanha.</p>
        <p>O formulário de interesse não pede dado pessoal sensível como condição de envio. A experiência é dirigida a representantes de empresas.</p>
      </LegalSection>

      <LegalSection title="4. Finalidades e bases legais">
        <p>Cada finalidade usa a hipótese do art. 7º da LGPD que a sustenta. O aceite do formulário comprova a ciência desta política e a autorização de contato. Ele não é a base de todo o tratamento.</p>
        <Table
          headers={["Finalidade", "O que sustenta", "Base legal"]}
          rows={[
            ["Atender o interesse, devolver a apresentação e marcar a conversa com um consultor", "Pedido feito no formulário", "Art. 7º, V — procedimentos preliminares a pedido do titular"],
            ["Comunicar a pré-inscrição, a reunião, o contrato e a operação da edição", "E-mail, telefone e WhatsApp informados", "Art. 7º, V; o aceite de contato registrado no envio"],
            ["Guardar o aceite, a versão dos documentos, o hash do IP e o navegador", "Prova do registro feito no envio", "Art. 7º, II — o art. 8º, §2º, exige que o controlador possa demonstrar o aceite"],
            ["Executar o contrato: credencial, hotel, alimentação, traslados, agenda e encontros", "Contrato assinado", "Art. 7º, V — execução de contrato"],
            ["Receber o pagamento e manter o registro financeiro", "Pedido e comprovação do pagamento", "Art. 7º, V e art. 7º, II"],
            ["Priorizar o atendimento com score interno", "Dados que o próprio interessado enviou", "Art. 7º, IX — legítimo interesse, limitado ao atendimento comercial"],
            ["Evitar envios abusivos e proteger o site", "Endereço IP usado de forma transitória", "Art. 7º, IX"],
            ["Medir o funil sem identificar a pessoa", "Evento, página e campanha", "Art. 7º, IX"],
            ["Usar observação alimentar ou de acessibilidade na operação", "Informação opcional da ficha", "Art. 7º, V; se revelar saúde, art. 11, I, pelo fornecimento para essa finalidade"],
            ["Defender a organização em um processo", "Registros da relação", "Art. 7º, VI — exercício regular de direitos"],
          ]}
        />
      </LegalSection>

      <LegalSection title="5. CRM, score e área do participante">
        <p>O registro comercial fica no CRM das organizadoras, com acesso limitado a quem atende, opera ou responde pela parte financeira. O score interno orienta a ordem e o contexto da conversa. Ele não recusa uma participação, não gera crédito e não é uma decisão tomada só por tratamento automatizado (art. 20).</p>
        <p>Depois da contratação, a área do participante mostra os dados da inscrição, a agenda da edição, os documentos e as reuniões já marcadas com a organização. O painel interno da equipe não é exibido ao participante.</p>
      </LegalSection>

      <LegalSection title="6. Cookies e o que fica no navegador">
        <p>O site não usa cookie de publicidade nem pixel de rede social. Os cookies abaixo são estritamente necessários para continuar um fluxo que você iniciou ou para a sessão de quem opera o sistema.</p>
        <Table
          headers={["Armazenamento", "Para que serve", "Por quanto tempo"]}
          rows={[
            ["Cookie ip_lead", "Continuar a inscrição e o agendamento depois do envio, sem preencher de novo", "Até 7 dias. HttpOnly"],
            ["Cookie ip_participant", "Manter o acesso à área do participante", "Até 14 dias. HttpOnly"],
            ["Cookie ip_staff", "Sessão da equipe no painel interno", "Até 12 horas. HttpOnly"],
            ["provision.diagnosis", "Guardar o diagnóstico na home até personalizar a página", "Até você limpar os dados do site"],
            ["provision.decision", "Guardar a resposta “Antes de decidir”", "Apagada do navegador quando o formulário é enviado"],
          ]}
        />
        <p>Em produção os cookies de sessão usam o sinalizador Secure e SameSite Lax. O identificador de acesso do lead e do participante é guardado no servidor apenas como hash.</p>
      </LegalSection>

      <LegalSection title="7. Com quem os dados são compartilhados">
        <p>O compartilhamento se limita ao que a finalidade exige. As organizadoras não vendem dados pessoais.</p>
        <List
          items={[
            "PROCEIT e Vision Cybero AI, na extensão da controladoria conjunta descrita nesta política.",
            "Consultores que conduzem a conversa e a operação da edição.",
            "Hospedagem e banco de dados da aplicação (Railway), onde o site e o CRM rodam em produção.",
            "Envio de e-mail transacional (Resend), para a confirmação da pré-inscrição, a reunião e os avisos operacionais.",
            "Serviço de agenda configurado pela organização, que recebe nome, e-mail, telefone e horário para criar a conversa.",
            "Contador de limite de envios, em memória do servidor ou em Redis, apenas com o endereço IP e pelo tempo da janela de bloqueio.",
            "WhatsApp, quando você escreve para o número oficial ou quando a equipe responde no contato que você autorizou.",
            "Meio de pagamento oficial, na hora de pagar, sem que este site guarde o número do cartão.",
            "Hotel, traslado, alimentação e demais fornecedores da edição, depois da contratação, com o mínimo necessário para prestar o serviço.",
            "Interlocutor de um encontro marcado, com nome, empresa e o assunto da conversa, para que o encontro aconteça.",
          ]}
        />
        <p>A lista de convidados do Business Day e os setores desses convidados só são compartilhados na medida em que a organização confirmar o encontro. O CRM não é repassado a empresas visitadas como mala direta.</p>
      </LegalSection>

      <LegalSection title="8. Transferência internacional">
        <p>
          A imersão ocorre em Asunción. Dados operacionais da participação podem ser tratados no Paraguai pela PROCEIT e por fornecedores locais da edição, para hotel, transporte, alimentação, agenda institucional e encontros.
        </p>
        <p>
          A aplicação, o banco e o envio de e-mail podem estar fora do Brasil, conforme a região do Railway e da Resend. O serviço de agenda segue a região do provedor configurado. Essas transferências observam o art. 33 da LGPD e a Resolução CD/ANPD nº 19/2024. O mecanismo usado com cada fornecedor, em especial cláusulas contratuais, pode ser informado pelo canal desta política.
        </p>
      </LegalSection>

      <LegalSection title="9. Por quanto tempo os dados ficam">
        <p>O dado é mantido pelo tempo da finalidade e das hipóteses legais de conservação. Os prazos abaixo são os adotados por esta versão.</p>
        <Table
          headers={["Categoria", "Prazo", "Depois disso"]}
          rows={[
            ["Interesse sem contratação", "24 meses após o último contato", "Eliminação ou anonimização do cadastro comercial"],
            ["Aceites, hash de IP e navegador", "O mesmo prazo do registro que eles comprovam", "Eliminados com esse registro, salvo obrigação de guarda"],
            ["Contrato, pedido e pagamento", "5 anos após o fim da edição", "Guarda para obrigações civis e fiscais e para exercício de direitos"],
            ["Documentos enviados na área do participante", "Até 12 meses após o fim da edição", "Eliminação, salvo disputa ou dever legal"],
            ["Alimentação, chegada, saída e networking da ficha", "Até 12 meses após o fim da edição", "Eliminação com o encerramento operacional"],
            ["Eventos de funil sem identificação", "12 meses", "Eliminação"],
            ["Contador de limite de envios", "A janela de bloqueio, em minutos", "Descarte automático"],
            ["Fila de e-mail", "Até a entrega e a comprovação do envio daquele aviso", "Alinhado ao prazo do atendimento correspondente"],
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Segurança">
        <p>As medidas acompanham o risco desta operação:</p>
        <List
          items={[
            "acesso ao CRM por papel, com credenciais guardadas como hash;",
            "cookies de sessão HttpOnly e, em produção, Secure;",
            "token de acesso do interessado e do participante armazenado como hash;",
            "CPF, quando coletado, armazenado como hash e últimos quatro dígitos;",
            "IP do aceite armazenado como hash, não em claro;",
            "limite de envios por endereço IP;",
            "segredos e chaves fora do código publicado no site;",
            "registro de ações sensíveis da equipe em trilha de auditoria.",
          ]}
        />
        <p>Nenhuma medida elimina o risco por completo. Se um incidente puder acarretar risco ou dano relevante, a comunicação à ANPD e aos titulares seguirá o art. 48 da LGPD.</p>
      </LegalSection>

      <LegalSection title="11. Direitos de quem é titular">
        <p>Você pode pedir, conforme o art. 18 da LGPD e na medida em que a hipótese se aplique ao seu caso:</p>
        <List
          items={[
            "confirmação de que tratamos dados seus e acesso a eles;",
            "correção de dado incompleto, inexato ou desatualizado;",
            "anonimização, bloqueio ou eliminação de dado desnecessário, excessivo ou tratado em desconformidade;",
            "portabilidade, observados os requisitos da ANPD;",
            "eliminação dos dados tratados com base no consentimento;",
            "informação sobre as entidades com as quais compartilhamos dados;",
            "informação sobre a possibilidade de não fornecer o consentimento e sobre as consequências da negativa;",
            "revogação do consentimento;",
            "oposição a tratamento fundado em legítimo interesse, quando houver excesso;",
            "revisão de decisão tomada unicamente com base em tratamento automatizado, se algum dia existir.",
          ]}
        />
        <p>A eliminação não alcança o que a lei manda conservar, como o registro financeiro da contratação e a prova do aceite enquanto o tratamento correspondente existir.</p>
      </LegalSection>

      <LegalSection title="12. Como pedir">
        <p>
          Envie o pedido pelo WhatsApp{" "}
          <a className="text-white underline underline-offset-4" href={WHATSAPP} target="_blank" rel="noopener noreferrer">+55 51 99716-4254</a>,
          informando nome e e-mail usados na PROVISION e o direito que deseja exercer. Podemos pedir uma confirmação de identidade antes de mostrar ou alterar o registro, para evitar que outra pessoa acesse os seus dados.
        </p>
        <p>
          A resposta sai em formato claro. Quando a lei permitir o prazo, ela ocorre em até 15 dias, na forma do art. 19 da LGPD. Se o pedido for recusado, a resposta traz o motivo. Você também pode peticionar à ANPD.
        </p>
        <p>Revogar o aceite de contato interrompe as mensagens comerciais. Não apaga, por si, o registro de uma contratação já firmada nem a prova do aceite anterior.</p>
      </LegalSection>

      <LegalSection title="13. Crianças e adolescentes">
        <p>O site e a imersão destinam-se a representantes de empresas. Não há cadastro consciente de criança ou adolescente. Se um dado assim for identificado, ele é eliminado e o tratamento, se algum dia for necessário, só segue com a base específica do art. 14 da LGPD.</p>
      </LegalSection>

      <LegalSection title="14. Atualização desta política">
        <p>
          Quando a operação, um fornecedor ou a lei mudar o tratamento, esta página é republicada com nova versão. A versão vigente é {PRIVACY_VERSION}. O aceite guardado no CRM permanece vinculado à versão que estava publicada no momento do envio.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

// Função melhorada para fechar caixa com relatório detalhado e envio automático
function fecharCaixa() {
  // Obter dados de vendas e estoque
  let totalLucro = parseFloat(document.getElementById("totalLucro").innerText);
  let totalProdutosVendidos = parseInt(document.getElementById("totalProdutosVendidos").innerText);
  let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
  let estoque = JSON.parse(localStorage.getItem('produtos')) || [];
  
  // Obter data e hora atual
  const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
  const horaFormatada = dataAtual.toLocaleTimeString('pt-BR');
  const timestamp = dataAtual.getTime();
  
  // Contar vendas do dia
  const hoje = dataAtual.toLocaleDateString();
  let vendasHoje = vendas.filter(v => 
      new Date(v.data).toLocaleDateString() === hoje
  );
  
  // Calcular estatísticas
  let totalVendidoHoje = 0;
  let totalLucroHoje = 0;
  let produtosMaisVendidos = {};
  
  vendasHoje.forEach(venda => {
      totalVendidoHoje += venda.total;
      totalLucroHoje += venda.lucro;
      
      venda.itens.forEach(item => {
          if (!produtosMaisVendidos[item.nome]) {
              produtosMaisVendidos[item.nome] = {
                  quantidade: 0,
                  valorTotal: 0
              };
          }
          produtosMaisVendidos[item.nome].quantidade += item.quantidade;
          produtosMaisVendidos[item.nome].valorTotal += item.valorTotal;
      });
  });
  
  // Converter para array e ordenar produtos mais vendidos
  let produtosArray = Object.keys(produtosMaisVendidos).map(nome => ({
      nome,
      quantidade: produtosMaisVendidos[nome].quantidade,
      valorTotal: produtosMaisVendidos[nome].valorTotal
  }));
  
  produtosArray.sort((a, b) => b.quantidade - a.quantidade);
  
  // Criar relatório em formato HTML para facilitar a leitura
  let relatorioHTML = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Relatório de Caixa - ${dataFormatada}</title>
      <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .total { font-weight: bold; }
          .section { margin-bottom: 30px; }
      </style>
  </head>
  <body>
      <h1>Relatório de Fechamento de Caixa</h1>
      <p><strong>Data:</strong> ${dataFormatada}</p>
      <p><strong>Hora:</strong> ${horaFormatada}</p>
      
      <div class="section">
          <h2>Resumo de Vendas</h2>
          <table>
              <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
              </tr>
              <tr>
                  <td>Total de vendas hoje</td>
                  <td>${vendasHoje.length}</td>
              </tr>
              <tr>
                  <td>Produtos vendidos hoje</td>
                  <td>${totalProdutosVendidos}</td>
              </tr>
              <tr>
                  <td>Valor total vendido hoje</td>
                  <td>R$ ${totalVendidoHoje.toFixed(2)}</td>
              </tr>
              <tr class="total">
                  <td>Lucro total</td>
                  <td>R$ ${totalLucroHoje.toFixed(2)}</td>
              </tr>
          </table>
      </div>
      
      <div class="section">
          <h2>Produtos Mais Vendidos</h2>
          <table>
              <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor Total</th>
              </tr>
              ${produtosArray.map(p => `
              <tr>
                  <td>${p.nome}</td>
                  <td>${p.quantidade}</td>
                  <td>R$ ${p.valorTotal.toFixed(2)}</td>
              </tr>
              `).join('')}
          </table>
      </div>
      
      <div class="section">
          <h2>Estoque Atual</h2>
          <table>
              <tr>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Preço Custo</th>
                  <th>Preço Venda</th>
                  <th>Valor em Estoque</th>
              </tr>
              ${estoque.map(p => `
              <tr>
                  <td>${p.nome}</td>
                  <td>${p.tipo}</td>
                  <td>${p.quantidade}</td>
                  <td>R$ ${p.custo.toFixed(2)}</td>
                  <td>R$ ${p.venda.toFixed(2)}</td>
                  <td>R$ ${(p.quantidade * p.venda).toFixed(2)}</td>
              </tr>
              `).join('')}
          </table>
      </div>
      
      <div class="section">
          <h2>Histórico de Vendas de Hoje</h2>
          <table>
              <tr>
                  <th>Hora</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor</th>
              </tr>
              ${vendasHoje.flatMap(venda => 
                  venda.itens.map(item => `
                  <tr>
                      <td>${new Date(venda.data).toLocaleTimeString('pt-BR')}</td>
                      <td>${item.nome}</td>
                      <td>${item.quantidade}</td>
                      <td>R$ ${item.valorTotal.toFixed(2)}</td>
                  </tr>
                  `)
              ).join('')}
          </table>
      </div>
  </body>
  </html>`;
  
  // Versão simplificada para texto (para WhatsApp)
  let relatorioTexto = `*FECHAMENTO DE CAIXA - ${dataFormatada}*\n`;
  relatorioTexto += `*Hora:* ${horaFormatada}\n\n`;
  relatorioTexto += `*RESUMO:*\n`;
  relatorioTexto += `- Vendas hoje: ${vendasHoje.length}\n`;
  relatorioTexto += `- Produtos vendidos: ${totalProdutosVendidos}\n`;
  relatorioTexto += `- Total vendido: R$ ${totalVendidoHoje.toFixed(2)}\n`;
  relatorioTexto += `- Lucro total: R$ ${totalLucroHoje.toFixed(2)}\n\n`;
  relatorioTexto += `*TOP 5 PRODUTOS:*\n`;
  
  // Adicionar top 5 produtos
  produtosArray.slice(0, 5).forEach((p, index) => {
      relatorioTexto += `${index + 1}. ${p.nome}: ${p.quantidade} unid - R$ ${p.valorTotal.toFixed(2)}\n`;
  });
  
  // Salvar relatório em arquivo
  const blob = new Blob([relatorioHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Criar elemento de link para download
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_caixa_${dataFormatada.replace(/\//g, '-')}_${timestamp}.html`;
  
  // Função para enviar por email usando EmailJS
  function enviarPorEmail() {
      // Verificar se EmailJS está carregado
      if (typeof emailjs !== 'undefined') {
          // Preparar dados para envio
          var templateParams = {
              to_email: 'mtz.martinss@gmail.com',
              subject: `Relatório de Caixa - ${dataFormatada}`,
              message: relatorioTexto,
              attachment: blob
          };
          
          // Enviar email
          emailjs.send('service_id', 'template_id', templateParams)
              .then(function(response) {
                  mostrarMensagem('Relatório enviado por email com sucesso!', 'sucesso');
              }, function(error) {
                  mostrarMensagem('Erro ao enviar email: ' + error, 'erro');
                  // Fallback: download do arquivo
                  a.click();
              });
      } else {
          // Fallback: download do arquivo se EmailJS não estiver disponível
          mostrarMensagem('EmailJS não disponível. Fazendo download do relatório...', 'info');
          a.click();
      }
  }
  
  // Função para enviar por WhatsApp
  function enviarPorWhatsApp() {
      // Codificar mensagem para URL
      const mensagemCodificada = encodeURIComponent(relatorioTexto);
      // Criar link do WhatsApp
      const whatsappURL = `https://wa.me/5511963822159?text=${mensagemCodificada}`;
      // Abrir WhatsApp em nova aba
      window.open(whatsappURL, '_blank');
  }
  
  // Mostrar opções de envio
  const confirmacao = confirm(
      `Relatório de caixa gerado com sucesso!\n\n` +
      `Resumo:\n` +
      `- Vendas hoje: ${vendasHoje.length}\n` +
      `- Lucro total: R$ ${totalLucroHoje.toFixed(2)}\n\n` +
      `Como deseja receber o relatório?`
  );
  
  if (confirmacao) {
      // Criar modal para opções de envio
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal-envio';
      modalDiv.innerHTML = `
          <div class="modal-conteudo">
              <h3>Enviar Relatório</h3>
              <p>Escolha como deseja receber o relatório:</p>
              <button id="btn-email" class="btn-modal">Enviar por Email</button>
              <button id="btn-whatsapp" class="btn-modal">Enviar por WhatsApp</button>
              <button id="btn-download" class="btn-modal">Apenas Download</button>
              <button id="btn-cancelar" class="btn-modal">Cancelar</button>
          </div>
      `;
      document.body.appendChild(modalDiv);
      
      // Adicionar CSS para o modal
      const style = document.createElement('style');
      style.textContent = `
          .modal-envio {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0,0,0,0.7);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
          }
          .modal-conteudo {
              background-color: white;
              padding: 30px;
              border-radius: 8px;
              max-width: 500px;
              width: 80%;
              text-align: center;
          }
          .btn-modal {
              display: block;
              width: 100%;
              padding: 12px;
              margin: 10px 0;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
          }
          #btn-email {
              background-color: #4285F4;
              color: white;
          }
          #btn-whatsapp {
              background-color: #25D366;
              color: white;
          }
          #btn-download {
              background-color: #FF5722;
              color: white;
          }
          #btn-cancelar {
              background-color: #ccc;
          }
      `;
      document.head.appendChild(style);
      
      // Adicionar event listeners
      document.getElementById('btn-email').addEventListener('click', function() {
          enviarPorEmail();
          document.body.removeChild(modalDiv);
      });
      
      document.getElementById('btn-whatsapp').addEventListener('click', function() {
          enviarPorWhatsApp();
          document.body.removeChild(modalDiv);
      });
      
      document.getElementById('btn-download').addEventListener('click', function() {
          a.click();
          document.body.removeChild(modalDiv);
      });
      
      document.getElementById('btn-cancelar').addEventListener('click', function() {
          document.body.removeChild(modalDiv);
      });
      
      // Adicionar script EmailJS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      document.head.appendChild(script);
  } else {
      // Fazer download direto
      a.click();
  }
  
  // Limpar URL após download
  setTimeout(() => {
      URL.revokeObjectURL(url);
  }, 1000);
  
  // Perguntar se deseja limpar vendas
  if (confirm("Deseja limpar os dados de vendas de hoje?")) {
      // Filtrar apenas vendas que não são de hoje
      const vendasAnteriores = vendas.filter(v => 
          new Date(v.data).toLocaleDateString() !== hoje
      );
      
      localStorage.setItem('vendas', JSON.stringify(vendasAnteriores));
      document.getElementById("vendas-lista").innerHTML = '';
      document.getElementById("totalLucro").innerText = "0.00";
      document.getElementById("totalProdutosVendidos").innerText = "0";
      mostrarMensagem("Vendas de hoje foram limpas", "sucesso");
  }
  
  // Opção para implementação de banco de dados real
  // Aqui seria o ponto de integração com um serviço de banco de dados
  salvarRelatorioEmBancoDeDados(relatorioHTML, relatorioTexto, timestamp);
  
  return true;
}

// Função para salvar relatório em banco de dados (simulação)
function salvarRelatorioEmBancoDeDados(relatorioHTML, relatorioTexto, timestamp) {
  // Simular salvamento no banco de dados
  console.log("Salvando relatório no banco de dados...");
  
  // Aqui você implementaria a conexão com um banco de dados real
  // Por enquanto, vamos apenas salvar no localStorage como histórico
  
  let historicoRelatorios = JSON.parse(localStorage.getItem('historicoRelatorios')) || [];
  
  // Adicionar novo relatório ao histórico
  historicoRelatorios.push({
      id: timestamp,
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR'),
      resumo: relatorioTexto.substring(0, 200) + "...", // Apenas um resumo
      tamanho: relatorioHTML.length
  });
  
  // Limitar número de registros salvos no histórico (opcional)
  if (historicoRelatorios.length > 50) {
      historicoRelatorios = historicoRelatorios.slice(-50);
  }
  
  // Salvar histórico atualizado
  localStorage.setItem('historicoRelatorios', JSON.stringify(historicoRelatorios));
  
  // Em uma implementação real, você enviaria os dados para:
  // 1. Um serviço de backend (API REST, por exemplo)
  // 2. Um banco de dados como Firebase, MongoDB, MySQL, etc.
  
  /* 
  Exemplo com Firebase (pseudocódigo):
  
  // Inicialize o Firebase em outro lugar do código
  firebase.firestore().collection('relatorios').add({
      data: new Date(),
      relatorioHTML: relatorioHTML,
      relatorioTexto: relatorioTexto,
      timestamp: timestamp
  })
  .then(docRef => {
      console.log("Relatório salvo com ID: ", docRef.id);
  })
  .catch(error => {
      console.error("Erro ao salvar relatório: ", error);
  });
  */
}

// Função para visualizar histórico de relatórios
function visualizarHistoricoRelatorios() {
  let historicoRelatorios = JSON.parse(localStorage.getItem('historicoRelatorios')) || [];
  
  if (historicoRelatorios.length === 0) {
      mostrarMensagem("Nenhum relatório encontrado no histórico", "info");
      return;
  }
  
  // Criar modal para visualizar histórico
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal-historico';
  
  let listaHTML = historicoRelatorios.map(relatorio => `
      <tr>
          <td>${relatorio.data}</td>
          <td>${relatorio.hora}</td>
          <td>${relatorio.resumo}</td>
          <td>
              <button class="btn-visualizar" data-id="${relatorio.id}">Visualizar</button>
          </td>
      </tr>
  `).join('');
  
  modalDiv.innerHTML = `
      <div class="modal-conteudo-historico">
          <h3>Histórico de Relatórios</h3>
          <table class="tabela-historico">
              <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Resumo</th>
                  <th>Ação</th>
              </tr>
              ${listaHTML}
          </table>
          <button id="btn-fechar-historico" class="btn-modal">Fechar</button>
      </div>
  `;
  
  document.body.appendChild(modalDiv);
  
  // Adicionar CSS para o modal
  const style = document.createElement('style');
  style.textContent = `
      .modal-historico {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
      }
      .modal-conteudo-historico {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 800px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
      }
      .tabela-historico {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
      }
      .tabela-historico th, .tabela-historico td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
      }
      .tabela-historico th {
          background-color: #f2f2f2;
      }
      .btn-visualizar {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
      }
  `;
  
  document.head.appendChild(style);
  
  // Adicionar event listeners
  document.getElementById('btn-fechar-historico').addEventListener('click', function() {
      document.body.removeChild(modalDiv);
  });
  
  // Adicionar listeners para botões de visualizar
  const botoesVisualizar = document.querySelectorAll('.btn-visualizar');
  botoesVisualizar.forEach(botao => {
      botao.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          // Aqui você recuperaria o relatório completo do banco de dados
          mostrarMensagem("Funcionalidade em desenvolvimento. Em um sistema completo, o relatório seria carregado do banco de dados.", "info");
      });
  });
}

// Adicionar botão de histórico na interface
function adicionarBotaoHistorico() {
  const container = document.querySelector('.container');
  const botaoHistorico = document.createElement('button');
  botaoHistorico.innerText = 'Ver Histórico de Relatórios';
  botaoHistorico.className = 'btn-historico';
  botaoHistorico.addEventListener('click', visualizarHistoricoRelatorios);
  
  // Adicionar antes do botão de fechar caixa
  const botaoFecharCaixa = document.querySelector('a[href="Fechar_caixa.html"]').parentNode;
  container.insertBefore(botaoHistorico, botaoFecharCaixa);
  
  // Adicionar estilo para o botão
  const style = document.createElement('style');
  style.textContent = `
      .btn-historico {
          background-color: #673AB7;
          color: white;
          border: none;
          padding: 10px 15px;
          margin: 15px 0;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
      }
      .btn-historico:hover {
          background-color: #5E35B1;
      }
  `;
  document.head.appendChild(style);
}

// Chamar função para adicionar botão ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  adicionarBotaoHistorico();
});

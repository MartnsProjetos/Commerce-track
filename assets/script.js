
  // Variáveis globais
  let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
  let carrinho = [];
  let total = 0;
  let ultimaPesquisa = '';
  
  // Inicialização
  window.onload = function() {
      atualizarTabela();
      carregarVendasSalvas();
  };
  
  // Função para salvar produto com validação
  function salvarProduto() {
      let nome = document.getElementById("nome").value.trim();
      let tipo = document.getElementById("tipo").value.trim();
      let custo = parseFloat(document.getElementById("custo").value);
      let venda = parseFloat(document.getElementById("venda").value);
      let quantidade = parseInt(document.getElementById("quantidade").value);
      
      // Validação básica
      if (!nome || !tipo || isNaN(custo) || isNaN(venda) || isNaN(quantidade)) {
          mostrarMensagem("Preencha todos os campos corretamente", "erro");
          return;
      }
      
      if (custo <= 0 || venda <= 0 || quantidade < 0) {
          mostrarMensagem("Valores de custo e venda devem ser maiores que zero", "erro");
          return;
      }
      
      // Verificar se produto já existe
      const produtoExistente = produtos.findIndex(p => p.nome.toLowerCase() === nome.toLowerCase());
      
      if (produtoExistente >= 0) {
          // Perguntar se deseja atualizar o estoque
          if (confirm(`O produto "${nome}" já existe. Deseja adicionar ${quantidade} unidades ao estoque atual?`)) {
              produtos[produtoExistente].quantidade += quantidade;
              mostrarMensagem(`Estoque de "${nome}" atualizado com sucesso!`, "sucesso");
          } else {
              return;
          }
      } else {
          // Adicionar novo produto
          let produto = { nome, tipo, custo, venda, quantidade };
          produtos.push(produto);
          mostrarMensagem(`Produto "${nome}" adicionado com sucesso!`, "sucesso");
      }
      
      // Salvar e limpar campos
      localStorage.setItem('produtos', JSON.stringify(produtos));
      limparCamposCadastro();
      atualizarTabela();
  }
  
  // Limpar campos de cadastro
  function limparCamposCadastro() {
      document.getElementById("nome").value = "";
      document.getElementById("tipo").value = "";
      document.getElementById("custo").value = "";
      document.getElementById("venda").value = "";
      document.getElementById("quantidade").value = "";
      document.getElementById("nome").focus();
  }
  
  // Atualizar tabela com animação
  function atualizarTabela() {
      let tabela = document.getElementById("tabela-produtos");
      tabela.innerHTML = "<tr><th>Nome</th><th>Tipo</th><th>Custo</th><th>Venda</th><th>Quant</th><th>Ação</th></tr>";
      
      if (produtos.length === 0) {
          let row = tabela.insertRow();
          let cell = row.insertCell(0);
          cell.colSpan = 6;
          cell.innerHTML = "Nenhum produto cadastrado";
          cell.style.textAlign = "center";
          cell.style.padding = "20px";
          return;
      }
      
      produtos.forEach((produto, index) => {
          let row = tabela.insertRow();
          row.setAttribute("data-index", index);
          
          // Adicionar classe para animação de entrada
          row.classList.add("fade-in");
          
          row.insertCell(0).innerText = produto.nome;
          row.insertCell(1).innerText = produto.tipo;
          row.insertCell(2).innerHTML = `<input type='number' value='${produto.custo}' min='0' step='0.01' onchange='editarProduto(${index}, "custo", this.value)'>`;
          row.insertCell(3).innerHTML = `<input type='number' value='${produto.venda}' min='0' step='0.01' onchange='editarProduto(${index}, "venda", this.value)'>`;
          row.insertCell(4).innerHTML = `<input type='number' value='${produto.quantidade}' min='0' onchange='editarProduto(${index}, "quantidade", this.value)'>`;
          
          let cellAcao = row.insertCell(5);
          cellAcao.innerHTML = `
              <button class="btn-excluir" onclick='excluirProduto(${index})' style="background-color: red; color: white;">Excluir</button>
              <button class="btn-editar" onclick='editarProdutoCompleto(${index})'>Editar</button>
          `;
          
          // Remover a classe após a animação
          setTimeout(() => {
              row.classList.remove("fade-in");
          }, 500);
      });
      
      // Reaplicar filtro se houver pesquisa ativa
      if (ultimaPesquisa) {
          filtrarProdutos();
      }
  }
  
  // Editar produto (campo específico)
  function editarProduto(index, campo, valor) {
      const valorNum = parseFloat(valor);
      
      if (isNaN(valorNum) || valorNum < 0) {
          mostrarMensagem("Por favor, insira um valor válido", "erro");
          atualizarTabela(); // Restaurar valor anterior
          return;
      }
      
      produtos[index][campo] = valorNum;
      localStorage.setItem('produtos', JSON.stringify(produtos));
      
      // Feedback visual
      const row = document.querySelector(`tr[data-index="${index}"]`);
      if (row) {
          row.classList.add("highlight");
          setTimeout(() => row.classList.remove("highlight"), 1000);
      }
  }
  
  // Editar produto completo (abre formulário de edição)
  function editarProdutoCompleto(index) {
      const produto = produtos[index];
      
      document.getElementById("nome").value = produto.nome;
      document.getElementById("tipo").value = produto.tipo;
      document.getElementById("custo").value = produto.custo;
      document.getElementById("venda").value = produto.venda;
      document.getElementById("quantidade").value = produto.quantidade;
      
      // Rolar para o topo e focar no nome
      window.scrollTo({top: 0, behavior: 'smooth'});
      
      // Mudar o botão de salvar para atualizar
      const btnSalvar = document.querySelector('button');
      btnSalvar.textContent = 'Atualizar Produto';
      btnSalvar.onclick = function() {
          atualizarProdutoExistente(index);
      };
      
      // Adicionar botão para cancelar edição
      const btnCancelar = document.createElement('button');
      btnCancelar.textContent = 'Cancelar';
      btnCancelar.classList.add('btn-cancelar');
      btnCancelar.onclick = function() {
          limparCamposCadastro();
          this.remove();
          btnSalvar.textContent = 'Salvar Produto';
          btnSalvar.onclick = salvarProduto;
      };
      
      btnSalvar.parentNode.insertBefore(btnCancelar, btnSalvar.nextSibling);
  }
  
  // Atualizar produto existente
  function atualizarProdutoExistente(index) {
      let nome = document.getElementById("nome").value.trim();
      let tipo = document.getElementById("tipo").value.trim();
      let custo = parseFloat(document.getElementById("custo").value);
      let venda = parseFloat(document.getElementById("venda").value);
      let quantidade = parseInt(document.getElementById("quantidade").value);
      
      // Validação básica
      if (!nome || !tipo || isNaN(custo) || isNaN(venda) || isNaN(quantidade)) {
          mostrarMensagem("Preencha todos os campos corretamente", "erro");
          return;
      }
      
      if (custo <= 0 || venda <= 0 || quantidade < 0) {
          mostrarMensagem("Valores de custo e venda devem ser maiores que zero", "erro");
          return;
      }
      
      produtos[index] = { nome, tipo, custo, venda, quantidade };
      localStorage.setItem('produtos', JSON.stringify(produtos));
      
      // Restaurar o botão de salvar
      const btnSalvar = document.querySelector('button');
      btnSalvar.textContent = 'Salvar Produto';
      btnSalvar.onclick = salvarProduto;
      
      // Remover botão de cancelar
      const btnCancelar = document.querySelector('.btn-cancelar');
      if (btnCancelar) btnCancelar.remove();
      
      limparCamposCadastro();
      atualizarTabela();
      mostrarMensagem(`Produto "${nome}" atualizado com sucesso!`, "sucesso");
  }
  
  // Excluir produto com confirmação
  function excluirProduto(index) {
      const produto = produtos[index];
      if (confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) {
          // Animação de saída antes de remover
          const row = document.querySelector(`tr[data-index="${index}"]`);
          row.classList.add("fade-out");
          
          setTimeout(() => {
              produtos.splice(index, 1);
              localStorage.setItem('produtos', JSON.stringify(produtos));
              atualizarTabela();
              mostrarMensagem(`Produto "${produto.nome}" removido com sucesso!`, "info");
          }, 300);
      }
  }
  
  // Pesquisa aprimorada (pesquisa em tempo real em múltiplos campos)
  function filtrarProdutos() {
      let termo = document.getElementById("pesquisa").value.toLowerCase().trim();
      ultimaPesquisa = termo;
      
      if (!termo) {
          // Mostrar todos os produtos se a pesquisa estiver vazia
          let linhas = document.querySelectorAll("#tabela-produtos tr");
          linhas.forEach((linha, index) => {
              if (index === 0) return; // Pular cabeçalho
              linha.style.display = "";
          });
          return;
      }
      
      let linhas = document.querySelectorAll("#tabela-produtos tr");
      let encontrados = 0;
      
      linhas.forEach((linha, index) => {
          if (index === 0) return; // Pular cabeçalho
          
          // Pesquisar em vários campos
          const nome = linha.cells[0].innerText.toLowerCase();
          const tipo = linha.cells[1].innerText.toLowerCase();
          
          // Verificar se o termo aparece em qualquer campo
          if (nome.includes(termo) || tipo.includes(termo)) {
              linha.style.display = "";
              encontrados++;
              
              // Destaque dos termos encontrados (opcional)
              destacarTermo(linha.cells[0], termo);
              destacarTermo(linha.cells[1], termo);
          } else {
              linha.style.display = "none";
          }
      });
      
      // Feedback sobre resultados da pesquisa
      if (encontrados === 0 && produtos.length > 0) {
          mostrarMensagem(`Nenhum produto encontrado para "${termo}"`, "info");
      }
  }
  
  // Destacar termo pesquisado
  function destacarTermo(cell, termo) {
      const texto = cell.innerText;
      const regex = new RegExp(`(${termo})`, 'gi');
      cell.innerHTML = texto.replace(regex, '<span class="destaque">$1</span>');
  }
  
  // Pesquisa avançada para venda
  function filtrarProdutosVenda() {
      let termo = document.getElementById("buscarProduto").value.toLowerCase().trim();
      let resultadoBusca = produtos.filter(produto => 
          produto.nome.toLowerCase().includes(termo) || 
          produto.tipo.toLowerCase().includes(termo)
      );
      
      let tabelaProdutosVenda = document.getElementById("carrinho");
      
      // Verificar se o carrinho está sendo usado para sugestões ou mostrando o carrinho real
      if (carrinho.length === 0) {
          // Mostrar sugestões de produtos
          tabelaProdutosVenda.innerHTML = '';
          
          if (resultadoBusca.length === 0 && termo !== '') {
              tabelaProdutosVenda.innerHTML = '<p class="no-results">Nenhum produto encontrado</p>';
              return;
          }
          
          resultadoBusca.forEach((produto, index) => {
              if (produto.quantidade > 0) {
                  const div = document.createElement('div');
                  div.className = 'produto-sugestao';
                  div.innerHTML = `
                      <span>${produto.nome} - R$ ${produto.venda.toFixed(2)} (${produto.quantidade} em estoque)</span>
                      <button onclick="selecionarProduto('${produto.nome}')" class="btn-adicionar">Selecionar</button>
                  `;
                  tabelaProdutosVenda.appendChild(div);
              }
          });
      }
  }
  
  // Selecionar produto para o carrinho
  function selecionarProduto(nomeProduto) {
      document.getElementById("buscarProduto").value = nomeProduto;
      document.getElementById("carrinho").innerHTML = '';
  }
  
  // Adicionar ao carrinho com animação
  function adicionarAoCarrinho() {
      let nomeProduto = document.getElementById("buscarProduto").value.trim();
      if (!nomeProduto) {
          mostrarMensagem("Digite o nome do produto", "erro");
          return;
      }
      
      let produto = produtos.find(p => p.nome.toLowerCase().includes(nomeProduto.toLowerCase()));
      
      if (!produto) {
          mostrarMensagem(`Produto "${nomeProduto}" não encontrado`, "erro");
          return;
      }
      
      if (produto.quantidade <= 0) {
          mostrarMensagem(`Produto "${produto.nome}" sem estoque`, "erro");
          return;
      }
      
      // Atualizar o estoque
      produto.quantidade--;
      
      // Verificar se o produto já está no carrinho
      const itemNoCarrinho = carrinho.findIndex(item => 
          item.produto.nome === produto.nome
      );
      
      if (itemNoCarrinho >= 0) {
          // Aumentar a quantidade se já estiver no carrinho
          carrinho[itemNoCarrinho].quantidade++;
      } else {
          // Adicionar novo item ao carrinho
          carrinho.push({
              produto: produto,
              quantidade: 1,
              subtotal: produto.venda
          });
      }
      
      total += produto.venda;
      localStorage.setItem('produtos', JSON.stringify(produtos));
      atualizarTabela();
      atualizarCarrinho();
      
      mostrarMensagem(`"${produto.nome}" adicionado ao carrinho`, "sucesso");
  }
  
  // Atualizar visualização do carrinho
  function atualizarCarrinho() {
      const carrinhoElement = document.getElementById("carrinho");
      carrinhoElement.innerHTML = '';
      
      if (carrinho.length === 0) {
          carrinhoElement.innerHTML = '<p class="carrinho-vazio">Carrinho vazio</p>';
          document.getElementById("total").innerText = "0.00";
          return;
      }
      
      let totalCalculado = 0;
      
      carrinho.forEach((item, index) => {
          const subtotal = item.produto.venda * item.quantidade;
          totalCalculado += subtotal;
          
          const itemDiv = document.createElement('div');
          itemDiv.className = 'item-carrinho';
          itemDiv.innerHTML = `
              <span class="item-nome">${item.produto.nome}</span>
              <span class="item-quantidade">
                  <button onclick="diminuirQuantidade(${index})" class="btn-quantidade" style="background-color: red; color: white;">-</button>
                  <span>${item.quantidade}x</span>
                  <button onclick="aumentarQuantidade(${index})" class="btn-quantidade" style="background-color: green; color: white;">+</button>
              </span>
              <span class="item-preco">R$ ${subtotal.toFixed(2)}</span>
              <button onclick="removerDoCarrinho(${index})" class="btn-remover">Remover</button>
          `;
          carrinhoElement.appendChild(itemDiv);
      });
      
      total = totalCalculado;
      document.getElementById("total").innerText = total.toFixed(2);
  }
  
  // Aumentar quantidade de um item no carrinho
  function aumentarQuantidade(index) {
      const item = carrinho[index];
      
      // Verificar estoque
      const produtoAtual = produtos.find(p => p.nome === item.produto.nome);
      if (produtoAtual.quantidade <= 0) {
          mostrarMensagem(`Produto "${item.produto.nome}" sem mais estoque`, "erro");
          return;
      }
      
      // Atualizar estoque e carrinho
      produtoAtual.quantidade--;
      item.quantidade++;
      item.subtotal = item.produto.venda * item.quantidade;
      
      localStorage.setItem('produtos', JSON.stringify(produtos));
      atualizarTabela();
      atualizarCarrinho();
  }
  
  // Diminuir quantidade de um item no carrinho
  function diminuirQuantidade(index) {
      const item = carrinho[index];
      
      if (item.quantidade <= 1) {
          // Se só tiver 1, remove o item
          removerDoCarrinho(index);
          return;
      }
      
      // Devolver ao estoque
      const produtoAtual = produtos.find(p => p.nome === item.produto.nome);
      produtoAtual.quantidade++;
      
      // Atualizar carrinho
      item.quantidade--;
      item.subtotal = item.produto.venda * item.quantidade;
      
      localStorage.setItem('produtos', JSON.stringify(produtos));
      atualizarTabela();
      atualizarCarrinho();
  }
  
  // Remover item do carrinho
  function removerDoCarrinho(index) {
      const item = carrinho[index];
      
      // Devolver ao estoque
      const produtoAtual = produtos.find(p => p.nome === item.produto.nome);
      produtoAtual.quantidade += item.quantidade;
      
      // Remover do carrinho com animação
      const itemElement = document.querySelectorAll('.item-carrinho')[index];
      itemElement.classList.add('item-removido');
      
      setTimeout(() => {
          carrinho.splice(index, 1);
          localStorage.setItem('produtos', JSON.stringify(produtos));
          atualizarTabela();
          atualizarCarrinho();
      }, 300);
      
      mostrarMensagem(`"${item.produto.nome}" removido do carrinho`, "info");
  }
  
  // Limpar carrinho
  function limparCarrinho() {
      if (carrinho.length === 0) return;
      
      if (confirm("Tem certeza que deseja limpar todo o carrinho?")) {
          // Devolver todos os itens ao estoque
          carrinho.forEach(item => {
              const produtoAtual = produtos.find(p => p.nome === item.produto.nome);
              produtoAtual.quantidade += item.quantidade;
          });
          
          carrinho = [];
          total = 0;
          
          localStorage.setItem('produtos', JSON.stringify(produtos));
          atualizarTabela();
          atualizarCarrinho();
          
          mostrarMensagem("Carrinho limpo com sucesso", "info");
      }
  }
  
  // Finalizar compra com melhorias
  function finalizarCompra() {
      if (carrinho.length === 0) {
          mostrarMensagem("Adicione produtos ao carrinho primeiro", "erro");
          return;
      }
      
      // Obter dados anteriores
      let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
      let totalLucro = parseFloat(document.getElementById("totalLucro").innerText) || 0;
      let totalProdutosVendidos = parseInt(document.getElementById("totalProdutosVendidos").innerText) || 0;
      
      let dataHora = new Date().toLocaleString();
      let lucroVendaAtual = 0;
      let itensVendidos = 0;
      
      // Criar venda para o histórico
      let venda = {
          id: Date.now(),
          data: dataHora,
          itens: [],
          total: total,
          lucro: 0
      };
      
      // Processar cada item do carrinho
      carrinho.forEach(item => {
          let lucroItem = (item.produto.venda - item.produto.custo) * item.quantidade;
          lucroVendaAtual += lucroItem;
          itensVendidos += item.quantidade;
          
          // Adicionar à venda atual
          venda.itens.push({
              nome: item.produto.nome,
              quantidade: item.quantidade,
              valorUnitario: item.produto.venda,
              valorTotal: item.produto.venda * item.quantidade
          });
          
          // Adicionar à tabela de vendas
          let vendasLista = document.getElementById("vendas-lista");
          let row = vendasLista.insertRow(0);
          row.classList.add('fade-in');
          
          row.insertCell(0).innerText = item.produto.nome;
          row.insertCell(1).innerText = item.quantidade;
          row.insertCell(2).innerText = "R$ " + (item.produto.venda * item.quantidade).toFixed(2);
          row.insertCell(3).innerText = dataHora;
      });
      
      // Atualizar lucro total
      venda.lucro = lucroVendaAtual;
      totalLucro += lucroVendaAtual;
      totalProdutosVendidos += itensVendidos;
      
      // Salvar venda no histórico
      vendas.push(venda);
      localStorage.setItem('vendas', JSON.stringify(vendas));
      
      // Atualizar UI
      document.getElementById("totalLucro").innerText = totalLucro.toFixed(2);
      document.getElementById("totalProdutosVendidos").innerText = totalProdutosVendidos;
      
      // Mostrar confirmação com animação melhorada
      let confirmacao = document.getElementById("confirmacao");
      confirmacao.innerHTML = `
          <div class="icon-success">✓</div>
          <div>
              <h3>Venda finalizada!</h3>
              <p>Total: R$ ${total.toFixed(2)}</p>
              <p>Itens: ${itensVendidos}</p>
          </div>
      `;
      
      confirmacao.classList.add("active");
      confirmacao.style.display = "flex";
      
      setTimeout(() => {
          confirmacao.classList.remove("active");
          confirmacao.style.display = "none";
      }, 3000);
      
      // Limpar o carrinho
      carrinho = [];
      total = 0;
      atualizarCarrinho();
  }
  
  // Carregar vendas salvas ao iniciar
  function carregarVendasSalvas() {
      const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
      let totalLucro = 0;
      let totalProdutosVendidos = 0;
      
      let vendasLista = document.getElementById("vendas-lista");
      vendasLista.innerHTML = '';
      
      vendas.forEach(venda => {
          totalLucro += venda.lucro;
          
          venda.itens.forEach(item => {
              totalProdutosVendidos += item.quantidade;
              
              let row = vendasLista.insertRow();
              row.insertCell(0).innerText = item.nome;
              row.insertCell(1).innerText = item.quantidade;
              row.insertCell(2).innerText = "R$ " + (item.valorTotal).toFixed(2);
              row.insertCell(3).innerText = venda.data;
          });
      });
      
      document.getElementById("totalLucro").innerText = totalLucro.toFixed(2);
      document.getElementById("totalProdutosVendidos").innerText = totalProdutosVendidos;
  }
  
      
  // Função para limpar vendas do dia
  function limparVendas() {
      // Confirmar antes de apagar
      if (!confirm("Tem certeza que deseja limpar todas as vendas do dia? Esta ação não pode ser desfeita.")) {
          return;
      }
      
      // Limpar dados do localStorage
      localStorage.removeItem('vendas');
      
      // Limpar tabela de vendas
      const vendasLista = document.getElementById("vendas-lista");
      vendasLista.innerHTML = '';
      
      // Resetar contadores
      document.getElementById("totalLucro").innerText = "0.00";
      document.getElementById("totalProdutosVendidos").innerText = "0";
      
      // Mostrar mensagem de confirmação
      mostrarMensagem("Todas as vendas foram removidas com sucesso", "sucesso");
  }
  
  // Adicionar botão de limpar vendas na interface
  function adicionarBotaoLimparVendas() {
      // Verificar se já existe o botão para evitar duplicação
      if (document.getElementById("botao-limpar-vendas")) {
          return;
      }
      
      // Criar botão
      const botaoContainer = document.createElement("center");
      botaoContainer.innerHTML = `
          <button id="botao-limpar-vendas" onclick="limparVendas()" class="botao-perigo">
              Limpar Vendas do Dia
          </button>
      `;
      
      // Inserir botão antes do botão "Terminar Caixa"
      const botaoTerminarCaixa = document.querySelector("button[onclick='fecharCaixa()']").parentNode;
      botaoTerminarCaixa.parentNode.insertBefore(botaoContainer, botaoTerminarCaixa);
      
      // Adicionar estilo se necessário
      if (!document.getElementById("estilo-botao-perigo")) {
          const estilo = document.createElement("style");
          estilo.id = "estilo-botao-perigo";
          estilo.innerHTML = `
              .botao-perigo {
                  background-color: green;
                  color: white;
                  border: none;
                  padding: 8px 15px;
                  border-radius: 5px;
                  cursor: pointer;
                  margin: 10px 0;
                  transition: background-color 0.3s;
              }
              
              .botao-perigo:hover {
                  background-color: #c82333;
              }
          `;
          document.head.appendChild(estilo);
      }
  }
  
  // Chamar função para adicionar botão quando a página carregar
  document.addEventListener("DOMContentLoaded", function() {
      adicionarBotaoLimparVendas();
  });
  
  // Ou adicionar o botão imediatamente se o DOM já estiver carregado
  if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(adicionarBotaoLimparVendas, 1);
  }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // Função para fechar o caixa e enviar relatório por WhatsApp
  function fecharCaixa() {
      // Obter todas as vendas salvas
      const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
      
      // Verificar se existem vendas para reportar
      if (vendas.length === 0) {
          mostrarMensagem("Não há vendas para reportar", "aviso");
          return;
      }
      
      // Obter totais
      const totalLucro = parseFloat(document.getElementById("totalLucro").innerText) || 0;
      const totalProdutosVendidos = parseInt(document.getElementById("totalProdutosVendidos").innerText) || 0;
      
      // Formatar data atual
      const dataAtual = new Date().toLocaleDateString();
      
      // Construir a mensagem para WhatsApp
      let mensagem = `*Relatório de Vendas ${dataAtual}*\n\n`;
      mensagem += `*Resumo:*\n`;
      mensagem += `Total de produtos vendidos: ${totalProdutosVendidos}\n`;
      mensagem += `Total de lucro: R$ ${totalLucro.toFixed(2)}\n\n`;
      mensagem += `*Detalhes das Vendas:*\n`;
      
      // Agrupar vendas por produto
      const produtosVendidos = {};
      
      vendas.forEach(venda => {
          venda.itens.forEach(item => {
              if (!produtosVendidos[item.nome]) {
                  produtosVendidos[item.nome] = {
                      quantidade: 0,
                      valorTotal: 0
                  };
              }
              produtosVendidos[item.nome].quantidade += item.quantidade;
              produtosVendidos[item.nome].valorTotal += item.valorTotal;
          });
      });
      
      // Adicionar detalhes de produtos
      Object.keys(produtosVendidos).forEach(nomeProduto => {
          const produto = produtosVendidos[nomeProduto];
          mensagem += `${nomeProduto}: ${produto.quantidade} unid. - R$ ${produto.valorTotal.toFixed(2)}\n`;
      });
      
      // Adicionar detalhes das últimas vendas (limite de 5 para não deixar a mensagem muito grande)
      const ultimasVendas = vendas.slice(-5);
      mensagem += `\n*Últimas ${ultimasVendas.length} vendas:*\n`;
      
      ultimasVendas.forEach((venda, index) => {
          mensagem += `Venda ${index + 1} (${venda.data}) - Total: R$ ${venda.total.toFixed(2)}\n`;
      });
      
      // Número do WhatsApp com código do país
      const numeroWhatsApp = "5511963822169";
      
      // Codificar a mensagem para URL
      const mensagemCodificada = encodeURIComponent(mensagem);
      
      // Construir a URL do WhatsApp
      const urlWhatsApp = `https://wa.me/$5511963822159?text=${mensagemCodificada}`;
      
      // Mostrar confirmação antes de abrir WhatsApp
      if (confirm("Deseja enviar o relatório de vendas por WhatsApp?")) {
          // Mostrar mensagem de sucesso
          mostrarMensagem("Abrindo WhatsApp para envio do relatório", "sucesso");
          
          // Abrir WhatsApp em uma nova janela
          window.open(urlWhatsApp, '_blank');
      }
  }
  
  // Função auxiliar para mostrar mensagens ao usuário
  function mostrarMensagem(texto, tipo) {
      let confirmacao = document.getElementById("confirmacao");
      
      // Definir ícone baseado no tipo de mensagem
      let icone = "✓"; // padrão sucesso
      if (tipo === "erro") icone = "✗";
      if (tipo === "aviso") icone = "⚠";
      
      confirmacao.innerHTML = `
          <div class="icon-${tipo}">${icone}</div>
          <div>
              <p>${texto}</p>
          </div>
      `;
      
      confirmacao.className = "confirmacao-venda"; // Resetar classes
      confirmacao.classList.add("active", tipo);
      confirmacao.style.display = "flex";
      
      setTimeout(() => {
          confirmacao.classList.remove("active");
          confirmacao.style.display = "none";
      }, 3000);
  }
      
      
      
      
      // Atualizar visualização do carrinho
  function atualizarCarrinho() {
      const carrinhoElement = document.getElementById("carrinho");
      carrinhoElement.innerHTML = '';
      
      if (carrinho.length === 0) {
          carrinhoElement.innerHTML = '<p class="carrinho-vazio">Carrinho vazio</p>';
          document.getElementById("total").innerText = "0.00";
          return;
      }
      
      let totalCalculado = 0;
      
      carrinho.forEach((item, index) => {
          const subtotal = item.produto.venda * item.quantidade;
          totalCalculado += subtotal;
          
          const itemDiv = document.createElement('div');
          itemDiv.className = 'item-carrinho';
          itemDiv.innerHTML = `
              <span class="item-nome">${item.produto.nome}</span>
              <span class="item-quantidade">
                  <button onclick="diminuirQuantidade(${index})" class="btn-quantidade" style="background-color: red; color: white;">-</button>
                  <span>${item.quantidade}x</span>
                  <button onclick="aumentarQuantidade(${index})" class="btn-quantidade" style="background-color: green; color: white;">+</button>
              </span>
              <span class="item-preco">
                  R$ <input type="number" value="${item.produto.venda.toFixed(2)}" step="0.01" min="0" 
                  style="width: 70px;" onchange="atualizarPrecoVenda(${index}, this.value)">
              </span>
              <span class="item-subtotal">Subtotal: R$ ${subtotal.toFixed(2)}</span>
              <button onclick="removerDoCarrinho(${index})" class="btn-remover">Remover</button>
          `;
          carrinhoElement.appendChild(itemDiv);
      });
      
      total = totalCalculado;
      document.getElementById("total").innerText = total.toFixed(2);
  }
  
  // Nova função para atualizar o preço de venda
  function atualizarPrecoVenda(index, novoPreco) {
      const valorNum = parseFloat(novoPreco);
      
      if (isNaN(valorNum) || valorNum < 0) {
          mostrarMensagem("Por favor, insira um preço válido", "erro");
          atualizarCarrinho(); // Restaurar valor anterior
          return;
      }
      
      // Atualizar o preço do item no carrinho
      carrinho[index].produto.venda = valorNum;
      
      // Recalcular o subtotal e atualizar o carrinho
      atualizarCarrinho();
      
      mostrarMensagem(`Preço atualizado para R$ ${valorNum.toFixed(2)}`, "sucesso");
  }
const digite = require('prompt-sync')();   //importação da biblioteca para a entrada de dados do usuário
const axios = require('axios');            //importação da biblioteca axios, que é usada para realizar requisições HTTP, permitindo a interação com uma API externa

let cidades = [];   //array que armazena as cidades

// Menu principal de opções

function menuInicial() {
  console.log(` MENU CIDADES 
        1 - Adicionar cidade
        2 - Listar cidades
        3 - Editar cidade
        4 - Excluir cidade
        5 - Consultar previsão de tempo em uma cidade específica
        6 - Sair
        `);
}

let option;    //guarda a opção escolhida pelo usuário

function adicionarCidade() {
  let nome = digite('Digite o nome da cidade: ');
  cidades.push({ nome});
  console.log('Cidade adicionada com sucesso!');
}

function listarCidades() {
  if (cidades.length === 0) {
    console.log('Nenhuma cidade cadastrada!');
  } else {
    console.log('Cidades registradas: ');
    for (let i = 0; i < cidades.length; i++) {    //exibe as cidades armazenadas
      let cidade = cidades[i];
      console.log(cidade);
    }
  }
}

function editarCidade() {
  if (cidades.length === 0) {
    console.log('Nenhuma cidade cadastrada.');
    return;
  }

  console.log('Cidades registradas:');
  cidades.forEach((cidade, i) => {
    console.log(`${i + 1} - ${cidade.nome}`);
  });

  let numeroCity =
    Number(digite('Digite o número da cidade que deseja editar: ')) - 1;

  if (numeroCity < 0 || numeroCity >= cidades.length) {  //valida se o número de identificação da cidade inserido pelo usuário é válido
    console.log('Número inválido.');
    return;
  }

  let novoNome = digite('Digite o novo nome da cidade: ');
  cidades[numeroCity].nome = novoNome;
  console.log('Cidade atualizada com sucesso!');
}

function excluirCidade() {
  let cidadeEscolhida = digite('Digite o nome da cidade que deseja excluir: ');
  let posicaoCity = cidades.findIndex((cidade) => cidade.nome === cidadeEscolhida);  //compara a cidade escolhida pelo usuário ao nome da cidade armazenada no array de cidades
  if (posicaoCity === -1) {
    console.log('Cidade não encontrada.');
  } else {
    cidades.splice(posicaoCity, 1);        // remove 1 item, armazenado na variável posicaoCity. Nesse caso, a cidade desejada
    console.log('Cidade excluída com sucesso!');
  }
}

async function consultarClima() {   //função assíncrona para esperar a resposta da API utilizada
  console.log('Cidades cadastradas:');
  cidades.forEach((cidade, i) => {
    console.log(`${i + 1} - ${cidade.nome}`);  //numera as cidades armazenadas
  });

  let nomeCidade = digite('Digite o nome da cidade que deseja consultar: ');
  let cidade = cidades.find((cidade) => cidade.nome.toLowerCase() === nomeCidade.toLowerCase());

  if (!cidade) {
    console.log('Cidade não encontrada.');
    return;
  }

  try {  //usado para executar um bloco de código, e em caso de erro, exibe uma mensagem de erro, ao invés de o código quebrar
    const geo = await axios.get('https://nominatim.openstreetmap.org/search', {  //busca na API as coordenadas da cidade desejada
      params: {
        q: cidade.nome,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'consulta-tempo'
      }
    });

    if (geo.data.length === 0) {    //extrai os dados recebidos na resposta da API
      console.log('Coordenadas não encontradas.');
      return;
    }

    const { lat, lon } = geo.data[0];

      const resposta = await axios.get(      //consulta da previsão do tempo na API
        'https://api.open-meteo.com/v1/forecast',
        {
          params: {
            latitude: lat,
            longitude: lon,
            current_weather: true,
          },
        }
      );

      const clima = resposta.data.current_weather;    //insere os dados da previsão do tempo na variável clima e em seguida, exibe os resultados
      console.log(`Tempo em ${nomeCidade}`);
      console.log(`Temperatura: ${clima.temperature}°C`);
      console.log(`Vento: ${clima.windspeed} km/h`);
    } catch (erro) {
      console.log('Erro ao buscar clima:', erro.message);
    }
} 

async function execucao() {  //função assíncrona utilizada para esperar resposta
  do {
    menuInicial();
    option = Number(digite('Digite a opção desejada: '));

    switch (option) {
      case 1:
        adicionarCidade();
        break;
      case 2:
        listarCidades();
        break;
      case 3:
        editarCidade();
        break;
      case 4:
        excluirCidade();
        break;
      case 5:
        await consultarClima();
        break;
      case 6:
        console.log('Saindo do sistema...');
        break;
      default:
        console.log('Opção inválida!');
    }
  } while (option !== 6);
}

execucao();     //executa o sistema

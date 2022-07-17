const BASE_URL = 'http://localhost:3000'
let userLogado
let allUsers

class Usuario {
    tipo;
    nome;
    dataNascimento;
    email;
    senha;
    candidaturas = [];

    constructor(tipo, nome, data, email, senha) {
        this.tipo = tipo;
        this.nome = nome;
        this.dataNascimento = data;
        this.email = email;
        this.senha = senha;
    }
}

class Candidatura {
    idVaga;
    idCandidato;
    reprovado = false;

    constructor(idVaga, idCandidato) {
        this.idVaga = idVaga
        this.idCandidato = idCandidato
    }
}

class Vaga {
    titulo;
    descrição;
    remuneracao;
    candidatos = [];

    constructor(titulo, descricao, remuneracao) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.remuneracao = remuneracao;
    }
}

class Validacoes {
    erro;

    ehVazio(param) {
        if (param) {
            return false
        } else {
            this.erro = `Os campos não podem ficar vazios`
            return true
        }
    }

    ehSalarioInvalido(param) {
        if (isNaN(param)) {
            this.erro = `O salário digitado é inválido.`
            return true
        } else {
            if (param < 1212) {
                this.erro = `O salário não pode ser menor do que o salário mínimo nacional.`
                return true
            }
        }
        return false
    }

    emailEhValido(email) {
        const emailSeparadoPorArroba = email.split('@');
        const possuiUmArroba = emailSeparadoPorArroba.length === 2;
        const enderecoValido = email.indexOf('@') >= 3;

        const dominioSeparado = possuiUmArroba ? emailSeparadoPorArroba[1].split('.') : [];

        let dominioValido = dominioSeparado[0] ? dominioSeparado[0].length >= 3 : false;
        dominioValido = dominioValido && dominioSeparado.every(cd => cd.length >= 2);
        dominioValido = dominioValido && (dominioSeparado.length === 2 || dominioSeparado.length === 3);

        if (!possuiUmArroba || !enderecoValido || !dominioValido) {
            this.erro = `O email informado é inválido.`
        }
        return possuiUmArroba && enderecoValido && dominioValido;
    }

    senhaValida(senha) {
        const caracteresSenha = senha.split('');
        const possuiNumero = caracteresSenha.some(caracter => !isNaN(parseInt(caracter)));

        const letras = caracteresSenha.filter(caracter => caracter.toLowerCase() !== caracter.toUpperCase());
        const possuiLetraMinuscula = letras.some(caracter => caracter !== caracter.toUpperCase());
        const possuiLetraMaiuscula = letras.some(caracter => caracter !== caracter.toLowerCase());

        const possuiCaracterEspecial = caracteresSenha.some(caracter => {
            return isNaN(parseInt(caracter)) && caracter.toLowerCase() === caracter.toUpperCase();
        });

        const possuiOitoCaracteres = senha.length >= 8;

        this.erro = ''
        this.erro = `A senha informada está incorreta: 
        `
        !possuiOitoCaracteres ? this.erro += `- A senha precisa ter ao menos 8 caracteres
        ` : ''
        !possuiNumero ? this.erro += `- A senha precisa ter pelo menos um número.
        ` : ''
        !possuiLetraMaiuscula ? this.erro += `- A senha precisa ter ao menos uma letra maiúscula
        ` : ''
        !possuiLetraMinuscula ? this.erro += `- A senha precisa ter ao menos uma letra minúscula
        ` : ''
        !possuiCaracterEspecial ? this.erro += `- A senha precisa ter ao menos um caracter especial
        ` : ''

        return possuiNumero
            && possuiLetraMinuscula
            && possuiLetraMaiuscula
            && possuiCaracterEspecial
            && possuiOitoCaracteres;
    }
}

const valida = new Validacoes()

const limpaCampos = () => {
    document.getElementById('email').value = ''
    document.getElementById('senha').value = ''
    document.getElementById('nomeCadastro').value = ''
    document.getElementById('dataCadastro').value = ''
    document.getElementById('emailCadastro').value = ''
    document.getElementById('senhaCadastro').value = ''
    document.getElementById('tituloVaga').value = ''
    document.getElementById('descricaoVaga').value = ''
    document.getElementById('remuneracaoVaga').value = ''
}

const redefinirSenha = async () => {
    const email = prompt(`Digite o seu email`)
    if (valida.ehVazio(email)) {
        alert(valida.erro)
        return
    }

    try {
        const users = await axios.get(`${BASE_URL}/usuarios`);
        const user = users.data.find(e => {
            return e.email === email
        })

        if (!user) {
            alert(`O email não existe no sistema.`)
            return;
        }
        alert(`A senha é ${user.senha}`)
    }
    catch (e) {
        console.log(e);
    }

}

const adicionarMascaraData = () => {
    const dataInput = document.getElementById('dataCadastro');
    let data = dataInput.value.replaceAll(' ', '').replaceAll('/', '');
    switch (data.length) {
        case 3: case 4:
            dataInput.value = `${data.substring(0, 2)}/${data.substring(2)}`;
            break;
        case 5: case 6: case 7: case 8:
            dataInput.value = `${data.substring(0, 2)}/${data.substring(2, 4)}/${data.substring(4)}`;
            break;
        default:
            dataInput.value = data;
    }
}

const atualizaVagas = async () => {
    try {
        const { data: vagas } = await axios.get(`${BASE_URL}/vagas`);

        const ulPai = document.getElementById('ulPai')
        ulPai.textContent = ''

        vagas.forEach(vaga => {
            const titulo = vaga.titulo
            const remuneracao = vaga.remuneracao
            const divtitulo = document.createElement('div')
            const spantitulo = document.createElement('span')
            const ptitulo = document.createElement('p')
            const premuneracao = document.createElement('p')
            const divremuneracao = document.createElement('div')
            const spanremuneracao = document.createElement('span')
            ptitulo.textContent = titulo
            premuneracao.textContent = remuneracao
            spantitulo.textContent = `Título: `
            spanremuneracao.textContent = 'Remuneração: '
            divtitulo.append(spantitulo, ptitulo)
            divremuneracao.append(spanremuneracao, premuneracao)
            const li = document.createElement('li')
            li.addEventListener('click', () => detalheVaga(vaga));
            li.append(divtitulo, divremuneracao)
            ulPai.append(li)
        })
    }
    catch (e) {
        console.log(e);
    }
}

const descandidatar = async (vaga) => {
    if (!confirm(`Confirmar candidatura`)) {
        return
    }

    const cancelar = vaga.candidatos.filter(e => e.idCandidato !== userLogado.id)
    userLogado.candidaturas = userLogado.candidaturas.filter(e => e.idVaga !== vaga.id)
    vaga.candidatos = cancelar

    try {
        await axios.put(`${BASE_URL}/usuarios/${userLogado.id}`, userLogado);
        console.log('Usuário editado com sucesso!');
    }
    catch (e) {
        console.log(e);
    }

    try {
        await axios.put(`${BASE_URL}/vagas/${vaga.id}`, vaga);
        console.log('Vaga editada com sucesso!');
    }
    catch (e) {
        console.log(e);
    }
    detalheVaga(vaga)
}

const candidatar = async (vaga) => {
    if (!confirm(`Confirmar candidatura`)) {
        return
    }

    const candidatura = new Candidatura(vaga.id, userLogado.id)
    userLogado.candidaturas.push(candidatura)
    vaga.candidatos.push({
        idCandidato: candidatura.idCandidato,
        reprovado: candidatura.reprovado
    })

    try {
        await axios.put(`${BASE_URL}/usuarios/${userLogado.id}`, userLogado);
        console.log('Usuário editado com sucesso!');
    }
    catch (e) {
        console.log(e);
    }

    try {
        await axios.put(`${BASE_URL}/vagas/${vaga.id}`, vaga);
        console.log('Vaga editada com sucesso!');
    }
    catch (e) {
        console.log(e);
    }

    detalheVaga(vaga)
}

const excluiVaga = async (vaga) => {
    if (!confirm(`Confirmar exclusão?`)) {
        return
    }

    try {
        await axios.delete(`${BASE_URL}/vagas/${vaga.id}`);
        console.log('Vaga excluída com sucesso!');
    }
    catch (e) {
        console.log(e);
    }

    mudaTela('home')
}

const reprovaCandidato = async (vaga, idCandidato) => {

    vaga.candidatos.forEach(e => {
        if (e.idCandidato === idCandidato) {
            e.reprovado = true
        }
    })

    const user = allUsers.find(e => e.id === idCandidato)

    user.candidaturas.forEach(e => {
        if (e.idVaga === vaga.id) {
            e.reprovado = true;
        }
    })

    try {
        await axios.put(`${BASE_URL}/usuarios/${idCandidato}`, user);
        console.log('Usuário editado com sucesso!');
    }
    catch (e) {
        console.log(e);
    }

    try {
        await axios.put(`${BASE_URL}/vagas/${vaga.id}`, vaga);
        console.log('Usuário editado com sucesso!');
    }
    catch (e) {
        console.log(e);
    }

    detalheVaga(vaga)
}

const detalheVaga = async (vaga) => {
    mudaTela('detalhes')
    const divDescricao = document.getElementById('divDescricaoVaga')
    divDescricao.textContent = ''
    const ptitulo = document.createElement('p')
    const pdescricao = document.createElement('p')
    const premuneracao = document.createElement('p')
    const spantitulo = document.createElement('span')
    const spandescricao = document.createElement('span')
    const spanremuneracao = document.createElement('span')

    spantitulo.textContent = `Título: `
    spandescricao.textContent = `Descrição: `
    spanremuneracao.textContent = `Remuneração: `

    ptitulo.append(spantitulo, vaga.titulo)
    pdescricao.append(spandescricao, vaga.descricao)
    premuneracao.append(spanremuneracao, vaga.remuneracao)
    divDescricao.append(ptitulo, pdescricao, premuneracao)

    const ulPai = document.getElementById('vagaDescricaoPai')
    ulPai.textContent = ''
    const liTitulo = document.createElement('li')
    const pNome = document.createElement('p')
    pNome.textContent = `Nome`
    const pData = document.createElement('p')
    pData.textContent = `Data de Nascimento`

    liTitulo.append(pNome, pData)
    if (userLogado.tipo === 'Recrutador') {
        liTitulo.append(document.createElement('p'))
    }
    liTitulo.classList.add('candidatos-title')
    ulPai.appendChild(liTitulo)

    vaga.candidatos.forEach(e => {
        const li = document.createElement('li')
        const pUser = document.createElement('p')
        const pNascimento = document.createElement('p')
        li.classList.add('candidato')
        const find = allUsers.find(u => u.id === e.idCandidato)
        if (find) {
            console.log(find)
            pUser.textContent = find.nome
            let dataFormatada = find.dataNascimento.split('-')
            console.log('dataFormatada=>', dataFormatada)
            let ano = dataFormatada[0]
            let mes = dataFormatada[1]
            console.log(dataFormatada[2])
            let dia = dataFormatada[2].substring(0, 2);
            dataFormatada = `${dia}/${mes}/${ano}`
            console.log('AQUI =>', dataFormatada)

            pNascimento.textContent = dataFormatada
            if (e.reprovado === true && userLogado.tipo === 'Colaborador' && e.idCandidato === userLogado.id) {
                pUser.classList.add('candidato-reprovado')
            }

            li.append(pUser, pNascimento)
            const buttonReprovar = document.createElement('button')
            if (userLogado.tipo === 'Recrutador') {
                if (e.reprovado === true) {
                    buttonReprovar.classList.add('reprovado-button')
                } else {
                    buttonReprovar.classList.add('reprovar-button')
                    buttonReprovar.addEventListener('click', () => reprovaCandidato(vaga, e.idCandidato))
                }
                buttonReprovar.textContent = 'Reprovar'
                li.appendChild(buttonReprovar)
            }

            ulPai.appendChild(li)
        }

    })

    const divButtons = document.getElementById('detalhesButtons')
    divButtons.textContent = ''

    const buttonVoltar = document.createElement('button')
    buttonVoltar.textContent = `Voltar`
    buttonVoltar.addEventListener('click', () => mudaTela('home'))
    buttonVoltar.classList.add('primary-button')
    divButtons.appendChild(buttonVoltar)

    const souCandidato = vaga.candidatos.some(e => e.idCandidato === userLogado.id)
    const fuiReprovado = vaga.candidatos.some(e => {
        if (e.reprovado === true && userLogado.tipo === 'Colaborador' && e.idCandidato === userLogado.id) {
            return true
        }
    })

    const buttonCandidatura = document.createElement('button')

    if (userLogado.tipo === 'Colaborador') {
        buttonCandidatura.classList.add('primary-button')
        if (souCandidato) {
            buttonCandidatura.textContent = `Cancelar Candidatura`
            buttonCandidatura.classList.add('w-206')
            fuiReprovado ? buttonCandidatura.classList.add('button-disabled') : buttonCandidatura.addEventListener('click', () => descandidatar(vaga))
        } else {
            buttonCandidatura.textContent = `Candidatar-se`
            buttonCandidatura.addEventListener('click', () => candidatar(vaga))
        }
        divButtons.appendChild(buttonCandidatura)
    } else {
        const buttonExcluir = document.createElement('button')
        buttonExcluir.textContent = `Excluir Vaga`
        buttonExcluir.addEventListener('click', () => excluiVaga(vaga))
        buttonExcluir.classList.add('primary-button')
        divButtons.appendChild(buttonExcluir)
    }
}

const cadastraVaga = async () => {
    const titulo = document.getElementById('tituloVaga').value
    const descricao = document.getElementById('descricaoVaga').value
    let remuneracao = document.getElementById('remuneracaoVaga').value
    if (valida.ehVazio(titulo) || valida.ehVazio(descricao) || valida.ehVazio(remuneracao) || valida.ehSalarioInvalido(remuneracao)) {
        alert(valida.erro)
        return
    }

    remuneracao = `R$ ${remuneracao}`

    const vaga = new Vaga(titulo, descricao, remuneracao)

    try {
        await axios.post(`${BASE_URL}/vagas`, vaga);
        console.log('Vaga cadastrada com sucesso!');
        limpaCampos()
    }
    catch (e) {
        console.log(e);
    }

    mudaTela('home')
}

const login = async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value
    if (valida.ehVazio(email) || valida.ehVazio(senha)) {
        console.log(valida.erro)
        alert(valida.erro)
        return
    }

    try {
        const users = await axios.get(`${BASE_URL}/usuarios`);
        allUsers = users.data
        const loginValido = users.data.some(user => {
            if (user.email == email && user.senha == senha) {
                userLogado = user
                return true
            };
        })
        loginValido ? mudaTela('home') : alert(`Login ou senha incorretos!`)
    }
    catch (e) {
        console.log(e);
    }
}

const mudaTela = (tela) => {
    const login = document.getElementById('loginPage')
    const cadastro = document.getElementById('cadastroPage')
    const home = document.getElementById('homePage')
    const detalhes = document.getElementById('detalhes')
    const cadastroVaga = document.getElementById('cadastroVaga')
    login.style.display = 'none'
    cadastro.style.display = 'none'
    home.style.display = 'none'
    detalhes.style.display = 'none'
    cadastroVaga.style.display = 'none'

    switch (tela) {
        case 'login':
            limpaCampos()
            login.style.display = 'flex'
            break;
        case 'cadastro':
            limpaCampos()
            cadastro.style.display = 'flex'
            break;
        case 'home':
            atualizaVagas()
            if (userLogado.tipo === 'Colaborador') {
                document.getElementById('buttonCadastrar').style.display = 'none'
                document.getElementById('homeButtons').classList.add('centraliza')
            } else {
                document.getElementById('buttonCadastrar').style.display = 'block'
                document.getElementById('homeButtons').classList.remove('centraliza')
            }
            home.style.display = 'flex'
            break;
        case 'detalhes':
            detalhes.style.display = 'flex'
            break;
        case 'cadastroVaga':
            limpaCampos()
            cadastroVaga.style.display = 'flex'
            break;
    }
}

const cadastraColaborador = async (e) => {
    e.preventDefault()
    const tipo = document.getElementById('tipoCadastro').value
    const nome = document.getElementById('nomeCadastro').value
    const data = document.getElementById('dataCadastro').value
    const email = document.getElementById('emailCadastro').value
    const senha = document.getElementById('senhaCadastro').value
    if (valida.ehVazio(tipo) || valida.ehVazio(nome) || valida.ehVazio(data) || valida.ehVazio(email) || valida.ehVazio(senha) || !valida.emailEhValido(email) || !valida.senhaValida(senha)) {
        alert(valida.erro)
        return
    }

    let nomeAux = '';
    for (let item of nome.toLowerCase().split(' ')) {
        nomeAux += item[0].toUpperCase() + item.slice(1) + " "
    }

    const dataQuebrada = data.split('/')
    let dataAux = new Date(dataQuebrada[2], dataQuebrada[1] - 1, dataQuebrada[0])
    dataAux = dataAux.toISOString()

    const user = new Usuario(tipo, nomeAux, dataAux, email, senha)

    try {
        const users = await axios.get(`${BASE_URL}/usuarios`);
        allUsers = users.data
    }
    catch (e) {
        console.log(e);
    }

    for (item of allUsers) {
        if (item.email === email) {
            alert(`Email já cadastrado no sistema, tente outro.`)
            return
        }
    }

    try {
        await axios.post(`${BASE_URL}/usuarios`, user);
        console.log('Colaborador cadastrado com sucesso!');
    }
    catch (e) {
        console.log(e);
    }

    mudaTela('login')
}

mudaTela('login')
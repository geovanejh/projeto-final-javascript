const BASE_URL = 'http://localhost:3000'
let userLogado
let allUsers

class Usuario {
    tipo;
    nome;
    dataNascimento; // salvar como objeto Date e não como string '10/05/1990' por exemplo
    email;
    senha;
    candidaturas = []; // lista de Candidatura

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
    reprovado = false; // true or false

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

const redefinirSenha = async () => {
    const email = prompt(`Digite o seu email`)

    try {
        const users = await axios.get(`${BASE_URL}/usuarios`);
        const user = users.data.find(e => {
            console.log('e =>', e)
            return e.email === email
        })

        alert(`A senha é ${user.senha}`)
    }
    catch (e) {
        console.log(e);
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
    console.log('cancelar => ', cancelar)
    console.log('userLogado => ', userLogado)

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

    console.log(vaga)
    const candidatura = new Candidatura(vaga.id, userLogado.id)
    userLogado.candidaturas.push(candidatura)
    vaga.candidatos.push({
        idCandidato: candidatura.idCandidato,
        reprovado: candidatura.reprovado
    })

    console.log(userLogado)

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

const detalheVaga = async (vaga) => {
    mudaTela('detalhe')
    console.log(vaga)
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
    liTitulo.classList.add('candidatos-title')
    ulPai.appendChild(liTitulo)



    vaga.candidatos.forEach(e => {
        const li = document.createElement('li')
        const pUser = document.createElement('p')
        const pNascimento = document.createElement('p')
        li.classList.add('candidato')
        const find = allUsers.find(u => u.id === e.idCandidato)
        console.log(find)
        pUser.textContent = find.nome
        pNascimento.textContent = find.dataNascimento
        li.append(pUser, pNascimento)
        ulPai.appendChild(li)
    })

    const divButtons = document.getElementById('detalhesButtons')
    divButtons.textContent = ''

    const buttonVoltar = document.createElement('button')
    buttonVoltar.textContent = `Voltar`
    buttonVoltar.addEventListener('click', () => mudaTela('home'))
    buttonVoltar.classList.add('primary-button')
    divButtons.appendChild(buttonVoltar)

    const souCandidato = vaga.candidatos.some(e => e.idCandidato === userLogado.id)

    if (userLogado.tipo === 'Colaborador') {
        const buttonCandidatura = document.createElement('button')
        buttonCandidatura.classList.add('primary-button')
        if (souCandidato) {
            buttonCandidatura.textContent = `Cancelar Candidatura`
            buttonCandidatura.addEventListener('click', () => descandidatar(vaga))
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
    const remuneracao = document.getElementById('remuneracaoVaga').value

    const vaga = new Vaga(titulo, descricao, remuneracao)

    try {
        await axios.post(`${BASE_URL}/vagas`, vaga);
        console.log('Vaga cadastrada com sucesso!');
        document.getElementById('tituloVaga').value = ''
        document.getElementById('descricaoVaga').value = ''
        document.getElementById('remuneracaoVaga').value = ''
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

    try {
        const users = await axios.get(`${BASE_URL}/usuarios`);
        allUsers = users.data
        const loginValido = users.data.some(user => {
            if (user.email == email && user.senha == senha) {
                userLogado = user
                return true
            };
        })
        console.log(userLogado)
        loginValido ? mudaTela('home') : alert(`Login ou senha incorretos!`)
    }
    catch (e) {
        console.log(e);
    }
}

// const mudaTela = (login, cadastro, home, detalheTrabalhador, detalheRecrutador, cadastroVaga) => {
//     home === 'flex' ? atualizaVagas() : ''

//     document.getElementById('loginPage').style.display = login
//     document.getElementById('cadastroPage').style.display = cadastro
//     document.getElementById('homePage').style.display = home
//     document.getElementById('detalhes').style.display = detalheTrabalhador
//     document.getElementById('detalhesTrabalhador').style.display = detalheRecrutador
//     document.getElementById('cadastroVaga').style.display = cadastroVaga

//     userLogado.tipo === 'Recrutador' ? document.getElementById('buttonCadastrar').style.display = 'flex' : document.getElementById('buttonCadastrar').style.display = 'none'
// }

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
            login.style.display = 'flex'
            break;
        case 'cadastro':
            cadastro.style.display = 'flex'
            break;
        case 'home':
            atualizaVagas()
            home.style.display = 'flex'
            break;
        case 'detalhes':
            detalhes.style.display = 'flex'
            break;
        case 'cadastroVaga':
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

    const user = new Usuario(tipo, nome, data, email, senha)

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
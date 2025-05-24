console.log('🎯 ARQUIVO TESTE CARREGADO!');

// Sistema de login simples
window.login = function() {
  console.log('🔥 BOTÃO LOGIN FUNCIONANDO!');
  
  const username = document.getElementById('username')?.value;
  const password = document.getElementById('password')?.value;
  
  console.log('Dados:', username, password);
  
  if (username === 'cliente' && password === 'cliente123') {
    alert('Login do cliente funcionou!');
    console.log('✅ Cliente logado com sucesso!');
  } else if (username === 'admin' && password === 'admin123') {
    alert('Login do admin funcionou!');  
    console.log('✅ Admin logado com sucesso!');
  } else {
    alert('Usuário ou senha incorretos!');
  }
};

// Renderizar tela de login simples
document.body.innerHTML = `
  <div style="padding: 2rem; max-width: 400px; margin: 2rem auto; border: 1px solid #ccc; border-radius: 8px;">
    <h1>TESTE LOGIN</h1>
    <div style="margin: 1rem 0;">
      <input type="text" id="username" placeholder="Usuário" style="width: 100%; padding: 0.5rem; margin: 0.5rem 0;">
      <input type="password" id="password" placeholder="Senha" style="width: 100%; padding: 0.5rem; margin: 0.5rem 0;">
      <button onclick="login()" style="width: 100%; padding: 0.75rem; background: blue; color: white; border: none; cursor: pointer;">
        ENTRAR
      </button>
    </div>
    <p>Teste: cliente / cliente123</p>
  </div>
`;
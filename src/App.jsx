import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, FileText, LogOut, CheckCircle2, 
  AlertCircle, Check, Lock, Mail, Plus, Edit, Trash2, X, CreditCard, MessageCircle, Sparkles, Heart,
  ArrowUpCircle, ArrowDownCircle, List, Bell, LayoutDashboard, Settings, Search, TrendingUp, TrendingDown,
  Users, UserPlus, Database, Save
} from 'lucide-react';

// --- DADOS E CATÁLOGO ---
const catalogoProdutos = [
  { id: 'p1', nome: 'Taxa de Espaço', preco: 50.00 },
  { id: 'p2', nome: 'Aluguel de Mesa', preco: 15.00 },
  { id: 'p3', nome: 'Taxa de Energia', preco: 10.00 },
  { id: 'p4', nome: 'Taxa de Limpeza', preco: 5.00 },
  { id: 'p5', nome: 'Venda de Pastel', preco: 20.00 },
];

const usuarios = [
  { email: 'admin@feira.com', senha: '123', role: 'admin', nome: 'Administrador' },
  { email: 'feirante@feira.com', senha: '123', role: 'feirante', nome: 'Feirante' } 
];

const dadosIniciais = [
  { id: 1, data: '10/11/2026', tipo: 'Receita', feirante: 'Barraca do Pastel', categoria: 'Vendas', valor: 4500.00, status: 'Pago', pagamento: 'Pix', telefone: '11999999999', produtos: [] },
  { id: 2, data: '09/11/2026', tipo: 'Despesa', feirante: 'Fornecedor Bebidas', categoria: 'Estoque', valor: 1200.00, status: 'Pago', pagamento: 'Pix', telefone: '', produtos: [] },
  { id: 3, data: '08/11/2026', tipo: 'Despesa', feirante: 'Aluguel Espaço', categoria: 'Local', valor: 2500.00, status: 'Pendente', pagamento: 'Boleto', telefone: '', produtos: [] },
  { id: 4, data: '07/11/2026', tipo: 'Receita', feirante: 'Artesanato João', categoria: 'Vendas', valor: 1800.00, status: 'Pago', pagamento: 'Dinheiro', telefone: '21988888888', produtos: [] },
  { id: 5, data: '06/11/2026', tipo: 'Receita', feirante: 'Barraca do Pastel', categoria: 'Vendas', valor: 3200.00, status: 'Pago', pagamento: 'Cartão', telefone: '11999999999', produtos: [] },
];

// --- COMPONENTE DE FUNDO ESTRELADO ---
function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 300 }).map(() => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5, depth: Math.random() * 2 + 0.5,
        twinkleSpeed: Math.random() * 0.03 + 0.01, alpha: Math.random(),
        baseAlpha: Math.random() * 0.4 + 0.2,
        color: ['#ffffff', '#fbcfe8', '#f472b6'][Math.floor(Math.random() * 3)]
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;
      const offsetX = (mouse.x - canvas.width / 2) * 0.05;
      const offsetY = (mouse.y - canvas.height / 2) * 0.05;

      stars.forEach(star => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < star.baseAlpha) star.twinkleSpeed *= -1;
        const currentX = star.x - (offsetX * star.depth);
        const currentY = star.y - (offsetY * star.depth);
        ctx.beginPath();
        ctx.arc(currentX, currentY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.abs(star.alpha);
        ctx.shadowBlur = 10;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.globalAlpha = 1; 
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e) => { targetMouse.x = e.clientX; targetMouse.y = e.clientY; };
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas(); draw();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />;
}

export default function FeiraDaLuaApp() {
  // ESTADOS DE AUTENTICAÇÃO
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  // ESTADO DE NAVEGAÇÃO DA SIDEBAR
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'transacoes', 'feirantes', 'configuracoes'

  // ESTADOS DE DADOS
  const [feiras, setFeiras] = useState(() => {
    const salvo = localStorage.getItem('@feiraDaLua:dados');
    return salvo ? JSON.parse(salvo) : dadosIniciais;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ 
    id: null, data: '', tipo: 'Receita', feirante: '', categoria: 'Vendas', valor: '', status: 'Pago', pagamento: 'Pix', telefone: '', produtos: [] 
  });

  useEffect(() => {
    localStorage.setItem('@feiraDaLua:dados', JSON.stringify(feiras));
  }, [feiras]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErro('');
    const user = usuarios.find(u => u.email === email && u.senha === senha);
    if (user) { setUsuarioLogado(user); setIsLoggedIn(true); } 
    else { setErro('E-mail ou senha incorretos.'); }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setUsuarioLogado(null); setEmail(''); setSenha(''); setActiveTab('dashboard');
  };

  // --- FUNÇÕES DO CRUD ---
  const abrirModalNovo = () => {
    setModalData({ id: null, data: '', tipo: 'Receita', feirante: '', categoria: 'Vendas', valor: '', status: 'Pago', pagamento: 'Pix', telefone: '', produtos: [] });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    setModalData({ ...item, produtos: item.produtos || [] });
    setIsModalOpen(true);
  };

  const toggleProduto = (produtoId, preco) => {
    let novosProdutos; let novoValor = parseFloat(modalData.valor) || 0;
    if (modalData.produtos.includes(produtoId)) {
      novosProdutos = modalData.produtos.filter(id => id !== produtoId);
      novoValor -= preco;
    } else {
      novosProdutos = [...modalData.produtos, produtoId];
      novoValor += preco;
    }
    if (novoValor < 0) novoValor = 0;
    setModalData({ ...modalData, produtos: novosProdutos, valor: novoValor.toFixed(2) });
  };

  const salvarRegistro = (e) => {
    e.preventDefault();
    if (modalData.id) {
      setFeiras(feiras.map(f => f.id === modalData.id ? { ...modalData, valor: parseFloat(modalData.valor) } : f));
    } else {
      setFeiras([...feiras, { ...modalData, id: Date.now(), valor: parseFloat(modalData.valor) }]);
    }
    setIsModalOpen(false);
  };

  const deletarRegistro = (id) => {
    if(window.confirm('Tem certeza que deseja excluir este registro?')) {
      setFeiras(feiras.filter(f => f.id !== id));
    }
  };

  const marcarComoPago = (id) => {
    setFeiras(feiras.map(item => item.id === id ? { ...item, status: 'Pago' } : item));
  };

  const cobrarWhatsApp = (item) => {
    const numeroLimpo = item.telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá! Passando para lembrar sobre o pagamento do dia ${item.data} no valor de R$ ${item.valor.toFixed(2)}.`);
    window.open(`https://wa.me/55${numeroLimpo}?text=${mensagem}`, '_blank');
  };

  // --- CÁLCULOS GERAIS ---
  const receitas = feiras.filter(f => f.tipo === 'Receita' && f.status !== 'Cancelado').reduce((acc, curr) => acc + curr.valor, 0);
  const despesas = feiras.filter(f => f.tipo === 'Despesa' && f.status !== 'Cancelado').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoAtual = receitas - despesas;
  const totalTransacoes = feiras.length;
  const pendencias = feiras.filter(f => f.status === 'Pendente');

  // --- AGRUPAMENTO DE FEIRANTES PARA A ABA "FEIRANTES" ---
  const feirantesAgrupados = feiras.reduce((acc, curr) => {
    if (!acc[curr.feirante]) {
      acc[curr.feirante] = { nome: curr.feirante, receitas: 0, despesas: 0, total: 0 };
    }
    if (curr.tipo === 'Receita') acc[curr.feirante].receitas += curr.valor;
    else acc[curr.feirante].despesas += curr.valor;
    acc[curr.feirante].total = acc[curr.feirante].receitas - acc[curr.feirante].despesas;
    return acc;
  }, {});
  const listaFeirantes = Object.values(feirantesAgrupados);

  // ==========================================
  // TELA DE LOGIN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#12030d] selection:bg-pink-500 selection:text-white">
        <Starfield />
        <div className="animate-fade-in z-10 bg-[#1f0819]/90 backdrop-blur-xl border border-pink-500/20 rounded-3xl p-8 w-full max-w-md shadow-[0_20px_50px_rgba(219,39,119,0.2)]">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-2xl shadow-lg shadow-pink-500/30 mb-4">
              <Moon className="text-white w-8 h-8 fill-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">FEIRA DA LUA</h1>
            <p className="text-sm text-pink-300 mt-1 font-medium">Gestão Financeira Inteligente</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {erro && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-xl text-center">{erro}</div>}
            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-pink-500" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-pink-500 transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-pink-500" size={18} />
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-pink-500 transition-all" required />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-pink-500/30 mt-6">
              Entrar no Painel
            </button>
          </form>
          <div className="mt-6 pt-4 border-t border-pink-500/10 text-xs text-pink-400 text-center">
            <p className="cursor-pointer hover:text-pink-200" onClick={() => {setEmail('admin@feira.com'); setSenha('123')}}><strong>Admin:</strong> admin@feira.com / 123</p>
            <p className="cursor-pointer hover:text-pink-200 mt-1" onClick={() => {setEmail('feirante@feira.com'); setSenha('123')}}><strong>Feirante:</strong> feirante@feira.com / 123</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // LAYOUT DO DASHBOARD PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen flex bg-[#12030d] text-white font-sans selection:bg-pink-500 selection:text-white">
      
      <Starfield />

      {/* SIDEBAR ESQUERDA (Menu) */}
      <aside className="w-64 bg-[#1f0819] border-r border-pink-500/10 flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-pink-500/10">
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-xl shadow-lg shadow-pink-500/20">
            <Moon className="text-white w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide">FEIRA DA LUA</h1>
            <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold">Sistema de Gestão</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* BOTÃO DASHBOARD */}
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors border 
              ${activeTab === 'dashboard' ? 'bg-pink-500/10 text-pink-300 border-pink-500/20' : 'text-pink-200/60 border-transparent hover:text-pink-100 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          {/* BOTÃO TRANSAÇÕES */}
          <button 
            onClick={() => setActiveTab('transacoes')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors border 
              ${activeTab === 'transacoes' ? 'bg-pink-500/10 text-pink-300 border-pink-500/20' : 'text-pink-200/60 border-transparent hover:text-pink-100 hover:bg-white/5'}`}
          >
            <List size={20} /> Transações
          </button>
          
          {/* BOTÃO FEIRANTES */}
          <button 
            onClick={() => setActiveTab('feirantes')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors border 
              ${activeTab === 'feirantes' ? 'bg-pink-500/10 text-pink-300 border-pink-500/20' : 'text-pink-200/60 border-transparent hover:text-pink-100 hover:bg-white/5'}`}
          >
            <Users size={20} /> Feirantes
          </button>

          {/* BOTÃO CONFIGURAÇÕES */}
          <button 
            onClick={() => setActiveTab('configuracoes')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors border 
              ${activeTab === 'configuracoes' ? 'bg-pink-500/10 text-pink-300 border-pink-500/20' : 'text-pink-200/60 border-transparent hover:text-pink-100 hover:bg-white/5'}`}
          >
            <Settings size={20} /> Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-pink-500/10">
          <div className="flex items-center gap-3 bg-[#12030d] p-3 rounded-xl border border-pink-500/10 mb-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold border border-pink-500/30">
              {usuarioLogado.nome.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{usuarioLogado.nome}</p>
              <p className="text-xs text-pink-400 capitalize">{usuarioLogado.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-sm font-bold text-pink-300 hover:text-white hover:bg-pink-500/20 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (Direita) */}
      <main className="flex-1 ml-64 p-8 space-y-8 relative z-10">
        
        {/* HEADER DA PÁGINA */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white capitalize">
              {activeTab === 'dashboard' ? 'Visão Geral' : activeTab}
            </h2>
            <p className="text-pink-300 text-sm mt-1">Gerencie as informações da sua feira.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-pink-400" size={18} />
              <input type="text" placeholder="Buscar..." className="bg-[#1f0819] border border-pink-500/20 text-sm text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-pink-500 w-64" />
            </div>
            {usuarioLogado.role === 'admin' && (
              <button onClick={abrirModalNovo} className="bg-pink-500 hover:bg-pink-400 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-pink-500/30">
                <Plus size={18} /> Nova Transação
              </button>
            )}
          </div>
        </div>

        {/* ======================= CONTEÚDO: DASHBOARD ======================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* CARDS DE MÉTRICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="Saldo em Caixa" value={`R$ ${saldoAtual.toFixed(2)}`} icon={<List size={20} />} trend={saldoAtual >= 0 ? "+12%" : "-5%"} isPositive={saldoAtual >= 0} />
              <MetricCard title="Receita Total" value={`R$ ${receitas.toFixed(2)}`} icon={<ArrowDownCircle size={20} />} trend="+8%" isPositive={true} color="text-emerald-400" bgColor="bg-emerald-500/10" />
              <MetricCard title="Despesas Totais" value={`R$ ${despesas.toFixed(2)}`} icon={<ArrowUpCircle size={20} />} trend="+2%" isPositive={false} color="text-rose-400" bgColor="bg-rose-500/10" />
              <MetricCard title="Transações" value={totalTransacoes} icon={<FileText size={20} />} trend="+15%" isPositive={true} color="text-blue-400" bgColor="bg-blue-500/10" />
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#1f0819] border border-pink-500/10 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Desempenho de Vendas</h3>
                </div>
                <div className="relative h-64 w-full">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0, 25, 50, 75, 100].map((y) => (
                      <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    ))}
                    <path d="M0,80 C15,70 25,30 40,40 C55,50 65,90 80,60 C90,40 95,20 100,30 L100,100 L0,100 Z" fill="url(#areaGradient)" />
                    <path d="M0,80 C15,70 25,30 40,40 C55,50 65,90 80,60 C90,40 95,20 100,30" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="bg-[#1f0819] border border-pink-500/10 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-white mb-6 w-full text-left">Vendas por Categoria</h3>
                <div className="relative w-48 h-48 rounded-full mb-6" style={{ background: 'conic-gradient(#ec4899 0% 45%, #f472b6 45% 75%, #fb7185 75% 90%, #be185d 90% 100%)' }}>
                  <div className="absolute inset-6 bg-[#1f0819] rounded-full flex flex-col items-center justify-center">
                    <span className="text-sm text-pink-400 font-medium">Total</span>
                    <span className="text-2xl font-black text-white">100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABELA RESUMO E ALERTAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#1f0819] border border-pink-500/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-pink-500/10 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Últimas Transações</h3>
                  <button onClick={() => setActiveTab('transacoes')} className="text-sm text-pink-400 hover:text-pink-300">Ver todas</button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-pink-400/80 border-b border-pink-500/10 text-xs uppercase tracking-wider">
                      <tr><th className="py-4 px-6">Fornecedor</th><th className="py-4 px-6">Data</th><th className="py-4 px-6">Valor</th></tr>
                    </thead>
                    <tbody className="divide-y divide-pink-500/5">
                      {feiras.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-pink-500/5 text-pink-100">
                          <td className="py-4 px-6 font-medium">{item.feirante}</td>
                          <td className="py-4 px-6 text-pink-300 text-xs">{item.data}</td>
                          <td className={`py-4 px-6 font-bold ${item.tipo === 'Receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.tipo === 'Despesa' ? '-' : '+'} R$ {item.valor.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#1f0819] border border-pink-500/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">Alertas Pendentes</h3>
                <div className="space-y-4">
                  {pendencias.length > 0 ? pendencias.map((p, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#12030d] p-4 rounded-xl border border-pink-500/10">
                      <div><p className="text-sm font-bold text-white">{p.feirante}</p><p className="text-xs text-pink-400 mt-1">Vence em: {p.data}</p></div>
                      <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400"><Bell size={14} /></div>
                    </div>
                  )) : <p className="text-sm text-pink-400 italic text-center py-4">Tudo em dia!</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= CONTEÚDO: TRANSAÇÕES ======================= */}
        {activeTab === 'transacoes' && (
          <div className="bg-[#1f0819] border border-pink-500/10 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-pink-500/10">
              <h3 className="text-lg font-bold text-white">Histórico Completo de Transações</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-pink-400/80 border-b border-pink-500/10 text-xs uppercase tracking-wider bg-[#12030d]/50">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Fornecedor</th>
                    <th className="py-4 px-6 font-semibold">Data</th>
                    <th className="py-4 px-6 font-semibold">Categoria</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold">Valor</th>
                    {usuarioLogado.role === 'admin' && <th className="py-4 px-6 font-semibold text-center">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-500/5">
                  {feiras.map((item) => (
                    <tr key={item.id} className="hover:bg-pink-500/5 transition-colors text-pink-100">
                      <td className="py-4 px-6 font-medium flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.tipo === 'Receita' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {item.tipo === 'Receita' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                        </div>
                        {item.feirante}
                      </td>
                      <td className="py-4 px-6 text-pink-300 text-xs">{item.data}</td>
                      <td className="py-4 px-6 text-pink-300">{item.categoria}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                          ${item.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                          ${item.status === 'Pendente' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                          ${item.status === 'Cancelado' ? 'bg-slate-500/10 text-slate-400' : ''}
                        `}>
                          {item.status === 'Pago' ? 'Concluído' : item.status}
                        </span>
                      </td>
                      <td className={`py-4 px-6 font-bold ${item.tipo === 'Receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.tipo === 'Despesa' ? '-' : '+'} R$ {item.valor.toFixed(2)}
                      </td>
                      {usuarioLogado.role === 'admin' && (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
                            {item.status === 'Pendente' && (
                              <button onClick={() => marcarComoPago(item.id)} className="text-teal-400 hover:text-teal-300" title="Pagar"><Check size={16} /></button>
                            )}
                            <button onClick={() => abrirModalEditar(item)} className="text-blue-400 hover:text-blue-300" title="Editar"><Edit size={16} /></button>
                            <button onClick={() => deletarRegistro(item.id)} className="text-rose-400 hover:text-rose-300" title="Excluir"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= CONTEÚDO: FEIRANTES ======================= */}
        {activeTab === 'feirantes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listaFeirantes.map((f, index) => (
                <div key={index} className="bg-[#1f0819] border border-pink-500/10 rounded-2xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {f.nome.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{f.nome}</h3>
                      <p className="text-xs text-pink-400">Balanço Geral</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-pink-300">Receitas:</span>
                      <span className="font-bold text-emerald-400">R$ {f.receitas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-pink-300">Despesas/Taxas:</span>
                      <span className="font-bold text-rose-400">R$ {f.despesas.toFixed(2)}</span>
                    </div>
                    <div className="h-px w-full bg-pink-500/10 my-2"></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-white">Saldo:</span>
                      <span className={`font-black ${f.total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        R$ {f.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= CONTEÚDO: CONFIGURAÇÕES ======================= */}
        {activeTab === 'configuracoes' && (
          <div className="bg-[#1f0819] border border-pink-500/10 rounded-2xl p-8 shadow-xl animate-fade-in max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-pink-500/10 pb-4">Configurações do Sistema</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#12030d] p-4 rounded-xl border border-pink-500/10">
                <div className="flex items-center gap-3">
                  <Database className="text-pink-400" />
                  <div>
                    <p className="font-bold text-white">Backup de Dados</p>
                    <p className="text-xs text-pink-300">Salvar uma cópia dos dados atuais.</p>
                  </div>
                </div>
                <button onClick={() => alert('Backup realizado com sucesso (simulação)!')} className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-lg font-bold hover:bg-pink-500/30 transition-colors">
                  <Save size={16} />
                </button>
              </div>

              {usuarioLogado.role === 'admin' && (
                <div className="flex items-center justify-between bg-[#12030d] p-4 rounded-xl border border-rose-500/20">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-rose-400" />
                    <div>
                      <p className="font-bold text-white">Limpar Todos os Dados</p>
                      <p className="text-xs text-rose-300">Apaga o histórico e volta ao padrão inicial.</p>
                    </div>
                  </div>
                  <button onClick={() => {
                    if(window.confirm('CUIDADO: Isso apagará todos os dados e reiniciará o sistema. Continuar?')) {
                      setFeiras(dadosIniciais);
                      localStorage.removeItem('@feiraDaLua:dados');
                    }
                  }} className="bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg font-bold hover:bg-rose-500/30 transition-colors text-sm">
                    Resetar
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-pink-500/10">
                <p className="text-sm text-pink-300 text-center">Feira da Lua - Sistema de Gestão Financeira v1.0</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && usuarioLogado.role === 'admin' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="animate-slide-up bg-[#1f0819] border border-pink-500/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-pink-500/10 bg-[#12030d] shrink-0">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                {modalData.id ? <Edit size={20} className="text-pink-400"/> : <Plus size={20} className="text-pink-400"/>}
                {modalData.id ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-pink-400 hover:text-rose-400 bg-white/5 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={salvarRegistro} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">Data</label>
                  <input type="text" placeholder="10/11/2026" value={modalData.data} onChange={(e) => setModalData({...modalData, data: e.target.value})} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl p-2.5 focus:border-pink-400 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">Tipo</label>
                  <select value={modalData.tipo} onChange={(e) => setModalData({...modalData, tipo: e.target.value})} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl p-2.5 focus:border-pink-400 outline-none cursor-pointer">
                    <option value="Receita">Receita (Entrada)</option>
                    <option value="Despesa">Despesa (Saída)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">Fornecedor / Barraca</label>
                  <input type="text" placeholder="Ex: Barraca do Pastel" value={modalData.feirante} onChange={(e) => setModalData({...modalData, feirante: e.target.value})} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl p-2.5 focus:border-pink-400 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">Categoria</label>
                  <select value={modalData.categoria} onChange={(e) => setModalData({...modalData, categoria: e.target.value})} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl p-2.5 focus:border-pink-400 outline-none cursor-pointer">
                    <option value="Vendas">Vendas</option>
                    <option value="Local">Local</option>
                    <option value="Estoque">Estoque</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">Produtos / Taxas Adicionais</label>
                <div className="grid grid-cols-2 gap-2">
                  {catalogoProdutos.map(prod => {
                    const isSelected = modalData.produtos.includes(prod.id);
                    return (
                      <button key={prod.id} type="button" onClick={() => toggleProduto(prod.id, prod.preco)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all text-left
                          ${isSelected ? 'bg-pink-500/20 border-pink-500 text-white' : 'bg-[#12030d] border-pink-500/10 text-pink-300 hover:bg-white/5'}
                        `}
                      >
                        <span>{prod.nome}</span>
                        <span className="opacity-75">R$ {prod.preco.toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">Valor Total</label>
                  <input type="number" step="0.01" value={modalData.valor} onChange={(e) => setModalData({...modalData, valor: e.target.value})} className="w-full bg-[#12030d] border border-pink-500/30 text-pink-400 font-bold rounded-xl p-2.5 focus:border-pink-400 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">Telefone (Opcional)</label>
                  <input type="text" placeholder="11999999999" value={modalData.telefone} onChange={(e) => setModalData({...modalData, telefone: e.target.value})} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl p-2.5 focus:border-pink-400 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">Forma Pgto</label>
                  <select value={modalData.pagamento} onChange={(e) => setModalData({...modalData, pagamento: e.target.value})} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl p-2.5 focus:border-pink-400 outline-none cursor-pointer">
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">Status</label>
                  <select value={modalData.status} onChange={(e) => setModalData({...modalData, status: e.target.value})} className="w-full bg-[#12030d] border border-pink-500/20 text-white rounded-xl p-2.5 focus:border-pink-400 outline-none cursor-pointer">
                    <option value="Pago">Concluído</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 border-t border-pink-500/10 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent hover:bg-white/5 text-pink-300 border border-pink-500/20 font-bold py-2.5 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-pink-500/20">
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE AUXILIAR PARA OS CARDS DE MÉTRICA ---
function MetricCard({ title, value, icon, trend, isPositive, color = "text-white", bgColor = "bg-pink-500/10" }) {
  return (
    <div className="bg-[#1f0819] border border-pink-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-pink-500/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${bgColor} ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-sm font-semibold text-pink-300 mb-1">{title}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
  );
}
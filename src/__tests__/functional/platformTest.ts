// Complete platform functional test
import { FunctionalTester } from '../utils/functionalTester';

export async function runPlatformTest() {
  const tester = new FunctionalTester();
  
  try {
    console.log('🚀 Iniciando teste abrangente da plataforma SoLabs...\n');
    
    const suites = await tester.runCompleteTest();
    const report = tester.generateReport(suites);
    
    console.log(report);
    
    // Also return structured data for programmatic use
    return {
      success: true,
      suites,
      summary: {
        totalTests: suites.reduce((sum, suite) => sum + suite.summary.total, 0),
        totalPassed: suites.reduce((sum, suite) => sum + suite.summary.passed, 0),
        totalFailed: suites.reduce((sum, suite) => sum + suite.summary.failed, 0),
        totalWarnings: suites.reduce((sum, suite) => sum + suite.summary.warnings, 0),
      }
    };
  } catch (error) {
    console.error('❌ Erro durante o teste da plataforma:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Manual test checklist for interactive verification
export const MANUAL_TEST_CHECKLIST = `
🔍 CHECKLIST DE TESTE MANUAL - PLATAFORMA SOLABS
================================================================

📱 TESTE DE AUTENTICAÇÃO (5 usuários)
□ Login como Super Admin (superadmin@solabs.com / super123)
□ Login como Admin Cliente A (admin@solabs.com / admin123)  
□ Login como Operador Cliente A (operador@solabs.com / operador123)
□ Login como Admin Cliente B (admin.beta@company.com / beta123)
□ Login como Operador Cliente B (user.beta@company.com / beta123)

🏠 TESTE DA ÁREA OPERACIONAL (Dashboard)
□ Visualizar lista de conversações
□ Usar filtros de status (open, pending, snoozed, resolved)
□ Testar busca em tempo real com debounce
□ Aplicar filtros avançados
□ Selecionar conversa e visualizar mensagens
□ Enviar mensagem no composer
□ Atribuir agente/equipe a conversa
□ Aplicar/remover labels
□ Testar responsividade móvel

🔧 TESTE DA ÁREA ADMINISTRATIVA (Super Admin)
□ Acessar /admin (deve funcionar apenas para super_admin)
□ Gerenciar Clientes:
  - Criar novo cliente
  - Editar cliente existente  
  - Ativar/desativar cliente
  - Buscar clientes
□ Gerenciar Agentes:
  - Criar novo agente
  - Editar agente
  - Excluir agente
  - Atribuir a inboxes
□ Gerenciar Inboxes:
  - Criar inbox WhatsApp (wizard)
  - Criar inbox Facebook (wizard)
  - Criar inbox Instagram (wizard)
  - Editar configurações
  - Gerenciar membros
□ Gerenciar Equipes:
  - Criar equipe (wizard)
  - Adicionar/remover membros
  - Configurar auto-atribuição
□ Gerenciar Labels:
  - Criar label com cor personalizada
  - Editar label existente
  - Excluir label
  - Testar aplicação em conversas
□ Visualizar Logs de Auditoria:
  - Filtrar por data
  - Filtrar por ação
  - Exportar dados
  - Visualizar logs por inbox

🛡️ TESTE DE SEGURANÇA E RBAC
□ Tentar acessar /admin como admin/user (deve redirecionar)
□ Verificar isolamento entre clientes
□ Validar filtros automáticos por account_id
□ Testar logout e redirecionamento

⚡ TESTE DE PERFORMANCE
□ Verificar carregamento inicial rápido
□ Testar scroll infinito em listas grandes
□ Verificar responsividade em mobile
□ Confirmar ausência de console.log em produção

================================================================
✅ TODOS OS ITENS VERIFICADOS = PLATAFORMA FUNCIONAL
`;
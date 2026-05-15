const PERMISSOES_PADRAO = {
  Administrador: {
    verDashboard:true, verEstoque:true, editarEstoque:true,
    registrarCorte:true, verRelatorios:true, gerenciarUsuarios:true,
    verConfiguracoes:true, verEmpresa:true,
  },
  Estoquista: {
    verDashboard:true, verEstoque:true, editarEstoque:true,
    registrarCorte:true, verRelatorios:false, gerenciarUsuarios:false,
    verConfiguracoes:true, verEmpresa:false,
  },
  Vendedor: {
    verDashboard:true, verEstoque:true, editarEstoque:false,
    registrarCorte:false, verRelatorios:false, gerenciarUsuarios:false,
    verConfiguracoes:true, verEmpresa:false,
  },
}

module.exports = { PERMISSOES_PADRAO }

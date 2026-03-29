const cadastrosService = require('../services/cadastros.service');

// ======================================================
// CONTROLLER: CLIENTES
// ======================================================

/**
 * GET /api/cadastros/clientes
 */
async function listarClientes(req, res) {
  try {
    const clientes = await cadastrosService.listarClientes();

    return res.status(200).json({
      success: true,
      total: clientes.length,
      data: clientes
    });
  } catch (error) {
    console.error('❌ Erro ao listar clientes:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro ao listar clientes.',
      error: error.message
    });
  }
}

// ======================================================
// CONTROLLER: CONTRATOS
// ======================================================

/**
 * GET /api/cadastros/contratos
 */
async function listarContratos(req, res) {
  try {
    const contratos = await cadastrosService.listarContratos();

    return res.status(200).json({
      success: true,
      total: contratos.length,
      data: contratos
    });
  } catch (error) {
    console.error('❌ Erro ao listar contratos:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro ao listar contratos.',
      error: error.message
    });
  }
}

// ======================================================
// CONTROLLER: EQUIPAMENTO POR TAG
// ======================================================

/**
 * GET /api/cadastros/equipamentos/tag/:tag
 */
async function buscarEquipamentoPorTag(req, res) {
  try {
    const { tag } = req.params;

    if (!tag || !String(tag).trim()) {
      return res.status(400).json({
        success: false,
        message: 'A TAG do equipamento é obrigatória.'
      });
    }

    const equipamento = await cadastrosService.buscarEquipamentoPorTag(tag);

    if (!equipamento) {
      return res.status(404).json({
        success: false,
        message: 'Equipamento não encontrado para a TAG informada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: equipamento
    });
  } catch (error) {
    console.error('❌ Erro ao buscar equipamento por TAG:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar equipamento por TAG.',
      error: error.message
    });
  }
}

// ======================================================
// CONTROLLER: TÉCNICOS FILTRADOS
// ======================================================

/**
 * GET /api/cadastros/tecnicos?contrato_id=1&turno=A
 */
async function listarTecnicos(req, res) {
  try {
    const { contrato_id, turno } = req.query;

    const tecnicos = await cadastrosService.listarTecnicos(
      contrato_id || null,
      turno || null
    );

    return res.status(200).json({
      success: true,
      total: tecnicos.length,
      filtros: {
        contrato_id: contrato_id || null,
        turno: turno || null
      },
      data: tecnicos
    });
  } catch (error) {
    console.error('❌ Erro ao listar técnicos:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro ao listar técnicos.',
      error: error.message
    });
  }
}

// ======================================================
// EXPORTAÇÕES
// ======================================================

module.exports = {
  listarClientes,
  listarContratos,
  buscarEquipamentoPorTag,
  listarTecnicos
};
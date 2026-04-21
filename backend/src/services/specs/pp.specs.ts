export const PP_SPECS: Record<string, object> = {
  'production-order': {
    openapi: '3.0.0',
    info: { title: 'Production Order (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_PRODUCTION_ORDER_2_SRV/A_ProductionOrder_2': {
        get: { summary: 'Üretim emri listesi', operationId: 'getProductionOrders', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: OrderType eq 'PP01'" }, { name: '$select', in: 'query', schema: { type: 'string' } }, { name: '$expand', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_PRODUCTION_ORDER_2_SRV/A_ProductionOrder_2(\'{ManufacturingOrder}\')': {
        get: { summary: 'Üretim emri getir', operationId: 'getProductionOrderById', parameters: [{ name: 'ManufacturingOrder', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'Üretim emri güncelle', operationId: 'updateProductionOrder', parameters: [{ name: 'ManufacturingOrder', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { MfgOrderPlannedStartDate: { type: 'string' }, MfgOrderPlannedEndDate: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
      },
      '/sap/opu/odata/sap/API_PRODUCTION_ORDER_2_SRV/A_ProductionOrderComponent_2': {
        get: { summary: 'Üretim emri bileşenleri', operationId: 'getProductionOrderComponents', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_PRODUCTION_ORDER_2_SRV/A_ProductionOrderOperation_2': {
        get: { summary: 'Üretim emri operasyonları', operationId: 'getProductionOrderOperations', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'bill-of-material': {
    openapi: '3.0.0',
    info: { title: 'Bill of Material (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002/MaterialBOMItem': {
        get: { summary: 'Malzeme listesi (BOM) kalemleri', operationId: 'getBOMItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: Material eq 'TG11' and Plant eq '1010'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'BOM kalemi oluştur', operationId: 'createBOMItem', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['Material', 'Plant', 'BillOfMaterialCategory'], properties: { Material: { type: 'string', example: 'TG11' }, Plant: { type: 'string', example: '1010' }, BillOfMaterialCategory: { type: 'string', example: 'M' }, BOMComponent: { type: 'string' }, ComponentQuantity: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002/MaterialBOMItem(\'{BillOfMaterial}\',\'{BillOfMaterialCategory}\',\'{BillOfMaterialVariant}\',\'{BillOfMaterialItemNodeNumber}\',\'{HeaderChangeDocument}\',\'{Material}\')': {
        get: { summary: 'BOM kalemi getir', operationId: 'getBOMItemById', parameters: [{ name: 'BillOfMaterial', in: 'path', required: true, schema: { type: 'string' } }, { name: 'BillOfMaterialCategory', in: 'path', required: true, schema: { type: 'string' } }, { name: 'BillOfMaterialVariant', in: 'path', required: true, schema: { type: 'string' } }, { name: 'BillOfMaterialItemNodeNumber', in: 'path', required: true, schema: { type: 'string' } }, { name: 'HeaderChangeDocument', in: 'path', required: true, schema: { type: 'string' } }, { name: 'Material', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'work-center': {
    openapi: '3.0.0',
    info: { title: 'Work Center (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_WORK_CENTER_SRV;v=0002/A_WorkCenterHeader': {
        get: { summary: 'İş merkezi listesi', operationId: 'getWorkCenters', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: Plant eq '1010'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_WORK_CENTER_SRV;v=0002/A_WorkCenterHeader(\'{WorkCenter}\',\'{WorkCenterTypeCode}\',\'{Plant}\')': {
        get: { summary: 'İş merkezi getir', operationId: 'getWorkCenterById', parameters: [{ name: 'WorkCenter', in: 'path', required: true, schema: { type: 'string' } }, { name: 'WorkCenterTypeCode', in: 'path', required: true, schema: { type: 'string' } }, { name: 'Plant', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_WORK_CENTER_SRV;v=0002/A_WorkCenterCostCenter': {
        get: { summary: 'İş merkezi maliyet merkezi ilişkisi', operationId: 'getWorkCenterCostCenters', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'planned-order': {
    openapi: '3.0.0',
    info: { title: 'Planned Order (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_PLANNED_ORDERS/A_PlannedOrder': {
        get: { summary: 'Planlı sipariş listesi', operationId: 'getPlannedOrders', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: Plant eq '1010'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_PLANNED_ORDERS/A_PlannedOrder(\'{PlannedOrder}\')': {
        get: { summary: 'Planlı sipariş getir', operationId: 'getPlannedOrderById', parameters: [{ name: 'PlannedOrder', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        delete: { summary: 'Planlı sipariş sil', operationId: 'deletePlannedOrder', parameters: [{ name: 'PlannedOrder', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'Silindi' } } },
      },
      '/sap/opu/odata/sap/API_PLANNED_ORDERS/A_PlannedOrderComponent': {
        get: { summary: 'Planlı sipariş bileşenleri', operationId: 'getPlannedOrderComponents', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },
};

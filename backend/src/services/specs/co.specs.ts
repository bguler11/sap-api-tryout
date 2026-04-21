export const CO_SPECS: Record<string, object> = {
  'cost-center': {
    openapi: '3.0.0',
    info: { title: 'Cost Center (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_COSTCENTER_SRV;v=0002/A_CostCenter': {
        get: { summary: 'Maliyet merkezi listesi', operationId: 'getCostCenters', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: ControllingArea eq 'A000'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Maliyet merkezi oluştur', operationId: 'createCostCenter', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['ControllingArea', 'CostCenter', 'ValidityEndDate', 'ValidityStartDate'], properties: { ControllingArea: { type: 'string', example: 'A000' }, CostCenter: { type: 'string', example: '10001100' }, ValidityEndDate: { type: 'string', example: '9999-12-31' }, ValidityStartDate: { type: 'string', example: '2026-01-01' }, CostCenterName: { type: 'string' }, CompanyCode: { type: 'string', example: '1010' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_COSTCENTER_SRV;v=0002/A_CostCenter(\'{ControllingArea}\',\'{CostCenter}\',\'{ValidityEndDate}\')': {
        get: { summary: 'Maliyet merkezi getir', operationId: 'getCostCenterById', parameters: [{ name: 'ControllingArea', in: 'path', required: true, schema: { type: 'string' } }, { name: 'CostCenter', in: 'path', required: true, schema: { type: 'string' } }, { name: 'ValidityEndDate', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'Maliyet merkezi güncelle', operationId: 'updateCostCenter', parameters: [{ name: 'ControllingArea', in: 'path', required: true, schema: { type: 'string' } }, { name: 'CostCenter', in: 'path', required: true, schema: { type: 'string' } }, { name: 'ValidityEndDate', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { CostCenterName: { type: 'string' }, CostCenterDescription: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
      },
      '/sap/opu/odata/sap/API_COSTCENTER_SRV;v=0002/A_CostCenterText': {
        get: { summary: 'Maliyet merkezi metinleri', operationId: 'getCostCenterTexts', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'profit-center': {
    openapi: '3.0.0',
    info: { title: 'Profit Center (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_PROFITCENTER_SRV;v=0002/A_ProfitCenter': {
        get: { summary: 'Kâr merkezi listesi', operationId: 'getProfitCenters', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: ControllingArea eq 'A000'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Kâr merkezi oluştur', operationId: 'createProfitCenter', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['ControllingArea', 'ProfitCenter'], properties: { ControllingArea: { type: 'string', example: 'A000' }, ProfitCenter: { type: 'string', example: 'YB100' }, ValidityEndDate: { type: 'string', example: '9999-12-31' }, ValidityStartDate: { type: 'string', example: '2026-01-01' }, ProfitCenterName: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_PROFITCENTER_SRV;v=0002/A_ProfitCenter(\'{ControllingArea}\',\'{ProfitCenter}\',\'{ValidityEndDate}\')': {
        get: { summary: 'Kâr merkezi getir', operationId: 'getProfitCenterById', parameters: [{ name: 'ControllingArea', in: 'path', required: true, schema: { type: 'string' } }, { name: 'ProfitCenter', in: 'path', required: true, schema: { type: 'string' } }, { name: 'ValidityEndDate', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'internal-order': {
    openapi: '3.0.0',
    info: { title: 'Internal Order (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_INTERNALORDER_SRV/A_InternalOrder': {
        get: { summary: 'Dahili sipariş listesi', operationId: 'getInternalOrders', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: OrderType eq 'OE01'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Dahili sipariş oluştur', operationId: 'createInternalOrder', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { OrderType: { type: 'string', example: 'OE01' }, ControllingArea: { type: 'string', example: 'A000' }, CompanyCode: { type: 'string', example: '1010' }, OrderDescription: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_INTERNALORDER_SRV/A_InternalOrder(\'{OrderID}\')': {
        get: { summary: 'Dahili sipariş getir', operationId: 'getInternalOrderById', parameters: [{ name: 'OrderID', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'Dahili sipariş güncelle', operationId: 'updateInternalOrder', parameters: [{ name: 'OrderID', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { OrderDescription: { type: 'string' }, ResponsibleCostCenter: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
      },
    },
  },

  'cost-center-activity-type': {
    openapi: '3.0.0',
    info: { title: 'Cost Center Activity Type (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_COSTCENTERACTIVITYTYPE_SRV;v=0002/A_CostCtrActivityType': {
        get: { summary: 'Faaliyet türü listesi', operationId: 'getCostCenterActivityTypes', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: ControllingArea eq 'A000'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_COSTCENTERACTIVITYTYPE_SRV;v=0002/A_CostCtrActivityType(\'{ControllingArea}\',\'{CostCtrActivityType}\',\'{ValidityEndDate}\')': {
        get: { summary: 'Faaliyet türü getir', operationId: 'getCostCenterActivityTypeById', parameters: [{ name: 'ControllingArea', in: 'path', required: true, schema: { type: 'string' } }, { name: 'CostCtrActivityType', in: 'path', required: true, schema: { type: 'string' } }, { name: 'ValidityEndDate', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },
};

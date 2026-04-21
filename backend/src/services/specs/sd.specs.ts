export const SD_SPECS: Record<string, object> = {
  'sales-order': {
    openapi: '3.0.0',
    info: { title: 'Sales Order (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder': {
        get: { summary: 'Satış siparişi listesi', operationId: 'getSalesOrders', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$skip', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: SalesOrderType eq 'OR'" }, { name: '$select', in: 'query', schema: { type: 'string' } }, { name: '$expand', in: 'query', schema: { type: 'string' }, description: 'Örn: to_Item' }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Satış siparişi oluştur', operationId: 'createSalesOrder', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['SalesOrderType', 'SalesOrganization'], properties: { SalesOrderType: { type: 'string', example: 'OR' }, SalesOrganization: { type: 'string', example: '1010' }, DistributionChannel: { type: 'string', example: '10' }, OrganizationDivision: { type: 'string', example: '00' }, SoldToParty: { type: 'string', example: '10000001' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder(\'{SalesOrder}\')': {
        get: { summary: 'Satış siparişi getir', operationId: 'getSalesOrderById', parameters: [{ name: 'SalesOrder', in: 'path', required: true, schema: { type: 'string' } }, { name: '$expand', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'Satış siparişi güncelle', operationId: 'updateSalesOrder', parameters: [{ name: 'SalesOrder', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { PurchaseOrderByCustomer: { type: 'string' }, RequestedDeliveryDate: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
        delete: { summary: 'Satış siparişi sil', operationId: 'deleteSalesOrder', parameters: [{ name: 'SalesOrder', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'Silindi' } } },
      },
      '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrderItem': {
        get: { summary: 'Satış siparişi kalemleri', operationId: 'getSalesOrderItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: SalesOrder eq '1234'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrderScheduleLine': {
        get: { summary: 'Satış siparişi sevk planı satırları', operationId: 'getSalesOrderScheduleLines', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'outbound-delivery': {
    openapi: '3.0.0',
    info: { title: 'Outbound Delivery (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=0002/A_OutbDeliveryHeader': {
        get: { summary: 'Giden teslimat listesi', operationId: 'getOutboundDeliveries', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: DeliveryType eq 'LF'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=0002/A_OutbDeliveryHeader(\'{DeliveryDocument}\')': {
        get: { summary: 'Teslimat getir', operationId: 'getOutboundDeliveryById', parameters: [{ name: 'DeliveryDocument', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'Teslimat güncelle', operationId: 'updateOutboundDelivery', parameters: [{ name: 'DeliveryDocument', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { DeliveryDocumentType: { type: 'string' }, ShippingPoint: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
      },
      '/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=0002/A_OutbDeliveryItem': {
        get: { summary: 'Teslimat kalemleri', operationId: 'getOutboundDeliveryItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'billing-document': {
    openapi: '3.0.0',
    info: { title: 'Billing Document (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV/A_BillingDocument': {
        get: { summary: 'Fatura listesi', operationId: 'getBillingDocuments', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: BillingDocumentType eq 'F2'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV/A_BillingDocument(\'{BillingDocument}\')': {
        get: { summary: 'Fatura getir', operationId: 'getBillingDocumentById', parameters: [{ name: 'BillingDocument', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV/A_BillingDocumentItem': {
        get: { summary: 'Fatura kalemleri', operationId: 'getBillingDocumentItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'customer-material': {
    openapi: '3.0.0',
    info: { title: 'Customer Material (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_CUSTOMER_MATERIAL_SRV/A_CustomerMaterial': {
        get: { summary: 'Müşteri malzeme bilgisi listesi', operationId: 'getCustomerMaterials', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Müşteri malzeme bilgisi oluştur', operationId: 'createCustomerMaterial', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['Customer', 'Material', 'SalesOrganization', 'DistributionChannel'], properties: { Customer: { type: 'string', example: '10000001' }, Material: { type: 'string', example: 'TG11' }, SalesOrganization: { type: 'string', example: '1010' }, DistributionChannel: { type: 'string', example: '10' }, CustomerMaterialItemUsage: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
    },
  },

  'sales-pricing': {
    openapi: '3.0.0',
    info: { title: 'Sales Pricing (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_SLSPRICINGCONDITIONRECORD_SRV/A_SlsPricingConditionRecord': {
        get: { summary: 'Fiyat koşulu kayıtları', operationId: 'getPricingConditions', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: ConditionType eq 'PR00'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Fiyat koşulu kaydı oluştur', operationId: 'createPricingCondition', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { ConditionType: { type: 'string', example: 'PR00' }, SalesOrganization: { type: 'string' }, DistributionChannel: { type: 'string' }, ConditionRateValue: { type: 'string' }, ConditionRateValueUnit: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
    },
  },
};

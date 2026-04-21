export const MM_SPECS: Record<string, object> = {
  'purchase-order': {
    openapi: '3.0.0',
    info: { title: 'Purchase Order (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder': {
        get: { summary: 'Satın alma siparişi listesi', operationId: 'getPurchaseOrders', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: PurchaseOrderType eq 'NB'" }, { name: '$select', in: 'query', schema: { type: 'string' } }, { name: '$expand', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Satın alma siparişi oluştur', operationId: 'createPurchaseOrder', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['PurchaseOrderType', 'Supplier'], properties: { PurchaseOrderType: { type: 'string', example: 'NB' }, Supplier: { type: 'string', example: '10000001' }, PurchasingOrganization: { type: 'string', example: '1010' }, PurchasingGroup: { type: 'string', example: '001' }, CompanyCode: { type: 'string', example: '1010' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder(\'{PurchaseOrder}\')': {
        get: { summary: 'Satın alma siparişi getir', operationId: 'getPurchaseOrderById', parameters: [{ name: 'PurchaseOrder', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'Satın alma siparişi güncelle', operationId: 'updatePurchaseOrder', parameters: [{ name: 'PurchaseOrder', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { SupplierRespName: { type: 'string' }, PaymentTerms: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
      },
      '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem': {
        get: { summary: 'Satın alma siparişi kalemleri', operationId: 'getPurchaseOrderItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderScheduleLine': {
        get: { summary: 'Satın alma siparişi teslimat planı', operationId: 'getPOScheduleLines', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'purchase-requisition': {
    openapi: '3.0.0',
    info: { title: 'Purchase Requisition (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_PURCHASEREQ_PROCESS_SRV/A_PurchaseRequisitionHeader': {
        get: { summary: 'Satın alma talebi listesi', operationId: 'getPurchaseRequisitions', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Satın alma talebi oluştur', operationId: 'createPurchaseRequisition', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { PurchaseRequisitionType: { type: 'string', example: 'NB' }, PurReqnDescription: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_PURCHASEREQ_PROCESS_SRV/A_PurchaseRequisitionHeader(\'{PurchaseRequisition}\')': {
        get: { summary: 'Satın alma talebi getir', operationId: 'getPurchaseRequisitionById', parameters: [{ name: 'PurchaseRequisition', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_PURCHASEREQ_PROCESS_SRV/A_PurchaseRequisitionItem': {
        get: { summary: 'Satın alma talebi kalemleri', operationId: 'getPurchaseRequisitionItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'product-master': {
    openapi: '3.0.0',
    info: { title: 'Product Master (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product': {
        get: { summary: 'Ürün listesi', operationId: 'getProducts', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: ProductType eq 'FERT'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product(\'{Product}\')': {
        get: { summary: 'Ürün getir', operationId: 'getProductById', parameters: [{ name: 'Product', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'Ürün güncelle', operationId: 'updateProduct', parameters: [{ name: 'Product', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { ProductDescription: { type: 'string' }, BaseUnit: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
      },
      '/sap/opu/odata/sap/API_PRODUCT_SRV/A_ProductPlant': {
        get: { summary: 'Ürün-Fabrika verileri', operationId: 'getProductPlants', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_PRODUCT_SRV/A_ProductSalesDelivery': {
        get: { summary: 'Ürün satış verileri', operationId: 'getProductSalesData', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_PRODUCT_SRV/A_ProductValuation': {
        get: { summary: 'Ürün değerleme verileri', operationId: 'getProductValuation', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'material-document': {
    openapi: '3.0.0',
    info: { title: 'Material Document (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader': {
        get: { summary: 'Malzeme belgesi listesi', operationId: 'getMaterialDocuments', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: GoodsMovementCode eq '01'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Mal hareketi oluştur (GR/GI)', operationId: 'createMaterialDocument', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { PostingDate: { type: 'string', example: '2026-04-21' }, DocumentDate: { type: 'string', example: '2026-04-21' }, GoodsMovementCode: { type: 'string', example: '01', description: '01=GR, 02=GI' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader(\'{MaterialDocumentYear}\',\'{MaterialDocument}\')': {
        get: { summary: 'Malzeme belgesi getir', operationId: 'getMaterialDocumentById', parameters: [{ name: 'MaterialDocumentYear', in: 'path', required: true, schema: { type: 'string' } }, { name: 'MaterialDocument', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentItem': {
        get: { summary: 'Malzeme belgesi kalemleri', operationId: 'getMaterialDocumentItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'inbound-delivery': {
    openapi: '3.0.0',
    info: { title: 'Inbound Delivery (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_INBOUND_DELIVERY_SRV;v=0002/A_InbDeliveryHeader': {
        get: { summary: 'Gelen teslimat listesi', operationId: 'getInboundDeliveries', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_INBOUND_DELIVERY_SRV;v=0002/A_InbDeliveryHeader(\'{DeliveryDocument}\')': {
        get: { summary: 'Gelen teslimat getir', operationId: 'getInboundDeliveryById', parameters: [{ name: 'DeliveryDocument', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_INBOUND_DELIVERY_SRV;v=0002/A_InbDeliveryItem': {
        get: { summary: 'Gelen teslimat kalemleri', operationId: 'getInboundDeliveryItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'physical-inventory': {
    openapi: '3.0.0',
    info: { title: 'Physical Inventory Document (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_PHYSICAL_INVENTORY_DOC_SRV/A_PhysInventoryDocHeader': {
        get: { summary: 'Fiziksel envanter belgesi listesi', operationId: 'getPhysicalInventoryDocs', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Fiziksel envanter belgesi oluştur', operationId: 'createPhysicalInventoryDoc', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { FiscalYear: { type: 'string', example: '2026' }, Plant: { type: 'string', example: '1010' }, StorageLocation: { type: 'string', example: '0001' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_PHYSICAL_INVENTORY_DOC_SRV/A_PhysInventoryDocItem': {
        get: { summary: 'Fiziksel envanter kalemleri', operationId: 'getPhysicalInventoryItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },
};

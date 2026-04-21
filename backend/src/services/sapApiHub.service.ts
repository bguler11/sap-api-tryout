import { SD_SPECS } from './specs/sd.specs';
import { MM_SPECS } from './specs/mm.specs';
import { PP_SPECS } from './specs/pp.specs';
import { FI_SPECS } from './specs/fi.specs';
import { CO_SPECS } from './specs/co.specs';
import { PS_SPECS } from './specs/ps.specs';

export interface SapApi {
  id: string;
  name: string;
  description: string;
  version: string;
  specUrl: string;
  category: string;
  communicationScenario: string;
  testPath: string;
}

export const SAP_APIS: SapApi[] = [
  // ─── Master Data ─────────────────────────────────────────────────────────────
  {
    id: 'business-partner',
    name: 'Business Partner (A2X)',
    description: 'Müşteri, tedarikçi ve iş ortağı master data yönetimi',
    version: '1.0.0', specUrl: '', category: 'Master Data',
    communicationScenario: 'SAP_COM_0008',
    testPath: '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?$top=1',
  },
  {
    id: 'product-master',
    name: 'Product Master (A2X)',
    description: 'Ürün/malzeme master data, fabrika ve satış org. verileri',
    version: '1.0.0', specUrl: '', category: 'Master Data',
    communicationScenario: 'SAP_COM_0022',
    testPath: '/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product?$top=1',
  },

  // ─── SD ──────────────────────────────────────────────────────────────────────
  {
    id: 'sales-order',
    name: 'Sales Order (A2X)',
    description: 'Satış siparişi oluşturma, güncelleme ve sorgulama',
    version: '1.0.0', specUrl: '', category: 'SD - Sales',
    communicationScenario: 'SAP_COM_0009',
    testPath: '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder?$top=1',
  },
  {
    id: 'outbound-delivery',
    name: 'Outbound Delivery (A2X)',
    description: 'Giden teslimat belgesi yönetimi (sevkiyat)',
    version: '1.0.0', specUrl: '', category: 'SD - Sales',
    communicationScenario: 'SAP_COM_0106',
    testPath: '/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=0002/A_OutbDeliveryHeader?$top=1',
  },
  {
    id: 'billing-document',
    name: 'Billing Document (A2X)',
    description: 'Fatura belgesi sorgulama ve yönetimi',
    version: '1.0.0', specUrl: '', category: 'SD - Sales',
    communicationScenario: 'SAP_COM_0108',
    testPath: '/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV/A_BillingDocument?$top=1',
  },
  {
    id: 'customer-material',
    name: 'Customer Material Info (A2X)',
    description: 'Müşteri-malzeme bilgi kaydı yönetimi',
    version: '1.0.0', specUrl: '', category: 'SD - Sales',
    communicationScenario: 'SAP_COM_0009',
    testPath: '/sap/opu/odata/sap/API_CUSTOMER_MATERIAL_SRV/A_CustomerMaterial?$top=1',
  },
  {
    id: 'sales-pricing',
    name: 'Sales Pricing Condition (A2X)',
    description: 'Satış fiyat koşulları ve fiyat listesi yönetimi',
    version: '1.0.0', specUrl: '', category: 'SD - Sales',
    communicationScenario: 'SAP_COM_0300',
    testPath: '/sap/opu/odata/sap/API_SLSPRICINGCONDITIONRECORD_SRV/A_SlsPricingConditionRecord?$top=1',
  },

  // ─── MM ──────────────────────────────────────────────────────────────────────
  {
    id: 'purchase-order',
    name: 'Purchase Order (A2X)',
    description: 'Satın alma siparişi yönetimi',
    version: '1.0.0', specUrl: '', category: 'MM - Procurement',
    communicationScenario: 'SAP_COM_0074',
    testPath: '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder?$top=1',
  },
  {
    id: 'purchase-requisition',
    name: 'Purchase Requisition (A2X)',
    description: 'Satın alma talebi oluşturma ve yönetimi',
    version: '1.0.0', specUrl: '', category: 'MM - Procurement',
    communicationScenario: 'SAP_COM_0081',
    testPath: '/sap/opu/odata/sap/API_PURCHASEREQ_PROCESS_SRV/A_PurchaseRequisitionHeader?$top=1',
  },
  {
    id: 'material-document',
    name: 'Material Document (A2X)',
    description: 'Mal girişi, çıkışı ve transfer hareketleri',
    version: '1.0.0', specUrl: '', category: 'MM - Inventory',
    communicationScenario: 'SAP_COM_0023',
    testPath: '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader?$top=1',
  },
  {
    id: 'inbound-delivery',
    name: 'Inbound Delivery (A2X)',
    description: 'Gelen teslimat belgesi yönetimi',
    version: '1.0.0', specUrl: '', category: 'MM - Inventory',
    communicationScenario: 'SAP_COM_0107',
    testPath: '/sap/opu/odata/sap/API_INBOUND_DELIVERY_SRV;v=0002/A_InbDeliveryHeader?$top=1',
  },
  {
    id: 'physical-inventory',
    name: 'Physical Inventory (A2X)',
    description: 'Fiziksel sayım belgesi oluşturma ve yönetimi',
    version: '1.0.0', specUrl: '', category: 'MM - Inventory',
    communicationScenario: 'SAP_COM_0023',
    testPath: '/sap/opu/odata/sap/API_PHYSICAL_INVENTORY_DOC_SRV/A_PhysInventoryDocHeader?$top=1',
  },

  // ─── PP ──────────────────────────────────────────────────────────────────────
  {
    id: 'production-order',
    name: 'Production Order (A2X)',
    description: 'Üretim emri oluşturma, operasyon ve bileşen yönetimi',
    version: '1.0.0', specUrl: '', category: 'PP - Production',
    communicationScenario: 'SAP_COM_0238',
    testPath: '/sap/opu/odata/sap/API_PRODUCTION_ORDER_2_SRV/A_ProductionOrder_2?$top=1',
  },
  {
    id: 'bill-of-material',
    name: 'Bill of Material (A2X)',
    description: 'Malzeme listesi (BOM) yönetimi',
    version: '1.0.0', specUrl: '', category: 'PP - Production',
    communicationScenario: 'SAP_COM_0258',
    testPath: '/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002/MaterialBOMItem?$top=1',
  },
  {
    id: 'work-center',
    name: 'Work Center (A2X)',
    description: 'İş merkezi tanımı ve maliyet merkezi ilişkisi',
    version: '1.0.0', specUrl: '', category: 'PP - Production',
    communicationScenario: 'SAP_COM_0257',
    testPath: '/sap/opu/odata/sap/API_WORK_CENTER_SRV;v=0002/A_WorkCenterHeader?$top=1',
  },
  {
    id: 'planned-order',
    name: 'Planned Order (A2X)',
    description: 'MRP planlı sipariş yönetimi',
    version: '1.0.0', specUrl: '', category: 'PP - Production',
    communicationScenario: 'SAP_COM_0238',
    testPath: '/sap/opu/odata/sap/API_PLANNED_ORDERS/A_PlannedOrder?$top=1',
  },

  // ─── FI ──────────────────────────────────────────────────────────────────────
  {
    id: 'gl-account',
    name: 'G/L Account (A2X)',
    description: 'Genel muhasebe hesap planı yönetimi',
    version: '1.0.0', specUrl: '', category: 'FI - Finance',
    communicationScenario: 'SAP_COM_0027',
    testPath: '/sap/opu/odata/sap/API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts?$top=1',
  },
  {
    id: 'journal-entry',
    name: 'Journal Entry (A2X)',
    description: 'Muhasebe kaydı oluşturma ve sorgulama',
    version: '1.0.0', specUrl: '', category: 'FI - Finance',
    communicationScenario: 'SAP_COM_0002',
    testPath: '/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry?$top=1',
  },
  {
    id: 'supplier-invoice',
    name: 'Supplier Invoice (A2X)',
    description: 'Tedarikçi faturası oluşturma ve işleme',
    version: '1.0.0', specUrl: '', category: 'FI - Finance',
    communicationScenario: 'SAP_COM_0057',
    testPath: '/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoice?$top=1',
  },
  {
    id: 'customer-invoice',
    name: 'Customer Invoice (A2X)',
    description: 'Müşteri faturası oluşturma ve işleme',
    version: '1.0.0', specUrl: '', category: 'FI - Finance',
    communicationScenario: 'SAP_COM_0002',
    testPath: '/sap/opu/odata/sap/API_CUSTOMERINVOICE_PROCESS_SRV/A_CustomerInvoice?$top=1',
  },
  {
    id: 'bank-account',
    name: 'Bank Account (A2X)',
    description: 'Banka hesabı ve IBAN yönetimi',
    version: '1.0.0', specUrl: '', category: 'FI - Finance',
    communicationScenario: 'SAP_COM_0194',
    testPath: '/sap/opu/odata/sap/API_BANKACCOUNT_SRV/A_BankAccount?$top=1',
  },

  // ─── CO ──────────────────────────────────────────────────────────────────────
  {
    id: 'cost-center',
    name: 'Cost Center (A2X)',
    description: 'Maliyet merkezi oluşturma ve yönetimi',
    version: '1.0.0', specUrl: '', category: 'CO - Controlling',
    communicationScenario: 'SAP_COM_0007',
    testPath: '/sap/opu/odata/sap/API_COSTCENTER_SRV;v=0002/A_CostCenter?$top=1',
  },
  {
    id: 'profit-center',
    name: 'Profit Center (A2X)',
    description: 'Kâr merkezi oluşturma ve yönetimi',
    version: '1.0.0', specUrl: '', category: 'CO - Controlling',
    communicationScenario: 'SAP_COM_0007',
    testPath: '/sap/opu/odata/sap/API_PROFITCENTER_SRV;v=0002/A_ProfitCenter?$top=1',
  },
  {
    id: 'internal-order',
    name: 'Internal Order (A2X)',
    description: 'Dahili sipariş (CO order) oluşturma ve yönetimi',
    version: '1.0.0', specUrl: '', category: 'CO - Controlling',
    communicationScenario: 'SAP_COM_0007',
    testPath: '/sap/opu/odata/sap/API_INTERNALORDER_SRV/A_InternalOrder?$top=1',
  },
  {
    id: 'cost-center-activity-type',
    name: 'Cost Center Activity Type (A2X)',
    description: 'Maliyet merkezi faaliyet türü yönetimi',
    version: '1.0.0', specUrl: '', category: 'CO - Controlling',
    communicationScenario: 'SAP_COM_0007',
    testPath: '/sap/opu/odata/sap/API_COSTCENTERACTIVITYTYPE_SRV;v=0002/A_CostCtrActivityType?$top=1',
  },

  // ─── PS ──────────────────────────────────────────────────────────────────────
  {
    id: 'project-wbs',
    name: 'Project & WBS Element (A2X)',
    description: 'Proje ve İş Döküm Yapısı (WBS) oluşturma ve yönetimi',
    version: '1.0.0', specUrl: '', category: 'PS - Project System',
    communicationScenario: 'SAP_COM_0308',
    testPath: '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV;v=0002/A_EnterpriseProject?$top=1',
  },
  {
    id: 'project-network',
    name: 'Project Network Activity (A2X)',
    description: 'Proje network aktivitesi yönetimi',
    version: '1.0.0', specUrl: '', category: 'PS - Project System',
    communicationScenario: 'SAP_COM_0308',
    testPath: '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV;v=0002/A_EntProjElmntWorkPackage?$top=1',
  },
];

const BUSINESS_PARTNER_SPEC: object = {
  openapi: '3.0.0',
  info: { title: 'Business Partner (A2X)', version: '1.0.0' },
  paths: {
    '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner': {
      get: { summary: 'Business Partner listesi', operationId: 'getBusinessPartners', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$skip', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: BusinessPartnerCategory eq '1'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
    },
    '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner(\'{BusinessPartner}\')': {
      get: { summary: 'Business Partner getir', operationId: 'getBusinessPartnerById', parameters: [{ name: 'BusinessPartner', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      patch: { summary: 'Business Partner güncelle', operationId: 'updateBusinessPartner', parameters: [{ name: 'BusinessPartner', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { BusinessPartnerFullName: { type: 'string' }, BusinessPartnerIsBlocked: { type: 'boolean' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
    },
    '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartnerAddress': {
      get: { summary: 'BP Adresleri', operationId: 'getBPAddresses', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
    },
    '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_Customer': {
      get: { summary: 'Müşteri listesi', operationId: 'getCustomers', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
    },
    '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_Supplier': {
      get: { summary: 'Tedarikçi listesi', operationId: 'getSuppliers', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
    },
  },
};

const ALL_SPECS: Record<string, object> = {
  'business-partner': BUSINESS_PARTNER_SPEC,
  ...SD_SPECS,
  ...MM_SPECS,
  ...PP_SPECS,
  ...FI_SPECS,
  ...CO_SPECS,
  ...PS_SPECS,
};

export function getApiList(): SapApi[] {
  return SAP_APIS;
}

export function getApiSpec(apiId: string): object | null {
  return ALL_SPECS[apiId] || null;
}

export const FI_SPECS: Record<string, object> = {
  'gl-account': {
    openapi: '3.0.0',
    info: { title: 'G/L Account (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts': {
        get: { summary: 'Hesap planı hesapları listesi', operationId: 'getGLAccounts', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'GL hesabı oluştur', operationId: 'createGLAccount', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['ChartOfAccounts', 'GLAccount'], properties: { ChartOfAccounts: { type: 'string', example: 'YCOA' }, GLAccount: { type: 'string', example: '0010001000' }, AccountType: { type: 'string', example: 'X' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts(\'{ChartOfAccounts}\',\'{GLAccount}\')': {
        get: { summary: 'GL hesabı getir', operationId: 'getGLAccountById', parameters: [{ name: 'ChartOfAccounts', in: 'path', required: true, schema: { type: 'string' } }, { name: 'GLAccount', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountText': {
        get: { summary: 'GL hesap metinleri', operationId: 'getGLAccountTexts', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'journal-entry': {
    openapi: '3.0.0',
    info: { title: 'Journal Entry (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry': {
        get: { summary: 'Muhasebe kaydı listesi', operationId: 'getJournalEntries', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: CompanyCode eq '1010' and FiscalYear eq '2026'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Muhasebe kaydı oluştur', operationId: 'createJournalEntry', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { CompanyCode: { type: 'string', example: '1010' }, DocumentDate: { type: 'string', example: '2026-04-21' }, PostingDate: { type: 'string', example: '2026-04-21' }, DocumentHeaderText: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry(\'{AccountingDocument}\',\'{CompanyCode}\',\'{FiscalYear}\')': {
        get: { summary: 'Muhasebe kaydı getir', operationId: 'getJournalEntryById', parameters: [{ name: 'AccountingDocument', in: 'path', required: true, schema: { type: 'string' } }, { name: 'CompanyCode', in: 'path', required: true, schema: { type: 'string' } }, { name: 'FiscalYear', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntryItem': {
        get: { summary: 'Muhasebe kaydı kalemleri', operationId: 'getJournalEntryItems', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'supplier-invoice': {
    openapi: '3.0.0',
    info: { title: 'Supplier Invoice (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoice': {
        get: { summary: 'Tedarikçi faturası listesi', operationId: 'getSupplierInvoices', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: CompanyCode eq '1010'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Tedarikçi faturası oluştur', operationId: 'createSupplierInvoice', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['CompanyCode', 'DocumentDate', 'InvoicingParty'], properties: { CompanyCode: { type: 'string', example: '1010' }, DocumentDate: { type: 'string', example: '2026-04-21' }, PostingDate: { type: 'string', example: '2026-04-21' }, InvoicingParty: { type: 'string', example: '10000001' }, InvoiceGrossAmount: { type: 'string', example: '1000.00' }, DocumentCurrency: { type: 'string', example: 'EUR' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoice(\'{SupplierInvoice}\',\'{FiscalYear}\')': {
        get: { summary: 'Tedarikçi faturası getir', operationId: 'getSupplierInvoiceById', parameters: [{ name: 'SupplierInvoice', in: 'path', required: true, schema: { type: 'string' } }, { name: 'FiscalYear', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
      '/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoiceWhldgTax': {
        get: { summary: 'Stopaj vergisi bilgileri', operationId: 'getSupplierInvoiceWithholdingTax', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'customer-invoice': {
    openapi: '3.0.0',
    info: { title: 'Customer Invoice (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_CUSTOMERINVOICE_PROCESS_SRV/A_CustomerInvoice': {
        get: { summary: 'Müşteri faturası listesi', operationId: 'getCustomerInvoices', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: CompanyCode eq '1010'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Müşteri faturası oluştur', operationId: 'createCustomerInvoice', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { CompanyCode: { type: 'string', example: '1010' }, DocumentDate: { type: 'string', example: '2026-04-21' }, Customer: { type: 'string', example: '10000001' }, InvoiceGrossAmount: { type: 'string' }, DocumentCurrency: { type: 'string', example: 'EUR' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_CUSTOMERINVOICE_PROCESS_SRV/A_CustomerInvoice(\'{AccountingDocument}\',\'{CompanyCode}\',\'{FiscalYear}\')': {
        get: { summary: 'Müşteri faturası getir', operationId: 'getCustomerInvoiceById', parameters: [{ name: 'AccountingDocument', in: 'path', required: true, schema: { type: 'string' } }, { name: 'CompanyCode', in: 'path', required: true, schema: { type: 'string' } }, { name: 'FiscalYear', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },

  'bank-account': {
    openapi: '3.0.0',
    info: { title: 'Bank Account (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_BANKACCOUNT_SRV/A_BankAccount': {
        get: { summary: 'Banka hesabı listesi', operationId: 'getBankAccounts', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Banka hesabı oluştur', operationId: 'createBankAccount', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { BankCountryKey: { type: 'string', example: 'DE' }, BankInternalID: { type: 'string' }, BankAccountName: { type: 'string' }, IBAN: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_BANKACCOUNT_SRV/A_BankAccount(\'{BankInternalID}\')': {
        get: { summary: 'Banka hesabı getir', operationId: 'getBankAccountById', parameters: [{ name: 'BankInternalID', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
      },
    },
  },
};

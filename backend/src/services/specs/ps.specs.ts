export const PS_SPECS: Record<string, object> = {
  'project-wbs': {
    openapi: '3.0.0',
    info: { title: 'Project / WBS Element (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV;v=0002/A_EnterpriseProject': {
        get: { summary: 'Proje listesi', operationId: 'getProjects', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: ProjectType eq 'DP'" }, { name: '$select', in: 'query', schema: { type: 'string' } }, { name: '$expand', in: 'query', schema: { type: 'string' }, description: 'Örn: to_EnterpriseProjectElement' }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Proje oluştur', operationId: 'createProject', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['ProjectType'], properties: { ProjectType: { type: 'string', example: 'DP' }, Project: { type: 'string', example: 'T-20261234' }, ProjectDescription: { type: 'string' }, ResponsibleCostCenter: { type: 'string' }, CompanyCode: { type: 'string', example: '1010' }, ProfitCenter: { type: 'string' }, PlannedStartDate: { type: 'string', example: '2026-01-01' }, PlannedEndDate: { type: 'string', example: '2026-12-31' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV;v=0002/A_EnterpriseProject(\'{ProjectUUID}\')': {
        get: { summary: 'Proje getir', operationId: 'getProjectById', parameters: [{ name: 'ProjectUUID', in: 'path', required: true, schema: { type: 'string' }, description: 'Proje UUID değeri' }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'Proje güncelle', operationId: 'updateProject', parameters: [{ name: 'ProjectUUID', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { ProjectDescription: { type: 'string' }, PlannedEndDate: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
        delete: { summary: 'Proje sil', operationId: 'deleteProject', parameters: [{ name: 'ProjectUUID', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'Silindi' } } },
      },
      '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV;v=0002/A_EnterpriseProjectElement': {
        get: { summary: 'WBS Element listesi', operationId: 'getWBSElements', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' }, description: "Örn: Project eq 'T-20261234'" }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'WBS Element oluştur', operationId: 'createWBSElement', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['ProjectUUID'], properties: { ProjectUUID: { type: 'string' }, WBSElementInternalID: { type: 'string' }, WBSDescription: { type: 'string' }, ResponsibleCostCenter: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
      '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV;v=0002/A_EnterpriseProjectElement(\'{ProjectElementUUID}\')': {
        get: { summary: 'WBS Element getir', operationId: 'getWBSElementById', parameters: [{ name: 'ProjectElementUUID', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        patch: { summary: 'WBS Element güncelle', operationId: 'updateWBSElement', parameters: [{ name: 'ProjectElementUUID', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { WBSDescription: { type: 'string' }, PlannedStartDate: { type: 'string' }, PlannedEndDate: { type: 'string' } } } } } }, responses: { '200': { description: 'Güncellendi' } } },
      },
    },
  },

  'project-network': {
    openapi: '3.0.0',
    info: { title: 'Project Network / Activity (A2X)', version: '1.0.0' },
    paths: {
      '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV;v=0002/A_EntProjElmntWorkPackage': {
        get: { summary: 'Proje aktivite (network) listesi', operationId: 'getProjectActivities', parameters: [{ name: '$top', in: 'query', schema: { type: 'integer' } }, { name: '$filter', in: 'query', schema: { type: 'string' } }, { name: '$select', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Başarılı' } } },
        post: { summary: 'Proje aktivitesi oluştur', operationId: 'createProjectActivity', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { ProjectElementUUID: { type: 'string' }, WBSDescription: { type: 'string' }, PlannedDuration: { type: 'string' } } } } } }, responses: { '201': { description: 'Oluşturuldu' } } },
      },
    },
  },
};

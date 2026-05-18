import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'tryout.db');

async function seed() {
  const SQL = await initSqlJs();
  if (!fs.existsSync(DB_PATH)) {
    console.error('DB bulunamadı. Önce backend\'i başlatın.');
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(fileBuffer);

  const users = db.exec('SELECT id, email FROM users');
  if (!users[0]?.values?.length) {
    console.error('Hiç kullanıcı yok. Önce kayıt olun.');
    process.exit(1);
  }

  const userId = users[0].values[0][0] as number;
  const userEmail = users[0].values[0][1] as string;

  const envs = db.exec(`SELECT id, name FROM environments WHERE user_id = ${userId}`);
  if (!envs[0]?.values?.length) {
    console.error('Kullanıcıya ait ortam yok. Önce bir ortam ekleyin.');
    process.exit(1);
  }

  const environmentId = envs[0].values[0][0] as number;
  const envName = envs[0].values[0][1] as string;

  const userVariants = [
    {
      api_id: 'sales-order',
      method: 'POST',
      path: '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder',
      name: 'Standart Satış Siparişi',
      params: JSON.stringify({
        body: {
          SalesOrderType: 'OR',
          SalesOrganization: '1010',
          DistributionChannel: '10',
          OrganizationDivision: '00',
          SoldToParty: '10000001'
        }
      }),
    },
    {
      api_id: 'sales-order',
      method: 'POST',
      path: '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder',
      name: 'İhracat Siparişi',
      params: JSON.stringify({
        body: {
          SalesOrderType: 'EX',
          SalesOrganization: '1020',
          DistributionChannel: '10',
          OrganizationDivision: '00',
          SoldToParty: '20000001'
        }
      }),
    },
    {
      api_id: 'customer-material',
      method: 'POST',
      path: '/sap/opu/odata/sap/API_CUSTOMER_MATERIAL_SRV/A_CustomerMaterial',
      name: 'Müşteri Malzeme Kaydı',
      params: JSON.stringify({
        body: {
          Customer: '10000001',
          Material: 'TG11',
          SalesOrganization: '1010',
          DistributionChannel: '10'
        }
      }),
    },
  ];

  const globalVariants = [
    {
      api_id: 'sales-order',
      method: 'POST',
      path: '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder',
      name: 'QA Test Siparişi (Global)',
      params: JSON.stringify({
        body: {
          SalesOrderType: 'OR',
          SalesOrganization: '1010',
          DistributionChannel: '10',
          OrganizationDivision: '00',
          SoldToParty: '99999999'
        }
      }),
    },
    {
      api_id: 'sales-pricing',
      method: 'POST',
      path: '/sap/opu/odata/sap/API_SLSPRICINGCONDITIONRECORD_SRV/A_SlsPricingConditionRecord',
      name: 'Standart Fiyat Koşulu (Global)',
      params: JSON.stringify({
        body: {
          ConditionType: 'PR00',
          SalesOrganization: '1010',
          DistributionChannel: '10',
          ConditionRateValue: '100.00',
          ConditionRateValueUnit: 'EUR'
        }
      }),
    },
  ];

  db.run('DELETE FROM user_variants WHERE user_id = ?', [userId]);
  db.run('DELETE FROM global_variants WHERE environment_id = ?', [environmentId]);

  for (const v of userVariants) {
    db.run(
      'INSERT INTO user_variants (user_id, api_id, method, path, name, params) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, v.api_id, v.method, v.path, v.name, v.params]
    );
  }

  for (const v of globalVariants) {
    db.run(
      'INSERT INTO global_variants (environment_id, created_by, api_id, method, path, name, params) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [environmentId, userId, v.api_id, v.method, v.path, v.name, v.params]
    );
  }

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));

  console.log(`✓ Kullanıcı: ${userEmail}`);
  console.log(`✓ Ortam: ${envName}`);
  console.log(`✓ ${userVariants.length} kişisel varyant eklendi`);
  console.log(`✓ ${globalVariants.length} global varyant eklendi`);
  console.log('\nEklenen varyantlar:');
  [...userVariants, ...globalVariants].forEach(v => {
    console.log(`  [${v.api_id}] ${v.name}`);
  });
}

seed().catch(console.error);

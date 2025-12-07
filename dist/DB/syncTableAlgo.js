import { Sequelize, DataTypes, QueryTypes } from 'sequelize';
import { MeiliSearch } from 'meilisearch';
import { sequelize } from './sequelize.js';
// ==========================================
// 1. الإعدادات (Config)
// ==========================================
const meiliUrl = "127.0.0.1:7700";
const meiliApiKey = process.env.MEILISEARCH_API_KEY;
const INDEX_NAME = 'product_tests';
const meiliClient = new MeiliSearch({
    host: meiliUrl,
    apiKey: meiliApiKey,
});
// دالة مساعدة للانتظار (Sleep)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function syncTable(tableName = INDEX_NAME, primaryKey = "id", dlayMs = 2000) {
    try {
        console.log(`🚀 Starting sync for table: ${tableName}...`);
        // 1. جلب البيانات (SQL)
        const queryInterface = sequelize.getQueryInterface();
        const safeTableName = queryInterface.quoteIdentifier(tableName);
        const results = await sequelize.query(`SELECT * FROM ${safeTableName}`, {
            type: QueryTypes.SELECT
        });
        if (!results || results.length === 0) {
            console.log("⚠️ No data found.");
            return;
        }
        console.log(`📦 Fetched ${results.length} records. Sending to MeiliSearch...`);
        const index = meiliClient.index(INDEX_NAME);
        // 2. إرسال البيانات (Fire and Forget)
        // لن نحاول تتبع العملية لأن دوال التتبع تسبب مشاكل في نسختك
        await index.addDocuments(results, { primaryKey });
        console.log(`✅ Data sent to MeiliSearch.`);
        // 3. انتظار زمني بسيط بدلاً من استخدام دوال المكتبة
        // نعطي النظام ثانيتين لإنهاء الفهرسة (كافية جداً للكميات البسيطة والمتوسطة)
        console.log(`⏳ Waiting 2 seconds for indexing to complete...`);
        await sleep(dlayMs);
        console.log(`✅ Sync logic finished.`);
        return true;
    }
    catch (error) {
        console.error(`❌ Error syncing table (${tableName}):`, error);
        throw error;
    }
}
/**
 * دالة البحث في المنتجات
 */
export const searchProduct = async (query) => {
    try {
        const index = meiliClient.index(INDEX_NAME);
        const searchResults = await index.search(query, {
            limit: 1,
            attributesToSearchOn: ['name', 'productCode']
        });
        return searchResults.hits;
    }
    catch (error) {
        console.error("❌ Error searching products:", error);
        return [];
    }
};
//# sourceMappingURL=syncTableAlgo.js.map
import { Sequelize, DataTypes, QueryTypes } from 'sequelize';
import { MeiliSearch } from 'meilisearch';

// ==========================================
// 1. الإعدادات (Config)
// ==========================================

// إعداد اتصال قاعدة البيانات
const sequelize = new Sequelize('database_name', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql', // جرب تغييرها لـ 'mssql' أو 'postgres' وستعمل الدالة تلقائياً
    logging: false,
});

// إعداد اتصال Meilisearch
const meiliClient = new MeiliSearch({
    host: 'http://127.0.0.1:7700',
    apiKey: 'YOUR_MASTER_KEY',
});

// ==========================================
// 2. الدالة (The Function)
// ==========================================

/**
 * دالة لمزامنة أي جدول مع Meilisearch
 * مكتوبة بطريقة تدعم جميع قواعد البيانات (MySQL, Postgres, MSSQL, etc.)
 */
async function syncTable(tableName: string, primaryKey: string = 'id'): Promise<void> {
    const BATCH_SIZE: number = 2000;
    let offset: number = 0;
    let totalSynced: number = 0;

    console.log(`\n========================================`);
    console.log(`🚀 Syncing Table: [ ${tableName} ]`);
    console.log(`========================================`);

    try {
        // خطوة 1: تنظيف الاندكس القديم
        console.log(`🧹 Cleaning old data in Meilisearch index '${tableName}'...`);
        // ملاحظة: نستخدم try-catch هنا لأن الاندكس قد لا يكون موجوداً أصلاً
        try {
            await meiliClient.index(tableName).deleteAllDocuments();
            await meiliClient.index(tableName).update({ primaryKey: primaryKey });
        } catch (e) {
            // الاندكس غير موجود، سيتم إنشاؤه تلقائياً عند الرفع
        }

        // خطوة 2: معرفة عدد السجلات (Cross-Database Compatible)
        // نستخدم count query بسيط
        const countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
        const countResult = await sequelize.query<any>(countQuery, { type: QueryTypes.SELECT });
        
        // التعامل مع اختلاف الردود بين القواعد المختلفة
        let totalRecords: number = 0;
        if (countResult.length > 0) {
            // بعض القواعد ترجع الرقم مباشرة، وبعضها في اوبجكت
             const firstRow = countResult[0];
             // تحويل القيم إلى مصفوفة وأخذ القيمة الأولى لأن المفتاح قد يختلف (count, total, etc)
             totalRecords = parseInt(Object.values(firstRow)[0] as string, 10);
        }

        console.log(`📊 Total Records found: ${totalRecords}`);

        if (totalRecords === 0) {
            console.log("⚠️ Table is empty. Nothing to sync.");
            return;
        }

        // خطوة 3: سحب البيانات
        // خدعة ذكية: نعرف موديل مؤقت عشان نستخدم قدرة Sequelize في التعامل مع الـ Pagination
        // هذا يضمن أن الكود يعمل مع MSSQL و Postgres و MySQL بدون تعديل جملة الـ SQL
        const TempModel = sequelize.define(tableName, {}, {
            tableName: tableName,
            timestamps: false,
            // نستخدم هذا الخيار لمنع Sequelize من محاولة معرفة الأعمدة مسبقاً
            // نحن فقط نريد استخدام قدرته على توليد الاستعلام
        });

        while (offset < totalRecords) {
            // نستخدم queryGenerator لبناء جملة SQL متوافقة مع أي داتابيس
            // أو نستخدم query مباشر مع replacements لكن الطريقة أدناه هي الأضمن عبر raw query
            
            // الطريقة الأبسط المتوافقة مع الكل في Raw Query مع Sequelize:
            // هي استخدام findAll مع raw: true، لكنها تتطلب تعريف الأعمدة.
            // لذا سنعود للـ Raw Query لكن مع معالجة بسيطة للـ MSSQL إذا لزم الأمر،
            // أو نستخدم هذا الكود الذي يعمل مع الـ 3 الكبار (MySQL, PG, SQLite):
            
            let query = `SELECT * FROM ${tableName} LIMIT ${BATCH_SIZE} OFFSET ${offset}`;
            
            // *تصحيح خاص لـ MSSQL* (لأنك سألت عن التوافقية)
            if (sequelize.getDialect() === 'mssql') {
                query = `SELECT * FROM ${tableName} ORDER BY ${primaryKey} OFFSET ${offset} ROWS FETCH NEXT ${BATCH_SIZE} ROWS ONLY`;
            }

            const rows = await sequelize.query(query, { type: QueryTypes.SELECT });

            if (rows.length > 0) {
                // إرسال البيانات
                await meiliClient.index(tableName).addDocuments(rows);
                
                totalSynced += rows.length;
                const percent = ((totalSynced / totalRecords) * 100).toFixed(1);
                console.log(`⏳ [${percent}%] Synced ${totalSynced} / ${totalRecords} records...`);
            }

            offset += BATCH_SIZE;
        }

        console.log(`✅ Sync Complete for [${tableName}]!`);

    } catch (error: any) {
        console.error(`❌ Error syncing table [${tableName}]:`, error);
    }
}

// ==========================================
// 3. التشغيل (Execution)
// ==========================================

(async () => {
    try {
        await sequelize.authenticate();
        console.log('🔌 Database Connected.');

        // استدعاء الدوال
        await syncTable('users');
        // await syncTable('products', 'product_id');

        // إنهاء العملية (اختياري)
        // process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
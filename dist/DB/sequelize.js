import { Sequelize, DataTypes } from "sequelize";
// 1. إعداد الاتصال (نفس الكود الخاص بك)
export const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./store.sqlite",
    logging: false,
});
// 2. تعريف شكل جدول المنتجات (Model)
const Product = sequelize.define("product_test", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // --- تأكد من إضافة هذا الحقل الجديد ---
    productCode: {
        type: DataTypes.STRING, // أو STRING إذا كنت تفضل
        allowNull: false,
        unique: true // لضمان عدم تكرار الرقم في قاعدة البيانات
    },
    // ------------------------------------
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    inStock: {
        type: DataTypes.BOOLEAN
    }
});
// بيانات مساعدة لتوليد أسماء عشوائية (عشان ما نحتاج مكتبات خارجية)
const adjectives = ["Smart", "Wireless", "Luxury", "Compact", "Gaming", "Vintage", "Super", "Pro"];
const nouns = ["Watch", "Phone", "Headphones", "Laptop", "Camera", "Speaker", "Monitor", "Keyboard"];
const categories = ["Electronics", "Home", "Office", "Accessories"];
// دالة صغيرة لاختيار عنصر عشوائي من مصفوفة
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
// 3. دالة التشغيل الرئيسية
export async function seedDatabase() {
    try {
        console.log("Connected to SQLite.");
        // إعادة بناء الجداول من الصفر
        await sequelize.sync({ force: true });
        console.log("Test Tables created.");
        const fakeProducts = [];
        // --- مصفوفات البيانات العربية الخاصة بورق الجدران ---
        const types = ["ورق جدران", "خلفية حائط", "ديكور جداري", "كسوة جدران"];
        const styles = ["كلاسيكي", "مودرن", "ثلاثي الأبعاد", "هندسي", "مشجر", "مقلم", "مخملي", "فنتيج", "رخامي"];
        const qualities = ["فاخر", "اقتصادي", "ملكي", "لامع", "مطفـأ", "مقاوم للماء", "قابل للغسيل"];
        const colors = ["بيج", "رمادي", "أبيض عاجي", "ذهبي", "فضي", "أزرق نيلي", "زيتي", "أسود ملكي", "تيراكوتا"];
        const categories = ["غرف معيشة", "غرف نوم", "مكاتب", "غرف أطفال", "ممرات ومداخل", "مجالس عربية"];
        // حلقة لتوليد 100 عنصر
        for (let i = 1; i <= 100; i++) {
            // 1. توليد رقم خاص عشوائي (غير الـ ID)
            // يولد رقم عشوائي بين 100000 و 999999
            const uniqueCode = Math.floor(100000 + Math.random() * 900000);
            // 2. توليد اسم عشوائي غير مكرر
            // دمجنا النوع + الستايل + اللون + الرقم المميز لضمان عدم التكرار
            const name = `${pickRandom(types)} ${pickRandom(styles)} ${pickRandom(colors)} - موديل ${uniqueCode}`;
            // اختيار تصنيف عشوائي
            const category = pickRandom(categories);
            fakeProducts.push({
                name: name,
                // رقم خاص عشوائي للمنتج
                productCode: `${uniqueCode}`,
                // سعر عشوائي بين 50 و 1500
                price: parseFloat((Math.random() * 1500 + 50).toFixed(2)),
                category: category,
                description: `تمتع بأناقة منزلك مع ${name}. هذا المنتج ${pickRandom(qualities)} ومثالي لـ ${category}. جودة عالية وتصميم فريد يضفي لمسة جمالية.`,
                inStock: Math.random() > 0.1 // 90% احتمال يكون متوفر
            });
        }
        // إدخال البيانات دفعة واحدة
        await Product.bulkCreate(fakeProducts);
        console.log("✅ Successfully created 100 Arabic wallpaper products with unique codes.");
    }
    catch (error) {
        console.error("❌ Error seeding database:", error);
    }
}
// تشغيل الدالة
seedDatabase();
//# sourceMappingURL=sequelize.js.map
export declare function syncTable(tableName?: string, primaryKey?: string, dlayMs?: number): Promise<true | undefined>;
/**
 * دالة البحث في المنتجات
 */
export declare const searchProduct: (query: string) => Promise<import("meilisearch").Hits<import("meilisearch").RecordAny>>;
//# sourceMappingURL=syncTableAlgo.d.ts.map
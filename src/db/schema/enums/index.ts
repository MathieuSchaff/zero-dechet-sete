import { pgEnum } from 'drizzle-orm/pg-core';

export const articleStatusEnum = pgEnum('article_status', ['draft', 'review', 'published']);
export const placeTypeEnum = pgEnum('place_type', ['tri', 'don', 'cabane', 'dechetterie', 'ressourcerie', 'vrac', 'compost', 'deee', 'verre']);
export const postTypeEnum = pgEnum('post_type', ['don', 'cherche', 'entraide']);

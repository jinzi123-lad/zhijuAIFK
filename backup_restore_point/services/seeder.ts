import { db } from './db';
import { MOCK_PROPERTIES, MOCK_CLIENTS, INITIAL_USERS } from '../constants';

export const seedAllProperties = async (onProgress?: (current: number, total: number) => void) => {
    console.log('Starting Batch Seed...');

    // 1. Properties (150+ items)
    const total = MOCK_PROPERTIES.length;
    let successCount = 0;

    // Process in chunks to avoid rate limitting
    for (let i = 0; i < total; i++) {
        try {
            await db.saveProperty(MOCK_PROPERTIES[i]);
            successCount++;
            if (onProgress) onProgress(i + 1, total);
        } catch (e) {
            console.error(`Failed to seed property ${i}`, e);
        }
    }

    console.log(`Successfully seeded ${successCount}/${total} properties.`);
    return successCount;
};

// Also seed other required data if needed (Users, Clients)
export const seedBaseData = async () => {
    // Users
    for (const u of INITIAL_USERS) {
        await db.saveUser(u);
    }
    // Clients
    for (const c of MOCK_CLIENTS) {
        await db.saveClient(c);
    }
    console.log('Base data seeded.');
};

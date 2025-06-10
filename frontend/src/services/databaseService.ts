import { DatabaseApi } from '../api/apis/DatabaseApi';
import { Configuration } from '../api/runtime';
import { configuration } from './config';

class DatabaseService {
    private api: DatabaseApi;

    constructor() {
        this.api = new DatabaseApi(configuration);
    }

    async exportDatabase(): Promise<Blob> {
        try {
            console.log('Starting database export');
            const response = await this.api.exportDatabaseApiV1DatabaseExportGetRaw();
            console.log('Received response from server');
            
            // Get the blob from the response
            const blob = await response.raw.blob();
            console.log(`Received Blob of size: ${blob.size} bytes`);
            
            if (!blob || blob.size === 0) {
                throw new Error('Received empty response from server');
            }
            
            return blob;
        } catch (error) {
            console.error('Error exporting database:', error);
            if (error instanceof Error) {
                throw new Error(`Export failed: ${error.message}`);
            }
            throw new Error('Export failed: Unknown error');
        }
    }

    async importDatabase(file: File): Promise<void> {
        try {
            await this.api.importDatabaseApiV1DatabaseImportPost({ file });
        } catch (error) {
            console.error('Error importing database:', error);
            throw error;
        }
    }
}

export const databaseService = new DatabaseService(); 
export interface BatchJob {
  id: string;
  urls: string[];
  progress: number;
  results: Array<{
    url: string;
    score: number;
    verdict: string;
    error?: string;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
}

export async function parseBatchFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let urls: string[] = [];
        
        if (file.name.endsWith('.csv')) {
          // Parse CSV (simple, assumes one URL per line or comma-separated)
          urls = content
            .split(/[\n,]/)
            .map(line => line.trim())
            .filter(line => line && line.match(/^https?:\/\//i));
        } else {
          // Parse TXT (one URL per line)
          urls = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && line.match(/^https?:\/\//i));
        }
        
        resolve([...new Set(urls)]); // Remove duplicates
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function createBatchJob(urls: string[]): BatchJob {
  return {
    id: `batch-${Date.now()}`,
    urls,
    progress: 0,
    results: [],
    status: 'pending',
  };
}

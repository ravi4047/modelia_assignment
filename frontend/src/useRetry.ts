export async function useRetry(fn: VoidFunction, maxAttempts=3) {
    let attempt = 0;
    while (attempt < maxAttempts) {
        attempt++
        try {
            return await fn();
        } catch (err) {
            const message = (err as any).message || '';
            if (message.includes('Model overloaded') && attempt < maxAttempts) {
                await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 200 + Math.random()*100));
                continue;
            }
            throw err;
        }
    }
}
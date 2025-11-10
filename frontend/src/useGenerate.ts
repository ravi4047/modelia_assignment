import { useState, useRef } from "react";

export function useGenerate(){
    const [loading, setLoading] = useState(false)
    const controllerRef = useRef<AbortController|null>(null)

    async function generate(formData:FormData) {
        controllerRef.current = new AbortController();
        setLoading(true);
        try {
            const res = await fetch('/api/generations', {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                body: formData,
                signal: controllerRef.current.signal
            });
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body?.message || 'Unknown error');
            }
            const data = await res.json();
            setLoading(false);
            return data;
        } catch (err) {
            setLoading(false);
            if ((err as any).name === 'AbortError') throw new Error('Aborted');
            throw err;
        }
    }


    function abort() {
        controllerRef.current?.abort();
    }

    return {generate, loading, abort}
}
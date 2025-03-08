'use client'

import { useEffect } from 'react';

const useTrackingScript = () => {
    useEffect(() => {
        const script = document.createElement('script');

        script.src = 'https://cloud.umami.is/script.js';
        script.defer = true;
        script.setAttribute('data-website-id', '3169858c-ce95-4afc-931e-5d86e03546e5');

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);
}

export default useTrackingScript;
export const injectScript = (src, async) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;

        if (async) {
            script.async = true;
        }

        document.head.appendChild(script);

        script.addEventListener("load", () => {
            resolve();
        });
        script.addEventListener("error", (e) => {
            reject(e);
        });
    });
}

async function probe() {
    try {
        const res = await fetch('http://148.230.94.26:3000/');
        const html = await res.text();
        console.log('--- HTML PREVIEW ---');
        console.log(html.substring(0, 1000));
        console.log('--- SEARCHING FOR API/FORM ---');
        const formMatch = html.match(/<form[^>]*action=["']([^"']*)["']/);
        console.log('Form Action:', formMatch ? formMatch[1] : 'Not found');

        // Search for scripts that might contain trpc or api paths
        const scripts = html.match(/<script[^>]*src=["']([^"']*)["']/g);
        console.log('Scripts:', scripts);
    } catch (err) {
        console.error('Error:', err.message);
    }
}
probe();

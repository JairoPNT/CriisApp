const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const url = process.argv[2] || 'https://www.google.com';
    const outputPath = process.argv[3] || path.join(__dirname, 'demo.png');
    const videoDir = process.argv[4] || path.join(__dirname, 'videos');

    if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
    }

    console.log(`Starting interactive demo at ${url}...`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        recordVideo: {
            dir: videoDir,
            size: { width: 1280, height: 800 }
        }
    });

    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    try {
        await page.goto(url, { waitUntil: 'networkidle' });

        // Simular interacción si es Google
        if (url.includes('google')) {
            console.log('Searching for "PQRS CriisApp"...');
            await page.fill('textarea[name="q"]', 'PQRS CriisApp');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(2000);
            await page.mouse.wheel(0, 500);
            await page.waitForTimeout(1000);
        }

        console.log(`Saving final frame to ${outputPath}...`);
        await page.screenshot({ path: outputPath, fullPage: true });
    } catch (err) {
        console.error(`Demo failed: ${err.message}`);
    } finally {
        await context.close();
        await browser.close();

        const files = fs.readdirSync(videoDir);
        // Ordenar por fecha para obtener el más reciente
        const stats = files.map(f => ({ name: f, time: fs.statSync(path.join(videoDir, f)).mtime.getTime() }));
        stats.sort((a, b) => b.time - a.time);

        if (stats.length > 0) {
            console.log(`VIDEO_PATH:${path.join(videoDir, stats[0].name)}`);
        }
        console.log('Done.');
    }
})();

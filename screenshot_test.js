const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const url = process.argv[2] || 'https://pqr-frontend.easypanel.host/';
    const outputPath = process.argv[3] || path.join(__dirname, 'screenshot.png');
    const videoDir = process.argv[4] || path.join(__dirname, 'videos');

    if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
    }

    console.log(`Navigating to ${url}...`);
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
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        console.log(`Saving screenshot to ${outputPath}...`);
        await page.screenshot({ path: outputPath, fullPage: true });
    } catch (err) {
        console.error(`Navigation failed: ${err.message}`);
        // Still try to take a partial screenshot of whatever is there (error page)
        try { await page.screenshot({ path: outputPath }); } catch (e) { }
    } finally {
        await context.close();
        await browser.close();

        // Find the video file created (it will have a random name)
        const files = fs.readdirSync(videoDir);
        const videoFile = files.find(f => f.endsWith('.webm'));
        if (videoFile) {
            console.log(`Video recorded: ${path.join(videoDir, videoFile)}`);
        }
        console.log('Done.');
    }
})();

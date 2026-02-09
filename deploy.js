const DEPLOY_URLS = {
    backend: 'http://148.230.94.26:3000/api/deploy/0a4b221fde4f18529b3189fec135863b24457f276d577b29',
    frontend: 'http://148.230.94.26:3000/api/deploy/7f40f43f1f23f293432e594c6d34b329a565e2afa4c30aa9'
};

async function deploy(service) {
    const url = DEPLOY_URLS[service];
    if (!url) {
        console.error(`Unknown service: ${service}`);
        return;
    }

    console.log(`🚀 Triggering rebuild for ${service}...`);
    try {
        const response = await fetch(url, { method: 'POST' });
        if (response.ok) {
            console.log(`✅ ${service} rebuild triggered successfully!`);
        } else {
            console.error(`❌ Failed to trigger ${service}: ${response.statusText}`);
        }
    } catch (err) {
        console.error(`❌ Error deploying ${service}:`, err.message);
    }
}

async function runAll() {
    await deploy('backend');
    await deploy('frontend');
}

const arg = process.argv[2];
if (arg) {
    deploy(arg);
} else {
    runAll();
}

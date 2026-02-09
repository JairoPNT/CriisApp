const API_BASE = 'http://148.230.94.26:3000/api/v1';
const EMAIL = 'jairopinto.ca@gmail.com';
const PASSWORD = 'P3rro f3o g4to lind*';
const PROJECT = 'pqr-crismor';

async function run() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) {
            const errData = await loginRes.json();
            throw new Error(`Login failed: ${JSON.stringify(errData)}`);
        }

        const { token } = await loginRes.json();
        console.log('Login successful.');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log(`Getting project ${PROJECT} details...`);
        const projectRes = await fetch(`${API_BASE}/projects/${PROJECT}`, { headers });

        if (!projectRes.ok) {
            const errData = await projectRes.json();
            throw new Error(`Failed to get project: ${JSON.stringify(errData)}`);
        }

        const projectData = await projectRes.json();
        const services = projectData.services || [];

        console.log(`Found ${services.length} services.`);

        for (const service of services) {
            console.log(`Deploying service: ${service.name}...`);
            try {
                const deployRes = await fetch(`${API_BASE}/projects/${PROJECT}/services/${service.name}/deploy`, {
                    method: 'POST',
                    headers
                });
                if (deployRes.ok) {
                    console.log(`Deployment triggered for ${service.name}`);
                } else {
                    const errData = await deployRes.json();
                    console.error(`Failed to deploy ${service.name}:`, errData);
                }
            } catch (err) {
                console.error(`Failed to deploy ${service.name}:`, err.message);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

run();

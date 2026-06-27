async function generateAssistantAd() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const outputBox = document.getElementById('output');
    
    // Get values from the HTML inputs
    const platform = document.getElementById('platform').value;
    const ad_type = document.getElementById('ad_type').value;
    const trend_mode = document.getElementById('trend_mode').checked;
    const product = document.getElementById('product').value;
    const audience = document.getElementById('audience').value;
    const offer = document.getElementById('offer').value;
    const brand_voice = document.getElementById('brand_voice').value;
    const notes = document.getElementById('notes').value;

    // Build the prompt
    const prompt = `Create a ${ad_type} ad for ${platform}. 
    Product: ${product}. 
    Target Audience: ${audience}. 
    Offer: ${offer}. 
    Brand Voice: ${brand_voice}. 
    Notes: ${notes}. 
    Trend Mode Enabled: ${trend_mode}. 
    Please provide hooks, a script, and conversion strategy.`;

    // Show loading screen
    loadingOverlay.style.display = 'flex';
    outputBox.innerText = "Processing...";

    try {
        const response = await fetch('http://localhost:3000/api/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            outputBox.innerText = data.choices[0].message.content;
        } else {
            outputBox.innerText = "Error: " + JSON.stringify(data);
        }
    } catch (error) {
        outputBox.innerText = "Connection Error: Ensure node server.js is running on port 3000.";
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

function clearForm() {
    document.getElementById('product').value = '';
    document.getElementById('audience').value = '';
    document.getElementById('offer').value = '';
    document.getElementById('brand_voice').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('output').innerText = "Waiting for AI…";
}


document.addEventListener('DOMContentLoaded', () => {
    // Scroll to pricing
    const cardWhy = document.getElementById('card-why');
    if (cardWhy) {
        cardWhy.onclick = () => {
            const pricingPanel = document.getElementById('pricing-panel');
            if (pricingPanel) pricingPanel.scrollIntoView({ behavior: 'smooth' });
        };
    }

    // Trigger subscription flow
    const cardUpgrade = document.getElementById('card-upgrade');
    if (cardUpgrade) {
        cardUpgrade.onclick = () => {
            console.log("Subscription flow initiated");
        };
    }

    // Generate results
    const cardResults = document.getElementById('card-results');
    if (cardResults) {
        cardResults.onclick = () => {
            console.log("Generating elite sample...");
        };
    }

    // Auto-save all inputs and textareas to prevent re-typing
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        if (input.id) {
            // Load saved data on refresh
            input.value = localStorage.getItem(input.id) || '';

            // Save data whenever you type
            input.addEventListener('input', () => {
                localStorage.setItem(input.id, input.value);
            });
        }
    });
});

console.log('🚀 Revenue Model Datei wurde geladen!');

// Einfacher Test
window.testRevenueModel = function() {
    console.log('Revenue Model funktioniert!');
};

// Tab-Switch abfangen
if (window.switchProjektTab) {
    const original = window.switchProjektTab;
    window.switchProjektTab = function(tab) {
        original(tab);
        if (tab === 'revenue-model') {
            const container = document.getElementById('projekt-tab-revenue-model');
            if (container) {
                container.innerHTML = '<h2 style="padding:40px; text-align:center;">✅ Revenue Model Tab funktioniert!</h2>';
            }
        }
    };
}

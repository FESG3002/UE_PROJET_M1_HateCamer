document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusElement = document.getElementById('status');
    
    // Fonction pour mettre à jour l'interface
    function updateUI(isActive) {
        if (isActive) {
            toggleSwitch.classList.add('active');
            statusElement.textContent = 'Activé ✓';
            statusElement.style.color = '#4CAF50';
        } else {
            toggleSwitch.classList.remove('active');
            statusElement.textContent = 'Désactivé';
            statusElement.style.color = '#ffcccc';
        }
    }
    
    // Vérifier le statut actuel au chargement
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('web.whatsapp.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Erreur:', chrome.runtime.lastError);
                    updateUI(false);
                } else if (response) {
                    updateUI(response.active);
                }
            });
        } else {
            statusElement.textContent = 'Ouvrez WhatsApp Web';
            statusElement.style.color = '#ffaa00';
            toggleSwitch.style.opacity = '0.5';
            toggleSwitch.style.pointerEvents = 'none';
        }
    });
    
    // Gérer le clic sur le toggle
    toggleSwitch.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('web.whatsapp.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle'}, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('Erreur:', chrome.runtime.lastError);
                        statusElement.textContent = 'Erreur - Rechargez la page';
                        statusElement.style.color = '#ff4444';
                    } else if (response) {
                        updateUI(response.active);
                    }
                });
            } else {
                alert('Veuillez d\'abord ouvrir WhatsApp Web dans cet onglet.');
            }
        });
    });

   
});
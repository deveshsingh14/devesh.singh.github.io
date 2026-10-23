export function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 10000;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const bgColor = type === 'error' ? 'var(--danger)' : (type === 'warning' ? 'var(--amber)' : 'var(--teal)');
    const textColor = type === 'warning' ? 'var(--obsidian)' : '#ffffff';

    toast.style.cssText = `
        background-color: ${bgColor};
        color: ${textColor};
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 6px var(--navy-shadow);
        font-family: var(--font-mono);
        font-size: 0.9rem;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.addEventListener('transitionend', () => {
            toast.remove();
            if (toastContainer.childNodes.length === 0) {
                toastContainer.remove();
            }
        });
    }, 3000);
}

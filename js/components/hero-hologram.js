// Hero hologram: the DSB logo as a 3D hologram. Three.js is only downloaded
// once the hero is on screen, and the flat logo is shown when WebGL is unavailable.

function supportsWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
        return false;
    }
}

export function initHeroHologram() {
    const mount = document.getElementById('hero-hologram');
    if (!mount) return;

    const fallback = mount.querySelector('.hero-hologram-fallback');
    const showFallback = () => {
        if (fallback) fallback.hidden = false;
    };

    if (!supportsWebGL() || typeof IntersectionObserver === 'undefined') {
        showFallback();
        return;
    }

    let hologram = null;
    let loading = false;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible && !hologram && !loading) {
            loading = true;
            import('./hologram-scene.js')
                .then(({ createHologram }) => {
                    hologram = createHologram(mount);
                    hologram.setActive(true);
                })
                .catch(() => showFallback());
        } else if (hologram) {
            hologram.setActive(visible);
        }
    }, { rootMargin: '100px' });

    observer.observe(mount);
}

document.addEventListener('DOMContentLoaded', initHeroHologram);

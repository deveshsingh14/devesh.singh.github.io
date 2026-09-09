export function initTypewriter() {
    const phrases = ["AWS infrastructure.", "full-stack Node.js apps.", "CI/CD pipelines.", "LLM-Agent integrations.", "automated deployments."];
    let currentPhraseIndex = 0;
    let isDeleting = false;
    let txt = '';
    const typewriterElement = document.getElementById('typewriter');

    function typeWriter() {
        const fullTxt = phrases[currentPhraseIndex];

        if (isDeleting) {
            txt = fullTxt.substring(0, txt.length - 1);
        } else {
            txt = fullTxt.substring(0, txt.length + 1);
        }

        if(typewriterElement) typewriterElement.innerHTML = txt;

        let typeSpeed = 100;

        if (isDeleting) {
            typeSpeed /= 2;
        }

        if (!isDeleting && txt === fullTxt) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && txt === '') {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(typeWriter, typeSpeed);
    }

    if(typewriterElement) typeWriter();
}
document.addEventListener('DOMContentLoaded', initTypewriter);

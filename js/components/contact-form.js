export function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const messageInput = document.getElementById('message');
        const charCount = document.getElementById('message-char-count');

        if (messageInput && charCount) {
            messageInput.addEventListener('input', () => {
                const len = messageInput.value.length;
                const maxLen = messageInput.maxLength;
                charCount.textContent = len;
                if (len >= maxLen) {
                    charCount.style.color = 'var(--danger)';
                } else if (len >= maxLen * 0.9) {
                    charCount.style.color = 'var(--amber)';
                } else {
                    charCount.style.color = '';
                }
            });
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalHTML = submitBtn.innerHTML;
            const announcer = document.getElementById('contact-submit-announcer');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending...';
            if (announcer) announcer.textContent = 'Sending...';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    submitBtn.innerText = 'Message Sent!';
                    if (announcer) announcer.textContent = 'Message Sent!';
                    submitBtn.style.backgroundColor = 'var(--teal-tint)';
                    contactForm.reset();
                    if (charCount) {
                        charCount.textContent = '0';
                        charCount.style.color = '';
                    }
                } else {
                    submitBtn.innerText = 'Error: Please try again.';
                    if (announcer) announcer.textContent = 'Error: Please try again.';
                    submitBtn.style.color = 'var(--danger)';
                    submitBtn.style.borderColor = 'var(--danger)';
                }
            } catch (error) {
                submitBtn.innerText = 'Error: Network issue.';
                if (announcer) announcer.textContent = 'Error: Network issue.';
                submitBtn.style.color = 'var(--danger)';
                submitBtn.style.borderColor = 'var(--danger)';
            } finally {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHTML;
                    if (announcer) announcer.textContent = '';
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.borderColor = '';
                }, 3000);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', initContactForm);

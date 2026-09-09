export function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalHTML = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Sending...';

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
                    submitBtn.style.backgroundColor = 'var(--teal-tint)';
                    contactForm.reset();
                } else {
                    submitBtn.innerText = 'Error: Please try again.';
                    submitBtn.style.color = 'var(--danger)';
                    submitBtn.style.borderColor = 'var(--danger)';
                }
            } catch (error) {
                submitBtn.innerText = 'Error: Network issue.';
                submitBtn.style.color = 'var(--danger)';
                submitBtn.style.borderColor = 'var(--danger)';
            } finally {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.borderColor = '';
                }, 3000);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', initContactForm);

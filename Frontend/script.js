const BACKEND_URL = 'http://127.0.0.1:8000';

function getSafeUrl(rawUrl, allowHttpLocal = false) {
    try {
        const parsed = new URL(rawUrl, window.location.origin);
        if (parsed.protocol === 'https:') {
            return parsed.href;
        }
        if (allowHttpLocal && parsed.protocol === 'http:' && (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')) {
            return parsed.href;
        }
        return null;
    } catch {
        return null;
    }
}

function createStatusNode(message) {
    const status = document.createElement('p');
    status.className = 'col-span-full text-center text-gray-500';
    status.textContent = message;
    return status;
}

function createInstagramCard(post) {
    const postUrl = getSafeUrl(post?.permalink);
    const mediaCandidate = post?.media_type === 'VIDEO' ? (post?.thumbnail_url || post?.media_url) : post?.media_url;
    const mediaUrl = getSafeUrl(mediaCandidate);

    if (!postUrl || !mediaUrl) {
        return null;
    }

    const anchor = document.createElement('a');
    anchor.href = postUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.className = 'instagram-card group relative block overflow-hidden aspect-square bg-brand-card';

    const image = document.createElement('img');
    image.src = mediaUrl;
    image.alt = 'Tattoo Artist Work';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.className = 'w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:opacity-60';

    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-10';

    const icon = document.createElement('i');
    icon.className = 'fab fa-instagram text-3xl text-white mb-2 drop-shadow-lg';

    const label = document.createElement('span');
    label.className = 'text-xs text-white uppercase tracking-widest font-bold';
    label.textContent = 'Ver Post';

    overlay.append(icon, label);
    anchor.append(image, overlay);
    return anchor;
}

function showLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'A enviar...';
    }
}

function hideLoading(form, originalText = 'Enviar Pedido') {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

async function fetchAllPosts() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/instagram-feed`);
        if (!response.ok) throw new Error('Erro na API do Instagram');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const yearsElement = document.getElementById('years-value');
    if (yearsElement) {
        fetch(`${BACKEND_URL}/years-experience`)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao ligar ao servidor');
                return response.json();
            })
            .then(data => {
                yearsElement.innerText = data;
            })
            .catch(err => {
                console.error('Erro ao carregar anos:', err);
                yearsElement.innerText = '5+';
            });
    }

    const galleryGrid = document.getElementById('instagram-grid');
    if (galleryGrid) {
        const allPosts = await fetchAllPosts();
        if (!allPosts || allPosts.length === 0) {
            galleryGrid.replaceChildren(createStatusNode('Nenhum post disponível.'));
        } else {
            // Filtrar apenas posts que não são reels
            const filteredPosts = allPosts.filter(post => {
                return post.type !== 'reel' && post.media_type !== 'VIDEO';
            });

            galleryGrid.replaceChildren();
            filteredPosts.forEach(post => {
                const card = createInstagramCard(post);
                if (card) {
                    galleryGrid.appendChild(card);
                }
            });

            if (galleryGrid.childElementCount === 0) {
                galleryGrid.replaceChildren(createStatusNode('Nenhum post válido para mostrar.'));
            }
        }
    }

    const personalidadesCarousel = document.getElementById('personalidades-carousel');

    if (personalidadesCarousel) {
        const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const autoplayState = {
            paused: reduceMotionQuery.matches,
            frameId: null,
            lastTimestamp: 0
        };

        const createLoop = () => {
            if (personalidadesCarousel.dataset.loopReady === 'true') {
                return;
            }

            const cards = Array.from(personalidadesCarousel.querySelectorAll('.personalidade-card'));
            cards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.tabIndex = -1;
                personalidadesCarousel.appendChild(clone);
            });

            personalidadesCarousel.dataset.loopReady = 'true';
        };

        createLoop();

        const loopWidth = () => personalidadesCarousel.scrollWidth / 2;

        const tick = (timestamp) => {
            if (!autoplayState.lastTimestamp) {
                autoplayState.lastTimestamp = timestamp;
            }

            const delta = Math.min(timestamp - autoplayState.lastTimestamp, 32);
            autoplayState.lastTimestamp = timestamp;

            if (!autoplayState.paused && !document.hidden) {
                personalidadesCarousel.scrollLeft += delta * 0.04;

                const halfWidth = loopWidth();
                if (halfWidth > 0 && personalidadesCarousel.scrollLeft >= halfWidth) {
                    personalidadesCarousel.scrollLeft -= halfWidth;
                }
            }

            autoplayState.frameId = window.requestAnimationFrame(tick);
        };

        const pauseAutoplay = () => {
            autoplayState.paused = true;
        };

        const resumeAutoplay = () => {
            autoplayState.paused = reduceMotionQuery.matches || document.hidden;
            autoplayState.lastTimestamp = 0;
        };

        personalidadesCarousel.addEventListener('pointerenter', pauseAutoplay);
        personalidadesCarousel.addEventListener('pointerdown', pauseAutoplay);
        personalidadesCarousel.addEventListener('pointerleave', resumeAutoplay);
        personalidadesCarousel.addEventListener('focusin', pauseAutoplay);
        personalidadesCarousel.addEventListener('focusout', resumeAutoplay);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseAutoplay();
                return;
            }

            resumeAutoplay();
        });

        if (typeof reduceMotionQuery.addEventListener === 'function') {
            reduceMotionQuery.addEventListener('change', () => {
                if (reduceMotionQuery.matches) {
                    pauseAutoplay();
                } else {
                    resumeAutoplay();
                }
            });
        }

        autoplayState.frameId = window.requestAnimationFrame(tick);
    }

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;

            const formData = {
                user_name: form.user_name.value.trim(),
                user_mobile: form.user_mobile.value.trim(),
                user_email: form.user_email.value.trim(),
                message: form.message.value.trim()
            };

            if (!formData.user_name) {
                alert('Por favor, introduza o seu nome.');
                return;
            }

            if (!formData.message) {
                alert('Por favor, introduza uma mensagem.');
                return;
            }

            if (!formData.user_mobile && !formData.user_email) {
                alert('Por favor, introduza pelo menos um contacto (telemóvel ou email).');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (formData.user_email && !emailPattern.test(formData.user_email)) {
                alert('Por favor, introduza um email válido.');
                return;
            }

            showLoading(form);

            try {
                const response = await fetch(`${BACKEND_URL}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const modal = document.getElementById('success-modal');
                    if (modal) {
                        modal.classList.remove('hidden');
                        modal.classList.add('flex');
                    }
                    form.reset();
                } else {
                    const errorData = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
                    console.error('Erro ao enviar e-mail:', errorData);
                    alert(`Erro: ${errorData.detail || "Não foi possível enviar o pedido. Por favor, tente novamente mais tarde."}`);
                }
            } catch (error) {
                console.error('Erro de ligação:', error);
                alert("Erro de ligação. Verifique a sua conexão à internet e tente novamente.");
            } finally {
                hideLoading(form);
            }
        });
    }

    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('success-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
    }
});
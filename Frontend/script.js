const BACKEND_URL = 'https://backend-tatto-git-main-pedro-tatto-artist.vercel.app';

function createStatusNode(message) {
    const status = document.createElement('p');
    status.className = 'col-span-full text-center text-gray-500';
    status.textContent = message;
    return status;
}

function createInstagramCard(post) {
    const postUrl = post.permalink;
    const mediaUrl = post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url;

    if (!postUrl || !mediaUrl) {
        console.error('Post ou mídia inválida:', post);
        return null;
    }

    const anchor = document.createElement('a');
    anchor.href = postUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.className = 'instagram-card group relative block overflow-hidden aspect-square bg-brand-card';

    const image = document.createElement('img');
    image.src = mediaUrl;
    image.alt = post.caption || 'Tattoo Artist Work';
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

async function fetchAllPosts() {
    try {
        console.log(`Buscando posts em: ${BACKEND_URL}/api/instagram-feed`);
        const response = await fetch(`${BACKEND_URL}/api/instagram-feed`);
        if (!response.ok) {
            throw new Error(`Erro na API do Instagram: ${response.status}`);
        }
        const data = await response.json();
        console.log('Posts recebidos:', data);
        return data.data;
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return [];
    }
}

async function fetchYearsExperience() {
    try {
        console.log(`Buscando anos de experiência em: ${BACKEND_URL}/years-experience`);
        const response = await fetch(`${BACKEND_URL}/years-experience`);
        if (!response.ok) throw new Error('Erro ao ligar ao servidor');
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Erro ao carregar anos:', err);
        return '...';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const yearsElement = document.getElementById('years-value');
    if (yearsElement) {
        const years = await fetchYearsExperience();
        yearsElement.innerText = years;
    }

    const galleryGrid = document.getElementById('instagram-grid');
    if (galleryGrid) {
        const allPosts = await fetchAllPosts();
        if (!allPosts || allPosts.length === 0) {
            galleryGrid.replaceChildren(createStatusNode('Erro ao carregar o feed do Instagram.'));
            return;
        }

        const filteredPosts = allPosts.filter(post => post.media_type !== 'VIDEO');
        console.log('Posts filtrados:', filteredPosts);

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

            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'A enviar...';
            }

            try {
                console.log(`Enviando e-mail para: ${BACKEND_URL}/api/send-email`);
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
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Enviar Pedido';
                }
            }
        });
    }

    const closeModalBtn = document.getElementProxy();
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

export function initLoginModal(container: HTMLElement | null) {
  if (!container) return;

  container.innerHTML = `
    <div id="login-modal" class="fixed inset-0 z-[100] hidden modal-overlay flex items-center justify-center opacity-0 transition-opacity duration-300" role="presentation">
      <div class="bg-charcoal border border-brand-1/20 p-8 w-full max-w-md relative flex flex-col gap-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        
        <button id="close-login-btn" type="button" aria-label="Cerrar ventana de acceso" class="absolute top-4 right-4 text-brand-1/50 hover:text-brand-3 text-2xl leading-none">
          &times;
        </button>

        <h3 id="login-modal-title" class="font-display font-bold text-3xl text-brand-1 uppercase text-center">
          Acceso<span class="text-brand-3">.</span>
        </h3>
        <p class="font-body text-brand-1/70 text-center text-sm">
          Ingresa a tu cuenta para guardar tus favoritos y ver tus pedidos recientes.
        </p>

        <form class="flex flex-col gap-4 font-body mt-4">
          <div class="flex flex-col gap-1">
            <label for="login-email" class="text-xs uppercase text-brand-1/50 font-bold tracking-widest">Email</label>
            <input id="login-email" name="email" type="email" autocomplete="email" required class="bg-brand-1/5 border border-brand-1/20 text-brand-1 p-3 outline-none focus:border-brand-3 transition-colors" placeholder="tu@email.com">
          </div>
          <div class="flex flex-col gap-1">
            <label for="login-password" class="text-xs uppercase text-brand-1/50 font-bold tracking-widest">Contraseña</label>
            <input id="login-password" name="password" type="password" autocomplete="current-password" required class="bg-brand-1/5 border border-brand-1/20 text-brand-1 p-3 outline-none focus:border-brand-3 transition-colors" placeholder="••••••••">
          </div>
          
          <button type="submit" class="minimal-btn bg-brand-3 text-white hover:bg-brand-4 mt-2 w-full uppercase tracking-widest text-sm">
            Ingresar
          </button>
          <p id="login-feedback" class="hidden text-center text-sm text-brand-2" role="status" aria-live="polite"></p>
        </form>

      </div>
    </div>
  `;

  // Attach event listeners
  const openButtons = [
    document.getElementById('open-login-btn'),
    document.getElementById('open-login-mobile-btn')
  ].filter((button): button is HTMLElement => button !== null);
  const closeButton = document.getElementById('close-login-btn');
  const modal = document.getElementById('login-modal');
  const dialog = modal?.querySelector<HTMLElement>('[role="dialog"]');
  const emailInput = document.getElementById('login-email') as HTMLInputElement | null;
  const form = modal?.querySelector<HTMLFormElement>('form');
  const feedback = document.getElementById('login-feedback');
  let previouslyFocused: HTMLElement | null = null;
  let closeTimer = 0;

  if (!modal || !dialog) return;

  const closeModal = () => {
    window.clearTimeout(closeTimer);
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    closeTimer = window.setTimeout(() => {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      previouslyFocused?.focus();
    }, 300);
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.clearTimeout(closeTimer);
      previouslyFocused = button.id === 'open-login-mobile-btn'
        ? document.getElementById('mobile-menu-btn')
        : button;
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        emailInput?.focus();
      });
    });
  });

  closeButton?.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!feedback) return;
    feedback.textContent = 'El acceso estará disponible cuando conectemos el servicio de cuentas.';
    feedback.classList.remove('hidden');
  });
}

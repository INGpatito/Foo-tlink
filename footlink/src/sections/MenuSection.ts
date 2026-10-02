export function initMenuSection(container: HTMLElement | null) {
  if (!container) return;

  container.innerHTML = `
    <div class="container mx-auto px-6 md:px-8 w-full min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-20">
      <div class="order-2 lg:order-1 flex flex-col gap-6 z-20 pointer-events-auto text-white">
        <div class="self-start rounded-full border border-brand-2/30 bg-brand-2/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-brand-2">
          Edición limitada
        </div>

        <h2 class="font-display font-bold text-5xl md:text-7xl leading-none uppercase">
          Dulce<br>
          <span class="text-transparent text-stroke" style="-webkit-text-stroke-color: white;">Obsesión</span>
        </h2>

        <p class="font-body text-white/80 text-lg leading-relaxed max-w-md">
          Glaseado artesanal de vainilla de Madagascar con toques de lavanda. Un final perfecto que se deshace en el paladar.
        </p>

        <div class="mt-1 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/70">
          <span class="rounded-full border border-white/15 px-3 py-2">Vainilla de Madagascar</span>
          <span class="rounded-full border border-white/15 px-3 py-2">Notas de lavanda</span>
        </div>

        <div class="mt-2">
          <button id="add-donut-btn" type="button" class="minimal-btn border-brand-1 bg-brand-1 text-charcoal hover:border-brand-2 hover:bg-brand-2">
            Añadir al pedido <span aria-hidden="true">·</span> $4.50
          </button>
          <p id="order-feedback" class="hidden mt-4 text-sm text-white/80" role="status" aria-live="polite"></p>
        </div>
      </div>

      <div class="menu-product-stage order-1 lg:order-2 relative flex min-h-[260px] items-end justify-end pointer-events-none lg:min-h-[520px]">
        <span class="product-orbit" aria-hidden="true"></span>
        <span class="absolute inset-0 flex items-center justify-center font-display font-black text-[clamp(5rem,15vw,13rem)] leading-none text-white/[0.035] select-none" aria-hidden="true">DONAS</span>
      </div>
    </div>
  `;

  const addButton = container.querySelector<HTMLButtonElement>('#add-donut-btn');
  const feedback = container.querySelector<HTMLElement>('#order-feedback');
  let quantity = 0;

  addButton?.addEventListener('click', () => {
    quantity += 1;
    if (!feedback) return;

    const total = (quantity * 4.5).toFixed(2);
    feedback.textContent = `${quantity} ${quantity === 1 ? 'dona añadida' : 'donas añadidas'} · $${total}. Pedido de prueba; todavía no se envía.`;
    feedback.classList.remove('hidden');
  });
}

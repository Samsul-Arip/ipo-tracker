export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    // Styles
    const baseClasses = "min-w-[320px] max-w-md bg-white/90 backdrop-blur-md border-l-4 p-4 rounded-lg shadow-xl flex items-start gap-3 transform transition-all duration-500 translate-x-full opacity-0 pointer-events-auto";
    const typeClasses = type === 'success' ? "border-green-500 text-green-800" : "border-red-500 text-red-800";
    const icon = type === 'success'
        ? `<svg class="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        : `<svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

    toast.className = `${baseClasses} ${typeClasses}`;
    toast.innerHTML = `
        ${icon}
        <div class="flex-1">
            <h4 class="font-bold text-sm">${type === 'success' ? 'Berhasil' : 'Gagal'}</h4>
            <p class="text-sm opacity-90 mt-0.5 leading-snug">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;

    container.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    });

    // Auto Dismiss
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 500); // Wait for transition
    }, 4000);
}

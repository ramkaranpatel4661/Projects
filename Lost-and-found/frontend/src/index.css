@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%; /* ✅ Added for full browser support */
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500;
  }

  .btn-secondary {
    @apply btn bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500;
  }

  .btn-outline {
    @apply btn border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500;
  }

  .btn-success {
    @apply btn bg-green-600 hover:bg-green-700 text-white focus:ring-green-500;
  }

  .btn-danger {
    @apply btn bg-red-600 hover:bg-red-700 text-white focus:ring-red-500;
  }

  .form-input {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200;
  }

  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden;
  }

  .card-hover {
    @apply card hover:shadow-md hover:border-gray-300 transition-all duration-200;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .badge-found {
    @apply badge bg-green-100 text-green-800;
  }

  .badge-lost {
    @apply badge bg-red-100 text-red-800;
  }

  .badge-active {
    @apply badge bg-blue-100 text-blue-800;
  }

  .badge-resolved {
    @apply badge bg-gray-100 text-gray-800;
  }

  .skeleton {
    @apply animate-pulse bg-gray-200 rounded;
  }

  .loading-dots::after {
    content: '';
    animation: loading-dots 1.5s infinite;
  }

  @keyframes loading-dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgb(156 163 175) transparent;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgb(156 163 175);
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: rgb(107 114 128);
  }
}

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown 0.3s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

/* Responsive text sizing */
.text-responsive-xs {
  @apply text-xs sm:text-sm;
}

.text-responsive-sm {
  @apply text-sm sm:text-base;
}

.text-responsive-base {
  @apply text-base sm:text-lg;
}

.text-responsive-lg {
  @apply text-lg sm:text-xl;
}

.text-responsive-xl {
  @apply text-xl sm:text-2xl;
}

.text-responsive-2xl {
  @apply text-2xl sm:text-3xl;
}

.text-responsive-3xl {
  @apply text-3xl sm:text-4xl;
}

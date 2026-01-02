<script lang="ts">
  import { onMount } from 'svelte';
  
  // Data for the slides
  const slides = [
    {
      image: "/main_window.png",
      badgeTitle: "Browse & Install",
      badgeText: "Easily find & install recipes, from our cookbook.",
      badgeDescription: "Browse for recipes from our cookbook, and easily install them with one click - or, dive deep and customise for your perfect desktop.",
      badgeIcon: "ph-magnifying-glass"
    },
    {
      image: "/recipe_editor_config.png",
      badgeTitle: "Define & Style",
      badgeText: "Define new recipes and tray icons - with minimal effort.",
      badgeDescription: "Find your apps with a single pattern, and easily customise the tray icon - no coding or design required.",
      badgeIcon: "ph-magic-wand"
    },
    {
      image: "/recipe_editor_menu.png",
      badgeTitle: "Build Menus",
      badgeText: "Auto-discover icon menus, or build your own custom actions.",
      badgeDescription: "Construct & auto-discover complex menus with actions, separators, and submenus that hook directly into the app's D-Bus interface.",
      badgeIcon: "ph-list-dashes"
    },
    {
      image: "/recipe_editor_metadata.png",
      badgeTitle: "Publish",
      badgeText: "Easily publish your work to the cookbook or GNOME Extensions.",
      badgeDescription: "Define metadata to easily publish your recipe to the Status Kitchen cookbook or GNOME Extensions.",
      badgeIcon: "ph-target"
    }
  ];

  let currentIndex = 0;
  let interval: any;

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
  }

  function setSlide(index: number) {
    currentIndex = index;
    resetInterval();
  }

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 8000); // Slower interval for reading
  }

  onMount(() => {
    interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  });
</script>

<div class="w-full max-w-7xl mx-auto px-4">
    <div class="grid md:grid-cols-[2fr_1fr] gap-8 md:gap-12 items-center min-h-[60vh]">
        
        <!-- Left Column: Image Area -->
        <div class="relative group h-full flex flex-col md:flex-row items-center w-full">
            
            <!-- Mobile Only: Badge (Above Image) -->
            {#each slides as slide, index}
                <div 
                    class="md:hidden w-full mb-6 z-20 bg-surface-card dark:bg-[#303030] p-4 rounded-xl shadow-xl border border-white/10 transition-all duration-500 {currentIndex === index ? '' : 'hidden'}"
                    style="animation: fadeSlide 0.5s ease-out;"
                >
                    <div class="flex items-center gap-3">
                        <div class="shrink-0 w-10 h-10 relative flex items-center justify-center text-white">
                             <!-- Progress Circle -->
                             <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                                  <circle
                                      cx="20" cy="20" r="10"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="20" 
                                      stroke-dasharray="62.83"
                                      class="text-gnome-blue mobile-progress-ring drop-shadow-lg shadow-gnome-blue/30"
                                  />
                             </svg>
                            <i class={`ph-fill ${slide.badgeIcon} text-lg relative z-10`}></i>
                        </div>
                        <div>
                            <div class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">{slide.badgeTitle}</div>
                            <div class="font-bold text-cast-iron dark:text-white text-base leading-tight">{slide.badgeText}</div>
                        </div>
                    </div>
                </div>
            {/each}

            <!-- Main Image -->
            <div class="relative w-full flex-1 flex items-center justify-center min-h-[300px] md:min-h-full">
                {#each slides as slide, index}
                    <div 
                        class="absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center"
                        style="opacity: {currentIndex === index ? 1 : 0}; pointer-events: none;"
                    >
                        <img 
                            src={slide.image} 
                            alt={slide.badgeText}
                            class="w-full h-full object-contain drop-shadow-2xl max-h-[50vh] md:max-h-[80vh]"
                        />
                    </div>
                {/each}
            </div>
        </div>

        <!-- Right Column: Navigation Tabs (Desktop Only) -->
        <div class="hidden md:flex flex-col gap-4 self-center">
            {#each slides as slide, index}
                <button 
                    class="text-left p-6 rounded-2xl transition-all duration-300 border {currentIndex === index ? 'bg-white dark:bg-surface-card-dark border-transparent shadow-xl ring-2 ring-gnome-blue scale-105' : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5'}"
                    on:click={() => setSlide(index)}
                >
                    <div class="flex items-center gap-3 mb-3">
                        <i class={`ph-fill ${slide.badgeIcon} text-2xl ${currentIndex === index ? 'text-gnome-blue' : 'text-gray-400'}`}></i>
                        <h3 class="font-bold text-lg text-cast-iron dark:text-white">{slide.badgeTitle}</h3>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {slide.badgeDescription}
                    </p>
                    <!-- Progress Line if active -->
                    {#if currentIndex === index}
                    <div class="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
                        <div class="h-full bg-gnome-blue progress-bar"></div>
                    </div>
                    {/if}
                </button>
            {/each}
        </div>

    </div>
</div>

<style>
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  .progress-bar {
    animation: progress 8s linear;
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes circular-progress {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: -62.83; }
  }

  .mobile-progress-ring {
    animation: circular-progress 8s linear;
  }
</style>

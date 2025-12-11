import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { saveToStorage } from '../utils/storage';

export function useViewState(
    setup: Ref<any>,
    currentTripId: Ref<string | null>,
    tripList: Ref<any[]>,
    saveTripList: () => void,
    detectRate: () => Promise<void>,
    fetchWeather: (dest: string) => Promise<void>
) {
    const viewMode = ref<'plan' | 'map' | 'money' | 'translate'>('plan');
    const currentDayIdx = ref(0);

    const showTripMenu = ref(false);
    const showSetupModal = ref(false);
    const showTemplatePreview = ref(false);
    const isLoadingTemplate = ref(false);

    const isEditingTitle = ref(false);
    const editingTitleValue = ref('');
    const titleInputRef = ref<HTMLElement | null>(null);
    const titleTextRef = ref<HTMLElement | null>(null);

    const isEditingDestination = ref(false);
    const editingDestinationValue = ref('');
    const destinationInputRef = ref<HTMLElement | null>(null);

    const adjustTitleFontSize = () => {
        nextTick(() => {
            if (!titleTextRef.value) return;
            const element = titleTextRef.value as HTMLElement;
            const maxWidth = window.innerWidth <= 400 ? 100 : 140;
            element.style.maxWidth = `${maxWidth}px`;
            element.style.fontSize = '1.25rem';
            const scrollWidth = element.scrollWidth;
            const clientWidth = element.clientWidth || maxWidth;
            if (scrollWidth > clientWidth) {
                const ratio = clientWidth / scrollWidth;
                const baseSize = 20;
                const newSize = Math.max(baseSize * ratio * 0.95, 12);
                element.style.fontSize = `${newSize}px`;
            } else {
                element.style.fontSize = '1.25rem';
            }
        });
    };

    const startEditTitle = () => {
        editingTitleValue.value = setup.value.title || '';
        isEditingTitle.value = true;
        nextTick(() => {
            titleInputRef.value?.focus();
            (titleInputRef.value as HTMLInputElement | null)?.select?.();
        });
    };

    const saveTitle = async () => {
        const newTitle = editingTitleValue.value.trim();
        if (newTitle) {
            setup.value.title = newTitle;
            if (currentTripId.value) {
                saveToStorage(currentTripId.value, 'config', setup.value);
                const trip = tripList.value.find((t) => t.id === currentTripId.value);
                if (trip) {
                    trip.destination = newTitle;
                    saveTripList();
                }
            }
            adjustTitleFontSize();
        }
        isEditingTitle.value = false;
    };

    const cancelEditTitle = () => {
        isEditingTitle.value = false;
        editingTitleValue.value = '';
    };

    const startEditDestination = () => {
        editingDestinationValue.value = setup.value.destination || '';
        isEditingDestination.value = true;
        nextTick(() => {
            destinationInputRef.value?.focus();
            (destinationInputRef.value as HTMLInputElement | null)?.select?.();
        });
    };

    const saveDestination = async () => {
        const newDestination = editingDestinationValue.value.trim();
        if (newDestination) {
            const oldDestination = setup.value.destination;
            setup.value.destination = newDestination;
            if (currentTripId.value) {
                saveToStorage(currentTripId.value, 'config', setup.value);
            }
            if (newDestination !== oldDestination) {
                await detectRate();
                await fetchWeather(newDestination);
            }
        }
        isEditingDestination.value = false;
    };

    const cancelEditDestination = () => {
        isEditingDestination.value = false;
        editingDestinationValue.value = '';
    };

    watch(
        () => setup.value.title,
        () => {
            adjustTitleFontSize();
        }
    );

    watch(
        () => setup.value.destination,
        (val, oldVal) => {
            if (val && val !== oldVal) {
                detectRate();
                fetchWeather(val);
            }
        }
    );

    onMounted(() => {
        window.addEventListener('resize', adjustTitleFontSize);
        adjustTitleFontSize();
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', adjustTitleFontSize);
    });

    return {
        viewMode,
        currentDayIdx,
        showTripMenu,
        showSetupModal,
        showTemplatePreview,
        isLoadingTemplate,
        isEditingTitle,
        editingTitleValue,
        titleInputRef,
        titleTextRef,
        startEditTitle,
        saveTitle,
        cancelEditTitle,
        adjustTitleFontSize,
        isEditingDestination,
        editingDestinationValue,
        destinationInputRef,
        startEditDestination,
        saveDestination,
        cancelEditDestination,
    };
}


import { nextTick, ref, watch, type Ref } from 'vue';
import type { Day } from '../types';
import { geocodeText } from '../utils/geoapify';

export function useMapView(
    currentDay: Ref<Day>,
    viewMode: Ref<string>,
    currentDayIdx: Ref<number>,
    newExpense: Ref<any>
) {
    const isMapLoading = ref(false);
    const userLocation = ref<any>(null);
    let mapInstance: any = null;
    let userMarker: any = null;
    let geoWatchId: number | null = null;

    const initMap = async (): Promise<void> => {
        isMapLoading.value = true;
        await nextTick();
        if (!document.getElementById('map')) {
            isMapLoading.value = false;
            return;
        }
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }
        if (typeof window === 'undefined' || !(window as any).L) {
            console.error('Leaflet 未載入');
            isMapLoading.value = false;
            return;
        }
        const L = (window as any).L;
        mapInstance = L.map('map').setView([35.6895, 139.6917], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
        }).addTo(mapInstance);
        // 確保容器尺寸被 Leaflet 正確計算，避免初次渲染空白
        setTimeout(() => mapInstance?.invalidateSize(), 150);
        if ('geolocation' in navigator) {
            if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId);
            geoWatchId = navigator.geolocation.watchPosition(
                (pos) => {
                    userLocation.value = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                    const icon = L.divIcon({
                        className: 'custom-div-icon',
                        html: "<div class='gps-pulse'></div>",
                        iconSize: [14, 14],
                    });
                    if (userMarker) userMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
                    else
                        userMarker = L.marker([pos.coords.latitude, pos.coords.longitude], {
                            icon: icon,
                        }).addTo(mapInstance);
                },
                () => {},
                { enableHighAccuracy: true }
            );
        }
        const locs = currentDay.value.items.filter((i: any) => i.location);
        const bounds = L.latLngBounds();
        for (const item of locs) {
            try {
                await new Promise((r) => setTimeout(r, 300));
                const geo = await geocodeText(item.location);
                if (geo) {
                    const { lat, lon } = geo;
                    L.marker([lat, lon])
                        .addTo(mapInstance)
                        .bindPopup(`<b>${item.activity}</b><br>${item.location}`);
                    bounds.extend([lat, lon]);
                }
            } catch (e) {
                // ignore
            }
        }
        isMapLoading.value = false;
        if (locs.length > 0 && bounds.isValid()) mapInstance.fitBounds(bounds, { padding: [50, 50] });
    };

    const centerOnUser = (): void => {
        if (userLocation.value && mapInstance) mapInstance.flyTo([userLocation.value.lat, userLocation.value.lng], 15);
    };

    watch(viewMode, (v) => {
        if (v === 'map') {
            initMap();
        }
        if (v === 'money' && newExpense?.value) {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            newExpense.value.time = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        }
    });

    watch(currentDayIdx, () => {
        if (viewMode.value === 'map') initMap();
    });

    return {
        isMapLoading,
        userLocation,
        initMap,
        centerOnUser,
    };
}


import { nextTick, ref, type Ref } from 'vue';
import type { Day, UserLocation } from '../types/index';

// 地圖功能 Composable
export function useMap(currentDay: Ref<Day>) {
    const isMapLoading = ref<boolean>(false);
    const userLocation = ref<UserLocation | null>(null);
    let mapInstance: any = null;
    let userMarker: any = null;
    let geoWatchId: number | null = null;

    const initMap = async (): Promise<void> => {
        isMapLoading.value = true;
        await nextTick();
        if (!document.getElementById('map')) return;
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }
        mapInstance = (window as any).L.map('map').setView([35.6895, 139.6917], 13);
        (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
        }).addTo(mapInstance);
        if ('geolocation' in navigator) {
            if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId);
            geoWatchId = navigator.geolocation.watchPosition(
                (pos: GeolocationPosition) => {
                    userLocation.value = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                    const icon = (window as any).L.divIcon({
                        className: 'custom-div-icon',
                        html: "<div class='gps-pulse'></div>",
                        iconSize: [14, 14],
                    });
                    if (userMarker)
                        userMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
                    else
                        userMarker = (window as any).L.marker([pos.coords.latitude, pos.coords.longitude], {
                            icon: icon,
                        }).addTo(mapInstance);
                },
                (err: GeolocationPositionError) => { },
                { enableHighAccuracy: true }
            );
        }
        const locs = currentDay.value.items.filter((i: any) => i.location);
        const bounds = (window as any).L.latLngBounds();
        for (const item of locs) {
            try {
                await new Promise((r) => setTimeout(r, 500));
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        item.location
                    )}`
                );
                const d = await res.json();
                if (d && d.length > 0) {
                    const lat = parseFloat(d[0].lat);
                    const lon = parseFloat(d[0].lon);
                    (window as any).L.marker([lat, lon])
                        .addTo(mapInstance)
                        .bindPopup(`<b>${item.activity}</b><br>${item.location}`);
                    bounds.extend([lat, lon]);
                }
            } catch (e) { }
        }
        isMapLoading.value = false;
        if (locs.length > 0) mapInstance.fitBounds(bounds, { padding: [50, 50] });
    };

    const centerOnUser = (): void => {
        if (userLocation.value && mapInstance)
            mapInstance.flyTo([userLocation.value.lat, userLocation.value.lng], 15);
    };

    return {
        isMapLoading,
        userLocation,
        initMap,
        centerOnUser,
    };
}


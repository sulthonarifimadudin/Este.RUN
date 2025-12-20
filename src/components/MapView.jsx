import { MapContainer, TileLayer, Polyline, Marker, useMap, LayersControl } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet Default Icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function RecenterAutomatically({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng]);
        }
    }, [lat, lng, map]);
    return null;
}

const MapView = ({ routePath = [], currentPos, zoom = 15, interactive = true }) => {
    // Defensive coding: ensure routePath is an array
    const safeRoutePath = Array.isArray(routePath) ? routePath : [];

    // Safe map
    const routeArrays = safeRoutePath
        .filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number')
        .map(p => [p.lat, p.lng]);

    const centerPos = currentPos && typeof currentPos.lat === 'number'
        ? [currentPos.lat, currentPos.lng]
        : (routeArrays.length > 0 ? routeArrays[routeArrays.length - 1] : [-6.2088, 106.8456]);

    return (
        <div className="w-full h-full min-h-[300px]">
            {/* Wrapper div to ensure size */}
            <MapContainer
                center={centerPos}
                zoom={zoom}
                scrollWheelZoom={interactive}
                dragging={interactive}
                zoomControl={interactive}
                style={{ height: "100%", width: "100%" }} // Explicit style is vital for Leaflet
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Google Maps">
                        <TileLayer
                            attribution='&copy; Google Maps'
                            url="http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}"
                            maxZoom={20}
                            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satelit">
                        <TileLayer
                            attribution='&copy; Google Maps'
                            url="http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}"
                            maxZoom={20}
                            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Open Street Map">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {currentPos && typeof currentPos.lat === 'number' && (
                    <Marker position={[currentPos.lat, currentPos.lng]} />
                )}

                {routeArrays.length > 0 && (
                    <Polyline positions={routeArrays} color="#3730a3" weight={5} />
                )}

                {currentPos && typeof currentPos.lat === 'number' && <RecenterAutomatically lat={currentPos.lat} lng={currentPos.lng} />}
            </MapContainer>
        </div>
    );
};

export default MapView;

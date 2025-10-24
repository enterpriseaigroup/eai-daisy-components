'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface MapBoxProps {
  selectedAddress: string;
  propID: string | null;
  onLotSizeUpdate: ({ lotSize, gisLotWidth }: { lotSize: string; gisLotWidth: string }) => void;
  isVisible: boolean; // <-- NEW
}

const MapBox = ({ selectedAddress, propID, onLotSizeUpdate, isVisible }: MapBoxProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const animationRef = useRef<number | null>(null);

  const convertToLonLat = (x: number, y: number) => {
    const lon = (x / 20037508.34) * 180;
    let lat = (y / 20037508.34) * 180;
    lat = (180 / Math.PI) * (2 * Math.atan(Math.exp(lat * (Math.PI / 180))) - (Math.PI / 2));
    return [lon, lat];
  };

  const getCoordinates = async (address: string) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      return data.features?.[0]?.center || null;
    } catch (err) {
      console.error('Geocode error', err);
      return null;
    }
  };

  const getPropertyBoundary = async (propId: string) => {
    try {
      const res = await fetch(
        `https://api.apps1.nsw.gov.au/planning/viewersf/V1/ePlanningApi/boundary?id=${propId}&Type=property`
      );
      const data = await res.json();
      const rings = Array.isArray(data) ? data[0]?.geometry?.rings : data?.geometry?.rings;
      if (!rings) return null;

      const coords = rings[0].map((c: number[]) => convertToLonLat(c[0], c[1]));
      if (coords.length && (coords[0][0] !== coords.at(-1)[0] || coords[0][1] !== coords.at(-1)[1])) {
        coords.push(coords[0]); // Close the ring
      }
      return coords;
    } catch (err) {
      console.error('Boundary fetch error:', err);
      return null;
    }
  };

  const handleLotSizeUpdate = useCallback(
    (coords: [number, number][]) => {
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

      coords.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      });

      const earthRadius = 6378137;
      const lotWidth = Math.abs((maxLng - minLng) * (Math.PI / 180) * earthRadius * Math.cos(minLat * Math.PI / 180));
      const lotHeight = Math.abs((maxLat - minLat) * (Math.PI / 180) * earthRadius);
      const lotSize = (lotWidth * lotHeight).toFixed(2);

      onLotSizeUpdate({
        lotSize,
        gisLotWidth: lotWidth.toFixed(2)
      });
    },
    [onLotSizeUpdate]
  );

  const toggle3DMode = useCallback(() => {
    if (!map) return;
    const newMode = !is3DMode;
    setIs3DMode(newMode);
    if (newMode) {
        map.easeTo({
          pitch: 60,
          bearing: 30,
          zoom: 18,
          duration: 1000,
          center: map.getCenter(),
        });
      if (map.getLayer('3d-buildings')) {
        map.setLayoutProperty('3d-buildings', 'visibility', 'visible');
      }
      if (map.getLayer('property-boundary-extrusion')) {
        map.setLayoutProperty('property-boundary-extrusion', 'visibility', 'visible');
      }
    } else {
      // Switch to 2D mode
      map.setPitch(0);
      map.setBearing(0);
      if (map.getLayer('3d-buildings')) {
        map.setLayoutProperty('3d-buildings', 'visibility', 'none');
      }
      if (map.getLayer('property-boundary-extrusion')) {
        map.setLayoutProperty('property-boundary-extrusion', 'visibility', 'none');
      }
    }
  }, [map, is3DMode]);

  // Start boundary animation
  const startBoundaryAnimation = useCallback(() => {
    if (!map || !map.getLayer('property-boundary-outline')) return;
    const dashArraySequence = [
      [0, 4, 3],
      [1, 4, 2],
      [2, 4, 1],
      [3, 4, 0],
      [0, 1, 3, 3],
      [0, 2, 2, 3],
      [0, 3, 1, 3],
    ];
    const startTime = performance.now();
    const animate = (timestamp: number) => {
      if (!map || !map.getLayer('property-boundary-outline')) return;
      const elapsed = timestamp - startTime;
      const index = Math.floor((elapsed % 700) / 100);
      map.setPaintProperty(
        'property-boundary-outline',
        'line-dasharray',
        dashArraySequence[index % dashArraySequence.length]
      );
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [map]);

  useEffect(() => {
    const initMap = async () => {
      const coords = await getCoordinates(selectedAddress);
      if (!coords || !mapContainerRef.current) return;

      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: coords,
        zoom: 18,
        pitch: is3DMode ? 60 : 45,
        bearing: is3DMode ? 30 : -10,
        antialias: true,
      });

      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

      mapInstance.on('style.load', () => {
        const layers = mapInstance.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;
        // Enhanced 3D buildings with better aesthetics
        if (!mapInstance.getLayer('3d-buildings')) {
          mapInstance.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'height'],
                  0, '#d9d9d9',
                  50, '#b3b3b3',
                  100, '#8c8c8c',
                  200, '#666666'
                ],
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.7,
              },
            },
            labelLayerId
          );
        }
      });
      setMap(mapInstance);
    };

    if (!map) initMap();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedAddress, map]);

  useEffect(() => {
    if (!map) return;
    const timeout = setTimeout(() => {
      map.resize();
    }, 300); // Adjust delay to match your sidebar's CSS transition (300ms)
    return () => clearTimeout(timeout);
  }, [isVisible, map]);

  useEffect(() => {
    const updateMap = async () => {
      if (!map || !selectedAddress || !propID) return;
      const coords = await getCoordinates(selectedAddress);
      const polygon = await getPropertyBoundary(propID);
      if (!coords || !polygon) return;

      // Calculate the centroid of the polygon
      const centroid = polygon.reduce(
        (acc: [number, number], coord: [number, number]) => {
          const [lng, lat] = coord;
          acc[0] += lng / polygon.length;
          acc[1] += lat / polygon.length;
          return acc;
        },
        [0, 0]
      );

      // Add Marker
      if (marker) marker.remove();
      const newMarker = new mapboxgl.Marker({ color: 'red' })
      .setLngLat(centroid)
      .addTo(map);
      setMarker(newMarker);

      // Cleanup old boundary and animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (map.getSource('property-boundary')) {
        map.removeLayer('property-boundary-outline');
        map.removeLayer('property-boundary');
        if (map.getLayer('property-boundary-extrusion')) {
          map.removeLayer('property-boundary-extrusion');
        }
        map.removeSource('property-boundary');
      }

      // Add boundary
      map.addSource('property-boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [polygon] },
          properties: {
            height: 2, // Base height for 3D extrusion
          },
        },
      });

      // Add fill layer
      map.addLayer({
        id: 'property-boundary',
        type: 'fill',
        source: 'property-boundary',
        paint: {
          'fill-color': '#575757',
          'fill-opacity': 0.3,
        },
      });

      // Add animated outline layer
      map.addLayer({
        id: 'property-boundary-outline',
        type: 'line',
        source: 'property-boundary',
        paint: {
          'line-color': '#3A3A3A',
          'line-width': 3,
          'line-dasharray': [0, 4, 3],
        },
      });

      // Add 3D extrusion for property boundary
      map.addLayer({
        id: 'property-boundary-extrusion',
        type: 'fill-extrusion',
        source: 'property-boundary',
        paint: {
          'fill-extrusion-color': '#6E6E6E',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.6,
        },
        layout: {
          visibility: is3DMode ? 'visible' : 'none'
        }
      });

      // Start the boundary animation
      startBoundaryAnimation();
      handleLotSizeUpdate(polygon);

      const bounds = polygon.reduce(
        (
          [min, max]: [[number, number], [number, number]],
          [lng, lat]: [number, number]
        ) => [
          [Math.min(min[0], lng), Math.min(min[1], lat)],
          [Math.max(max[0], lng), Math.max(max[1], lat)],
        ],
        [[Infinity, Infinity], [-Infinity, -Infinity]]
      ) as [mapboxgl.LngLatLike, mapboxgl.LngLatLike];
      map.fitBounds(bounds, { padding: 100 });
    };

    updateMap();
  }, [selectedAddress, propID, map, is3DMode, startBoundaryAnimation, handleLotSizeUpdate]);

  return (
    <div className="relative w-full h-64 shadow-md rounded-xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* 3D Toggle Control */}
      <div className="absolute top-2 left-2">
        <button 
          onClick={toggle3DMode}
          className="px-2 py-1 text-sm font-medium transition-colors bg-white rounded-md shadow-md hover:bg-gray-100"
        >
          {is3DMode ? "2D View" : "3D View"}
        </button>
      </div>
    </div>
  );
};

export default MapBox;
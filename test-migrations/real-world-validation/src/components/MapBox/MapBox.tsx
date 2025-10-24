/**
 * MapBox - Configurator V2 Component
 *
 * Component MapBox from MapBox.tsx
 *
 * @migrated from DAISY v1
 */

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

  /**
   * BUSINESS LOGIC: MapBox
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements MapBox logic
   * 2. Calls helper functions: useRef, useState, useState, useState, useRef, Math.atan, Math.exp, fetch, encodeURIComponent, res.json, console.error, fetch, res.json, Array.isArray, .map, convertToLonLat, coords.push, coords.at, coords.at, console.error, useCallback, coords.forEach, Math.min, Math.min, Math.max, Math.max, Math.abs, Math.cos, Math.abs, .toFixed, onLotSizeUpdate, lotWidth.toFixed, useCallback, setIs3DMode, map.setPitch, map.setBearing, map.setLayoutProperty, map.getLayer, map.setLayoutProperty, map.getLayer, map.easeTo, map.getCenter, map.setLayoutProperty, map.getLayer, map.setLayoutProperty, map.getLayer, useCallback, map.getLayer, performance.now, map.getLayer, Math.floor, map.setPaintProperty, requestAnimationFrame, requestAnimationFrame, useEffect, getCoordinates, mapInstance.addControl, mapInstance.on, mapInstance.getStyle, layers.find, mapInstance.addLayer, mapInstance.getLayer, setMap, initMap, cancelAnimationFrame, useEffect, setTimeout, map.resize, clearTimeout, useEffect, getCoordinates, getPropertyBoundary, polygon.reduce, marker.remove, .addTo, .setLngLat, setMarker, cancelAnimationFrame, map.removeLayer, map.removeLayer, map.removeLayer, map.getLayer, map.removeSource, map.getSource, map.addSource, map.addLayer, map.addLayer, map.addLayer, startBoundaryAnimation, handleLotSizeUpdate, polygon.reduce, Math.min, Math.min, Math.max, Math.max, map.fitBounds, updateMap
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useRef() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useRef() - Function call
   * - Math.atan() - Function call
   * - Math.exp() - Function call
   * - fetch() - Function call
   * - encodeURIComponent() - Function call
   * - res.json() - Function call
   * - console.error() - Function call
   * - fetch() - Function call
   * - res.json() - Function call
   * - Array.isArray() - Function call
   * - .map() - Function call
   * - convertToLonLat() - Function call
   * - coords.push() - Function call
   * - coords.at() - Function call
   * - coords.at() - Function call
   * - console.error() - Function call
   * - useCallback() - Function call
   * - coords.forEach() - Function call
   * - Math.min() - Function call
   * - Math.min() - Function call
   * - Math.max() - Function call
   * - Math.max() - Function call
   * - Math.abs() - Function call
   * - Math.cos() - Function call
   * - Math.abs() - Function call
   * - .toFixed() - Function call
   * - onLotSizeUpdate() - Function call
   * - lotWidth.toFixed() - Function call
   * - useCallback() - Function call
   * - setIs3DMode() - Function call
   * - map.setPitch() - Function call
   * - map.setBearing() - Function call
   * - map.setLayoutProperty() - Function call
   * - map.getLayer() - Function call
   * - map.setLayoutProperty() - Function call
   * - map.getLayer() - Function call
   * - map.easeTo() - Function call
   * - map.getCenter() - Function call
   * - map.setLayoutProperty() - Function call
   * - map.getLayer() - Function call
   * - map.setLayoutProperty() - Function call
   * - map.getLayer() - Function call
   * - useCallback() - Function call
   * - map.getLayer() - Function call
   * - performance.now() - Function call
   * - map.getLayer() - Function call
   * - Math.floor() - Function call
   * - map.setPaintProperty() - Function call
   * - requestAnimationFrame() - Function call
   * - requestAnimationFrame() - Function call
   * - useEffect() - Function call
   * - getCoordinates() - Function call
   * - mapInstance.addControl() - Function call
   * - mapInstance.on() - Function call
   * - mapInstance.getStyle() - Function call
   * - layers.find() - Function call
   * - mapInstance.addLayer() - Function call
   * - mapInstance.getLayer() - Function call
   * - setMap() - Function call
   * - initMap() - Function call
   * - cancelAnimationFrame() - Function call
   * - useEffect() - Function call
   * - setTimeout() - Function call
   * - map.resize() - Function call
   * - clearTimeout() - Function call
   * - useEffect() - Function call
   * - getCoordinates() - Function call
   * - getPropertyBoundary() - Function call
   * - polygon.reduce() - Function call
   * - marker.remove() - Function call
   * - .addTo() - Function call
   * - .setLngLat() - Function call
   * - setMarker() - Function call
   * - cancelAnimationFrame() - Function call
   * - map.removeLayer() - Function call
   * - map.removeLayer() - Function call
   * - map.removeLayer() - Function call
   * - map.getLayer() - Function call
   * - map.removeSource() - Function call
   * - map.getSource() - Function call
   * - map.addSource() - Function call
   * - map.addLayer() - Function call
   * - map.addLayer() - Function call
   * - map.addLayer() - Function call
   * - startBoundaryAnimation() - Function call
   * - handleLotSizeUpdate() - Function call
   * - polygon.reduce() - Function call
   * - Math.min() - Function call
   * - Math.min() - Function call
   * - Math.max() - Function call
   * - Math.max() - Function call
   * - map.fitBounds() - Function call
   * - updateMap() - Function call
   *
   * WHY IT CALLS THEM:
   * - useRef: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useRef: Required functionality
   * - Math.atan: Required functionality
   * - Math.exp: Required functionality
   * - fetch: Data fetching
   * - encodeURIComponent: Required functionality
   * - res.json: Required functionality
   * - console.error: Error logging
   * - fetch: Data fetching
   * - res.json: Required functionality
   * - Array.isArray: Required functionality
   * - .map: Required functionality
   * - convertToLonLat: Required functionality
   * - coords.push: Required functionality
   * - coords.at: Required functionality
   * - coords.at: Required functionality
   * - console.error: Error logging
   * - useCallback: Required functionality
   * - coords.forEach: Required functionality
   * - Math.min: Required functionality
   * - Math.min: Required functionality
   * - Math.max: Required functionality
   * - Math.max: Required functionality
   * - Math.abs: Required functionality
   * - Math.cos: Required functionality
   * - Math.abs: Required functionality
   * - .toFixed: Required functionality
   * - onLotSizeUpdate: Required functionality
   * - lotWidth.toFixed: Required functionality
   * - useCallback: Required functionality
   * - setIs3DMode: State update
   * - map.setPitch: State update
   * - map.setBearing: State update
   * - map.setLayoutProperty: State update
   * - map.getLayer: Required functionality
   * - map.setLayoutProperty: State update
   * - map.getLayer: Required functionality
   * - map.easeTo: State update
   * - map.getCenter: Required functionality
   * - map.setLayoutProperty: State update
   * - map.getLayer: Required functionality
   * - map.setLayoutProperty: State update
   * - map.getLayer: Required functionality
   * - useCallback: Required functionality
   * - map.getLayer: Required functionality
   * - performance.now: Required functionality
   * - map.getLayer: Required functionality
   * - Math.floor: Required functionality
   * - map.setPaintProperty: State update
   * - requestAnimationFrame: Required functionality
   * - requestAnimationFrame: Required functionality
   * - useEffect: Required functionality
   * - getCoordinates: Required functionality
   * - mapInstance.addControl: Required functionality
   * - mapInstance.on: Required functionality
   * - mapInstance.getStyle: Required functionality
   * - layers.find: Required functionality
   * - mapInstance.addLayer: Required functionality
   * - mapInstance.getLayer: Required functionality
   * - setMap: State update
   * - initMap: Required functionality
   * - cancelAnimationFrame: Required functionality
   * - useEffect: Required functionality
   * - setTimeout: State update
   * - map.resize: Required functionality
   * - clearTimeout: Required functionality
   * - useEffect: Required functionality
   * - getCoordinates: Required functionality
   * - getPropertyBoundary: Required functionality
   * - polygon.reduce: Required functionality
   * - marker.remove: Required functionality
   * - .addTo: Required functionality
   * - .setLngLat: State update
   * - setMarker: State update
   * - cancelAnimationFrame: Required functionality
   * - map.removeLayer: Required functionality
   * - map.removeLayer: Required functionality
   * - map.removeLayer: Required functionality
   * - map.getLayer: Required functionality
   * - map.removeSource: Required functionality
   * - map.getSource: Required functionality
   * - map.addSource: Required functionality
   * - map.addLayer: Required functionality
   * - map.addLayer: Required functionality
   * - map.addLayer: Required functionality
   * - startBoundaryAnimation: Required functionality
   * - handleLotSizeUpdate: Required functionality
   * - polygon.reduce: Required functionality
   * - Math.min: Required functionality
   * - Math.min: Required functionality
   * - Math.max: Required functionality
   * - Math.max: Required functionality
   * - map.fitBounds: Required functionality
   * - updateMap: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useRef, useState, useState to process data
   * Output: Computed value or side effect
   *
   */
const MapBox = ({ selectedAddress, propID, onLotSizeUpdate, isVisible }: MapBoxProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const animationRef = useRef<number | null>(null);

    /**
     * BUSINESS LOGIC: convertToLonLat
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements convertToLonLat logic
     * 2. Calls helper functions: Math.atan, Math.exp
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - Math.atan() - Function call
     * - Math.exp() - Function call
     *
     * WHY IT CALLS THEM:
     * - Math.atan: Required functionality
     * - Math.exp: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls Math.atan, Math.exp to process data
     * Output: Computed value or side effect
     *
     */
  const convertToLonLat = (x: number, y: number) => {
    const lon = (x / 20037508.34) * 180;
    let lat = (y / 20037508.34) * 180;
    lat = (180 / Math.PI) * (2 * Math.atan(Math.exp(lat * (Math.PI / 180))) - (Math.PI / 2));
    return [lon, lat];
  };

    /**
     * BUSINESS LOGIC: getCoordinates
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements getCoordinates logic
     * 2. Calls helper functions: fetch, encodeURIComponent, res.json, console.error
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - fetch() - Function call
     * - encodeURIComponent() - Function call
     * - res.json() - Function call
     * - console.error() - Function call
     *
     * WHY IT CALLS THEM:
     * - fetch: Data fetching
     * - encodeURIComponent: Required functionality
     * - res.json: Required functionality
     * - console.error: Error logging
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls fetch, encodeURIComponent, res.json to process data
     * Output: Computed value or side effect
     *
     */
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

    /**
     * BUSINESS LOGIC: getPropertyBoundary
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements getPropertyBoundary logic
     * 2. Calls helper functions: fetch, res.json, Array.isArray, .map, convertToLonLat, coords.push, coords.at, coords.at, console.error
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - fetch() - Function call
     * - res.json() - Function call
     * - Array.isArray() - Function call
     * - .map() - Function call
     * - convertToLonLat() - Function call
     * - coords.push() - Function call
     * - coords.at() - Function call
     * - coords.at() - Function call
     * - console.error() - Function call
     *
     * WHY IT CALLS THEM:
     * - fetch: Data fetching
     * - res.json: Required functionality
     * - Array.isArray: Required functionality
     * - .map: Required functionality
     * - convertToLonLat: Required functionality
     * - coords.push: Required functionality
     * - coords.at: Required functionality
     * - coords.at: Required functionality
     * - console.error: Error logging
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls fetch, res.json, Array.isArray to process data
     * Output: Computed value or side effect
     *
     */
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

    /**
     * BUSINESS LOGIC: handleLotSizeUpdate
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls coords.forEach, Math.min, Math.min, Math.max, Math.max, Math.abs, Math.cos, Math.abs, .toFixed, onLotSizeUpdate, lotWidth.toFixed functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - coords.forEach() - Function call
     * - Math.min() - Function call
     * - Math.min() - Function call
     * - Math.max() - Function call
     * - Math.max() - Function call
     * - Math.abs() - Function call
     * - Math.cos() - Function call
     * - Math.abs() - Function call
     * - .toFixed() - Function call
     * - onLotSizeUpdate() - Function call
     * - lotWidth.toFixed() - Function call
     *
     * WHY IT CALLS THEM:
     * - coords.forEach: Required functionality
     * - Math.min: Required functionality
     * - Math.min: Required functionality
     * - Math.max: Required functionality
     * - Math.max: Required functionality
     * - Math.abs: Required functionality
     * - Math.cos: Required functionality
     * - Math.abs: Required functionality
     * - .toFixed: Required functionality
     * - onLotSizeUpdate: Required functionality
     * - lotWidth.toFixed: Required functionality
     *
     * DATA FLOW:
     * Input: onLotSizeUpdate state/props
     * Processing: Calls coords.forEach, Math.min, Math.min to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - onLotSizeUpdate: Triggers when onLotSizeUpdate changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
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

    /**
     * BUSINESS LOGIC: toggle3DMode
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setIs3DMode, map.setPitch, map.setBearing, map.setLayoutProperty, map.getLayer, map.setLayoutProperty, map.getLayer, map.easeTo, map.getCenter, map.setLayoutProperty, map.getLayer, map.setLayoutProperty, map.getLayer functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setIs3DMode() - Function call
     * - map.setPitch() - Function call
     * - map.setBearing() - Function call
     * - map.setLayoutProperty() - Function call
     * - map.getLayer() - Function call
     * - map.setLayoutProperty() - Function call
     * - map.getLayer() - Function call
     * - map.easeTo() - Function call
     * - map.getCenter() - Function call
     * - map.setLayoutProperty() - Function call
     * - map.getLayer() - Function call
     * - map.setLayoutProperty() - Function call
     * - map.getLayer() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIs3DMode: State update
     * - map.setPitch: State update
     * - map.setBearing: State update
     * - map.setLayoutProperty: State update
     * - map.getLayer: Required functionality
     * - map.setLayoutProperty: State update
     * - map.getLayer: Required functionality
     * - map.easeTo: State update
     * - map.getCenter: Required functionality
     * - map.setLayoutProperty: State update
     * - map.getLayer: Required functionality
     * - map.setLayoutProperty: State update
     * - map.getLayer: Required functionality
     *
     * DATA FLOW:
     * Input: map, is3DMode state/props
     * Processing: Calls setIs3DMode, map.setPitch, map.setBearing to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - map: Triggers when map changes
     * - is3DMode: Triggers when is3DMode changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
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
    /**
     * BUSINESS LOGIC: startBoundaryAnimation
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls map.getLayer, performance.now, map.getLayer, Math.floor, map.setPaintProperty, requestAnimationFrame, requestAnimationFrame functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - map.getLayer() - Function call
     * - performance.now() - Function call
     * - map.getLayer() - Function call
     * - Math.floor() - Function call
     * - map.setPaintProperty() - Function call
     * - requestAnimationFrame() - Function call
     * - requestAnimationFrame() - Function call
     *
     * WHY IT CALLS THEM:
     * - map.getLayer: Required functionality
     * - performance.now: Required functionality
     * - map.getLayer: Required functionality
     * - Math.floor: Required functionality
     * - map.setPaintProperty: State update
     * - requestAnimationFrame: Required functionality
     * - requestAnimationFrame: Required functionality
     *
     * DATA FLOW:
     * Input: map state/props
     * Processing: Calls map.getLayer, performance.now, map.getLayer to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - map: Triggers when map changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
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
      /**
       * BUSINESS LOGIC: animate
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements animate logic
       * 2. Calls helper functions: map.getLayer, Math.floor, map.setPaintProperty, requestAnimationFrame
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - map.getLayer() - Function call
       * - Math.floor() - Function call
       * - map.setPaintProperty() - Function call
       * - requestAnimationFrame() - Function call
       *
       * WHY IT CALLS THEM:
       * - map.getLayer: Required functionality
       * - Math.floor: Required functionality
       * - map.setPaintProperty: State update
       * - requestAnimationFrame: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls map.getLayer, Math.floor, map.setPaintProperty to process data
       * Output: Computed value or side effect
       *
       */
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

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors selectedAddress, map for changes
     * 2. Executes getCoordinates, mapInstance.addControl, mapInstance.on, mapInstance.getStyle, layers.find, mapInstance.addLayer, mapInstance.getLayer, setMap, initMap, cancelAnimationFrame functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - getCoordinates() - Function call
     * - mapInstance.addControl() - Function call
     * - mapInstance.on() - Function call
     * - mapInstance.getStyle() - Function call
     * - layers.find() - Function call
     * - mapInstance.addLayer() - Function call
     * - mapInstance.getLayer() - Function call
     * - setMap() - Function call
     * - initMap() - Function call
     * - cancelAnimationFrame() - Function call
     *
     * WHY IT CALLS THEM:
     * - getCoordinates: Required functionality
     * - mapInstance.addControl: Required functionality
     * - mapInstance.on: Required functionality
     * - mapInstance.getStyle: Required functionality
     * - layers.find: Required functionality
     * - mapInstance.addLayer: Required functionality
     * - mapInstance.getLayer: Required functionality
     * - setMap: State update
     * - initMap: Required functionality
     * - cancelAnimationFrame: Required functionality
     *
     * DATA FLOW:
     * Input: selectedAddress, map state/props
     * Processing: Calls getCoordinates, mapInstance.addControl, mapInstance.on to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - selectedAddress: Triggers when selectedAddress changes
     * - map: Triggers when map changes
     *
     */
  useEffect(() => {
      /**
       * BUSINESS LOGIC: initMap
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements initMap logic
       * 2. Calls helper functions: getCoordinates, mapInstance.addControl, mapInstance.on, mapInstance.getStyle, layers.find, mapInstance.addLayer, mapInstance.getLayer, setMap
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - getCoordinates() - Function call
       * - mapInstance.addControl() - Function call
       * - mapInstance.on() - Function call
       * - mapInstance.getStyle() - Function call
       * - layers.find() - Function call
       * - mapInstance.addLayer() - Function call
       * - mapInstance.getLayer() - Function call
       * - setMap() - Function call
       *
       * WHY IT CALLS THEM:
       * - getCoordinates: Required functionality
       * - mapInstance.addControl: Required functionality
       * - mapInstance.on: Required functionality
       * - mapInstance.getStyle: Required functionality
       * - layers.find: Required functionality
       * - mapInstance.addLayer: Required functionality
       * - mapInstance.getLayer: Required functionality
       * - setMap: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls getCoordinates, mapInstance.addControl, mapInstance.on to process data
       * Output: Computed value or side effect
       *
       */
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

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors isVisible, map for changes
     * 2. Executes setTimeout, map.resize, clearTimeout functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - setTimeout() - Function call
     * - map.resize() - Function call
     * - clearTimeout() - Function call
     *
     * WHY IT CALLS THEM:
     * - setTimeout: State update
     * - map.resize: Required functionality
     * - clearTimeout: Required functionality
     *
     * DATA FLOW:
     * Input: isVisible, map state/props
     * Processing: Calls setTimeout, map.resize, clearTimeout to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - isVisible: Triggers when isVisible changes
     * - map: Triggers when map changes
     *
     */
  useEffect(() => {
    if (!map) return;
    const timeout = setTimeout(() => {
      map.resize();
    }, 300); // Adjust delay to match your sidebar's CSS transition (300ms)
    return () => clearTimeout(timeout);
  }, [isVisible, map]);

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors selectedAddress, propID, map, is3DMode, startBoundaryAnimation, handleLotSizeUpdate for changes
     * 2. Executes getCoordinates, getPropertyBoundary, polygon.reduce, marker.remove, .addTo, .setLngLat, setMarker, cancelAnimationFrame, map.removeLayer, map.removeLayer, map.removeLayer, map.getLayer, map.removeSource, map.getSource, map.addSource, map.addLayer, map.addLayer, map.addLayer, startBoundaryAnimation, handleLotSizeUpdate, polygon.reduce, Math.min, Math.min, Math.max, Math.max, map.fitBounds, updateMap functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - getCoordinates() - Function call
     * - getPropertyBoundary() - Function call
     * - polygon.reduce() - Function call
     * - marker.remove() - Function call
     * - .addTo() - Function call
     * - .setLngLat() - Function call
     * - setMarker() - Function call
     * - cancelAnimationFrame() - Function call
     * - map.removeLayer() - Function call
     * - map.removeLayer() - Function call
     * - map.removeLayer() - Function call
     * - map.getLayer() - Function call
     * - map.removeSource() - Function call
     * - map.getSource() - Function call
     * - map.addSource() - Function call
     * - map.addLayer() - Function call
     * - map.addLayer() - Function call
     * - map.addLayer() - Function call
     * - startBoundaryAnimation() - Function call
     * - handleLotSizeUpdate() - Function call
     * - polygon.reduce() - Function call
     * - Math.min() - Function call
     * - Math.min() - Function call
     * - Math.max() - Function call
     * - Math.max() - Function call
     * - map.fitBounds() - Function call
     * - updateMap() - Function call
     *
     * WHY IT CALLS THEM:
     * - getCoordinates: Required functionality
     * - getPropertyBoundary: Required functionality
     * - polygon.reduce: Required functionality
     * - marker.remove: Required functionality
     * - .addTo: Required functionality
     * - .setLngLat: State update
     * - setMarker: State update
     * - cancelAnimationFrame: Required functionality
     * - map.removeLayer: Required functionality
     * - map.removeLayer: Required functionality
     * - map.removeLayer: Required functionality
     * - map.getLayer: Required functionality
     * - map.removeSource: Required functionality
     * - map.getSource: Required functionality
     * - map.addSource: Required functionality
     * - map.addLayer: Required functionality
     * - map.addLayer: Required functionality
     * - map.addLayer: Required functionality
     * - startBoundaryAnimation: Required functionality
     * - handleLotSizeUpdate: Required functionality
     * - polygon.reduce: Required functionality
     * - Math.min: Required functionality
     * - Math.min: Required functionality
     * - Math.max: Required functionality
     * - Math.max: Required functionality
     * - map.fitBounds: Required functionality
     * - updateMap: Required functionality
     *
     * DATA FLOW:
     * Input: selectedAddress, propID, map, is3DMode, startBoundaryAnimation, handleLotSizeUpdate state/props
     * Processing: Calls getCoordinates, getPropertyBoundary, polygon.reduce to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - selectedAddress: Triggers when selectedAddress changes
     * - propID: Triggers when propID changes
     * - map: Triggers when map changes
     * - is3DMode: Triggers when is3DMode changes
     * - startBoundaryAnimation: Triggers when startBoundaryAnimation changes
     * - handleLotSizeUpdate: Triggers when handleLotSizeUpdate changes
     *
     */
  useEffect(() => {
      /**
       * BUSINESS LOGIC: updateMap
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements updateMap logic
       * 2. Calls helper functions: getCoordinates, getPropertyBoundary, polygon.reduce, marker.remove, .addTo, .setLngLat, setMarker, cancelAnimationFrame, map.removeLayer, map.removeLayer, map.removeLayer, map.getLayer, map.removeSource, map.getSource, map.addSource, map.addLayer, map.addLayer, map.addLayer, startBoundaryAnimation, handleLotSizeUpdate, polygon.reduce, Math.min, Math.min, Math.max, Math.max, map.fitBounds
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - getCoordinates() - Function call
       * - getPropertyBoundary() - Function call
       * - polygon.reduce() - Function call
       * - marker.remove() - Function call
       * - .addTo() - Function call
       * - .setLngLat() - Function call
       * - setMarker() - Function call
       * - cancelAnimationFrame() - Function call
       * - map.removeLayer() - Function call
       * - map.removeLayer() - Function call
       * - map.removeLayer() - Function call
       * - map.getLayer() - Function call
       * - map.removeSource() - Function call
       * - map.getSource() - Function call
       * - map.addSource() - Function call
       * - map.addLayer() - Function call
       * - map.addLayer() - Function call
       * - map.addLayer() - Function call
       * - startBoundaryAnimation() - Function call
       * - handleLotSizeUpdate() - Function call
       * - polygon.reduce() - Function call
       * - Math.min() - Function call
       * - Math.min() - Function call
       * - Math.max() - Function call
       * - Math.max() - Function call
       * - map.fitBounds() - Function call
       *
       * WHY IT CALLS THEM:
       * - getCoordinates: Required functionality
       * - getPropertyBoundary: Required functionality
       * - polygon.reduce: Required functionality
       * - marker.remove: Required functionality
       * - .addTo: Required functionality
       * - .setLngLat: State update
       * - setMarker: State update
       * - cancelAnimationFrame: Required functionality
       * - map.removeLayer: Required functionality
       * - map.removeLayer: Required functionality
       * - map.removeLayer: Required functionality
       * - map.getLayer: Required functionality
       * - map.removeSource: Required functionality
       * - map.getSource: Required functionality
       * - map.addSource: Required functionality
       * - map.addLayer: Required functionality
       * - map.addLayer: Required functionality
       * - map.addLayer: Required functionality
       * - startBoundaryAnimation: Required functionality
       * - handleLotSizeUpdate: Required functionality
       * - polygon.reduce: Required functionality
       * - Math.min: Required functionality
       * - Math.min: Required functionality
       * - Math.max: Required functionality
       * - Math.max: Required functionality
       * - map.fitBounds: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls getCoordinates, getPropertyBoundary, polygon.reduce to process data
       * Output: Computed value or side effect
       *
       */
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
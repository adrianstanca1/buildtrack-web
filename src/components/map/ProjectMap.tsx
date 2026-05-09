'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ProjectRecord } from '@/lib/offlineStore';

// Fix default marker icons in Next.js / webpack environments
const DefaultIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface ProjectMapProps {
  projects: ProjectRecord[];
  height?: string;
}

function MapRefit({ projects }: { projects: ProjectRecord[] }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = projects.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
    if (withCoords.length === 0) return;
    if (withCoords.length === 1) {
      map.setView([withCoords[0].latitude!, withCoords[0].longitude!], 12);
      return;
    }
    const group = new L.FeatureGroup(
      withCoords.map((p) => L.marker([p.latitude!, p.longitude!]))
    );
    map.fitBounds(group.getBounds().pad(0.1));
  }, [map, projects]);
  return null;
}

export function ProjectMap({ projects, height = '400px' }: ProjectMapProps) {
  const projectsWithCoords = projects.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
  );

  const defaultCenter: [number, number] = [51.505, -0.09];

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-lg border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projectsWithCoords.map((project) => (
          <Marker key={project.id} position={[project.latitude!, project.longitude!]}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{project.name}</p>
                <p className="text-xs text-gray-600">{project.location}</p>
                <p className="text-xs capitalize text-gray-500">Status: {project.status}</p>
                <p className="text-xs text-gray-500">Progress: {project.progress}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapRefit projects={projectsWithCoords} />
      </MapContainer>
    </div>
  );
}

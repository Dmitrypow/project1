export interface Zone {
  id: number;
  name: string;
  description: string | null;
}

export interface ZoneDto {
  id: number;
  name: string;
}

export function toZoneDto(zone: Zone): ZoneDto {
  return { id: zone.id, name: zone.name };
}
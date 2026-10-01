// Fixed prepared collection for the audio feasibility study; no AI interpretation yet.
export const catalogue = [
  { id: 'cafe_rain', label: 'Rain', detail: 'Rain outside', file: '/audio/rain-effib.ogg',
    level: 0.8, position: { x: -0.4, y: -0.36 }, kind: 'continuous' },
  { id: 'cafe_room', label: 'Room', detail: 'Quiet indoor room tone', file: '/audio/room-leonelmail.mp3',
    level: 0.12, position: { x: 0.12, y: 0.62 }, kind: 'continuous' },
  { id: 'cafe_cleaning', label: 'Cleaning', detail: 'Occasional broom sweeping', file: '/audio/cleaning-randbsoundbites.mp3',
    level: 0.48, outerReductionDb: 6, position: { x: 0.42, y: -0.25 }, kind: 'activity', leadSeconds: 1.5, gapSeconds: 7.5 },
];

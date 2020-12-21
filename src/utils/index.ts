
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export function drawSelectionArea(area: HTMLDivElement, position: Position, size: Size): void {
  area.style.left = `${position.x}px`;
  area.style.top = `${position.y}px`;
  area.style.width = `${size.width}px`;
  area.style.height = `${size.height}px`;
  area.style.opacity = '0.2';
}

export function cleanSelectionArea(area: HTMLDivElement): void {
  area.style.left = '0px';
  area.style.top = '0px';
  area.style.width = '0px';
  area.style.height = '0px';
  area.style.opacity = '0';
}

export function applyTransform(translateX: number, translateY: number, scale: number, position: Position): Position {
  return {
    x: (position.x - translateX) / scale,
    y: (position.y - translateY) / scale
  }
}

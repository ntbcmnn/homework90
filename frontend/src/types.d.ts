export interface Point {
  x: number;
  y: number;
}

export interface Line {
  start: Point;
  end: Point;
  color: string;
}

export interface IncomingMessage {
  type: string;
  payload: Line[];
}

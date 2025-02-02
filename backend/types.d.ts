export interface Line {
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
    color: string;
}

export interface IncomingMessage {
    type: string;
    payload: Line[];
}
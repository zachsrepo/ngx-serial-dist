export declare class NgxSerial {
    private port;
    private options;
    private writer;
    private readFunction;
    private controlCharacter;
    private reader;
    private readableStreamClosed;
    private writableStreamClosed;
    private keepReading;
    constructor(readFunction: Function, options?: any, controlCharacter?: any);
    sendData(data: string): Promise<void>;
    private readLoop;
    close(callback: Function): Promise<void>;
    connect(callback: Function): Promise<void>;
}

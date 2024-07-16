class NgxSerial {
    port;
    options = { baudRate: 9600, dataBits: 8, parity: 'none', bufferSize: 256, flowControl: 'none' }; //Default
    writer;
    readFunction;
    controlCharacter = "\n";
    reader;
    readableStreamClosed;
    writableStreamClosed;
    keepReading = true;
    constructor(readFunction, options, controlCharacter) {
        this.readFunction = readFunction;
        if (options)
            this.options = options;
        if (controlCharacter)
            this.controlCharacter = controlCharacter;
    }
    async sendData(data) {
        await this.writer.write(data);
    }
    async readLoop() {
        while (this.port.readable && this.keepReading) {
            const textDecoder = new TextDecoderStream();
            //const readableStream = new ReadableStream();
            this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
            this.reader = textDecoder.readable
                //.pipeThrough(new TransformStream(new LineBreakTransformer(this.controlCharacter)))
                .getReader();
            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) {
                        break;
                    }
                    if (value) {
                        this.readFunction(value);
                    }
                }
            }
            catch (error) {
                console.error("Read Loop error. Have the serial device been disconnected ? ");
            }
        }
    }
    async close(callback) {
        this.keepReading = false;
        this.reader.cancel();
        await this.readableStreamClosed.catch(() => { });
        this.writer.close();
        await this.writableStreamClosed;
        await this.port.close();
        callback(null);
    }
    async connect(callback) {
        this.keepReading = true;
        if ("serial" in navigator) {
            // The Web Serial API is supported by the browser.
            let nav = navigator;
            const ports = await nav.serial.getPorts();
            try {
                this.port = await nav.serial.requestPort();
            }
            catch (error) {
                console.error("Requesting port error: " + error);
                return;
            }
            try {
                await this.port.open(this.options);
            }
            catch (error) {
                console.error("Opening port error: " + error);
                return;
            }
            const textEncoder = new TextEncoderStream();
            this.writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
            this.writer = textEncoder.writable.getWriter();
            this.readLoop();
            callback(this.port);
        }
        else {
            console.error("This browser does NOT support the Web Serial API");
        }
    }
}
class LineBreakTransformer {
    container = "";
    controlCharacter;
    constructor(controlCharacter) {
        this.container = '';
        this.controlCharacter = controlCharacter;
    }
    transform(chunk, controller) {
        this.container += chunk;
        const lines = this.container.split(this.controlCharacter);
        this.container = lines.pop();
        lines.forEach((line) => controller.enqueue(line));
    }
    flush(controller) {
        controller.enqueue(this.container);
    }
}

/*
 * Public API Surface of ngx-serial
 */
/*export * from './lib/ngx-serial.service';
export * from './lib/ngx-serial.component';
export * from './lib/ngx-serial.module';*/

/**
 * Generated bundle index. Do not edit.
 */

export { NgxSerial };
//# sourceMappingURL=ngx-serial.mjs.map

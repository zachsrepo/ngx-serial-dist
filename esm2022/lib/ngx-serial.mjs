export class NgxSerial {
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
            this.reader = this.port.readable.getReader();
            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) {
                        // Allow the serial port to be closed later.
                        this.reader.releaseLock();
                        break;
                    }
                    if (value) {
                        this.readFunction(value);
                    }
                }
            }
            catch (error) {
                // TODO: Handle non-fatal read error.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXNlcmlhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1zZXJpYWwvc3JjL2xpYi9uZ3gtc2VyaWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sT0FBTyxTQUFTO0lBRVosSUFBSSxDQUFNO0lBQ1YsT0FBTyxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxTQUFTO0lBQzFHLE1BQU0sQ0FBTTtJQUNaLFlBQVksQ0FBVztJQUN2QixnQkFBZ0IsR0FBVyxJQUFJLENBQUM7SUFDaEMsTUFBTSxDQUFNO0lBQ1osb0JBQW9CLENBQU07SUFDMUIsb0JBQW9CLENBQU07SUFDMUIsV0FBVyxHQUFZLElBQUksQ0FBQztJQUVwQyxZQUFZLFlBQXNCLEVBQUUsT0FBYSxFQUFFLGdCQUFzQjtRQUN2RSxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLE9BQU87WUFDVCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN6QixJQUFJLGdCQUFnQjtZQUNsQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFFN0MsQ0FBQztJQUNNLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBWTtRQUNoQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFTyxLQUFLLENBQUMsUUFBUTtRQUVwQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lB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QVksZ0JBQXdCO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtJQUMxQyxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQVUsRUFBRSxVQUFlO1FBQ25DLElBQUksQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQWU7UUFDbkIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTk9ORV9UWVBFIH0gZnJvbSBcIkBhbmd1bGFyL2NvbXBpbGVyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTmd4U2VyaWFsIHtcclxuXHJcbiAgcHJpdmF0ZSBwb3J0OiBhbnk7XHJcbiAgcHJpdmF0ZSBvcHRpb25zID0geyBiYXVkUmF0ZTogOTYwMCwgZGF0YUJpdHM6IDgsIHBhcml0eTogJ25vbmUnLCBidWZmZXJTaXplOiAyNTYsIGZsb3dDb250cm9sOiAnbm9uZScgfTsgLy9EZWZhdWx0XHJcbiAgcHJpdmF0ZSB3cml0ZXI6IGFueTtcclxuICBwcml2YXRlIHJlYWRGdW5jdGlvbjogRnVuY3Rpb247XHJcbiAgcHJpdmF0ZSBjb250cm9sQ2hhcmFjdGVyOiBzdHJpbmcgPSBcIlxcblwiO1xyXG4gIHByaXZhdGUgcmVhZGVyOiBhbnk7XHJcbiAgcHJpdmF0ZSByZWFkYWJsZVN0cmVhbUNsb3NlZDogYW55O1xyXG4gIHByaXZhdGUgd3JpdGFibGVTdHJlYW1DbG9zZWQ6IGFueTtcclxuICBwcml2YXRlIGtlZXBSZWFkaW5nOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgY29uc3RydWN0b3IocmVhZEZ1bmN0aW9uOiBGdW5jdGlvbiwgb3B0aW9ucz86IGFueSwgY29udHJvbENoYXJhY3Rlcj86IGFueSkge1xyXG4gICAgdGhpcy5yZWFkRnVuY3Rpb24gPSByZWFkRnVuY3Rpb247XHJcbiAgICBpZiAob3B0aW9ucylcclxuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgIGlmIChjb250cm9sQ2hhcmFjdGVyKVxyXG4gICAgICB0aGlzLmNvbnRyb2xDaGFyYWN0ZXIgPSBjb250cm9sQ2hhcmFjdGVyO1xyXG5cclxuICB9XHJcbiAgcHVibGljIGFzeW5jIHNlbmREYXRhKGRhdGE6IHN0cmluZykge1xyXG4gICAgYXdhaXQgdGhpcy53cml0ZXIud3JpdGUoZGF0YSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHJlYWRMb29wKCkge1xyXG5cclxuICAgIHdoaWxlICh0aGlzLnBvcnQucmVhZGFibGUgJiYgdGhpcy5rZWVwUmVhZGluZykge1xyXG4gICAgICB0aGlzLnJlYWRlciA9IHRoaXMucG9ydC5yZWFkYWJsZS5nZXRSZWFkZXIoKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgY29uc3QgeyB2YWx1ZSwgZG9uZSB9ID0gYXdhaXQgdGhpcy5yZWFkZXIucmVhZCgpO1xyXG4gICAgICAgICAgaWYgKGRvbmUpIHtcclxuICAgICAgICAgICAgLy8gQWxsb3cgdGhlIHNlcmlhbCBwb3J0IHRvIGJlIGNsb3NlZCBsYXRlci5cclxuICAgICAgICAgICAgdGhpcy5yZWFkZXIucmVsZWFzZUxvY2soKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWFkRnVuY3Rpb24odmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBUT0RPOiBIYW5kbGUgbm9uLWZhdGFsIHJlYWQgZXJyb3IuXHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlJlYWQgTG9vcCBlcnJvci4gSGF2ZSB0aGUgc2VyaWFsIGRldmljZSBiZWVuIGRpc2Nvbm5lY3RlZCA/IFwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBwdWJsaWMgYXN5bmMgY2xvc2UoY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XHJcbiAgICB0aGlzLmtlZXBSZWFkaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLnJlYWRlci5jYW5jZWwoKTtcclxuICAgIGF3YWl0IHRoaXMucmVhZGFibGVTdHJlYW1DbG9zZWQuY2F0Y2goKCkgPT4geyB9KTtcclxuICAgIHRoaXMud3JpdGVyLmNsb3NlKCk7XHJcbiAgICBhd2FpdCB0aGlzLndyaXRhYmxlU3RyZWFtQ2xvc2VkO1xyXG4gICAgYXdhaXQgdGhpcy5wb3J0LmNsb3NlKCk7XHJcbiAgICBjYWxsYmFjayhudWxsKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBjb25uZWN0KGNhbGxiYWNrOiBGdW5jdGlvbikge1xyXG4gICAgdGhpcy5rZWVwUmVhZGluZyA9IHRydWU7XHJcbiAgICBpZiAoXCJzZXJpYWxcIiBpbiBuYXZpZ2F0b3IpIHtcclxuICAgICAgLy8gVGhlIFdlYiBTZXJpYWwgQVBJIGlzIHN1cHBvcnRlZCBieSB0aGUgYnJvd3Nlci5cclxuICAgICAgbGV0IG5hdjogYW55ID0gbmF2aWdhdG9yO1xyXG4gICAgICBjb25zdCBwb3J0cyA9IGF3YWl0IG5hdi5zZXJpYWwuZ2V0UG9ydHMoKTtcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdGhpcy5wb3J0ID0gYXdhaXQgbmF2LnNlcmlhbC5yZXF1ZXN0UG9ydCgpO1xyXG5cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiUmVxdWVzdGluZyBwb3J0IGVycm9yOiBcIiArIGVycm9yKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wb3J0Lm9wZW4odGhpcy5vcHRpb25zKTtcclxuXHJcblxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJPcGVuaW5nIHBvcnQgZXJyb3I6IFwiICsgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXJTdHJlYW0oKTtcclxuICAgICAgdGhpcy53cml0YWJsZVN0cmVhbUNsb3NlZCA9IHRleHRFbmNvZGVyLnJlYWRhYmxlLnBpcGVUbyh0aGlzLnBvcnQud3JpdGFibGUpO1xyXG4gICAgICB0aGlzLndyaXRlciA9IHRleHRFbmNvZGVyLndyaXRhYmxlLmdldFdyaXRlcigpO1xyXG5cclxuICAgICAgdGhpcy5yZWFkTG9vcCgpO1xyXG5cclxuICAgICAgY2FsbGJhY2sodGhpcy5wb3J0KTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiVGhpcyBicm93c2VyIGRvZXMgTk9UIHN1cHBvcnQgdGhlIFdlYiBTZXJpYWwgQVBJXCIpO1xyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIExpbmVCcmVha1RyYW5zZm9ybWVyIHtcclxuICBjb250YWluZXI6IGFueSA9IFwiXCI7XHJcbiAgcHJpdmF0ZSBjb250cm9sQ2hhcmFjdGVyOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNvbnRyb2xDaGFyYWN0ZXI6IHN0cmluZykge1xyXG4gICAgdGhpcy5jb250YWluZXIgPSAnJztcclxuICAgIHRoaXMuY29udHJvbENoYXJhY3RlciA9IGNvbnRyb2xDaGFyYWN0ZXJcclxuICB9XHJcblxyXG4gIHRyYW5zZm9ybShjaHVuazogYW55LCBjb250cm9sbGVyOiBhbnkpIHtcclxuICAgIHRoaXMuY29udGFpbmVyICs9IGNodW5rO1xyXG4gICAgY29uc3QgbGluZXMgPSB0aGlzLmNvbnRhaW5lci5zcGxpdCh0aGlzLmNvbnRyb2xDaGFyYWN0ZXIpO1xyXG4gICAgdGhpcy5jb250YWluZXIgPSBsaW5lcy5wb3AoKTtcclxuICAgIGxpbmVzLmZvckVhY2goKGxpbmU6IGFueSkgPT4gY29udHJvbGxlci5lbnF1ZXVlKGxpbmUpKTtcclxuICB9XHJcblxyXG4gIGZsdXNoKGNvbnRyb2xsZXI6IGFueSkge1xyXG4gICAgY29udHJvbGxlci5lbnF1ZXVlKHRoaXMuY29udGFpbmVyKTtcclxuICB9XHJcbn0iXX0=
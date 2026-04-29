import { Readable } from 'node:stream';

export default class SwitchableStream {
  private _controller: any = null;
  private _currentReader: any = null;
  private _switches = 0;
  private _readable: Readable;
  private _buffer: Buffer[] = [];

  constructor() {
    this._readable = new Readable({
      read() {},
    });
  }

  get readable() {
    return this._readable;
  }

  async switchSource(newStream: ReadableStream) {
    if (this._currentReader) {
      try {
        await this._currentReader.cancel();
      } catch (e) {
        // Ignore cancel errors
      }
    }

    this._currentReader = newStream.getReader();

    this._pumpStream();

    this._switches++;
  }

  private async _pumpStream() {
    if (!this._currentReader) {
      return;
    }

    try {
      while (true) {
        const { done, value } = await this._currentReader.read();

        if (done) {
          this._readable.push(null);
          break;
        }

        if (value) {
          // Handle different data types from the stream
          if (typeof value === 'string') {
            this._readable.push(value);
          } else if (value instanceof Uint8Array) {
            this._readable.push(Buffer.from(value));
          } else {
            this._readable.push(JSON.stringify(value));
          }
        }
      }
    } catch (error: any) {
      console.log('Stream pump error:', error.message);
      this._readable.destroy(error);
    }
  }

  close() {
    if (this._currentReader) {
      try {
        this._currentReader.cancel();
      } catch (e) {
        // Ignore
      }
    }

    this._readable.push(null);
  }

  get switches() {
    return this._switches;
  }
}

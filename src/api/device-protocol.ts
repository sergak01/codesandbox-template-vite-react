import { DeviceProtocolPacket, DeviceProtocolPacketOpts, DeviceProtocolRequestType } from './device-protocol-packet.ts';

export class DeviceProtocol {
  private device: HIDDevice;
  private inputReportSubscriptions: Map<number, Set<(data: BufferSource) => void>> = new Map();

  private commandQueue: DeviceProtocolPacket[] = [];

  constructor(device: HIDDevice) {
    this.device = device;

    this.initEvents();
  }

  private initEvents() {
    try {
      this.device.addEventListener('inputreport', (event) => {
        // console.log('inputreport', event);

        const { reportId, data } = event;
        const callbacks = this.inputReportSubscriptions.get(reportId);

        if (callbacks) {
          for (const callback of callbacks) {
            callback(data.buffer);
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  subscribeInputReport(reportId: number, callback: (data: BufferSource) => void) {
    if (!this.inputReportSubscriptions.has(reportId)) {
      this.inputReportSubscriptions.set(reportId, new Set());
    }

    this.inputReportSubscriptions.get(reportId)?.add(callback);
  }

  unsubscribeInputReport(reportId: number, callback: (data: BufferSource) => void) {
    this.inputReportSubscriptions.get(reportId)?.delete(callback);
  }

  async readFeature(reportId: number, length?: number) {
    const data = await this.device.receiveFeatureReport(reportId);

    const result = [];

    for (let i = 0; i < data.byteLength; i++) {
      result.push(data.getUint8(i));
    }

    return typeof length === 'number' ? result.slice(0, length) : result;
  }

  async sendFeature(reportId: number, data: BufferSource) {
    return await this.device.sendFeatureReport(
      reportId,
      data.byteLength !== 65 ? new Uint8Array(this.fillToEnd([...data], 0x00, 65)) : data,
    );
  }

  async sendOutputReport(reportId: number, data: BufferSource) {
    return await this.device.sendReport(reportId, data);
  }

  private bufferConcat(buffer1: BufferSource, buffer2: BufferSource) {
    // @ts-ignore
    return new Uint8Array([...new Uint8Array(buffer1), ...new Uint8Array(buffer2)]).buffer;
  }

  async readInputReport(reportId: number, waitMs = 250) {
    let data = new ArrayBuffer(0);

    return await new Promise<BufferSource>((resolve) => {
      const subscribeInputCallback = (chunk: DataView) => {
        data = this.bufferConcat(data, chunk);
      };

      this.subscribeInputReport(reportId, subscribeInputCallback as any);

      setTimeout(() => {
        this.unsubscribeInputReport(reportId, subscribeInputCallback as any);

        resolve(data);
      }, waitMs);
    });
  }

  async sendFeatureAndReadFeature(reportId: number, data: BufferSource, length?: number) {
    await this.sendFeature(reportId, data);

    return await this.readFeature(reportId, length);
  }

  async sendFeatureAndReadInputReport(reportId: number, inputId: number, data: BufferSource, waitMs = 250) {
    await this.sendFeature(reportId, data);

    return await this.readInputReport(inputId, waitMs);
  }

  async sendOutputReportAndReadInputReport(
    sendReportId: number,
    readReportId: number,
    data: BufferSource,
    waitMs = 250,
  ) {
    await this.sendOutputReport(sendReportId, data);

    return await this.readInputReport(readReportId, waitMs);
  }

  async sendOutputReportAndReadFeatureReport(
    sendReportId: number,
    readReportId: number,
    data: BufferSource,
    length?: number,
  ) {
    await this.sendOutputReport(sendReportId, data);

    return await this.readFeature(readReportId, length);
  }

  private fillToEnd(input: number[], value = 0x00, size = 65) {
    return [...input, ...new Array(size - input.length).fill(value)];
  }

  private parseStringToBuffer(data: string) {
    const filterRegExp = /\s*/g;

    let parsed =
      data
        .replace(filterRegExp, '')
        .split(',')
        .map((byte) => parseInt(byte, 16)) ?? [];

    if (parsed[0] === 0x00) {
      parsed = parsed.slice(1);
    }

    return new Uint8Array(this.fillToEnd(parsed, 0x00, 64));
  }

  parseCommand(
    type: DeviceProtocolRequestType,
    reportIdOrFeatureId: number,
    opts: DeviceProtocolPacketOpts & { data?: string; readReportId?: number },
  ) {
    return new DeviceProtocolPacket(
      type,
      reportIdOrFeatureId,
      Object.assign({ readReportIdOrFeatureId: opts.readReportId }, opts, {
        data: this.parseStringToBuffer(opts.data ?? ''),
      }),
    );
  }

  pushCommand(...commands: DeviceProtocolPacket[]) {
    this.commandQueue.push(...commands);
  }

  private async executeCommand(command: DeviceProtocolPacket) {
    const [action, params] = command.getAction();

    if (action in this) {
      return this[action as keyof this](...params);
    }

    return null;
  }

  executeCommandQueue() {
    const eventEmitter = new EventTarget() as EventTarget & { toPromise: () => Promise<DeviceProtocolPacket[]> };

    // eslint-disable-next-line no-async-promise-executor
    const promise = new Promise<DeviceProtocolPacket[]>(async (resolve) => {
      const result = [];

      for (const command of [...this.commandQueue]) {
        console.log('Execute command', command);

        try {
          const commandResult = await this.executeCommand(command as DeviceProtocolPacket);

          if (commandResult) {
            eventEmitter.dispatchEvent(new CustomEvent('data', { detail: commandResult }));

            result.push(commandResult);
          }
        } catch (error) {
          eventEmitter.dispatchEvent(new CustomEvent('error', { detail: error }));

          console.error(error);
        }
      }

      eventEmitter.dispatchEvent(new CustomEvent('end', { detail: result }));
      resolve(result);
    });

    this.commandQueue = [];

    eventEmitter.toPromise = () => promise;

    return eventEmitter;
  }
}

import { DeviceProtocol } from './device-protocol.ts';

export const DeviceProtocolRequestType = {
  ReadFeature: 'readFeature' as const,
  SendFeature: 'sendFeature' as const,
  SendOutputReport: 'sendOutputReport' as const,
  ReadInputReport: 'readInputReport' as const,
  SendFeatureWithResponse: 'sendFeatureWithResponse' as const,
  SendFeatureWithInputReport: 'sendFeatureWithInputReport' as const,
  SendOutputReportWithResponse: 'sendOutputReportWithResponse' as const,
  SendOutputReportWithFeatureReport: 'sendOutputReportWithFeatureReport' as const,
};

export type DeviceProtocolRequestType = (typeof DeviceProtocolRequestType)[keyof typeof DeviceProtocolRequestType];

export const DeviceProtocolRequestTypeMap = {
  [DeviceProtocolRequestType.ReadFeature]: DeviceProtocol.prototype.readFeature,
  [DeviceProtocolRequestType.SendFeature]: DeviceProtocol.prototype.sendFeature,
  [DeviceProtocolRequestType.SendOutputReport]: DeviceProtocol.prototype.sendOutputReport,
  [DeviceProtocolRequestType.ReadInputReport]: DeviceProtocol.prototype.readInputReport,
  [DeviceProtocolRequestType.SendFeatureWithResponse]: DeviceProtocol.prototype.sendFeatureAndReadFeature,
  [DeviceProtocolRequestType.SendFeatureWithInputReport]: DeviceProtocol.prototype.sendFeatureAndReadInputReport,
  [DeviceProtocolRequestType.SendOutputReportWithResponse]: DeviceProtocol.prototype.sendOutputReportAndReadInputReport,
  [DeviceProtocolRequestType.SendOutputReportWithFeatureReport]:
    DeviceProtocol.prototype.sendOutputReportAndReadFeatureReport,
};

export interface DeviceProtocolPacketOpts {
  data?: BufferSource;
  readReportIdOrFeatureId?: number;
  waitMs?: number;
  length?: number;
}

export class DeviceProtocolPacket {
  readonly requestType: DeviceProtocolRequestType;
  protected reportIdOrFeatureId: number;
  protected readReportIdOrFeatureId: number;
  protected data?: BufferSource;
  protected waitMs?: number;
  protected length?: number;

  constructor(requestType: DeviceProtocolRequestType, reportIdOrFeatureId: number, opts?: DeviceProtocolPacketOpts) {
    this.requestType = requestType;
    this.reportIdOrFeatureId = reportIdOrFeatureId;
    this.readReportIdOrFeatureId = opts?.readReportIdOrFeatureId ?? reportIdOrFeatureId;
    this.data = opts?.data;
    this.waitMs = opts?.waitMs;
    this.length = opts?.length;
  }

  getAction(): [string, Parameters<(typeof DeviceProtocolRequestTypeMap)[typeof this.requestType]>] {
    switch (this.requestType) {
      case DeviceProtocolRequestType.ReadFeature:
        return [DeviceProtocolRequestTypeMap[this.requestType].name, [this.reportIdOrFeatureId, this.length]];

      case DeviceProtocolRequestType.SendFeature:
        return [DeviceProtocolRequestTypeMap[this.requestType].name, [this.reportIdOrFeatureId, this.data!]];

      case DeviceProtocolRequestType.SendOutputReport:
        return [DeviceProtocolRequestTypeMap[this.requestType].name, [this.reportIdOrFeatureId, this.data!]];

      case DeviceProtocolRequestType.ReadInputReport:
        return [DeviceProtocolRequestTypeMap[this.requestType].name, [this.reportIdOrFeatureId, this.waitMs]];

      case DeviceProtocolRequestType.SendFeatureWithResponse:
        return [
          DeviceProtocolRequestTypeMap[this.requestType].name,
          [this.reportIdOrFeatureId, this.data!, this.length],
        ];

      case DeviceProtocolRequestType.SendFeatureWithInputReport:
        return [
          DeviceProtocolRequestTypeMap[this.requestType].name,
          [this.reportIdOrFeatureId, this.readReportIdOrFeatureId, this.data!, this.waitMs],
        ];

      case DeviceProtocolRequestType.SendOutputReportWithResponse:
        return [
          DeviceProtocolRequestTypeMap[this.requestType].name,
          [this.reportIdOrFeatureId, this.data!, this.length],
        ];

      case DeviceProtocolRequestType.SendOutputReportWithFeatureReport:
        return [
          DeviceProtocolRequestTypeMap[this.requestType].name,
          [this.reportIdOrFeatureId, this.data!, this.waitMs],
        ];

      default:
        throw new Error(`Unknown request type: ${this.requestType}`);
    }
  }
}

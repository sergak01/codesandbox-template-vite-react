import React, { FunctionComponent, useEffect } from 'react';
import { DeviceCommander } from './DeviceCommander.tsx';

export interface DeviceDetectProps {
  vendorId: number;
  productId?: number;
  usagePage?: number;
  usage?: number;

  children?: React.ReactNode;
}

export const DeviceDetect: FunctionComponent<DeviceDetectProps> = function (props) {
  const { vendorId, productId, usagePage, usage } = props;
  const [device, setDevice] = React.useState<HIDDevice | null>(null);

  const connectedHandle = (ev: HIDConnectionEvent) => {
    if (!device || !device.opened) {
      const inStorage =
        localStorage.getItem(`last-connected-device`) ===
        `${ev.device.vendorId}-${ev.device.productId}-collections-${ev.device.collections.length}`;

      if (inStorage) {
        setDevice(ev.device);
      }
    } else {
      localStorage.setItem(
        'last-connected-device',
        `${device.vendorId}-${device.productId}-collections-${device.collections.length}`,
      );
    }
  };

  navigator.hid.addEventListener('connect', connectedHandle, true);

  useEffect(() => {
    const disconnectedHandle = (ev: HIDConnectionEvent) => {
      if (device === ev.device) {
        setDevice(null);
      }
    };

    navigator.hid.addEventListener('disconnect', disconnectedHandle, true);

    navigator.hid.getDevices().then((devices) => {
      for (const device of devices) {
        const lastConnectedDevice = localStorage.getItem(`last-connected-device`);

        if (lastConnectedDevice) {
          const [vendorId, productId, , collections] = lastConnectedDevice.split('-');

          if (
            device.vendorId === parseInt(vendorId) &&
            device.productId === parseInt(productId) &&
            device.collections.length === parseInt(collections)
          ) {
            setDevice(device);

            break;
          }
        }
      }
    });

    return () => {
      navigator.hid.removeEventListener('disconnect', disconnectedHandle);
    };
  }, [device]);

  return (
    <>
      {!device ? (
        <button
          onClick={async () => {
            const devices = await navigator.hid.requestDevice({
              filters: [{ vendorId, productId, usagePage, usage }],
            });

            console.log(devices);

            for (const device of devices) {
              if (device.collections.length === 1) {
                setDevice(device);
                console.log('Selected device:', device);

                localStorage.setItem(
                  'last-connected-device',
                  `${device.vendorId}-${device.productId}-collections-${device.collections.length}`,
                );

                break;
              }
            }
          }}
        >
          Select device
        </button>
      ) : (
        <DeviceCommander
          device={device}
          onClose={() => {
            device.close();
            localStorage.removeItem('last-connected-device');
            setDevice(null);
          }}
        ></DeviceCommander>
      )}
    </>
  );
};

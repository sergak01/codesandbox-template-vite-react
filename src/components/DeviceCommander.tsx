import React, { FunctionComponent, useEffect } from 'react';
import { Queue } from './Queue.tsx';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';

export interface DeviceCommanderProps {
  device: HIDDevice;
  onClose?: () => void;
}

export const DeviceCommander: FunctionComponent<DeviceCommanderProps> = function (props) {
  const { device, onClose } = props;
  const [openning, setOpenning] = React.useState(false);

  useEffect(() => {
    if (!device.opened) {
      setOpenning(true);

      device.open().then(() => {
        setOpenning(false);
      });
    }
  }, [device, openning]);

  return (
    <>
      <Row>
        <Col xs={12}>
          {openning || !device.opened ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Device opening...</span>
            </Spinner>
          ) : (
            <Card>
              <Card.Header>
                <Row>
                  <Col xs={8}>
                    <div
                      style={{
                        padding: '0.6em 1.2em 0.6em 0',
                        fontSize: '1em',
                        fontWeight: 500,
                      }}
                    >
                      Opened device: {device.productName} (0x{device.vendorId.toString(16).padStart(4, '0')}:0x
                      {device.productId.toString(16).padStart(4, '0')})
                    </div>
                  </Col>
                  <Col xs={4} className={'text-end'}>
                    <Button
                      variant={'warning'}
                      onClick={() => {
                        if (onClose) {
                          onClose();
                        }
                      }}
                    >
                      Disconnect
                    </Button>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className={'p-1'}>
                <Queue device={device}></Queue>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
};

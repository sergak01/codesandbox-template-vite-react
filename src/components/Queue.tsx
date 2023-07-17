import React, { FunctionComponent, useEffect } from 'react';
import { QueueItem } from './QueueItem.tsx';
import { DeviceProtocol } from '../api/device-protocol.ts';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { DeviceProtocolRequestType } from '../api/device-protocol-packet.ts';
import { Response } from './Response.tsx';

function toBase64Queue(queue: { type: DeviceProtocolRequestType; content: any }[]) {
  return btoa(JSON.stringify(queue));
}

function parseBase64Queue(data: string) {
  try {
    const parsed = JSON.parse(atob(data));

    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function parseQueue(storageKey: string) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? JSON.stringify([]));
  } catch (e) {
    return [];
  }
}

function getStorageKey(vendorId: number, productId: number) {
  return `queue-${vendorId}-${productId}`;
}

export interface QueueProps {
  device: HIDDevice;
}

export const Queue: FunctionComponent<QueueProps> = function (props) {
  const currentUrl = new URL(window.location.href);
  const queue = parseBase64Queue(currentUrl.searchParams.get('queue') ?? '');

  const { device } = props;
  const [items, setItems] = React.useState<{ type: DeviceProtocolRequestType; content: any }[]>(
    queue.length ? queue : parseQueue(getStorageKey(device.vendorId, device.productId)),
  );
  const [copyInputValue, setCopyInputValue] = React.useState<string>(toBase64Queue(items));
  const protocol = new DeviceProtocol(device);

  const [response, setResponse] = React.useState<Uint8Array[]>([]);

  const run = async () => {
    setResponse([]);

    protocol.pushCommand(...items.map((item) => protocol.parseCommand(item.type, item.content.reportId, item.content)));

    const stream = protocol.executeCommandQueue();

    const dataHandler = (event: Event) => {
      setResponse([...response, event.detail ? new Uint8Array(event.detail) : new Uint8Array()]);
    };

    const endHandler = (event: Event) => {
      setResponse(
        event.detail
          ? event.detail.map((value: Uint8Array | null) => (value ? new Uint8Array(value) : new Uint8Array()))
          : response,
      );

      stream.removeEventListener('data', dataHandler);
      stream.removeEventListener('end', endHandler);
    };

    stream.addEventListener('data', dataHandler);
    stream.addEventListener('end', endHandler);
  };

  useEffect(() => {
    if (items) {
      localStorage.setItem(getStorageKey(device.vendorId, device.productId), JSON.stringify(items));

      const base64Queue = toBase64Queue(items);

      currentUrl.searchParams.set('queue', base64Queue);
      setCopyInputValue(base64Queue);

      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, [items, copyInputValue]);

  useEffect(() => {
    const copyHandler = (event: ClipboardEvent) => {
      const selection = document.getSelection();

      if (!selection || !selection.toString().length) {
        event.clipboardData?.setData('text/plain', copyInputValue);
        event.preventDefault();

        return;
      }
    };

    const pasteHandler = (event: ClipboardEvent) => {
      const paste = event.clipboardData?.getData('text/plain');

      if (paste) {
        const parsed = parseBase64Queue(paste);

        if (Array.isArray(parsed) && parsed.length) {
          setItems(parsed);
        }
      }
    };

    window.addEventListener('copy', copyHandler);
    window.addEventListener('paste', pasteHandler);

    return () => {
      window.removeEventListener('copy', copyHandler);
      window.removeEventListener('paste', pasteHandler);
    };
  }, []);

  return (
    <>
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
                Queue
              </div>
            </Col>
            <Col xs={4} className={'text-end'}>
              <Button
                className={'m-auto d-inline-block'}
                onClick={() => {
                  setItems([...items, { type: 'readFeature', content: { reportId: 0, data: '' } }]);
                }}
                variant={'outline-success'}
              >
                Add action
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {items.map((item, index) => (
            <QueueItem
              index={index}
              key={`queue-item-${index}`}
              type={item.type}
              content={item.content}
              remove={() => {
                const newItems = [...items];

                newItems.splice(index, 1);

                setItems(newItems);
              }}
              setType={(type) => {
                const newItems = [...items];

                newItems[index].type = type;

                setItems(newItems);
              }}
              setContent={(content) => {
                const newItems = [...items];

                newItems[index].content = content;

                setItems(newItems);
              }}
            />
          ))}

          <div className={'text-center'}>
            <Button
              className={'m-auto d-inline-block'}
              onClick={() => {
                setItems([...items, { type: 'readFeature', content: { reportId: 0, data: '' } }]);
              }}
              variant={'outline-success'}
            >
              Add action
            </Button>
          </div>

          {response.length ? (
            <>
              <hr />
              <div className={'mt-3'}>
                {response.map((item, index) => (
                  <div key={`response-item-${index}`} className={'border-bottom pb-2 mb-1'}>
                    <Row>
                      <Col xs={12}>
                        <div
                          style={{
                            padding: '0.6em 1.2em 0.6em 0',
                            fontSize: '1em',
                            fontWeight: 500,
                          }}
                        >
                          Response {index + 1} ({items[index] ? items[index].type : 'unknown'})
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        {item === null || !item.length ? (
                          <Badge bg="secondary">No data</Badge>
                        ) : (
                          <Response response={item} />
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </>
          ) : (
            ''
          )}
        </Card.Body>

        <Card.Footer className={'text-center'}>
          <Button onClick={run} variant={'success'} className={'me-2'}>
            Run
          </Button>
          <Button
            variant={'danger'}
            onClick={() => {
              setItems([]);
            }}
          >
            Clear
          </Button>
        </Card.Footer>
      </Card>
    </>
  );
};

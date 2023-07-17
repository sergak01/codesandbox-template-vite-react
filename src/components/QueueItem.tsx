import React, { FunctionComponent, useEffect } from 'react';
import { DeviceProtocolRequestType } from '../api/device-protocol-packet.ts';
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import TagsInput from 'react-tagsinput';

export interface QueueItemProps<
  Type extends keyof typeof QueueItemTypeComponents = keyof typeof QueueItemTypeComponents,
  Content extends object = any,
> {
  index: number;
  type: Type;
  setType: (type: Type) => void;
  content: Content;
  setContent: (content: Content) => void;
  remove: () => void;
}

const QueueItemTypes = {
  [DeviceProtocolRequestType.ReadFeature]: 'Read feature',
  [DeviceProtocolRequestType.ReadInputReport]: 'Read input report',
  [DeviceProtocolRequestType.SendOutputReport]: 'Send output report',
  [DeviceProtocolRequestType.SendFeature]: 'Send feature',
  [DeviceProtocolRequestType.SendFeatureWithInputReport]: 'Send feature with input report',
  [DeviceProtocolRequestType.SendFeatureWithResponse]: 'Send feature with response',
  [DeviceProtocolRequestType.SendOutputReportWithResponse]: 'Send output report with response',
  [DeviceProtocolRequestType.SendOutputReportWithFeatureReport]: 'Send output report with feature report',
};

const HexInput: FunctionComponent<{ value: string[]; onChange: (value: string[]) => void }> = (props) => {
  const { value, onChange } = props;

  return (
    <TagsInput
      value={value}
      addOnBlur={true}
      addOnPaste={true}
      addKeys={[9, 13, 32, 188]}
      onChange={(tags) => {
        const hexTags = tags.map((tag) => {
          if (tag.startsWith('0x')) {
            return tag;
          }

          return `0x${parseInt(tag, 16).toString(16).padStart(2, '0').toUpperCase()}`;
        });

        onChange(hexTags);
      }}
      inputProps={{
        placeholder: 'Add a byte',
      }}
      pasteSplit={(data: string) => {
        return data.split(',').map((d) => d.trim());
      }}
      validationRegex={/^(0x)?[0-9a-f]{1,2}$/i}
      renderTag={(props) => {
        const { tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other } = props;

        return (
          <Badge
            bg={'success'}
            key={key}
            {...other}
            style={{ fontSize: '1em' }}
            title={parseInt(getTagDisplayValue(tag), 16).toString(10)}
          >
            {getTagDisplayValue(tag)}
            {!disabled && <a className={classNameRemove} style={{ color: 'white' }} onClick={() => onRemove(key)} />}
          </Badge>
        );
      }}
    ></TagsInput>
  );
};

const QueueItemTypeComponents: Record<DeviceProtocolRequestType, FunctionComponent<any>> = {
  [DeviceProtocolRequestType.ReadFeature]: ((props) => {
    const [isInit, setIsInit] = React.useState(false);
    const { content = { reportId: 0 }, setContent } = props;

    useEffect(() => {
      if (!isInit) {
        setContent(Object.assign({ reportId: 0 }, content));

        setIsInit(true);
      }
    }, [content]);

    const changedContent = { ...content };

    return (
      <>
        <Form.Group>
          <Form.Label>Feature ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.reportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.reportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
      </>
    );
  }) as FunctionComponent<{
    content: { reportId: number };
    setContent: (content: { reportId: number }) => void;
  }>,
  [DeviceProtocolRequestType.ReadInputReport]: ((props) => {
    const [isInit, setIsInit] = React.useState(false);
    const { content = { reportId: 0, waitMs: 250 }, setContent } = props;

    useEffect(() => {
      if (!isInit) {
        setContent(Object.assign({ reportId: 0, waitMs: 250 }, content));

        setIsInit(true);
      }
    }, [content]);

    const changedContent = { ...content };

    return (
      <>
        <Form.Group>
          <Form.Label>Input ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.reportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.reportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Wait in milliseconds</Form.Label>
          <Form.Control
            type="number"
            defaultValue={content.waitMs}
            required={true}
            step={50}
            onChange={(event) => {
              changedContent.waitMs = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
      </>
    );
  }) as FunctionComponent<{
    content: { reportId: number; waitMs: number };
    setContent: (content: { reportId: number; waitMs: number }) => void;
  }>,
  [DeviceProtocolRequestType.SendOutputReport]: ((props) => {
    const [isInit, setIsInit] = React.useState(false);
    const { content = { reportId: 0, data: '' }, setContent } = props;

    useEffect(() => {
      if (!isInit) {
        setContent(Object.assign({ reportId: 0, data: '' }, content));

        setIsInit(true);
      }
    }, [content]);

    const [tags, setTags] = React.useState(
      content.data
        .split(',')
        .map((d) => d.trim())
        .filter((v) => !!v),
    );

    const changedContent = { ...content };

    return (
      <>
        <Form.Group>
          <Form.Label>Output ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.reportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.reportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Data</Form.Label>
          <HexInput
            value={tags}
            onChange={(tags: string[]) => {
              setTags(tags);

              changedContent.data = tags.join(',');

              setContent(changedContent);
            }}
          />
        </Form.Group>
      </>
    );
  }) as FunctionComponent<{
    content: { reportId: number; data: string };
    setContent: (content: { reportId: number; data: string }) => void;
  }>,
  [DeviceProtocolRequestType.SendFeature]: ((props) => {
    const [isInit, setIsInit] = React.useState(false);
    const { content = { reportId: 0, data: '' }, setContent } = props;

    useEffect(() => {
      if (!isInit) {
        setContent(Object.assign({ reportId: 0, data: '' }, content));

        setIsInit(true);
      }
    }, [content]);

    const [tags, setTags] = React.useState(
      content.data
        .split(',')
        .map((d) => d.trim())
        .filter((v) => !!v),
    );

    const changedContent = { ...content };

    return (
      <>
        <Form.Group>
          <Form.Label>Feature ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.reportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.reportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Data</Form.Label>
          <HexInput
            value={tags}
            onChange={(tags: string[]) => {
              setTags(tags);

              changedContent.data = tags.join(',');

              setContent(changedContent);
            }}
          />
        </Form.Group>
      </>
    );
  }) as FunctionComponent<{
    content: { reportId: number; data: string };
    setContent: (content: { reportId: number; data: string }) => void;
  }>,
  [DeviceProtocolRequestType.SendFeatureWithInputReport]: ((props) => {
    const [isInit, setIsInit] = React.useState(false);
    const { content = { reportId: 0, data: '', readReportId: 0, waitMs: 250 }, setContent } = props;

    useEffect(() => {
      if (!isInit) {
        setContent(Object.assign({ reportId: 0, data: '', readReportId: 0, waitMs: 250 }, content));

        setIsInit(true);
      }
    }, [content]);

    const [tags, setTags] = React.useState(
      content.data
        .split(',')
        .map((d) => d.trim())
        .filter((v) => !!v),
    );

    const changedContent = { ...content };

    return (
      <>
        <Form.Group>
          <Form.Label>Feature ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.reportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.reportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Read Input ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.readReportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.readReportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Wait in milliseconds</Form.Label>
          <Form.Control
            type="number"
            defaultValue={content.waitMs}
            required={true}
            step={50}
            onChange={(event) => {
              changedContent.waitMs = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Data</Form.Label>
          <HexInput
            value={tags}
            onChange={(tags: string[]) => {
              setTags(tags);

              changedContent.data = tags.join(',');

              setContent(changedContent);
            }}
          />
        </Form.Group>
      </>
    );
  }) as FunctionComponent<{
    content: { reportId: number; readReportId: number; data: string; waitMs: number };
    setContent: (content: { reportId: number; readReportId: number; data: string; waitMs: number }) => void;
  }>,
  [DeviceProtocolRequestType.SendFeatureWithResponse]: ((props) => {
    const [isInit, setIsInit] = React.useState(false);
    const { content = { reportId: 0, readReportId: 0, data: '' }, setContent } = props;

    useEffect(() => {
      if (!isInit) {
        setContent(Object.assign({ reportId: 0, readReportId: 0, data: '' }, content));

        setIsInit(true);
      }
    }, [content]);

    const [tags, setTags] = React.useState(
      content.data
        .split(',')
        .map((d) => d.trim())
        .filter((v) => !!v),
    );

    const changedContent = { ...content };

    return (
      <>
        <Form.Group>
          <Form.Label>Feature ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.reportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.reportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Read Feature ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.readReportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.readReportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Data</Form.Label>
          <HexInput
            value={tags}
            onChange={(tags: string[]) => {
              setTags(tags);

              changedContent.data = tags.join(',');

              setContent(changedContent);
            }}
          />
        </Form.Group>
      </>
    );
  }) as FunctionComponent<{
    content: { reportId: number; readReportId: number; data: string };
    setContent: (content: { reportId: number; readReportId: number; data: string }) => void;
  }>,
  [DeviceProtocolRequestType.SendOutputReportWithResponse]: ((props) => {
    const [isInit, setIsInit] = React.useState(false);
    const { content = { reportId: 0, readReportId: 0, data: '' }, setContent } = props;

    useEffect(() => {
      if (!isInit) {
        setContent(Object.assign({ reportId: 0, readReportId: 0, data: '' }, content));

        setIsInit(true);
      }
    }, [content]);

    const [tags, setTags] = React.useState(
      content.data
        .split(',')
        .map((d) => d.trim())
        .filter((v) => !!v),
    );

    const changedContent = { ...content };

    return (
      <>
        <Form.Group>
          <Form.Label>Output Report ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.reportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.reportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Read Input ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.readReportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.readReportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Data</Form.Label>
          <HexInput
            value={tags}
            onChange={(tags: string[]) => {
              setTags(tags);

              changedContent.data = tags.join(',');

              setContent(changedContent);
            }}
          />
        </Form.Group>
      </>
    );
  }) as FunctionComponent<{
    content: { reportId: number; data: string; readReportId?: number };
    setContent: (content: { reportId: number; data: string; readReportId?: number }) => void;
  }>,
  [DeviceProtocolRequestType.SendOutputReportWithFeatureReport]: ((props) => {
    const [isInit, setIsInit] = React.useState(false);
    const { content = { reportId: 0, readReportId: 0, data: '' }, setContent } = props;

    useEffect(() => {
      if (!isInit) {
        setContent(Object.assign({ reportId: 0, readReportId: 0, data: '' }, content));

        setIsInit(true);
      }
    }, [content]);

    const [tags, setTags] = React.useState(
      content.data
        .split(',')
        .map((d) => d.trim())
        .filter((v) => !!v),
    );

    const changedContent = { ...content };

    return (
      <>
        <Form.Group>
          <Form.Label>Output Report ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.reportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.reportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Read Feature ID</Form.Label>
          <Form.Control
            type="text"
            defaultValue={content.readReportId}
            minLength={1}
            required={true}
            onChange={(event) => {
              changedContent.readReportId = parseInt(event.target.value);

              setContent(changedContent);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Data</Form.Label>
          <HexInput
            value={tags}
            onChange={(tags: string[]) => {
              setTags(tags);

              changedContent.data = tags.join(',');

              setContent(changedContent);
            }}
          />
        </Form.Group>
      </>
    );
  }) as FunctionComponent<{
    content: { reportId: number; readReportId: number; data: string };
    setContent: (content: { reportId: number; readReportId: number; data: string }) => void;
  }>,
};

export const QueueItem: FunctionComponent<QueueItemProps> = (props) => {
  const { index, type, content, setContent, setType, remove } = props;

  const C = QueueItemTypeComponents[type];

  return (
    <>
      <Card border={index % 2 ? 'secondary' : 'light'} className={'mb-2'} key={`queue-item-${index}-${type}`}>
        <Card.Header>
          <Row>
            <Col
              xs={8}
              style={{
                padding: '0.6em 1.2em 0.6em 15px',
                fontSize: '1em',
                fontWeight: 500,
              }}
            >
              Command {index + 1} - {QueueItemTypes[type]}
            </Col>
            <Col xs={4} className={'text-end'}>
              <Button onClick={remove} className={'remove-button'} variant={'outline-warning'}>
                Remove
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Queue Item Type</Form.Label>
            <Form.Select
              defaultValue={type}
              onChange={(event) => setType(event.target.value as DeviceProtocolRequestType)}
            >
              {Object.keys(QueueItemTypes).map((key) => (
                <option key={`queue-item-type-${key}`} value={key}>
                  {QueueItemTypes[key as keyof typeof QueueItemTypes]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <C reportId={content.reportId} content={content} setContent={setContent} />
        </Card.Body>
      </Card>
    </>
  );
};

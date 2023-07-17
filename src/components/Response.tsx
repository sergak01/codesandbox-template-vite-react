import { FunctionComponent } from 'react';
import { Badge, Col, Row } from 'react-bootstrap';

export interface ResponseProps {
  response: Uint8Array;
}

export const Response: FunctionComponent<ResponseProps> = (props) => {
  const { response } = props;

  const blocks: Array<Uint8Array> = [];

  for (let i = 0; i < response.length; i += 8) {
    blocks.push(response.slice(i, i + 8));
  }

  return (
    <>
      <Row>
        <Col xs={2}>Index</Col>
        <Col xs={10}>
          <Row>
            {new Array(8).fill(0).map((_, i) => (
              <Badge
                key={`index-${i}`}
                bg="secondary"
                className={'d-inline-block'}
                style={{ width: '80px', margin: 'auto' }}
              >
                {i}
              </Badge>
            ))}
          </Row>
        </Col>
      </Row>
      {blocks.map((value, index) => (
        <Row key={`row-${index}`} style={{ fontSize: '1.2em' }}>
          <Col xs={2}>
            Block {index} ({index * 8} - {index * 8 + 8})
          </Col>
          <Col xs={10}>
            <Row>
              {Array.from(value).map((byte, i) => (
                <Badge
                  key={`byte-${index}-${i}`}
                  bg="success"
                  className={'d-inline-block'}
                  style={{ width: '80px', margin: 'auto' }}
                  title={`Index: ${index * 8 + i}; Value: ${byte}`}
                >
                  0x{byte.toString(16).padStart(2, '0')}
                </Badge>
              ))}
            </Row>
          </Col>
        </Row>
      ))}
    </>
  );
};

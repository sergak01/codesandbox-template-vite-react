import './App.scss';
import { CheckRequirements } from './components/CheckRequirements.tsx';
import { DeviceDetect } from './components/DeviceDetect.tsx';
import { Col, Container, Row } from 'react-bootstrap';

function parseHexOrUndefined(hex: string | undefined): number | undefined {
  if (hex) {
    const value = parseInt(hex, 16);

    if (!isNaN(value)) {
      return value;
    }
  }

  return undefined;
}

const VENDOR_ID = parseHexOrUndefined(import.meta.env.VITE_VENDOR_ID);
const PRODUCT_ID = parseHexOrUndefined(import.meta.env.VITE_PRODUCT_ID);
const USAGE_PAGE = parseHexOrUndefined(import.meta.env.VITE_USAGE_PAGE);
const USAGE = parseHexOrUndefined(import.meta.env.VITE_USAGE);

function App() {
  return (
    <>
      <Container>
        <Row>
          <Col xs={12}>
            <h1>HID Tester</h1>
            <div className={'text-center mb-3'}>
              <div>
                <code>Ctrl + C</code> - will copy queue if nothing selected
              </div>
              <div>
                <code>Ctrl + V</code> - will paste queue if clipboard contain valid value
              </div>
            </div>
            <div className="card">
              <CheckRequirements>
                {VENDOR_ID ? (
                  <DeviceDetect
                    vendorId={VENDOR_ID}
                    productId={PRODUCT_ID}
                    usagePage={USAGE_PAGE}
                    usage={USAGE}
                  ></DeviceDetect>
                ) : (
                  <div>Missing Vendor ID</div>
                )}
              </CheckRequirements>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;

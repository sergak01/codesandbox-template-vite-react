import React, { FunctionComponent } from 'react';

export interface CheckRequirementsProps {
  children?: React.ReactNode;
}

export const CheckRequirements: FunctionComponent<CheckRequirementsProps> = (props) => {
  const hidAvailable = 'hid' in navigator;

  return (
    <>
      {hidAvailable ? (
        props.children
      ) : (
        <div>
          Sorry the WebHID API is not supported in your browser.
          <br />
          Try enabling <span>Experimental Web Platform features</span> in <code>chrome://flags</code>.
        </div>
      )}
    </>
  );
};

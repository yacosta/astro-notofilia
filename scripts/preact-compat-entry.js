import * as React from 'preact/compat';
import * as ReactDOM from 'preact/compat/client';

// The existing dc-runtime consumes the React UMD globals. Preact's compatibility
// layer implements that API at a fraction of the transfer size, allowing the
// catalog templates and component logic to remain unchanged.
window.React = React;
window.ReactDOM = ReactDOM;


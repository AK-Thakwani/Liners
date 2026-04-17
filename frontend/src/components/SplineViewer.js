import React, { useEffect, useRef } from 'react';

const SPLINE_URL = 'https://prod.spline.design/fm8qXi1VJnp6cfi1/scene.splinecode';

const SplineViewer = () => {
  const ref = useRef(null);

  useEffect(() => {
    // Load the Spline Viewer script only once
    if (!window.SplineViewerScriptLoaded) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@splinetool/viewer@1.10.37/build/spline-viewer.js';
      script.onload = () => {
        window.SplineViewerScriptLoaded = true;
      };
      document.body.appendChild(script);
    }
  }, []);

  return (
    <spline-viewer
      ref={ref}
      url={SPLINE_URL}
      style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    />
  );
};

export default SplineViewer;


//

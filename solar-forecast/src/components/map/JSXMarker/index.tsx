import React, { useState, useEffect } from "react";
import { Marker, MarkerProps } from "react-leaflet";
import ReactDOM from "react-dom/client";
import L from "leaflet";

interface Props extends MarkerProps {
  iconOptions?: L.DivIconOptions;
}

export const JSXMarker = React.forwardRef<L.Marker, Props>(
  ({ children, iconOptions, ...rest }, refInParent) => {
    const [ref, setRef] = useState<L.Marker>();

    useEffect(() => {
      if (ref && children) {
        const element = ref.getElement();
        if (element) {
          const container = document.createElement('div');
          element.appendChild(container);
          const root = ReactDOM.createRoot(container);
          root.render(children as React.ReactElement);
          
          return () => {
            root.unmount();
            element.removeChild(container);
          };
        }
      }
    }, [ref, children]);

    return (
      <Marker
        {...rest}
        ref={(r) => {
          setRef(r as L.Marker);
          if (refInParent) {
            if (typeof refInParent === "function") {
              refInParent(r);
            } else if (refInParent) {
              refInParent.current = r;
            }
          }
        }}
        icon={L.divIcon(iconOptions)}
      />
    );
  }
);

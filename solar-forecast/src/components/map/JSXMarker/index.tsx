import React, { useState } from "react";
import { Marker, MarkerProps } from "react-leaflet";
import ReactDOM from "react-dom/client";
import L from "leaflet";

interface Props extends MarkerProps {
  iconOptions?: L.DivIconOptions;
}

export const JSXMarker = React.forwardRef<L.Marker, Props>(
  ({ children, iconOptions, ...rest }, refInParent) => {
    const [ref, setRef] = useState<L.Marker>();

    const node = React.useMemo(() => {
      const element = ref?.getElement();
      return element ? ReactDOM.createRoot(element) : null;
    }, [ref]);

    return (
      // @ts-expect-error
      <>
        {React.useMemo(
          () => (
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
          ),
          []
        )}
        {ref && node && node.render(children)}
      </>
    );
  }
);

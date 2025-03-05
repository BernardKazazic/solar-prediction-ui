import React from "react";

export const GuestLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      style={{
        paddingTop: "10%",
        maxWidth: "90%",
        margin: "auto",
      }}
    >
      {children}
    </div>
  );
};

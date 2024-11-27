import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import img from "./assets/Main.webm";
const Loading = () => {
  return (
    <DotLottieReact
      src={img}
      loop
      autoplay
      style={{
        width: "120px",
        height: "120px",
      }}
    />
  );
};
export default Loading;

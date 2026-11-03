import React from "react"
import ReactDOM from "react-dom/client"

import { DefaultBalloonsDemo } from "@/components/demo/default-balloons-demo"

import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DefaultBalloonsDemo />
  </React.StrictMode>,
)

import React from "react"
import {
  Routes,
  Route,
  useParams,
  BrowserRouter
} from "react-router-dom"
import ReactDOM from "react-dom";
import { decompressUrlSafe } from '../url_compression/lzma-url.js'

function Viz() {
    const queryParameters = new URLSearchParams(window.location.search)
    const data = queryParameters.get("data");

    return (
        <p>{decompressUrlSafe(data)}</p>
    )
}

export default Viz;
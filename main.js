import { WebContainer } from "@webcontainer/api";
import { sample } from "./sample";

import "./style.css";

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

document.querySelector("body").innerHTML = `
<div class="header">
  <div>
    Paste <a href="https://webcontainers.io/api#filesystemtree" target="_blank" rel="noopener noreferrer">FileSystemTree</a> JSON object here and click
    <button id="run">Boot</button>
  </div>
  <div>
    Sample:
    <select>
    <option value=""></option>
    <option value="viteReactJs">Vite React + JavaScript</option>
    </select>
  </div>
</div>
<div class="container">
  <div class="editor">
    <textarea></textarea>
  </div>
  <div class="preview">
    <iframe src="loading.html"></iframe>
  </div>
</div>
<div id="log">`;

window.addEventListener("load", async () => {
  /** @type {HTMLIFrameElement | null} */
  const iframeEl = document.querySelector("iframe");

  /** @type {HTMLTextAreaElement | null} */
  const textareaEl = document.querySelector("textarea");

  /** @type {HTMLButtonElement | null} */
  const buttonEl = document.querySelector("button");

  /** @type {HTMLButtonElement | null} */
  const logEl = document.querySelector("#log");

  /** @type {HTMLSelectElement | null} */
  const selectEl = document.querySelector("select");

  // Call only once
  webcontainerInstance = await WebContainer.boot();

  webcontainerInstance.on("server-ready", (port, url) => {
    iframeEl.src = url;
  });

  buttonEl.addEventListener("click", async () => {
    const files = textareaEl?.value;

    try {
      await webcontainerInstance?.mount(JSON.parse(files));
    } catch (error) {
      console.error(error);
      return;
    }

    const installProcess = await webcontainerInstance.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
          const div = document.createElement("div");
          div.textContent = data;
          logEl.append(div);
        },
      })
    );

    await webcontainerInstance.spawn("npm", ["run", "dev"]);
  });

  selectEl.addEventListener("change", (event) => {
    const value = event.target.value;
    const files = sample[value];
    textareaEl.value = files ? JSON.stringify(files, null, 2) : "";
  });
});

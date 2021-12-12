import ReactDOM from 'react-dom';
import React, {useEffect, useRef, useState} from 'react';
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from './plugins/unpkgPathPlugin';
import { fetchPlugin } from './plugins/fetchPlugin';
import Editor from './components/Editor';

const App: React.FC = () => {
    const serviceRef = useRef<any>();
    const iframe = useRef<any>();
    const [input, setInput] = useState('');

    const startService = async () => {
        serviceRef.current = await esbuild.startService(
            {
                worker: true,
                wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm"
            }
        );
    }
    useEffect(() => {
        startService();
    }, []);
    const onClick = async () => {
        if(!serviceRef.current){
            return;
        }
        iframe.current.srcdoc = html;
        const result = await serviceRef.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [
                unpkgPathPlugin(),
                fetchPlugin(input)
            ],
            define: {
                "process.env.NODE_ENV":'"production"',
                global: 'window'
            }
        })
        iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*')
       // setCode(result.outputFiles[0].text);
    }
    const html = `
        <html>
        <head></head>
        <body>
            <div id="root"></div>
            <script>
                window.addEventListener('message', (event) => {
                try {
                  eval(event.data);
                } catch (err){
                  const root = document.querySelector("#root");
                  root.innerHTML = '<div style = "color: red;" ><h4>RunTimeError:</h4>'+ err +'</div>';
                  console.error(err);
                }
                }, false);
            </script>
        </body>
        </html>
    `
    return (
        <div>
            <div>
                <textarea onChange = { e =>  setInput(e.target.value)}></textarea>
            </div>
            <button onClick={onClick}>Submit</button>
            <br />
            <div>
                <Editor onChange={ (value) => setInput(value) }initialValue="const a  = 1;"/>
                <iframe  title="preview" ref={iframe} sandbox="allow-scripts" srcDoc={html}/>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.querySelector("#root"))

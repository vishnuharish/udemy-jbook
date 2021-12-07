import ReactDOM from 'react-dom';
import React, {useEffect, useRef, useState} from 'react';
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from './plugins/unpkgPathPlugin';
import { fetchPlugin } from './plugins/fetchPlugin';

const App: React.FC = () => {
    const serviceRef = useRef<any>();
    const iframe = useRef<any>();
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');
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
                  eval(event.data);
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
            <pre>{code}</pre>
            <iframe ref={iframe} sandbox="allow-scripts" srcDoc={html}/>
        </div>
    );
}

ReactDOM.render(<App />, document.querySelector("#root"))

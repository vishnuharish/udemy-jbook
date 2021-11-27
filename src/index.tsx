import ReactDOM from 'react-dom';
import React, {useEffect, useRef, useState} from 'react';
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from './plugins/unpkgPathPlugin';
const App: React.FC = () => {
    const serviceRef = useRef<any>();
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');
    const startService = async () => {
        serviceRef.current = await esbuild.startService(
            {
                worker: true,
                wasmURL: "/esbuild.wasm"
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
            plugins: [unpkgPathPlugin()],
            define: {
                "process.env.NODE_ENV":'"production"',
                global: 'window'
            }
        })
       setCode(result.outputFiles[0].text);
    }

    return (
        <div>
            <div>
                <textarea onChange = { e =>  setInput(e.target.value)}></textarea>
            </div>
            <button onClick={onClick}>Submit</button>
            <pre>{code}</pre>
        </div>
    );
}

ReactDOM.render(<App />, document.querySelector("#root"))

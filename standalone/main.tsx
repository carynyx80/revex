import React from 'react';
import {createRoot} from 'react-dom/client';
import Page from '../app/page';
import '../app/globals.css';
class Boundary extends React.Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true}}render(){if(this.state.error)return <main style={{padding:40}}><h1>REVEX needs to reload</h1><p>Your completed investigations remain saved. Reload to reopen the workstation.</p><button onClick={()=>location.reload()}>Reload workstation</button></main>;return this.props.children}}
createRoot(document.getElementById('root')!).render(<Boundary><Page/></Boundary>);

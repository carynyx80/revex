const children=new Set();
export function trackChild(child){children.add(child);child.once('exit',()=>children.delete(child));child.once('error',()=>children.delete(child));return child}
export function terminateChildren(){for(const child of children)child.kill('SIGTERM');children.clear()}

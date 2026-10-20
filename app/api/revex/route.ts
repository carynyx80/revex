import {solanaRoute} from '../../../lib/solana-route';
export const GET=()=>Response.json({analyses:[],storage:false,chain:'Solana'});
export const POST=(request:Request)=>solanaRoute(request,'simulate');

export const GET=()=>Response.json({engine:false,chain:'Solana',error:'EVM engines are retired. Solana inspection and RPC simulation use dedicated APIs.'});
export const POST=()=>Response.json({error:'EVM engine jobs are retired.'},{status:410});

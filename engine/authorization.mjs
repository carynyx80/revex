export function validateRecoveryEvidence(planJob,simJob,owner,now=Date.now()){
 if(planJob?.type!=='recovery'||planJob.status!=='succeeded'||simJob?.type!=='simulate'||simJob.status!=='succeeded')throw Error('Successful recovery plan and isolated fork simulation required');
 const plan=planJob.result,sim=simJob.result;
 if(sim.planId!==planJob.id||!sim.success||sim.broadcast!==false||sim.mode!=='isolated-fork')throw Error('Simulation does not authorize this plan');
 if(sim.codeHash!==plan.codeHash||JSON.stringify(sim.implementation)!==JSON.stringify(plan.implementation))throw Error('Simulation contract identity differs from the plan');
 if(sim.from!==plan.from||sim.to!==plan.to||sim.data!==plan.data||sim.chainId!==plan.chainId||sim.value!=='0x0')throw Error('Simulation transaction differs from the recovery plan');
 const age=now-Date.parse(sim.simulatedAt);if(!Number.isFinite(age)||age<0||age>120000)throw Error('Simulation expired; run it again');
 if(owner?.toLowerCase()!==plan.from)throw Error('Connected wallet does not own this plan');
 if(!Array.isArray(sim.tokenDeltas)||!sim.tokenDeltas.every(t=>!t.error))throw Error('All tracked balance deltas must be available');
 const asset=sim.tokenDeltas.find(t=>t.address===plan.asset);const shares=sim.tokenDeltas.find(t=>t.address===plan.to);
 if(!asset||BigInt(asset.delta)<=0n)throw Error('Fork simulation did not recover any underlying tokens');
 if(!shares||BigInt(shares.delta)>=0n)throw Error('Vault share burn was not observed');
 if(plan.operation==='withdraw'&&BigInt(asset.delta)<BigInt(plan.amount))throw Error('Fork recovered less than the requested withdrawal');
 return plan;
}

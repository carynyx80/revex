import {encodeFunctionData,type AbiFunction,type Hex} from 'viem';
// Symbolic decompilers preserve selectors in unresolved names. Hashing the
// placeholder name would call a different function, so preserve the evidence.
export function encodeReconstructedCall(fn:AbiFunction,args:readonly unknown[]):Hex {
 const encoded=encodeFunctionData({abi:[fn],functionName:fn.name,args} as any);
 const original=/^Unresolved_([0-9a-fA-F]{8})$/.exec(fn.name);
 return original?('0x'+original[1].toLowerCase()+encoded.slice(10)) as Hex:encoded;
}

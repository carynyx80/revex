import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectBytecode,validateAddress,assertChain} from '../lib/analysis.ts';
test('walks PUSH operands without treating embedded bytes as opcodes',()=>{assert.deepEqual(inspectBytecode('0x646370a082316370a0823100').selectors,[{selector:'0x70a08231',signature:'balanceOf(address)'}]);});
test('does not count delegatecall inside PUSH data',()=>{assert.equal(inspectBytecode('0x60f4').delegatecall,false);assert.equal(inspectBytecode('0xf4').delegatecall,true)});
test('rejects invalid addresses and malformed bytecode',()=>{assert.throws(()=>validateAddress('0x123'));assert.throws(()=>inspectBytecode('0xabc'));validateAddress('0x'+'12'.repeat(20))});
test('rejects an RPC chain mismatch',async()=>{const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({result:'0x1'});try{await assert.rejects(assertChain('mainnet'),/network/)}finally{globalThis.fetch=original}});
import {encodeReconstructedCall} from '../lib/abi-codec.ts';
test('decompiler placeholder names preserve the actual on-chain selector',()=>{assert.equal(encodeReconstructedCall({type:'function',name:'Unresolved_70a08231',inputs:[{name:'account',type:'address'}],outputs:[{type:'uint256'}],stateMutability:'view'},['0x1000000000000000000000000000000000000001']),'0x70a082310000000000000000000000001000000000000000000000000000000000000001');assert.equal(encodeReconstructedCall({type:'function',name:'name',inputs:[],outputs:[{type:'string'}],stateMutability:'view'},[]),'0x06fdde03')});

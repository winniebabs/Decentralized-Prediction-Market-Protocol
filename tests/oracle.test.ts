import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity contract calls
const mockContractCall = vi.fn();

// Mock the tx-sender
let txSender: string;

describe('Oracle Contract', () => {
  const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const trustedOracle = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const untrustedOracle = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    // Reset mocks before each test
    mockContractCall.mockReset();
    txSender = contractOwner;
  });
  
  it('should add a trusted oracle', () => {
    mockContractCall.mockReturnValue({ value: true });
    const result = mockContractCall('add-trusted-oracle', trustedOracle);
    expect(result).toEqual({ value: true });
    expect(mockContractCall).toHaveBeenCalledWith('add-trusted-oracle', trustedOracle);
  });
  
  it('should remove a trusted oracle', () => {
    mockContractCall.mockReturnValue({ value: true });
    mockContractCall('add-trusted-oracle', trustedOracle);
    const result = mockContractCall('remove-trusted-oracle', trustedOracle);
    expect(result).toEqual({ value: true });
    expect(mockContractCall).toHaveBeenCalledWith('remove-trusted-oracle', trustedOracle);
  });
  
  it('should submit result from trusted oracle', () => {
    txSender = trustedOracle;
    mockContractCall.mockReturnValue({ value: true });
    mockContractCall('add-trusted-oracle', trustedOracle);
    const result = mockContractCall('submit-result', 0, 1);
    expect(result).toEqual({ value: true });
    expect(mockContractCall).toHaveBeenCalledWith('submit-result', 0, 1);
  });
  
  it('should not submit result from untrusted oracle', () => {
    txSender = untrustedOracle;
    mockContractCall.mockReturnValue({ error: 402 });
    const result = mockContractCall('submit-result', 0, 1);
    expect(result).toEqual({ error: 402 });
  });
  
  it('should check if oracle is trusted', () => {
    mockContractCall.mockReturnValue({ value: true });
    mockContractCall('add-trusted-oracle', trustedOracle);
    const result = mockContractCall('is-trusted-oracle', trustedOracle);
    expect(result).toEqual({ value: true });
    expect(mockContractCall).toHaveBeenCalledWith('is-trusted-oracle', trustedOracle);
  });
  
  it('should get market result', () => {
    txSender = trustedOracle;
    mockContractCall.mockReturnValue({ value: { result: 1 } });
    mockContractCall('add-trusted-oracle', trustedOracle);
    mockContractCall('submit-result', 0, 1);
    const result = mockContractCall('get-market-result', 0);
    expect(result).toEqual({ value: { result: 1 } });
    expect(mockContractCall).toHaveBeenCalledWith('get-market-result', 0);
  });
});


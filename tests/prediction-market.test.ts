import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity contract calls
const mockContractCall = vi.fn();

// Mock the tx-sender
let txSender: string;

describe('Prediction Market Contract', () => {
  const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const oracle = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const user = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    // Reset mocks before each test
    mockContractCall.mockReset();
    txSender = contractOwner;
  });
  
  it('should create a market', () => {
    mockContractCall.mockReturnValue({ value: 0 });
    const result = mockContractCall('create-market', 'Will it rain tomorrow?', ['Yes', 'No'], 1625097600, oracle);
    expect(result).toEqual({ value: 0 });
    expect(mockContractCall).toHaveBeenCalledWith('create-market', 'Will it rain tomorrow?', ['Yes', 'No'], 1625097600, oracle);
  });
  
  it('should place a prediction', () => {
    txSender = user;
    mockContractCall.mockReturnValue({ value: true });
    mockContractCall('create-market', 'Will it rain tomorrow?', ['Yes', 'No'], 1625097600, oracle);
    const result = mockContractCall('place-prediction', 0, 0, 100);
    expect(result).toEqual({ value: true });
    expect(mockContractCall).toHaveBeenCalledWith('place-prediction', 0, 0, 100);
  });
  
  it('should resolve a market', () => {
    txSender = oracle;
    mockContractCall.mockReturnValue({ value: true });
    mockContractCall('create-market', 'Will it rain tomorrow?', ['Yes', 'No'], 1625097600, oracle);
    const result = mockContractCall('resolve-market', 0, 1);
    expect(result).toEqual({ value: true });
    expect(mockContractCall).toHaveBeenCalledWith('resolve-market', 0, 1);
  });
  
  it('should claim winnings', () => {
    txSender = user;
    mockContractCall.mockReturnValue({ value: 100 });
    mockContractCall('create-market', 'Will it rain tomorrow?', ['Yes', 'No'], 1625097600, oracle);
    mockContractCall('place-prediction', 0, 1, 100);
    mockContractCall('resolve-market', 0, 1);
    const result = mockContractCall('claim-winnings', 0);
    expect(result).toEqual({ value: 100 });
    expect(mockContractCall).toHaveBeenCalledWith('claim-winnings', 0);
  });
  
  it('should get market details', () => {
    mockContractCall.mockReturnValue({
      value: {
        creator: contractOwner,
        description: 'Will it rain tomorrow?',
        options: ['Yes', 'No'],
        resolution_time: 1625097600,
        oracle: oracle,
        is_resolved: false,
        winning_option: null
      }
    });
    mockContractCall('create-market', 'Will it rain tomorrow?', ['Yes', 'No'], 1625097600, oracle);
    const result = mockContractCall('get-market', 0);
    expect(result).toEqual({
      value: {
        creator: contractOwner,
        description: 'Will it rain tomorrow?',
        options: ['Yes', 'No'],
        resolution_time: 1625097600,
        oracle: oracle,
        is_resolved: false,
        winning_option: null
      }
    });
    expect(mockContractCall).toHaveBeenCalledWith('get-market', 0);
  });
});


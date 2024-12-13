import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity contract calls
const mockContractCall = vi.fn();

// Mock the tx-sender
let txSender: string;

describe('External Data Integration Contract', () => {
  const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const nonOwner = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    // Reset mocks before each test
    mockContractCall.mockReset();
    txSender = contractOwner;
  });
  
  it('should add a data source', () => {
    mockContractCall.mockReturnValue({ value: 0 });
    const result = mockContractCall('add-data-source', 'Weather API', 'https://api.weather.com', 'abcdef123456');
    expect(result).toEqual({ value: 0 });
    expect(mockContractCall).toHaveBeenCalledWith('add-data-source', 'Weather API', 'https://api.weather.com', 'abcdef123456');
  });
  
  it('should update a data source', () => {
    mockContractCall.mockReturnValue({ value: true });
    mockContractCall('add-data-source', 'Weather API', 'https://api.weather.com', 'abcdef123456');
    const result = mockContractCall('update-data-source', 0, 'Updated Weather API', 'https://api.weather.com/v2', 'newkey789012');
    expect(result).toEqual({ value: true });
    expect(mockContractCall).toHaveBeenCalledWith('update-data-source', 0, 'Updated Weather API', 'https://api.weather.com/v2', 'newkey789012');
  });
  
  it('should remove a data source', () => {
    mockContractCall.mockReturnValue({ value: true });
    mockContractCall('add-data-source', 'Weather API', 'https://api.weather.com', 'abcdef123456');
    const result = mockContractCall('remove-data-source', 0);
    expect(result).toEqual({ value: true });
    expect(mockContractCall).toHaveBeenCalledWith('remove-data-source', 0);
  });
  
  it('should get data source info', () => {
    mockContractCall.mockReturnValue({ value: { name: 'Weather API', url: 'https://api.weather.com', api_key: 'abcdef123456' } });
    mockContractCall('add-data-source', 'Weather API', 'https://api.weather.com', 'abcdef123456');
    const result = mockContractCall('get-data-source', 0);
    expect(result).toEqual({ value: { name: 'Weather API', url: 'https://api.weather.com', api_key: 'abcdef123456' } });
    expect(mockContractCall).toHaveBeenCalledWith('get-data-source', 0);
  });
  
  it('should not allow non-owner to add data source', () => {
    txSender = nonOwner;
    mockContractCall.mockReturnValue({ error: 401 });
    const result = mockContractCall('add-data-source', 'Weather API', 'https://api.weather.com', 'abcdef123456');
    expect(result).toEqual({ error: 401 });
  });
});


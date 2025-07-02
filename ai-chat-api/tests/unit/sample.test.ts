describe('Sample Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have environment variables set', () => {
    expect(process.env.JWT_SECRET).toBe('test-secret-key');
    expect(process.env.NODE_ENV).toBe('test');
  });
});

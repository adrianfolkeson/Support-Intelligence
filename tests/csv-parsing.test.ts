import Papa from 'papaparse';

describe('CSV Parsing', () => {
  function parseCsv(csvData: string) {
    return Papa.parse<{ customer_id: string; subject: string; message: string }>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });
  }

  it('should parse basic CSV correctly', () => {
    const csv = `customer_id,subject,message
C001,Login issue,I can't log into my account
C002,Billing question,I was charged twice`;

    const result = parseCsv(csv);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].customer_id).toBe('C001');
    expect(result.data[0].subject).toBe('Login issue');
    expect(result.data[0].message).toBe("I can't log into my account");
    expect(result.errors).toHaveLength(0);
  });

  it('should handle commas inside quoted fields', () => {
    const csv = `customer_id,subject,message
C001,Billing,"I was charged $100, but expected $50"
C002,Bug report,"Error on page /settings, /dashboard, and /upload"`;

    const result = parseCsv(csv);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].message).toBe('I was charged $100, but expected $50');
    expect(result.data[1].message).toBe('Error on page /settings, /dashboard, and /upload');
  });

  it('should handle newlines inside quoted fields', () => {
    const csv = `customer_id,subject,message
C001,Complaint,"This is line 1
This is line 2
This is line 3"`;

    const result = parseCsv(csv);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].message).toContain('line 1');
    expect(result.data[0].message).toContain('line 2');
    expect(result.data[0].message).toContain('line 3');
  });

  it('should handle quotes inside quoted fields', () => {
    const csv = `customer_id,subject,message
C001,Feedback,"The ""premium"" plan is too expensive"`;

    const result = parseCsv(csv);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].message).toBe('The "premium" plan is too expensive');
  });

  it('should skip empty lines', () => {
    const csv = `customer_id,subject,message
C001,Issue,Something broke

C002,Bug,Another issue

`;

    const result = parseCsv(csv);

    expect(result.data).toHaveLength(2);
  });

  it('should handle whitespace in headers', () => {
    const csv = ` customer_id , subject , message
C001,Test,A message`;

    const result = parseCsv(csv);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].customer_id).toBe('C001');
  });

  it('should return empty data for empty CSV', () => {
    const csv = `customer_id,subject,message`;

    const result = parseCsv(csv);

    expect(result.data).toHaveLength(0);
  });
});

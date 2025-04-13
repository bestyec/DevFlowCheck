import { parseNextOutput, parseShowOutput } from './taskMasterUtils';

describe('Task Master Utils - Output Parsing', () => {
  describe('parseNextOutput', () => {
    it('should parse valid output for next task ID and title', () => {
      const sampleOutput = `\n...\n╭──────────────────────────────────────────────────────────────────────────╮\n│ Next Task: #1.3 - Develop Robust Output Parsing Logic                    │\n╰──────────────────────────────────────────────────────────────────────────╯\n...\n`;
      const result = parseNextOutput(sampleOutput);
      expect(result.taskId).toBe('1.3');
      expect(result.taskTitle).toBe('Develop Robust Output Parsing Logic');
    });

    it('should return nulls for unparseable output', () => {
      const sampleOutput = `Some random text that doesn't match`;
      const result = parseNextOutput(sampleOutput);
      expect(result.taskId).toBeNull();
      expect(result.taskTitle).toBeNull();
    });

    // TODO: Add more test cases for edge conditions
  });

  describe('parseShowOutput', () => {
    it('should parse valid output for show task details', () => {
      const sampleOutput = `\n...\n┌───────────────┬───────────────────────────────────────────────────────────────────────────┐\n│ ID:           │ 1.3                                                                       │\n│ Title:        │ Develop Robust Output Parsing Logic                                       │\n└───────────────┴───────────────────────────────────────────────────────────────────────────┘\n...\n╭───────────────────────────────────────────────────────────────────────────────────────────────────────╮\n│ Implementation Details:                                                                               │\n│                                                                                                       │\n│ Develop functions... handle inconsistencies. │\n╰───────────────────────────────────────────────────────────────────────────────────────────────────────╯\n...\n╭───────────────────────────────────────────────────────────────────────────────────────────────────────╮\n│ Test Strategy:                                                                                        │\n│                                                                                                       │\n│ Create unit tests... good and bad formats.           │\n╰───────────────────────────────────────────────────────────────────────────────────────────────────────╯\n...\n`;
      const result = parseShowOutput(sampleOutput);
      expect(result.title).toBe('Develop Robust Output Parsing Logic');
      expect(result.details).toContain('Develop functions... handle inconsistencies.');
      expect(result.testStrategy).toContain('Create unit tests... good and bad formats.');
    });

    it('should return nulls for fields if unparseable', () => {
        const sampleOutput = `Missing important sections`;
        const result = parseShowOutput(sampleOutput);
        expect(result.title).toBeNull();
        expect(result.details).toBeNull();
        expect(result.testStrategy).toBeNull();
    });
    
    // TODO: Add more test cases for edge conditions and missing sections
  });
}); 
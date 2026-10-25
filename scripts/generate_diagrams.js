/**
 * HotelPro Master Diagram Generation Script
 * Triggers the high-resolution parallel Python rendering engine
 * to generate all 4 system diagrams:
 * 1. Entity-Relationship Diagram (14 Collections)
 * 2. System Architecture Diagram (MERN + Ponytail + Multi-Agent Engine + Task Queue)
 * 3. Multi-Agent Workflow Diagram (Agent Orchestrator + Domain Agents + Task Queue)
 * 4. Booking & Payment Lifecycle UML Sequence Diagram
 */

const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'generate_all_diagrams.py');

console.log('=== HotelPro Diagram Generation Launcher ===');
console.log(`Executing parallel Python diagram engine: ${scriptPath}\n`);

const child = spawn('python3', [scriptPath], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..')
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`Diagram generation failed with exit code ${code}`);
    process.exit(code);
  }
  console.log('\n✓ Diagram generation completed successfully.');
});

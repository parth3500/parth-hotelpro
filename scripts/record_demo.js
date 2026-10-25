const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const FRAMES_DIR = '/tmp/hotelpro_frames';
const OUTPUT_VIDEO = path.join(__dirname, '../parth-HotelPro-demo.mp4');

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

// Helper: HTTP request
function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          resolve({ raw });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          resolve({ raw });
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (fs.existsSync(FRAMES_DIR)) {
    for (const file of fs.readdirSync(FRAMES_DIR)) {
      if (file.endsWith('.png') || file.endsWith('.txt')) {
        fs.unlinkSync(path.join(FRAMES_DIR, file));
      }
    }
  }

  console.log('[Recorder] Logging in to fetch auth tokens...');
  const adminAuth = await postJson('http://localhost:5000/api/login', {
    email: 'admin@hotelpro.com',
    password: 'password123'
  });
  const staffAuth = await postJson('http://localhost:5000/api/login', {
    email: 'staff@hotelpro.com',
    password: 'password123'
  });
  const guestAuth = await postJson('http://localhost:5000/api/login', {
    email: 'guest@hotelpro.com',
    password: 'password123'
  });

  if (!adminAuth.token || !staffAuth.token || !guestAuth.token) {
    console.error('[Recorder] Failed to authenticate all demo accounts:', { adminAuth, staffAuth, guestAuth });
    process.exit(1);
  }
  console.log('[Recorder] Successfully authenticated admin, staff, and guest demo accounts.');

  const roomsRes = await getJson('http://localhost:5000/api/rooms');
  const firstRoomId = roomsRes.rooms && roomsRes.rooms[0] ? roomsRes.rooms[0]._id : '';

  console.log('[Recorder] Starting headless Chrome with remote debugging...');
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1280,720',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--user-data-dir=/tmp/chrome_profile_' + Date.now()
  ]);

  await sleep(2000);

  const versionInfo = await getJson('http://localhost:9222/json/version');
  const wsUrl = versionInfo.webSocketDebuggerUrl;
  console.log('[Recorder] Connected to Chrome CDP at:', wsUrl);

  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const callbacks = new Map();

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(resolve => ws.onopen = resolve);

  ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  // Create new target / page
  const target = await sendCmd('Target.createTarget', { url: 'about:blank' });
  const pageWsUrl = `ws://localhost:9222/devtools/page/${target.targetId}`;
  const pageWs = new WebSocket(pageWsUrl);
  await new Promise(resolve => pageWs.onopen = resolve);

  let pageIdCounter = 1;
  const pageCallbacks = new Map();
  function pageCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = pageIdCounter++;
      pageCallbacks.set(id, { resolve, reject });
      pageWs.send(JSON.stringify({ id, method, params }));
    });
  }
  pageWs.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id && pageCallbacks.has(msg.id)) {
      const { resolve, reject } = pageCallbacks.get(msg.id);
      pageCallbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await pageCmd('Page.enable');
  await pageCmd('Runtime.enable');
  await pageCmd('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false
  });

  async function captureScene(filename, url, authData = null, waitMs = 1800) {
    console.log(`[Recorder] Capturing ${filename} -> ${url}`);
    if (authData) {
      // First go to origin to set localStorage
      await pageCmd('Page.navigate', { url: 'http://localhost:5000/' });
      await sleep(300);
      await pageCmd('Runtime.evaluate', {
        expression: `
          localStorage.setItem('token', '${authData.token}');
          localStorage.setItem('user', JSON.stringify(${JSON.stringify(authData.user)}));
        `
      });
    } else {
      await pageCmd('Page.navigate', { url: 'http://localhost:5000/' });
      await sleep(200);
      await pageCmd('Runtime.evaluate', {
        expression: `
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        `
      });
    }

    await pageCmd('Page.navigate', { url });
    await sleep(waitMs);

    const screenshot = await pageCmd('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(screenshot.data, 'base64');
    fs.writeFileSync(path.join(FRAMES_DIR, filename), buffer);
  }

  // 1. Home Page
  await captureScene('scene_01_home.png', 'http://localhost:5000/');
  // 2. Room Listing
  await captureScene('scene_02_rooms.png', 'http://localhost:5000/rooms', guestAuth);
  // 3. Room Details
  await captureScene('scene_03_room_detail.png', `http://localhost:5000/rooms/${firstRoomId}`, guestAuth);
  // 4. Guest Dashboard
  await captureScene('scene_04_guest_dash.png', 'http://localhost:5000/guest/dashboard', guestAuth);
  // 5. Guest Bookings
  await captureScene('scene_05_guest_bookings.png', 'http://localhost:5000/guest/bookings', guestAuth);
  // 6. Login Page
  await captureScene('scene_06_login.png', 'http://localhost:5000/login');
  // 7. Staff Dashboard
  await captureScene('scene_07_staff_dash.png', 'http://localhost:5000/staff/dashboard', staffAuth);
  // 8. Staff Housekeeping
  await captureScene('scene_08_staff_housekeeping.png', 'http://localhost:5000/staff/housekeeping', staffAuth);
  // 9. Staff CheckIn/Out
  await captureScene('scene_09_staff_checkinout.png', 'http://localhost:5000/staff/checkinout', staffAuth);
  // 10. Admin Dashboard
  await captureScene('scene_10_admin_dash.png', 'http://localhost:5000/admin/dashboard', adminAuth);
  // 11. Admin Reports
  await captureScene('scene_11_admin_reports.png', 'http://localhost:5000/admin/reports', adminAuth);
  // 12. Admin Users
  await captureScene('scene_12_admin_users.png', 'http://localhost:5000/admin/users', adminAuth);
  // 13. Admin Rooms
  await captureScene('scene_13_admin_rooms.png', 'http://localhost:5000/admin/rooms', adminAuth);

  chrome.kill();
  console.log('[Recorder] Chrome finished and closed.');

  // Also include the 4 diagram images from diagrams/
  const diagDir = path.join(__dirname, '../diagrams');
  const diagrams = [
    { src: 'er_diagram.png', dest: 'scene_14_er_diagram.png' },
    { src: 'system_architecture.png', dest: 'scene_15_architecture.png' },
    { src: 'multi_agent_workflow.png', dest: 'scene_16_agent_workflow.png' },
    { src: 'booking_payment_sequence.png', dest: 'scene_17_sequence.png' }
  ];

  for (const d of diagrams) {
    const srcPath = path.join(diagDir, d.src);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(FRAMES_DIR, d.dest));
      console.log(`[Recorder] Copied diagram: ${d.src} -> ${d.dest}`);
    }
  }

  console.log('[Recorder] Compiling video with ffmpeg...');
  // Read all scene images in alphabetical order
  const files = fs.readdirSync(FRAMES_DIR)
    .filter(f => f.endsWith('.png'))
    .sort();

  // Create an ffmpeg concat input file where each slide is displayed for 2.5 seconds
  const concatList = path.join(FRAMES_DIR, 'input.txt');
  let concatContent = '';
  for (const f of files) {
    const fullPath = path.join(FRAMES_DIR, f);
    concatContent += `file '${fullPath}'\nduration 2.5\n`;
  }
  // Repeat last frame per ffmpeg concat requirement
  concatContent += `file '${path.join(FRAMES_DIR, files[files.length - 1])}'\n`;
  fs.writeFileSync(concatList, concatContent);

  const ffmpegCmd = [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatList,
    '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p',
    '-r', '25',
    '-c:v', 'libopenh264',
    '-pix_fmt', 'yuv420p',
    '-an', // NO AUDIO / WITHOUT VOICE
    OUTPUT_VIDEO
  ];

  console.log('[Recorder] Running ffmpeg command with libopenh264...');
  const ffmpeg = spawn('ffmpeg', ffmpegCmd);

  let ffmpegErr = '';
  ffmpeg.stderr.on('data', data => {
    ffmpegErr += data.toString();
  });

  ffmpeg.on('close', code => {
    if (code === 0) {
      console.log(`\n======================================================`);
      console.log(`[Recorder] ✅ Demo video successfully created!`);
      console.log(`Location: ${OUTPUT_VIDEO}`);
      console.log(`Filesize: ${(fs.statSync(OUTPUT_VIDEO).size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Duration: ~${files.length * 2.5} seconds`);
      console.log(`Audio: NONE (without voice)`);
      console.log(`======================================================\n`);
    } else {
      console.error('[Recorder] ffmpeg exited with code:', code);
    }
    process.exit(code);
  });
}

run().catch(err => {
  console.error('[Recorder] Fatal error:', err);
  process.exit(1);
});

const fetch = require('node-fetch');

const CMS_URL = 'http://localhost:1337';

async function testEndpoints() {
  console.log('🧪 Testing CMS Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${CMS_URL}/api/health`);
    if (healthRes.ok) {
      const health = await healthRes.json();
      console.log('✅ Health Check: OK', health.message);
    } else {
      console.log('❌ Health Check Failed');
    }

    // Test 2: Get All Projects
    console.log('\n2️⃣ Testing Get All Projects...');
    const projectsRes = await fetch(`${CMS_URL}/api/projects/public`);
    if (projectsRes.ok) {
      const data = await projectsRes.json();
      console.log(`✅ Found ${data.projects?.length || 0} projects`);

      if (data.projects && data.projects.length > 0) {
        console.log('   Projects:');
        data.projects.forEach((p) => {
          console.log(`   - ID: ${p.id} | ${p.title} (${p.status})`);
        });

        // Test 3: Get Individual Project
        const firstProject = data.projects[0];
        console.log(`\n3️⃣ Testing Get Single Project (ID: ${firstProject.id})...`);
        const singleRes = await fetch(`${CMS_URL}/api/projects/public/${firstProject.id}`);

        if (singleRes.ok) {
          const singleData = await singleRes.json();
          if (singleData.project) {
            console.log(`✅ Successfully fetched: ${singleData.project.title}`);
            console.log(`   - Status: ${singleData.project.status}`);
            console.log(
              `   - Technologies: ${singleData.project.technologies?.map((t) => t.name).join(', ')}`
            );
            console.log(
              `   - Has detailed content: ${singleData.project.detailedContent ? 'Yes' : 'No'}`
            );
            console.log(`   - Has cover image: ${singleData.project.coverImage ? 'Yes' : 'No'}`);
          } else {
            console.log('❌ Project data is empty');
          }
        } else {
          console.log(
            `❌ Failed to fetch single project: ${singleRes.status} ${singleRes.statusText}`
          );
          const error = await singleRes.text();
          console.log('   Error:', error);
        }

        // Test 4: Test non-existent project
        console.log('\n4️⃣ Testing Non-existent Project (ID: 99999)...');
        const notFoundRes = await fetch(`${CMS_URL}/api/projects/public/99999`);
        if (notFoundRes.status === 404) {
          console.log('✅ Correctly returns 404 for non-existent project');
        } else {
          console.log(`❌ Unexpected status: ${notFoundRes.status}`);
        }
      } else {
        console.log('⚠️ No projects in database. Run npm run init-db first.');
      }
    } else {
      console.log('❌ Failed to fetch projects');
    }

    // Test 5: Test Next.js API routes (if Next.js is running)
    console.log('\n5️⃣ Testing Next.js API Routes...');
    try {
      const nextRes = await fetch('http://localhost:3000/api/projects');
      if (nextRes.ok) {
        const nextData = await nextRes.json();
        console.log(`✅ Next.js API working: ${nextData.projects?.length || 0} projects`);
      } else {
        console.log('⚠️ Next.js API returned error (is Next.js running?)');
      }
    } catch (err) {
      console.log('⚠️ Cannot connect to Next.js (is it running on port 3000?)');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the CMS server is running: npm start');
  }

  console.log('\n✨ Tests complete!');
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('Installing node-fetch...');
  const { execSync } = require('child_process');
  execSync('npm install node-fetch@2', { stdio: 'inherit' });
  console.log('Please run the script again.');
  process.exit(0);
}

testEndpoints();

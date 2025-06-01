/**
 * Hexperiment Labs Neural Cortex Interface - Main JavaScript
 * Handles the interactive neural visualizations and UI functionality
 */

// Tab switching functionality for neural interface navigation
function switchTab(tabName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
      if (tabName === 'visualization' && !window.threeJSInitialized) {
        setTimeout(init3DScene, 100);
    }
}

// Enhanced Three.js scene variables
let scene, camera, renderer, composer, entities = [], connections = [], 
    particleSystem, neuralNetwork = [], isSimulationRunning = true, 
    wireframeMode = false, particlesEnabled = true, currentEnvironment = 0;

window.threeJSInitialized = false;

// Placeholder for geomaap data (replace with real data loading logic)
let geomaapData = Array.from({length: 100}, (_, i) => ({ id: i, value: Math.random() })); // Example: 100 data points

function init3DScene() {
    const container = document.getElementById('threejs-container');
    container.innerHTML = '';

    // Scene setup with enhanced background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000511);
    scene.fog = new THREE.FogExp2(0x000511, 0.002);

    // Enhanced camera setup
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    // Enhanced renderer with better quality
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    container.appendChild(renderer.domElement);

    // Advanced lighting system
    setupAdvancedLighting();

    // Create neural network visualization
    createNeuralNetwork();
    
    // Create particle systems
    createParticleSystem();
    
    // Create enhanced environment
    createAdvancedEnvironment();
    
    // Create connection lines
    createConnections();

    // Enhanced mouse controls
    setupMouseControls(container);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    window.threeJSInitialized = true;
    animate();
}

function setupAdvancedLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x1a237e, 0.4);
    scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    mainLight.position.set(50, 100, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    scene.add(mainLight);

    // Accent lights
    const accentLight1 = new THREE.PointLight(0xff6b35, 0.8, 200);
    accentLight1.position.set(-50, 30, -50);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x4fc3f7, 0.6, 150);
    accentLight2.position.set(50, 20, 50);
    scene.add(accentLight2);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x81c784, 0.5);
    rimLight.position.set(-30, 10, -30);
    scene.add(rimLight);
}

function createNeuralNetwork() {
    neuralNetwork = [];
    entities = [];

    // Create layers of neural nodes
    const layers = [
        { nodeCount: 8, radius: 40, y: 0, color: 0x00ffff },
        { nodeCount: 12, radius: 60, y: 20, color: 0xff6b35 },
        { nodeCount: 16, radius: 80, y: 40, color: 0x4fc3f7 },
        { nodeCount: 12, radius: 60, y: 60, color: 0x81c784 },
        { nodeCount: 8, radius: 40, y: 80, color: 0xe1bee7 }
    ];

    layers.forEach((layer, layerIndex) => {
        const layerNodes = [];
        for (let i = 0; i < layer.nodeCount; i++) {
            const angle = (i / layer.nodeCount) * Math.PI * 2;
            
            // Enhanced node geometry
            const geometry = new THREE.IcosahedronGeometry(1.5, 1);
            const material = new THREE.MeshPhongMaterial({ 
                color: layer.color,
                transparent: true,
                opacity: 0.8,
                emissive: new THREE.Color(layer.color).multiplyScalar(0.2),
                shininess: 100
            });
            
            const node = new THREE.Mesh(geometry, material);
            node.position.set(
                Math.cos(angle) * layer.radius,
                layer.y,
                Math.sin(angle) * layer.radius
            );
            
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Add glow effect
            const glowGeometry = new THREE.IcosahedronGeometry(2.2, 1);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: layer.color,
                transparent: true,
                opacity: 0.1,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            node.add(glow);
            
            node.userData = {
                originalPosition: node.position.clone(),
                pulseOffset: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() + 0.5) * 0.01,
                layer: layerIndex,
                nodeIndex: i
            };
            
            scene.add(node);
            entities.push(node);
            layerNodes.push(node);
        }
        neuralNetwork.push(layerNodes);
    });

    // Create floating data entities based on geomaapData length
    const illusionCount = geomaapData.length;
    for (let i = 0; i < illusionCount; i++) {
        const geometry = new THREE.TetrahedronGeometry(0.8, 0);
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
            transparent: true,
            opacity: 0.7,
            emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.1)
        });
        const entity = new THREE.Mesh(geometry, material);
        entity.position.set(
            (Math.random() - 0.5) * 200,
            Math.random() * 100 + 10,
            (Math.random() - 0.5) * 200
        );
        entity.castShadow = true;
        entity.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.5
            ),
            rotationVelocity: new THREE.Vector3(
                Math.random() * 0.02,
                Math.random() * 0.02,
                Math.random() * 0.02
            ),
            geomaap: geomaapData[i] // Attach data for future use
        };
        scene.add(entity);
        entities.push(entity);
    }

    // Assign personas to neural nodes (SIR agent modeling)
    assignPersonasToEntities(entities);
}

// Function to update illusions when geomaap data changes
function updateIllusionsFromGeomaap(newData) {
    geomaapData = newData;
    // Remove old illusions
    entities.forEach(e => { if (e.geometry && e.geometry.type === 'TetrahedronGeometry') scene.remove(e); });
    // Add new illusions
    for (let i = 0; i < geomaapData.length; i++) {
        const geometry = new THREE.TetrahedronGeometry(0.8, 0);
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
            transparent: true,
            opacity: 0.7,
            emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.1)
        });
        const entity = new THREE.Mesh(geometry, material);
        entity.position.set(
            (Math.random() - 0.5) * 200,
            Math.random() * 100 + 10,
            (Math.random() - 0.5) * 200
        );
        entity.castShadow = true;
        entity.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.5
            ),
            rotationVelocity: new THREE.Vector3(
                Math.random() * 0.02,
                Math.random() * 0.02,
                Math.random() * 0.02
            ),
            geomaap: geomaapData[i]
        };
        scene.add(entity);
        entities.push(entity);
    }
}

function createConnections() {
    connections = [];
    
    // Create connections between neural network layers
    for (let layerIndex = 0; layerIndex < neuralNetwork.length - 1; layerIndex++) {
        const currentLayer = neuralNetwork[layerIndex];
        const nextLayer = neuralNetwork[layerIndex + 1];
        
        currentLayer.forEach(sourceNode => {
            nextLayer.forEach(targetNode => {
                if (Math.random() > 0.7) { // Random connections
                    const points = [sourceNode.position, targetNode.position];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0x00ffff,
                        transparent: true,
                        opacity: 0.3
                    });
                    const line = new THREE.Line(geometry, material);
                    line.userData = {
                        sourceNode: sourceNode,
                        targetNode: targetNode,
                        pulseOffset: Math.random() * Math.PI * 2
                    };
                    scene.add(line);
                    connections.push(line);
                }
            });
        });
    }
}

function createParticleSystem() {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Position
        positions[i3] = (Math.random() - 0.5) * 400;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 400;
        
        // Color
        const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.5);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Size
        sizes[i] = Math.random() * 2 + 1;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + 0.5 * sin(time + position.x * 0.01));
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                if (distanceToCenter > 0.5) discard;
                
                float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
}

function createAdvancedEnvironment() {
    // Enhanced ground with hexagonal pattern
    const groundGeometry = new THREE.PlaneGeometry(300, 300, 32, 32);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x0a1628, 
        transparent: true, 
        opacity: 0.8,
        wireframe: false
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Hexagonal grid overlay
    const hexGrid = new THREE.GridHelper(300, 60, 0x00ffff, 0x004466);
    hexGrid.material.opacity = 0.2;
    hexGrid.material.transparent = true;
    scene.add(hexGrid);

    // Create abstract architectural elements
    for (let i = 0; i < 20; i++) {
        const height = Math.random() * 15 + 5;
        const geometry = new THREE.CylinderGeometry(
            Math.random() * 1 + 0.5,
            Math.random() * 2 + 1,
            height,
            8
        );
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(0.55, 0.4, 0.3),
            transparent: true,
            opacity: 0.7,
            emissive: new THREE.Color().setHSL(0.55, 0.2, 0.05)
        });
        const structure = new THREE.Mesh(geometry, material);
        
        structure.position.set(
            (Math.random() - 0.5) * 200,
            height / 2,
            (Math.random() - 0.5) * 200
        );
        
        structure.castShadow = true;
        structure.receiveShadow = true;
        scene.add(structure);
    }

    // Add floating rings
    for (let i = 0; i < 8; i++) {
        const ringGeometry = new THREE.TorusGeometry(10, 0.5, 8, 16);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            emissive: 0x002244
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        ring.position.set(
            (Math.random() - 0.5) * 150,
            Math.random() * 60 + 20,
            (Math.random() - 0.5) * 150
        );
        ring.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        ring.userData = {
            rotationSpeed: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            )
        };
        
        scene.add(ring);
        entities.push(ring);
    }
}

// Enhanced MoE-based Ego Drive Persona Generator
function PersonaGenerator(drives) {
    this.drives = drives || [
        { name: 'curiosity', expert: 'Explorer', weight: 0 },
        { name: 'survival', expert: 'Survivor', weight: 0 },
        { name: 'social', expert: 'Collaborator', weight: 0 },
        { name: 'achievement', expert: 'Achiever', weight: 0 },
        { name: 'order', expert: 'Organizer', weight: 0 },
        { name: 'chaos', expert: 'Disruptor', weight: 0 }
    ];
}

PersonaGenerator.prototype.generate = function() {
    // Assign random weights (sum to 1)
    let weights = [];
    let total = 0;
    for (let i = 0; i < this.drives.length; i++) {
        let w = Math.random();
        weights.push(w);
        total += w;
    }
    // Normalize
    weights = weights.map(w => w / total);
    // Assign to persona
    let persona = { egoProfile: [] };
    for (let i = 0; i < this.drives.length; i++) {
        persona.egoProfile.push({
            name: this.drives[i].name,
            expert: this.drives[i].expert,
            weight: weights[i]
        });
    }
    // Optionally, add a dominant drive
    persona.dominantDrive = persona.egoProfile.reduce((a, b) => a.weight > b.weight ? a : b);
    return persona;
};

// Attach persona to each neural node entity
function assignPersonasToEntities(entities) {
    const generator = new PersonaGenerator();
    entities.forEach(entity => {
        if (entity.userData && entity.userData.originalPosition) {
            entity.userData.persona = generator.generate();
        }
    });
}

function setupMouseControls(container) {
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    
    container.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / container.clientWidth) * 2 - 1;
        mouseY = -(event.clientY / container.clientHeight) * 2 + 1;
        
        targetX = mouseX * 0.05;
        targetY = mouseY * 0.05;
    });

    // Smooth camera movement based on mouse
    function updateCameraPosition() {
        camera.position.x += (targetX * 10 - camera.position.x) * 0.02;
        camera.position.y += (targetY * 10 + 50 - camera.position.y) * 0.02;
        requestAnimationFrame(updateCameraPosition);
    }
    updateCameraPosition();

    // Add click event to inspect persona
    container.addEventListener('click', (event) => {
        // Raycast to find intersected neural node
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / container.clientWidth) * 2 - 1,
            -((event.clientY - rect.top) / container.clientHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(entities);
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData && obj.userData.persona) {
                // Show persona info in a modal or alert
                const persona = obj.userData.persona;
                let msg = `Dominant Drive: ${persona.dominantDrive.name}\n`;
                msg += 'Ego Profile:\n';
                persona.egoProfile.forEach(d => {
                    msg += `- ${d.expert} (${d.name}): ${(d.weight * 100).toFixed(1)}%\n`;
                });
                alert(msg);
            }
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (isSimulationRunning) {
        const time = Date.now() * 0.001;

        // Animate neural network nodes
        entities.forEach((entity, index) => {
            if (entity.userData.originalPosition) {
                entity.position.y = entity.userData.originalPosition.y + Math.sin(time + index) * 2;
            } else if (entity.userData.velocity) {
                entity.position.add(entity.userData.velocity);
                if (entity.position.y > 100 || entity.position.y < 5) entity.userData.velocity.y *= -1;
            } else if (entity.userData.rotationSpeed) {
                entity.rotation.x += entity.userData.rotationSpeed.x;
                entity.rotation.y += entity.userData.rotationSpeed.y;
                entity.rotation.z += entity.userData.rotationSpeed.z;
            }
        });

        // Animate connections
        connections.forEach(connection => {
            // Animate opacity with a pulse effect
            const pulse = 0.2 + 0.15 * Math.abs(Math.sin(time + (connection.userData.pulseOffset || 0)));
            connection.material.opacity = Math.max(0.1, pulse);
        });

        // Animate particles
        if (particleSystem && particlesEnabled) {
            particleSystem.material.uniforms.time.value = time;
        }

        // Smooth camera orbit
        const radius = 120;
        camera.position.x = Math.cos(time * 0.1) * radius;
        camera.position.z = Math.sin(time * 0.1) * radius;
        camera.lookAt(0, 40, 0);
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('threejs-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Enhanced control functions
function toggleSimulation() {
    isSimulationRunning = !isSimulationRunning;
}

function resetView() {
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 40, 0);
}

function toggleWireframe() {
    wireframeMode = !wireframeMode;
    entities.forEach(entity => {
        if (entity.material && 'wireframe' in entity.material) {
            entity.material.wireframe = wireframeMode;
        }
    });
}

function toggleParticles() {
    particlesEnabled = !particlesEnabled;
    if (particleSystem) {
        particleSystem.visible = particlesEnabled;
    }
}

function changeEnvironment() {
    currentEnvironment = (currentEnvironment + 1) % 3;
    const environmentTypes = ['Hex Neural Matrix', 'Cortex Quantum Field', 'Synapse Data Streams'];
    document.getElementById('environment-type').textContent = environmentTypes[currentEnvironment];
    // Change scene colors based on environment
    const colorSchemes = [
        { bg: 0x000511, fog: 0x000511 },
        { bg: 0x1a0033, fog: 0x1a0033 },
        { bg: 0x003322, fog: 0x003322 }
    ];
    scene.background = new THREE.Color(colorSchemes[currentEnvironment].bg);
    scene.fog.color = new THREE.Color(colorSchemes[currentEnvironment].fog);
}

function validateSimulation() {
    if (confirm('Validate neural simulation and proceed to Active Mode? This will disable the detailed visualization.')) {
        alert('Advanced neural simulation validated successfully! Hexagonal patterns confirmed. Transitioning to Active Mode...');
        switchTab('dashboard');
        // Update dashboard to show active mode
        document.querySelector('.metric-value[style*="color: #00ff00"]').textContent = 'ACTIVE MODE';
        document.querySelector('.metric-value[style*="color: #00ff00"]').style.color = '#ffaa00';
        document.querySelectorAll('.metric-description')[0].textContent = 'SIR generating tailored AI assistants';
    }
}

// Enhanced dashboard metrics updates
setInterval(() => {
    const cycles = document.getElementById('simulation-cycles');
    const dataPoints = document.getElementById('data-points');
    const envFactors = document.getElementById('env-factors');
    const activeEntities = document.getElementById('active-entities');
    const interactionEvents = document.getElementById('interaction-events');
    const simTime = document.getElementById('sim-time');
    const processingPower = document.getElementById('processing-power');
    const dataThroughput = document.getElementById('data-throughput');

    if (cycles) cycles.textContent = (parseInt(cycles.textContent.replace(',', '')) + Math.floor(Math.random() * 3)).toLocaleString();
    if (dataPoints) {
        const current = parseFloat(dataPoints.textContent);
        dataPoints.textContent = (current + Math.random() * 0.1).toFixed(1) + 'M';
    }
    if (envFactors) envFactors.textContent = parseInt(envFactors.textContent) + Math.floor(Math.random() * 2);
    if (activeEntities) activeEntities.textContent = 247 + Math.floor(Math.random() * 20 - 10);
    if (interactionEvents) interactionEvents.textContent = parseInt(interactionEvents.textContent.replace(',', '')) + Math.floor(Math.random() * 50);
    if (processingPower) processingPower.textContent = (94 + Math.random() * 5).toFixed(1) + '%';
    if (dataThroughput) dataThroughput.textContent = (2.4 + Math.random() * 0.8).toFixed(1) + ' GB/s';
    
    // Update simulation timer
    if (simTime) {
        const [hours, minutes, seconds] = simTime.textContent.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
        const newHours = Math.floor(totalSeconds / 3600);
        const newMinutes = Math.floor((totalSeconds % 3600) / 60);
        const newSeconds = totalSeconds % 60;
        simTime.textContent = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
    }
}, 2000);

// Ensure all hyperlinks open in a new tab and are accessible
// This script will run after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href]').forEach(link => {
        // Only update if not already set
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
        }
        if (!link.hasAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
});

// Reminder logic: show after 2 minutes of inactivity
let reminderTimeout;
function showReminder() {
    document.getElementById('reminder-banner').style.display = 'block';
}
function resetReminderTimer() {
    document.getElementById('reminder-banner').style.display = 'none';
    clearTimeout(reminderTimeout);
    reminderTimeout = setTimeout(showReminder, 2 * 60 * 1000); // 2 minutes
}
['mousemove','keydown','mousedown','touchstart'].forEach(evt => {
    window.addEventListener(evt, resetReminderTimer, true);
});

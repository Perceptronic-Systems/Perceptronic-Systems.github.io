import * as THREE from 'three';
import gsap from 'gsap';
import cubeSolver from 'cube-solver';

const scene = new THREE.Scene();
const canvas = document.getElementById('rubix-cube-canvas');
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const backingMaterial = new THREE.MeshStandardMaterial({ color: "#16171a"});

const ambientLight = new THREE.AmbientLight({ color: "#FFFFFF", intensity: 1 });
const pointLight = new THREE.DirectionalLight({ color: "#999999", intensity: 2 });
pointLight.position.set(6, 10, -3);
pointLight.castShadow = true;
scene.add(ambientLight);
scene.add(pointLight);

const faceletWidth = 0.9;
const faceletDepth = 0.05;

const xFacelet = new THREE.BoxGeometry(faceletDepth, faceletWidth, faceletWidth);
const yFacelet = new THREE.BoxGeometry(faceletWidth, faceletDepth, faceletWidth);
const zFacelet = new THREE.BoxGeometry(faceletWidth, faceletWidth, faceletDepth);

const U_material = new THREE.MeshStandardMaterial({ color: "#d8d8d8"}); // White (Up)
const D_material = new THREE.MeshStandardMaterial({ color: "#d1c413"}); // Yellow (Down)
const L_material = new THREE.MeshStandardMaterial({ color: "#d45f1b"}); // Orange (Left)
const R_material = new THREE.MeshStandardMaterial({ color: "#a40c0c"}); // Red (Right)
const F_material = new THREE.MeshStandardMaterial({ color: "#10b91c"}); // Green (Front)
const B_material = new THREE.MeshStandardMaterial({ color: "#1a1fad"}); // Blue (Back)

// Give each material a unique name matching Kociemba notation for scanning
U_material.name = 'U';
D_material.name = 'D';
L_material.name = 'L';
R_material.name = 'R';
F_material.name = 'F';
B_material.name = 'B';

const cubeletSpacing = 1.05;

function createCubelet(x, y, z) {
    const cube = new THREE.Mesh(cubeGeometry, backingMaterial);
    cube.position.set(x * cubeletSpacing, y * cubeletSpacing, z * cubeletSpacing);
    cube.userData.tag = 'cubelet';

    let xFace, yFace, zFace;
    switch (x) {
        case -1:
            xFace = new THREE.Mesh(xFacelet, L_material);
            cube.add(xFace);
            xFace.position.set(-0.5, 0, 0);
            break;
        case 1:
            xFace = new THREE.Mesh(xFacelet, R_material);
            cube.add(xFace);
            xFace.position.set(0.5, 0, 0);
            break;
    }
    switch (y) {
        case -1:
            yFace = new THREE.Mesh(yFacelet, D_material);
            cube.add(yFace);
            yFace.position.set(0, -0.5, 0);
            break;
        case 1:
            yFace = new THREE.Mesh(yFacelet, U_material);
            cube.add(yFace);
            yFace.position.set(0, 0.5, 0);
            break;
    }
    switch (z) {
        case -1:
            zFace = new THREE.Mesh(zFacelet, B_material);
            cube.add(zFace);
            zFace.position.set(0, 0, -0.5);
            break;
        case 1:
            zFace = new THREE.Mesh(zFacelet, F_material);
            cube.add(zFace);
            zFace.position.set(0, 0, 0.5);
            break;
    }
    return cube;
}

class RubixCube {
    constructor() {
        this.main = new THREE.Group();
        this.cubes = [];
        this.turning = false;
        this.turnTimeline = new gsap.timeline();
        
        for (let x = 0; x < 3; x++) {
            this.cubes[x] = [];
            for (let y = 0; y < 3; y++) {
                this.cubes[x][y] = [];
                for (let z = 0; z < 3; z++) {
                    const cubelet = createCubelet((x - 1), (y - 1), (z - 1));
                    this.cubes[x][y][z] = cubelet;
                    this.main.attach(cubelet);
                }
            }
        }
    }

    updateMatrix() {
        const cubelets = this.main.children.filter(cubelet => cubelet.userData.tag === 'cubelet');
        cubelets.forEach(cubelet => {
            const x = Math.round(cubelet.position.x / cubeletSpacing) + 1;
            const y = Math.round(cubelet.position.y / cubeletSpacing) + 1;
            const z = Math.round(cubelet.position.z / cubeletSpacing) + 1;
            if (x >= 0 && x < 3 && y >= 0 && y < 3 && z >= 0 && z < 3) {
                this.cubes[x][y][z] = cubelet;
            }   
        });
    }

    // SCANS 3D WORLD SPACE AND BUILDS KOCIEMBA STRING DYNAMICALLY
    getCubeStateString() {
        const stateStringArray = [];
        
        // Explicit face processing order required by Kociemba notation
        const faces = ['U', 'R', 'F', 'D', 'L', 'B'];

        faces.forEach(faceName => {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    let x = 0, y = 0, z = 0;
                    let targetNormal = new THREE.Vector3();

                    // Absolute spatial mapping for the center point of each facelet sticker
                    switch(faceName) {
                        case 'U': 
                            x = c - 1;          y = 1.5;            z = r - 1;  
                            targetNormal.set(0, 1, 0);
                            break;
                        case 'D': 
                            x = c - 1;          y = -1.5;           z = 1 - r;  
                            targetNormal.set(0, -1, 0);
                            break;
                        case 'R': 
                            x = 1.5;            y = 1 - r;          z = 1 - c;  
                            targetNormal.set(1, 0, 0);
                            break;
                        case 'L': 
                            x = -1.5;           y = 1 - r;          z = c - 1;  
                            targetNormal.set(-1, 0, 0);
                            break;
                        case 'F': 
                            x = c - 1;          y = 1 - r;          z = 1.5;    
                            targetNormal.set(0, 0, 1);
                            break;
                        case 'B': 
                            x = 1 - c;          y = 1 - r;          z = -1.5;   
                            targetNormal.set(0, 0, -1);
                            break;
                    }

                    // Look for the closest cubelet to this facelet target coordinate
                    let closestCubelet = null;
                    let minDistance = Infinity;

                    this.main.children.forEach(cubelet => {
                        if (cubelet.userData.tag !== 'cubelet') return;
                        
                        // Calculate world distance to find the absolute physical neighbor
                        const dist = cubelet.position.distanceTo(
                            new THREE.Vector3(
                                x === 1.5 || x === -1.5 ? Math.sign(x) * cubeletSpacing : x * cubeletSpacing,
                                y === 1.5 || y === -1.5 ? Math.sign(y) * cubeletSpacing : y * cubeletSpacing,
                                z === 1.5 || z === -1.5 ? Math.sign(z) * cubeletSpacing : z * cubeletSpacing
                            )
                        );

                        if (dist < minDistance) {
                            minDistance = dist;
                            closestCubelet = cubelet;
                        }
                    });

                    if (closestCubelet) {
                        let foundStickerColor = faceName;
                        let bestDot = -1;

                        closestCubelet.children.forEach(sticker => {
                            if (sticker.userData.tag === 'cubelet') return; // skip center core base mesh
                            
                            // Determine the local facing direction of the sticker mesh child
                            const localNormal = new THREE.Vector3();
                            if (sticker.position.x !== 0) localNormal.set(Math.sign(sticker.position.x), 0, 0);
                            else if (sticker.position.y !== 0) localNormal.set(0, Math.sign(sticker.position.y), 0);
                            else if (sticker.position.z !== 0) localNormal.set(0, 0, Math.sign(sticker.position.z));

                            // Transform local sticker direction vector to global world space coordinates
                            const worldNormal = localNormal.clone().applyQuaternion(closestCubelet.quaternion);
                            const dot = worldNormal.dot(targetNormal);

                            // Keep track of the sticker pointing most directly along this face normal path
                            if (dot > bestDot) {
                                bestDot = dot;
                                if (dot > 0.7) {
                                    foundStickerColor = sticker.material.name;
                                }
                            }
                        });
                        stateStringArray.push(foundStickerColor);
                    } else {
                        stateStringArray.push(faceName);
                    }
                }
            }
        });

        return stateStringArray.join('');
    }

    turnSide(move, duration) {
        const match = move.match(/^([RULDFB])([2']?)$/);
        if (!match) return;

        const base = match[1];
        const modifier = match[2];

        let axis = 'x', side = 0, direction = -1;

        switch (base) {
            case 'R': axis = 'x'; side = 1;  direction = -1; break; 
            case 'L': axis = 'x'; side = -1; direction = 1;  break; 
            case 'U': axis = 'y'; side = 1;  direction = -1; break; 
            case 'D': axis = 'y'; side = -1; direction = 1;  break; 
            case 'F': axis = 'z'; side = 1;  direction = -1; break; 
            case 'B': axis = 'z'; side = -1; direction = 1;  break; 
        }

        let angleMultiplier = 1;
        if (modifier === "'") direction *= -1;
        else if (modifier === '2') angleMultiplier = 2;

        const selectionGroup = new THREE.Group();
        this.main.add(selectionGroup);

        const targetRotation = (Math.PI / 2) * direction * angleMultiplier;

        this.turnTimeline.to(selectionGroup.rotation, {
            [axis]: `+=${targetRotation}`, 
            duration: duration * angleMultiplier, 
            ease: 'power2.out',
            immediateRender: false,
            onStart: () => {
                this.turning = true;
                let selectedCubelets = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        switch (axis) {
                            case "x": selectedCubelets.push(this.cubes[side + 1][i][j]); break;
                            case "y": selectedCubelets.push(this.cubes[i][side + 1][j]); break;
                            case "z": selectedCubelets.push(this.cubes[i][j][side + 1]); break;
                        }
                    }
                }
                selectedCubelets.forEach(cubelet => selectionGroup.attach(cubelet));
            },
            onComplete: () => {
                selectionGroup.children.filter(c => c.userData.tag === 'cubelet').forEach(cubelet => {
                    this.main.attach(cubelet);
                });
                this.main.remove(selectionGroup); 
                this.updateMatrix();
                this.turning = false;
            }
        });
    }

    executeSolution(moveString, speed = 0.3) {
        const moves = moveString.split(' ');
        moves.forEach(move => this.turnSide(move, speed));
    }
}

class RubixCubeSolver {
    constructor(rubixCubeInstance) {
        this.cube = rubixCubeInstance;
    }

    solve() {
        const cubeState = this.cube.getCubeStateString();
        console.log("Current Cube State String:", cubeState);

        try {
            const solution = CubeSolver.solve(cubeState);
            console.log("Solution Found:", solution);

            if (solution && solution.trim().length > 0) {
                this.cube.executeSolution(solution, 0.3); // Changed from 0.0 so you can see it move!
            } else {
                console.log("Cube is already solved!");
            }
        } catch (error) {
            console.error("Solver engine error:", error);
        }
    }
}

// Execution Loop
const rubixCube = new RubixCube();
scene.add(rubixCube.main);

// Scramble first, then test the scanning engine solution

cubeSolver.initialize('kociemba');

const scramble = cubeSolver.scramble(); 
console.log(`Scramble: ${scramble}`); 
rubixCube.executeSolution(scramble, 0.1);
// Example output: "D2 B' R' B L' B D2 F2 R2 D2 F2 L2 B'..."

// 2. Solve the full cube from that scramble
const solution = cubeSolver.solve(scramble);
rubixCube.executeSolution(solution);
console.log(`Solution: ${solution}`); 
// Example output: "R B' R U' D' R'..."

export function animate() {
    requestAnimationFrame(animate);
    // Smooth idle spin to admire your work
    rubixCube.main.rotation.x += 0.005;
    rubixCube.main.rotation.y += 0.005;
    renderer.render(scene, camera);
}

export function resize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}
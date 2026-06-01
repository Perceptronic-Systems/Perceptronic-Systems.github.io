import * as THREE from 'three';
import gsap from 'gsap';

const scene = new THREE.Scene();
const canvas = document.getElementById('rubix-cube-canvas');
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const cubeGeometry = new THREE.BoxGeometry((1, 1, 1));
const backingMaterial = new THREE.MeshStandardMaterial({ color: "#16171a"});


const ambientLight = new THREE.AmbientLight({ color: "#FFFFFF", intensity: 1 });
const pointLight = new THREE.DirectionalLight({ color: "#999999", intensity: 2 });
pointLight.position.set(6, 10,-3);
pointLight.castShadow = true;
scene.add(ambientLight);
scene.add(pointLight);

const faceletWidth = 0.9;
const faceletDepth = 0.05;

const xFacelet = new THREE.BoxGeometry(faceletDepth, faceletWidth, faceletWidth);
const yFacelet = new THREE.BoxGeometry(faceletWidth, faceletDepth, faceletWidth);
const zFacelet = new THREE.BoxGeometry(faceletWidth, faceletWidth, faceletDepth);

const white = new THREE.MeshStandardMaterial({ color: "#d8d8d8"});
const yellow = new THREE.MeshStandardMaterial({ color: "#d1c413"});
const red = new THREE.MeshStandardMaterial({ color: "#a40c0c"});
const blue = new THREE.MeshStandardMaterial({ color: "#1a1fad"});
const green = new THREE.MeshStandardMaterial({ color: "#10b91c"});
const orange = new THREE.MeshStandardMaterial({ color: "#d45f1b"});

const cubeletSpacing = 1.05

function createCubelet(x, y, z) {
    const cube = new THREE.Mesh(cubeGeometry.clone(), backingMaterial);
    cube.position.set(x * cubeletSpacing, y * cubeletSpacing, z * cubeletSpacing);
    cube.userData.tag = 'cubelet';

    let xFace;
    let yFace;
    let zFace;
    switch (x) {
        case -1:
            xFace = new THREE.Mesh(xFacelet, orange);
            cube.add(xFace);
            xFace.position.set(-0.5, 0, 0);
            break;
        case 1:
            xFace = new THREE.Mesh(xFacelet, red);
            cube.add(xFace);
            xFace.position.set(0.5, 0, 0);
            break;
    }
    switch (y) {
        case -1:
            yFace = new THREE.Mesh(yFacelet, white);
            cube.add(yFace);
            yFace.position.set(0, -0.5, 0);
            break;
        case 1:
            yFace = new THREE.Mesh(yFacelet, yellow);
            cube.add(yFace);
            yFace.position.set(0, 0.5, 0);
            break;
    }
    switch (z) {
        case -1:
            zFace = new THREE.Mesh(zFacelet, blue);
            cube.add(zFace);
            zFace.position.set(0, 0, -0.5);
            break;
        case 1:
            zFace = new THREE.Mesh(zFacelet, green);
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
        this.solvedArray = this.cubes.map(subArray => subArray.map(innerArray => [...innerArray]));
    }

    checkSolved() {
        return this.cubes === this.solvedArray;
    }

    updateMatrix() {
        const cubelets = this.main.children.filter(cubelet => cubelet.userData.tag === 'cubelet');
        console.log('UPDATE MATRIX')
        cubelets.forEach(cubelet => {
            const x = Math.round(cubelet.position.x / cubeletSpacing) + 1;
            const y = Math.round(cubelet.position.y / cubeletSpacing) + 1;
            const z = Math.round(cubelet.position.z / cubeletSpacing) + 1;
            if (x >= 0 && x < 3 && y >= 0 && y < 3 && z >= 0 && z < 3) {
                this.cubes[x][y][z] = cubelet;
            }   
        });
    }

    randomize(turns) {
        const axes = ['x', 'y', 'z'];
        for (let i = 0; i < turns; i++) {
            const axis = axes[Math.floor(Math.random() * 3)];
            const side = Math.random() < 0.5 ? 1 : -1;
            const direction = Math.random() < 0.5 ? 1 : -1;
            this.turnSide(axis, side, direction, 0.1);
        }
    }

    turnSide(axis, side, direction, duration) {
        if (direction !== 1 && direction !== -1) return;
        if (side !== 1 && side !== -1) return;
        const selectionGroup = new THREE.Group();
        this.main.add(selectionGroup);
        this.turnTimeline.to(selectionGroup.rotation, {
            [axis]: `+=${(Math.PI / 2) * direction}`, 
            duration: duration, 
            ease: 'power2.out',
            immediateRender: false,
            onStart: () => {
                this.turning = true;
                        let selectedCubelets = [];
                        for (let i = 0; i < 3; i++) {
                            for (let j = 0; j < 3; j++) {
                                switch (axis) {
                                    case "x":
                                        selectedCubelets.push(this.cubes[side + 1][i][j]);
                                        break;
                                    case "y":
                                        selectedCubelets.push(this.cubes[i][side + 1][j]);
                                        break;
                                    case "z":
                                        selectedCubelets.push(this.cubes[i][j][side + 1]);
                                        break;
                                }
                            }
                        }
                        selectedCubelets.forEach(cubelet => {
                            selectionGroup.attach(cubelet);
                        });
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
}

const rubixCube = new RubixCube();
scene.add(rubixCube.main);
rubixCube.randomize(20);

function animate() {
    requestAnimationFrame(animate);
    rubixCube.main.rotation.x += 0.005;
    rubixCube.main.rotation.y += 0.005;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

animate();

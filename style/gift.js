import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 4, 21);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

const textureLoader = new THREE.TextureLoader();
const imageTextures = [];

function createRoundedImageTexture(image, radius = 20) {
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(image, 0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

for (let i = 1; i <= 83; i++) {
    textureLoader.load(`./img/Anh (${i}).jpg`, (imgTexture) => {
        const image = imgTexture.image;
        const roundedTexture = createRoundedImageTexture(image);
        imageTextures.push(roundedTexture);
    });
}

const spriteGroup = new THREE.Group();
scene.add(spriteGroup);

const numSprites = 300;
const checkReady = setInterval(() => {
    if (imageTextures.length >= 7) {
        clearInterval(checkReady);
        for (let i = 0; i < numSprites; i++) {
            const texture = imageTextures[Math.floor(Math.random() * imageTextures.length)];
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: false,
                blending: THREE.AdditiveBlending,
                opacity: 1
            });

            const sprite = new THREE.Sprite(material);
            const radius = Math.random() * 30 + 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            sprite.position.setFromSphericalCoords(radius, phi, theta);

            const scale = Math.random() * 1.5 + 1;
            sprite.scale.set(scale, scale, 1);

            spriteGroup.add(sprite);
        }
    }
}, 100);

function addStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = [];

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 400;
        const y = (Math.random() - 0.5) * 400;
        const z = (Math.random() - 0.5) * 400;
        starPositions.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

addStarField();

function createTextSprite(message, parameters = {}) {
    const font = parameters.font || "bold 36px Arial";
    const color = parameters.color || "#ff99ff";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;
    const textWidth = context.measureText(message).width;

    canvas.width = textWidth + 40;
    canvas.height = 80;
    context.font = font;
    context.fillStyle = color;
    context.shadowColor = "white";
    context.shadowBlur = 12;
    context.fillText(message, 20, 55);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 1
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(6, 1.6, 1);
    return sprite;
}

function createEmojiSprite(emoji, scale = 2) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    context.font = `${size * 0.8}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(emoji, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.5
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale, scale, 1);
    return sprite;
}

const messages = [
    "I Love You",
    "Anh Yêu Em",
    "Em Là Cả Thế Giới",
    "Anh Nhớ Em",
    "Mãi Bên Nhau Nhé",
    "Saraheyo"
];

messages.forEach((msg) => {
    const sprite = createTextSprite(msg, { color: "#ffccff" });
    sprite.position.set(
        Math.random() * 40 - 20,
        Math.random() * 20 - 10,
        Math.random() * -30
    );
    scene.add(sprite);
});

const emojis = ["❤️", "💓", "💘", "🌺", "🌹", "🏵️", "🍀"];
for (let i = 0; i < 20; i++) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const sprite = createEmojiSprite(emoji, Math.random() * 1.5 + 1);
    sprite.position.set(
        Math.random() * 40 - 20,
        Math.random() * 20 - 10,
        Math.random() * -30
    );
    scene.add(sprite);
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
    controls.update();
    scene.rotation.y += 0.0015;
    renderer.render(scene, camera);
});

const bgMusic = document.getElementById("bgMusic");

window.addEventListener("load", () => {
    const savedTime = localStorage.getItem("musicTime");
    const wasPlaying = localStorage.getItem("musicPlaying") === "true";

    if (savedTime) {
        bgMusic.currentTime = parseFloat(savedTime);
    }

    if (wasPlaying) {
        bgMusic.play().catch(() => {
            console.log("Autoplay bị chặn, sẽ phát khi user chạm màn hình");
        });
    }
});

// 👉 Nếu autoplay bị chặn thì phát nhạc khi user chạm/click lần đầu
function enableMusicOnTouch() {
    if (bgMusic.paused) {
        bgMusic.play().then(() => {
            console.log("Phát nhạc sau khi user chạm màn hình");
        }).catch(err => console.log("Không thể phát nhạc:", err));
    }
    // Gỡ listener sau khi đã phát một lần
    document.removeEventListener("click", enableMusicOnTouch);
    document.removeEventListener("touchstart", enableMusicOnTouch);
}

document.addEventListener("click", enableMusicOnTouch);

document.addEventListener("touchstart", enableMusicOnTouch);

/**
 * Common options
 */
let startMusic = true;   // auto start music (firefox only)
let cycleColor = false;  // cycle colors 
let commonHue = 0.740;  // initial color 
let commonColor = new THREE.Color();
commonColor.setHSL(commonHue, .8, .5);

/**
 * Device screen info helper 
 */
const deviceInfo = (function () {
    const _w = window;
    const _s = window.screen;
    const _b = document.body;
    const _d = document.documentElement;

    return {
        screenWidth() {
            return Math.max(0, _w.innerWidth || _d.clientWidth || _b.clientWidth || 0);
        },
        screenHeight() {
            return Math.max(0, _w.innerHeight || _d.clientHeight || _b.clientHeight || 0);
        },
        screenRatio() {
            return this.screenWidth() / this.screenHeight();
        },
        screenCenterX() {
            return this.screenWidth() / 2;
        },
        screenCenterY() {
            return this.screenHeight() / 2;
        },
        mouseX(e) {
            return Math.max(0, e.pageX || e.clientX || 0);
        },
        mouseY(e) {
            return Math.max(0, e.pageY || e.clientY || 0);
        },
        mouseCenterX(e) {
            return this.mouseX(e) - this.screenCenterX();
        },
        mouseCenterY(e) {
            return this.mouseY(e) - this.screenCenterY();
        },
    };
})();

/**
 * Music player helper 
 */
const musicHelper = (function () {
    let wrap = document.querySelector('.index');
    let button = wrap ? wrap.querySelector('.sound-button') : null;
    let audio = new Audio('http://ice1.somafm.com/u80s-256-mp3');
    let step = 0.01;
    let active = false;
    let sto = null;

    let fadeIn = () => {
        audio.volume += 0.01;
        if (audio.volume >= 0.2) { audio.volume = 0.2; return; }
        sto = setTimeout(fadeIn, 100);
    };

    let fadeOut = () => {
        audio.volume -= 0.02;
        if (audio.volume <= 0.01) { audio.volume = 0; audio.pause(); return; }
        sto = setTimeout(fadeOut, 100);
    };

    let play = () => {
        if (sto) clearTimeout(sto);
        active = true;
        // button.textContent = 'Stop music';
        let promise = audio.play();
        if (promise !== undefined) {
            promise.then(_ => {
                audio.play();
            }).catch(error => {
                
            });
        }
        fadeIn();
    };

    let stop = () => {
        if (sto) clearTimeout(sto);
        active = false;
        // button.textContent = 'Play music';
        fadeOut();
    };

    button.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        if (active) { stop(); }
        else { play(); }
    });

    audio.preload = 'auto';
    audio.muted = false;
    audio.volume = 0;
    return { play, stop };
})();

/**
 * Loader Helper
 */
const LoaderHelper = {
    _base: '../assets/img',
    _data: {},
    _loaded: 0,
    _cb: null,

    // get loaded resource by name  
    get(name) {
        return this._data[name] || null;
    },

    // complete handler 
    onReady(cb) {
        this._cb = cb;
    },

    // common error handler 
    onError(err) {
        console.error(err.message || err);
    },

    // when a resource is loaded 
    onData(name, data) {
        this._loaded += 1;
        this._data[name] = data;
        let total = Object.keys(this._data).length;
        let loaded = (total && this._loaded === total);
        let hascb = (typeof this._cb === 'function');
        if (loaded && hascb) this._cb(total);
    },

    // custom .obj file 
    loadGeometry(name, file) {
        if (!name || !file) return;
        this._data[name] = new THREE.Object3D();
        const path = this._base + '/' + file;
        const loader = new THREE.OBJLoader();
        loader.load(path, data => { this.onData(name, data) }, null, this.onError);
    },

    // load image file 
    loadTexture(name, file) {
        if (!name || !file) return;
        this._data[name] = new THREE.Texture();
        const path = this._base + '/' + file;
        const loader = new THREE.TextureLoader();
        loader.load(path, data => { this.onData(name, data) }, null, this.onError);
    },
};


/**
 * Helper for adding easing effect 
 */
const addEase = (pos, to, ease) => {
    pos.x += (to.x - pos.x) / ease;
    pos.y += (to.y - pos.y) / ease;
    pos.z += (to.z - pos.z) / ease;
};

/**
 * Mountains object
 */
const mountains = {
    group: null,
    simplex: null,
    geometry: null,
    factor: 1000, // smoothness 
    scale: 500, // terrain size
    speed: 0.0000, // move speed 
    cycle: 0,
    ease: 18,
    move: { x: 0, y: 0, z: -3500 },
    look: { x: 0, y: 0, z: 0 },

    create(scene) {
        this.group = new THREE.Object3D();
        this.group.position.set(this.move.x, this.move.y, this.move.z);
        this.group.rotation.set(this.look.x, this.look.y, this.look.z);

        this.simplex = new SimplexNoise();
        this.geometry = new THREE.PlaneGeometry(10000, 1000, 128, 32);

        let texture = LoaderHelper.get('mountainTexture');
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;

        let material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            opacity: 1,
            map: texture,
            blending: THREE.NoBlending,
            side: THREE.BackSide,
            transparent: false,
            depthTest: false,
        });

        let terrain = new THREE.Mesh(this.geometry, material);
        terrain.position.set(0, -500, -3000);
        terrain.rotation.x = (Math.PI / 2) + 1.35;

        let light = new THREE.PointLight(0xffffff, 12, 5500);
        light.position.set(0, 1200, -3500);
        light.castShadow = false;
        light.color = commonColor;

        this.movePlain();
        this.group.add(terrain);
        this.group.add(light);
        scene.add(this.group);
    },

    // make new mointain plain 
    movePlain() {
        for (let vertex of this.geometry.vertices) {
            let xoff = (vertex.x / this.factor);
            let yoff = (vertex.y / this.factor) + this.cycle;
            let rand = this.simplex.noise2D(xoff, yoff) * this.scale;
            vertex.z = rand;
        }
        this.geometry.verticesNeedUpdate = true;
        this.cycle -= this.speed;
    },

    // update 
    update(mouse) {
        this.move.x = -(mouse.x * 0.02);
        this.movePlain();
        addEase(this.group.position, this.move, this.ease);
        addEase(this.group.rotation, this.look, this.ease);
    },
};


/**
 * Ground object
 */
const groundPlain = {
    group: null,
    geometry: null,
    material: null,
    plane: null,
    simplex: null,
    factor: 300, // smoothness 
    scale: 30, // terrain size
    speed: - 0.015, // move speed 
    cycle: 0,
    ease: 12,
    move: { x: 0, y: -300, z: -1000 },
    look: { x: 29.8, y: 0, z: 0 },

    // create
    create(scene) {
        this.group = new THREE.Object3D();
        this.group.position.set(this.move.x, this.move.y, this.move.z);
        this.group.rotation.set(this.look.x, this.look.y, this.look.z);

        this.geometry = new THREE.PlaneGeometry(4000, 2000, 128, 64);
        this.material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            opacity: 1,
            blending: THREE.NoBlending,
            side: THREE.FrontSide,
            transparent: false,
            depthTest: false,
            wireframe: true,
        });

        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.plane.position.set(0, 0, 0);

        this.simplex = new SimplexNoise();
        this.moveNoise();

        this.group.add(this.plane);
        scene.add(this.group);
    },

    // change noise values over time 
    moveNoise() {
        for (let vertex of this.geometry.vertices) {
            let xoff = (vertex.x / this.factor);
            let yoff = (vertex.y / this.factor) + this.cycle;
            let rand = this.simplex.noise2D(xoff, yoff) * this.scale;
            vertex.z = rand;
        }
        this.geometry.verticesNeedUpdate = true;
        this.cycle += this.speed;
    },

    // update
    update(mouse) {
        this.moveNoise();
        this.move.x = -(mouse.x * 0.04);
        addEase(this.group.position, this.move, this.ease);
        addEase(this.group.rotation, this.look, this.ease);
    },
};

/**
 * Setup scene 
 */
const setupScene = () => {
    const scene = new THREE.Scene();

    // track mouse movement 
    let mouse = {
        x: deviceInfo.screenCenterX(),
        y: deviceInfo.screenCenterY(),
    };

    // setup renderer 
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, precision: 'mediump' });
    renderer.setSize(deviceInfo.screenWidth(), deviceInfo.screenHeight());
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff, 0);
    renderer.sortObjects = true;
    renderer.domElement.setAttribute('id', 'stageElement');
    document.getElementsByClassName("synthwave")[0].appendChild(renderer.domElement);

    // setup camera 
    const camera = new THREE.PerspectiveCamera(60, deviceInfo.screenRatio(), 0.1, 20000);
    camera.position.set(0, 0, 300);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(scene.position);

    // setup light source 
    const light = new THREE.PointLight(0xffffff, 4, 1000);
    light.position.set(0, 200, -500);
    light.castShadow = false;
    light.target = scene;
    light.color = commonColor;
    scene.add(light);

    // setup objects 
    mountains.create(scene);
    groundPlain.create(scene);

    // on page resize
    window.addEventListener('resize', e => {
        camera.aspect = deviceInfo.screenRatio();
        camera.updateProjectionMatrix();
        renderer.setSize(deviceInfo.screenWidth(), deviceInfo.screenHeight());
    });

    // on mouse move 
    window.addEventListener('mousemove', e => {
        mouse.x = deviceInfo.mouseCenterX(e);
        mouse.y = deviceInfo.mouseCenterY(e);
    });

    // autostart music
    musicHelper.play();
    
    // const isff = ( typeof InstallTrigger !== 'undefined' );
    // if ( startMusic && isff ) musicHelper.play();

    // animation loop 
    const loop = () => {
        requestAnimationFrame(loop);

        // update light hue 
        if (cycleColor) {
            commonHue += 0.001;
            if (commonHue >= 1) commonHue = 0;
            commonColor.setHSL(commonHue, .8, .5);
        }
        // update objects 
        mountains.update(mouse);
        groundPlain.update(mouse);

        // render scene 
        renderer.render(scene, camera);
    };

    loop();
};

// init 
LoaderHelper.onReady(setupScene);
LoaderHelper.loadTexture('engineTexture', 'gfx/water.jpg');
LoaderHelper.loadTexture('mountainTexture', 'gfx/terrain2.jpg'); 
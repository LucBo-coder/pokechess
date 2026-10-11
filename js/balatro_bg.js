// ==========================================================
// BALATRO HYPNOTIC BACKGROUND SHADER & CANVAS ENGINE
// Mesmerizing undulating psychedelic wave swirls with CRT vibes
// ==========================================================

'use strict';

class BalatroBackground {
  constructor(canvasId = 'balatroCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.className = 'balatro-canvas';
      document.body.insertBefore(this.canvas, document.body.firstChild);
    }

    this.gl = null;
    this.program = null;
    this.animationFrameId = null;
    this.startTime = performance.now();
    this.lastFrameTime = 0;
    this.fpsLimit = 60;

    // Palettes (RGB normalized 0.0 - 1.0)
    this.palettes = {
      balatro_classic: {
        color1: [0.08, 0.09, 0.22], // Deep Royal Indigo / Midnight Blue
        color2: [0.44, 0.12, 0.24], // Balatro Berry Crimson
        accent: [0.95, 0.65, 0.25]  // Gold Ember
      },
      pokemon_stadium: {
        color1: [0.05, 0.12, 0.28], // Electric Water Blue
        color2: [0.38, 0.10, 0.15], // Pokéball Crimson
        accent: [0.98, 0.82, 0.22]  // Pikachu Electric Yellow
      },
      viridian_forest: {
        color1: [0.04, 0.18, 0.13], // Lush Forest Jade
        color2: [0.26, 0.08, 0.28], // Bug Poison Violet
        accent: [0.42, 0.88, 0.52]  // Leaf Green
      },
      lavender_ghost: {
        color1: [0.12, 0.08, 0.26], // Ghostly Purple
        color2: [0.28, 0.06, 0.18], // Shadow Ball Crimson
        accent: [0.72, 0.45, 0.95]  // Psychic Violet
      },
      volcano_fire: {
        color1: [0.24, 0.06, 0.08], // Magma Dark Red
        color2: [0.48, 0.16, 0.06], // Fiery Orange
        accent: [1.00, 0.55, 0.15]  // Molten Gold
      }
    };

    this.currentTheme = 'pokemon_stadium';
    this.targetColors = {
      c1: [...this.palettes.pokemon_stadium.color1],
      c2: [...this.palettes.pokemon_stadium.color2],
      acc: [...this.palettes.pokemon_stadium.accent]
    };
    this.activeColors = {
      c1: [...this.targetColors.c1],
      c2: [...this.targetColors.c2],
      acc: [...this.targetColors.acc]
    };

    this.init();
  }

  init() {
    this.initWebGL();
    if (!this.gl) {
      console.warn('⚠️ WebGL unavailable, falling back to 2D Canvas Balatro wave effect.');
      this.initCanvas2D();
    } else {
      this.startLoop();
    }

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  initWebGL() {
    try {
      this.gl = this.canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance'
      }) || this.canvas.getContext('experimental-webgl');
    } catch (e) {
      this.gl = null;
    }

    if (!this.gl) return;

    const gl = this.gl;

    const vsSource = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // Authentic Balatro Hypnotic Vortex Shader
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_accent;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Vortex polar coords
        float dist = length(uv);
        float angle = atan(uv.y, uv.x);
        
        // Balatro trigonometric wave distortion (3 harmonics)
        float t = u_time * 0.40;
        vec2 p = uv * 3.2;
        
        for (int i = 1; i <= 3; i++) {
          float fi = float(i);
          p.x += sin(p.y * 1.5 * fi + t * 0.8) / (1.5 * fi);
          p.y += cos(p.x * 1.5 * fi + t * 0.8) / (1.5 * fi);
        }
        
        // Hypnotic swirling wave
        float wave = sin(p.x * 2.2 + p.y * 2.2 + t * 1.4);
        float factor = smoothstep(-0.65, 0.65, wave);
        
        // Base color blend
        vec3 col = mix(u_color1, u_color2, factor);
        
        // Concentric vortex ripple highlights
        float ripple = sin(dist * 7.5 - t * 1.8 + angle * 2.0);
        float rippleFactor = smoothstep(0.4, 0.9, ripple);
        col = mix(col, u_accent, rippleFactor * 0.28);
        
        // Balatro edge vignette
        float vignette = smoothstep(1.35, 0.35, dist);
        col *= vignette;
        
        // CRT subtle scanlines
        float scanline = sin(gl_FragCoord.y * 1.6) * 0.035;
        col -= scanline;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) {
      this.gl = null;
      return;
    }

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('WebGL Program link error:', gl.getProgramInfoLog(this.program));
      this.gl = null;
      return;
    }

    gl.useProgram(this.program);

    // Quad geometry (fills screen)
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(this.program, 'a_pos');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    this.uResLoc = gl.getUniformLocation(this.program, 'u_resolution');
    this.uTimeLoc = gl.getUniformLocation(this.program, 'u_time');
    this.uC1Loc = gl.getUniformLocation(this.program, 'u_color1');
    this.uC2Loc = gl.getUniformLocation(this.program, 'u_color2');
    this.uAccLoc = gl.getUniformLocation(this.program, 'u_accent');
  }

  compileShader(type, src) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    // Lower resolution for that authentic retro pixelated CRT look and high performance
    const renderScale = 0.65;
    const w = Math.max(320, Math.floor(window.innerWidth * renderScale * dpr));
    const h = Math.max(180, Math.floor(window.innerHeight * renderScale * dpr));

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    if (this.gl) {
      this.gl.viewport(0, 0, w, h);
    }
  }

  setTheme(themeName) {
    if (this.palettes[themeName]) {
      this.currentTheme = themeName;
      const p = this.palettes[themeName];
      this.targetColors.c1 = [...p.color1];
      this.targetColors.c2 = [...p.color2];
      this.targetColors.acc = [...p.accent];
    }
  }

  setStageTheme(stageNumber) {
    if (stageNumber <= 3) {
      this.setTheme('viridian_forest');
    } else if (stageNumber <= 7) {
      this.setTheme('pokemon_stadium');
    } else if (stageNumber <= 11) {
      this.setTheme('lavender_ghost');
    } else {
      this.setTheme('volcano_fire');
    }
  }

  updateColors(dt) {
    // Smooth color interpolation
    const lerpRate = Math.min(1.0, dt * 2.5);
    for (let i = 0; i < 3; i++) {
      this.activeColors.c1[i] += (this.targetColors.c1[i] - this.activeColors.c1[i]) * lerpRate;
      this.activeColors.c2[i] += (this.targetColors.c2[i] - this.activeColors.c2[i]) * lerpRate;
      this.activeColors.acc[i] += (this.targetColors.acc[i] - this.activeColors.acc[i]) * lerpRate;
    }
  }

  startLoop() {
    const render = (time) => {
      this.animationFrameId = requestAnimationFrame(render);

      const dt = (time - this.lastFrameTime) / 1000;
      if (dt < 1 / this.fpsLimit) return;
      this.lastFrameTime = time;

      this.updateColors(dt);

      const gl = this.gl;
      if (!gl) return;

      const elapsed = (time - this.startTime) / 1000;

      gl.useProgram(this.program);
      gl.uniform2f(this.uResLoc, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uTimeLoc, elapsed);
      gl.uniform3fv(this.uC1Loc, this.activeColors.c1);
      gl.uniform3fv(this.uC2Loc, this.activeColors.c2);
      gl.uniform3fv(this.uAccLoc, this.activeColors.acc);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  // 2D Canvas Fallback (if WebGL is unavailable)
  initCanvas2D() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    const render2D = () => {
      this.animationFrameId = requestAnimationFrame(render2D);
      angle += 0.015;

      const w = this.canvas.width;
      const h = this.canvas.height;
      const grad = ctx.createRadialGradient(
        w / 2 + Math.cos(angle) * 80,
        h / 2 + Math.sin(angle) * 60,
        20,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.7
      );
      grad.addColorStop(0, '#6c1f38');
      grad.addColorStop(0.5, '#1e1642');
      grad.addColorStop(1, '#0b0c16');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    this.animationFrameId = requestAnimationFrame(render2D);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Auto-instantiate when DOM is ready
if (typeof window !== 'undefined') {
  window.BalatroBackground = BalatroBackground;
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.balatroBgInstance) {
      window.balatroBgInstance = new BalatroBackground();
    }
  });
}

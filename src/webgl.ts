export function createCanvas(style?: {
    width?: string,
    height?: string,
}) {
    style = style || {}

    const canvas = document.createElement('canvas');
    canvas.style.width = style.width || '100vw';
    canvas.style.height = style.height || '100vh';
    return canvas;
}

export const vertex = `#version 300 es
in vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

export const fragment = `#version 300 es
precision mediump float;

uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iDate;
uniform vec4 iMouse;
uniform float iFrameRate;
uniform int iFrame;
uniform float iChannelTime[4];
uniform float iTimeDelta;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

uniform vec3 iChannelResolution[4];

out vec4 outputColor;

{USER_FRAGMENT}

void main() {
  mainImage(outputColor, gl_FragCoord.xy);
}
`;

type WEBGL_CONTEXT = WebGLRenderingContext | WebGL2RenderingContext
enum ShaderType {
    VERTEX_SHADER = WebGLRenderingContext.VERTEX_SHADER,
    FRAGMENT_SHADER = WebGLRenderingContext.FRAGMENT_SHADER
}

export function compileShader(
    gl: WEBGL_CONTEXT,
    shaderSource: string,
    shaderType: ShaderType,
): WebGLShader {
    const shader = gl.createShader(shaderType)!;

    gl.shaderSource(shader, shaderSource);

    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!success) {
        throw new Error('着色器未编译成功: ' + gl.getShaderInfoLog(shader))
    }

    return shader;
}

export function createProgram(gl: WEBGL_CONTEXT, vertex: string, fragment: string): WebGLProgram {
    const vertexShader = compileShader(gl, vertex, ShaderType.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragment, ShaderType.FRAGMENT_SHADER);

    const program = gl.createProgram()!;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw new Error('链接失败: ' + gl.getProgramInfoLog(program))
    }

    return program;
}

export function getAttribLocation(gl: WEBGL_CONTEXT, program: WebGLProgram, name: string) {
    const loc = gl.getAttribLocation(program, name);

    let buffer: WebGLBuffer, size: number, type: number, normalize = false;
    return {
        setFloat32(arr: Float32Array) {
            if (!buffer) {
                size = 2;
                type = gl.FLOAT;
                normalize = false;
                buffer = gl.createBuffer()!;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
            }
        },
        bindBuffer() {
            if (buffer) {
                gl.enableVertexAttribArray(loc);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.vertexAttribPointer(loc, size, type, normalize, 0, 0);
            }
        }
    }
}

export function getUniformLocation(gl: WEBGL_CONTEXT, program: WebGLProgram, name: string) {
    const loc = gl.getUniformLocation(program, name);

    return {
        
    }
}
type WEBGL_CONTEXT = WebGLRenderingContext | WebGL2RenderingContext
enum ShaderType {
    VERTEX_SHADER = WebGLRenderingContext.VERTEX_SHADER,
    FRAGMENT_SHADER = WebGLRenderingContext.FRAGMENT_SHADER
}
type AttribLocation = {
    setFloat32(arr: Float32Array): void;
    bindBuffer(): void;
}
type UniformLocation = {
    uniform2f(x: number, y: number): void;
    uniform3f(x: number, y: number, z: number): void;
    uniform4fv(v: Float32List): void;
    uniform2fv(v: Float32List): void;
    uniform1f(x: number): void;
    uniform1i(x: number): void;
    uniformFloatArray(v: Float32Array): void;
    uniformB(v: boolean): void;
}

export type RenderParams = {
    time: number;
    frame: number;
}

export default class WebGLCanvas {

    protected _canvas: HTMLCanvasElement;
    protected _gl: WEBGL_CONTEXT;
    protected _program?: WebGLProgram;

    constructor(canvas?: HTMLCanvasElement, style?: {
        width?: string, height?: string
    }) {
        this._canvas = canvas ? canvas : document.createElement('canvas');

        style = style || {}
        this._canvas.style.width = style.width || '100vw';
        this._canvas.style.height = style.height || '100vh';
        this._gl = this._canvas.getContext('webgl2')!;
        if (!this._gl) {
            throw new Error('GL 初始化失败')
        }
    }

    public get canvas() {
        return this._canvas;
    }

    private check(): asserts this is (this & { _program: WebGLProgram }) {
        if ((!this._canvas) || (!this._gl) || (!this._program)) {
            throw new Error('未初始化完成')
        }
    }

    public createProgram(vertex: string, fragment: string) {
        const vertexShader = this.compileShader(vertex, ShaderType.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragment, ShaderType.FRAGMENT_SHADER);

        this._program = this._gl.createProgram()!;
        this._gl.attachShader(this._program, vertexShader);
        this._gl.attachShader(this._program, fragmentShader);
        this._gl.linkProgram(this._program);

        const success = this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS);
        if (!success) {
            throw new Error('链接失败：' + this._gl.getProgramInfoLog(this._program));
        }
    }

    public compileShader(shaderSource: string, shaderType: ShaderType) {
        const shader = this._gl.createShader(shaderType)!;
        this._gl.shaderSource(shader, shaderSource);
        this._gl.compileShader(shader);

        const success = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS);
        if (!success) {
            throw new Error('着色器未编译成功：' + this._gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    public getAttribLocation(name: string): AttribLocation {
        this.check()
        const gl = this._gl;
        const loc = gl.getAttribLocation(this._program, name);
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

    public getUniformLocation(name: string): UniformLocation {
        this.check();
        const gl = this._gl;
        const loc = gl.getUniformLocation(this._program, name);

        return {
            uniform2f(x: number, y: number) {
                gl.uniform2f(loc, x, y);
            },
            uniform3f(x: number, y: number, z: number) {
                gl.uniform3f(loc, x, y, z);
            },
            uniform4fv(v: Float32List) {
                gl.uniform4fv(loc, v);
            },
            uniform2fv(v: Float32List) {
                gl.uniform2fv(loc, v);
            },
            uniform1f(x: number) {
                gl.uniform1f(loc, x);
            },
            uniform1i(x: number) {
                gl.uniform1i(loc, x);
            },
            uniformFloatArray(v: Float32Array) {
                gl.uniform1fv(loc, v);
            },
            uniformB(v: boolean) {
                gl.uniform1i(loc, v ? 1 : 0);
            },
        }
    }

    protected _aPos?: AttribLocation;
    protected _iRes?: UniformLocation;
    protected _iTim?: UniformLocation;
    protected _iFra?: UniformLocation;

    public init(): asserts this is (this & {
        _aPos: AttribLocation,
        _iRes: UniformLocation,
        _iTim: UniformLocation,
        _iFra: UniformLocation,
    }) {
        if (!this._aPos) {
            this._aPos = this.getAttribLocation('a_position')
            this._aPos.setFloat32(new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]))
        }
        if (!this._iRes) {
            this._iRes = this.getUniformLocation('iResolution');
        }
        if (!this._iTim) {
            this._iTim = this.getUniformLocation('iTime');
        }
        if (!this._iFra) {
            this._iFra = this.getUniformLocation('iFrame');
        }
    }

    public resizeCanvasToDisplaySize(pixelRatio: boolean = true) {
        const realToCSSPixels = pixelRatio ? window.devicePixelRatio : 1;

        const displayWidth = Math.floor(this._canvas.clientWidth * realToCSSPixels);
        const displayHeight = Math.floor(this._canvas.clientHeight * realToCSSPixels);

        if (this._canvas.width != displayWidth || this._canvas.height != displayHeight) {
            this._canvas.width = displayWidth;
            this._canvas.height = displayHeight;
            return true;
        }
        return false;
    }

    public update(params: RenderParams) {
        this.init();
        this._aPos.bindBuffer();
        this._iRes.uniform3f(this.canvas.width, this.canvas.height, 1);
        this._iTim.uniform1f(params.time);
        this._iFra.uniform1i(params.frame);
    }

    public render(params: RenderParams) {
        this.check();
        this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        this._gl.useProgram(this._program);
        this.update(params);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
    }

}
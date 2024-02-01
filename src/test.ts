export default `vec3 hsv2rgb2(vec3 c, float k) {
    vec4 K = vec4(3. / 3., 2. / 3., 1. / 3., 3.);
    vec3 p = smoothstep(0. + k, 1. - k,
        .5 + .5 * cos((c.xxx + K.xyz) * radians(360.)));
    return c.z * mix(K.xxx, p, c.y);
}

vec3 tonemap(vec3 v)
{
    return mix(v, vec3(1.), smoothstep(1., 4., dot(v, vec3(1.))));
}

float f1(float x, float offset, float freq)
{
    return .4 * sin(radians(30.) * x + offset) + .1 * sin(freq * x);
}

#define DEFAULT_COUNT 12

uniform int count;
uniform float itemPos[12];

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float scale = iResolution.y;
    vec2 uv = (2. * fragCoord - iResolution.xy) / scale;

    vec3 col = vec3(0);

    float offsets[DEFAULT_COUNT] = float[DEFAULT_COUNT](
        0. * radians(360.) / 12.,
        1. * radians(360.) / 12.,
        2. * radians(360.) / 12.,
        3. * radians(360.) / 12.,
        4. * radians(360.) / 12.,
        5. * radians(360.) / 12.,
        6. * radians(360.) / 12.,
        7. * radians(360.) / 12.,
        8. * radians(360.) / 12.,
        9. * radians(360.) / 12.,
        10. * radians(360.) / 12.,
        11. * radians(360.) / 12.
    );
    
    float freqs[DEFAULT_COUNT] = float[DEFAULT_COUNT](
        radians(160.),
        radians(213.),
        radians(186.),
        radians(160.),
        radians(213.),
        radians(186.),
        radians(160.),
        radians(213.),
        radians(186.),
        radians(160.),
        radians(213.),
        radians(186.)
    );

    float colorfreqs[DEFAULT_COUNT] = float[DEFAULT_COUNT](
        .317,
        .210,
        .401,
        .317,
        .210,
        .401,
        .317,
        .210,
        .401,
        .317,
        .210,
        .401
    );

    for (int i = 0; i < count; ++i) {
        float x = uv.x + 4. * iTime;
        float y = f1(x, offsets[i], freqs[i]);
        y = clamp(y, itemPos[i] - 1., itemPos[i] + 1.);
        float uv_x = min(uv.x, 1. + .4 * sin(radians(210.) * iTime + radians(360.) * float(i) / 3.));
        
        float r = uv.x / 40.;
        //float r = exp(uv.x + 1.) / 100. - .05;
        float d1 = length(vec2(uv_x, y) - uv) - r;

        col += 1. / pow(max(1., d1 * scale), .8 + .1 * sin(radians(245.) * iTime + radians(360.) * float(i) / 3.))
            * (vec3(1.) + hsv2rgb2(vec3(colorfreqs[i] * x, 1., 1.), .07));
    }

    fragColor = vec4(tonemap(col), 1.);
    // fragColor = vec4(col, 1.);
}`
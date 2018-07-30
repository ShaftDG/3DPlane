precision highp float;

#define pi 3.1415926536
#define N 12

varying vec2 vUv;
uniform float time;
uniform float speed;
uniform vec2 uvScale;
uniform float brightness;
uniform vec3 color;
uniform float popSize;
uniform float baseSize;
uniform float radius;

void main(void) {
    vec2 position = ( vUv.xy - 0.5 ) * uvScale;
    vec2 center = position;
    
    float c = 0.;
    float o;
    for (int i = 0; i < N; i++)  {
        vec2 xy;
        o = float(i) / float(N) * 2.0 * pi;
        xy.x = radius * cos(o);
        xy.y = radius * sin(o);
        xy += center;
        c += brightness * pow(200000.0, (baseSize - length(xy) * 1.9) * (0.99 + popSize * fract(float(-i) / float(N) - time * speed))) / 20000.0;
    }
    gl_FragColor = vec4(
        clamp( c * color, vec3( 0.0 ), vec3( 1.0 ) ),
        1.0
    );
}